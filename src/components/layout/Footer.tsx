import Link from "next/link";
import { Logo } from "@/components/shared/Logo";
import { APP_CONFIG } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="border-t border-white/[0.08] bg-black text-[#86868b] text-xs py-16 px-4 sm:px-6">
      <div className="container max-w-6xl mx-auto space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4 md:col-span-2">
            <Logo />
            <p className="text-xs text-[#86868b] max-w-sm leading-relaxed">
              {APP_CONFIG.slogan}. Tự động hóa đào tạo, video mã hóa bản quyền và trải nghiệm tối ưu theo tiêu chuẩn công nghệ cao cấp.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Khóa học</h4>
            <ul className="space-y-2.5 text-xs text-[#86868b]">
              <li><Link href="/#courses" className="hover:text-white transition-colors">Thiết kế Website AI 2026</Link></li>
              <li><Link href="/#courses" className="hover:text-white transition-colors">Masterclass AI Marketing</Link></li>
              <li><Link href="/#courses" className="hover:text-white transition-colors">Tự động hóa VietQR Webhook</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Hỗ trợ & Liên hệ</h4>
            <ul className="space-y-2.5 text-xs text-[#86868b]">
              <li>Email: <span className="text-zinc-300">{APP_CONFIG.supportEmail}</span></li>
              <li>Hotline / Zalo: <span className="text-zinc-300">{APP_CONFIG.supportPhone}</span></li>
              <li><Link href="/support" className="hover:text-white transition-colors">Trung tâm Hỗ trợ Học viên</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-500">
          <div>
            Copyright © {new Date().getFullYear()} KIENPRO LMS. Bảo lưu mọi quyền. Thương hiệu Kiên Pro.
          </div>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="hover:text-zinc-300 transition-colors">Điều khoản dịch vụ</Link>
            <span>•</span>
            <Link href="/privacy" className="hover:text-zinc-300 transition-colors">Chính sách bảo mật</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
