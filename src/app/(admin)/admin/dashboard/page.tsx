"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TrendingUp, Users, ShoppingCart, BookOpen, Plus, ArrowRight, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatisticCard } from "@/components/admin/StatisticCard";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function AdminDashboardPage() {
  const [timeRange, setTimeRange] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  
  // Dashboard statistics states
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalStudents: 0,
    totalOrders: 0,
    pendingOrdersCount: 0,
  });
  
  const [courses, setCourses] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  const getDateRange = (range: string) => {
    const now = new Date();
    let startDate: Date | null = null;
    let endDate: Date | null = null;

    switch (range) {
      case "today":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        break;
      case "yesterday":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59, 999);
        break;
      case "7days":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
        break;
      case "30days":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29);
        break;
      case "this_month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "last_month":
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
        break;
      default:
        startDate = null;
        endDate = null;
    }

    return { startDate, endDate };
  };

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { startDate, endDate } = getDateRange(timeRange);

      // Build dynamic queries with time filters
      let ordersQuery = supabase.from("orders").select("*, courses(title)");
      let profilesQuery = supabase.from("profiles").select("*");

      if (startDate) {
        ordersQuery = ordersQuery.gte("created_at", startDate.toISOString());
        profilesQuery = profilesQuery.gte("created_at", startDate.toISOString());
      }
      if (endDate) {
        ordersQuery = ordersQuery.lte("created_at", endDate.toISOString());
        profilesQuery = profilesQuery.lte("created_at", endDate.toISOString());
      }

      // Run parallel queries
      const [ordersRes, profilesRes, coursesRes, enrollmentsRes] = await Promise.all([
        ordersQuery.order("created_at", { ascending: false }),
        profilesQuery,
        supabase.from("courses").select("*").order("created_at", { ascending: false }),
        supabase.from("enrollments").select("id, course_id")
      ]);

      if (ordersRes.error) throw ordersRes.error;
      if (profilesRes.error) throw profilesRes.error;
      if (coursesRes.error) throw coursesRes.error;

      const ordersData = ordersRes.data || [];
      const profilesData = profilesRes.data || [];
      const coursesData = coursesRes.data || [];
      const enrollmentsData = enrollmentsRes.data || [];

      // Calculate stats based on fetched data
      const paidOrders = ordersData.filter((o) => o.status === "paid");
      const pendingOrders = ordersData.filter((o) => o.status === "pending");
      
      const calculatedRevenue = paidOrders.reduce((sum, o) => sum + Number(o.amount), 0);

      setStats({
        totalRevenue: calculatedRevenue,
        totalStudents: profilesData.length,
        totalOrders: ordersData.length,
        pendingOrdersCount: pendingOrders.length,
      });

      // Map courses list with dynamic enrollment counts
      const mappedCourses = coursesData.map((course) => {
        const studentCount = enrollmentsData.filter((e) => e.course_id === course.id).length;
        return {
          id: course.id,
          title: course.title,
          thumbnailUrl: course.thumbnail_url || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800",
          salePrice: Number(course.sale_price),
          status: course.status,
          studentCount,
        };
      });
      setCourses(mappedCourses);

      // Get 5 most recent orders in selected timeframe
      setRecentOrders(ordersData.slice(0, 5));

    } catch (err) {
      console.error("Lỗi đồng bộ dữ liệu dashboard:", err);
      toast.error("Không tải được dữ liệu thống kê tổng quan.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Tổng Quan Hệ Thống Admin"
        description="Báo cáo doanh thu, học viên và quản lý khóa học của Kiên Pro."
      >
        <div className="flex items-center gap-3">
          {/* Time range selector dropdown */}
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-gold-500 font-semibold cursor-pointer"
          >
            <option value="all">Tất cả thời gian</option>
            <option value="today">Hôm nay</option>
            <option value="yesterday">Hôm qua</option>
            <option value="7days">7 ngày qua</option>
            <option value="30days">30 ngày qua</option>
            <option value="this_month">Tháng này</option>
            <option value="last_month">Tháng trước</option>
          </select>

          <Button variant="gold" size="sm" asChild>
            <Link href="/admin/courses/new">
              <Plus className="w-4 h-4 mr-1.5" /> Tạo Khóa Học Mới
            </Link>
          </Button>
        </div>
      </PageHeader>

      {isLoading ? (
        <div className="flex justify-center items-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-gold-400" />
        </div>
      ) : (
        <>
          {/* STATS GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatisticCard
              title="Tổng doanh thu"
              value={formatCurrency(stats.totalRevenue)}
              description="Chuyển khoản VietQR tự động"
              icon={TrendingUp}
            />
            <StatisticCard
              title="Tổng học viên"
              value={stats.totalStudents.toLocaleString("vi-VN")}
              description="Tài khoản đăng ký mới"
              icon={Users}
            />
            <StatisticCard
              title="Tổng đơn hàng"
              value={stats.totalOrders.toLocaleString("vi-VN")}
              description={`${stats.pendingOrdersCount} đơn chờ thanh toán`}
              icon={ShoppingCart}
            />
            <StatisticCard
              title="Tổng khóa học"
              value={courses.length}
              description={`${courses.filter(c => c.status === 'published').length} xuất bản • ${courses.filter(c => c.status === 'draft').length} bản nháp`}
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
                  <Link href="/admin/courses">
                    Xem tất cả ({courses.length}) <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Link>
                </Button>
              </div>

              <div className="space-y-3">
                {courses.length === 0 ? (
                  <p className="text-xs text-zinc-500 text-center py-6">Chưa có khóa học nào.</p>
                ) : (
                  courses.slice(0, 3).map((course) => (
                    <div key={course.id} className="flex items-center justify-between p-3 rounded-lg bg-zinc-950 border border-zinc-800">
                      <div className="flex items-center gap-3 min-w-0">
                        <img 
                          src={course.thumbnailUrl} 
                          alt={course.title} 
                          className="w-12 h-10 rounded object-cover border border-zinc-800" 
                        />
                        <div className="min-w-0">
                          <h4 className="text-xs font-semibold text-white truncate">{course.title}</h4>
                          <p className="text-[11px] text-zinc-400">
                            {formatCurrency(course.salePrice)} • {course.studentCount} học viên
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={course.status} />
                        <Button variant="outline" size="sm" asChild className="text-xs">
                          <Link href={`/admin/courses/${course.id}`}>Sửa</Link>
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* RECENT ORDERS OVERVIEW */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                <h3 className="text-base font-bold text-white">Đơn Hàng Vừa Nhận Webhook</h3>
                <Button variant="ghost" size="sm" asChild className="text-xs text-gold-400">
                  <Link href="/admin/orders">
                    Xem tất cả <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Link>
                </Button>
              </div>

              <div className="space-y-3">
                {recentOrders.length === 0 ? (
                  <p className="text-xs text-zinc-500 text-center py-6">Không có đơn hàng nào trong mốc thời gian này.</p>
                ) : (
                  recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-zinc-950 border border-zinc-800 text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-gold-400 font-mono">{order.code}</strong>
                          <span className="text-zinc-300">{order.customer_name}</span>
                        </div>
                        <p className="text-[11px] text-zinc-500 mt-0.5">
                          {order.customer_email} • {new Date(order.created_at).toLocaleString("vi-VN")}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-white">{formatCurrency(Number(order.amount))}</div>
                        <span className={`text-[10px] font-semibold uppercase ${order.status === 'paid' ? 'text-emerald-400' : order.status === 'pending' ? 'text-amber-400' : 'text-red-400'}`}>
                          {order.status === 'paid' ? 'Đã thanh toán' : order.status === 'pending' ? 'Chờ QR' : order.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
