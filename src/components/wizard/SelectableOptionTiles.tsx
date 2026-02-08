"use client";

import { cn } from "@/lib/utils";

export interface OptionTileItem {
  value: string;
  label: string;
  description?: string;
}

interface SelectableOptionTilesProps {
  options: OptionTileItem[];
  value: string | string[];
  onChange: (value: string | string[]) => void;
  multi?: boolean;
  className?: string;
  gridCols?: "2" | "3" | "4" | "auto";
}

export function SelectableOptionTiles({
  options,
  value,
  onChange,
  multi = false,
  className,
  gridCols = "auto",
}: SelectableOptionTilesProps) {
  const selectedSet = Array.isArray(value) ? new Set(value) : new Set([value]);

  function handleClick(optionValue: string) {
    if (multi) {
      const next = new Set(selectedSet);
      if (next.has(optionValue)) {
        next.delete(optionValue);
      } else {
        next.add(optionValue);
      }
      onChange(Array.from(next));
    } else {
      onChange(optionValue);
    }
  }

  const gridClass =
    gridCols === "2"
      ? "grid-cols-2"
      : gridCols === "3"
        ? "grid-cols-2 sm:grid-cols-3"
        : gridCols === "4"
          ? "grid-cols-2 sm:grid-cols-4"
          : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4";

  return (
    <div className={cn("grid gap-2", gridClass, className)}>
      {options.map((option) => {
        const selected = selectedSet.has(option.value);
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => handleClick(option.value)}
            className={cn(
              "rounded-lg border px-3 py-2.5 text-left text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              selected
                ? "border-primary bg-primary text-primary-foreground ring-2 ring-primary/30 ring-offset-2"
                : "border-border bg-background hover:bg-muted/50"
            )}
          >
            <span className="block">{option.label}</span>
            {option.description && (
              <span
                className={cn(
                  "mt-0.5 block text-xs",
                  selected ? "text-primary-foreground/85" : "text-muted-foreground"
                )}
              >
                {option.description}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
