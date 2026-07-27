"use client";

import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { ChevronLeft, Lock, User } from "lucide-react";
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

        <div className="w-full max-w-xs space-y-5">
          <InputGroup>
            <InputGroupAddon>
              <User className="size-4 text-muted-foreground" />
            </InputGroupAddon>
            <InputGroupInput
              type="email"
              placeholder="Email address / Username"
            />
          </InputGroup>

          <InputGroup>
            <InputGroupAddon>
              <Lock className="size-4 text-muted-foreground" />
            </InputGroupAddon>
            <InputGroupInput type="password" placeholder="Password" />
          </InputGroup>

          <InputGroup>
            <InputGroupAddon>
              <Lock className="size-4 text-muted-foreground" />
            </InputGroupAddon>
            <InputGroupInput type="password" placeholder="Confirm Password" />
          </InputGroup>

          <Button className="w-full" size="default" onClick={handleSignup}>
            Create Account
          </Button>

          <div className="flex flex-1 items-center justify-center">
            <Button variant={"link"} size={"sm"}>
              Guest Mode
            </Button>
            <span className="px-3"> • </span>
            <Button variant={"link"} size={"sm"}>
              Terms of service
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
