/**
 * 특정 건물에 대한 종합 현황 차트를 렌더링합니다.
 * ON/OFF 상태 비율을 파이 차트로 보여줍니다.
 * @param {string} canvasId 차트를 그릴 캔버스의 ID
 * @param {Array<Object>} items 해당 건물에 속한 모든 시설 데이터
 * @param {string} buildingName 건물 이름
 */
function renderBuildingChart(canvasId, items, buildingName) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) {
    console.warn(`Chart canvas with ID ${canvasId} not found.`);
    return;
  }

  const ctx = canvas.getContext("2d");

  // 기존 차트 인스턴스가 있다면 파괴
  if (chartInstances[canvasId]) {
    chartInstances[canvasId].destroy();
    delete chartInstances[canvasId];
  }

  // 데이터 집계
  let statusOnCount = 0;
  let statusOffCount = 0;
  items.forEach((item) => {
    if (parseInt(item.status) === 1) {
      statusOnCount++;
    } else {
      statusOffCount++;
    }
  });

  const isDarkMode = document.body.classList.contains("dark-mode");
  const textColor = isDarkMode ? "#f5f5f5" : "#333";

  // 차트 생성 (파이 차트 - ON/OFF 상태)
  const pieChartConfig = {
    type: "pie",
    data: {
      labels: ["작동 중 (ON)", "비활성 (OFF)"],
      datasets: [
        {
          data: [statusOnCount, statusOffCount],
          backgroundColor: [
            isDarkMode ? "rgba(52, 199, 89, 0.8)" : "rgba(52, 199, 89, 1)", // Green
            isDarkMode ? "rgba(255, 59, 48, 0.8)" : "rgba(255, 59, 48, 1)", // Red
          ],
          borderColor: isDarkMode ? "#333" : "#fff",
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "right",
          labels: {
            color: textColor,
          },
        },
        title: {
          display: true,
          text: `${buildingName} 시설 작동 현황`,
          color: textColor,
          font: {
            size: 16,
          },
        },
      },
    },
  };

  chartInstances[canvasId] = new Chart(ctx, pieChartConfig);

  // 다크 모드 전환 시 차트 색상 업데이트 감시 (한 번만 설정)
  if (!canvas._darkModeObserver) {
    canvas._darkModeObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          window.toggleDarkMode(document.body.classList.contains("dark-mode")); // 강제로 업데이트 로직 실행
        }
      });
    });
    canvas._darkModeObserver.observe(document.body, { attributes: true });
  }
}

let movementChartObserver = null; // movementChart의 MutationObserver 인스턴스

async function chart(itemId) {
  const ctx = document.getElementById("movementChart")?.getContext("2d");
  if (!ctx) {
    console.warn("movementChart canvas not found for charting.");
    return;
  }

  // 기존 차트가 있다면 파괴
  if (chartInstances["movementChart"]) {
    chartInstances["movementChart"].destroy();
    delete chartInstances["movementChart"];
  }
  // 기존 옵저버가 있다면 연결 해제
  if (movementChartObserver) {
    movementChartObserver.disconnect();
    movementChartObserver;
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/management/movement/${itemId}`
    );
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    console.log("Movement Chart Data:", data);

    const labels = data.labels;
    const values = data.rawValues;
    const isDarkMode = document.body.classList.contains("dark-mode");
    const textColor = isDarkMode ? "#f5f5f5" : "#333";
    const gridColor = isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";

    const config = {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: `ID ${itemId} 움직임 기록`,
            data: values,
            borderColor: "rgba(75, 192, 192, 1)",
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            fill: true,
            tension: 0.4,
            pointBackgroundColor: (context) => {
              const value = context.dataset.data[context.dataIndex];
              return value > 0 ? "red" : "rgba(75, 192, 192, 1)";
            },
            pointBorderColor: "black",
            pointRadius: 4,
            pointHoverRadius: 5,
            pointStyle: "circle",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: "top",
            labels: {
              color: textColor,
            },
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                let label = context.dataset.label || "";
                if (label) {
                  label += ": ";
                }
                if (context.parsed.y !== null) {
                  label += context.parsed.y;
                }
                return label;
              },
            },
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: "날짜",
              color: textColor,
            },
            ticks: {
              color: textColor,
            },
            grid: {
              color: gridColor,
            },
          },
          y: {
            title: {
              display: true,
              text: "움직임 (상태)",
              color: textColor,
            },
            min: 0,
            max: data.maxValue === 0 ? 1 : data.maxValue + 1,
            ticks: {
              stepSize: 1,
              color: textColor,
              callback: function (value) {
                return value;
              },
            },
            grid: {
              color: gridColor,
            },
          },
        },
      },
    };
    chartInstances["movementChart"] = new Chart(ctx, config);

    // 다크 모드 전환 감지 및 차트 업데이트
    if (!movementChartObserver) {
      // 옵저버가 이전에 생성되지 않았다면
      movementChartObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (
            mutation.attributeName === "class" &&
            chartInstances["movementChart"]
          ) {
            window.toggleDarkMode(
              document.body.classList.contains("dark-mode")
            ); // 강제로 업데이트 로직 실행
          }
        });
      });
      movementChartObserver.observe(document.body, { attributes: true });
    }
  } catch (error) {
    console.error("차트 데이터를 불러오는 중 오류 발생:", error);
    alert("차트 데이터를 불러오는 데 실패했습니다: " + error.message);
  }
}
