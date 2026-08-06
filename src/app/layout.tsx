import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import { APP_CONFIG } from "@/lib/constants";

const inter = Inter({ subsets: ["vietnamese", "latin"] });

export const metadata: Metadata = {
  title: {
    default: `${APP_CONFIG.name} - ${APP_CONFIG.slogan}`,
    template: `%s | ${APP_CONFIG.name}`,
  },
  description: "Nền tảng đào tạo kỹ năng, thiết kế website AI & kinh doanh trực tuyến cao cấp thuộc thương hiệu Kiên Pro.",
  keywords: ["KIENPRO LMS", "Kiên Pro", "Khóa học AI", "Thiết kế Website AI", "LMS Vietnam"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="dark scroll-smooth">
      <body className={`${inter.className} bg-background text-foreground min-h-screen flex flex-col`}>
        {children}
      </body>
    </html>
  );
}
