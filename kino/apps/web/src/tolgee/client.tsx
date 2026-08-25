"use client";

import { TolgeeProvider, type TolgeeStaticData } from "@tolgee/react";
import { DevTools } from "@tolgee/web";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { TolgeeBase } from "./shared";

const base = TolgeeBase();
if (process.env.NEXT_PUBLIC_TOLGEE_API_KEY) {
  base.use(DevTools());
}
const tolgee = base.init();

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
