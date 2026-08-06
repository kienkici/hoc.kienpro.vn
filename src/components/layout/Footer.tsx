import Link from "next/link";
import { Logo } from "@/components/shared/Logo";
import { APP_CONFIG } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="border-t border-zinc-800/80 bg-zinc-950 text-zinc-400 text-sm py-12 px-4">
      <div className="container max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-4 md:col-span-2">
          <Logo />
          <p className="text-sm text-zinc-400 max-w-sm">
            {APP_CONFIG.slogan}. Tự động hóa đào tạo, bảo mật cao cấp và tối ưu trải nghiệm học tập tốt nhất.
          </p>
          <div className="text-xs text-zinc-500">
            © {new Date().getFullYear()} KIENPRO LMS. All rights reserved. Brand: Kiên Pro.
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Khóa học</h4>
          <ul className="space-y-2 text-xs">
            <li><Link href="/#courses" className="hover:text-gold-400">Thiết kế Website AI 2026</Link></li>
            <li><Link href="/#courses" className="hover:text-gold-400">Masterclass AI Marketing</Link></li>
            <li><Link href="/#courses" className="hover:text-gold-400">Tự động hóa VietQR Webhook</Link></li>
          </ul>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Hỗ trợ</h4>
          <ul className="space-y-2 text-xs">
            <li>Email: <span className="text-white">{APP_CONFIG.supportEmail}</span></li>
            <li>Hotline / Zalo: <span className="text-white">{APP_CONFIG.supportPhone}</span></li>
            <li><Link href="/support" className="hover:text-gold-400">Trung tâm Hỗ trợ Học viên</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
