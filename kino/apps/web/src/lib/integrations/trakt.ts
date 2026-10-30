import "server-only";

import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { z } from "zod";

import { connectMongoose } from "@/lib/db/mongoose";
import { User } from "@/lib/db/models/user";

const TRAKT_API_BASE_URL = "https://api.trakt.tv";
const TRAKT_AUTH_BASE_URL = "https://auth.trakt.tv";
const TRAKT_API_VERSION = "2";
const TOKEN_REFRESH_SKEW_MS = 60_000;

const traktTokenResponseSchema = z.object({
  access_token: z.string().min(1),
  refresh_token: z.string().min(1),
  expires_in: z.number().int().positive(),
  token_type: z.string().min(1),
  scope: z.string().optional(),
  created_at: z.number().int().optional(),
});

const traktSettingsResponseSchema = z
  .object({
    user: z
      .object({
        username: z.string().min(1).optional(),
      })
      .optional(),
    username: z.string().min(1).optional(),
  })
  .passthrough();

type TraktTokenResponse = z.infer<typeof traktTokenResponseSchema>;

function getClientId(): string {
  const clientId = process.env.TRAKT_CLIENT_ID;
  if (!clientId) {
    throw new Error('Missing environment variable: "TRAKT_CLIENT_ID"');
  }

  return clientId;
}

function getClientSecret(): string {
  const clientSecret = process.env.TRAKT_CLIENT_SECRET;
  if (!clientSecret) {
    throw new Error('Missing environment variable: "TRAKT_CLIENT_SECRET"');
  }

  return clientSecret;
}

export function getTraktRedirectUri(): string {
  const redirectUri = process.env.TRAKT_REDIRECT_URI;
  if (!redirectUri) {
    throw new Error('Missing environment variable: "TRAKT_REDIRECT_URI"');
  }

  return redirectUri;
}

function getEncryptionKey(): Buffer {
  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error('Missing environment variable: "AUTH_SECRET"');
  }

  return createHash("sha256").update(secret).digest();
}

function encryptSecret(value: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getEncryptionKey(), iv);

  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return [
    iv.toString("base64url"),
    authTag.toString("base64url"),
    encrypted.toString("base64url"),
  ].join(".");
}

function decryptSecret(value: string): string {
  const [ivValue, authTagValue, encryptedValue] = value.split(".");

  if (!ivValue || !authTagValue || !encryptedValue) {
    throw new Error("Invalid encrypted Trakt credential");
  }

  const decipher = createDecipheriv(
    "aes-256-gcm",
    getEncryptionKey(),
    Buffer.from(ivValue, "base64url"),
  );

  decipher.setAuthTag(Buffer.from(authTagValue, "base64url"));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedValue, "base64url")),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}

export function buildTraktAuthorizationUrl(state: string): string {
  const url = new URL(`${TRAKT_AUTH_BASE_URL}/oauth/authorize`);

  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", getClientId());
  url.searchParams.set("redirect_uri", getTraktRedirectUri());
  url.searchParams.set("state", state);

  return url.toString();
}

async function exchangeAuthorizationCode(code: string): Promise<TraktTokenResponse> {
  const response = await fetch(`${TRAKT_AUTH_BASE_URL}/oauth/token`, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      code,
      client_id: getClientId(),
      client_secret: getClientSecret(),
      redirect_uri: getTraktRedirectUri(),
      grant_type: "authorization_code",
    }),
    cache: "no-store",
  });

  const body = await response.text();

  if (!response.ok) {
    throw new Error(`Trakt token exchange failed (${response.status}): ${body.slice(0, 300)}`);
  }

  return traktTokenResponseSchema.parse(JSON.parse(body));
}

async function refreshAccessToken(refreshToken: string): Promise<TraktTokenResponse> {
  const response = await fetch(`${TRAKT_AUTH_BASE_URL}/oauth/token`, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      refresh_token: refreshToken,
      client_id: getClientId(),
      client_secret: getClientSecret(),
      redirect_uri: getTraktRedirectUri(),
      grant_type: "refresh_token",
    }),
    cache: "no-store",
  });

  const body = await response.text();

  if (!response.ok) {
    throw new Error(`Trakt token refresh failed (${response.status}): ${body.slice(0, 300)}`);
  }

  return traktTokenResponseSchema.parse(JSON.parse(body));
}

async function fetchTraktWithAccessToken<T>(
  accessToken: string,
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(`${TRAKT_API_BASE_URL}${path}`, {
    ...init,
    headers: {
      accept: "application/json",
      "trakt-api-key": getClientId(),
      "trakt-api-version": TRAKT_API_VERSION,
      Authorization: `Bearer ${accessToken}`,
      ...init?.headers,
    },
    cache: "no-store",
  });

  const body = await response.text();

  if (!response.ok) {
    throw new Error(`Trakt ${response.status} ${response.statusText}: ${body.slice(0, 300)}`);
  }

  return body ? (JSON.parse(body) as T) : (null as T);
}

export async function completeTraktConnection(userId: string, code: string): Promise<void> {
  const token = await exchangeAuthorizationCode(code);

  const settingsResponse = await fetchTraktWithAccessToken<unknown>(
    token.access_token,
    "/users/settings",
  );

  const settings = traktSettingsResponseSchema.parse(settingsResponse);
  const username = settings.user?.username ?? settings.username ?? null;

  await connectMongoose();

  await User.findByIdAndUpdate(userId, {
    $set: {
      "trakt.connected": true,
      "trakt.username": username,
      "trakt.accessToken": encryptSecret(token.access_token),
      "trakt.refreshToken": encryptSecret(token.refresh_token),
      "trakt.expiresAt": new Date(Date.now() + token.expires_in * 1000),
      "trakt.connectedAt": new Date(),
    },
  });
}

export async function getTraktAccessToken(userId: string): Promise<string | null> {
  await connectMongoose();

  const user = await User.findById(userId).select("+trakt.accessToken +trakt.refreshToken").lean();

  const trakt = user?.trakt as
    | {
        connected?: boolean;
        accessToken?: string | null;
        refreshToken?: string | null;
        expiresAt?: Date | null;
      }
    | undefined;

  if (!trakt?.connected || !trakt.accessToken || !trakt.refreshToken || !trakt.expiresAt) {
    return null;
  }

  if (new Date(trakt.expiresAt).getTime() - Date.now() > TOKEN_REFRESH_SKEW_MS) {
    return decryptSecret(trakt.accessToken);
  }

  const refreshed = await refreshAccessToken(decryptSecret(trakt.refreshToken));

  await User.findByIdAndUpdate(userId, {
    $set: {
      "trakt.connected": true,
      "trakt.accessToken": encryptSecret(refreshed.access_token),
      "trakt.refreshToken": encryptSecret(refreshed.refresh_token),
      "trakt.expiresAt": new Date(Date.now() + refreshed.expires_in * 1000),
    },
  });

  return refreshed.access_token;
}

export async function traktFetch<T>(userId: string, path: string, init?: RequestInit): Promise<T> {
  const accessToken = await getTraktAccessToken(userId);

  if (!accessToken) {
    throw new Error("Trakt is not connected");
  }

  return fetchTraktWithAccessToken<T>(accessToken, path, init);
}

export async function disconnectTrakt(userId: string): Promise<void> {
  await connectMongoose();

  await User.findByIdAndUpdate(userId, {
    $set: {
      "trakt.connected": false,
      "trakt.username": null,
      "trakt.accessToken": null,
      "trakt.refreshToken": null,
      "trakt.expiresAt": null,
      "trakt.connectedAt": null,
    },
  });
}
