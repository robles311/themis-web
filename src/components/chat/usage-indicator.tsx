"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Scale, Zap, AlertCircle, Loader2 } from "lucide-react";

type UsageData = {
  plan: "free" | "pro";
  used: number;
  limit: number | null;
  allowed: boolean;
};

export function UsageIndicator() {
  const [data, setData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/usage")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => setData(json))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2">
        <Loader2 className="h-3 w-3 animate-spin text-gray-400" />
        <span className="text-xs text-gray-400">Cargando...</span>
      </div>
    );
  }

  if (!data) return null;

  if (data.plan === "pro") {
    return (
      <div className="flex items-center gap-2 px-3 py-2">
        <div className="flex items-center gap-1.5 rounded-full bg-black/5 px-2.5 py-1">
          <Zap className="h-3 w-3 text-black" />
          <span className="text-[11px] font-medium text-black">Pro</span>
        </div>
      </div>
    );
  }

  const percentage = data.limit ? Math.min(100, Math.round((data.used / data.limit) * 100)) : 0;
  const remaining = data.limit ? data.limit - data.used : 0;
  const isLow = remaining <= 5;

  return (
    <Link
      href="/pricing"
      className={`mx-3 mb-2 block rounded-lg border p-3 transition-colors hover:bg-gray-50 ${
        isLow ? "border-amber-200 bg-amber-50" : "border-gray-200"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-gray-700">
          {isLow ? (
            <span className="flex items-center gap-1 text-amber-700">
              <AlertCircle className="h-3 w-3" />
              {remaining === 0 ? "Sin consultas" : `${remaining} consultas`}
            </span>
          ) : (
            `${remaining} consultas disponibles`
          )}
        </span>
        <Scale className="h-3 w-3 text-gray-400" />
      </div>

      {/* Progress bar */}
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className={`h-full rounded-full transition-all ${
            isLow ? "bg-amber-500" : "bg-black"
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <p className="mt-1.5 text-[10px] font-medium text-gray-500">
        {isLow ? "Actualiza a Pro →" : `${data.used}/${data.limit} usadas`}
      </p>
    </Link>
  );
}
