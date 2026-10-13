/**
 * Script cấp tài khoản học viên & gửi mail kích hoạt cho khóa học Facebook Ads
 * Chạy lệnh: node --env-file=.env.local scripts/provision-facebook-students.mjs
 */

import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const SUPABASE_URL = process.env.SUPABASE_URL || "https://vaatyjrttjsdpajeswsy.supabase.co";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
const RESEND_API_KEY = process.env.RESEND_API_KEY;

if (!SERVICE_KEY) {
  console.error("Lỗi: Không tìm thấy SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Danh sách email học viên cần cấp (Anh Kiên có thể thêm vào đây)
const STUDENTS_LIST = [
  { email: "p.hoaithu@gmail.com", fullName: "p.hoaithu" },
  { email: "vanthuan239@gmail.com", fullName: "vanthuan239" },
  { email: "louisle.wedding@gmail.com", fullName: "louisle.wedding" },
];

const FB_COURSE_ID = "c9f7e347-a8f6-487f-b1d1-347c5452b5f6";
const APP_URL = "https://hoc.kienpro.vn";

async function main() {
  console.log("=== BẮT ĐẦU CẤP QUYỀN HỌC VIÊN KHÓA FACEBOOK ADS ===");

  if (STUDENTS_LIST.length === 0) {
    console.log("Danh sách STUDENTS_LIST đang trống. Vui lòng thêm email vào mảng STUDENTS_LIST trong file này hoặc dùng giao diện Admin trên web: /admin/students");
    return;
  }

  const { data: course, error: cErr } = await supabase
    .from("courses")
    .select("id, title, slug")
    .eq("id", FB_COURSE_ID)
    .single();

  if (cErr || !course) {
    console.error("Lỗi tìm khóa học:", cErr);
    return;
  }

  console.log(`Khóa học: ${course.title} (${course.id})`);
  console.log(`Số lượng học viên: ${STUDENTS_LIST.length}`);

  for (const st of STUDENTS_LIST) {
    const email = st.email.trim().toLowerCase();
    const fullName = st.fullName || email.split("@")[0];

    try {
      console.log(`\n--- Đang xử lý: ${email} (${fullName}) ---`);

      // 1. Kiểm tra profile
      let userId;
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, email, full_name, is_activated")
        .eq("email", email)
        .maybeSingle();

      if (profile) {
        userId = profile.id;
        console.log(`✓ Tìm thấy tài khoản sẵn có: ${userId}`);
      } else {
        const tempPassword = crypto.randomBytes(16).toString("hex");
        const { data: newUser, error: createErr } = await supabase.auth.admin.createUser({
          email,
          password: tempPassword,
          email_confirm: true,
          user_metadata: { full_name: fullName },
        });

        if (createErr) {
          const { data: listData } = await supabase.auth.admin.listUsers();
          const found = listData?.users.find((u) => u.email?.toLowerCase() === email);
          if (found) {
            userId = found.id;
          } else {
            throw createErr;
          }
        } else {
          userId = newUser.user.id;
        }

        await supabase.from("profiles").upsert({
          id: userId,
          full_name: fullName,
          email,
          is_activated: false,
          updated_at: new Date().toISOString(),
        });
        console.log(`✓ Đã tạo tài khoản mới: ${userId}`);
      }

      // 2. Gán role
      await supabase.from("user_roles").upsert({
        user_id: userId,
        role: "student",
      });

      // 3. Cấp enrollment
      await supabase.from("enrollments").upsert({
        user_id: userId,
        course_id: FB_COURSE_ID,
        status: "ACTIVE",
      });
      console.log("✓ Đã kích hoạt enrollment khóa học");

      // 4. Token & Email
      const isActivated = profile?.is_activated ?? false;
      if (!isActivated) {
        const token = crypto.randomBytes(32).toString("hex");
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);

        await supabase.from("activation_tokens").insert({
          user_id: userId,
          token,
          expires_at: expiresAt.toISOString(),
        });

        const activationLink = `${APP_URL}/activate-account?token=${token}`;
        console.log(`✓ Link kích hoạt: ${activationLink}`);

        if (RESEND_API_KEY) {
          const emailHtml = `
            <div style="background-color: #09090b; color: #ffffff; padding: 40px; font-family: Arial, sans-serif; border: 1px solid #d4af37; border-radius: 12px; max-width: 600px; margin: 0 auto;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h2 style="color: #d4af37; margin: 0; font-size: 24px; font-weight: bold; letter-spacing: 1px;">KIENPRO LMS</h2>
                <p style="color: #a1a1aa; font-size: 11px; margin-top: 5px;">HỌC TẬP THỰC CHIẾN - TỰ ĐỘNG HÓA SỰ NGHIỆP</p>
              </div>
              <h3 style="color: #ffffff; border-bottom: 1px solid #27272a; padding-bottom: 10px;">Xin chào ${fullName},</h3>
              <p style="line-height: 1.6; color: #e4e4e7;">Tài khoản học viên của bạn đã được kích hoạt sẵn khóa học:</p>
              <div style="background-color: #18181b; border-left: 4px solid #d4af37; padding: 15px; margin: 25px 0; border-radius: 0 8px 8px 0;">
                <strong style="color: #d4af37; font-size: 16px;">${course.title}</strong>
              </div>
              <p style="line-height: 1.6; color: #e4e4e7;">Vui lòng bấm vào nút bên dưới để đặt mật khẩu cá nhân lần đầu và bắt đầu học ngay:</p>
              <div style="text-align: center; margin: 35px 0;">
                <a href="${activationLink}" style="background-color: #d4af37; color: #000000; padding: 14px 36px; text-decoration: none; font-weight: bold; border-radius: 6px; font-size: 14px; display: inline-block;">KÍCH HOẠT TÀI KHOẢN VÀ VÀO HỌC</a>
              </div>
              <div style="border-top: 1px solid #27272a; padding-top: 20px; margin-top: 40px; font-size: 11px; color: #71717a; text-align: center;">
                <p>Mọi thắc mắc liên hệ Zalo: 0961831111 | Email: info@kienpro.vn</p>
                <p>© 2026 KIENPRO LMS. Thương hiệu Kiên Pro.</p>
              </div>
            </div>
          `;

          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
              from: "KIENPRO LMS <info@kienpro.vn>",
              to: email,
              subject: `[KIENPRO LMS] 🎓 Kích hoạt tài khoản & Vào học: ${course.title}`,
              html: emailHtml,
            }),
          });
          console.log("✓ Đã gửi email kích hoạt qua Resend thành công");
        }
      } else {
        console.log("✓ Tài khoản này đã kích hoạt từ trước, đã cấp thêm khóa học thành công.");
      }
    } catch (err) {
      console.error(`✗ Lỗi xử lý ${email}:`, err.message);
    }
  }

  console.log("\n=== HOÀN TẤT QUÁ TRÌNH CẤP QUYỀN ===");
}

main();
