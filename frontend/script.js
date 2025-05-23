const backendBase = "https://app-jvpd.onrender.com/api";

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const geoBtn = document.getElementById("geoBtn");
const errorBox = document.getElementById("error");
const forecast = document.getElementById("forecast");
const hourly = document.getElementById("hourly");
const daily = document.getElementById("daily");

function showError(msg) {
  errorBox.textContent = msg;
  forecast.classList.add("hidden");
}

function clearError() {
  errorBox.textContent = "";
}

async function fetchForecast(city) {
  try {
    clearError();
    const res = await fetch(`${backendBase}/forecast?city=${encodeURIComponent(city)}`);
    const data = await res.json();

    if (data.error) {
      showError("City not found or weather data unavailable.");
      return;
    }

    forecast.classList.remove("hidden");
    hourly.innerHTML = "";
    daily.innerHTML = "";

    data.hourly.forEach((entry) => {
      const div = document.createElement("div");
      div.className = "forecast-card";
      const time = new Date(entry.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      div.innerHTML = `<strong>${time}</strong><br>${entry.temp}°C<br>${entry.weather[0].main}`;
      hourly.appendChild(div);
    });

    data.daily.forEach((entry) => {
      const div = document.createElement("div");
      div.className = "forecast-card";
      const date = new Date(entry.dt * 1000).toDateString();
      div.innerHTML = `<strong>${date}</strong><br>${entry.temp.min}°C - ${entry.temp.max}°C<br>${entry.weather[0].main}`;
      daily.appendChild(div);
    });
  } catch (err) {
    console.error(err);
    showError("Something went wrong fetching weather.");
  }
}

searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (!city) {
    showError("Please enter a city");
    return;
  }
  fetchForecast(city);
});

geoBtn.addEventListener("click", () => {
  if (!navigator.geolocation) {
    showError("Geolocation not supported by your browser.");
    return;
  }
  navigator.geolocation.getCurrentPosition(async (pos) => {
    const { latitude, longitude } = pos.coords;
    try {
      const response = await fetch(`https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=YOUR_OPENWEATHER_API_KEY`);
      const data = await response.json();
      if (!data[0]?.name) throw new Error();
      cityInput.value = data[0].name;
      fetchForecast(data[0].name);
    } catch {
      showError("Failed to detect location.");
    }
  });
});
