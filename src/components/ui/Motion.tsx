"use client";

import { motion, type HTMLMotionProps } from "motion/react";

/**
 * Reusable animation primitives built on `motion`.
 *
 * Kept in one client component so feature code can animate without each file
 * needing its own `"use client"` boundary or repeating variant definitions.
 */

export interface FadeInProps extends HTMLMotionProps<"div"> {
  /** Seconds to wait before animating in. @default 0 */
  delay?: number;
}

/** Fades and slides content up on mount. Respects reduced-motion settings. */
export function FadeIn({ delay = 0, children, ...props }: FadeInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: "easeOut" }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * Container that staggers the entrance of its direct {@link StaggerItem}
 * children, producing a polished cascading reveal for lists and grids.
 */
export function Stagger({ children, ...props }: HTMLMotionProps<"div">) {
  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.08 } },
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, ...props }: HTMLMotionProps<"div">) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 12 },
        show: { opacity: 1, y: 0 },
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
