"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type NotFoundViewProps = {
  title?: string;
  description?: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
};

export function NotFoundView({
  title = "Page not found",
  description = "The page you’re looking for doesn’t exist or has been moved.",
  primaryHref = "/",
  primaryLabel = "Back home",
  secondaryHref,
  secondaryLabel,
}: NotFoundViewProps) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto max-w-md space-y-6 text-center"
      >
        <div className="space-y-3">
          <p className="text-sm font-medium tracking-widest text-muted-foreground uppercase">
            404
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {title}
          </h1>
          <p className="text-muted-foreground">{description}</p>
        </div>

        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href={primaryHref}
            className={cn(buttonVariants({ variant: "default", size: "default" }))}
          >
            {primaryLabel}
          </Link>

          {secondaryHref && secondaryLabel ? (
            <Link
              href={secondaryHref}
              className={cn(
                buttonVariants({ variant: "outline", size: "default" }),
              )}
            >
              {secondaryLabel}
            </Link>
          ) : null}
        </div>
      </motion.div>
    </div>
  );
}