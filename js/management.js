// 예시 데이터 (실제론 서버에서 가져오거나 fetch로 요청)
const managementData = [
    {
        name: "Fire Extinguisher",
        type: "Equipment",
        date: "2025-05-01",
        location: "Building A"
    },
    {
        name: "AED",
        type: "Medical",
        date: "2025-04-15",
        location: "Building B"
    }
];

function loadManagementItems() {
    const listContainer = document.getElementById("management-list");
    listContainer.innerHTML = ""; // 초기화

    managementData.forEach(item => {
        const itemDiv = document.createElement("div");
        itemDiv.className = "management-item";

        itemDiv.innerHTML = `
            <span contenteditable="false">${item.name}</span>
            <span contenteditable="false">${item.type}</span>
            <span contenteditable="false">${item.date}</span>
            <span contenteditable="false">${item.location}</span>
            <button onclick="editRow(this)">설정</button>
        `;

        listContainer.appendChild(itemDiv);
    });
}

function editRow(button) {
    const row = button.parentElement;
    const spans = row.querySelectorAll("span");

    spans.forEach(span => {
        span.contentEditable = span.isContentEditable ? "false" : "true";
    });

    button.textContent = button.textContent === "설정" ? "완료" : "설정";
}


window.addEventListener('DOMContentLoaded', () => {
    loadManagementItems();
});
