"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Laptop, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ThemeToggle() {
  const { theme = "system", setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const getTriggerIcon = () => {
    if (!mounted) return <Laptop className='size-4' />;

    if (theme === "system") {
      return resolvedTheme === "dark" ? <Moon className='size-4' /> : <Sun className='size-4' />;
    }

    return theme === "dark" ? <Moon className='size-4' /> : <Sun className='size-4' />;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant='outline' size='icon' aria-label='Change theme'>
            <AnimatePresence mode='wait' initial={false}>
              <motion.div
                key={mounted ? (theme === "system" ? resolvedTheme || "system" : theme) : "loading"}
                className='flex items-center justify-center'
                initial={{ opacity: 0, rotate: -10 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 10 }}
                transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              >
                {getTriggerIcon()}
              </motion.div>
            </AnimatePresence>
          </Button>
        }
      />

      <DropdownMenuContent align='end'>
        <AnimatePresence mode='wait'>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <DropdownMenuRadioGroup
              value={theme}
              onValueChange={value => {
                setTimeout(() => {
                  setTheme(value as "light" | "dark" | "system");
                }, 80);
              }}
            >
              <DropdownMenuRadioItem value='system'>
                <Laptop className='size-4' />
                System
              </DropdownMenuRadioItem>

              <DropdownMenuRadioItem value='light'>
                <Sun className='size-4' />
                Light
              </DropdownMenuRadioItem>

              <DropdownMenuRadioItem value='dark'>
                <Moon className='size-4' />
                Dark
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </motion.div>
        </AnimatePresence>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
