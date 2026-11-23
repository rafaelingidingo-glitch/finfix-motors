import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
};

/** Consistent premium section header with brand-red eyebrow. */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" ? "mx-auto text-center" : "text-left",
        className
      )}
    >
      {eyebrow && (
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand">{eyebrow}</p>
      )}
      <h2 className="mt-3 font-display text-2xl font-bold uppercase tracking-tight text-foreground sm:text-3xl lg:text-4xl">
        {title}
      </h2>
      <div
        className={cn(
          "mt-4 h-0.5 w-14 rounded-full bg-brand",
          align === "center" && "mx-auto"
        )}
        aria-hidden="true"
      />
      {description && <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">{description}</p>}
    </div>
  );
}
