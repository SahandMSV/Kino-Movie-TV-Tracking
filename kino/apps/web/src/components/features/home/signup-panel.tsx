"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslate } from "@tolgee/react";
import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { ChevronLeft, Mail, Lock, User } from "lucide-react";
import { toast } from "sonner";
import { registerAction, type RegisterState } from "@/lib/actions/auth";

type SignupPanelProps = {
  onBack: () => void;
};

const initialState: RegisterState = {};

export function SignupPanel({ onBack }: SignupPanelProps) {
  const router = useRouter();
  const { t } = useTranslate();
  const [state, formAction, isPending] = useActionState(registerAction, initialState);

  useEffect(() => {
    if (state.success) {
      toast.success(t("auth.registered"), {
        description: t("auth.registered_desc"),
      });
      router.push("/");
      router.refresh();
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state, router, t]);

  return (
    <div className='relative flex h-full w-full flex-col'>
      <div className='flex flex-1 flex-col items-center justify-center'>
        <div className='w-full'>
          <Button variant='ghost' onClick={onBack} aria-label={t("common.back")}>
            <ChevronLeft className='size-4' data-icon='inline-start' />
            {t("common.back")}
          </Button>
        </div>

        <div className='mt-4 mb-8 space-y-3 text-center'>
          <h2 className='text-4xl font-semibold tracking-tight'>{t("auth.create_account")}</h2>
          <p className='text-muted-foreground'>{t("auth.create_sub")}</p>
        </div>

        <form action={formAction} className='w-full max-w-xs space-y-5'>
          <InputGroup>
            <InputGroupAddon>
              <User className='size-4 text-muted-foreground' />
            </InputGroupAddon>
            <InputGroupInput
              name='username'
              type='text'
              placeholder={t("auth.username")}
              required
              autoComplete='username'
              disabled={isPending}
            />
          </InputGroup>

          <InputGroup>
            <InputGroupAddon>
              <Mail className='size-4 text-muted-foreground' />
            </InputGroupAddon>
            <InputGroupInput
              name='email'
              type='email'
              placeholder={t("auth.email")}
              required
              autoComplete='email'
              disabled={isPending}
            />
          </InputGroup>

          <InputGroup>
            <InputGroupAddon>
              <Lock className='size-4 text-muted-foreground' />
            </InputGroupAddon>
            <InputGroupInput
              name='password'
              type='password'
              placeholder={t("auth.password")}
              required
              autoComplete='new-password'
              disabled={isPending}
            />
          </InputGroup>

          <InputGroup>
            <InputGroupAddon>
              <Lock className='size-4 text-muted-foreground' />
            </InputGroupAddon>
            <InputGroupInput
              name='confirmPassword'
              type='password'
              placeholder={t("auth.confirm_password")}
              required
              autoComplete='new-password'
              disabled={isPending}
            />
          </InputGroup>

          {state.fieldErrors && (
            <p className='text-sm text-destructive'>{Object.values(state.fieldErrors).flat()[0]}</p>
          )}

          <Button type='submit' className='w-full' size='default' disabled={isPending}>
            {isPending ? t("auth.signing_up") : t("auth.sign_up")}
          </Button>
        </form>
      </div>
    </div>
  );
}
