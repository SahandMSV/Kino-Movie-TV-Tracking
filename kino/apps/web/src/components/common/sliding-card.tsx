"use client";

import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

export type ViewConfig = {
  width: number;
  height: number;
};

type SlidingCardProps<T extends string> = {
  view: T;
  configs: Record<T, ViewConfig>;
  panels: Record<T, ReactNode>;
  order?: T[];
  gap?: number;
  className?: string;
};

export function SlidingCard<T extends string>({
  view,
  configs,
  panels,
  order,
  gap = 0,
  className,
}: SlidingCardProps<T>) {
  const orderedKeys = order ?? (Object.keys(configs) as T[]);
  const currentIndex = orderedKeys.indexOf(view);

  const offset = orderedKeys.slice(0, currentIndex).reduce((acc, key) => {
    return acc + configs[key].width + gap;
  }, 0);

  return (
    <motion.div
      initial={false}
      animate={{
        width: configs[view].width,
        height: configs[view].height,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 27,
        mass: 0.85,
      }}
      className={`relative shrink-0 overflow-hidden ${className ?? ""}`}
    >
      {/* Same border style as the outline Button */}
      <Card className="h-full w-full border border-border dark:border-input">
        <CardContent className="relative h-full p-0">
          <motion.div
            className="flex h-full"
            style={{ gap: `${gap}px` }}
            animate={{ x: -offset }}
            transition={{
              duration: 0.5,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {orderedKeys.map((key) => {
              const isActive = key === view;

              return (
                <motion.div
                  key={key}
                  className="shrink-0"
                  style={{
                    width: configs[key].width,
                    height: configs[key].height,
                  }}
                  animate={{ opacity: isActive ? 1 : 0 }}
                  transition={{
                    duration: 0.35,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <div className="flex h-full w-full flex-col p-12">
                    {panels[key]}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
