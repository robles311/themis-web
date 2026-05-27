"use client";

import { useState, type FormEvent } from "react";
import { Lock, ArrowRight, Loader2 } from "lucide-react";

const ENDPOINT =
  "https://lavenderblush-opossum-832563.hostingersite.com/api/register.php";
const REDIRECT_BASE = "https://lavenderblush-opossum-832563.hostingersite.com";

export function WaitlistForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const inputClass =
    "w-full rounded-full border px-5 py-3.5 text-sm text-black outline-none transition-all placeholder:text-gray-500 focus:ring-2";

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    setSubmitting(true);
    setMessage(null);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    const redirectTo = `${REDIRECT_BASE}/survey.html?email=${encodeURIComponent(
      trimmedEmail,
    )}&name=${encodeURIComponent(trimmedName)}`;

    try {
      await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ name: trimmedName, email: trimmedEmail }),
        mode: "no-cors",
      });
    } catch {
      // Ignored on purpose — we redirect either way.
    }

    setMessage("✓ Registrado con éxito. Redirigiendo…");
    window.location.href = redirectTo;
  }

  return (
    <div
      id="registro"
      className="rounded-2xl border border-black/10 bg-white/90 p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.08)] backdrop-blur-2xl"
      style={{ WebkitBackdropFilter: "blur(40px)" }}
    >
      <form
        onSubmit={handleSubmit}
        method="POST"
        action={ENDPOINT}
        className="flex flex-col gap-3"
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre completo"
            required
            autoComplete="name"
            className={inputClass}
            style={{
              backgroundColor: "rgba(0,0,0,0.02)",
              borderColor: "rgba(0,0,0,0.1)",
            }}
          />
          <input
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Correo institucional"
            required
            autoComplete="email"
            className={inputClass}
            style={{
              backgroundColor: "rgba(0,0,0,0.02)",
              borderColor: "rgba(0,0,0,0.1)",
            }}
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-black bg-black px-7 py-3 text-sm font-semibold tracking-wide text-white shadow-[0_4px_14px_0_rgba(0,0,0,0.1)] transition-all hover:-translate-y-0.5 hover:bg-white hover:text-black hover:shadow-[0_6px_20px_0_rgba(0,0,0,0.2)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-themis-spin" />
              Registrando…
            </>
          ) : (
            <>
              Unirme a la lista de espera
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      {message && (
        <p className="mt-3 text-sm font-medium text-emerald-600">{message}</p>
      )}

      <p className="mt-4 flex items-center gap-2 text-xs text-gray-500">
        <Lock className="h-3.5 w-3.5" />
        Sin spam. Solo te avisaremos cuando la beta privada esté lista.
      </p>
    </div>
  );
}
