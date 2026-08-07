"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { loginSchema, forgotPasswordSchema, resetPasswordSchema, activateAccountSchema } from "@/server/validators/auth";
import { revalidatePath } from "next/cache";

export async function loginAction(formData: unknown) {
  try {
    const validated = loginSchema.parse(formData);
    const supabase = createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: validated.email,
      password: validated.password,
    });

    if (error) {
      return { success: false, error: "Tài khoản hoặc mật khẩu không chính xác." };
    }

    return { success: true, user: data.user };
  } catch (err: any) {
    return { success: false, error: err.message || "Lỗi xử lý đăng nhập." };
  }
}

export async function logoutAction() {
  const supabase = createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  return { success: true };
}

export async function forgotPasswordAction(formData: unknown) {
  try {
    const validated = forgotPasswordSchema.parse(formData);
    const supabase = createClient();

    const { error } = await supabase.auth.resetPasswordForEmail(validated.email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password`,
    });

    if (error) {
      return { success: false, error: "Không gửi được email khôi phục mật khẩu." };
    }

    return { success: true, message: "Email khôi phục đã được gửi. Vui lòng kiểm tra hộp thư." };
  } catch (err: any) {
    return { success: false, error: err.message || "Lỗi xử lý yêu cầu khôi phục." };
  }
}

export async function resetPasswordAction(formData: unknown) {
  try {
    const validated = resetPasswordSchema.parse(formData);
    const supabase = createClient();

    const { error } = await supabase.auth.updateUser({
      password: validated.password,
    });

    if (error) {
      return { success: false, error: "Cập nhật mật khẩu thất bại." };
    }

    return { success: true, message: "Cập nhật mật khẩu thành công. Hãy đăng nhập bằng mật khẩu mới." };
  } catch (err: any) {
    return { success: false, error: err.message || "Lỗi xử lý đặt lại mật khẩu." };
  }
}

export async function activateAccountAction(formData: unknown) {
  try {
    const validated = activateAccountSchema.parse(formData);
    const adminSupabase = createAdminClient();

    // 1. Validate activation token in database
    const { data: tokenData, error: tokenError } = await adminSupabase
      .from("activation_tokens")
      .select("user_id, expires_at, used_at")
      .eq("token", validated.token)
      .single();

    if (tokenError || !tokenData) {
      return { success: false, error: "Mã kích hoạt không đúng hoặc đã hết hạn." };
    }

    if (tokenData.used_at) {
      return { success: false, error: "Mã kích hoạt đã được sử dụng từ trước." };
    }

    if (new Date(tokenData.expires_at) < new Date()) {
      return { success: false, error: "Mã kích hoạt này đã hết thời gian hiệu lực." };
    }

    // 2. Activate user in auth.users by updating their password
    const { error: updateError } = await adminSupabase.auth.admin.updateUserById(
      tokenData.user_id,
      { password: validated.password, email_confirm: true }
    );

    if (updateError) {
      return { success: false, error: "Kích hoạt mật khẩu thất bại." };
    }

    // 3. Mark profiles as activated & fetch profile info for welcome email
    const { data: profileData } = await adminSupabase
      .from("profiles")
      .update({ is_activated: true, updated_at: new Date().toISOString() })
      .eq("id", tokenData.user_id)
      .select("full_name, email")
      .single();

    // 4. Mark token as used
    await adminSupabase
      .from("activation_tokens")
      .update({ used_at: new Date().toISOString() })
      .eq("token", validated.token);

    // 5. Gửi email chào mừng "Kích hoạt thành công"
    if (process.env.RESEND_API_KEY && profileData?.email) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://hoc.kienpro.vn";
      const loginUrl = `${appUrl}/login`;
      const welcomeHtml = `
        <div style="background-color:#09090b;color:#ffffff;padding:40px;font-family:Arial,sans-serif;border:1px solid #d4af37;border-radius:12px;max-width:600px;margin:0 auto;">
          <div style="text-align:center;margin-bottom:30px;">
            <h2 style="color:#d4af37;margin:0;font-size:24px;font-weight:bold;letter-spacing:1px;">KIENPRO LMS</h2>
            <p style="color:#a1a1aa;font-size:12px;margin-top:5px;">HỌC TẬP THỰC CHIẾN - TỰ ĐỘNG HÓA SỰ NGHIỆP</p>
          </div>
          <div style="background:#16a34a22;border:1px solid #16a34a;border-radius:8px;padding:16px;text-align:center;margin-bottom:24px;">
            <p style="color:#4ade80;font-size:18px;font-weight:bold;margin:0;">✓ Tài khoản đã kích hoạt thành công!</p>
          </div>
          <h3 style="color:#ffffff;border-bottom:1px solid #27272a;padding-bottom:10px;">Xin chào ${profileData.full_name || "Học viên"},</h3>
          <p style="line-height:1.6;color:#e4e4e7;">Chúc mừng! Tài khoản học viên của bạn tại <strong>KIENPRO LMS</strong> đã được kích hoạt thành công. Bạn có thể đăng nhập ngay bằng email và mật khẩu vừa thiết lập để bắt đầu học tập.</p>
          <div style="text-align:center;margin:35px 0;">
            <a href="${loginUrl}" style="background-color:#d4af37;color:#000000;padding:14px 36px;text-decoration:none;font-weight:bold;border-radius:6px;font-size:15px;display:inline-block;letter-spacing:0.5px;">ĐĂNG NHẬP VÀO HỌC NGAY</a>
          </div>
          <div style="background-color:#18181b;border-left:4px solid #d4af37;padding:12px 16px;margin:20px 0;border-radius:0 8px 8px 0;">
            <p style="margin:0;color:#a1a1aa;font-size:12px;">Thông tin đăng nhập:</p>
            <p style="margin:6px 0 0;color:#ffffff;font-size:13px;"><strong>Email:</strong> ${profileData.email}</p>
            <p style="margin:4px 0 0;color:#ffffff;font-size:13px;"><strong>Mật khẩu:</strong> Mật khẩu bạn vừa thiết lập</p>
          </div>
          <p style="font-size:11px;color:#71717a;line-height:1.5;margin-top:24px;">Mọi thắc mắc vui lòng liên hệ Zalo: 0961831111 hoặc Email: info@kienpro.vn</p>
          <div style="border-top:1px solid #27272a;padding-top:16px;margin-top:32px;font-size:11px;color:#71717a;text-align:center;">
            <p>© 2026 KIENPRO LMS. Thương hiệu Kiên Pro.</p>
          </div>
        </div>
      `;

      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "KIENPRO LMS <info@kienpro.vn>",
          to: profileData.email,
          subject: "[KIENPRO LMS] 🎉 Tài khoản học tập đã được kích hoạt thành công!",
          html: welcomeHtml,
        }),
      }).catch((err) => console.error("Failed to send welcome email:", err));
    }

    return { success: true, message: "Kích hoạt tài khoản thành công! Hãy quay lại đăng nhập." };
  } catch (err: any) {
    return { success: false, error: err.message || "Lỗi xử lý kích hoạt tài khoản." };
  }
}

export async function getCurrentUserRole() {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    return roleData?.role || "student";
  } catch {
    return null;
  }
}
