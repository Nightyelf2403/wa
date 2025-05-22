const form = document.getElementById("weatherForm");
const locationInput = document.getElementById("locationInput");
const geoButton = document.getElementById("geoButton");
const weatherNow = document.getElementById("weatherNow");
const forecastSection = document.getElementById("forecastSection");
const errorDiv = document.getElementById("error");

const backendURL = "https://wa-c1rh.onrender.com"; // your backend base URL

// Fetch weather by text input
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const location = locationInput.value.trim();
  if (!location) return;
  fetchWeather(location);
});

// Fetch weather by geolocation
geoButton.addEventListener("click", () => {
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const { latitude, longitude } = pos.coords;
      fetchWeather(`${latitude},${longitude}`);
    },
    () => {
      errorDiv.innerText = "Geolocation permission denied.";
    }
  );
});

async function fetchWeather(location) {
  errorDiv.innerText = "";
  weatherNow.innerHTML = "";
  forecastSection.innerHTML = "";

  try {
    const res = await fetch(`${backendURL}/api/forecast?city=${encodeURIComponent(location)}`);
    const data = await res.json();

    if (data.error) {
      errorDiv.innerText = "City not found or forecast unavailable.";
      return;
    }

    displayCurrentWeather(data.current, location);
    displayForecast(data.daily);
  } catch (err) {
    errorDiv.innerText = "Error fetching data.";
    console.error(err);
  }
}

function displayCurrentWeather(current, city) {
  const card = document.createElement("div");
  card.className = "weather-card";
  card.innerHTML = `
    <h2>${city}</h2>
    <h3>${current.weather[0].main} - ${current.weather[0].description}</h3>
    <p>🌡️ Temp: ${current.temp}°C</p>
    <p>💧 Humidity: ${current.humidity}%</p>
    <p>💨 Wind: ${current.wind_speed} m/s</p>
  `;
  weatherNow.appendChild(card);
}

function displayForecast(daily) {
  const heading = document.createElement("h3");
  heading.innerText = "5-Day Forecast";
  forecastSection.appendChild(heading);

  const grid = document.createElement("div");
  grid.className = "forecast-grid";

  daily.slice(1, 6).forEach(day => {
    const date = new Date(day.dt * 1000).toDateString();
    const item = document.createElement("div");
    item.className = "forecast-item";
    item.innerHTML = `
      <strong>${date}</strong>
      <p>${day.weather[0].main}</p>
      <p>${day.temp.min}°C - ${day.temp.max}°C</p>
    `;
    grid.appendChild(item);
  });

  forecastSection.appendChild(grid);
}
