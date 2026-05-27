import { ArrowRight } from "lucide-react";

export function FinalCta() {
  return (
    <section className="relative mx-auto w-full max-w-6xl px-6 py-24 lg:px-8">
      <div
        className="relative overflow-hidden rounded-3xl border border-black/10 bg-white/90 px-8 py-16 text-center shadow-[0_20px_60px_0_rgba(0,0,0,0.08)] backdrop-blur-2xl sm:px-16"
        style={{ WebkitBackdropFilter: "blur(40px)" }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          <div
            className="absolute rounded-full blur-3xl"
            style={{
              top: "-30%",
              left: "50%",
              transform: "translateX(-50%)",
              width: "60%",
              height: "120%",
              opacity: 0.25,
              background:
                "radial-gradient(circle, rgba(0,0,0,0.18) 0%, transparent 70%)",
            }}
          />
        </div>

        <div className="relative">
          <h2 className="font-serif text-[clamp(1.9rem,4vw,3rem)] font-semibold tracking-tight text-black">
            Transforma la práctica legal hoy
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-gray-600">
            No te quedes atrás. Sé de los primeros en probar la IA que está
            redefiniendo cómo se ejerce el derecho en Chile. Registra tu correo
            institucional para reservar tu cupo.
          </p>
          <a
            href="#registro"
            className="mt-8 inline-flex items-center gap-2 rounded-full border-2 border-black bg-black px-7 py-3.5 text-sm font-semibold tracking-wide text-white shadow-[0_4px_14px_0_rgba(0,0,0,0.1)] transition-all hover:-translate-y-0.5 hover:bg-white hover:text-black hover:shadow-[0_6px_20px_0_rgba(0,0,0,0.2)]"
          >
            Asegurar mi acceso anticipado
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
