"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  ChevronDown,
  ChevronRight,
  FileText,
  StickyNote,
} from "lucide-react";
import type { NistMappingEntry } from "@/lib/scoring/nist-mapper";

interface NistControlCardProps {
  entry: NistMappingEntry;
  isImplemented: boolean;
  note: string;
  onToggle: (controlId: string) => void;
  onNoteChange: (controlId: string, note: string) => void;
}

const designationStyles: Record<string, string> = {
  REQUIRED: "bg-red-100 text-red-800",
  RECOMMENDED: "bg-amber-100 text-amber-800",
  OPTIONAL: "bg-gray-100 text-gray-700",
};

const levelStyles: Record<string, string> = {
  BASELINE: "bg-green-100 text-green-800",
  ENHANCED: "bg-blue-100 text-blue-800",
  HIGH_STAKES: "bg-purple-100 text-purple-800",
};

const typeStyles: Record<string, string> = {
  TECHNICAL: "bg-cyan-100 text-cyan-800",
  PROCESS: "bg-orange-100 text-orange-800",
  LEGAL: "bg-pink-100 text-pink-800",
};

export function NistControlCard({
  entry,
  isImplemented,
  note,
  onToggle,
  onNoteChange,
}: NistControlCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showNotes, setShowNotes] = useState(!!note);
  const [localNote, setLocalNote] = useState(note);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setLocalNote(note);
  }, [note]);

  const handleNoteChange = useCallback(
    (value: string) => {
      setLocalNote(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        onNoteChange(entry.controlId, value);
      }, 500);
    },
    [entry.controlId, onNoteChange]
  );

  return (
    <div
      className={`rounded-lg border transition-all ${
        isImplemented
          ? "border-green-200 bg-green-50/30"
          : "border-border"
      }`}
    >
      {/* Main Row */}
      <div className="flex items-start gap-3 p-3">
        <Checkbox
          checked={isImplemented}
          onCheckedChange={() => onToggle(entry.controlId)}
          className="mt-0.5"
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono text-muted-foreground">
              {entry.controlId}
            </span>
            <Badge className={designationStyles[entry.designation] ?? "bg-gray-100 text-gray-700"}>
              {entry.designation}
            </Badge>
            <Badge className={levelStyles[entry.implementationLevel] ?? "bg-gray-100 text-gray-700"}>
              {entry.implementationLevel?.replace("_", " ")}
            </Badge>
            <Badge className={typeStyles[entry.controlType] ?? "bg-gray-100 text-gray-700"}>
              {entry.controlType}
            </Badge>
          </div>
          <p
            className={`text-sm font-medium mt-1 ${
              isImplemented ? "line-through text-muted-foreground" : ""
            }`}
          >
            {entry.controlName}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {entry.finding}
          </p>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setShowNotes(!showNotes)}
            className="p-1 rounded hover:bg-muted transition-colors"
            title="Notes"
          >
            <StickyNote className="h-4 w-4 text-muted-foreground" />
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded hover:bg-muted transition-colors"
            title="Details"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        </div>
      </div>

      {/* Notes Section */}
      {showNotes && (
        <div className="px-3 pb-3 pl-10">
          <Textarea
            placeholder="Add implementation notes..."
            value={localNote}
            onChange={(e) => handleNoteChange(e.target.value)}
            className="text-sm min-h-[60px]"
          />
        </div>
      )}

      {/* Expanded Details */}
      {isExpanded && (
        <div className="px-3 pb-3 pl-10 space-y-3 border-t">
          {entry.description && (
            <div className="pt-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                Description
              </p>
              <p className="text-sm">{entry.description}</p>
            </div>
          )}

          {entry.implementationSteps?.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                Implementation Steps
              </p>
              <ol className="list-decimal list-inside text-sm space-y-1">
                {entry.implementationSteps.map((step, i) => (
                  <li key={i} className="text-muted-foreground">
                    <span className="text-foreground">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {entry.evidence?.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                Evidence Artifacts
              </p>
              <ul className="text-sm space-y-1">
                {entry.evidence.map((artifact, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <FileText className="h-3 w-3 text-muted-foreground shrink-0" />
                    <span>{artifact}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
