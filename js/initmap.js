// Kakao Map 초기화 및 마커 로드
// -----------------------------------------------------------
const markerCache = {
  default: null,
  category: {},
};

async function preloadMarkerImages() {
  markerCache.default = new kakao.maps.MarkerImage(
    "assets/marker/marker.svg",
    new kakao.maps.Size(75, 30),
    new kakao.maps.Point(38, 30)
  );

  const categories = {
    소화기: "assets/images/소화기.png",
    소화전: "assets/images/소화전.png",
    AED: "assets/images/자동제세동기.png",
  };

  for (const [category, path] of Object.entries(categories)) {
    markerCache.category[category] = new kakao.maps.MarkerImage(
      path,
      new kakao.maps.Size(30, 30),
      { offset: new kakao.maps.Point(15, 15) }
    );
  }
}

async function initKakaoMap() {
  let container = document.getElementById("map");
  if (!container) {
    console.error(
      "Map container not found at initKakaoMap! Map will not be initialized."
    );
    return;
  }

  if (map && map instanceof kakao.maps.Map) {
    console.log("Kakao Map already initialized. Skipping re-initialization.");
    map.relayout();
    map.setCenter(new kakao.maps.LatLng(36.318315, 127.367326));
    return;
  }

  let options = {
    center: new kakao.maps.LatLng(36.318315, 127.367326),
    level: 2,
    draggable: true,
  };
  map = new kakao.maps.Map(container, options);

  try {
    const [places, _] = await Promise.all([
      fetch(`${API_BASE_URL}/places`).then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      }),
      preloadMarkerImages(),
    ]);

    const markersOnMap = places.map((place) => {
      place.floors = generateFloors(place.alias, place.maxfloor);
      const markerImage =
        markerCache.category[place.name] || markerCache.default;

      const marker = new kakao.maps.Marker({
        position: new kakao.maps.LatLng(place.lat, place.lng),
        map: map,
        image: markerImage,
      });
      userMarker.push({ marker });

      return { marker, place };
    });

    markersOnMap.forEach(({ marker, place }) => {
      kakao.maps.event.addListener(marker, "click", function () {
        showFloorMap(place);
      });
    });
    console.log("Kakao Map markers loaded successfully.");
  } catch (err) {
    console.error("Failed to load places for map markers:", err);
    alert("지도 마커 데이터를 불러오는 데 실패했습니다.");
  }
}

function loadKakaoMapScript() {
  return new Promise((resolve, reject) => {
    if (window.kakao && window.kakao.maps) {
      kakao.maps.load(() => resolve());
    } else {
      const script = document.createElement("script");
      script.src =
        "//dapi.kakao.com/v2/maps/sdk.js?appkey=124e4b785cbdd3fc46a37b0abd30547f&libraries=services";
      script.onload = () => kakao.maps.load(() => resolve());
      script.onerror = reject;
      document.head.appendChild(script);
      console.warn(
        "Kakao Map SDK was dynamically added. Ensure it's in HTML <head> for best practice."
      );
    }
  });
}

async function mainKakaoMapInit() {
  try {
    await loadKakaoMapScript();
    await Promise.all([loadMarker(), initKakaoMap()]);
    console.log("Kakao Map and all related markers initialized successfully.");
  } catch (err) {
    console.error(
      "Failed to initialize Kakao Map or markers in mainKakaoMapInit:",
      err
    );
    alert("지도를 불러오는 데 실패했습니다.");
  }
}

const searchInput = document.querySelector(".search-input");
const searchIcon = document.querySelector(".search-icon");

if (searchInput && searchIcon) {
  searchInput.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      performSearch(searchInput.value);
    }
  });
  searchIcon.addEventListener("click", function () {
    performSearch(searchInput.value);
  });
}

function performSearch(query) {
  alert(`검색: ${query}`);
}
