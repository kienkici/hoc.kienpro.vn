import Link from "next/link";
import { Logo } from "@/components/shared/Logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 p-4 relative overflow-hidden">
      {/* Background Gradient Effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gold-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-8 relative z-10">
        <div className="flex justify-center">
          <Logo />
        </div>
        {children}
        <div className="text-center text-xs text-zinc-500">
          © {new Date().getFullYear()} KIENPRO LMS. All rights reserved.
        </div>
      </div>
    </div>
  );
}
