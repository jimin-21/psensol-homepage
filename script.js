const menuButtons = document.querySelectorAll(".menu-btn");
const linkButtons = document.querySelectorAll(".menu-btn-link");
const panels = document.querySelectorAll(".content-panel");

const heroContent = document.querySelector("#heroContent");
const heroVisual = document.querySelector("#heroVisual");
const heroImage = document.querySelector("#heroImage");
const heroEyebrow = document.querySelector("#heroEyebrow");
const heroTitle = document.querySelector("#heroTitle");
const heroDesc = document.querySelector("#heroDesc");
const heroNote = document.querySelector("#heroNote");
const heroImageLabel = document.querySelector("#heroImageLabel");
const heroImageTitle = document.querySelector("#heroImageTitle");
const contentShell = document.querySelector("#contentShell");
const quickSummary = document.querySelector("#quickSummary");

const techSlideImage = document.querySelector("#techSlideImage");
const techSlideText = document.querySelector("#techSlideText");

const techSlides = [
  "assets/technology-photo-1.jpg",
  "assets/technology-photo-2.jpg"
];

let techSlideIndex = 0;

const pageData = {
  about: {
    eyebrow: "PS ENERGY SOLUTION",
    title: "산업 현장의 전력 효율을 높이는<br />전기에너지절감 전문 기업",
    desc:
      "피에스에너지솔루션(주)는 KEGS를 기반으로 공장과 산업 시설의 전력 사용 환경을 분석하고, 현장 조건에 맞는 전기에너지절감 솔루션을 제공합니다.",
    note:
      "※ 예상 절감률은 10-30%이며, 현장 조건과 설비 환경에 따라 절감 효과는 상이할 수 있습니다.",
    imageBase: "assets/case-1",
    imageLabel: "KEGS",
    imageTitle: "K-Electric Generating System",
    summary: [
      ["주요 제품", "KEGS"],
      ["예상 절감률", "10-30%"],
      ["사업 분야", "전기에너지절감 솔루션"],
      ["적용 대상", "공장 · 제조시설 · 산업 현장"]
    ]
  },

  product: {
    eyebrow: "PRODUCT",
    title: "KEGS<br />K-Electric Generating System",
    desc:
      "KEGS는 산업 현장의 전력 사용 환경에 적용되는 전기에너지절감 솔루션으로, 전력 손실 요인 감소와 효율 개선을 목표로 합니다.",
    note:
      "※ 현장 조건, 부하 특성, 설비 환경에 따라 절감 효과와 적용 방식은 달라질 수 있습니다.",
    imageBase: "assets/product-photo",
    imageLabel: "Product",
    imageTitle: "H Type / B Type / C Type",
    summary: [
      ["제품명", "KEGS"],
      ["제품군", "H / B / C Type"],
      ["적용 대상", "공장 · 제조시설"],
      ["운용 목표", "전력 효율 개선"]
    ]
  },

  technology: {
    eyebrow: "TECHNOLOGY",
    title: "다강체 기반<br />전기절감 메커니즘",
    desc:
      "KEGS는 전기적 분극과 자기적 분극 반응을 활용하여 전력 시스템에서 발생하는 손실 저감을 목표로 하는 기술 기반 솔루션입니다.",
    note:
      "※ 기술 적용 효과는 전력 사용 패턴과 현장 설비 조건에 따라 달라질 수 있습니다.",
    imageBase: "assets/technology-photo-1",
    imageLabel: "Technology",
    imageTitle: "Multiferroic Energy Saving",
    summary: [
      ["기술 기반", "다강체"],
      ["핵심 방향", "전력 손실 저감"],
      ["적용 방식", "현장 맞춤 적용"],
      ["운영 단계", "확인 · 설치 · 점검"]
    ]
  },

  cert: {
    eyebrow: "PATENT & CERTIFICATION",
    title: "특허와 인증으로<br />기술 신뢰성을 확보합니다",
    desc:
      "다강체 원천 물질 특허, 시험성적서, 품질·환경 인증을 기반으로 KEGS의 기술 신뢰성을 강화하고 있습니다.",
    note:
      "※ 인증 및 시험성적 관련 세부 자료는 상담 시 확인 가능합니다.",
    imageBase: "assets/hero-cert",
    imageLabel: "Certification",
    imageTitle: "Patent & Test Report",
    summary: [
      ["특허", "다강체 원천 물질 특허"],
      ["시험", "KTR 시험성적서"],
      ["인증", "ISO 9001 / 14001"],
      ["상표", "KEGS 상표 등록"]
    ]
  },

  case: {
    eyebrow: "REFERENCE",
    title: "국내외 설치 및<br />테스트 사례",
    desc:
      "유리 제조, 반도체, 항만, 냉동창고 등 다양한 산업 현장에서 설치 및 테스트 사례를 바탕으로 솔루션을 제안합니다.",
    note:
      "※ 실제 절감 효과는 현장 조건과 부하 특성, 설비 환경에 따라 달라질 수 있습니다.",
    imageBase: "assets/hero-case",
    imageLabel: "Reference",
    imageTitle: "Installation Case",
    summary: [
      ["유리 제조", "약 17%"],
      ["반도체", "약 16%"],
      ["항만", "약 15.7%"],
      ["숙박업", "약 11%"]
    ]
  },

  contact: {
    eyebrow: "CONTACT",
    title: "문의 및<br />오시는 길",
    desc:
      "전기에너지절감 솔루션 관련 문의는 대표 연락처 또는 이메일로 문의해주시기 바랍니다.",
    note:
      "상담 신청 페이지를 통해 전기요금 절감 가능성도 확인할 수 있습니다.",
    imageBase: "assets/contact-map",
    imageLabel: "Contact",
    imageTitle: "PS ENERGY SOLUTION",
    summary: [
      ["Mobile", "010-8569-4114"],
      ["Office", "02-2659-4112"],
      ["Email", "feelpark@gmail.com"],
      ["본사", "서울 양천구 등촌로 80"]
    ]
  }
};

function setImageWithFallback(imgElement, basePath) {
  imgElement.onerror = function () {
    if (imgElement.src.endsWith(".jpg")) {
      imgElement.src = `${basePath}.png`;
    } else if (imgElement.src.endsWith(".png")) {
      imgElement.src = `${basePath}.jpeg`;
    } else {
      imgElement.onerror = null;
    }
  };

  imgElement.src = `${basePath}.jpg`;
}

function renderSummary(items) {
  quickSummary.innerHTML = items
    .map(
      (item) => `
        <div class="summary-card">
          <span>${item[0]}</span>
          <strong>${item[1]}</strong>
        </div>
      `
    )
    .join("");
}

function updateActiveState(targetId) {
  panels.forEach((panel) => panel.classList.remove("active"));
  menuButtons.forEach((button) => button.classList.remove("active"));

  const targetPanel = document.getElementById(targetId);
  const targetButton = document.querySelector(`.menu-btn[data-target="${targetId}"]`);

  if (targetPanel) {
    targetPanel.classList.add("active");
  }

  if (targetButton) {
    targetButton.classList.add("active");
  }
}

function updateHero(data) {
  heroEyebrow.textContent = data.eyebrow;
  heroTitle.innerHTML = data.title;
  heroDesc.textContent = data.desc;
  heroNote.textContent = data.note;
  heroImageLabel.textContent = data.imageLabel;
  heroImageTitle.textContent = data.imageTitle;

  setImageWithFallback(heroImage, data.imageBase);
  renderSummary(data.summary);
}

function changePanel(targetId) {
  const data = pageData[targetId];

  if (!data) {
    return;
  }

  heroContent.classList.add("fade-out");
  heroVisual.classList.add("fade-out");
  contentShell.classList.add("fade-out");
  quickSummary.classList.add("fade-out");

  setTimeout(() => {
    updateActiveState(targetId);
    updateHero(data);

    heroContent.classList.remove("fade-out");
    heroVisual.classList.remove("fade-out");
    contentShell.classList.remove("fade-out");
    quickSummary.classList.remove("fade-out");

    heroVisual.classList.remove("image-change");
    void heroVisual.offsetWidth;
    heroVisual.classList.add("image-change");
  }, 180);
}

function changeTechSlide() {
  if (!techSlideImage || !techSlideText) {
    return;
  }

  techSlideImage.classList.add("fade");

  setTimeout(() => {
    techSlideIndex = (techSlideIndex + 1) % techSlides.length;
    techSlideImage.src = techSlides[techSlideIndex];
    techSlideText.textContent = `${techSlideIndex + 1} / ${techSlides.length}`;
    techSlideImage.classList.remove("fade");
  }, 250);
}

menuButtons.forEach((button) => {
  button.addEventListener("click", () => {
    changePanel(button.dataset.target);
  });
});

linkButtons.forEach((button) => {
  button.addEventListener("click", () => {
    changePanel(button.dataset.target);
  });
});

setInterval(changeTechSlide, 3500);