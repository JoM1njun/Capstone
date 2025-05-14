let managementData = []; // DB 데이터 가져올 용도
const itemsPerPage = 7; // 최대 페이지 수
let currentPage = 1; // 현재 페이지

// DB 데이터 가져오기
async function loadManagementItems() {
  const res = await fetch("http://localhost:3000/api/management");
  managementData = await res.json();
  console.log("Data : ", managementData);

  renderPage();
}

// DB Date 날짜 포맷
function formatDate(dateString) {
  const date = new Date(dateString);
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('ko-KR', options); // 한국어로 포맷팅
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
            <span contenteditable="false">${item.type_name}</span>
            <span contenteditable="false">${formatDate(item.date)}</span>
            <span contenteditable="false">${item.location}</span>
            <div class="button_group">
                <button onclick="editRow(this)">
                    <span class="material-symbols-outlined">more_vert</span>
                </button>
                <div class="settings-menu">
                    <button onclick="editRow(this)">수정</button>
                    <button onclick="completeRow(this)">완료</button>
                    <button onclick="deleteRow(this)">삭제</button>
                </div>
            </div>
        `;
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
      loadManagementItems();
    };
    pagination.appendChild(prevBtn);
  }

  if (currentPage < totalPages) {
    const nextBtn = document.createElement("button");
    nextBtn.innerHTML = "다음 페이지"; //&gt;
    nextBtn.onclick = () => {
      currentPage++;
      loadManagementItems();
    };
    pagination.appendChild(nextBtn);
  }
}

function toggleMenu(button) {
  // 모든 열린 메뉴 닫기
  document.querySelectorAll(".settings-menu").forEach((menu) => {
    menu.style.display = "none";
  });

  // 현재 버튼 옆 메뉴 열기
  const menu = button.nextElementSibling;
  menu.style.display = "flex";
}

function editRow(button) {
  const row = button.closest(".management-item");
  const spans = row.querySelectorAll("span");

  spans.forEach((span) => {
    span.contentEditable = span.isContentEditable ? "false" : "true";
  });

  button.textContent = button.textContent === "수정" ? "완료" : "수정";
}

function deleteRow(button) {
  const row = button.closest(".management-item");
  row.remove();
}

document.addEventListener("click", (e) => {
  const isInsideMenu = e.target.closest(".button_group");
  if (!isInsideMenu) {
    document.querySelectorAll(".settings-menu").forEach((menu) => {
      menu.style.display = "none";
    });
  }
});

window.addEventListener("DOMContentLoaded", () => {
  loadManagementItems();
});
