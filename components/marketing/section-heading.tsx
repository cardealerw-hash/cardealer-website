export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  as = "h2",
}: {
  eyebrow: string;
  title: string;
  description: string;
  align?: "left" | "center";
  as?: "h1" | "h2";
}) {
  const HeadingTag = as;

  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : ""}>
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-accent">
        {eyebrow}
      </p>
      <HeadingTag className="text-balance text-3xl font-semibold tracking-tight text-text-primary sm:text-[2.25rem]">
        {title}
      </HeadingTag>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-text-secondary sm:text-base">
        {description}
      </p>
    </div>
  );
}
