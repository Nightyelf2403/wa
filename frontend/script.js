const backendBase = "https://wa-c1rh.onrender.com/api";

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const geoBtn = document.getElementById("geoBtn");
const forecastSection = document.getElementById("forecastSection");
const errorMessage = document.getElementById("errorMessage");
const hourlyDiv = document.getElementById("hourlyForecast");
const dailyDiv = document.getElementById("dailyForecast");
const currentWeatherDiv = document.getElementById("currentWeather");
const mapFrame = document.getElementById("cityMap");
const youtubeSection = document.getElementById("youtubeVideos");

// Toggle dark mode
document.getElementById("darkModeToggle").addEventListener("change", () => {
  document.body.classList.toggle("dark-mode");
});

searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (!city) return showError("Please enter a city");
  fetchAll(city);
});

geoBtn.addEventListener("click", () => {
  if (!navigator.geolocation) return showError("Geolocation not supported");
  navigator.geolocation.getCurrentPosition(async (pos) => {
    const { latitude, longitude } = pos.coords;
    try {
      const res = await fetch(`https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=36ffc6ea6c048bb0fcc1752338facd48`);
      const [locData] = await res.json();
      if (!locData || !locData.name) throw new Error();
      cityInput.value = locData.name;
      fetchAll(locData.name);
    } catch {
      showError("Failed to detect city from location");
    }
  });
});

function showError(msg) {
  errorMessage.innerText = msg;
  forecastSection.classList.add("hidden");
  currentWeatherDiv.classList.add("hidden");
}

async function fetchAll(city) {
  try {
    errorMessage.innerText = "";
    fetchForecast(city);
    fetchCurrent(city);
    fetchYouTube(city);
    mapFrame.src = `https://www.google.com/maps?q=${encodeURIComponent(city)}&output=embed`;
  } catch (err) {
    showError("Failed to fetch data.");
  }
}

async function fetchForecast(city) {
  const res = await fetch(`${backendBase}/forecast?city=${encodeURIComponent(city)}`);
  const data = await res.json();
  if (data.error) return showError("City not found or forecast unavailable.");

  forecastSection.classList.remove("hidden");
  hourlyDiv.innerHTML = "";
  dailyDiv.innerHTML = "";

  data.hourly.forEach(h => {
    const card = document.createElement("div");
    card.className = "forecast-card";
    const time = new Date(h.dt * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    card.innerHTML = `<strong>${time}</strong><br>${h.temp}°C<br>${h.weather[0].main}`;
    hourlyDiv.appendChild(card);
  });

  data.daily.forEach(d => {
    const card = document.createElement("div");
    card.className = "forecast-card";
    const date = new Date(d.dt * 1000).toDateString();
    card.innerHTML = `<strong>${date}</strong><br>${d.temp.min}°C - ${d.temp.max}°C<br>${d.weather[0].main}`;
    dailyDiv.appendChild(card);
  });
}

async function fetchCurrent(city) {
  const res = await fetch(`${backendBase}/weather/search?location=${encodeURIComponent(city)}`);
  const data = await res.json();
  if (!data.length) return;
  const { weather_data } = data[0];
  currentWeatherDiv.classList.remove("hidden");
  currentWeatherDiv.innerHTML = `
    <h2>Real-Time Weather</h2>
    <div class="forecast-card">
      <strong>${weather_data.name}</strong><br>
      ${weather_data.main.temp}°C - ${weather_data.weather[0].description}<br>
      Humidity: ${weather_data.main.humidity}%<br>
      Wind: ${weather_data.wind.speed} m/s
    </div>
  `;
}

async function fetchYouTube(city) {
  const res = await fetch(`${backendBase}/youtube?city=${encodeURIComponent(city)}`);
  const data = await res.json();
  youtubeSection.innerHTML = "";
  (data.videos || []).forEach(video => {
    const iframe = document.createElement("iframe");
    iframe.width = "300";
    iframe.height = "180";
    iframe.src = `https://www.youtube.com/embed/${video.videoId}`;
    iframe.allowFullscreen = true;
    youtubeSection.appendChild(iframe);
  });
}
