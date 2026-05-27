"use client";

import { useState, createContext, useContext, useCallback, type ReactNode } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  Scale,
  LogOut,
  Menu,
  X,
  Plus,
  MessageSquare,
  Trash2,
  ChevronDown,
} from "lucide-react";
import { SPECIALTY_LIST, specialtyDisplayName, type SpecialtyId } from "@/lib/specialties";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type Conversation = {
  id: string;
  title: string;
  specialty: SpecialtyId;
  messages: Message[];
};

interface ChatContextType {
  conversations: Conversation[];
  activeId: string | null;
  setActiveId: (id: string) => void;
  addMessage: (convId: string, msg: Message) => void;
  updateLastMessage: (convId: string, content: string) => void;
  newConversation: (specialty?: SpecialtyId) => void;
  deleteConversation: (id: string) => void;
  setConversationSpecialty: (convId: string, specialty: SpecialtyId) => void;
}

const ChatContext = createContext<ChatContextType>({} as ChatContextType);

export function useChat() {
  return useContext(ChatContext);
}

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  const newConversation = useCallback((specialty: SpecialtyId = "CIVIL") => {
    const id = Date.now().toString();
    const conv: Conversation = {
      id,
      title: "Nueva consulta",
      specialty,
      messages: [],
    };
    setConversations((prev) => [conv, ...prev]);
    setActiveId(id);
  }, []);

  const deleteConversation = useCallback((id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    setActiveId((prev) => (prev === id ? null : prev));
  }, []);

  const addMessage = useCallback((convId: string, msg: Message) => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== convId) return c;
        const updated = { ...c, messages: [...c.messages, msg] };
        // Auto-title from first user message
        if (msg.role === "user" && c.messages.length === 0) {
          updated.title = msg.content.slice(0, 50) + (msg.content.length > 50 ? "..." : "");
        }
        return updated;
      })
    );
  }, []);

  const updateLastMessage = useCallback((convId: string, content: string) => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== convId) return c;
        const msgs = [...c.messages];
        if (msgs.length > 0) {
          msgs[msgs.length - 1] = { ...msgs[msgs.length - 1], content };
        }
        return { ...c, messages: msgs };
      })
    );
  }, []);

  const setConversationSpecialty = useCallback((convId: string, specialty: SpecialtyId) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === convId ? { ...c, specialty } : c))
    );
  }, []);

  // Start first conversation if none exists
  if (conversations.length === 0 && activeId === null && typeof window !== "undefined") {
    const id = Date.now().toString();
    setConversations([{ id, title: "Nueva consulta", specialty: "CIVIL", messages: [] }]);
    setActiveId(id);
  }

  return (
    <ChatContext.Provider
      value={{
        conversations,
        activeId,
        setActiveId,
        addMessage,
        updateLastMessage,
        newConversation,
        deleteConversation,
        setConversationSpecialty,
      }}
    >
      <div className="flex h-screen overflow-hidden bg-white">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r bg-white transition-transform lg:relative lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Sidebar header */}
          <div className="flex items-center justify-between border-b px-4 py-4">
            <Link href="/" className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-black" />
              <span className="font-serif text-base font-bold text-black">
                Themis
              </span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 lg:hidden"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* New chat button */}
          <div className="px-3 py-3">
            <button
              onClick={() => { newConversation(); setSidebarOpen(false); }}
              className="flex w-full items-center gap-2 rounded-lg border border-gray-300 px-3 py-2.5 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50"
            >
              <Plus className="h-4 w-4" />
              Nuevo chat
            </button>
          </div>

          {/* Conversations list */}
          <div className="flex-1 overflow-y-auto px-3">
            {conversations.length === 0 ? (
              <p className="px-2 text-xs text-gray-400">Sin conversaciones aún</p>
            ) : (
              <div className="space-y-1">
                {conversations.map((conv) => (
                  <div
                    key={conv.id}
                    className={`group flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm cursor-pointer transition-all ${
                      activeId === conv.id
                        ? "bg-gray-100 text-black"
                        : "text-gray-600 hover:bg-gray-50 hover:text-black"
                    }`}
                    onClick={() => { setActiveId(conv.id); setSidebarOpen(false); }}
                  >
                    <MessageSquare className="h-4 w-4 flex-shrink-0" />
                    <span className="flex-1 truncate">{conv.title}</span>
                    <span className="hidden rounded bg-gray-200 px-1.5 py-0.5 text-[10px] font-medium text-gray-500 group-hover:inline-block">
                      {specialtyDisplayName(conv.specialty).slice(0, 3)}
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteConversation(conv.id); }}
                      className="hidden flex-shrink-0 rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600 group-hover:block"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar footer */}
          <div className="border-t px-4 py-4">
            {session?.user ? (
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-black">
                    {session.user.name || session.user.email}
                  </p>
                  <p className="truncate text-xs text-gray-500">
                    {session.user.email}
                  </p>
                </div>
                <Link
                  href="/api/auth/signout"
                  className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-black"
                >
                  <LogOut className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex w-full items-center justify-center rounded-lg border border-black px-4 py-2 text-sm font-semibold text-black hover:bg-gray-100"
              >
                Ingresar
              </Link>
            )}
          </div>
        </aside>

        {/* Main content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Mobile header */}
          <div className="flex items-center gap-3 border-b bg-white px-4 py-3 lg:hidden">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100"
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="font-serif text-sm font-bold text-black">
              Themis
            </span>
          </div>
          {children}
        </div>
      </div>
    </ChatContext.Provider>
  );
}
