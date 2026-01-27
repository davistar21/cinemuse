"use client";

/**
 * Global Page Transition Template
 *
 * Wraps every page in a motion component to animate
 * route changes.
 */

import { motion } from "framer-motion";
import { ReactNode } from "react";

export default function Template({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ ease: "easeInOut", duration: 0.3 }}
    >
      <div>{children}</div>
    </motion.div>
  );
}
