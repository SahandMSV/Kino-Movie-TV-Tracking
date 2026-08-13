"use client";

import * as React from "react";
import { Input as InputPrimitive } from "@base-ui/react/input";
import { Eye, EyeOff } from "lucide-react";

import { cn } from "@/lib/utils";

type InputProps = React.ComponentProps<"input"> & {
  alwaysHidden?: boolean;
};

function Input({ className, type, alwaysHidden = false, ...props }: InputProps) {
  const [showPassword, setShowPassword] = React.useState(false);
  const isPassword = type === "password" && !alwaysHidden;

  return (
    <div className={cn("relative w-full", isPassword && "group")}>
      <InputPrimitive
        type={isPassword ? (showPassword ? "text" : "password") : type}
        data-slot='input'
        className={cn(
          "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50  file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50",
          isPassword && "pr-8",
          className,
        )}
        {...props}
      />

      {isPassword && (
        <button
          type='button'
          tabIndex={-1}
          onClick={() => setShowPassword(prev => !prev)}
          className='absolute top-1/2 right-2.5 -translate-y-1/2 rounded-sm text-muted-foreground transition-colors hover:text-foreground'
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <EyeOff className='size-4' /> : <Eye className='size-4' />}
        </button>
      )}
    </div>
  );
}

export { Input };
