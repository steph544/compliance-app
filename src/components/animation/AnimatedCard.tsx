"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AnimatedCardProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  accentColor?: string;
}

export function AnimatedCard({
  children,
  delay = 0,
  className,
  accentColor,
}: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
    >
      <Card
        className={cn(
          "transition-card hover-lift overflow-hidden",
          className
        )}
        style={
          accentColor
            ? { borderLeft: `4px solid ${accentColor}` }
            : undefined
        }
      >
        {children}
      </Card>
    </motion.div>
  );
}
