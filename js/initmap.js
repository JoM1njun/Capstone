let map, userMarker;

// 지도 초기화
function initMap() {
    console.log(kakao);
    let container = document.getElementById("map");
    let options = {
        center: new kakao.maps.LatLng(36.318315, 127.367326), // 배재대 중앙 위치 / 초기 위치
        level: 2 // 줌 레벨 (값이 낮을수록 확대)
    };
    map = new kakao.maps.Map(container, options);

    // 장소 데이터 (층별 지도 자동 생성)
    const places = [
        { name: "하워드관", code: "H", lat: 36.317620000, lng: 127.367249000, maxFloor: 5 },
        { name: "정보과학관", code: "C", lat: 36.317603000, lng: 127.367763000, maxFloor: 5 },
        { name: "자연과학관", code: "J", lat: 36.318175000, lng: 127.366354000, maxFloor: 5 },
        { name: "스마트배재관", code: "SP", lat: 36.319253000, lng: 127.367020000, maxFloor: 5 }
    ];

    places.forEach(place => {
        place.floors = generateFloors(place.code, place.maxFloor);

        const marker = new kakao.maps.Marker({
            position: new kakao.maps.LatLng(place.lat, place.lng),
            map: map
        });

        kakao.maps.event.addListener(marker, 'click', function () {
            showFloorMap(place);
        });
    });
}

kakao.maps.load(function () {
    initMap();
});

// 📌 자동으로 층별 SVG 파일명 생성하는 함수
function generateFloors(buildingCode, maxFloor) {
    let floors = {};
    for (let i = 1; i <= maxFloor; i++) {
        let floorName = `${i}층`;
        let filePath = `./place/${buildingCode}_${i}층.svg`;
        floors[floorName] = filePath;
    }
    return floors;
}
