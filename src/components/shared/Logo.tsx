import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  href?: string;
  showText?: boolean;
}

export function Logo({ className, href = "/", showText = true }: LogoProps) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-2.5 group", className)}>
      <div className="w-10 h-10 rounded-lg bg-gold-gradient p-0.5 shadow-md shadow-gold-500/20 group-hover:scale-105 transition-transform duration-200">
        <div className="w-full h-full bg-zinc-950 rounded-[7px] flex items-center justify-center">
          <GraduationCap className="w-5 h-5 text-gold-400" />
        </div>
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className="font-bold text-lg leading-tight tracking-wider text-white group-hover:text-gold-400 transition-colors">
            KIENPRO <span className="text-gold-400">LMS</span>
          </span>
          <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-medium">
            Kiên Pro Brand
          </span>
        </div>
      )}
    </Link>
  );
}
