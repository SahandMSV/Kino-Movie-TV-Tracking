"use client";

import Link from "next/link";
import { useTranslate } from "@tolgee/react";
import { Button } from "@/components/ui/button";

type CarouselViewAllProps = {
  href: string;
};

export function CarouselViewAll({ href }: CarouselViewAllProps) {
  const { t } = useTranslate();

  return (
    <Button variant='ghost' size='sm' nativeButton={false} render={<Link href={href} />}>
      {t("common.view_all")}
    </Button>
  );
}
