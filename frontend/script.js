const backendURL = "https://wa-c1rh.onrender.com/api";

const searchBtn = document.getElementById("searchBtn");
const locationInput = document.getElementById("locationInput");
const useLocationBtn = document.getElementById("useLocationBtn");
const resultSection = document.getElementById("resultSection");

searchBtn.addEventListener("click", async () => {
  const city = locationInput.value.trim();
  if (!city) return showError("Please enter a city.");
  await fetchWeather(city);
});

useLocationBtn.addEventListener("click", () => {
  if (!navigator.geolocation) {
    showError("Geolocation not supported in your browser.");
    return;
  }

  navigator.geolocation.getCurrentPosition(async (pos) => {
    const { latitude, longitude } = pos.coords;
    await fetchWeatherByCoords(latitude, longitude);
  }, () => {
    showError("Failed to get your location.");
  });
});

async function fetchWeather(city) {
  try {
    const res = await fetch(`${backendURL}/forecast?city=${encodeURIComponent(city)}`);
    const data = await res.json();

    if (data.error) {
      showError("City not found or forecast unavailable.");
      return;
    }

    displayForecast(data);
  } catch (err) {
    showError("Error fetching data.");
  }
}

async function fetchWeatherByCoords(lat, lon) {
  try {
    const res = await fetch(`${backendURL}/forecast?lat=${lat}&lon=${lon}`);
    const data = await res.json();

    if (data.error) {
      showError("Could not fetch forecast for your location.");
      return;
    }

    displayForecast(data);
  } catch (err) {
    showError("Error fetching location data.");
  }
}

function showError(msg) {
  resultSection.innerHTML = `<p style="color:red; font-weight:bold;">${msg}</p>`;
}

function displayForecast(data) {
  let html = `<h3>${data.city}</h3><div class="forecast-grid">`;

  data.daily.slice(0, 5).forEach(day => {
    const date = new Date(day.dt * 1000).toDateString();
    html += `
      <div class="forecast-card">
        <p><strong>${date}</strong></p>
        <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png" alt="${day.weather[0].description}" />
        <p>${day.weather[0].main}</p>
        <p>${day.temp.min}°C - ${day.temp.max}°C</p>
      </div>
    `;
  });

  html += "</div>";
  resultSection.innerHTML = html;
}
