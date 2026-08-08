const test = require("node:test");
const assert = require("node:assert/strict");
const nodemailer = require("nodemailer");
const handler = require("../api/contact");

const validBody = {
  requestType: "상담 문의",
  name: "홍길동",
  email: "customer@example.com",
  phone: "01012345678",
  company: "테스트 제조",
  customerType: "제조업",
  region: "서울특별시",
  message: "현장 진단을 요청합니다.",
  privacy: true
};

function createResponse() {
  return {
    statusCode: 200,
    body: null,
    headers: {},
    setHeader(name, value) { this.headers[name] = value; },
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; }
  };
}

function setMailEnvironment(values = {}) {
  const original = {
    MAIL_USER: process.env.MAIL_USER,
    MAIL_PASS: process.env.MAIL_PASS,
    MAIL_TO: process.env.MAIL_TO
  };

  for (const key of Object.keys(original)) delete process.env[key];
  Object.assign(process.env, values);

  return () => {
    for (const key of Object.keys(original)) delete process.env[key];
    for (const [key, value] of Object.entries(original)) {
      if (value !== undefined) process.env[key] = value;
    }
  };
}

test("returns a generic 503 response and logs missing mail variables", { concurrency: false }, async (t) => {
  const restoreEnvironment = setMailEnvironment();
  const originalError = console.error;
  const logs = [];
  console.error = (...args) => logs.push(args);
  t.after(() => { restoreEnvironment(); console.error = originalError; });

  const response = createResponse();
  await handler({ method: "POST", body: validBody }, response);

  assert.equal(response.statusCode, 503);
  assert.deepEqual(response.body, { ok: false, message: handler._test.USER_ERROR_MESSAGE });
  assert.match(JSON.stringify(logs), /MAIL_USER/);
  assert.match(JSON.stringify(logs), /MAIL_PASS/);
});

test("uses Vercel-compatible Gmail SMTP settings and the default recipient", { concurrency: false }, async (t) => {
  const restoreEnvironment = setMailEnvironment({ MAIL_USER: "sender@example.com", MAIL_PASS: "abcd efgh ijkl mnop" });
  const originalCreateTransport = nodemailer.createTransport;
  const originalWarn = console.warn;
  let transportOptions;
  let mailOptions;
  nodemailer.createTransport = (options) => {
    transportOptions = options;
    return { sendMail: async (message) => { mailOptions = message; } };
  };
  console.warn = () => {};
  t.after(() => {
    restoreEnvironment();
    nodemailer.createTransport = originalCreateTransport;
    console.warn = originalWarn;
  });

  const response = createResponse();
  await handler({ method: "POST", body: JSON.stringify(validBody) }, response);

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.body, { ok: true, message: handler._test.SUCCESS_MESSAGE });
  assert.equal(transportOptions.host, "smtp.gmail.com");
  assert.equal(transportOptions.port, 465);
  assert.equal(transportOptions.secure, true);
  assert.equal(transportOptions.auth.pass, "abcdefghijklmnop");
  assert.equal(mailOptions.to, handler._test.DEFAULT_MAIL_TO);
  assert.equal(mailOptions.replyTo, validBody.email);
});

test("returns a generic error and logs SMTP failure details", { concurrency: false }, async (t) => {
  const restoreEnvironment = setMailEnvironment({ MAIL_USER: "sender@example.com", MAIL_PASS: "app-password", MAIL_TO: "receiver@example.com" });
  const originalCreateTransport = nodemailer.createTransport;
  const originalError = console.error;
  const logs = [];
  nodemailer.createTransport = () => ({
    sendMail: async () => { const error = new Error("Authentication failed"); error.code = "EAUTH"; error.command = "AUTH PLAIN"; error.responseCode = 535; throw error; }
  });
  console.error = (...args) => logs.push(args);
  t.after(() => {
    restoreEnvironment();
    nodemailer.createTransport = originalCreateTransport;
    console.error = originalError;
  });

  const response = createResponse();
  await handler({ method: "POST", body: validBody }, response);

  assert.equal(response.statusCode, 500);
  assert.deepEqual(response.body, { ok: false, message: handler._test.USER_ERROR_MESSAGE });
  assert.match(JSON.stringify(logs), /EAUTH/);
  assert.match(JSON.stringify(logs), /535/);
});
