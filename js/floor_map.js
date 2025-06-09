// Floor Map Functions
// -----------------------------------------------------------

function generateFloors(buildingCode, maxFloor) {
  let floors = {};
  for (let i = 1; i <= maxFloor; i++) {
    let floorName = `${i}층`;
    let filePath = `assets/place/${buildingCode}_${i}.svg`;
    floors[floorName] = filePath;
  }
  return floors;
}

async function loadMarker() {
  try {
    const res = await fetch(`${API_BASE_URL}/marker`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();

    floorMarkers = {};

    data.forEach((marker) => {
      const floorkey = marker.floor + "층";
      if (!floorMarkers[floorkey]) floorMarkers[floorkey] = [];
      floorMarkers[floorkey].push({
        x: marker.x,
        y: marker.y,
        name: marker.name,
        icon: "/assets/category/소화기.png",
      });
    });

    console.log("floorMarkers 준비 완료", floorMarkers);
  } catch (e) {
    console.error("마커 로딩 실패:", e);
    alert("층별 마커 데이터를 불러오는 데 실패했습니다.");
  }
}

async function showFloorMap(place) {
  console.log("✅ showFloorMap 실행됨!", place);
  console.log("📌 place.floors 값:", place.floors);

  const floorButtonsContainer = document.getElementById("floorButtons");
  if (!floorButtonsContainer) {
    console.error("floorButtonsContainer not found.");
    return;
  }
  floorButtonsContainer.innerHTML = "";

  const floorMapElement = document.getElementById("floorMap");
  const floorMapContainer = document.getElementById("floorMapContainer");

  if (!floorMapElement || !floorMapContainer) {
    console.error("Floor map elements not found.");
    return;
  }

  let hasValidSvg = false;
  for (const floor of Object.keys(place.floors)) {
    const imagePath = place.floors[floor];
    if (imagePath && imagePath.endsWith(".svg")) {
      try {
        const res = await fetch(imagePath, { method: "HEAD" });
        if (res.ok) {
          hasValidSvg = true;
          break;
        }
      } catch (err) {
        console.warn(`Error checking SVG path ${imagePath}:`, err);
      }
    }
  }

  if (!hasValidSvg) {
    alert(
      "해당 건물의 층별 SVG 이미지가 존재하지 않습니다. (최소 하나의 유효한 SVG 파일 필요)"
    );
    return;
  }

  Object.keys(place.floors).forEach((floor) => {
    let button = document.createElement("button");
    let imagePath = place.floors[floor];
    button.innerText = floor;
    button.onclick = async function () {
      document
        .querySelectorAll("#floorButtons button")
        .forEach((btn) => btn.classList.remove("active"));
      this.classList.add("active");

      let currentFloorMapElement = document.getElementById("floorMap");
      const currentFloor = floor;

      try {
        const res = await fetch(imagePath, { method: "HEAD" });
        if (!res.ok) {
          alert(`${floor}의 이미지 파일이 존재하지 않습니다.`);
          return;
        }
      } catch (err) {
        alert(`${floor}의 이미지 파일을 불러오는 중 오류가 발생했습니다.`);
        console.error(err);
        return;
      }

      if (imagePath.endsWith(".svg")) {
        if (
          currentFloorMapElement.tagName.toLowerCase() === "img" ||
          currentFloorMapElement.tagName.toLowerCase() !== "object"
        ) {
          const newObject = document.createElement("object");
          newObject.id = "floorMap";
          newObject.type = "image/svg+xml";
          newObject.data = imagePath;
          newObject.style.width = "100%";
          newObject.style.height = "100%";
          currentFloorMapElement.parentNode.replaceChild(
            newObject,
            currentFloorMapElement
          );
          currentFloorMapElement = newObject;

          currentFloorMapElement.addEventListener("load", function () {
            const svgDoc = currentFloorMapElement.contentDocument;
            const svg = svgDoc ? svgDoc.querySelector("svg") : null;
            if (svg) {
              addMarkersToSVG(svg, currentFloor);
              initializeSVGPanZoom(svg);
            }
          });
        } else {
          currentFloorMapElement.setAttribute("data", imagePath);
          currentFloorMapElement.addEventListener("load", function () {
            const svgDoc = currentFloorMapElement.contentDocument;
            const svg = svgDoc ? svgDoc.querySelector("svg") : null;
            if (svg) {
              addMarkersToSVG(svg, currentFloor);
              initializeSVGPanZoom(svg);
            }
          });
        }
      } else {
        if (
          currentFloorMapElement.tagName.toLowerCase() === "object" ||
          currentFloorMapElement.tagName.toLowerCase() !== "img"
        ) {
          const newImg = document.createElement("img");
          newImg.id = "floorMap";
          newImg.src = imagePath;
          newImg.style.width = "100%";
          newImg.style.height = "100%";
          newImg.style.objectFit = "contain";
          currentFloorMapElement.parentNode.replaceChild(
            newImg,
            currentFloorMapElement
          );
          currentFloorMapElement = newImg;

          newImg.onload = function () {};
        } else {
          currentFloorMapElement.src = imagePath;
          currentFloorMapElement.onload = function () {};
        }
      }
      currentFloorMapElement.setAttribute("data-floor", currentFloor);
    };
    floorButtonsContainer.appendChild(button);
  });

  const firstValidFloor = Object.entries(place.floors).find(
    ([floor, path]) => path && path.endsWith(".svg")
  );
  if (firstValidFloor) {
    // querySelector(`button:contains("${firstValidFloor[0]}")`) 부분은 CSS 선택자에 :contains가 없어 작동하지 않습니다.
    // 대신 텍스트 내용을 기반으로 버튼을 찾도록 수정합니다.
    const allFloorButtons = floorButtonsContainer.querySelectorAll("button");
    let foundButton = null;
    for (let i = 0; i < allFloorButtons.length; i++) {
      if (allFloorButtons[i].innerText === firstValidFloor[0]) {
        foundButton = allFloorButtons[i];
        break;
      }
    }
    if (foundButton) {
      foundButton.click();
    }
  } else {
    console.warn("⚠️ 표시할 유효한 SVG 층이 없음!");
  }

  document.getElementById("floorMapContainer").style.display = "flex";
}

function closeFloorMap() {
  document.getElementById("floorMapContainer").style.display = "none";
}

function addMarkersToSVG(svg, floor) {
  const existingMarkers = svg.querySelectorAll(".custom-marker");
  existingMarkers.forEach((m) => m.remove());

  const markers = floorMarkers[floor] || [];
  console.log(
    `addMarkersToSVG: floor=${floor}, marker count=${markers.length}`
  );

  markers.forEach((marker) => {
    const img = document.createElementNS("http://www.w3.org/2000/svg", "image");
    img.setAttributeNS(null, "href", marker.icon);
    img.setAttribute("x", marker.x - 16);
    img.setAttribute("y", marker.y - 16);
    img.setAttribute("width", "32");
    img.setAttribute("height", "32");
    img.classList.add("custom-marker");
    img.style.cursor = "pointer";

    img.addEventListener("click", (e) => {
      e.stopPropagation();
      alert(marker.name);
    });

    svg.appendChild(img);
  });
}

function initializeSVGPanZoom(svg) {
  const bbox = svg.getBBox();

  const container = document.getElementById("floorMap");
  const containerWidth = container.clientWidth;
  const containerHeight = container.clientHeight;

  const scaleX = containerWidth / bbox.width;
  const scaleY = containerHeight / bbox.height;
  const initialScale = Math.min(scaleX, scaleY) * 0.9;

  const centerX = bbox.x + bbox.width / 2;
  const centerY = bbox.y + bbox.height / 2;
  const newWidth = bbox.width / initialScale;
  const newHeight = bbox.height / initialScale;

  currentViewBox = [
    centerX - newWidth / 2,
    centerY - newHeight / 2,
    newWidth,
    newHeight,
  ];

  svg.setAttribute("viewBox", currentViewBox.join(" "));

  let isDragging = false;
  let startX, startY;

  const removePanZoomListeners = (element) => {
    if (element._panZoomMouseDown)
      element.removeEventListener("mousedown", element._panZoomMouseDown);
    if (element._panZoomMouseMove)
      element.removeEventListener("mousemove", element._panZoomMouseMove);
    if (element._panZoomMouseUp)
      element.removeEventListener("mouseup", element._panZoomMouseUp);
    if (element._panZoomMouseLeave)
      element.removeEventListener("mouseleave", element._panZoomMouseLeave);
    if (element._panZoomWheel)
      element.removeEventListener("wheel", element._panZoomWheel);
  };

  removePanZoomListeners(svg);

  svg._panZoomMouseDown = (event) => {
    isDragging = true;
    startX = event.clientX;
    startY = event.clientY;
    event.preventDefault();
  };
  svg._panZoomMouseMove = (event) => {
    if (!isDragging) return;
    const dx = (startX - event.clientX) * (currentViewBox[2] / svg.clientWidth);
    const dy =
      (startY - event.clientY) * (currentViewBox[3] / svg.clientHeight);
    currentViewBox[0] += dx;
    currentViewBox[1] += dy;
    svg.setAttribute("viewBox", currentViewBox.join(" "));
    startX = event.clientX;
    startY = event.clientY;
    event.preventDefault();
  };
  svg._panZoomMouseUp = () => {
    isDragging = false;
  };
  svg._panZoomMouseLeave = () => {
    isDragging = false;
  };
  svg._panZoomWheel = (event) => {
    event.preventDefault();
    const rect = svg.getBoundingClientRect();
    const mouseX =
      ((event.clientX - rect.left) / rect.width) * currentViewBox[2] +
      currentViewBox[0];
    const mouseY =
      ((event.clientY - rect.top) / rect.height) * currentViewBox[3] +
      currentViewBox[1];
    const zoomFactor = event.deltaY > 0 ? 1.1 : 0.9;
    const newWidth = currentViewBox[2] * zoomFactor;
    const newHeight = currentViewBox[3] * zoomFactor;
    if (newWidth > bbox.width * 5 || newWidth < bbox.width * 0.2) return;
    currentViewBox[0] = mouseX - (mouseX - currentViewBox[0]) * zoomFactor;
    currentViewBox[1] = mouseY - (mouseY - currentViewBox[1]) * zoomFactor;
    currentViewBox[2] = newWidth;
    currentViewBox[3] = newHeight;
    svg.setAttribute("viewBox", currentViewBox.join(" "));
  };

  svg.addEventListener("mousedown", svg._panZoomMouseDown);
  svg.addEventListener("mousemove", svg._panZoomMouseMove);
  svg.addEventListener("mouseup", svg._panZoomMouseUp);
  svg.addEventListener("mouseleave", svg._panZoomMouseLeave);
  svg.addEventListener("wheel", svg._panZoomWheel);
}
