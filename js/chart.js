async function chart(itemId) {
  const ctx = document.getElementById("movementChart").getContext("2d");

  // 기존 차트가 있다면 제거
  if (window.movementChart) {
    window.movementChart.destroy();
  }

  try {
    const response = await fetch(
      `http://localhost:3000/api/management/movement/${itemId}`
    );
    const data = {
      labels: data.labels,
      datasets: [
        {
          label: `${data.name} 기록`,
          data: data.values,
          borderColor: "rgba(75, 192, 192, 1)",
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          fill: true,
          tension: 0.4,
          pointBackgroundColor: "red", // point 색상
          pointBorderColor: "black",
          pointRadius: 4, // 점 크기
          pointHoverRadius: 5,
          pointStyle: "circle", // 'rect', 'triangle', 'rectRounded' 등 가능
        },
      ],
    };

    const config = {
      type: "line",
      data: data,
      options: {
        responsive: true,
        scales: {
          y: {
            min: 0,
            max: 1,
            ticks: {
              stepSize: 0.1,
            },
          },
        },
      },
    };
    window.movementChart = new Chart(ctx, config);
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
