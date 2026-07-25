"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

type SignupPanelProps = {
  onBack: () => void;
};

export function SignupPanel({ onBack }: SignupPanelProps) {
  const handleSignup = () => {
    // Fake success
    toast.success("Account created successfully", {
      description: "Welcome to Kino!",
    });
  };

  return (
    <div className="relative flex h-full w-full flex-col">
      <div className="flex flex-1 flex-col items-center justify-center">
        <button
          onClick={onBack}
          className="w-full left-0 top-0 z-10 -m-1 flex items-center gap-2 p-1 pb-8 text-sm text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Go back"
        >
          <ArrowLeft className="size-4" />
          <span>Back</span>
        </button>
        <div className="mb-10 space-y-3 text-center">
          <h2 className="text-4xl font-semibold tracking-tight">
            Create account
          </h2>
          <p className="text-muted-foreground">Join Kino today</p>
        </div>

        <div className="w-full max-w-xs space-y-5">
          <input
            type="text"
            placeholder="Full name"
            className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-ring"
          />
          <input
            type="email"
            placeholder="Email address"
            className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-ring"
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-ring"
          />

          <Button className="w-full" size="lg" onClick={handleSignup}>
            Create Account
          </Button>
        </div>
      </div>
    </div>
  );
}
