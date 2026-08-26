"use client";

import { TolgeeProvider, type TolgeeStaticData } from "@tolgee/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { TolgeeBase } from "./shared";

const tolgee = TolgeeBase().init();

type Props = {
  language: string;
  staticData: TolgeeStaticData;
  children: React.ReactNode;
};

export function TolgeeNextProvider({ language, staticData, children }: Props) {
  const router = useRouter();

  useEffect(() => {
    const { unsubscribe } = tolgee.on("permanentChange", () => {
      router.refresh();
    });
    return () => unsubscribe();
  }, [router]);

  return (
    <TolgeeProvider tolgee={tolgee} ssr={{ language, staticData }} fallback={null}>
      {children}
    </TolgeeProvider>
  );
}
