import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";

export function UtilityControls() {
  return (
    <div className='absolute right-6 top-6 flex items-center gap-2'>
      <ThemeToggle />
      <LanguageSwitcher />
    </div>
  );
}
