// 서버 연결 확인을 위한 부분 (없어도 됨)
window.onload = function () {
  fetch("http://43.201.78.22:3000/api/db-connect")
    .then((response) => response.json())
    .then((data) => {
      if (data.status === "success") {
        document.getElementById("db-status").innerHTML = "DB Connected";
      } else {
        document.getElementById("db-status").innerHTML =
          "Connect Failed" + data.message;
      }
    })
    .catch((error) => {
      document.getElementById("db-status").innerHTML =
        "서버에 접근 할 수 없음" + error;
    });
};
