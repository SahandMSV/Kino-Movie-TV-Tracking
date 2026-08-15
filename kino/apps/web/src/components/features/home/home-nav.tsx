"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bookmark, Clapperboard, LogOut, Search } from "lucide-react";
import { signOut } from "next-auth/react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { SearchModal } from "./search-modal";
import { cn } from "@/lib/utils";

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

  const isLoggedIn = !!user;
  const displayName = user?.name ?? user?.username ?? user?.email ?? "Account";

  const handleLogout = async () => {
    await signOut({ redirect: false });
    toast.success("Signed out", {
      description: "You have been logged out of Kino.",
    });
    router.refresh();
  };

  return (
    <>
      <header className='sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl'>
        <nav className='mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6'>
          <div className='flex items-center gap-4'>
            <Link
              href='/'
              className='text-lg font-semibold tracking-tight transition-opacity hover:opacity-80'
            >
              Kino
            </Link>

            {isLoggedIn ? (
              <div className='hidden items-center gap-1 sm:flex'>
                <Link
                  href='/watchlist'
                  className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
                >
                  Watchlist
                </Link>
                <Link
                  href='/progress'
                  className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
                >
                  Progress
                </Link>
              </div>
            ) : null}
          </div>

          <div className='flex items-center gap-1'>
            <ThemeToggle />
            <LanguageSwitcher />

            {isLoggedIn ? (
              <>
                <Button
                  variant='ghost'
                  size='icon'
                  className='sm:hidden'
                  aria-label='Watchlist'
                  onClick={() => router.push("/watchlist")}
                >
                  <Bookmark className='size-4' />
                </Button>
                <Button
                  variant='ghost'
                  size='icon'
                  className='sm:hidden'
                  aria-label='Progress'
                  onClick={() => router.push("/progress")}
                >
                  <Clapperboard className='size-4' />
                </Button>

                <Button
                  variant='ghost'
                  size='icon'
                  aria-label='Search'
                  onClick={() => setSearchOpen(true)}
                >
                  <Search className='size-4' />
                </Button>

                <span className='mx-1 hidden text-sm text-muted-foreground sm:inline'>
                  {displayName}
                </span>

                <Button variant='ghost' size='icon' aria-label='Sign out' onClick={handleLogout}>
                  <LogOut className='size-4' />
                </Button>
              </>
            ) : (
              <>
                <Button variant='ghost' size='sm' onClick={() => router.push("/register")}>
                  Login
                </Button>
                <Button size='sm' onClick={() => router.push("/register")}>
                  Register
                </Button>
              </>
            )}
          </div>
        </nav>
      </header>

      {isLoggedIn && <SearchModal open={searchOpen} onOpenChange={setSearchOpen} />}
    </>
  );
}
