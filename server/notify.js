// Gửi email thông báo khi có khách mới để lại thông tin.
// Chỉ hoạt động khi đã cấu hình RESEND_API_KEY và NOTIFY_EMAIL trên môi trường.
// Nếu chưa cấu hình, hàm bỏ qua một cách im lặng (không ảnh hưởng trang web).

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL;
const FROM_EMAIL = process.env.NOTIFY_FROM || 'onboarding@resend.dev';

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

async function notifyNewLead(lead) {
  if (!RESEND_API_KEY || !NOTIFY_EMAIL) return;

  const time = new Date(lead.ts).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;border:1px solid #eee;border-radius:12px;overflow:hidden">
      <div style="background:#6e1423;color:#fff;padding:16px 20px;font-size:16px;font-weight:bold">
        🔔 Khách mới để lại thông tin — Thảm JM365
      </div>
      <div style="padding:20px;color:#2c1e14;font-size:15px;line-height:1.7">
        <p><strong>Họ tên:</strong> ${escapeHtml(lead.name)}</p>
        <p><strong>Số điện thoại:</strong>
          <a href="tel:${escapeHtml(lead.phone)}" style="color:#6e1423">${escapeHtml(lead.phone)}</a>
        </p>
        <p><strong>Ghi chú:</strong> ${escapeHtml(lead.note) || '(không có)'}</p>
        <p><strong>Thời gian:</strong> ${escapeHtml(time)}</p>
        <p style="margin-top:18px;padding-top:14px;border-top:1px solid #eee;color:#8a7a5c;font-size:13px">
          Hãy liên hệ tư vấn cho khách sớm nhất có thể.
        </p>
      </div>
    </div>`;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `Thảm JM365 <${FROM_EMAIL}>`,
        to: [NOTIFY_EMAIL],
        subject: `🔔 Khách mới: ${lead.name} - ${lead.phone}`,
        html,
      }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      console.error('Gửi email thất bại:', res.status, detail);
    }
  } catch (err) {
    console.error('Lỗi khi gửi email thông báo:', err.message);
  }
}

module.exports = { notifyNewLead };
