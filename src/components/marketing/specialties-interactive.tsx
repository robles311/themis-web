"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import {
  specialtyKeys,
  specialtyMaterials,
  type SpecialtyKey,
} from "./data";

export function SpecialtiesInteractive() {
  const [active, setActive] = useState<SpecialtyKey>("civil");
  const [fading, setFading] = useState(false);

  function handleSelect(key: SpecialtyKey) {
    if (key === active) return;
    setFading(true);
    setTimeout(() => {
      setActive(key);
      setFading(false);
    }, 150);
  }

  const data = specialtyMaterials[active];

  return (
    <section
      id="especialidades"
      className="relative mx-auto w-full max-w-7xl px-6 py-24 lg:px-8"
    >
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="font-serif text-[clamp(1.8rem,3.5vw,2.6rem)] font-semibold tracking-tight text-black">
          Especialidades entrenadas
        </h2>
        <p className="mt-4 text-lg leading-relaxed text-gray-600">
          Themis cuenta con una base de conocimiento estructurada por ramas del
          derecho chileno. Selecciona una rama para ver qué material domina.
        </p>
      </div>

      <div className="mt-14 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          {specialtyKeys.map((key) => {
            const isActive = key === active;
            return (
              <button
                key={key}
                type="button"
                onMouseEnter={() => handleSelect(key)}
                onClick={() => handleSelect(key)}
                className={[
                  "flex w-full items-center justify-between rounded-2xl border bg-white/90 px-5 py-4 text-left text-sm font-medium text-black backdrop-blur-2xl transition-all duration-300",
                  isActive
                    ? "translate-x-1 border-black/25 bg-black/5"
                    : "border-black/10 hover:translate-x-1 hover:border-black/25 hover:bg-black/5",
                ].join(" ")}
                style={{ WebkitBackdropFilter: "blur(40px)" }}
              >
                <span>{specialtyMaterials[key].title}</span>
                <span
                  className={[
                    "inline-block h-1.5 w-1.5 rounded-full transition-all",
                    isActive
                      ? "bg-black shadow-[0_0_6px_rgba(0,0,0,0.4)]"
                      : "bg-gray-400",
                  ].join(" ")}
                />
              </button>
            );
          })}
        </div>

        <div
          className="rounded-2xl border border-black/10 bg-white/90 p-7 shadow-[0_8px_32px_0_rgba(0,0,0,0.06)] backdrop-blur-2xl transition-all duration-200"
          style={{
            WebkitBackdropFilter: "blur(40px)",
            opacity: fading ? 0.3 : 1,
            transform: fading ? "translateY(4px)" : "translateY(0)",
          }}
        >
          <div className="mb-6">
            <span className="inline-flex items-center rounded-full border border-black/10 bg-black/[0.04] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[1.5px] text-gray-700">
              {data.category}
            </span>
            <h3 className="mt-3 font-serif text-2xl font-semibold text-black">
              {data.title}
            </h3>
          </div>

          <ul className="flex flex-col gap-4">
            {data.items.map((item) => (
              <li key={item.title} className="flex gap-3">
                <div className="mt-0.5 flex h-7 w-7 flex-none items-center justify-center rounded-full bg-black/[0.04] text-black">
                  <CheckCircle2 className="h-4 w-4" strokeWidth={1.8} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-black">
                    {item.title}
                  </h4>
                  <p className="mt-1 text-sm leading-relaxed text-gray-600">
                    {item.desc}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
