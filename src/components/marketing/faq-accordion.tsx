"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { faqs } from "./data";

export function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="relative mx-auto w-full max-w-3xl px-6 py-24 lg:px-8">
      <div className="text-center">
        <h2 className="font-serif text-[clamp(1.8rem,3.5vw,2.6rem)] font-semibold tracking-tight text-black">
          Preguntas frecuentes
        </h2>
        <p className="mt-4 text-lg leading-relaxed text-gray-600">
          Todo lo que necesitas saber antes de registrarte para el acceso
          anticipado.
        </p>
      </div>

      <div className="mt-12 flex flex-col gap-3">
        {faqs.map((item, idx) => {
          const isOpen = openIndex === idx;
          const panelId = `faq-panel-${idx}`;
          const btnId = `faq-btn-${idx}`;
          return (
            <div
              key={item.question}
              className={[
                "overflow-hidden rounded-2xl border bg-white transition-colors",
                isOpen
                  ? "border-black/25 bg-black/[0.015]"
                  : "border-black/10 hover:border-black/20 hover:bg-gray-50",
              ].join(" ")}
            >
              <button
                id={btnId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="flex w-full cursor-pointer items-center justify-between gap-4 px-6 py-5 text-left text-[15px] font-semibold text-black"
              >
                <span>{item.question}</span>
                <ChevronDown
                  className={[
                    "h-4 w-4 flex-none transition-transform duration-300",
                    isOpen ? "rotate-180" : "rotate-0",
                  ].join(" ")}
                />
              </button>
              <div
                id={panelId}
                role="region"
                aria-labelledby={btnId}
                className="grid transition-all duration-300"
                style={{
                  gridTemplateRows: isOpen ? "1fr" : "0fr",
                  opacity: isOpen ? 1 : 0,
                }}
              >
                <div className="overflow-hidden min-h-0">
                  <p className="px-6 pb-6 text-sm leading-relaxed text-gray-600">
                    {item.answer}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
