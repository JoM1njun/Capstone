// js/script.js (통합된 모든 JavaScript 코드)

// DOM 요소 가져오기 (모든 페이지에서 공통으로 사용될 수 있는 요소들)
const sidebar = document.getElementById("sidebar");
const mainContent = document.getElementById("mainContent");
const sidebarToggleBtn = document.getElementById("sidebarToggleBtn");
const languageToggleBtn = document.getElementById("languageToggleBtn");
const languageDropdown = document.getElementById("languageDropdown");
const dropdownItems = document.querySelectorAll(
  ".language-dropdown .dropdown-item"
);

// 알림 관련 DOM 요소 추가
const notificationBell = document.getElementById("notificationBell");
const notificationDropdown = document.getElementById("notificationDropdown");
const notificationBadge = document.getElementById("notificationBadge");
const noNotificationsMessage = document.querySelector(
  ".no-notifications-message"
);

// 페이지 콘텐츠 요소
const dashboardPageContent = document.getElementById("dashboard-page-content");
const dataManagementPageContent = document.getElementById(
  "data-management-page-content"
);
const settingsPageContent = document.getElementById("settings-page-content");

// API 엔드포인트 상수화
const API_BASE_URL = "https://capstone-back.fly.dev/api";

// 전역 변수 (필요시)
let map,
  userMarker = [],
  infoWindows = [];
let managementData = []; // DB 데이터 가져올 용도
let currentViewBox; // SVG Pan & Zoom을 위한 전역 변수

// 차트 인스턴스를 저장할 객체. 키는 DOM 요소의 ID (예: "movementChart")
let chartInstances = {};

let floorMarkers = {};

// -----------------------------------------------------------
// 페이지 로드 후 DOM 요소들이 준비되었을 때 실행
// -----------------------------------------------------------
document.addEventListener("DOMContentLoaded", function () {
  setVhVwUnit(); // Initial call for vh/vw units
  window.addEventListener("resize", setVhVwUnit); // Recalculate on resize
  window.addEventListener("orientationchange", setVhVwUnit); // Recalculate on orientation change

  // 초기 언어 설정 (페이지 로드 시 localStorage 또는 한국어로 설정)
  const initialLang = localStorage.getItem("currentLanguage") || "ko";
  window.setLanguage(initialLang);

  // 다크 모드 초기 설정
  window.toggleDarkMode();

  // 초기 알림 설정 (페이지 로드 시)
  updateNotificationBadge();

  // 사이드바 및 페이지 전환 초기 설정
  initializeSidebarAndPageSwitch();

  // DB 연결 확인 (비동기로 진행하여 다른 초기화 블록을 막지 않음)
  checkDbConnection();

  // 카카오 맵 로드 및 초기화
  // mainKakaoMapInit() 함수는 showPage('dashboard')에서 호출되므로, DOMContentLoaded 시 직접 호출하지 않아도 됨.
  // 하지만 초기 페이지가 dashboard이므로, 초기 로딩 시 지도를 바로 표시하기 위해 여기에 직접 호출해도 괜찮음.
  mainKakaoMapInit();
});

// -----------------------------------------------------------
// SPA (Single Page Application) 페이지 전환 로직
// -----------------------------------------------------------

// -----------------------------------------------------------


// -----------------------------------------------------------

// -----------------------------------------------------------

// -----------------------------------------------------------


// -----------------------------------------------------------


// -----------------------------------------------------------
