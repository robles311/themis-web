"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Lock,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Moon,
  Sun,
  LogOut,
} from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  // Profile form
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Password form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Dark mode toggle (UI only)
  const [darkMode, setDarkMode] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Populate name from session
  useEffect(() => {
    if (session?.user?.name) {
      setName(session.user.name);
    }
  }, [session]);

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

  async function handleSaveProfile(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setProfileMessage(null);

    try {
      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al guardar perfil");
      }

      setProfileMessage({ type: "success", text: "Nombre actualizado correctamente" });

      // Update session to reflect new name
      await update();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error desconocido";
      setProfileMessage({ type: "error", text: msg });
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword(e: FormEvent) {
    e.preventDefault();
    setPasswordMessage(null);

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: "error", text: "Las contraseñas no coinciden" });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMessage({
        type: "error",
        text: "La contraseña debe tener al menos 6 caracteres",
      });
      return;
    }

    if (!currentPassword) {
      setPasswordMessage({ type: "error", text: "Debes ingresar tu contraseña actual" });
      return;
    }

    setChangingPassword(true);

    try {
      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al cambiar contraseña");
      }

      setPasswordMessage({ type: "success", text: "Contraseña actualizada correctamente" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error desconocido";
      setPasswordMessage({ type: "error", text: msg });
    } finally {
      setChangingPassword(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <div className="mx-auto w-full max-w-2xl px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-serif text-2xl font-bold text-black">Configuración</h1>
          <p className="mt-1 text-sm text-gray-500">
            Administra tu perfil y preferencias de cuenta
          </p>
        </div>

        <div className="space-y-8">
          {/* === Profile Section === */}
          <section className="rounded-xl border bg-white">
            <div className="border-b px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-black">Perfil</h2>
                  <p className="text-xs text-gray-500">Tu información personal</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="px-6 py-5">
              <div className="space-y-5">
                {/* Name */}
                <div>
                  <label
                    htmlFor="name"
                    className="mb-1.5 block text-xs font-medium text-gray-700"
                  >
                    Nombre
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-black placeholder:text-gray-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                    placeholder="Tu nombre"
                  />
                </div>

                {/* Email (read-only) */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-1.5 block text-xs font-medium text-gray-700"
                  >
                    Correo electrónico
                  </label>
                  <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-500">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span>{session?.user?.email || "—"}</span>
                  </div>
                  <p className="mt-1 text-xs text-gray-400">
                    El correo no se puede modificar
                  </p>
                </div>

                {/* Message */}
                {profileMessage && (
                  <div
                    className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs ${
                      profileMessage.type === "success"
                        ? "border border-green-200 bg-green-50 text-green-700"
                        : "border border-red-200 bg-red-50 text-red-600"
                    }`}
                  >
                    {profileMessage.type === "success" ? (
                      <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                    )}
                    {profileMessage.text}
                  </div>
                )}

                {/* Save button */}
                <button
                  type="submit"
                  disabled={saving || !name.trim()}
                  className="inline-flex items-center gap-2 rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Guardar cambios
                </button>
              </div>
            </form>
          </section>

          {/* === Password Section === */}
          <section className="rounded-xl border bg-white">
            <div className="border-b px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border bg-gray-50">
                  <Lock className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-black">Contraseña</h2>
                  <p className="text-xs text-gray-500">Cambia tu contraseña de acceso</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleChangePassword} className="px-6 py-5">
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="currentPassword"
                    className="mb-1.5 block text-xs font-medium text-gray-700"
                  >
                    Contraseña actual
                  </label>
                  <input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-black placeholder:text-gray-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <label
                    htmlFor="newPassword"
                    className="mb-1.5 block text-xs font-medium text-gray-700"
                  >
                    Nueva contraseña
                  </label>
                  <input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-black placeholder:text-gray-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-1.5 block text-xs font-medium text-gray-700"
                  >
                    Confirmar nueva contraseña
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-black placeholder:text-gray-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                    placeholder="Repite la contraseña"
                  />
                </div>

                {/* Message */}
                {passwordMessage && (
                  <div
                    className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs ${
                      passwordMessage.type === "success"
                        ? "border border-green-200 bg-green-50 text-green-700"
                        : "border border-red-200 bg-red-50 text-red-600"
                    }`}
                  >
                    {passwordMessage.type === "success" ? (
                      <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                    )}
                    {passwordMessage.text}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={changingPassword || !currentPassword || !newPassword || !confirmPassword}
                  className="inline-flex items-center gap-2 rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {changingPassword ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Lock className="h-4 w-4" />
                  )}
                  Cambiar contraseña
                </button>
              </div>
            </form>
          </section>

          {/* === Appearance Section === */}
          <section className="rounded-xl border bg-white">
            <div className="border-b px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border bg-gray-50">
                  {darkMode ? (
                    <Moon className="h-5 w-5 text-gray-600" />
                  ) : (
                    <Sun className="h-5 w-5 text-gray-600" />
                  )}
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-black">Apariencia</h2>
                  <p className="text-xs text-gray-500">Personaliza la interfaz</p>
                </div>
              </div>
            </div>

            <div className="px-6 py-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-black">Modo oscuro</p>
                  <p className="text-xs text-gray-500">
                    Cambia entre tema claro y oscuro
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setDarkMode(!darkMode)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    darkMode ? "bg-black" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${
                      darkMode ? "translate-x-[22px]" : "translate-x-[2px]"
                    }`}
                  />
                </button>
              </div>
            </div>
          </section>

          {/* === Session Section === */}
          <section className="rounded-xl border bg-white">
            <div className="px-6 py-5">
              <Link
                href="/api/auth/signout"
                className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-black"
              >
                <LogOut className="h-4 w-4" />
                Cerrar sesión
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
