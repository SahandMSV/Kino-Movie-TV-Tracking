"use client";

import { useState, useEffect } from "react";
import { Check, Languages } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useTolgee } from "@tolgee/react";
import { useRouter } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { setLanguage } from "@/tolgee/language";
import { ALL_LANGUAGES } from "@/tolgee/shared";

const labels: Record<string, string> = {
  en: "English",
  de: "Deutsch",
  fr: "Français",
  es: "Español",
};

export function LanguageSwitcher() {
  const tolgee = useTolgee(["language"]);
  const tolgeeLang = tolgee.getLanguage() ?? "en";
  const [language, setLocalLanguage] = useState(tolgeeLang);
  const router = useRouter();

  useEffect(() => {
    setLocalLanguage(tolgeeLang);
  }, [tolgeeLang]);

  const handleChange = async (code: string) => {
    if (code === language) return;
    setLocalLanguage(code);
    await setLanguage(code);
    await tolgee.changeLanguage(code);
    router.refresh();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(buttonVariants({ variant: "outline", size: "icon" }))}
        aria-label='Select language'
      >
        <AnimatePresence mode='wait' initial={false}>
          <motion.div
            key={language}
            className='flex items-center justify-center'
            initial={{ opacity: 0, rotate: -10 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: 10 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
          >
            <Languages className='size-4' />
          </motion.div>
        </AnimatePresence>
      </DropdownMenuTrigger>

      <DropdownMenuContent align='end'>
        <AnimatePresence mode='wait'>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {ALL_LANGUAGES.map(code => (
              <DropdownMenuItem
                key={code}
                onClick={() => handleChange(code)}
                className='cursor-pointer'
              >
                {labels[code]}
                {language === code && <Check className='ml-auto' />}
              </DropdownMenuItem>
            ))}
          </motion.div>
        </AnimatePresence>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
