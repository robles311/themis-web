import { Scale } from "lucide-react";

export default function RegisterPage() {
  return (
    <div>
      <div className="mb-6 text-center">
        <Scale className="mx-auto h-10 w-10 text-gray-300" />
        <h1 className="mt-4 font-serif text-2xl font-bold text-black">
          Registro cerrado
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          El registro en Themis está actualmente cerrado. Estamos en fase de 
          desarrollo y solo estamos aceptando inscripciones a través de 
          nuestra lista de espera.
        </p>
      </div>

      <a
        href="https://lavenderblush-opossum-832563.hostingersite.com"
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-gray-800"
      >
        Ir a la lista de espera
      </a>

      <p className="mt-6 text-center text-sm text-gray-500">
        ¿Ya tienes una cuenta?{" "}
        <a
          href="/login"
          className="font-medium text-black underline hover:text-gray-600"
        >
          Inicia sesión
        </a>
      </p>
    </div>
  );
}
