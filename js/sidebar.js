function showPage(pageId) {
  // 모든 페이지 콘텐츠 숨기기
  document.querySelectorAll(".page-content").forEach((page) => {
    page.style.display = "none";
  });

  // 모든 사이드바 메뉴 active 클래스 제거
  document.querySelectorAll(".menu-item").forEach((item) => {
    item.classList.remove("active");
  });

  // 선택된 페이지 보이기
  const targetPage = document.getElementById(`${pageId}-page-content`);
  if (targetPage) {
    targetPage.style.display = "flex"; // flex로 설정하여 내부 flexbox 구조 유지
    // 해당 사이드바 메뉴에 active 클래스 추가
    const activeMenuItem = document.querySelector(
      `.menu-item[data-page="${pageId}"]`
    );
    if (activeMenuItem) {
      activeMenuItem.classList.add("active");
    }

    // 페이지별 초기화 로직
    if (pageId === "data-management") {
      loadManagementItems(); // 데이터 관리 페이지 진입 시 데이터 로드 및 렌더링
      document.getElementById("detail-view")?.classList.add("hidden"); // 상세 뷰 숨김
      dataManagementPageContent
        .querySelector(".data-management-page-content-inner")
        ?.classList.remove("hidden"); // 목록 뷰 보이게

      // 데이터 관리 페이지로 돌아올 때 모든 차트 인스턴스 파괴
      Object.values(chartInstances).forEach((chart) => chart.destroy());
      chartInstances = {}; // 차트 인스턴스 초기화
    } else if (pageId === "dashboard") {
      // 대시보드 (지도) 페이지 초기화 로직
      if (!map) {
        // 지도가 아직 초기화되지 않았다면 초기화
        mainKakaoMapInit();
      } else {
        // 이미 초기화된 지도는 relayout
        map.relayout(); // 지도가 숨겨졌다 보여질 때 레이아웃 재조정
        map.setCenter(new kakao.maps.LatLng(36.318315, 127.367326)); // 센터 재설정
      }
    }
    // 다른 페이지로 이동할 때 현재 열려있는 드롭다운 메뉴나 설정 메뉴는 모두 닫기
    hideAllDropdowns();
  } else {
    console.error(`Page content with ID "${pageId}-page-content" not found.`);
  }
}

// 초기 사이드바 및 페이지 설정
function initializeSidebarAndPageSwitch() {
  // 사이드바 토글 버튼 이벤트
  if (sidebarToggleBtn) {
    sidebarToggleBtn.addEventListener("click", function () {
      sidebar.classList.toggle("collapsed");
      const icon = this.querySelector("i");
      if (sidebar.classList.contains("collapsed")) {
        icon.classList.remove("fa-chevron-left");
        icon.classList.add("fa-chevron-right");
      } else {
        icon.classList.remove("fa-chevron-right");
        icon.classList.add("fa-chevron-left");
      }
    });
  }

  // 사이드바 메뉴 클릭 이벤트
  document.querySelectorAll(".menu-item").forEach((item) => {
    item.addEventListener("click", function () {
      const pageId = this.getAttribute("data-page");
      if (pageId) {
        showPage(pageId);
      }
    });
  });

  // 애플리케이션 시작 시 기본 페이지 표시 (대시보드)
  showPage("dashboard");
}
