import { z } from "zod";

export const provisionStudentsSchema = z.object({
  courseId: z.string().uuid("ID khóa học không hợp lệ"),
  students: z
    .array(
      z.object({
        email: z.string().email("Email không đúng định dạng"),
        fullName: z.string().optional(),
        phone: z.string().optional(),
      })
    )
    .min(1, "Vui lòng nhập ít nhất 1 email học viên"),
  sendEmail: z.boolean().default(true),
});

export type ProvisionStudentsInput = z.infer<typeof provisionStudentsSchema>;
