async function checkDbConnection() {
  try {
    const response = await fetch(`${API_BASE_URL}/db-connect`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    if (data.status === "success") {
      console.log("DB Connected:", data.time);
    } else {
      console.error("DB Connection Failed:", data.message);
    }
  } catch (error) {
    console.error("Failed to connect to server:", error);
  }
}
