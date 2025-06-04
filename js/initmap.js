let map, userMarker;
let markerImage = new kakao.maps.MarkerImage(
  "assets/marker/marker.svg",
  new kakao.maps.Size(75, 30),
  new kakao.maps.Point(38, 30)
);

// 지도 초기화
async function initMap() {
  console.log(kakao);
  let container = document.getElementById("map");
  let options = {
    center: new kakao.maps.LatLng(36.318315, 127.367326), // 배재대 중앙 위치 / 초기 위치
    level: 2, // 줌 레벨 (값이 낮을수록 확대)
    draggable: true,
  };
  map = new kakao.maps.Map(container, options);

  // 장소 데이터 (층별 지도 자동 생성)
  try {
    const res = await fetch("https://capstone-back.fly.dev/api/places");
    const places = await res.json();

    places.forEach((place) => {
      place.floors = generateFloors(place.alias, place.maxfloor);

      const marker = new kakao.maps.Marker({
        position: new kakao.maps.LatLng(place.lat, place.lng),
        map: map,
        image: markerImage,
      });

      kakao.maps.event.addListener(marker, "click", function () {
        showFloorMap(place);
      });
    });
  } catch (err) {
    console.error("Failed to load places:", err);
  }
}

async function main() {
  await loadMarker();
  await initMap();
}

kakao.maps.load(() => {
  main();
});
