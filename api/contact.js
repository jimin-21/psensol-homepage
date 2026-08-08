const nodemailer = require("nodemailer");

const DEFAULT_MAIL_TO = "feelpark@gmail.com";
const USER_ERROR_MESSAGE = "접수 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.";
const SUCCESS_MESSAGE = "상담 신청이 접수되었습니다. 확인 후 연락드리겠습니다.";

const clean = (value, max = 3000) => String(value ?? "").trim().slice(0, max);
const escapeHtml = (value) => clean(value).replace(/[&<>'"]/g, (char) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  "'": "&#39;",
  '"': "&quot;"
})[char]);

function readRequestBody(body) {
  if (body && typeof body === "object") return body;
  if (typeof body !== "string") return {};

  try {
    return JSON.parse(body);
  } catch {
    return {};
  }
}

function getMailConfig() {
  const user = clean(process.env.MAIL_USER, 320);
  const pass = String(process.env.MAIL_PASS ?? "").replace(/\s/g, "");
  const to = clean(process.env.MAIL_TO, 320) || DEFAULT_MAIL_TO;
  const missing = [];

  if (!user) missing.push("MAIL_USER");
  if (!pass) missing.push("MAIL_PASS");

  return { user, pass, to, missing, usesDefaultRecipient: !clean(process.env.MAIL_TO, 320) };
}

function logMailError(error) {
  console.error("[contact] Gmail delivery failed", {
    name: error instanceof Error ? error.name : "UnknownError",
    code: clean(error?.code, 80) || "UNKNOWN",
    command: clean(error?.command, 80) || "UNKNOWN",
    responseCode: Number.isFinite(error?.responseCode) ? error.responseCode : null,
    message: error instanceof Error ? clean(error.message, 500) : "Unknown mail error"
  });
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, message: "허용되지 않은 요청입니다." });
  }

  const data = readRequestBody(req.body);
  const fields = {
    requestType: clean(data.requestType, 30),
    name: clean(data.name, 50),
    email: clean(data.email, 120),
    phone: clean(data.phone, 20),
    company: clean(data.company, 100),
    customerType: clean(data.customerType, 30),
    region: clean(data.region, 100),
    message: clean(data.message, 3000)
  };

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValid = Object.values(fields).every(Boolean)
    && data.privacy === true
    && emailPattern.test(fields.email)
    && ["상담 문의", "현장 진단", "제품 문의"].includes(fields.requestType)
    && ["제조업", "공장", "설비업체", "기타"].includes(fields.customerType);

  if (!isValid) {
    console.warn("[contact] Invalid contact form payload", {
      requestType: fields.requestType || "missing",
      customerType: fields.customerType || "missing",
      privacyAccepted: data.privacy === true
    });
    return res.status(400).json({ ok: false, message: "필수 입력값을 확인해 주세요." });
  }

  const mail = getMailConfig();
  if (mail.missing.length) {
    console.error("[contact] Mail configuration is incomplete", {
      missingEnvironmentVariables: mail.missing,
      runtime: process.env.VERCEL ? "vercel" : "local"
    });
    return res.status(503).json({ ok: false, message: USER_ERROR_MESSAGE });
  }
  if (mail.usesDefaultRecipient) {
    console.warn("[contact] MAIL_TO is not configured; using the default recipient", {
      defaultRecipient: DEFAULT_MAIL_TO
    });
  }

  const rows = [
    ["서비스 요청 유형", fields.requestType],
    ["이름", fields.name],
    ["이메일", fields.email],
    ["연락처", fields.phone],
    ["고객업체명", fields.company],
    ["고객유형", fields.customerType],
    ["문의지역", fields.region],
    ["문의내용", fields.message]
  ];
  const text = rows.map(([label, value]) => `${label}: ${value}`).join("\n");
  const html = `<div style="font-family:Arial,'Malgun Gothic',sans-serif;max-width:720px;color:#17212b"><h2 style="padding-bottom:16px;border-bottom:3px solid #1768b1">PSENERGY 홈페이지 상담신청</h2><table style="width:100%;border-collapse:collapse">${rows.map(([label, value]) => `<tr><th style="width:160px;padding:12px;text-align:left;background:#f4f6f8;border:1px solid #dce1e5">${escapeHtml(label)}</th><td style="padding:12px;border:1px solid #dce1e5;white-space:pre-wrap">${escapeHtml(value)}</td></tr>`).join("")}</table></div>`;

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: { user: mail.user, pass: mail.pass },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000
    });

    await transporter.sendMail({
      from: `PSENERGY 홈페이지 <${mail.user}>`,
      to: mail.to,
      replyTo: fields.email,
      subject: `[PSENERGY 홈페이지 상담신청] ${fields.company} / ${fields.name}`,
      text,
      html
    });

    // 추후 SOLAPI 연동 가능: 발신번호 등록 및 API 키 준비 후 이 지점에서 담당자 문자 알림을 호출합니다.
    return res.status(200).json({ ok: true, message: SUCCESS_MESSAGE });
  } catch (error) {
    logMailError(error);
    return res.status(500).json({ ok: false, message: USER_ERROR_MESSAGE });
  }
};

module.exports._test = { DEFAULT_MAIL_TO, SUCCESS_MESSAGE, USER_ERROR_MESSAGE, getMailConfig };
