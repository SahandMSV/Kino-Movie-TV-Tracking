"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bookmark, Clapperboard, LogOut, Search } from "lucide-react";
import { signOut } from "next-auth/react";
import { toast } from "sonner";
import { useTranslate } from "@tolgee/react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { SearchModal } from "./search-modal";

type AppNavbarProps = {
  user?: {
    name?: string | null;
    username?: string | null;
    email?: string | null;
  } | null;
};

export function AppNavbar({ user }: AppNavbarProps) {
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const { t } = useTranslate();

  const isLoggedIn = !!user;
  const displayName = user?.name ?? user?.username ?? user?.email ?? "Account";

  const handleLogout = async () => {
    await signOut({ redirect: false });
    toast.success(t("common.signed_out"), {
      description: t("common.signed_out_desc"),
    });
    router.refresh();
  };

  return (
    <>
      <header className='sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl'>
        <nav className='relative mx-auto flex h-14 max-w-6xl items-center px-4 sm:px-6'>
          <div className='flex min-w-0 flex-1 items-center'>
            <Link href='/' className='text-sm font-semibold tracking-tight'>
              Kino
            </Link>
          </div>

          <div className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'>
            <button
              type='button'
              onClick={() => setSearchOpen(true)}
              className='group flex h-9 items-center gap-2 rounded-full border border-border/70 bg-muted/40 pl-4 pr-6 text-sm text-muted-foreground transition-colors hover:border-border hover:bg-muted/70 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
              aria-label={t("nav.search")}
            >
              <Search className='size-3.5 shrink-0 opacity-70 transition-opacity group-hover:opacity-100' />
              <span className='hidden sm:inline'>{t("nav.search")}</span>
              {/* <kbd className='pointer-events-none ml-1 hidden h-5 select-none items-center rounded border border-border/60 bg-background/80 px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:inline-flex'>
                /
              </kbd> */}
            </button>
          </div>

          <div className='flex min-w-0 flex-1 items-center justify-end gap-1.5'>
            <ThemeToggle />
            <LanguageSwitcher />

            {isLoggedIn ? (
              <>
                <Button
                  variant='ghost'
                  size='icon'
                  aria-label={t("nav.watchlist")}
                  onClick={() => router.push("/watchlist")}
                >
                  <Bookmark className='size-4' />
                </Button>

                <Button
                  variant='ghost'
                  size='icon'
                  aria-label={t("nav.progress")}
                  onClick={() => router.push("/progress")}
                >
                  <Clapperboard className='size-4' />
                </Button>

                <span className='mx-1 hidden max-w-32 truncate text-sm text-muted-foreground lg:inline'>
                  {displayName}
                </span>

                <Button
                  variant='ghost'
                  size='icon'
                  aria-label={t("nav.sign_out")}
                  onClick={handleLogout}
                >
                  <LogOut className='size-4' />
                </Button>
              </>
            ) : (
              <>
                <Button variant='ghost' size='sm' onClick={() => router.push("/register")}>
                  {t("nav.login")}
                </Button>
                <Button size='sm' onClick={() => router.push("/register")}>
                  {t("nav.register")}
                </Button>
              </>
            )}
          </div>
        </nav>
      </header>

      <SearchModal open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
