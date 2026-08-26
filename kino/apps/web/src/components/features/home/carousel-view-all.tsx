"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useTranslate } from "@tolgee/react";
import { Button } from "@/components/ui/button";

type CarouselViewAllProps = {
  href: string;
};

export function CarouselViewAll({ href }: CarouselViewAllProps) {
  const { t } = useTranslate();

  return (
    <Button
      className='flex justify-center items-center gap-2'
      variant='ghost'
      size='sm'
      nativeButton={false}
      render={<Link href={href} />}
    >
      {t("common.view_all")}
      <ArrowRight className='size-3.5' />
    </Button>
  );
}
