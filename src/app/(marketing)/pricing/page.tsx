import Link from "next/link";
import { Scale } from "lucide-react";

export default function PricingPage() {
  return (
    <section className="mx-auto max-w-2xl px-6 py-24 text-center lg:px-8">
      <Scale className="mx-auto h-12 w-12 text-gray-300" />
      <h1 className="mt-6 font-serif text-3xl font-bold tracking-tight text-black sm:text-4xl">
        Próximamente
      </h1>
      <p className="mt-4 text-lg text-gray-500">
        Los planes de suscripción de Themis estarán disponibles cuando 
        lancemos la versión beta. Si quieres acceder cuando esté listo, 
        regístrate en la lista de espera.
      </p>
      <a
        href="https://lavenderblush-opossum-832563.hostingersite.com"
        className="mt-8 inline-flex items-center gap-2 rounded-lg bg-black px-8 py-3.5 text-base font-semibold text-white shadow-sm transition-all hover:bg-gray-800"
      >
        Lista de espera
      </a>
    </section>
  );
}
