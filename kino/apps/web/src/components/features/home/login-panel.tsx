// src/components/features/home/login-panel.tsx
"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { ChevronLeft, Mail, Lock } from "lucide-react";
import { toast } from "sonner";
import { loginAction, type LoginState } from "@/lib/actions/auth";

type LoginPanelProps = {
  onBack: () => void;
};

const initialState: LoginState = {};

export function LoginPanel({ onBack }: LoginPanelProps) {
  const router = useRouter();
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");

  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  useEffect(() => {
    if (state.success) {
      toast.success("Logged in successfully", {
        description: "Welcome back to Kino!",
      });
      setEmailOrUsername("");
      setPassword("");
      router.push("/"); // ← go to root with updated navbar
      router.refresh();
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state, router]);

  return (
    <div className='relative flex h-full w-full flex-col'>
      <div className='flex flex-1 flex-col items-center justify-center'>
        <div className='w-full'>
          <Button variant='ghost' onClick={onBack} aria-label='Go back'>
            <ChevronLeft className='size-4' data-icon='inline-start' />
            Back
          </Button>
        </div>

        <div className='mt-4 mb-8 space-y-3 text-center'>
          <h2 className='text-4xl font-semibold tracking-tight'>Welcome back</h2>
          <p className='text-muted-foreground'>Sign in to continue to Kino</p>
        </div>

        <form action={formAction} className='w-full max-w-xs space-y-5'>
          <InputGroup>
            <InputGroupAddon>
              <Mail className='size-4 text-muted-foreground' />
            </InputGroupAddon>
            <InputGroupInput
              name='emailOrUsername'
              type='text'
              placeholder='Email address / Username'
              required
              autoComplete='username'
              disabled={isPending}
              value={emailOrUsername}
              onChange={e => setEmailOrUsername(e.target.value)}
            />
          </InputGroup>

          <InputGroup>
            <InputGroupAddon>
              <Lock className='size-4 text-muted-foreground' />
            </InputGroupAddon>
            <InputGroupInput
              name='password'
              type='password'
              placeholder='Password'
              required
              autoComplete='current-password'
              disabled={isPending}
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </InputGroup>

          <Button type='submit' className='w-full' size='default' disabled={isPending}>
            {isPending ? "Signing in…" : "Sign In"}
          </Button>

          <div className='flex flex-1 items-center justify-center'>
            <Button variant='link' size='sm' type='button'>
              Forgot password
            </Button>
            <span className='px-3'> • </span>
            <Button variant='link' size='sm' type='button'>
              Terms of service
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
