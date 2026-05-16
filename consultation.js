const billInput = document.querySelector("#billInput");
const savingAmount = document.querySelector("#savingAmount");
const contactForm = document.querySelector(".contact-form");

function formatNumber(value) {
  const onlyNumber = value.replace(/[^0-9]/g, "");

  if (!onlyNumber) {
    return "";
  }

  return Number(onlyNumber).toLocaleString("ko-KR");
}

function calculateSaving() {
  const rawValue = billInput.value.replace(/[^0-9]/g, "");
  const bill = Number(rawValue);

  if (!bill) {
    savingAmount.textContent = "월 전기요금을 입력해주세요";
    return;
  }

  const minSaving = Math.round(bill * 0.1);
  const maxSaving = Math.round(bill * 0.3);

  savingAmount.textContent =
    `월 ${minSaving.toLocaleString("ko-KR")}원 - ${maxSaving.toLocaleString("ko-KR")}원`;
}

billInput.addEventListener("input", function () {
  billInput.value = formatNumber(billInput.value);
  calculateSaving();
});

contactForm.addEventListener("submit", function (event) {
  event.preventDefault();

  alert("상담 신청 기능은 추후 이메일 또는 서버로 연결해야 합니다.");
});

calculateSaving();