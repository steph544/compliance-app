"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface StaggeredListProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

export const staggerItem = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};

export function StaggeredList({
  children,
  className,
  staggerDelay,
}: StaggeredListProps) {
  const variants = staggerDelay
    ? {
        ...container,
        show: {
          ...container.show,
          transition: { staggerChildren: staggerDelay },
        },
      }
    : container;

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      animate="show"
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}

export function StaggeredItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div variants={staggerItem} className={cn(className)}>
      {children}
    </motion.div>
  );
}
