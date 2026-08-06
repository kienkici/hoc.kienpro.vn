import Link from "next/link";
import { TrendingUp, Users, ShoppingCart, BookOpen, Plus, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatisticCard } from "@/components/admin/StatisticCard";
import { Button } from "@/components/ui/button";
import { MOCK_DASHBOARD_STATS, MOCK_ORDERS } from "@/lib/mock-data";
import { MOCK_ADMIN_COURSES } from "@/lib/admin-mock-data";
import { formatCurrency } from "@/lib/utils";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { MockBanner } from "@/components/admin/MockBanner";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Tổng Quan Hệ Thống Admin"
        description="Báo cáo doanh thu, học viên và quản lý khóa học của Kiên Pro."
      >
        <Button variant="gold" size="sm" asChild>
          <Link href="/admin/courses/new">
            <Plus className="w-4 h-4 mr-1.5" /> Tạo Khóa Học Mới
          </Link>
        </Button>
      </PageHeader>

      <MockBanner />

      {/* STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatisticCard
          title="Tổng doanh thu"
          value={formatCurrency(MOCK_DASHBOARD_STATS.adminTotalRevenue)}
          description="Chuyển khoản VietQR tự động"
          icon={TrendingUp}
          trend={{ value: "18.5%", isPositive: true }}
        />
        <StatisticCard
          title="Tổng học viên"
          value={MOCK_DASHBOARD_STATS.adminTotalStudents.toLocaleString("vi-VN")}
          description="Tài khoản đã kích hoạt"
          icon={Users}
          trend={{ value: "12.3%", isPositive: true }}
        />
        <StatisticCard
          title="Tổng đơn hàng"
          value={MOCK_DASHBOARD_STATS.adminTotalOrders}
          description={`${MOCK_DASHBOARD_STATS.adminPendingOrders} đơn chờ thanh toán`}
          icon={ShoppingCart}
          trend={{ value: "5.2%", isPositive: true }}
        />
        <StatisticCard
          title="Tổng khóa học"
          value={MOCK_ADMIN_COURSES.length}
          description="2 xuất bản • 1 bản nháp"
          icon={BookOpen}
        />
      </div>

      {/* QUICK ACTIONS & TABLES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* COURSES LIST OVERVIEW */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
            <h3 className="text-base font-bold text-white">Khóa Học Mới Nhất</h3>
            <Button variant="ghost" size="sm" asChild className="text-xs text-gold-400">
              <Link href="/admin/courses">Xem tất cả ({MOCK_ADMIN_COURSES.length}) <ArrowRight className="w-3.5 h-3.5 ml-1" /></Link>
            </Button>
          </div>

          <div className="space-y-3">
            {MOCK_ADMIN_COURSES.map((course) => (
              <div key={course.id} className="flex items-center justify-between p-3 rounded-lg bg-zinc-950 border border-zinc-800">
                <div className="flex items-center gap-3 min-w-0">
                  <img src={course.thumbnailUrl} alt={course.title} className="w-12 h-10 rounded object-cover border border-zinc-800" />
                  <div className="min-w-0">
                    <h4 className="text-xs font-semibold text-white truncate">{course.title}</h4>
                    <p className="text-[11px] text-zinc-400">{formatCurrency(course.salePrice)} • {course.studentCount} học viên</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={course.status} />
                  <Button variant="outline" size="sm" asChild className="text-xs">
                    <Link href={`/admin/courses/${course.id}`}>Sửa</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RECENT ORDERS OVERVIEW */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
            <h3 className="text-base font-bold text-white">Đơn Hàng Vừa Nhận Webhook</h3>
            <Button variant="ghost" size="sm" asChild className="text-xs text-gold-400">
              <Link href="/admin/orders">Xem tất cả <ArrowRight className="w-3.5 h-3.5 ml-1" /></Link>
            </Button>
          </div>

          <div className="space-y-3">
            {MOCK_ORDERS.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-zinc-950 border border-zinc-800 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="text-gold-400 font-mono">{order.orderCode}</strong>
                    <span className="text-zinc-300">{order.customerName}</span>
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-0.5">{order.customerEmail} • {order.createdAt}</p>
                </div>
                <div className="text-right">
                  <div className="font-bold text-white">{formatCurrency(order.totalAmount)}</div>
                  <span className={`text-[10px] font-semibold ${order.status === 'PAID' ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
