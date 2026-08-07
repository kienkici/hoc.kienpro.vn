import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const signature = request.headers.get("x-sepay-signature");
    const timestamp = request.headers.get("x-sepay-timestamp");
    const secret = process.env.SEPAY_WEBHOOK_SECRET;

    let body: any;

    if (secret) {
      if (!signature || !timestamp) {
        console.error("Webhook unauthorized: Missing signature or timestamp headers");
        return NextResponse.json({ error: "Missing signature or timestamp" }, { status: 401 });
      }

      const rawBody = await request.text();
      const dataToSign = `${timestamp}.${rawBody}`;
      const expectedSignature = `sha256=${crypto
        .createHmac("sha256", secret)
        .update(dataToSign)
        .digest("hex")}`;

      if (signature !== expectedSignature) {
        console.error("Webhook unauthorized: Signature mismatch. Expected:", expectedSignature, "Received:", signature);
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }

      body = JSON.parse(rawBody);
    } else {
      body = await request.json();
    }

    console.log("Received verified SePay Webhook payload:", body);

    // 1. Lấy thông tin giao dịch từ SePay/Casso payload (hỗ trợ cả snake_case và camelCase)
    const transactionId = body.id ? String(body.id) : (body.transactionId ? String(body.transactionId) : null);
    const transferAmount = Number(body.amount_in || body.amount || body.transferAmount || 0);
    const amountOut = Number(body.amount_out || 0);
    const content = body.content || body.description || "";

    if (!transactionId) {
      return NextResponse.json({ error: "Missing transaction ID" }, { status: 400 });
    }

    // Nếu là giao dịch chuyển tiền đi (amount_out > 0) thì bỏ qua
    if (amountOut > 0 && transferAmount === 0) {
      return NextResponse.json({ success: true, message: "Ignored out transaction" });
    }

    // 2. Trích xuất mã đơn hàng từ nội dung chuyển khoản (Ví dụ: KP98241)
    let orderCode = body.code || "";
    if (!orderCode && content) {
      const match = content.match(/KP\d+/i);
      if (match) {
        orderCode = match[0].toUpperCase();
      }
    }

    if (!orderCode) {
      return NextResponse.json({ success: true, message: "Order code not found in memo" });
    }

    const supabaseAdmin = createAdminClient();

    // 3. Kiểm tra trùng lặp giao dịch (Anti-replay Idempotency)
    const { data: existingEvent } = await supabaseAdmin
      .from("webhook_events")
      .select("id")
      .eq("transaction_id", transactionId)
      .eq("provider", "sepay")
      .maybeSingle();

    if (existingEvent) {
      return NextResponse.json({ success: true, message: "Webhook already processed" });
    }

    // 4. Tìm đơn hàng tương ứng trong DB (hỗ trợ tự động sửa lỗi gõ nhầm chữ 'D' thành số '0' ở cuối mã)
    let finalOrderCode = orderCode;
    let { data: order } = await supabaseAdmin
      .from("orders")
      .select(`
        *,
        courses (
          title
        )
      `)
      .eq("code", finalOrderCode)
      .eq("status", "pending")
      .maybeSingle();

    if (!order && finalOrderCode.endsWith("D")) {
      const correctedCode = finalOrderCode.slice(0, -1) + "0";
      console.log(`Webhook order ${finalOrderCode} not found, trying typo correction with ${correctedCode}`);
      const { data: correctedOrder } = await supabaseAdmin
        .from("orders")
        .select(`
          *,
          courses (
            title
          )
        `)
        .eq("code", correctedCode)
        .eq("status", "pending")
        .maybeSingle();

      if (correctedOrder) {
        order = correctedOrder;
        finalOrderCode = correctedCode;
      }
    }

    if (!order) {
      console.warn(`Webhook processed: Order code ${orderCode} not found in DB`);
      return NextResponse.json({ success: true, message: "Order not found or already paid" });
    }

    // Gán lại mã đơn hàng chính xác
    orderCode = finalOrderCode;

    // Kiểm tra số tiền chuyển khoản (cho phép sai số nhỏ nếu cần, hoặc kiểm tra khớp 100%)
    if (transferAmount < Number(order.amount)) {
      console.warn(`Amount mismatch for order ${orderCode}. Expected: ${order.amount}, Received: ${transferAmount}`);
      // Vẫn log lại nhưng không kích hoạt tự động để tránh gian lận
      return NextResponse.json({ success: true, message: "Amount mismatch, activation pending manual review" });
    }

    // 5. Lưu thông tin webhook vào bảng webhook_events để chặn xử lý lại
    await supabaseAdmin.from("webhook_events").insert({
      provider: "sepay",
      transaction_id: transactionId,
      payload: body,
    });

    // 6. Cập nhật trạng thái đơn hàng thành 'paid'
    await supabaseAdmin
      .from("orders")
      .update({ status: "paid", updated_at: new Date().toISOString() })
      .eq("id", order.id);

    // 7. Tạo/Tìm tài khoản Auth của học viên
    const { data: userData } = await supabaseAdmin.auth.admin.listUsers();
    let user = userData?.users.find((u) => u.email === order.customer_email);
    let userId = user?.id;

    if (!user) {
      // Tạo tài khoản mới tạm thời với mật khẩu ngẫu nhiên
      const tempPassword = crypto.randomBytes(12).toString("hex");
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: order.customer_email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          full_name: order.customer_name,
          phone: order.customer_phone,
        },
      });

      if (createError) {
        console.error("Error creating student auth account:", createError);
        throw createError;
      }
      userId = newUser.user.id;
    }

    // 8. Đảm bảo profile và role của học viên được tạo/cập nhật đầy đủ
    await supabaseAdmin.from("profiles").upsert({
      id: userId,
      full_name: order.customer_name,
      phone: order.customer_phone,
      is_activated: false,
      updated_at: new Date().toISOString(),
    });

    await supabaseAdmin.from("user_roles").upsert({
      user_id: userId,
      role: "student",
    });

    // 9. Cấp quyền khóa học (Enrollment) cho học viên
    await supabaseAdmin.from("enrollments").upsert({
      user_id: userId,
      course_id: order.course_id,
      status: "ACTIVE",
    });

    // 10. Tạo token kích hoạt tài khoản
    const activationToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Hết hạn trong 7 ngày

    await supabaseAdmin.from("activation_tokens").insert({
      user_id: userId,
      token: activationToken,
      expires_at: expiresAt.toISOString(),
    });

    // 11. Gửi Email kích hoạt tự động qua Resend
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://hoc.kienpro.vn";
    const activationLink = `${appUrl}/activate-account?token=${activationToken}`;
    const courseTitle = order.courses?.title || "Khóa học bạn đã đăng ký";

    const emailHtml = `
      <div style="background-color: #09090b; color: #ffffff; padding: 40px; font-family: Arial, sans-serif; border: 1px solid #d4af37; border-radius: 12px; max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h2 style="color: #d4af37; margin: 0; font-size: 24px; font-weight: bold; letter-spacing: 1px;">KIENPRO LMS</h2>
          <p style="color: #a1a1aa; font-size: 12px; margin-top: 5px;">HỌC TẬP THỰC CHIẾN - TỰ ĐỘNG HÓA SỰ NGHIỆP</p>
        </div>
        
        <h3 style="color: #ffffff; border-bottom: 1px solid #27272a; padding-bottom: 10px;">Xin chào ${order.customer_name},</h3>
        <p style="line-height: 1.6; color: #e4e4e7;">Cảm ơn anh/chị đã đăng ký học tập tại KIENPRO LMS. Giao dịch thanh toán đơn hàng <strong>${order.code}</strong> đã được hệ thống xác nhận thành công!</p>
        
        <div style="background-color: #18181b; border-left: 4px solid #d4af37; padding: 15px; margin: 25px 0; border-radius: 0 8px 8px 0;">
          <p style="margin: 0 0 8px 0; color: #a1a1aa; font-size: 13px;">Khóa học kích hoạt:</p>
          <strong style="color: #ffffff; font-size: 15px;">${courseTitle}</strong>
        </div>

        <p style="line-height: 1.6; color: #e4e4e7;">Anh/Chị vui lòng click vào nút bên dưới để thiết lập mật khẩu cá nhân và bắt đầu vào học ngay:</p>
        
        <div style="text-align: center; margin: 35px 0;">
          <a href="${activationLink}" style="background-color: #d4af37; color: #000000; padding: 12px 30px; text-decoration: none; font-weight: bold; border-radius: 6px; font-size: 14px; display: inline-block; letter-spacing: 0.5px;">KÍCH HOẠT TÀI KHOẢN HỌC</a>
        </div>

        <p style="font-size: 11px; color: #71717a; line-height: 1.5;">Nếu nút trên không hoạt động, anh/chị có thể sao chép liên kết này dán vào trình duyệt:<br/>
        <a href="${activationLink}" style="color: #d4af37; text-decoration: underline;">${activationLink}</a></p>

        <div style="border-top: 1px solid #27272a; padding-top: 20px; margin-top: 40px; font-size: 11px; color: #71717a; text-align: center;">
          <p>Mọi thắc mắc hỗ trợ kỹ thuật vui lòng liên hệ Zalo: 0961831111 hoặc Email: info@kienpro.vn</p>
          <p>© 2026 KIENPRO LMS. Đăng ký sở hữu bởi Thương hiệu Kiên Pro.</p>
        </div>
      </div>
    `;

    if (process.env.RESEND_API_KEY) {
      const emailRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "KIENPRO LMS <info@kienpro.vn>",
          to: order.customer_email,
          subject: `[KIENPRO LMS] Kích hoạt khóa học thành công - Đơn hàng ${order.code}`,
          html: emailHtml,
        }),
      });

      if (!emailRes.ok) {
        console.error("Resend API failed to send activation email:", await emailRes.text());
      }
    } else {
      console.warn("RESEND_API_KEY is not configured. Email was not sent.");
    }

    return NextResponse.json({ success: true, message: "Webhook processed, student enrolled and email sent." });
  } catch (err: any) {
    console.error("Error inside payment webhook handler:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
