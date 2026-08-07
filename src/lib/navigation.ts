export interface NavItem {
  title: string;
  href: string;
  icon?: string;
  badge?: string;
}

export const STUDENT_NAV_ITEMS: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
  { title: "Khóa học của tôi", href: "/my-courses", icon: "BookOpen" },
  { title: "Ghi chú bài học", href: "/notes", icon: "FileText" },
  { title: "Tài nguyên đã lưu", href: "/resources", icon: "Bookmark" },
  { title: "Hồ sơ cá nhân", href: "/profile", icon: "User" },
  { title: "Hỗ trợ & Trợ giúp", href: "/support", icon: "HelpCircle" },
];

export const ADMIN_NAV_ITEMS: NavItem[] = [
  { title: "Tổng quan", href: "/admin/dashboard", icon: "TrendingUp" },
  { title: "Quản lý Khóa học", href: "/admin/courses", icon: "BookMarked" },
  { title: "Thư viện Media", href: "/admin/media", icon: "FileVideo" },
  { title: "Quản lý Học viên", href: "/admin/students", icon: "Users" },
  { title: "Quản lý Đơn hàng", href: "/admin/orders", icon: "ShoppingCart" },
  { title: "Cấu hình Hệ thống", href: "/admin/settings", icon: "Settings" },
];

export const PUBLIC_NAV_ITEMS: NavItem[] = [
  { title: "Trang chủ", href: "/" },
  { title: "Khóa học", href: "/#courses" },
  { title: "Về Kiên Pro", href: "/#about" },
  { title: "Hỏi đáp (FAQ)", href: "/#faq" },
];
