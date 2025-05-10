// 층별 지도 표시 함수
function showFloorMap(place) {
    console.log("✅ showFloorMap 실행됨!", place);
    console.log("📌 place.floors 값:", place.floors);

    const floorButtonsContainer = document.getElementById("floorButtons");
    floorButtonsContainer.innerHTML = ""; // 기존 버튼 초기화

    // 층 버튼 자동 생성
    Object.keys(place.floors).forEach(floor => {
        let button = document.createElement("button");
        let svgPath = place.floors[floor];
        console.log("SVG 경로:", svgPath);

        button.innerText = floor;
        button.onclick = function () {
            document.getElementById("floorMap").setAttribute("data", place.floors[floor]);
            document.getElementById("floorMap").setAttribute("data-floor", floor); // ✅ 현재 층 정보 저장
        };
        floorButtonsContainer.appendChild(button);
    });

    // 첫 번째 층 자동 표시
    let firstFloor = Object.keys(place.floors)[0];

    if (firstFloor) {
        let firstSvgPath = place.floors[firstFloor];
        console.log("🚀 첫 번째 층 자동 표시:", firstFloor, "경로:", firstSvgPath);
        document.getElementById("floorMap").setAttribute("data", firstSvgPath);
    } else {
        console.warn("⚠️ 표시할 층이 없음!");
    }

    // 모달 표시
    document.getElementById("floorMapContainer").style.display = "flex";
}

// 🆕 SVG 파일을 갱신하는 함수
function updateFloorMap(svgPath) {
    let floorMapContainer = document.getElementById("floorMapContainer");

    // 기존 <object> 제거
    let oldObject = document.getElementById("floorMap");
    if (oldObject) {
        oldObject.remove();
    }

    // 새로운 <object> 생성
    let newObject = document.createElement("object");
    newObject.id = "floorMap";
    newObject.type = "image/svg+xml";
    newObject.data = svgPath;

    // 새로 만든 <object>를 컨테이너에 추가
    floorMapContainer.appendChild(newObject);
}

// 모달 닫기
function closeFloorMap() {
    document.getElementById("floorMapContainer").style.display = "none";
}

const floorMarkers = {
    "1층": [
        { x: 200, y: 300, name: "A실", icon: "marker-red.png" },
        { x: 500, y: 150, name: "B실", icon: "marker-blue.png" }
    ],
    "2층": [
        { x: 220, y: 320, name: "C실", icon: "marker-green.png" }
    ]
};

// 마커 추가 함수
function addMarkersToSVG(svg, floor) {
    const existingMarkers = svg.querySelectorAll(".custom-marker");
    existingMarkers.forEach(m => m.remove()); // 기존 마커 제거

    const markers = floorMarkers[floor] || [];
    markers.forEach(marker => {
        const img = document.createElementNS("http://www.w3.org/2000/svg", "image");
        img.setAttributeNS(null, "href", marker.icon);
        img.setAttribute("x", marker.x - 16); // 중심 정렬
        img.setAttribute("y", marker.y - 16);
        img.setAttribute("width", "32");
        img.setAttribute("height", "32");
        img.classList.add("custom-marker");
        img.style.cursor = "pointer";

        // 마커 클릭 시 이름 출력
        img.addEventListener("click", () => {
            alert(marker.name);
        });

        svg.appendChild(img);
    });
}

document.getElementById("floorMap").addEventListener("load", function () {
    let svgObject = this.contentDocument;
    let svg = svgObject.querySelector("svg");
    if (!svg) return;

    const floor = document.getElementById("floorMap").getAttribute("data-floor"); // 현재 층
    addMarkersToSVG(svg, floor); // ✅ 마커 표시
});

document.getElementById("floorMap").addEventListener("load", function () {
    let svgObject = this.contentDocument; // <object> 내부의 SVG 문서 가져오기
    let svg = svgObject.querySelector("svg"); // SVG 태그 선택

    if (!svg) return; // SVG가 없으면 중단

    let viewBox = [0, 0, 1000, 1000]; // 초기 viewBox (x, y, width, height)
    let isDragging = false;
    let startX, startY;

    // 🖱️ 마우스 드래그 이동 기능
    svg.addEventListener("mousedown", (event) => {
        isDragging = true;
        startX = event.clientX;
        startY = event.clientY;
    });

    svg.addEventListener("mousemove", (event) => {
        if (!isDragging) return;
        let dx = (startX - event.clientX) * (viewBox[2] / svg.clientWidth);
        let dy = (startY - event.clientY) * (viewBox[3] / svg.clientHeight);
        viewBox[0] += dx;
        viewBox[1] += dy;
        svg.setAttribute("viewBox", viewBox.join(" "));
        startX = event.clientX;
        startY = event.clientY;
    });

    svg.addEventListener("mouseup", () => { isDragging = false; });
    svg.addEventListener("mouseleave", () => { isDragging = false; });

    // 🔍 휠 스크롤 줌 기능
    svg.addEventListener("wheel", (event) => {
        event.preventDefault();
        const zoomFactor = event.deltaY > 0 ? 1.1 : 0.9; // 휠 위(축소) / 아래(확대)
        let mouseX = event.clientX / svg.clientWidth * viewBox[2] + viewBox[0];
        let mouseY = event.clientY / svg.clientHeight * viewBox[3] + viewBox[1];

        let newWidth = viewBox[2] * zoomFactor;
        let newHeight = viewBox[3] * zoomFactor;

        if (newWidth > 2000 || newWidth < 200) return; // 최대/최소 줌 제한

        viewBox[0] = mouseX - (mouseX - viewBox[0]) * zoomFactor;
        viewBox[1] = mouseY - (mouseY - viewBox[1]) * zoomFactor;
        viewBox[2] = newWidth;
        viewBox[3] = newHeight;

        svg.setAttribute("viewBox", viewBox.join(" "));
    });
});