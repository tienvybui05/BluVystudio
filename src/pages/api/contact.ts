import type { APIRoute } from 'astro';
import { Resend } from 'resend';

// Cache để giới hạn rate limit (giống StuZen)
const RATE_LIMIT_MS = 60_000;
const requestsByIp = new Map<string, number>();

export const POST: APIRoute = async ({ request, clientAddress }) => {
  try {
    // 1. Lấy IP (Astro hỗ trợ clientAddress mặc định, hoặc lấy qua Header nếu qua Vercel proxy)
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : (clientAddress || 'unknown');

    // 2. Rate Limiting (Giới hạn 60s/lần)
    const now = Date.now();
    const lastRequestAt = requestsByIp.get(ip) ?? 0;
    if (now - lastRequestAt < RATE_LIMIT_MS) {
      return new Response(JSON.stringify({ message: 'Bạn chỉ có thể gửi liên hệ mỗi 60 giây.' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 3. Kiểm tra API Key
    const apiKey = import.meta.env.RESEND_API_KEY || process.env.RESEND_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ message: 'Thiếu cấu hình Resend API Key.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const resend = new Resend(apiKey);
    const body = await request.json();
    const { name, phone, service, message } = body;

    if (!phone) {
      return new Response(JSON.stringify({ message: 'Số điện thoại là bắt buộc.' }), { status: 400 });
    }

    // Đánh dấu thời gian đã gửi
    requestsByIp.set(ip, now);

    // 4. Gửi email qua Resend
    const fromEmail = import.meta.env.RESEND_FROM_EMAIL || process.env.RESEND_FROM_EMAIL || 'Support <support@stuzen.io.vn>';
    const toEmail = import.meta.env.CONTACT_TO_EMAIL || process.env.CONTACT_TO_EMAIL || 'tienvy27052005@gmail.com';

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      subject: `[WebProStudio] Liên hệ mới từ ${name || 'Khách hàng'}`,
      html: `
        <h2>Khách hàng vừa để lại thông tin tư vấn:</h2>
        <p><strong>Tên:</strong> ${name || 'Không cung cấp'}</p>
        <p><strong>Số điện thoại:</strong> ${phone}</p>
        <p><strong>Dịch vụ quan tâm:</strong> ${service || 'Không chọn'}</p>
        <p><strong>Lời nhắn:</strong> ${message || 'Không có'}</p>
        <hr />
        <p><small>IP Khách hàng: ${ip}</small></p>
        <p><small>Thời gian: ${new Date().toLocaleString('vi-VN')}</small></p>
      `
    });

    if (error) {
      return new Response(JSON.stringify({ message: error.message }), { status: 500 });
    }

    return new Response(JSON.stringify({ success: true, message: 'Gửi thành công!' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ message: 'Lỗi server: ' + error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
