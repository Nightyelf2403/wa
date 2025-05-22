// script.js

const backendBaseURL = "https://wa-c1rh.onrender.com/api";

const form = document.getElementById("weatherForm");
const savedList = document.getElementById("savedList");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const location = document.getElementById("location").value;
  const from = document.getElementById("fromDate").value;
  const to = document.getElementById("toDate").value;

  const response = await fetch(`${backendBaseURL}/weather/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ location, dateRange: { from, to } }),
  });

  const data = await response.json();
  if (data.error) {
    alert("Error: " + data.error);
    return;
  }
  alert("Weather saved!");
  fetchSaved();
});

async function fetchSaved() {
  const response = await fetch(`${backendBaseURL}/weather/all`);
  const data = await response.json();

  savedList.innerHTML = "";
  data.forEach((record) => {
    const li = document.createElement("li");
    li.textContent = `${record.location} (${record.date_from} to ${record.date_to}) - ${record.weather_data.main.temp}°C`;
    savedList.appendChild(li);
  });
}

window.onload = fetchSaved;
