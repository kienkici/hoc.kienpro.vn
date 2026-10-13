"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { provisionStudentsSchema } from "@/server/validators/student";
import { ProvisionBatchResult, ProvisionResultItem } from "@/types/student";
import crypto from "crypto";
import { revalidatePath } from "next/cache";

/**
 * Gửi email kích hoạt tài khoản kèm quyền truy cập khóa học qua Resend API
 */
async function sendActivationEmail({
  to,
  fullName,
  courseTitle,
  activationLink,
}: {
  to: string;
  fullName: string;
  courseTitle: string;
  activationLink: string;
}) {
  const emailHtml = `
    <div style="background-color: #09090b; color: #ffffff; padding: 40px; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; border: 1px solid #d4af37; border-radius: 12px; max-width: 600px; margin: 0 auto;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h2 style="color: #d4af37; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: 1.5px;">KIENPRO LMS</h2>
        <p style="color: #a1a1aa; font-size: 11px; margin-top: 6px; letter-spacing: 0.5px;">HỌC TẬP THỰC CHIẾN - TỰ ĐỘNG HÓA SỰ NGHIỆP</p>
      </div>
      
      <div style="border-top: 1px solid #27272a; border-bottom: 1px solid #27272a; padding: 20px 0; margin-bottom: 25px;">
        <h3 style="color: #ffffff; font-size: 18px; margin: 0 0 10px 0;">Xin chào ${fullName},</h3>
        <p style="line-height: 1.6; color: #e4e4e7; font-size: 14px; margin: 0;">
          Ban Quản trị KIENPRO LMS đã hoàn tất việc cấp tài khoản và kích hoạt sẵn quyền truy cập khóa học cho bạn:
        </p>
      </div>

      <div style="background-color: #18181b; border-left: 4px solid #d4af37; padding: 18px; margin: 25px 0; border-radius: 0 8px 8px 0;">
        <p style="margin: 0 0 6px 0; color: #a1a1aa; font-size: 12px; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px;">Khóa học được cấp:</p>
        <strong style="color: #d4af37; font-size: 16px; display: block; line-height: 1.4;">${courseTitle}</strong>
      </div>

      <p style="line-height: 1.6; color: #e4e4e7; font-size: 14px;">
        Để bắt đầu học tập, bạn chỉ cần bấm vào nút bên dưới để <strong>thiết lập mật khẩu cá nhân lần đầu</strong>:
      </p>
      
      <div style="text-align: center; margin: 35px 0;">
        <a href="${activationLink}" style="background-color: #d4af37; color: #000000; padding: 14px 36px; text-decoration: none; font-weight: bold; border-radius: 6px; font-size: 15px; display: inline-block; letter-spacing: 0.5px; box-shadow: 0 4px 14px rgba(212, 175, 55, 0.3);">
          KÍCH HOẠT TÀI KHOẢN VÀ VÀO HỌC NGAY
        </a>
      </div>

      <div style="background-color: #121215; border: 1px dashed #3f3f46; border-radius: 6px; padding: 12px; margin: 25px 0;">
        <p style="font-size: 12px; color: #a1a1aa; margin: 0 0 4px 0;">Đường link kích hoạt trực tiếp (hạn 30 ngày):</p>
        <a href="${activationLink}" style="color: #d4af37; text-decoration: underline; font-size: 11px; word-break: break-all;">
          ${activationLink}
        </a>
      </div>

      <div style="border-top: 1px solid #27272a; padding-top: 20px; margin-top: 35px; font-size: 11px; color: #71717a; text-align: center; line-height: 1.6;">
        <p style="margin: 0 0 6px 0;">Mọi thắc mắc và hỗ trợ kỹ thuật, vui lòng liên hệ:</p>
        <p style="margin: 0; color: #a1a1aa;"><strong>Zalo hỗ trợ:</strong> 0961831111 | <strong>Email:</strong> info@kienpro.vn</p>
        <p style="margin: 15px 0 0 0; color: #52525b;">© 2026 KIENPRO LMS. Đăng ký sở hữu bởi Thương hiệu Kiên Pro.</p>
      </div>
    </div>
  `;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: "KIENPRO LMS <info@kienpro.vn>",
      to,
      subject: `[KIENPRO LMS] 🎓 Kích hoạt tài khoản & Vào học: ${courseTitle}`,
      html: emailHtml,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("Resend API error for", to, errorText);
    throw new Error(`Resend error: ${errorText}`);
  }
}

/**
 * Gửi email thông báo bổ sung khóa học cho học viên đã có tài khoản sẵn
 */
async function sendCourseAccessEmail({
  to,
  fullName,
  courseTitle,
  loginUrl,
  learnUrl,
}: {
  to: string;
  fullName: string;
  courseTitle: string;
  loginUrl: string;
  learnUrl: string;
}) {
  const emailHtml = `
    <div style="background-color: #09090b; color: #ffffff; padding: 40px; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; border: 1px solid #d4af37; border-radius: 12px; max-width: 600px; margin: 0 auto;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h2 style="color: #d4af37; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: 1.5px;">KIENPRO LMS</h2>
        <p style="color: #a1a1aa; font-size: 11px; margin-top: 6px; letter-spacing: 0.5px;">HỌC TẬP THỰC CHIẾN - TỰ ĐỘNG HÓA SỰ NGHIỆP</p>
      </div>
      
      <div style="border-top: 1px solid #27272a; border-bottom: 1px solid #27272a; padding: 20px 0; margin-bottom: 25px;">
        <h3 style="color: #ffffff; font-size: 18px; margin: 0 0 10px 0;">Xin chào ${fullName},</h3>
        <p style="line-height: 1.6; color: #e4e4e7; font-size: 14px; margin: 0;">
          Tài khoản học viên của bạn đã được kích hoạt thành công quyền truy cập vào khóa học mới:
        </p>
      </div>

      <div style="background-color: #18181b; border-left: 4px solid #d4af37; padding: 18px; margin: 25px 0; border-radius: 0 8px 8px 0;">
        <p style="margin: 0 0 6px 0; color: #a1a1aa; font-size: 12px; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px;">Khóa học mới được kích hoạt:</p>
        <strong style="color: #d4af37; font-size: 16px; display: block; line-height: 1.4;">${courseTitle}</strong>
      </div>

      <p style="line-height: 1.6; color: #e4e4e7; font-size: 14px;">
        Vì bạn đã kích hoạt tài khoản từ trước, bạn có thể đăng nhập bằng email <strong>${to}</strong> và mật khẩu hiện tại để bắt đầu học ngay.
      </p>
      
      <div style="text-align: center; margin: 35px 0;">
        <a href="${loginUrl}" style="background-color: #d4af37; color: #000000; padding: 14px 36px; text-decoration: none; font-weight: bold; border-radius: 6px; font-size: 15px; display: inline-block; letter-spacing: 0.5px; box-shadow: 0 4px 14px rgba(212, 175, 55, 0.3);">
          ĐĂNG NHẬP VÀO HỌC NGAY
        </a>
      </div>

      <div style="border-top: 1px solid #27272a; padding-top: 20px; margin-top: 35px; font-size: 11px; color: #71717a; text-align: center; line-height: 1.6;">
        <p style="margin: 0 0 6px 0;">Mọi thắc mắc và hỗ trợ kỹ thuật, vui lòng liên hệ:</p>
        <p style="margin: 0; color: #a1a1aa;"><strong>Zalo hỗ trợ:</strong> 0961831111 | <strong>Email:</strong> info@kienpro.vn</p>
        <p style="margin: 15px 0 0 0; color: #52525b;">© 2026 KIENPRO LMS. Đăng ký sở hữu bởi Thương hiệu Kiên Pro.</p>
      </div>
    </div>
  `;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: "KIENPRO LMS <info@kienpro.vn>",
      to,
      subject: `[KIENPRO LMS] 🚀 Khóa học mới đã sẵn sàng: ${courseTitle}`,
      html: emailHtml,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("Resend API error for", to, errorText);
  }
}

/**
 * Server Action: Cấp tài khoản và quyền học hàng loạt cho danh sách học viên
 */
export async function provisionStudentsBatchAction(payload: unknown): Promise<ProvisionBatchResult> {
  try {
    // 1. Kiểm tra xác thực & quyền hạn Admin
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        total: 0,
        successCount: 0,
        errorCount: 0,
        results: [],
        error: "Bạn cần đăng nhập để thực hiện thao tác này.",
      };
    }

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (!roleData || !["super_admin", "content_admin", "instructor"].includes(roleData.role)) {
      return {
        success: false,
        total: 0,
        successCount: 0,
        errorCount: 0,
        results: [],
        error: "Bạn không có quyền quản trị để thực hiện cấp tài khoản.",
      };
    }

    // 2. Validate payload qua Zod
    const validated = provisionStudentsSchema.parse(payload);
    const adminSupabase = createAdminClient();

    // 3. Lấy thông tin khóa học
    const { data: course, error: courseError } = await adminSupabase
      .from("courses")
      .select("id, title, slug")
      .eq("id", validated.courseId)
      .single();

    if (courseError || !course) {
      return {
        success: false,
        total: 0,
        successCount: 0,
        errorCount: 0,
        results: [],
        error: "Khóa học được chọn không tồn tại.",
      };
    }

    // App URL ưu tiên domain chính thức khi gửi mail
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL && !process.env.NEXT_PUBLIC_APP_URL.includes("localhost")
        ? process.env.NEXT_PUBLIC_APP_URL
        : "https://hoc.kienpro.vn";

    const results: ProvisionResultItem[] = [];
    let successCount = 0;
    let errorCount = 0;

    // 4. Xử lý từng học viên
    for (const student of validated.students) {
      const email = student.email.trim().toLowerCase();
      const fullName = student.fullName?.trim() || email.split("@")[0];
      const phone = student.phone?.trim() || null;

      try {
        let userId: string;
        let isNewAccount = false;

        // 4.1 Tra cứu profile theo email
        const { data: existingProfile } = await adminSupabase
          .from("profiles")
          .select("id, email, full_name, is_activated")
          .eq("email", email)
          .maybeSingle();

        if (existingProfile) {
          userId = existingProfile.id;
          if (student.fullName || phone) {
            await adminSupabase
              .from("profiles")
              .update({
                full_name: fullName,
                ...(phone ? { phone } : {}),
                updated_at: new Date().toISOString(),
              })
              .eq("id", userId);
          }
        } else {
          // Tạo tài khoản mới trong Auth
          const tempPassword = crypto.randomBytes(16).toString("hex");
          const { data: newUser, error: createError } = await adminSupabase.auth.admin.createUser({
            email,
            password: tempPassword,
            email_confirm: true,
            user_metadata: {
              full_name: fullName,
              phone: phone || "",
            },
          });

          if (createError) {
            // Trường hợp user đã có trong Auth nhưng chưa có trong profiles
            const { data: listData } = await adminSupabase.auth.admin.listUsers();
            const found = listData?.users.find((u) => u.email?.toLowerCase() === email);
            if (found) {
              userId = found.id;
            } else {
              throw new Error(createError.message);
            }
          } else {
            userId = newUser.user.id;
            isNewAccount = true;
          }

          // Tạo profile học viên
          await adminSupabase.from("profiles").upsert({
            id: userId,
            full_name: fullName,
            phone: phone,
            email: email,
            is_activated: false,
            updated_at: new Date().toISOString(),
          });
        }

        // 4.2 Gán vai trò học viên
        await adminSupabase.from("user_roles").upsert({
          user_id: userId,
          role: "student",
        });

        // 4.3 Cấp quyền khóa học (Enrollment)
        const { data: existingEnrollment } = await adminSupabase
          .from("enrollments")
          .select("id, status")
          .eq("user_id", userId)
          .eq("course_id", validated.courseId)
          .maybeSingle();

        const wasAlreadyEnrolled = existingEnrollment && existingEnrollment.status === "ACTIVE";

        if (!existingEnrollment) {
          await adminSupabase.from("enrollments").insert({
            user_id: userId,
            course_id: validated.courseId,
            status: "ACTIVE",
          });
        } else if (existingEnrollment.status !== "ACTIVE") {
          await adminSupabase
            .from("enrollments")
            .update({ status: "ACTIVE" })
            .eq("id", existingEnrollment.id);
        }

        // 4.4 Xử lý Token kích hoạt & Gửi Email
        let activationLink: string | undefined = undefined;
        const isActivated = existingProfile?.is_activated ?? false;

        if (!isActivated) {
          // Sinh token kích hoạt có thời hạn 30 ngày
          const token = crypto.randomBytes(32).toString("hex");
          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + 30);

          await adminSupabase.from("activation_tokens").insert({
            user_id: userId,
            token,
            expires_at: expiresAt.toISOString(),
          });

          activationLink = `${appUrl}/activate-account?token=${token}`;

          if (validated.sendEmail && process.env.RESEND_API_KEY) {
            await sendActivationEmail({
              to: email,
              fullName,
              courseTitle: course.title,
              activationLink,
            });
          }
        } else {
          // Tài khoản đã kích hoạt sẵn mật khẩu
          if (validated.sendEmail && process.env.RESEND_API_KEY) {
            await sendCourseAccessEmail({
              to: email,
              fullName,
              courseTitle: course.title,
              loginUrl: `${appUrl}/login`,
              learnUrl: `${appUrl}/learn/${course.slug}`,
            });
          }
        }

        successCount++;
        results.push({
          email,
          fullName,
          status: wasAlreadyEnrolled ? "already_enrolled" : "success",
          message: wasAlreadyEnrolled
            ? "Đã có quyền học từ trước, đã làm mới thông tin."
            : isNewAccount
            ? "Tạo tài khoản mới & cấp khóa học thành công."
            : "Đã cấp thêm khóa học vào tài khoản hiện có.",
          isNewAccount,
          activationLink,
        });
      } catch (err: any) {
        errorCount++;
        results.push({
          email,
          fullName,
          status: "error",
          message: err.message || "Lỗi không xác định khi xử lý.",
          isNewAccount: false,
        });
      }
    }

    revalidatePath("/admin/students");

    return {
      success: true,
      total: validated.students.length,
      successCount,
      errorCount,
      results,
    };
  } catch (err: any) {
    console.error("Lỗi batch provision:", err);
    return {
      success: false,
      total: 0,
      successCount: 0,
      errorCount: 0,
      results: [],
      error: err.message || "Đã xảy ra lỗi trong quá trình xử lý.",
    };
  }
}
