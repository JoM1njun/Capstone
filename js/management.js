// Data Management & Detail View
// -----------------------------------------------------------

async function loadManagementItems() {
  try {
    console.log("API 호출 시작:", `${API_BASE_URL}/management`);
    const res = await fetch(`${API_BASE_URL}/management`);

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`HTTP 오류: ${res.status} ${res.statusText}`, errorText);
      throw new Error(`서버 응답 오류: ${res.status} ${res.statusText}`);
    }

    managementData = await res.json();
    console.log("Management Data Loaded:", managementData);
    renderDataManagementPage();
  } catch (error) {
    console.error("Failed to load management items:", error);
    alert("데이터 관리 항목을 불러오는 데 실패했습니다: " + error.message);
  }
}

function formatDate(dateString) {
  if (!dateString) return "정보 없음";
  // Date 객체로 변환을 시도하고, 실패하면 원본 문자열 반환
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    // YYYY년 MM월 DD일 형식 처리 (예: 2023년 10월 26일)
    const match = dateString.match(/(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/);
    if (match) {
      const [_, year, month, day] = match;
      return `${year}년 ${parseInt(month)}월 ${parseInt(day)}일`;
    }
    return String(dateString); // 변환 실패 시 원본 문자열 그대로 반환
  }
  const options = { year: "numeric", month: "long", day: "numeric" };
  return date.toLocaleDateString("ko-KR", options);
}

function renderDataManagementPage() {
  const accordionContainer = document.querySelector(".accordion-container");
  if (!accordionContainer) {
    console.error("Accordion container not found.");
    return;
  }
  accordionContainer.innerHTML = "";

  // 기존 건물별 차트 인스턴스 파괴 (renderDataManagementPage가 다시 호출될 때)
  for (const chartId in chartInstances) {
    if (
      chartId.startsWith("buildingChart_") &&
      chartInstances.hasOwnProperty(chartId) &&
      chartInstances[chartId]
    ) {
      chartInstances[chartId].destroy();
      delete chartInstances[chartId];
    }
  }

  const groupedData = managementData.reduce((acc, item) => {
    const buildingName = item.location.split(" ")[0];
    if (!acc[buildingName]) {
      acc[buildingName] = [];
    }
    acc[buildingName].push(item);
    return acc;
  }, {});

  Object.keys(groupedData).forEach((buildingName) => {
    const accordionItem = document.createElement("div");
    accordionItem.classList.add("accordion-item");

    const accordionHeader = document.createElement("button");
    accordionHeader.classList.add("accordion-header");
    accordionHeader.innerHTML = `
            <span class="building-name">${buildingName}</span>
            <i class="fas fa-chevron-down"></i>
        `;
    accordionItem.appendChild(accordionHeader);

    const accordionContent = document.createElement("div");
    accordionContent.classList.add("accordion-content");

    // 건물별 현황 그래프 컨테이너 추가
    const chartContainerBuilding = document.createElement("div");
    chartContainerBuilding.classList.add("chart-container-building");
    const buildingChartId = `buildingChart_${buildingName.replace(/\s+/g, "")}`; // 공백 제거
    chartContainerBuilding.innerHTML = `<canvas class="building-chart" id="${buildingChartId}"></canvas>`;
    accordionContent.appendChild(chartContainerBuilding);

    const tableContainer = document.createElement("div");
    tableContainer.classList.add("facility-table-custom-container");

    const table = document.createElement("table");
    table.classList.add("facility-status-overview-table");
    table.innerHTML = `
            <thead>
                <tr>
                    <th data-lang-ko="Name" data-lang-en="Name">Name</th>
                    <th data-lang-ko="Type" data-lang-en="Type">Type</th>
                    <th data-lang-ko="Date" data-lang-en="Date">Date</th>
                    <th data-lang-ko="Location" data-lang-en="Location">Location</th>
                    <th data-lang-ko="Status" data-lang-en="Status">Status</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;
    const tbody = table.querySelector("tbody");

    groupedData[buildingName].forEach((item) => {
      const row = document.createElement("tr");
      row.innerHTML = `
                <td>${item.name}</td>
                <td>${item.type}</td>
                <td>${formatDate(item.date)}</td>
                <td>${item.location}</td>
                <td><span class="status-badge ${
                  parseInt(item.status) === 1 ? "status-on" : "status-off"
                }">${parseInt(item.status) === 1 ? "ON" : "OFF"}</span></td>
            `;
      row.style.cursor = "pointer";
      // 개별 시설 항목 클릭 시 상세 뷰를 보여주는 핵심
      row.addEventListener("click", () => {
        console.log(`시설 항목 클릭됨: ${item.name}, ID: ${item.id}`); // 디버깅 로그
        showDetailView(item);
      });
      tbody.appendChild(row);
    });

    tableContainer.appendChild(table);
    accordionContent.appendChild(tableContainer);
    accordionItem.appendChild(accordionContent);
    accordionContainer.appendChild(accordionItem);
  });

  document.querySelectorAll(".accordion-header").forEach((header) => {
    header.addEventListener("click", function () {
      const accordionContent = this.nextElementSibling;
      const buildingName = this.querySelector(".building-name").textContent;
      const buildingChartId = `buildingChart_${buildingName.replace(
        /\s+/g,
        ""
      )}`;

      this.classList.toggle("active");

      if (accordionContent.style.maxHeight) {
        accordionContent.style.maxHeight = null;
        accordionContent.style.padding = "0 20px";
        // 아코디언이 닫힐 때 해당 건물 차트 파괴
        if (chartInstances[buildingChartId]) {
          chartInstances[buildingChartId].destroy();
          delete chartInstances[buildingChartId];
        }
      } else {
        // max-height를 먼저 설정하여 콘텐츠가 보이도록 함
        accordionContent.style.maxHeight = accordionContent.scrollHeight + "px";
        accordionContent.style.padding = "0 20px 20px";
        // 아코디언이 열릴 때 해당 건물 차트 렌더링
        const itemsForBuilding = managementData.filter((item) =>
          item.location.startsWith(buildingName)
        );
        // Chart.js 캔버스 ID와 buildingName을 함께 전달
        renderBuildingChart(buildingChartId, itemsForBuilding, buildingName);
      }
    });
  });
}

function showDetailView(item) {
  console.log("showDetailView 호출됨. 항목:", item); // 디버깅 로그

  if (!dataManagementPageContent) {
    console.error("dataManagementPageContent not found.");
    return;
  }

  dataManagementPageContent
    .querySelector(".data-management-page-content-inner")
    ?.classList.add("hidden");
  // display: flex !important를 적용하기 위해 classList.remove 대신 직접 스타일 변경
  const detailViewElement = document.getElementById("detail-view");
  if (detailViewElement) {
    detailViewElement.style.display = "flex";
    detailViewElement.classList.remove("hidden"); // hidden 클래스도 제거
  }

  const content = document.getElementById("detail-content");
  if (!content) {
    console.error("detail-content not found.");
    return;
  }

  // content.dataset.itemId = item.id;

  // content.innerHTML = `
  //       <div class="detail-header">
  //           <h3>${item.name} 상세 정보</h3>
  //           <div class="button_group">
  //               <button onclick="toggleMenu(this)" class="edit-btn">
  //                   <span class="material-symbols-outlined">more_vert</span>
  //               </button>
  //               <div class="settings-menu hidden">
  //                   <button onclick="editRow(this)">수정</button>
  //                   <button class="save-btn hidden">저장</button>
  //                   <button onclick="deleteRow(this)">삭제</button>
  //               </div>
  //           </div>
  //       </div>
  //       <div class="detail-body">
  //           <p><strong>종류 :</strong> ${item.type}</p>
  //           <p><strong>제조일자 :</strong> ${formatDate(item.date)}</p>
  //           <p><strong>위치 :</strong> ${item.location}</p>
  //           <p><strong>희석된 날짜 :</strong> ${formatDate(item.shake_date)}</p>
  //       </div>
  //       <div class="chart-container">
  //           <canvas id="movementChart"></canvas>
  //       </div>
  //   `;
  content.dataset.itemId = item.id;

  const detailHeader = content.querySelector(".detail-header h3");
  const detailBody = content.querySelector(".detail-body");
  const editBtn = content.querySelector(".edit-action-btn");
  const saveBtn = content.querySelector(".save-btn");
  const deleteBtn = content.querySelector(".delete-action-btn");
  const settingsMenu = content.querySelector(".settings-menu");
  const moreVertButton = content.querySelector(".button_group .edit-btn");

  const currentLang = localStorage.getItem("currentLanguage") || "ko";
  detailHeader.textContent = `${item.name} ${
    currentLang === "ko" ? "상세 정보" : "Detail Information"
  }`;

  detailBody.innerHTML = `
        <p><strong><span data-lang-ko="종류" data-lang-en="Type">종류</span> :</strong> ${
          item.type
        }</p>
        <p><strong><span data-lang-ko="제조일자" data-lang-en="Manufacturing Date">제조일자</span> :</strong> ${formatDate(
          item.date
        )}</p>
        <p><strong><span data-lang-ko="위치" data-lang-en="Location">위치</span> :</strong> ${
          item.location
        }</p>
        <p><strong><span data-lang-ko="희석된 날짜" data-lang-en="Dilution Date">희석된 날짜</span> :</strong> ${formatDate(
          item.shake_date
        )}</p>
    `;

  // 저장 버튼 숨김, 수정 버튼 보임
  saveBtn.classList.add("hidden");
  editBtn.classList.remove("hidden");

  // 이벤트 리스너 재할당 및 클로저를 이용한 item 전달
  // 점 3개 아이콘 클릭 시 메뉴 토글
  moreVertButton.onclick = function (event) {
    toggleMenu(this); // 'this'는 moreVertButton 자신을 가리킵니다.
    event.stopPropagation(); // document 클릭 이벤트로 메뉴가 바로 닫히는 것을 방지
  };

  // '수정' 버튼 클릭 시 editRow 호출
  editBtn.onclick = function () {
    editRow(editBtn, saveBtn, detailBody);
    settingsMenu.classList.add("hidden"); // 수정 버튼 클릭 시 메뉴 닫기
    // 수정 모드로 전환 시 언어 설정도 다시 적용
    window.setLanguage(localStorage.getItem("currentLanguage") || "ko");
  };

  // '저장' 버튼 클릭 시 saveDetail 호출
  saveBtn.onclick = function () {
    saveDetail(item.id, item, editBtn, saveBtn, detailBody);
    settingsMenu.classList.add("hidden"); // 저장 버튼 클릭 시 메뉴 닫기
  };

  // '삭제' 버튼 클릭 시 deleteRow 호출
  deleteBtn.onclick = function () {
    deleteRow(item.id);
    settingsMenu.classList.add("hidden"); // 삭제 버튼 클릭 시 메뉴 닫기
  };

  // 혹시 모를 경우를 대비해 메뉴 닫기
  settingsMenu.classList.add("hidden");

  // 상세 뷰의 텍스트에 언어 전환 적용
  window.setLanguage(localStorage.getItem("currentLanguage") || "ko");

  setTimeout(() => {
    console.log("chart 함수 호출 시도:", item.id); // 디버깅 로그
    chart(item.id);
  }, 100);
}

function toggleMenu(button) {
  document.querySelectorAll(".settings-menu").forEach((menu) => {
      menu.classList.add("hidden");
  });
  const menu = button.parentNode.querySelector(".settings-menu");
  if (menu) {
    menu.classList.toggle("hidden");
  } else {
    console.error("settings-menu not found near button:", button);
  }
}

async function editRow(button) {
  const content = document.getElementById("detail-content");
  const detailBody = content.querySelector(".detail-body");
  const paragraphs = detailBody.querySelectorAll("p");
  const itemId = content.dataset.itemId;

  // '수정' 버튼 숨기고 '저장' 버튼 보이기
  button.classList.add("hidden");
  const saveButton = button.nextElementSibling?.querySelector(".save-btn");
  if (saveButton) saveButton.classList.remove("hidden");

  const originalData = Array.from(paragraphs).map((p) => {
    const text = p.textContent.split(": ")[1];
    return { element: p, originalText: text, originalHTML: p.innerHTML };
  });

  try {
    const placeResponse = await fetch(`${API_BASE_URL}/places`);
    if (!placeResponse.ok) throw new Error("Failed to fetch places data");
    const placesData = await placeResponse.json();

    const buildingList = placesData.map((b) => b.name);
    const floorMap = {};
    placesData.forEach((b) => {
      floorMap[b.name] = Array.from({ length: parseInt(b.maxfloor) }, (_, i) =>
        (i + 1).toString()
      );
    });

    paragraphs.forEach((p, index) => {
      const text = p.textContent.split(": ")[1];
      const strong = p.querySelector("strong")?.textContent;

      if (strong && strong.includes("종류 :")) {
        const currentType = text.trim();
        p.innerHTML = `
                    <strong>${strong}</strong>
                    <div class="radio-group">
                        <label><input type="radio" name="type" value="소화기" ${
                          currentType === "소화기" ? "checked" : ""
                        }> 소화기</label>
                        <label><input type="radio" name="type" value="소화전" ${
                          currentType === "소화전" ? "checked" : ""
                        }> 소화전</label>
                        <label><input type="radio" name="type" value="AED" ${
                          currentType === "AED" ? "checked" : ""
                        }> AED</label>
                    </div>
                `;
      } else if (
        strong &&
        (strong === "제조일자 :" || strong === "희석된 날짜 :")
      ) {
        try {
          const dateStr = text.trim();
          const match = dateStr.match(/(\d+)년\s*(\d+)월\s*(\d+)일/);
          let formattedDate = "";
          if (match) {
            const [_, year, month, day] = match;
            formattedDate = `${year}-${month.padStart(2, "0")}-${day.padStart(
              2,
              "0"
            )}`;
          } else {
            const d = new Date(dateStr);
            if (!isNaN(d.getTime())) {
              formattedDate = `${d.getFullYear()}-${String(
                d.getMonth() + 1
              ).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
            }
          }

          p.innerHTML = `
                        <strong>${strong}</strong>
                        <input type="date" value="${formattedDate}" class="edit-input date-input" min="2000-01-01" max="2100-12-31">
                    `;
        } catch (error) {
          console.error("날짜 형식 변환 오류:", error);
          p.innerHTML = `<strong>${strong}</strong><input type="text" value="${text}" class="edit-input">`;
        }
      } else if (strong && strong.includes("위치")) {
        const currentLocation = text.trim();
        const [currentBuilding, currentFloorNum] = currentLocation.split(" ");
        const currentFloorClean = currentFloorNum
          ? currentFloorNum.replace("층", "")
          : "";

        const buildingOptions = buildingList
          .map(
            (b) =>
              `<option value="${b}" ${
                b === currentBuilding ? "selected" : ""
              }>${b}</option>`
          )
          .join("");

        let initialFloorOptions = "";
        if (floorMap[currentBuilding]) {
          initialFloorOptions = floorMap[currentBuilding]
            .map(
              (f) =>
                `<option value="${f}" ${
                  f === currentFloorClean ? "selected" : ""
                }>${f}층</option>`
            )
            .join("");
        }

        p.innerHTML = `
                    <strong>${strong}</strong>
                    <div class="location-selects">
                        <select id="buildingSelect">${buildingOptions}</select>
                        <select id="floorSelect">${initialFloorOptions}</select>
                    </div>
                `;

        setTimeout(() => {
          const buildingSelect = p.querySelector("#buildingSelect");
          const floorSelect = p.querySelector("#floorSelect");

          if (buildingSelect && floorSelect) {
            buildingSelect.addEventListener("change", () => {
              const selectedBuilding = buildingSelect.value;
              const floors = floorMap[selectedBuilding] || [];
              floorSelect.innerHTML = floors
                .map((f) => `<option value="${f}">${f}층</option>`)
                .join("");
            });
          }
        }, 0);
      } else {
        // 나머지 필드는 텍스트 입력
        p.innerHTML = `<strong>${
          p.querySelector("strong")?.textContent
        }</strong> 
                <input type="text" value="${text}" class="edit-input">`;
      }
    });

    // saveDetail 함수에 editButton을 전달하여 saveDetail 완료 후 '수정' 버튼을 다시 표시하도록 함
    if (saveButton) {
      saveButton.onclick = () => saveDetail(itemId, originalData, button);
    }
  } catch (error) {
    console.error("Error fetching places data for edit:", error);
    alert("위치 정보를 불러오는 데 실패했습니다: " + error.message);
    // 오류 발생 시 원본 데이터로 되돌리기
    originalData.forEach((data) => {
      if (data.element) data.element.innerHTML = data.originalHTML;
    });
    // '수정' 버튼 다시 보이게, '저장' 버튼 숨기게
    button.classList.remove("hidden");
    if (button.nextElementSibling)
      button.nextElementSibling.classList.add("hidden");
  }
}

async function saveDetail(itemId, originalData, editButton) {
  const content = document.getElementById("detail-content");
  const detailBody = content.querySelector(".detail-body");

  const selectedType = detailBody.querySelector(
    'input[name="type"]:checked'
  )?.value;
  const dateInput = detailBody.querySelector('input[type="date"]');
  const shakeDateInput = detailBody.querySelectorAll('input[type="date"]')[1];
  const buildingSelect = detailBody.querySelector("#buildingSelect");
  const floorSelect = detailBody.querySelector("#floorSelect");

  if (!selectedType) {
    alert("종류를 선택해주세요.");
    return;
  }
  if (!dateInput?.value) {
    alert("제조일자를 입력해주세요.");
    return;
  }
  if (!shakeDateInput?.value) {
    alert("희석된 날짜를 입력해주세요.");
    return;
  }
  if (!buildingSelect?.value || !floorSelect?.value) {
    alert("위치를 선택해주세요.");
    return;
  }

  const newLocation = `${buildingSelect.value} ${floorSelect.value}층`;

  const updatedData = {
    name: content.querySelector("h3")?.textContent.split(" 상세 정보")[0],
    type_name: selectedType,
    date: dateInput.value,
    location: newLocation,
    shake_date: shakeDateInput.value,
  };

  // originalData의 날짜를 YYYY-MM-DD 형식으로 통일하여 비교
  const originalParsedValues = originalData.map((item) => {
    const strongText = item.element.querySelector("strong")?.textContent;
    if (strongText && strongText.includes("종류")) {
      return item.originalText.trim();
    } else if (
      strongText &&
      (strongText.includes("제조일자") || strongText.includes("희석된 날짜"))
    ) {
      // "YYYY년 MM월 DD일" -> "YYYY-MM-DD"로 변환
      const match = item.originalText.match(
        /(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/
      );
      if (match) {
        const [_, year, month, day] = match;
        return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
      }
      return item.originalText; // 변환 실패 시 원본 그대로
    } else if (strongText && strongText.includes("위치")) {
      return item.originalText.trim();
    }
    return item.originalText; // 그 외 일반 텍스트
  });

  const hasChanges =
    updatedData.type_name !== originalParsedValues[0] ||
    updatedData.date !== originalParsedValues[1] ||
    updatedData.location !== originalParsedValues[2] ||
    updatedData.shake_date !== originalParsedValues[3];

  if (!hasChanges) {
    alert("수정된 내용이 없습니다.");
    originalData.forEach((data) => {
      if (data.element) data.element.innerHTML = data.originalHTML;
    });
    editButton.classList.remove("hidden");
    content.querySelector(".save-btn")?.classList.add("hidden");
    hideAllDropdowns();
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/management/${itemId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "서버 오류가 발생하였습니다.");
    } else {
      console.log("Update successful.");
      await loadManagementItems(); // 데이터를 다시 로드하여 최신 정보 반영
      showPage("data-management"); // 데이터 관리 페이지로 돌아가기
      alert("데이터가 성공적으로 저장되었습니다.");
    }
  } catch (error) {
    console.error("Error updating data:", error);
    alert("데이터 업데이트 중 오류가 발생했습니다: " + error.message);
  } finally {
    // 수정 모드 종료 후 원래 상태로 복구
    originalData.forEach((data) => {
      if (data.element) data.element.innerHTML = data.originalHTML;
    });
    editButton.classList.remove("hidden");
    content.querySelector(".save-btn")?.classList.add("hidden");
    hideAllDropdowns();
  }
}

async function deleteRow(button) {
  const content = document.getElementById("detail-content");
  const itemId = content?.dataset.itemId;

  if (!itemId) {
    console.error("Item ID not found for deletion.");
    alert("삭제할 항목을 찾을 수 없습니다.");
    return;
  }

  if (confirm("정말로 이 항목을 삭제하시겠습니까?")) {
    try {
      const response = await fetch(`${API_BASE_URL}/management/${itemId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "데이터 삭제에 실패했습니다.");
      } else {
        console.log("Deletion successful.");
        await loadManagementItems(); // 목록 새로고침
        showPage("data-management"); // 목록 화면으로 돌아가기
        alert("데이터가 성공적으로 삭제되었습니다.");
      }
    } catch (error) {
      console.error("Error deleting data:", error);
      alert("데이터 삭제 중 오류가 발생했습니다: " + error.message);
    }
  }
}

document.getElementById("back-button")?.addEventListener("click", () => {
  // detail-view를 숨길 때 display 속성을 'none'으로 명시적으로 설정
  const detailViewElement = document.getElementById("detail-view");
  if (detailViewElement) {
    detailViewElement.style.display = "none";
    detailViewElement.classList.add("hidden"); // hidden 클래스도 다시 추가
  }

  dataManagementPageContent
    .querySelector(".data-management-page-content-inner")
    ?.classList.remove("hidden");
  renderDataManagementPage(); // 목록을 새로고침하여 최신 상태를 반영
});
