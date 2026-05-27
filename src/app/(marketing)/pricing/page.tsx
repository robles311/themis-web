"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Scale, Check, Loader2, ArrowRight, Sparkles } from "lucide-react";

const PLANS = [
  {
    id: "free",
    name: "Gratis",
    price: 0,
    currency: "CLP",
    period: "/mes",
    description: "Para empezar a probar Themis",
    features: [
      "30 consultas legales por mes",
      "Todas las especialidades",
      "Búsqueda en 1.705+ documentos legales",
      "Subida de documentos (.pdf, .docx)",
      "Respuestas con citas a artículos",
    ],
    cta: "Comenzar gratis",
    highlighted: false,
  },
  {
    id: "pro",
    name: "Themis Pro",
    price: 19000,
    currency: "CLP",
    period: "/mes",
    description: "Para abogados que trabajan con IA todos los días",
    features: [
      "Consultas legales ilimitadas",
      "Todas las especialidades",
      "Búsqueda en 1.705+ documentos legales",
      "Subida de documentos (.pdf, .docx)",
      "Respuestas con citas a artículos",
      "Prioridad en procesamiento",
      "Soporte prioritario",
    ],
    cta: "Suscribirme ahora",
    highlighted: true,
  },
];

export default function PricingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function handleSubscribe(planId: string) {
    if (planId === "free") {
      if (session) {
        router.push("/chat");
      } else {
        router.push("/login");
      }
      return;
    }

    if (status !== "authenticated") {
      router.push("/login");
      return;
    }

    setLoading(planId);
    setError("");

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "pro" }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al iniciar el pago");
      }

      // Redirigir a MercadoPago (o a dashboard en modo demo)
      if (data.demo) {
        router.push("/dashboard");
      } else {
        window.location.href = data.url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(null);
    }
  }

  function formatPrice(price: number) {
    if (price === 0) return "Gratis";
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      minimumFractionDigits: 0,
    }).format(price);
  }

  return (
    <section className="relative">
      {/* Header */}
      <div className="mx-auto max-w-7xl px-6 pt-20 pb-12 text-center lg:px-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-black/5 px-4 py-1.5 text-xs font-medium text-gray-600">
          <Sparkles className="h-3 w-3" />
          Precios simples, sin sorpresas
        </div>
        <h1 className="mt-6 font-serif text-4xl font-bold tracking-tight text-black sm:text-5xl">
          Planes para cada etapa
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-lg text-gray-500">
          Empieza gratis. Cuando necesites más, actualiza a Themis Pro por solo{" "}
          {formatPrice(19000)}/mes.
        </p>
      </div>

      {/* Plans */}
      <div className="mx-auto max-w-5xl px-6 pb-24 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2 md:items-start">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-2xl border p-8 transition-all ${
                plan.highlighted
                  ? "border-black bg-black text-white shadow-[0_8px_32px_0_rgba(0,0,0,0.12)]"
                  : "border-gray-200 bg-white text-black"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white px-3 py-1 text-xs font-semibold text-black shadow-sm">
                    <Sparkles className="h-3 w-3" />
                    Recomendado
                  </span>
                </div>
              )}

              {/* Plan title */}
              <div className="flex items-center gap-3">
                <Scale className={`h-6 w-6 ${plan.highlighted ? "text-white" : "text-black"}`} />
                <h2 className="font-serif text-xl font-semibold">{plan.name}</h2>
              </div>

              <p
                className={`mt-2 text-sm ${
                  plan.highlighted ? "text-gray-300" : "text-gray-500"
                }`}
              >
                {plan.description}
              </p>

              {/* Price */}
              <div className="mt-6">
                {plan.price === 0 ? (
                  <span className="text-4xl font-bold">Gratis</span>
                ) : (
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm font-medium text-gray-400">CLP</span>
                    <span className="text-5xl font-bold tracking-tight">
                      {plan.price.toLocaleString("es-CL")}
                    </span>
                    <span
                      className={`text-sm ${
                        plan.highlighted ? "text-gray-300" : "text-gray-500"
                      }`}
                    >
                      /mes
                    </span>
                  </div>
                )}
              </div>

              {/* Features */}
              <ul className="mt-8 flex-1 space-y-3">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check
                      className={`mt-0.5 h-4 w-4 flex-shrink-0 ${
                        plan.highlighted ? "text-white" : "text-black"
                      }`}
                    />
                    <span
                      className={`text-sm ${
                        plan.highlighted ? "text-gray-200" : "text-gray-600"
                      }`}
                    >
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <button
                onClick={() => handleSubscribe(plan.id)}
                disabled={loading !== null}
                className={`mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold transition-all ${
                  plan.highlighted
                    ? "bg-white text-black hover:bg-gray-100"
                    : "border-2 border-black bg-white text-black hover:bg-gray-50"
                } disabled:cursor-not-allowed disabled:opacity-60`}
              >
                {loading === plan.id ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    {plan.cta}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="mx-auto mt-6 max-w-md rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Payment info */}
        <div className="mx-auto mt-12 max-w-lg text-center">
          <p className="text-xs text-gray-400">
            Pagos procesados de forma segura por MercadoPago. Aceptamos tarjetas de crédito,
            débito y transferencias. Puedes cancelar tu suscripción en cualquier momento.
          </p>
        </div>
      </div>
    </section>
  );
}
