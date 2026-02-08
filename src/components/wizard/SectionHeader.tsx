export function SectionHeader({
  title,
  description,
  accentBorder = true,
}: {
  title: string;
  description?: string;
  accentBorder?: boolean;
}) {
  return (
    <div className={accentBorder ? "border-l-2 border-accent-primary pl-2" : undefined}>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {description ? (
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      ) : null}
    </div>
  );
}
