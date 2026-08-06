"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

export async function getBunnyVideoUrl(videoId: string, lessonId: string) {
  try {
    const supabase = createClient();

    const { data: lesson } = await supabase
      .from("lessons")
      .select("course_id, is_preview")
      .eq("id", lessonId)
      .single();

    if (!lesson) throw new Error("Bài học không tồn tại");

    let hasAccess = false;
    if (lesson.is_preview) {
      hasAccess = true;
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Chưa đăng nhập");

      const { data: enrollment } = await supabase
        .from("enrollments")
        .select("id")
        .eq("user_id", user.id)
        .eq("course_id", lesson.course_id)
        .eq("status", "ACTIVE")
        .single();

      if (enrollment) {
        hasAccess = true;
      } else {
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .single();
        if (roleData && ["super_admin", "content_admin", "instructor", "support"].includes(roleData.role)) {
          hasAccess = true;
        }
      }
    }

    if (!hasAccess) {
      throw new Error("Bạn không có quyền truy cập video bài học này");
    }

    const libraryId = process.env.BUNNY_STREAM_LIBRARY_ID || "718961";
    const tokenKey = process.env.BUNNY_TOKEN_AUTHENTICATION_KEY || "59de0e0f-78e0-4cae-91a9-e68a6de6a5f9";
    
    const expires = Math.floor(Date.now() / 1000) + 3600;
    const input = tokenKey + videoId + expires;
    const token = crypto.createHash("sha256").update(input).digest("hex");

    const embedUrl = `https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}?token=${token}&expires=${expires}`;
    
    return { success: true, embedUrl };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// Helper check role permission
async function requireRole(allowedRoles: string[]) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Chưa đăng nhập");

  const { data: roleData } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  const userRole = roleData?.role;
  if (!userRole || !allowedRoles.includes(userRole)) {
    throw new Error("Không có quyền thực hiện thao tác này");
  }

  return user;
}

// Helper insert audit log
async function writeAuditLog(actorId: string, action: string, type: string, id: string, oldData: any = null, newData: any = null) {
  const adminSupabase = createAdminClient();
  await adminSupabase.from("audit_logs").insert({
    actor_id: actorId,
    action,
    entity_type: type,
    entity_id: id,
    old_data: oldData,
    new_data: newData,
  });
}

// --- Courses actions ---

export async function createCourse(data: any) {
  try {
    const user = await requireRole(["super_admin", "content_admin"]);
    const supabase = createClient();

    const { data: course, error } = await supabase
      .from("courses")
      .insert({
        title: data.title,
        slug: data.slug,
        short_description: data.subtitle || "",
        description: data.description || "",
        thumbnail_url: data.thumbnailUrl,
        category: data.category,
        original_price: data.price || 0,
        sale_price: data.salePrice || 0,
        status: "draft",
        created_by: user.id,
      })
      .select()
      .single();

    if (error || !course) {
      return { success: false, error: "Đường dẫn slug đã tồn tại hoặc dữ liệu không hợp lệ." };
    }

    await writeAuditLog(user.id, "CREATE_COURSE", "course", course.id, null, course);
    revalidatePath("/admin/courses");
    return { success: true, course };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updateCourse(courseId: string, data: any) {
  try {
    const user = await requireRole(["super_admin", "content_admin", "instructor"]);
    const supabase = createClient();

    // Get old data for audit log
    const { data: oldCourse } = await supabase.from("courses").select().eq("id", courseId).single();

    const { data: updatedCourse, error } = await supabase
      .from("courses")
      .update({
        title: data.title,
        slug: data.slug,
        short_description: data.subtitle || data.short_description,
        description: data.description,
        thumbnail_url: data.thumbnailUrl || data.thumbnail_url,
        intro_video_id: data.previewVideoUrl || data.intro_video_id,
        category: data.category,
        original_price: data.price !== undefined ? data.price : data.original_price,
        sale_price: data.salePrice !== undefined ? data.salePrice : data.sale_price,
        status: data.status,
        access_duration_days: data.accessDurationDays !== undefined ? data.accessDurationDays : data.access_duration_days,
        certificate_enabled: data.enableCertificate !== undefined ? data.enableCertificate : data.certificate_enabled,
        completion_percentage: data.completionPercentRequired !== undefined ? data.completionPercentRequired : data.completion_percentage,
        updated_at: new Date().toISOString(),
      })
      .eq("id", courseId)
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    await writeAuditLog(user.id, "UPDATE_COURSE", "course", courseId, oldCourse, updatedCourse);
    revalidatePath(`/admin/courses/${courseId}`);
    return { success: true, course: updatedCourse };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function softDeleteCourse(courseId: string) {
  try {
    const user = await requireRole(["super_admin"]);
    const supabase = createClient();

    const { error } = await supabase
      .from("courses")
      .update({
        deleted_at: new Date().toISOString(),
        status: "archived",
      })
      .eq("id", courseId);

    if (error) return { success: false, error: error.message };

    await writeAuditLog(user.id, "SOFT_DELETE_COURSE", "course", courseId);
    revalidatePath("/admin/courses");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// --- Modules actions ---

export async function createModule(courseId: string, title: string, description: string, orderIndex: number) {
  try {
    const user = await requireRole(["super_admin", "content_admin", "instructor"]);
    const supabase = createClient();

    const { data: module, error } = await supabase
      .from("course_modules")
      .insert({
        course_id: courseId,
        title,
        description,
        order_index: orderIndex,
      })
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    revalidatePath(`/admin/courses/${courseId}/curriculum`);
    return { success: true, module };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updateModule(moduleId: string, title?: string, description?: string, orderIndex?: number) {
  try {
    const user = await requireRole(["super_admin", "content_admin", "instructor"]);
    const supabase = createClient();

    const updateData: any = { updated_at: new Date().toISOString() };
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (orderIndex !== undefined) updateData.order_index = orderIndex;

    const { data: module, error } = await supabase
      .from("course_modules")
      .update(updateData)
      .eq("id", moduleId)
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    return { success: true, module };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteModule(moduleId: string) {
  try {
    const user = await requireRole(["super_admin", "content_admin"]);
    const supabase = createClient();

    const { error } = await supabase.from("course_modules").delete().eq("id", moduleId);
    if (error) return { success: false, error: error.message };

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// --- Lessons actions ---

export async function createLesson(moduleId: string, courseId: string, title: string, lessonType: string, orderIndex: number) {
  try {
    const user = await requireRole(["super_admin", "content_admin", "instructor"]);
    const supabase = createClient();

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    const { data: lesson, error } = await supabase
      .from("lessons")
      .insert({
        module_id: moduleId,
        course_id: courseId,
        title,
        slug,
        lesson_type: lessonType,
        order_index: orderIndex,
        status: "draft",
      })
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    return { success: true, lesson };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updateLesson(lessonId: string, data: any) {
  try {
    const user = await requireRole(["super_admin", "content_admin", "instructor"]);
    const supabase = createClient();

    const { data: lesson, error } = await supabase
      .from("lessons")
      .update({
        title: data.title,
        slug: data.slug,
        description: data.description,
        content: data.contentMarkdown !== undefined ? data.contentMarkdown : data.content,
        duration_seconds: data.durationSeconds !== undefined ? data.durationSeconds : data.duration_seconds,
        is_preview: data.isFreePreview !== undefined ? data.isFreePreview : data.is_preview,
        is_required: data.isRequired !== undefined ? data.isRequired : data.is_required,
        video_provider: data.video?.provider || data.video_provider,
        video_id: data.video?.externalId || data.video_id,
        video_status: data.video?.status || data.video_status,
        status: data.status,
        order_index: data.orderIndex !== undefined ? data.orderIndex : (data.order_index !== undefined ? data.order_index : undefined),
        module_id: data.moduleId || undefined,
        updated_at: new Date().toISOString(),
      })
      .eq("id", lessonId)
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    return { success: true, lesson };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteLesson(lessonId: string) {
  try {
    const user = await requireRole(["super_admin", "content_admin"]);
    const supabase = createClient();

    const { error } = await supabase.from("lessons").delete().eq("id", lessonId);
    if (error) return { success: false, error: error.message };

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// --- Fetch Helpers for Data Loading ---

export async function getCoursesList() {
  const supabase = createClient();
  const { data } = await supabase
    .from("courses")
    .select(`
      *,
      course_modules (
        id,
        lessons (
          id
        )
      )
    `)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  return data || [];
}

export async function getCourseWithCurriculum(courseId: string) {
  const supabase = createClient();
  const { data: course } = await supabase
    .from("courses")
    .select(`
      *,
      course_modules (
        *,
        lessons (
          *
        )
      )
    `)
    .eq("id", courseId)
    .single();

  return course;
}

export async function getLessonWithDetails(lessonId: string) {
  const supabase = createClient();
  const { data: lesson, error } = await supabase
    .from("lessons")
    .select(`
      *,
      lesson_resources (*),
      transcript_segments (*),
      checklist_items (*),
      quizzes (
        *,
        quiz_questions (
          *,
          quiz_options (*)
        )
      ),
      assignments (*),
      access_rules!access_rules_lesson_id_fkey (*)
    `)
    .eq("id", lessonId)
    .single();

  if (error) {
    console.error("Error querying lesson with details:", error);
  }

  return lesson;
}

export async function reorderLessons(lessonIds: string[]) {
  try {
    const user = await requireRole(["super_admin", "content_admin", "instructor"]);
    const supabase = createClient();

    const promises = lessonIds.map((id, index) =>
      supabase.from("lessons").update({ order_index: index }).eq("id", id)
    );
    await Promise.all(promises);

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function reorderModules(moduleIds: string[]) {
  try {
    const user = await requireRole(["super_admin", "content_admin", "instructor"]);
    const supabase = createClient();

    const promises = moduleIds.map((id, index) =>
      supabase.from("course_modules").update({ order_index: index }).eq("id", id)
    );
    await Promise.all(promises);

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function getCourseByIdOrSlug(idOrSlug: string) {
  const supabase = createClient();
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);

  let query = supabase.from("courses").select("*").is("deleted_at", null);

  if (isUuid) {
    query = query.eq("id", idOrSlug);
  } else {
    query = query.eq("slug", idOrSlug);
  }

  const { data: course } = await query.maybeSingle();
  return course;
}

export async function createOrder(data: {
  courseId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  amount: number;
}) {
  try {
    const supabase = createClient();
    const randomCode = "KP" + Math.floor(10000 + Math.random() * 90000);

    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        code: randomCode,
        course_id: data.courseId,
        customer_name: data.customerName,
        customer_email: data.customerEmail,
        customer_phone: data.customerPhone,
        amount: data.amount,
        status: "pending",
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, order };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
