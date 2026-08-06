import { z } from "zod";

export const courseOverviewSchema = z.object({
  title: z
    .string()
    .min(5, "Tên khóa học phải từ 5 ký tự trở lên")
    .max(200, "Tên khóa học không vượt quá 200 ký tự"),
  slug: z
    .string()
    .min(3, "Slug phải từ 3 ký tự trở lên")
    .regex(/^[a-z0-9-]+$/, "Slug chỉ bao gồm chữ cái thường, số và dấu gạch ngang (-)"),
  subtitle: z
    .string()
    .max(300, "Mô tả ngắn không vượt quá 300 ký tự")
    .optional(),
  description: z.string().optional(),
  category: z.string().min(1, "Vui lòng chọn danh mục khóa học"),
  price: z.coerce.number().min(0, "Giá gốc không được âm"),
  salePrice: z.coerce.number().min(0, "Giá bán không được âm"),
  status: z.enum(["draft", "published", "archived"]),
});

export type CourseOverviewSchemaType = z.infer<typeof courseOverviewSchema>;

export const courseSettingsSchema = z.object({
  accessDurationDays: z.coerce.number().nullable().optional(),
  enableCertificate: z.boolean().default(true),
  completionPercentRequired: z.coerce
    .number()
    .min(1, "Tỷ lệ tối thiểu là 1%")
    .max(100, "Tỷ lệ tối đa là 100%"),
});

export type CourseSettingsSchemaType = z.infer<typeof courseSettingsSchema>;
