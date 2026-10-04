interface LegalSection {
  heading: string;
  body: string[];
}

export function LegalContent({ updated, sections }: { updated: string; sections: LegalSection[] }) {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-32 sm:px-6 lg:px-8">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary/80">Last updated {updated}</p>
      <div className="mt-10 flex flex-col gap-10">
        {sections.map((s) => (
          <section key={s.heading}>
            <h2 className="font-display text-xl">{s.heading}</h2>
            <div className="mt-3 flex flex-col gap-3">
              {s.body.map((p, i) => (
                <p key={i} className="text-sm leading-relaxed text-muted-foreground">
                  {p}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
