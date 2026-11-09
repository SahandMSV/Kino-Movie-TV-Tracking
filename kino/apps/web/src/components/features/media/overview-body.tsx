"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type OverviewBodyProps = {
  children: ReactNode;
  className?: string;
};

export function OverviewBody({ children, className }: OverviewBodyProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [overflowing, setOverflowing] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const check = () => {
      setOverflowing(el.scrollHeight > el.clientHeight + 1);
    };

    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [children]);

  return (
    <div
      ref={ref}
      className={cn("relative min-h-0 flex-1 overflow-hidden", className)}
      style={
        overflowing
          ? {
              maskImage:
                "linear-gradient(to bottom, #000 0%, #000 calc(100% - 3.5rem), transparent 100%)",
              WebkitMaskImage:
                "linear-gradient(to bottom, #000 0%, #000 calc(100% - 3.5rem), transparent 100%)",
            }
          : undefined
      }
    >
      {children}
    </div>
  );
}
