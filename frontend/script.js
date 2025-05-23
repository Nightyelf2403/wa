// frontend/script.js

const backendBase = "https://wa-c1rh.onrender.com/api";

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");
const forecastSection = document.getElementById("forecastSection");
const errorMessage = document.getElementById("errorMessage");
const hourlyDiv = document.getElementById("hourlyForecast");
const dailyDiv = document.getElementById("dailyForecast");

searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (!city) {
    showError("Please enter a city");
    return;
  }
  fetchWeather(city);
});

locationBtn.addEventListener("click", () => {
  if (!navigator.geolocation) {
    showError("Geolocation is not supported");
    return;
  }
  navigator.geolocation.getCurrentPosition(async (pos) => {
    const { latitude, longitude } = pos.coords;
    try {
      const locRes = await fetch(`https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=YOUR_OPENWEATHER_API_KEY`);
      const [locData] = await locRes.json();
      if (!locData || !locData.name) throw new Error();
      cityInput.value = locData.name;
      fetchWeather(locData.name);
    } catch {
      showError("Failed to detect city from location");
    }
  });
});

function showError(msg) {
  errorMessage.innerText = msg;
  forecastSection.style.display = "none";
}

async function fetchWeather(city) {
  try {
    errorMessage.innerText = "";
    const res = await fetch(`${backendBase}/forecast?city=${encodeURIComponent(city)}`);
    const data = await res.json();
    if (data.error) {
      showError("City not found or forecast unavailable.");
      return;
    }

    forecastSection.style.display = "block";
    hourlyDiv.innerHTML = "";
    data.hourly.forEach((h) => {
      const card = document.createElement("div");
      card.className = "forecast-card";
      const time = new Date(h.dt * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      card.innerHTML = `<strong>${time}</strong><br>${h.temp}&#8451;<br>${h.weather[0].main}`;
      hourlyDiv.appendChild(card);
    });

    dailyDiv.innerHTML = "";
    data.daily.forEach((d) => {
      const card = document.createElement("div");
      card.className = "forecast-card";
      const date = new Date(d.dt * 1000).toDateString();
      card.innerHTML = `<strong>${date}</strong><br>${d.temp.min}&#8451; - ${d.temp.max}&#8451;<br>${d.weather[0].main}`;
      dailyDiv.appendChild(card);
    });
  } catch (err) {
    console.error(err);
    showError("Error fetching data.");
  }
}
