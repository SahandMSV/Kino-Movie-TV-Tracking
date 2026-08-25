"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useTranslate } from "@tolgee/react";
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
  title,
  description,
  primaryHref = "/",
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}: NotFoundViewProps) {
  const { t } = useTranslate();

  return (
    <div className='flex min-h-[70vh] flex-col items-center justify-center px-6'>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className='mx-auto max-w-md space-y-6 text-center'
      >
        <div className='space-y-3'>
          <p className='text-sm font-medium tracking-widest text-muted-foreground uppercase'>
            {t("not_found.code")}
          </p>
          <h1 className='text-3xl font-semibold tracking-tight sm:text-4xl'>
            {title ?? t("not_found.title")}
          </h1>
          <p className='text-muted-foreground'>{description ?? t("not_found.description")}</p>
        </div>

        <div className='flex flex-col items-center justify-center gap-3 sm:flex-row'>
          <Link
            href={primaryHref}
            className={cn(buttonVariants({ variant: "default", size: "default" }))}
          >
            {primaryLabel ?? t("common.back_home")}
          </Link>

          {secondaryHref && secondaryLabel ? (
            <Link
              href={secondaryHref}
              className={cn(buttonVariants({ variant: "outline", size: "default" }))}
            >
              {secondaryLabel}
            </Link>
          ) : null}
        </div>
      </motion.div>
    </div>
  );
}
