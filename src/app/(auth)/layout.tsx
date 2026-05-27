import { Scale } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white p-6">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <Scale className="h-8 w-8 text-black" />
            <span className="font-serif text-xl font-bold text-black">
              Themis
            </span>
          </Link>
        </div>
        <div className="rounded-2xl border bg-white p-8 shadow-sm">
          {children}
        </div>
      </div>
    </div>
  );
}
