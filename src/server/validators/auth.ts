import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email không đúng định dạng"),
  password: z.string().min(6, "Mật khẩu phải dài ít nhất 6 ký tự"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Email không đúng định dạng"),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(6, "Mật khẩu mới phải dài ít nhất 6 ký tự"),
});

export const activateAccountSchema = z.object({
  token: z.string().min(1, "Token kích hoạt không hợp lệ"),
  password: z.string().min(6, "Mật khẩu mới phải dài ít nhất 6 ký tự"),
});
