"use client";

import { FadeIn } from "@/components/animation/FadeIn";

interface TabContentFadeInProps {
  children: React.ReactNode;
}

export function TabContentFadeIn({ children }: TabContentFadeInProps) {
  return <FadeIn>{children}</FadeIn>;
}
