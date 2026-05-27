import { WaitlistForm } from "./waitlist-form";
import { ChatSimulator } from "./chat-simulator";

export function HeroSection() {
  return (
    <section className="relative mx-auto w-full max-w-7xl px-6 pt-16 pb-24 sm:pt-20 lg:px-8 lg:pt-28">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <span className="mb-7 inline-flex items-center gap-2 rounded-full border border-gray-300 bg-gray-100 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[1.5px] text-black">
            <span className="inline-block h-1.5 w-1.5 animate-themis-pulse rounded-full bg-black shadow-[0_0_8px_rgba(0,0,0,0.3)]" />
            Pronto
          </span>
          <h1 className="font-serif text-[clamp(2.4rem,5vw,3.8rem)] font-semibold leading-[1.05] tracking-tight text-black">
            Tu copiloto legal
            <br />
            con inteligencia <em className="italic font-medium">artificial</em>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-gray-600">
            Especializado en derecho chileno. Resuelve consultas complejas,
            analiza contratos, redacta recursos y encuentra jurisprudencia en
            segundos sin perder horas investigando.
          </p>

          <div className="mt-8">
            <WaitlistForm />
          </div>
        </div>

        <div>
          <ChatSimulator />
        </div>
      </div>
    </section>
  );
}
