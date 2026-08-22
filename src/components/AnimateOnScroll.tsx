"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
  animation?: string;
  delay?: number;
}

// 🚀 Single shared observer instance for ALL AnimateOnScroll components
let sharedObserver: IntersectionObserver | null = null;
const observedElements = new WeakMap<Element, () => void>();

function getObserver(): IntersectionObserver {
  if (sharedObserver) return sharedObserver;

  sharedObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const callback = observedElements.get(entry.target);
          if (callback) {
            callback();
            sharedObserver?.unobserve(entry.target);
            observedElements.delete(entry.target);
          }
        }
      });
    },
    { threshold: 0.1, rootMargin: "50px" }
  );

  return sharedObserver;
}

export default function AnimateOnScroll({
  children,
  className = "",
  animation = "animate-fade-in-up",
  delay = 0,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Skip observer if reduced motion is preferred
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }

    const observer = getObserver();
    observedElements.set(el, () => setVisible(true));
    observer.observe(el);

    return () => {
      observer.unobserve(el);
      observedElements.delete(el);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`${className} ${visible ? animation : "opacity-0"}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}