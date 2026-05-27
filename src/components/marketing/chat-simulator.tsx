"use client";

import { useEffect, useRef, useState } from "react";
import { Scale, PlusCircle, Send } from "lucide-react";
import { chatData } from "./data";

type Message =
  | { kind: "user"; text: string; id: number }
  | { kind: "assistant"; text: string; citation: string; id: number }
  | { kind: "typing"; id: number };

function formatAssistantText(text: string) {
  const withBold = text.replace(
    /\*\*(.*?)\*\*/g,
    (_m, inner) => `<strong>${inner}</strong>`,
  );
  return withBold
    .split("\n")
    .map((line) => line.replace(/^\* /, "• "))
    .join("<br/>");
}

export function ChatSimulator() {
  const [messages, setMessages] = useState<Message[]>([]);
  const bodyRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    let chatIndex = 0;

    const sleep = (ms: number) =>
      new Promise<void>((resolve) => {
        const t = setTimeout(resolve, ms);
        if (cancelled) clearTimeout(t);
      });

    const nextId = () => ++idRef.current;

    async function loop() {
      while (!cancelled) {
        const item = chatData[chatIndex];

        await sleep(1500);
        if (cancelled) return;
        setMessages((prev) => [
          ...prev,
          { kind: "user", text: item.question, id: nextId() },
        ]);

        await sleep(1000);
        if (cancelled) return;
        const typingId = nextId();
        setMessages((prev) => [...prev, { kind: "typing", id: typingId }]);

        await sleep(2500);
        if (cancelled) return;
        setMessages((prev) => [
          ...prev.filter((m) => m.id !== typingId),
          {
            kind: "assistant",
            text: item.answer,
            citation: item.citation,
            id: nextId(),
          },
        ]);

        await sleep(6500);
        if (cancelled) return;
        setMessages((prev) => (prev.length > 5 ? [] : prev));

        chatIndex = (chatIndex + 1) % chatData.length;
      }
    }

    loop();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  return (
    <div
      className="flex h-[520px] flex-col overflow-hidden rounded-2xl border border-black/10 bg-white/90 shadow-[0_8px_32px_0_rgba(0,0,0,0.08)] backdrop-blur-2xl"
      style={{ WebkitBackdropFilter: "blur(40px)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-black/10 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-white">
            <Scale className="h-4 w-4" />
          </div>
          <div className="leading-tight">
            <h4 className="text-sm font-semibold text-black">Themis IA</h4>
            <span className="flex items-center gap-1.5 text-[11px] text-gray-500">
              <span className="inline-block h-1.5 w-1.5 animate-themis-pulse rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
              Especialista Chileno
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-black/15" />
          <span className="h-2 w-2 rounded-full bg-black/15" />
          <span className="h-2 w-2 rounded-full bg-black/15" />
        </div>
      </div>

      {/* Body */}
      <div
        ref={bodyRef}
        className="flex flex-1 flex-col gap-4 overflow-y-auto bg-white/30 p-5"
      >
        {messages.map((m) => {
          if (m.kind === "user") {
            return (
              <div
                key={m.id}
                className="animate-themis-fade-in max-w-[85%] self-end rounded-2xl rounded-br-[4px] bg-black px-4 py-3 text-[13px] leading-relaxed text-white"
              >
                {m.text}
              </div>
            );
          }
          if (m.kind === "typing") {
            return (
              <div
                key={m.id}
                className="animate-themis-fade-in max-w-[85%] self-start rounded-2xl rounded-bl-[4px] border border-black/10 bg-black/[0.03] px-4 py-3"
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className="animate-themis-typing inline-block h-1.5 w-1.5 rounded-full bg-gray-500"
                    style={{ animationDelay: "-0.32s" }}
                  />
                  <span
                    className="animate-themis-typing inline-block h-1.5 w-1.5 rounded-full bg-gray-500"
                    style={{ animationDelay: "-0.16s" }}
                  />
                  <span className="animate-themis-typing inline-block h-1.5 w-1.5 rounded-full bg-gray-500" />
                </div>
              </div>
            );
          }
          return (
            <div
              key={m.id}
              className="animate-themis-fade-in max-w-[85%] self-start rounded-2xl rounded-bl-[4px] border border-black/10 bg-black/[0.03] px-4 py-3 text-[13px] leading-relaxed text-gray-900"
            >
              <div
                dangerouslySetInnerHTML={{ __html: formatAssistantText(m.text) }}
              />
              <div className="mt-2.5">
                <span className="inline-flex items-center gap-1 rounded border border-black/10 bg-black/[0.05] px-1.5 py-0.5 text-[10px] font-medium text-black">
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  {m.citation}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="flex items-center gap-2 border-t border-black/10 bg-white/60 px-4 py-3">
        <div className="flex flex-1 items-center gap-2 rounded-full border border-black/10 bg-black/[0.02] px-4 py-2 text-xs text-gray-500">
          <PlusCircle className="h-3.5 w-3.5" />
          <span>Escribe tu consulta legal aquí…</span>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-white">
          <Send className="h-3.5 w-3.5" />
        </div>
      </div>
    </div>
  );
}
