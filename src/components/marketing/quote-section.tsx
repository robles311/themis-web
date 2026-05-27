export function QuoteSection() {
  return (
    <section className="relative mx-auto w-full max-w-5xl px-6 py-24 lg:px-8">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none font-serif leading-none"
        style={{
          fontSize: "clamp(12rem, 22vw, 22rem)",
          color: "rgba(0,0,0,0.025)",
        }}
      >
        &ldquo;
      </span>
      <div className="relative mx-auto max-w-3xl text-center">
        <blockquote
          className="font-serif italic leading-[1.4] text-black"
          style={{ fontSize: "clamp(1.4rem,3.2vw,2.2rem)" }}
        >
          &ldquo;La inteligencia artificial no reemplazará al abogado, pero el
          abogado que use inteligencia artificial eventualmente reemplazará al
          que no la use.&rdquo;
        </blockquote>
        <cite className="mt-7 inline-flex items-center justify-center gap-2.5 text-[12px] font-medium uppercase not-italic tracking-[1px] text-black">
          <span className="inline-block h-px w-6 bg-black/10" />
          Adaptado de Richard Susskind — &ldquo;Tomorrow&rsquo;s Lawyers&rdquo;
          <span className="inline-block h-px w-6 bg-black/10" />
        </cite>
      </div>
    </section>
  );
}
