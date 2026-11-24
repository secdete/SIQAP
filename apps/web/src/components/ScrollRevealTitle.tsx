"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface ScrollRevealTitleProps {
  text: string;
  as?: "h1" | "h2" | "h3";
  className?: string;
  /** Play right away on mount (useful for above-the-fold hero headings). */
  immediate?: boolean;
}

/**
 * Reveals a heading word-by-word using GSAP + ScrollTrigger.
 * Wraps each word in an overflow-hidden mask and cleans up cleanly under
 * React StrictMode while respecting prefers-reduced-motion.
 */
export function ScrollRevealTitle({
  text,
  as: Tag = "h2",
  className = "",
  immediate = false,
}: ScrollRevealTitleProps) {
  const containerRef = useRef<HTMLHeadingElement | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      const words = el.querySelectorAll<HTMLElement>("[data-reveal-word]");
      if (words.length === 0) return;

      gsap.fromTo(
        words,
        { y: 26, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.65,
          ease: "power3.out",
          stagger: 0.06,
          ...(immediate
            ? { delay: 0.1 }
            : {
                scrollTrigger: {
                  trigger: el,
                  start: "top 88%",
                  toggleActions: "play none none reverse",
                },
              }),
        }
      );
    }, el);

    return () => ctx.revert();
  }, [text, immediate]);

  const words = text.split(" ");

  return (
    <Tag ref={containerRef} className={className} aria-label={text}>
      {words.map((word, idx) => (
        <span
          key={`${word}-${idx}`}
          data-reveal-word
          className="inline-block will-change-transform"
          aria-hidden="true"
        >
          {word}
          {idx < words.length - 1 ? "\u00A0" : ""}
        </span>
      ))}
    </Tag>
  );
}
