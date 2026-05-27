"use client";

import { useState, useRef, useEffect, type FormEvent } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useChat } from "../layout";
import { SPECIALTY_LIST, specialtyDisplayName, type SpecialtyId } from "@/lib/specialties";
import {
  Send,
  Loader2,
  AlertCircle,
  Sparkles,
  User,
  ChevronDown,
  Scale,
  Paperclip,
  X,
  FileText,
} from "lucide-react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function ChatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const {
    conversations,
    activeId,
    setActiveId,
    addMessage,
    updateLastMessage,
    newConversation,
    setConversationSpecialty,
  } = useChat();

  const activeConv = conversations.find((c) => c.id === activeId);
  const messages = activeConv?.messages || [];
  const currentSpecialty = activeConv?.specialty || "CIVIL";

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSpecialties, setShowSpecialties] = useState(false);
  const [attachedFile, setAttachedFile] = useState<{
    name: string;
    text: string;
  } | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Close specialty dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowSpecialties(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Handle file selection and upload
  async function handleFileSelect(file: File) {
    if (uploading) return;
    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error uploading file");
      }

      const data = await res.json();
      setAttachedFile({ name: data.fileName, text: data.text });
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Error al subir archivo.";
      setError(msg);
    } finally {
      setUploading(false);
    }
  }

  // Remove attached file
  function removeFile() {
    setAttachedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  // Trigger file picker
  function openFilePicker() {
    fileInputRef.current?.click();
  }

  if (status === "loading") {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading || !activeId) return;

    const userMessage: Message = {
      role: "user",
      content: attachedFile
        ? `[Archivo adjunto: ${attachedFile.name}]\n\n${input.trim()}\n\n--- Contenido del documento ---\n${attachedFile.text}`
        : input.trim(),
    };
    addMessage(activeId, userMessage);
    setInput("");
    removeFile();
    setLoading(true);
    setError("");

    // Build message history for the API
    // IMPORTANT: Read from activeConv, not conversations state —
    // conversations is a stale closure captured at render time,
    // while addMessage() hasn't triggered a re-render yet.
    const existingMsgs = activeConv?.messages || [];
    const apiMessages = [
      ...existingMsgs.map((m: Message) => ({ role: m.role, content: m.content })),
      { role: "user" as const, content: input.trim() },
    ];

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: apiMessages,
          specialty: currentSpecialty,
        }),
      });

      if (!response.ok) {
        const errData = await response.text();
        throw new Error(errData || "Error al obtener respuesta");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No se pudo leer la respuesta");

      const decoder = new TextDecoder();
      let assistantMessage = "";

      addMessage(activeId, { role: "assistant", content: "" });

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;
            try {
              const parsed = JSON.parse(data);
              const delta = parsed.choices?.[0]?.delta?.content;
              if (delta) {
                assistantMessage += delta;
                updateLastMessage(activeId, assistantMessage);
              }
            } catch {
              assistantMessage += data;
              updateLastMessage(activeId, assistantMessage);
            }
          }
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al comunicarse con el servidor.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  // Empty state
  if (!activeConv || messages.length === 0) {
    return (
      <div className="flex flex-1 flex-col">
        {/* Chat header with specialty selector */}
        <div className="border-b bg-white px-6 py-4">
          <div className="flex items-center gap-4">
            <h1 className="font-serif text-lg font-semibold text-black">
              Consulta legal
            </h1>
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowSpecialties(!showSpecialties)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                <Scale className="h-3 w-3" />
                {specialtyDisplayName(currentSpecialty)}
                <ChevronDown className="h-3 w-3" />
              </button>
              {showSpecialties && (
                <div className="absolute left-0 top-full z-50 mt-1 w-48 rounded-lg border bg-white py-1 shadow-lg">
                  {SPECIALTY_LIST.map((spec) => (
                    <button
                      key={spec.id}
                      onClick={() => {
                        setConversationSpecialty(activeId!, spec.id);
                        setShowSpecialties(false);
                      }}
                      className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors ${
                        currentSpecialty === spec.id
                          ? "bg-gray-100 font-medium text-black"
                          : "text-gray-600 hover:bg-gray-50 hover:text-black"
                      }`}
                    >
                      <Scale className="h-3.5 w-3.5" />
                      {spec.displayName}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Empty state */}
        <div className="flex flex-1 items-center justify-center px-6">
          <div className="max-w-md text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border bg-gray-50">
              <Scale className="h-8 w-8 text-gray-400" />
            </div>
            <h2 className="font-serif text-xl font-semibold text-black">
              ¿En qué puedo ayudarte?
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Escribe tu consulta legal abajo. Puedes cambiar de especialista en cualquier momento
              usando el selector de especialidad.
            </p>
          </div>
        </div>

        {/* Chat input */}
        <ChatInput
          input={input}
          setInput={setInput}
          loading={loading}
          handleSubmit={handleSubmit}
          disabled={!activeId}
          attachedFile={attachedFile}
          uploading={uploading}
          onFileSelect={handleFileSelect}
          onRemoveFile={removeFile}
          onOpenFilePicker={openFilePicker}
          fileInputRef={fileInputRef as React.RefObject<HTMLInputElement | null>}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      {/* Chat header */}
      <div className="border-b bg-white px-6 py-4">
        <div className="flex items-center gap-4">
          <h1 className="font-serif text-lg font-semibold text-black">
            {activeConv.title}
          </h1>
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowSpecialties(!showSpecialties)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              <Scale className="h-3 w-3" />
              {specialtyDisplayName(currentSpecialty)}
              <ChevronDown className="h-3 w-3" />
            </button>
            {showSpecialties && (
              <div className="absolute left-0 top-full z-50 mt-1 w-48 rounded-lg border bg-white py-1 shadow-lg">
                {SPECIALTY_LIST.map((spec) => (
                  <button
                    key={spec.id}
                    onClick={() => {
                      setConversationSpecialty(activeId!, spec.id);
                      setShowSpecialties(false);
                    }}
                    className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors ${
                      currentSpecialty === spec.id
                        ? "bg-gray-100 font-medium text-black"
                        : "text-gray-600 hover:bg-gray-50 hover:text-black"
                    }`}
                  >
                    <Scale className="h-3.5 w-3.5" />
                    {spec.displayName}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 lg:px-6">
        <div className="mx-auto max-w-3xl space-y-6">
          {messages.map((message, i) => (
            <div
              key={i}
              className={`flex gap-4 ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {message.role === "assistant" && (
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border">
                  <Scale className="h-4 w-4 text-gray-600" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-5 py-3 text-sm leading-relaxed ${
                  message.role === "user"
                    ? "bg-black text-white"
                    : "border bg-white text-black"
                }`}
              >
                {message.content || (
                  <span className="inline-flex items-center gap-1 text-gray-400">
                    Pensando
                    <span className="inline-flex">
                      <span className="animate-bounce">.</span>
                      <span className="animate-bounce [animation-delay:0.2s]">.</span>
                      <span className="animate-bounce [animation-delay:0.4s]">.</span>
                    </span>
                  </span>
                )}
              </div>
              {message.role === "user" && (
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-black text-white">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mx-auto flex w-full max-w-3xl items-center gap-2 px-6 pb-2">
          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-xs text-red-600">
            <AlertCircle className="h-3.5 w-3.5" />
            {error}
          </div>
        </div>
      )}

      {/* Chat input */}
      <ChatInput
        input={input}
        setInput={setInput}
        loading={loading}
        handleSubmit={handleSubmit}
        attachedFile={attachedFile}
        uploading={uploading}
        onFileSelect={handleFileSelect}
        onRemoveFile={removeFile}
        onOpenFilePicker={openFilePicker}
        fileInputRef={fileInputRef as React.RefObject<HTMLInputElement | null>}
      />
    </div>
  );
}

function ChatInput({
  input,
  setInput,
  loading,
  handleSubmit,
  disabled,
  attachedFile,
  uploading,
  onFileSelect,
  onRemoveFile,
  onOpenFilePicker,
  fileInputRef,
}: {
  input: string;
  setInput: (v: string) => void;
  loading: boolean;
  handleSubmit: (e: FormEvent) => Promise<void>;
  disabled?: boolean;
  attachedFile: { name: string; text: string } | null;
  uploading: boolean;
  onFileSelect: (file: File) => void;
  onRemoveFile: () => void;
  onOpenFilePicker: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}) {
  return (
    <div className="border-t bg-white px-4 py-4 lg:px-6">
      <form
        onSubmit={handleSubmit}
        className="mx-auto flex max-w-3xl items-end gap-3"
      >
        <div className="relative flex-1">
          {/* File attachment badge */}
          {attachedFile && (
            <div className="mb-2 flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5">
              <FileText className="h-3.5 w-3.5 flex-shrink-0 text-gray-500" />
              <span className="flex-1 truncate text-xs font-medium text-gray-700">
                {attachedFile.name}
              </span>
              <button
                type="button"
                onClick={onRemoveFile}
                className="flex-shrink-0 rounded p-0.5 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="Escribe tu consulta legal aquí..."
            rows={1}
            disabled={loading || uploading}
            className="min-h-[48px] w-full resize-none rounded-xl border border-gray-300 bg-white px-4 py-3 pr-12 text-sm text-black placeholder:text-gray-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black disabled:opacity-50"
          />
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.doc,.txt,.md"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                onFileSelect(file);
              }
              // Reset so the same file can be re-selected
              e.target.value = "";
            }}
          />
          {/* Attachment button */}
          <button
            type="button"
            onClick={onOpenFilePicker}
            disabled={loading || uploading}
            className="absolute bottom-2.5 right-3 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
            title="Adjuntar archivo"
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Paperclip className="h-4 w-4" />
            )}
          </button>
        </div>
        <button
          type="submit"
          disabled={disabled || !input.trim() || loading || uploading}
          className="flex h-[48px] w-[48px] flex-shrink-0 items-center justify-center rounded-xl bg-black text-white shadow-sm transition-all hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </button>
      </form>
    </div>
  );
}
