"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FadeIn } from "@/components/animation/FadeIn";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

interface PolicySection {
  heading: string;
  content: string;
}

interface Policy {
  title: string;
  sections: PolicySection[];
}

interface PolicyDraftsProps {
  policyDrafts: {
    responsibleAI: Policy;
    transparency: Policy;
  };
  assessmentId: string;
}

function PolicyCard({
  policy,
  defaultOpen = false,
}: {
  policy: Policy;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Card className="transition-card hover-lift">
      <CardHeader
        className="cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{policy.title}</CardTitle>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </motion.div>
        </div>
      </CardHeader>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <CardContent className="space-y-6">
              {(policy.sections ?? []).map((section, index) => (
                <div key={index} className="space-y-2">
                  <h4 className="text-sm font-semibold">{section.heading}</h4>
                  <div className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {section.content}
                  </div>
                </div>
              ))}
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

export function PolicyDrafts({
  policyDrafts,
  assessmentId,
}: PolicyDraftsProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Policy Drafts</h3>
        <Button variant="outline" asChild>
          <a
            href={`/api/org-assessments/${assessmentId}/policies`}
            download
          >
            Download Policies
          </a>
        </Button>
      </div>

      <div className="space-y-4">
        <FadeIn>
          <PolicyCard policy={policyDrafts.responsibleAI} defaultOpen />
        </FadeIn>
        <FadeIn delay={0.1}>
          <PolicyCard policy={policyDrafts.transparency} />
        </FadeIn>
      </div>
    </div>
  );
}
