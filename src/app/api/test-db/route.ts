import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = createClient();
    
    // Check connection by fetching public courses count
    const { data, error, count } = await supabase
      .from("courses")
      .select("id", { count: "exact" });

    if (error) {
      return NextResponse.json({
        connected: false,
        message: "Kết nối Supabase thất bại. Bảng 'courses' có thể chưa được tạo hoặc RLS chặn.",
        error: error
      }, { status: 500 });
    }

    return NextResponse.json({
      connected: true,
      message: "Kết nối Supabase thành công và truy vấn được bảng courses!",
      coursesCount: count || 0,
      data
    });
  } catch (err: any) {
    return NextResponse.json({
      connected: false,
      message: "Lỗi bất ngờ xảy ra khi kết nối database.",
      error: err.message
    }, { status: 500 });
  }
}
