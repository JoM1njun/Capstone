// 📌 자동으로 층별 SVG 파일명 생성하는 함수
function generateFloors(buildingCode, maxFloor) {
  let floors = {};
  for (let i = 1; i <= maxFloor; i++) {
    let floorName = `${i}층`;
    let filePath = `assets/place/${buildingCode}_${i}.svg`;
    floors[floorName] = filePath;
  }
  return floors;
}

let floorMarkers = {};
async function loadMarker() {
  try {
    const res = await fetch("http://43.201.78.22:3000/api/marker");
    const data = await res.json();

    floorMarkers = {}; // 초기화

    data.forEach(marker => {
        const floorkey = marker.floor + "층";
      if (!floorMarkers[floorkey]) floorMarkers[floorkey] = [];
      floorMarkers[floorkey].push({
        x: marker.x,
        y: marker.y,
        name: marker.name,
        icon: "/assets/category/소화기.svg"
      });
    });

    console.log("floorMarkers 준비 완료", floorMarkers);
  } catch (e) {
    console.error("마커 로딩 실패:", e);
  }
}

function showFloorMap(place) {
  console.log("✅ showFloorMap 실행됨!", place);
  console.log("📌 place.floors 값:", place.floors);

  const floorButtonsContainer = document.getElementById("floorButtons");
  floorButtonsContainer.innerHTML = ""; // 기존 버튼 초기화

  // 층 버튼 자동 생성
  Object.keys(place.floors).forEach((floor) => {
    let button = document.createElement("button");
    let imagePath = place.floors[floor];
    console.log("이미지 경로:", imagePath);
    console.log("층 수 : ", floor);

    button.innerText = floor;
    button.onclick = function () {
      const floorMap = document.getElementById("floorMap");
      const currentFloor = floor;

      if (imagePath.endsWith(".svg")) {
        // SVG 파일인 경우
        if (floorMap.tagName.toLowerCase() === "img") {
          // img 태그를 object 태그로 변경
          const object = document.createElement("object");
          object.id = "floorMap";
          object.type = "image/svg+xml";
          object.data = imagePath;
          object.style.width = "100%";
          object.style.height = "100%";
          floorMap.parentNode.replaceChild(object, floorMap);

          // SVG 로드 이벤트 리스너 추가
          object.addEventListener("load", function () {
            const svgDoc = object.contentDocument;
            const svg = svgDoc.querySelector("svg");
            if (svg) {
              addMarkersToSVG(svg, currentFloor);
            }
          });
        } else {
          // object 태그인 경우
          floorMap.setAttribute("data", imagePath);
          floorMap.addEventListener("load", function () {
            const svgDoc = floorMap.contentDocument;
            const svg = svgDoc.querySelector("svg");
            if (svg) {
              addMarkersToSVG(svg, currentFloor);
            }
          });
        }
      } else {
        // 일반 이미지 파일인 경우
        if (floorMap.tagName.toLowerCase() === "object") {
          // object 태그를 img 태그로 변경
          const img = document.createElement("img");
          img.id = "floorMap";
          img.src = imagePath;
          img.style.width = "100%";
          img.style.height = "100%";
          img.style.objectFit = "contain";
          floorMap.parentNode.replaceChild(img, floorMap);

          // 이미지 로드 후 마커 추가
          img.onload = function () {
            addMarkersToImage(img, currentFloor);
          };
        } else {
          // img 태그인 경우
          floorMap.src = imagePath;
          floorMap.onload = function () {
            addMarkersToImage(floorMap, currentFloor);
          };
        }
      }
      document
        .getElementById("floorMap")
        .setAttribute("data-floor", currentFloor);
    };
    floorButtonsContainer.appendChild(button);
  });

  // 첫 번째 층 자동 표시
  let firstFloor = Object.keys(place.floors)[0];
  if (firstFloor) {
    let firstImagePath = place.floors[firstFloor];
    console.log(
      "🚀 첫 번째 층 자동 표시:", firstFloor,
      "경로:", firstImagePath);

    // 첫 번째 층 버튼 클릭 이벤트를 수동으로 트리거
    const firstButton = floorButtonsContainer.querySelector("button");
    if (firstButton) {
      firstButton.click();
    }
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

// 마커 추가 함수
function addMarkersToSVG(svg, floor) {
  const existingMarkers = svg.querySelectorAll(".custom-marker");
  existingMarkers.forEach((m) => m.remove()); // 기존 마커 제거

  const markers = floorMarkers[floor] || [];
  console.log(`addMarkersToSVG: floor=${floor}, marker count=${markers.length}`);

  markers.forEach((marker) => {
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

  const bbox = svg.getBBox();
  let viewBox = [bbox.x, bbox.y, bbox.width, bbox.height];

  // 초기 viewBox 설정
  svg.setAttribute("viewBox", viewBox.join(" "));

  // SVG 컨테이너의 크기에 맞게 초기화
  const container = document.getElementById("floorMapContainer");
  const containerWidth = container.clientWidth;
  const containerHeight = container.clientHeight;

  // 초기 줌 레벨 설정 (값이 작을수록 더 확대됨)
  const initialZoomLevel = 0.1; // 0.7 = 70% 크기로 표시

  // SVG가 컨테이너에 맞게 표시되도록 초기 스케일 계산
  const scaleX = containerWidth / bbox.width;
  const scaleY = containerHeight / bbox.height;
  const initialScale = Math.min(scaleX, scaleY) * 0.9; // 90% 크기로 설정

  // 초기 viewBox 조정
  const centerX = bbox.x + bbox.width / 2;
  const centerY = bbox.y + bbox.height / 2;
  const newWidth = bbox.width / initialScale;
  const newHeight = bbox.height / initialScale;

  viewBox = [
    centerX - newWidth / 2,
    centerY - newHeight / 2,
    newWidth,
    newHeight,
  ];

  svg.setAttribute("viewBox", viewBox.join(" "));

  let isDragging = false;
  let startX, startY;
  let currentViewBox = [...viewBox];

  // 마우스 드래그 이동 기능
  svg.addEventListener("mousedown", (event) => {
    isDragging = true;
    startX = event.clientX;
    startY = event.clientY;
    event.preventDefault(); // 드래그 시작 시 기본 동작 방지
  });

  svg.addEventListener("mousemove", (event) => {
    if (!isDragging) return;

    const dx = (startX - event.clientX) * (currentViewBox[2] / svg.clientWidth);
    const dy =
      (startY - event.clientY) * (currentViewBox[3] / svg.clientHeight);

    currentViewBox[0] += dx;
    currentViewBox[1] += dy;

    svg.setAttribute("viewBox", currentViewBox.join(" "));

    startX = event.clientX;
    startY = event.clientY;
    event.preventDefault(); // 드래그 중 기본 동작 방지
  });

  svg.addEventListener("mouseup", () => {
    isDragging = false;
  });

  svg.addEventListener("mouseleave", () => {
    isDragging = false;
  });

  // 휠 스크롤 줌 기능
  svg.addEventListener("wheel", (event) => {
    event.preventDefault();

    // 마우스 위치를 SVG 좌표로 변환
    const rect = svg.getBoundingClientRect();
    const mouseX =
      ((event.clientX - rect.left) / rect.width) * currentViewBox[2] +
      currentViewBox[0];
    const mouseY =
      ((event.clientY - rect.top) / rect.height) * currentViewBox[3] +
      currentViewBox[1];

    // 줌 속도 조절 (더 부드럽게)
    const zoomFactor = event.deltaY > 0 ? 1.1 : 0.9;

    // 최소/최대 줌 제한
    const newWidth = currentViewBox[2] * zoomFactor;
    const newHeight = currentViewBox[3] * zoomFactor;

    if (newWidth > bbox.width * 5 || newWidth < bbox.width * 0.2) return;

    // 줌 중심점 기준으로 viewBox 조정
    currentViewBox[0] = mouseX - (mouseX - currentViewBox[0]) * zoomFactor;
    currentViewBox[1] = mouseY - (mouseY - currentViewBox[1]) * zoomFactor;
    currentViewBox[2] = newWidth;
    currentViewBox[3] = newHeight;

    svg.setAttribute("viewBox", currentViewBox.join(" "));
  });
});
