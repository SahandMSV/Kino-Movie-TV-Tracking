"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bookmark, Clapperboard, LogOut, Search, Settings } from "lucide-react";
import { signOut } from "next-auth/react";
import { toast } from "sonner";
import { useTranslate } from "@tolgee/react";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { SearchModal } from "./search-modal";
import { cn } from "@/lib/utils";

type AppNavbarProps = {
  user?: {
    id?: string;
    name?: string | null;
    username?: string | null;
    email?: string | null;
    image?: string | null;
  } | null;
};

export function AppNavbar({ user }: AppNavbarProps) {
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const { t } = useTranslate();

  const isLoggedIn = !!user;
  const displayName = user?.name ?? user?.username ?? user?.email ?? "Account";
  const initials = (user?.name ?? user?.username ?? "K").slice(0, 2).toUpperCase();

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
            </button>
          </div>

          <div className='flex flex-1 items-center justify-end gap-1.5 sm:gap-2'>
            <LanguageSwitcher />
            <ThemeToggle />

            {isLoggedIn ? (
              <>
                <Link
                  href='/watchlist'
                  aria-label={t("nav.watchlist")}
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "icon" }),
                    "hidden sm:inline-flex",
                  )}
                >
                  <Bookmark className='size-4' />
                </Link>

                <Link
                  href='/progress'
                  aria-label={t("nav.progress")}
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "icon" }),
                    "hidden sm:inline-flex",
                  )}
                >
                  <Clapperboard className='size-4' />
                </Link>

                <DropdownMenu>
                  <DropdownMenuTrigger
                    className={cn(
                      "relative flex size-9 items-center justify-center rounded-full outline-none",
                      "hover:bg-accent hover:text-accent-foreground",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    )}
                    aria-label='Account menu'
                  >
                    <Avatar className='size-8'>
                      <AvatarImage src={user?.image ?? undefined} alt={displayName} />
                      <AvatarFallback className='text-xs font-medium'>{initials}</AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align='end' className='w-56'>
                    <DropdownMenuGroup>
                      <DropdownMenuLabel className='font-normal'>
                        <div className='flex flex-col space-y-1'>
                          <p className='text-sm font-medium leading-none'>{displayName}</p>
                          {user?.username && (
                            <p className='text-xs leading-none text-muted-foreground'>
                              @{user.username}
                            </p>
                          )}
                        </div>
                      </DropdownMenuLabel>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuItem onClick={() => router.push("/settings")}>
                        <Settings className='mr-2 size-4' />
                        Settings
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className='sm:hidden'
                        onClick={() => router.push("/watchlist")}
                      >
                        <Bookmark className='mr-2 size-4' />
                        {t("nav.watchlist")}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className='sm:hidden'
                        onClick={() => router.push("/progress")}
                      >
                        <Clapperboard className='mr-2 size-4' />
                        {t("nav.progress")}
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuItem
                        className='text-destructive focus:text-destructive'
                        onClick={handleLogout}
                      >
                        <LogOut className='mr-2 size-4' />
                        {t("nav.sign_out")}
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link href='/register' className={buttonVariants({ variant: "ghost", size: "sm" })}>
                  {t("nav.login")}
                </Link>
                <Link href='/register' className={buttonVariants({ size: "sm" })}>
                  {t("nav.register")}
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      <SearchModal open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
