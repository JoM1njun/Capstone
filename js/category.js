// Category Buttons
// -----------------------------------------------------------
document.querySelectorAll(".map-controls .control-btn").forEach((button) => {
  button.addEventListener("click", function () {
    const category = this.getAttribute("data-query");
    console.log("Clicked category:", category);
    document
      .querySelectorAll(".map-controls .control-btn")
      .forEach((btn) => btn.classList.remove("active"));
    this.classList.add("active");
    searchPlaces(category);
  });
});

function searchPlaces(category) {
  const categoryToTypeId = {
    소화기: 1,
    소화전: 2,
    AED: 3,
  };

  const typeId = categoryToTypeId[category];
  if (!typeId) {
    console.warn(`Unknown category: ${category}`);
    alert(`알 수 없는 카테고리: ${category}`);
    return;
  }

  if (!map) {
    console.error("Kakao Map is not initialized. Cannot search places.");
    alert(
      "지도가 준비되지 않아 장소를 검색할 수 없습니다. 잠시 후 다시 시도해주세요."
    );
    return;
  }

  fetch(`${API_BASE_URL}/category?type=${typeId}`)
    .then((response) => {
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      return response.json();
    })
    .then((data) => {
      const places = data.places;

      // userMarker.forEach((obj) => {
      //   if (obj.infoWindow) {
      //     obj.infoWindow.close();
      //   }
      //   if (obj.marker) {
      //     obj.marker.setMap(null);
      //   }
      // });
      userMarker.forEach(({ marker, infoWindow }) => {
        infoWindow.close();
        marker.setMap(null);
      });
      userMarker = [];

      infoWindows.forEach((iw) => iw.close());
      infoWindows = [];

      if (window.innerWidth <= 768) {
        map.setLevel(4);
      } else {
        map.setLevel(3);
      }

      if (places && places.length > 0) {
        places.forEach((place, index) => {
          if (
            !place ||
            typeof place.latitude !== "number" ||
            typeof place.longitude !== "number"
          ) {
            console.warn(`잘못된 place 데이터 [index: ${index}]`, place);
            return;
          }

          let placeLocation = new kakao.maps.LatLng(
            place.latitude,
            place.longitude
          );
          let markerImage = markerCache.category[category];

          let Marker = new kakao.maps.Marker({
            position: placeLocation,
            map: map,
            image: markerImage,
            clickable: true,
          });

          let content = `
                        <div class="info-window">
                            <h4 style="font-size: 14px;">${place.name}</h4>
                            <p style="font-size: 12px;">
                                운영시간 : 정보 없음 <br>
                                전화번호 : 정보 없음 <br>
                                위치 : ${place.name}
                            </p>
                        </div>`;

          let infoWindow = new kakao.maps.InfoWindow({
            content: content,
            zIndex: 1,
          });

          kakao.maps.event.addListener(Marker, "click", function () {
            infoWindows.forEach((iw) => iw.close());
            infoWindow.open(map, Marker);

            if (window.innerWidth <= 768) {
              map.setLevel(3);
            } else {
              map.setLevel(2);
            }
            map.panTo(Marker.getPosition());
          });

          map.panTo(Marker.getPosition());

          userMarker.push({ marker: Marker, infoWindow });
          infoWindows.push(infoWindow);
        });

        kakao.maps.event.addListener(map, "click", function () {
          infoWindows.forEach((iw) => iw.close());
        });
      } else {
        alert(`[${category}] 카테고리에서 찾을 수 있는 장소가 없습니다.`);
      }
    })
    .catch((err) => {
      console.error(`[${category}] API 호출 오류`, err);
      alert(`[${category}] 카테고리 데이터를 불러오는 중 오류가 발생했습니다.`);
    });
}

// 되돌리기 버튼
function restoreDefaultMarkers() {
  if (defaultMarkers.length === 0) {
    alert("초기 마커 정보가 아직 로드되지 않았습니다.");
    return;
  }

  userMarker.forEach(({ marker, infoWindow }) => {
    if (infoWindow) infoWindow.close();
    if (marker) marker.setMap(null);
  });
  userMarker = [];

  document
    .querySelectorAll(".map-controls .control-btn")
    .forEach((btn) => btn.classList.remove("active"));

  defaultMarkers.forEach(({ marker }) => {
    marker.setMap(map);
    userMarker.push({ marker }); // 다시 userMarker에 넣기
  });
}

document.getElementById("Rollback_btn").addEventListener("click", () => {
  console.log("Rollback button clicked");
  restoreDefaultMarkers();
});
