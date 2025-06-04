let managementData = []; // DB 데이터 가져올 용도
const itemsPerPage = 7; // 최대 페이지 수
let currentPage = 1; // 현재 페이지

// DB 데이터 가져오기
async function loadManagementItems() {
  const res = await fetch("http://43.201.78.22:3000/api/management");
  managementData = await res.json();
  console.log("Data : ", managementData);
  console.log("Test");

  renderPage();
}

// DB Date 날짜 포맷
function formatDate(dateString) {
  const date = new Date(dateString);
  const options = { year: "numeric", month: "long", day: "numeric" };
  return date.toLocaleDateString("ko-KR", options); // 한국어로 포맷팅
}

function showManagement() {
  console.log("showManagement!!");
  // 관리 페이지 UI 초기화
  hideAllSections(); // 다른 화면 다 숨기기
  document.getElementById("management").style.display = "block";
  document.getElementById("pagination").style.display = "block";
  document.getElementById("detail-view").classList.add("hidden");
  document.getElementById("management-container").classList.remove("hidden");
  document.getElementById("management-list").classList.remove("hidden");

  // 필요한 경우 다시 데이터를 불러오거나 페이지 초기화
  currentPage = 1;

  if (managementData.length === 0) {
    loadManagementItems();
  } else {
    renderPage();
  }
}

// Management 화면 표시
function renderPage() {
  const listContainer = document.getElementById("management-list");
  listContainer.innerHTML = "";

  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const currentItems = managementData.slice(start, end);

  currentItems.forEach((item) => {
    const itemDiv = document.createElement("div");
    itemDiv.className = "management-item";
    itemDiv.innerHTML = `
            <span contenteditable="false">${item.name}</span>
            <span contenteditable="false">${item.type}</span>
            <span contenteditable="false">${formatDate(item.date)}</span>
            <span contenteditable="false">${item.location}</span>
            <span contenteditable="false" style="color: ${
              parseInt(item.status) === 1 ? "green" : "red"
            };">${parseInt(item.status) === 1 ? "ON" : "OFF"}</span>
        `;
    itemDiv.addEventListener("click", () => {
      showDetailView(item);
    });
    listContainer.appendChild(itemDiv);
  });

  renderPagination();
}

// 페이지 이동 기능
function renderPagination() {
  const totalPages = Math.ceil(managementData.length / itemsPerPage);
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";

  if (currentPage > 1) {
    const prevBtn = document.createElement("button");
    prevBtn.innerHTML = "이전 페이지"; //&lt;
    prevBtn.onclick = () => {
      currentPage--;
      flashPage();
      loadManagementItems();
    };
    pagination.appendChild(prevBtn);
  }

  if (currentPage < totalPages) {
    const nextBtn = document.createElement("button");
    nextBtn.innerHTML = "다음 페이지"; //&gt;
    nextBtn.onclick = () => {
      currentPage++;
      flashPage();
      loadManagementItems();
    };
    pagination.appendChild(nextBtn);
  }
}

function flashPage() {
  const overlay = document.createElement("div");
  overlay.style.position = "fixed";
  overlay.style.top = 0;
  overlay.style.left = 0;
  overlay.style.width = "100vw";
  overlay.style.height = "100vh";
  overlay.style.backgroundColor = "#f0f9ff"; // 원하는 색상
  overlay.style.opacity = "0.6";
  overlay.style.zIndex = "9999";
  overlay.style.pointerEvents = "none"; // 클릭 막지 않게

  document.body.appendChild(overlay);

  setTimeout(() => {
    overlay.remove();
  }, 200); // 깜빡임 지속 시간 (밀리초)
}

function showDetailView(item) {
  console.log("Detail");
  document.getElementById("management-container").classList.add("hidden");
  document.getElementById("pagination").style.display = "none";
  document.getElementById("detail-view").classList.remove("hidden");

  const content = document.getElementById("detail-content");
  content.dataset.itemId = item.id;

  content.innerHTML = `
        <div class="detail-header">
            <h3>${item.name} 상세 정보</h3>
            <div class="button_group">
                <button onclick="toggleMenu(this)" class="edit-btn">
                    <span class="material-symbols-outlined">more_vert</span>
                </button>
                <div class="settings-menu hidden">
                    <button onclick="editRow(this)">수정</button>
                    <button class="save-btn">저장</button>
                    <button onclick="deleteRow(this)">삭제</button>
                </div>
            </div>
        </div>
        <div class="detail-body">
            <p><strong>종류 :</strong> ${item.type}</p>
            <p><strong>제조일자 :</strong> ${formatDate(item.date)}</p>
            <p><strong>위치 :</strong> ${item.location}</p>
            <p><strong>희석된 날짜 :</strong> ${formatDate(item.shake_date)}</p>
        </div>
        <div class="chart-container">
            <canvas id="movementChart"></canvas>
        </div>
    `;

  setTimeout(() => {
    chart(item.id); // 차트 생성 함수 호출
  }, 100);
}

function toggleMenu(button) {
  // 모든 열린 메뉴 닫기
  document.querySelectorAll(".settings-menu").forEach((menu) => {
    if (menu !== button.nextElementSibling) {
      menu.classList.add("hidden");
    }
  });

  // 현재 버튼 옆 메뉴 열기
  const menu = button.nextElementSibling;
  menu.classList.toggle("hidden");
}

function editRow(button) {
  const content = document.getElementById("detail-content");
  const detailBody = content.querySelector(".detail-body");
  const paragraphs = detailBody.querySelectorAll("p");
  const itemId = content.dataset.itemId;

  // 원본 데이터 저장
  const originalData = Array.from(paragraphs).map((p) => {
    const text = p.textContent.split(": ")[1];
    return {
      element: p,
      originalText: text,
    };
  });

  fetch("http://localhost:3000/api/places")
    .then((res) => res.json())
    .then((data) => {
      const buildingList = data.map((b) => b.name);
      const floorMap = {};

      data.forEach((b) => {
        floorMap[b.name] = Array.from({ length: parseInt(b.maxfloor) }, (_, i) =>
          (i + 1).toString());
      });
      
      console.log("Building : ", buildingList);
      console.log("Floor : ", floorMap);

      // 수정 모드 전환
      paragraphs.forEach((p, index) => {
        const text = p.textContent.split(": ")[1];
        const strong = p.querySelector("strong").textContent;

        // 종류는 Radio Button으로 변경
        if (strong.includes("종류 :")) {
          const currentType = text.trim();
          p.innerHTML = `
      <strong>${strong}</strong>
      <div class="radio-group">
        <label>
          <input type="radio" name="type" value="소화기" ${
            currentType === "소화기" ? "checked" : ""
          }>
          소화기
        </label>
        <label>
          <input type="radio" name="type" value="소화전" ${
            currentType === "소화전" ? "checked" : ""
          }>
          소화전
        </label>
        <label>
          <input type="radio" name="type" value="AED" ${
            currentType === "AED" ? "checked" : ""
          }>
          AED
        </label>
      </div>
      `;
        } else if (strong === "제조일자 :" || strong === "희석된 날짜 :") {
          // 한국어 날짜 형식을 YYYY-MM-DD 형식으로 변환
          try {
            const dateStr = text.trim();
            const [year, month, day] = dateStr
              .match(/(\d+)년\s*(\d+)월\s*(\d+)일/)
              .slice(1);
            const formattedDate = `${year}-${month.padStart(
              2,
              "0"
            )}-${day.padStart(2, "0")}`;

            p.innerHTML = `
          <strong>${strong}</strong>
          <input type="date" 
                 value="${formattedDate}" 
                 class="edit-input date-input"
                min="2000-01-01" 
                max="2100-12-31">
        `;
          } catch (error) {
            console.error("날짜 형식 변환 오류:", error);
            p.innerHTML = `<strong>${strong}</strong>
        <input type="text" value="${text}" class="edit-input">`;
          }
        } else if (strong.includes("위치")) {
          const currentLocation = text.trim(); // ex) 하워드관 1층
          const [currentBuilding, currentFloor] = currentLocation.split(" ");

          // 예시: buildingList와 floorList는 전역 혹은 editRow 호출 전에 미리 받아온다고 가정
          const buildingOptions = buildingList
            .map(
              (b) =>
                `<option value="${b}" ${
                  b === currentBuilding ? "selected" : ""
                }>${b}</option>`
            )
            .join("");

          const floorOptions = floorMap[currentBuilding]
            .map(
              (f) =>
                `<option value="${f}" ${
                  f === currentFloor.replace("층", "") ? "selected" : ""
                }>${f}층</option>`
            )
            .join("");

          p.innerHTML = `
    <strong>${strong}</strong>
    <div class="location-selects">
      <select id="buildingSelect">${buildingOptions}</select>
      <select id="floorSelect">${floorOptions}</select>
    </div>
  `;

          // 건물 변경 시 해당 건물의 층수 리스트로 갱신
          setTimeout(() => {
            const buildingSelect = p.querySelector("#buildingSelect");
            const floorSelect = p.querySelector("#floorSelect");

            buildingSelect.addEventListener("change", () => {
              const selectedBuilding = buildingSelect.value;
              const floors = floorMap[selectedBuilding];

              floorSelect.innerHTML = floors
                .map((f) => `<option value="${f}">${f}층</option>`)
                .join("");
            });
          }, 0);
        } else {
          // 나머지 필드는 텍스트 입력
          p.innerHTML = `<strong>${
            p.querySelector("strong").textContent
          }</strong> 
      <input type="text" value="${text}" class="edit-input">`;
        }
      });
    });

  // 저장 버튼 설정 부분 수정
  const saveButton = button
    .closest(".settings-menu")
    .querySelector(".save-btn");

  const newSaveButton = saveButton.cloneNode(true); // 버튼 복제 (이벤트 리스너 초기화됨)
  saveButton.parentNode.replaceChild(newSaveButton, saveButton); // 기존 버튼 교체

  newSaveButton.addEventListener("click", () => {
    console.log("저장 버튼 클릭됨");
    saveDetail(itemId, originalData);
  });
}

// 상세 정보 저장 함수
async function saveDetail(itemId, originalData) {
  const content = document.getElementById("detail-content");
  const detailBody = content.querySelector(".detail-body");
  const inputs = detailBody.querySelectorAll(".edit-input");
  console.log("저장 중...");
  console.log("itemId : ", itemId);
  console.log("originalData : ", originalData);

  // radio button 값 가져오기
  const selectedType = detailBody.querySelector(
    'input[name="type"]:checked'
  )?.value;
  if (!selectedType) {
    alert("종류를 선택해주세요.");
    return;
  }

  // 위치 정보 가져오기
  const buildingSelect = detailBody.querySelector("#buildingSelect");
  const floorSelect = detailBody.querySelector("#floorSelect");
  
  console.log("buildingSelect:", buildingSelect);
  console.log("floorSelect:", floorSelect);
  console.log("buildingSelect value:", buildingSelect?.value);
  console.log("floorSelect value:", floorSelect?.value);

  const location = buildingSelect && floorSelect 
    ? `${buildingSelect.value} ${floorSelect.value}층`
    : originalData[2].originalText;
    
  console.log("location value:", location);

  // 수정된 데이터 수집
  const updatedData = {
    name: content.querySelector("h3").textContent.split(" 상세 정보")[0], // 이름은 h3 태그에서 가져옵니다
    type_name: selectedType,
    date: inputs[0].value,
    location: location,
    shake_date: inputs[1].value,
  };

  // 현재 입력된 값과 원본 데이터 비교
  const hasChanges =
    updatedData.type_name !== originalData[0].originalText ||
    updatedData.date !== originalData[1].originalText ||
    updatedData.location !== originalData[2].originalText ||
    updatedData.shake_date !== originalData[3].originalText;
  console.log("Updated Data Same : ", hasChanges);

  if (!hasChanges) {
    console.log("수정된 내용이 없습니다.");
    alert("수정된 내용이 없습니다.");
    showManagement();
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:3000/api/management/${itemId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "서버 오류가 발생하였습니다.");
    } else {
      const result = await response.json();
      console.log("Update successful:", result);

      // 데이터 업데이트 성공 시 목록 새로고침
      await loadManagementItems();
      showManagement();
      alert("데이터가 성공적으로 저장되었습니다.");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("데이터 업데이트 중 오류가 발생했습니다.");
  }
}

async function deleteRow(button) {
  const content = document.getElementById("detail-content");
  const itemId = content.dataset.itemId;

  if (confirm("정말로 이 항목을 삭제하시겠습니까?")) {
    try {
      const response = await fetch(
        `http://localhost:3000/api/management/${itemId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        // 삭제 성공
        await loadManagementItems(); // 목록 새로고침
        showManagement(); // 목록 화면으로 돌아가기
        alert("데이터가 성공적으로 삭제되었습니다.");
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "데이터 삭제에 실패했습니다.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("데이터 삭제 중 오류가 발생했습니다.");
    }
  }
}

document.addEventListener("click", (e) => {
  if (!e.target.closest(".button_group")) {
    document.querySelectorAll(".settings-menu").forEach((menu) => {
      menu.classList.add("hidden"); // display: none 처리
    });
  }
});

document.getElementById("back-button").addEventListener("click", () => {
  document.getElementById("detail-view").classList.add("hidden");

  document.getElementById("management-container").classList.remove("hidden");
  document.getElementById("management-list").classList.remove("hidden");
  document.getElementById("pagination").style.display = "block";
});
