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

    // 3. Mark profiles as activated
    await adminSupabase
      .from("profiles")
      .update({ is_activated: true, updated_at: new Date().toISOString() })
      .eq("id", tokenData.user_id);

    // 4. Mark token as used
    await adminSupabase
      .from("activation_tokens")
      .update({ used_at: new Date().toISOString() })
      .eq("token", validated.token);

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
