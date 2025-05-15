function sidebarOpenClose() {
    const tabBtn = document.getElementById("sidebar-tab");
    const sidebar = document.getElementById("sidebar");

    tabBtn.addEventListener("mouseenter", () => {
        sidebar.style.opacity = "1";
        sidebar.style.transform = "translateX(0)";
        sidebar.style.pointerEvents = "auto";
    });

    sidebar.addEventListener("mouseleave", () => {
        sidebar.style.opacity = "0";
        sidebar.style.transform = "translateX(-100%)";
        sidebar.style.pointerEvents = "none";
    });
}

function showDashboard() {
    document.getElementById("dashboard").style.display = "block";
    document.getElementById("management").style.display = "none";
}

function showManagement() {
    document.getElementById("dashboard").style.display = "none";
    document.getElementById("management").style.display = "block";
    loadManagementItems();
}

window.addEventListener('DOMContentLoaded', () => {
    sidebarOpenClose();
    showDashboard();
    showManagement();
});

window.onload = () => {
    document.getElementById("dashboard").style.display = "block";
    document.getElementById("management").style.display = "none";
};
