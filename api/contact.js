const nodemailer = require("nodemailer");
const clean = (value, max = 3000) => String(value ?? "").trim().slice(0, max);
const escapeHtml = (value) => clean(value).replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]);

module.exports = async function handler(req, res) {
  if (req.method !== "POST") { res.setHeader("Allow", "POST"); return res.status(405).json({ message: "Method not allowed" }); }
  const data = req.body && typeof req.body === "object" ? req.body : {};
  const fields = {
    requestType: clean(data.requestType, 30), name: clean(data.name, 50), email: clean(data.email, 120), phone: clean(data.phone, 20),
    company: clean(data.company, 100), customerType: clean(data.customerType, 30), region: clean(data.region, 100), message: clean(data.message, 3000)
  };
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!Object.values(fields).every(Boolean) || data.privacy !== true || !emailPattern.test(fields.email) || !["상담 문의", "현장 진단", "제품 문의"].includes(fields.requestType) || !["제조업", "공장", "설비업체", "기타"].includes(fields.customerType)) return res.status(400).json({ message: "필수 입력값을 확인해 주세요." });
  if (!process.env.MAIL_USER || !process.env.MAIL_PASS) { console.error("Mail environment variables are not configured."); return res.status(500).json({ message: "Mail service unavailable" }); }

  const rows = [["서비스 요청 유형", fields.requestType], ["이름", fields.name], ["이메일", fields.email], ["연락처", fields.phone], ["고객업체명", fields.company], ["고객유형", fields.customerType], ["문의지역", fields.region], ["문의내용", fields.message]];
  const text = rows.map(([label, value]) => `${label}: ${value}`).join("\n");
  const html = `<div style="font-family:Arial,'Malgun Gothic',sans-serif;max-width:720px;color:#17212b"><h2 style="padding-bottom:16px;border-bottom:3px solid #1768b1">PSENERGY 홈페이지 상담신청</h2><table style="width:100%;border-collapse:collapse">${rows.map(([label, value]) => `<tr><th style="width:160px;padding:12px;text-align:left;background:#f4f6f8;border:1px solid #dce1e5">${escapeHtml(label)}</th><td style="padding:12px;border:1px solid #dce1e5;white-space:pre-wrap">${escapeHtml(value)}</td></tr>`).join("")}</table></div>`;
  try {
    const transporter = nodemailer.createTransport({ service: "gmail", auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS } });
    await transporter.sendMail({ from: `PSENERGY 홈페이지 <${process.env.MAIL_USER}>`, to: process.env.MAIL_TO || "feelpark@gmail.com", replyTo: fields.email, subject: `[PSENERGY 홈페이지 상담신청] ${fields.company} / ${fields.name}`, text, html });
    // 추후 SOLAPI 연동 가능: 발신번호 등록 및 API 키 준비 후 이 지점에서 담당자 문자 알림을 호출합니다.
    return res.status(200).json({ message: "상담 신청이 접수되었습니다." });
  } catch (error) {
    console.error("Contact mail send failed:", error instanceof Error ? error.message : "Unknown error");
    return res.status(500).json({ message: "Mail delivery failed" });
  }
};
