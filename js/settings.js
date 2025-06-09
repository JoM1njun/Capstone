// -----------------------------------------------------------
// 다크 모드 초기 설정 및 토글 기능 (모든 페이지에서 동작)
// -----------------------------------------------------------

window.toggleDarkMode = function (activate) {
  const currentIsDarkMode = document.body.classList.contains("dark-mode");
  let shouldActivate;

  if (typeof activate === "boolean") {
    shouldActivate = activate;
  } else {
    shouldActivate = !currentIsDarkMode;
  }

  if (shouldActivate) {
    document.body.classList.add("dark-mode");
    localStorage.setItem("darkMode", "enabled");
  } else {
    document.body.classList.remove("dark-mode");
    localStorage.setItem("darkMode", "disabled");
  }

  const darkModeSwitch = document.getElementById("darkModeSwitch");
  if (darkModeSwitch) {
    darkModeSwitch.checked = document.body.classList.contains("dark-mode");
  }

  // 다크 모드 변경 시 모든 차트 업데이트
  for (const chartId in chartInstances) {
    if (chartInstances.hasOwnProperty(chartId) && chartInstances[chartId]) {
      const chart = chartInstances[chartId];
      const isDarkMode = document.body.classList.contains("dark-mode");
      const newTextColor = isDarkMode ? "#f5f5f5" : "#333";
      const newGridColor = isDarkMode
        ? "rgba(255,255,255,0.1)"
        : "rgba(0,0,0,0.1)";

      // 범례, 타이틀, 축 텍스트 색상 업데이트
      if (chart.options.plugins.legend) {
        chart.options.plugins.legend.labels.color = newTextColor;
      }
      if (chart.options.plugins.title) {
        chart.options.plugins.title.color = newTextColor;
      }
      if (chart.options.scales) {
        for (const scaleKey in chart.options.scales) {
          const scale = chart.options.scales[scaleKey];
          if (scale.title) scale.title.color = newTextColor;
          if (scale.ticks) scale.ticks.color = newTextColor;
          if (scale.grid) scale.grid.color = newGridColor;
        }
      }

      // 특정 차트 데이터셋 색상 업데이트 (파이 차트의 경우)
      if (chart.config.type === "pie" && chart.data.datasets.length > 0) {
        chart.data.datasets[0].backgroundColor = [
          isDarkMode ? "rgba(52, 199, 89, 0.8)" : "rgba(52, 199, 89, 1)", // Green
          isDarkMode ? "rgba(255, 59, 48, 0.8)" : "rgba(255, 59, 48, 1)", // Red
        ];
        chart.data.datasets[0].borderColor = isDarkMode ? "#333" : "#fff";
      }

      // 차트 업데이트
      chart.update();
    }
  }
};

const darkModeToggleCard = document.getElementById("darkModeToggle");
const darkModeSwitch = document.getElementById("darkModeSwitch");

if (darkModeToggleCard) {
  darkModeToggleCard.addEventListener("click", function (event) {
    if (
      darkModeSwitch &&
      event.target !== darkModeSwitch &&
      !darkModeSwitch.contains(event.target)
    ) {
      window.toggleDarkMode();
    }
  });
}
if (darkModeSwitch) {
  darkModeSwitch.addEventListener("change", function () {
    window.toggleDarkMode(this.checked);
  });
}

const darkModeIconToggle = document.getElementById("darkModeIconToggle");
if (darkModeIconToggle) {
  darkModeIconToggle.addEventListener("click", function () {
    window.toggleDarkMode();
  });
}

// -----------------------------------------------------------
// 알림 기능
// -----------------------------------------------------------

let notifications = [
  {
    id: 1,
    icon: "assets/management/black_소화기.png",
    message_ko: "하워드관 (H) 1F 1번 소화기 흔들어주세요",
    message_en: "Howard Hall (H) 1F #1 Fire Extinguisher Needs Shaking",
    read: false,
  },
];

function renderNotifications() {
  if (!notificationDropdown) return;

  // 기존 알림 항목 초기화 (noNotificationsMessage를 포함하지 않음)
  const existingNotificationItems = notificationDropdown.querySelectorAll(
    ".notification-item:not(.no-notifications-message)"
  );
  existingNotificationItems.forEach((item) => item.remove());

  const currentLang = localStorage.getItem("currentLanguage") || "ko";

  if (notifications.length === 0) {
    if (noNotificationsMessage) {
      noNotificationsMessage.style.display = "block";
      if (!notificationDropdown.contains(noNotificationsMessage)) {
        notificationDropdown.appendChild(noNotificationsMessage);
      }
    }
  } else {
    if (noNotificationsMessage) {
      noNotificationsMessage.style.display = "none";
    }
    notifications.forEach((notification) => {
      const existingItem = notificationDropdown.querySelector(
        `[data-notification-id="${notification.id}"]`
      );
      if (existingItem) {
        if (notification.read) {
          existingItem.classList.add("read");
        } else {
          existingItem.classList.remove("read");
        }
        existingItem.querySelector("span").textContent =
          currentLang === "ko"
            ? notification.message_ko
            : notification.message_en;
        return;
      }

      const notificationItem = document.createElement("div");
      notificationItem.classList.add("dropdown-item", "notification-item");
      if (notification.read) {
        notificationItem.classList.add("read");
      }
      notificationItem.dataset.notificationId = notification.id;

      notificationItem.innerHTML = `
                <img src="${
                  notification.icon
                }" alt="알림 아이콘" class="notification-icon">
                <span>${
                  currentLang === "ko"
                    ? notification.message_ko
                    : notification.message_en
                }</span>
            `;
      // 알림 목록의 가장 위에 추가 (최신 알림이 위로 오도록)
      if (
        notificationDropdown.firstChild &&
        notificationDropdown.firstChild !== noNotificationsMessage
      ) {
        notificationDropdown.insertBefore(
          notificationItem,
          notificationDropdown.firstChild
        );
      } else {
        notificationDropdown.appendChild(notificationItem);
      }

      notificationItem.addEventListener("click", function () {
        markNotificationAsRead(notification.id);
        alert(
          `알림 클릭됨: ${
            currentLang === "ko"
              ? notification.message_ko
              : notification.message_en
          }`
        );
        hideAllDropdowns();
      });
    });
  }
  updateNotificationBadge();
}

function updateNotificationBadge() {
  const unreadNotifications = notifications.filter((n) => !n.read);
  if (unreadNotifications.length > 0) {
    if (notificationBell) notificationBell.classList.add("has-notification");
    if (notificationBadge) {
      notificationBadge.style.display = "block";
      notificationBadge.textContent =
        unreadNotifications.length > 9 ? "9+" : unreadNotifications.length;
    }
  } else {
    if (notificationBell) notificationBell.classList.remove("has-notification");
    if (notificationBadge) {
      notificationBadge.style.display = "none";
      notificationBadge.textContent = "";
    }
  }
}

function markNotificationAsRead(id) {
  const notification = notifications.find((n) => n.id === id);
  if (notification) {
    notification.read = true;
    renderNotifications();
  }
}

if (notificationBell) {
  notificationBell.addEventListener("click", function (event) {
    if (notificationDropdown) {
      notificationDropdown.classList.toggle("show");
      event.stopPropagation();
      if (notificationDropdown.classList.contains("show")) {
        renderNotifications();
      }
    }
  });
}

function hideAllDropdowns() {
  if (notificationDropdown) {
    notificationDropdown.classList.remove("show");
  }
  if (languageDropdown) {
    languageDropdown.classList.remove("show");
  }
  document.querySelectorAll(".settings-menu").forEach((menu) => {
    menu.classList.add("hidden");
  });
}
document.addEventListener("click", function (event) {
  if (
    notificationDropdown &&
    notificationBell &&
    !notificationDropdown.contains(event.target) &&
    !notificationBell.contains(event.target)
  ) {
    hideAllDropdowns();
  }
  if (
    languageDropdown &&
    languageToggleBtn &&
    !languageDropdown.contains(event.target) &&
    !languageToggleBtn.contains(event.target)
  ) {
    hideAllDropdowns();
  }
  if (!event.target.closest(".button_group")) {
    document.querySelectorAll(".settings-menu").forEach((menu) => {
      menu.classList.add("hidden");
    });
  }
});

// -----------------------------------------------------------
// 언어 설정 기능
// -----------------------------------------------------------

if (languageToggleBtn) {
  languageToggleBtn.addEventListener("click", function (event) {
    if (languageDropdown) {
      languageDropdown.classList.toggle("show");
      event.stopPropagation();
    }
  });
}

window.setLanguage = function (lang) {
  document.querySelectorAll("[data-lang-ko]").forEach((element) => {
    if (lang === "ko") {
      element.innerHTML = element.getAttribute("data-lang-ko");
    } else {
      element.innerHTML = element.getAttribute("data-lang-en");
    }
  });

  document.querySelectorAll("[data-lang-ko-placeholder]").forEach((element) => {
    if (lang === "ko") {
      element.setAttribute(
        "placeholder",
        element.getAttribute("data-lang-ko-placeholder")
      );
    } else {
      element.setAttribute(
        "placeholder",
        element.getAttribute("data-lang-en-placeholder")
      );
    }
  });

  document.querySelectorAll(".notification-item span").forEach((span) => {
    const parentItem = span.closest(".notification-item");
    const notificationId = parentItem.dataset.notificationId;
    const notification = notifications.find((n) => n.id == notificationId);
    if (notification) {
      span.textContent =
        lang === "ko" ? notification.message_ko : notification.message_en;
    }
  });
  if (noNotificationsMessage) {
    noNotificationsMessage.textContent =
      lang === "ko"
        ? noNotificationsMessage.getAttribute("data-lang-ko")
        : noNotificationsMessage.getAttribute("data-lang-en");
  }

  const headerDropdownItems = document.querySelectorAll(
    ".language-dropdown .dropdown-item"
  );
  headerDropdownItems.forEach((item) => {
    if (item.getAttribute("data-lang") === lang) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  });

  const settingLanguageSelect = document.getElementById(
    "settingLanguageSelect"
  );
  if (settingLanguageSelect) {
    const settingDropdownOptions =
      settingLanguageSelect.querySelectorAll("option");
    settingDropdownOptions.forEach((option) => {
      if (option.value === lang) {
        option.selected = true;
      } else {
        option.selected = false;
      }
    });
  }

  localStorage.setItem("currentLanguage", lang);
};

dropdownItems.forEach((item) => {
  item.addEventListener("click", function () {
    const selectedLang = this.getAttribute("data-lang");
    window.setLanguage(selectedLang);
    if (languageDropdown) {
      languageDropdown.classList.remove("show");
    }
  });
});

// -----------------------------------------------------------
// 설정 페이지 기능
// -----------------------------------------------------------

const notificationSwitch = document.getElementById("notificationSwitch");
const notificationToggleCard = document.getElementById("notificationToggle");
const notificationIcon = notificationToggleCard
  ? notificationToggleCard.querySelector(".setting-icon i")
  : null;

const savedNotification = localStorage.getItem("notifications");
if (savedNotification === "enabled") {
  if (notificationIcon) {
    notificationIcon.classList.remove("fa-bell-slash");
    notificationIcon.classList.add("fa-bell");
  }
  if (notificationSwitch) notificationSwitch.checked = true;
} else if (savedNotification === "disabled") {
  if (notificationIcon) {
    notificationIcon.classList.remove("fa-bell");
    notificationIcon.classList.add("fa-bell-slash");
  }
  if (notificationSwitch) notificationSwitch.checked = false;
}

window.toggleNotification = function () {
  if (notificationSwitch && notificationSwitch.checked) {
    if (notificationIcon) {
      notificationIcon.classList.remove("fa-bell-slash");
      notificationIcon.classList.add("fa-bell");
    }
    localStorage.setItem("notifications", "enabled");
    alert("알림이 켜졌습니다.");
  } else {
    if (notificationIcon) {
      notificationIcon.classList.remove("fa-bell");
      notificationIcon.classList.add("fa-bell-slash");
    }
    localStorage.setItem("notifications", "disabled");
    alert("알림이 꺼졌습니다.");
  }
};

if (notificationSwitch) {
  notificationSwitch.addEventListener("change", window.toggleNotification);
}
if (notificationToggleCard) {
  notificationToggleCard.addEventListener("click", function (event) {
    if (
      notificationSwitch &&
      event.target !== notificationSwitch &&
      !notificationSwitch.contains(event.target)
    ) {
      notificationSwitch.checked = !notificationSwitch.checked;
      window.toggleNotification();
    }
  });
}

const settingLanguageSelect = document.getElementById("settingLanguageSelect");
if (settingLanguageSelect) {
  settingLanguageSelect.value = localStorage.getItem("currentLanguage") || "ko";
  settingLanguageSelect.addEventListener("change", function () {
    const selectedLang = this.value;
    window.setLanguage(selectedLang);
  });
}

const customerSupportCard = document.getElementById("customerSupportCard");
if (customerSupportCard) {
  customerSupportCard.addEventListener("click", function () {
    alert("고객 상담 페이지로 이동합니다. (또는 챗봇/모달 팝업 구현 예정)");
  });
}

const fireExtinguisherDisposalCard = document.getElementById(
  "fireExtinguisherDisposal"
);
if (fireExtinguisherDisposalCard) {
  fireExtinguisherDisposalCard.addEventListener("click", function () {
    window.open("https://www.esgfire.kr/process", "_blank");
  });
}
