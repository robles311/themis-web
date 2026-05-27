import Link from "next/link";
import { Scale, ArrowRight } from "lucide-react";
import { AmbientBackground } from "@/components/marketing/ambient-background";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-white">
      <AmbientBackground />

      <header className="sticky top-0 z-50 border-b border-black/[0.06] bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <Scale className="h-6 w-6 text-black" strokeWidth={1.8} />
            <span className="font-serif text-lg font-semibold tracking-tight text-black">
              Themis
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden text-sm font-medium text-gray-700 transition-colors hover:text-black sm:inline-flex"
            >
              Ingresar
            </Link>
            <a
              href="#registro"
              className="inline-flex items-center gap-2 rounded-full border-2 border-black bg-black px-5 py-2.5 text-sm font-semibold tracking-wide text-white shadow-[0_4px_14px_0_rgba(0,0,0,0.1)] transition-all hover:-translate-y-0.5 hover:bg-white hover:text-black hover:shadow-[0_6px_20px_0_rgba(0,0,0,0.2)]"
            >
              Registrarse
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1">{children}</main>

      <footer className="relative z-10 border-t border-black/10 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 text-xs text-gray-500 sm:flex-row lg:px-8">
          <p>
            &copy; {new Date().getFullYear()} Themis Legal Tech. Todos los
            derechos reservados.
          </p>
          <div className="flex items-center gap-6">
            <span className="inline-flex items-center gap-1.5">
              Hecho con <Scale className="h-3.5 w-3.5" /> en Chile
            </span>
            <Link href="/pricing" className="transition-colors hover:text-black">
              Planes
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
