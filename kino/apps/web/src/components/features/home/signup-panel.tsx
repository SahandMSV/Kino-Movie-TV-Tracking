"use client";

import { useActionState, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { ChevronLeft, Lock, Mail, User } from "lucide-react";
import { toast } from "sonner";
import { registerAction, type RegisterState } from "@/lib/actions/auth";

type SignupPanelProps = {
  onBack: () => void;
};

const initialState: RegisterState = {};

export function SignupPanel({ onBack }: SignupPanelProps) {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [state, formAction, isPending] = useActionState(
    registerAction,
    initialState,
  );

  useEffect(() => {
    if (state.success) {
      toast.success("Account created successfully", {
        description: "Welcome to Kino!",
      });
      setEmail("");
      setUsername("");
      setPassword("");
      setConfirmPassword("");
      onBack();
    } else if (state.error) {
      toast.error(state.error);
    } else if (state.fieldErrors) {
      const firstError = Object.values(state.fieldErrors).flat()[0];
      if (firstError) toast.error(firstError);
    }
  }, [state, onBack]);

  return (
    <div className="relative flex h-full w-full flex-col">
      <div className="flex flex-1 flex-col items-center justify-center">
        <div className="w-full">
          <Button variant="ghost" onClick={onBack} aria-label="Go back">
            <ChevronLeft className="size-4" data-icon="inline-start" />
            Back
          </Button>
        </div>

        <div className="mt-4 mb-8 space-y-3 text-center">
          <h2 className="text-4xl font-semibold tracking-tight">
            Create account
          </h2>
          <p className="text-muted-foreground">Join Kino today</p>
        </div>

        <form action={formAction} className="w-full max-w-xs space-y-5">
          <InputGroup>
            <InputGroupAddon>
              <Mail className="size-4 text-muted-foreground" />
            </InputGroupAddon>
            <InputGroupInput
              name="email"
              type="email"
              placeholder="Email address"
              required
              autoComplete="email"
              disabled={isPending}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </InputGroup>

          <InputGroup>
            <InputGroupAddon>
              <User className="size-4 text-muted-foreground" />
            </InputGroupAddon>
            <InputGroupInput
              name="username"
              type="text"
              placeholder="Username"
              required
              autoComplete="username"
              disabled={isPending}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </InputGroup>

          <InputGroup>
            <InputGroupAddon>
              <Lock className="size-4 text-muted-foreground" />
            </InputGroupAddon>
            <InputGroupInput
              name="password"
              type="password"
              placeholder="Password"
              required
              autoComplete="new-password"
              disabled={isPending}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </InputGroup>

          <InputGroup>
            <InputGroupAddon>
              <Lock className="size-4 text-muted-foreground" />
            </InputGroupAddon>
            <InputGroupInput
              name="confirmPassword"
              type="password"
              placeholder="Confirm Password"
              required
              autoComplete="new-password"
              disabled={isPending}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </InputGroup>

          <Button
            type="submit"
            className="w-full"
            size="default"
            disabled={isPending}
          >
            {isPending ? "Creating account…" : "Create Account"}
          </Button>

          <div className="flex flex-1 items-center justify-center">
            <Button variant="link" size="sm" type="button">
              Guest Mode
            </Button>
            <span className="px-3"> • </span>
            <Button variant="link" size="sm" type="button">
              Terms of service
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}