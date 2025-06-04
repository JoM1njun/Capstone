let map, userMarker;

const markerCache = {
  default: null,
  category: {}
};

async function preloadMarkerImages() {
  // 기본 마커 이미지
  markerCache.default = new kakao.maps.MarkerImage(
    "assets/marker/marker.svg",
    new kakao.maps.Size(75, 30),
    new kakao.maps.Point(38, 30)
  );

  // 카테고리별 마커 이미지
  const categories = {
    '소화기': 'assets/category/소화기.svg',
    '소화전': 'assets/category/소화전.svg',
    'AED': 'assets/category/구급상자.svg'
  };

  for (const [category, path] of Object.entries(categories)) {
    markerCache.category[category] = new kakao.maps.MarkerImage(
      path,
      new kakao.maps.Size(30, 30),
      { offset: new kakao.maps.Point(15, 15) }
    );
  }
}

// 지도 초기화
async function initMap() {
  console.log(kakao);
  // 장소 데이터 (층별 지도 자동 생성)
  try {
    let container = document.getElementById("map");
    let options = {
      center: new kakao.maps.LatLng(36.318315, 127.367326), // 배재대 중앙 위치 / 초기 위치
      level: 2, // 줌 레벨 (값이 낮을수록 확대)
      draggable: true,
    };
    map = new kakao.maps.Map(container, options);
    
    // 2. 마커 이미지와 장소 데이터를 병렬로 로드
    const [places, _] = await Promise.all([
      fetch("https://capstone-back.fly.dev/api/places").then(res => res.json()),
      preloadMarkerImages()
    ]);

    const markers = places.map(place => {
      place.floors = generateFloors(place.alias, place.maxfloor);

      const markerImage = markerCache.category[place.name] || markerCache.default;

      const marker = new kakao.maps.Marker({
        position: new kakao.maps.LatLng(place.lat, place.lng),
        map: map,
        image: markerImage,
      });
      return { marker, place };
    });
    markers.forEach(({marker, place}) => {
      kakao.maps.event.addListener(marker, "click", function () {
        showFloorMap(place)
      });
    });
  } catch (err) {
    console.error("Failed to load places:", err);
  }
}

// 카카오맵 SDK 로드 최적화
function loadKakaoMap() {
  return new Promise((resolve, reject) => {
    kakao.maps.load(() => {
      resolve();
    });
  });
}

async function main() {
  try {
    await loadKakaoMap();
    await Promise.all([
      loadMarker(),
      initMap()
    ]);
  } catch (err) {
    console.error("Failed to initialize:", err);
  }
}

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', main);
