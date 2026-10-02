(() => {
  "use strict";
  const menu = document.querySelector("#primary-nav");
  const toggle = document.querySelector(".menu-toggle");
  const navLinks = [...document.querySelectorAll('#primary-nav a[href^="#"]')];

  const closeMenu = () => {
    if (!menu || !toggle) return;
    menu.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  };
  toggle?.addEventListener("click", () => {
    const isOpen = menu?.classList.toggle("open") ?? false;
    toggle.setAttribute("aria-expanded", String(isOpen));
  });
  navLinks.forEach((link) => link.addEventListener("click", closeMenu));

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) => link.classList.toggle("active", link.hash === `#${entry.target.id}`));
    }), { rootMargin: "-35% 0px -55%", threshold: 0 });
    document.querySelectorAll("main section[id]").forEach((section) => observer.observe(section));
  }

  const privacyToggle = document.querySelector(".privacy-toggle");
  const privacyDetail = document.querySelector("#privacy-detail");
  privacyToggle?.addEventListener("click", () => {
    const willOpen = privacyDetail?.hasAttribute("hidden") ?? false;
    if (willOpen) privacyDetail?.removeAttribute("hidden"); else privacyDetail?.setAttribute("hidden", "");
    privacyToggle.setAttribute("aria-expanded", String(willOpen));
    privacyToggle.textContent = willOpen ? "내용 닫기" : "내용 보기";
  });

  const form = document.querySelector("#contact-form");
  const status = document.querySelector("#form-status");
  const submit = form?.querySelector('button[type="submit"]');
  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    status?.classList.remove("success", "error");
    if (!form.checkValidity()) {
      form.reportValidity();
      if (status) { status.textContent = "필수 항목을 모두 확인해 주세요."; status.classList.add("error"); }
      return;
    }
    if (submit) { submit.disabled = true; submit.textContent = "접수 중입니다"; }
    if (status) status.textContent = "";
    try {
      const payload = Object.fromEntries(new FormData(form).entries());
      payload.privacy = document.querySelector("#privacy")?.checked === true;
      const response = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || result.ok !== true) throw new Error("Request failed");
      form.reset();
      if (status) { status.textContent = result.message || "상담 신청이 접수되었습니다. 확인 후 연락드리겠습니다."; status.classList.add("success"); }
    } catch {
      if (status) { status.textContent = "접수 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요."; status.classList.add("error"); }
    } finally {
      if (submit) { submit.disabled = false; submit.textContent = "상담 신청하기"; }
    }
  });
})();
