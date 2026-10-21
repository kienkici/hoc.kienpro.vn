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
      <div className="w-9 h-9 rounded-xl bg-[#0071e3] flex items-center justify-center shadow-md shadow-[#0071e3]/20 group-hover:scale-105 transition-transform duration-200">
        <GraduationCap className="w-5 h-5 text-white" />
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className="font-bold text-base leading-tight tracking-wide text-white group-hover:text-[#2997ff] transition-colors">
            KIENPRO <span className="text-[#2997ff]">LMS</span>
          </span>
          <span className="text-[9px] uppercase tracking-widest text-zinc-500 font-medium">
            Kiên Pro Brand
          </span>
        </div>
      )}
    </Link>
  );
}
