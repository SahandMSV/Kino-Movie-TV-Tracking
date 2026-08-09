"use server";

import { z } from "zod";
import { AuthError } from "next-auth";

import { connectMongoose } from "@/lib/db/mongoose";
import { User } from "@/lib/db/models/user";
import { hashPassword } from "@/lib/password";
import { signIn } from "@/auth";

const registerSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(32, "Username must be at most 32 characters")
      .regex(
        /^[a-z0-9_]+$/,
        "Username can only contain lowercase letters, numbers and underscores",
      ),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterState = {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function registerAction(
  _prev: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const raw = {
    email: formData.get("email"),
    username: formData.get("username"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  };

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { email, username, password } = parsed.data;

  try {
    await connectMongoose();

    const existing = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }],
    });

    if (existing) {
      if (existing.email === email.toLowerCase()) {
        return { error: "An account with this email already exists" };
      }
      return { error: "This username is already taken" };
    }

    const passwordHash = await hashPassword(password);

    await User.create({
      email: email.toLowerCase(),
      username: username.toLowerCase(),
      passwordHash,
      name: username,
    });

    // Auto sign-in after successful registration
    await signIn("credentials", {
      emailOrUsername: email,
      password,
      redirect: false,
    });

    return { success: true };
  } catch (err) {
    console.error("Registration error:", err);
    return { error: "Something went wrong. Please try again." };
  }
}

const loginSchema = z.object({
  emailOrUsername: z.string().min(1, "Email or username is required"),
  password: z.string().min(1, "Password is required"),
});

export type LoginState = {
  success?: boolean;
  error?: string;
};

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const raw = {
    emailOrUsername: formData.get("emailOrUsername"),
    password: formData.get("password"),
  };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Please fill in all fields" };
  }

  try {
    await signIn("credentials", {
      emailOrUsername: parsed.data.emailOrUsername,
      password: parsed.data.password,
      redirect: false,
    });

    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid email/username or password" };
        default:
          return { error: "Something went wrong. Please try again." };
      }
    }
    throw error;
  }
}