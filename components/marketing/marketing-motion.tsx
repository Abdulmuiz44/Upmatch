"use client";

import type { CSSProperties, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

type MarketingMotionProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  distance?: number;
  amount?: number;
  mode?: "appear" | "in-view";
};

export function MarketingMotion({
  children,
  className,
  delay = 0,
  distance = 20,
  amount = 0.3,
  mode = "in-view"
}: MarketingMotionProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(mode === "appear");

  useEffect(() => {
    if (mode === "appear") {
      setIsVisible(true);
      return;
    }

    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (!entry?.isIntersecting) {
          return;
        }

        setIsVisible(true);
        observer.disconnect();
      },
      { threshold: amount }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [amount, mode]);

  const style = {
    "--marketing-motion-delay": `${delay}s`,
    "--marketing-motion-distance": `${distance}px`
  } as CSSProperties;

  return (
    <div
      className={cn("marketing-motion", isVisible && "marketing-motion-visible", className)}
      ref={ref}
      style={style}
    >
      {children}
    </div>
  );
}
