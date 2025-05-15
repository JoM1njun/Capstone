function chart(labelName) {
  const ctx = document.getElementById('myChart').getContext('2d');

  const data = {
    labels: ['A', 'B', 'C', 'D', 'E'],
    datasets: [{
      label: `${labelName}`,
      data: [0.1, 0.5, 0.7, 0.3, 0.9],
      borderColor: 'rgba(75, 192, 192, 1)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      fill: false,
      tension: 0.3,
      pointBackgroundColor: 'red',   // point 색상
      pointBorderColor: 'black',
      pointRadius: 6,                // 점 크기
      pointHoverRadius: 8,
      pointStyle: 'circle'           // 'rect', 'triangle', 'rectRounded' 등 가능
    }]
  };

  const config = {
    type: 'line',
    data: data,
    options: {
      responsive: true,
      scales: {
        y: {
          min: 0,
          max: 1,
          ticks: {
            stepSize: 0.1
          }
        }
      }
    }
  };
  new Chart(ctx, config);
}

function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const todayStr = getTodayDate();
console.log(todayStr); // 예: "2025-05-12"
