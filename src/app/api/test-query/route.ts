import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createClient();
  const { data: lesson } = await supabase
    .from("lessons")
    .select("id, video_id, video_provider")
    .eq("id", "33333333-3333-3333-3333-333333333331")
    .single();

  return NextResponse.json({
    lesson
  });
}
