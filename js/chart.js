let movementChart = null;

async function chart(itemId) {
    const ctx = document.getElementById("movementChart").getContext("2d");

    if (movementChart) {
        movementChart.destroy(); // 이전 차트 삭제
        movementChart = null;
    }

    try {
        const response = await fetch(`https://capstone-back.fly.dev/api/management/movement/${itemId}`);
        const json = await response.json();
        console.log("json 데이터:", json);

        const data = {
            labels: json.labels,  // 날짜 라벨
            datasets: [
                {
                    label: `${json.name} 기록`,
                    data: json.values,
                    borderColor: "rgba(75, 192, 192, 1)",
                    backgroundColor: "rgba(75, 192, 192, 0.2)",
                    fill: true,
                    tension: 0.7,
                    pointBackgroundColor: "red", // point 색상
                    pointBorderColor: "black",
                    pointRadius: 4, // 점 크기
                    pointHoverRadius: 5,
                    pointStyle: "circle", // 'rect', 'triangle', 'rectRounded' 등 가능
                },
            ]
        };

        const config = {
            type: "line",
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        min: 0,
                        max: 1,
                        ticks: {
                            stepSize: 1,
                            callback: function (value) {
                                // 0 또는 1일 때만 표시
                                if (value === 0 || value === 1) return value;
                                return '';
                            },
                        },
                    },
                },
            },
        };
        movementChart = new Chart(ctx, config);
    } catch (error) {
        console.log("차트 데이터를 불러오는 중 오류 발생", error);
    }
}

function getTodayDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0"); // 월은 0부터 시작
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

const todayStr = getTodayDate();
console.log(todayStr); // 예: "2025-05-12"
