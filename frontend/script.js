// frontend/script.js

const backendBase = "https://wa-c1rh.onrender.com/api";

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const geoBtn = document.getElementById("geoBtn");
const errorDiv = document.getElementById("error");
const forecastDiv = document.getElementById("forecast");
const hourlyDiv = document.getElementById("hourly");
const dailyDiv = document.getElementById("daily");
const youtubeDiv = document.getElementById("youtubeVideos");
const mapFrame = document.getElementById("cityMap");

searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (!city) {
    showError("Please enter a city name");
    return;
  }
  fetchForecast(city);
});

geoBtn.addEventListener("click", () => {
  if (!navigator.geolocation) {
    showError("Geolocation not supported");
    return;
  }

  navigator.geolocation.getCurrentPosition(async (position) => {
    const { latitude, longitude } = position.coords;
    try {
      const geoRes = await fetch(`https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=36ffc6ea6c048bb0fcc1752338facd48`);
      const [data] = await geoRes.json();
      if (!data || !data.name) throw new Error();
      cityInput.value = data.name;
      fetchForecast(data.name);
    } catch (e) {
      showError("Failed to detect city from location");
    }
  });
});

function showError(msg) {
  errorDiv.innerText = msg;
  forecastDiv.classList.add("hidden");
  youtubeDiv.innerHTML = "";
  mapFrame.src = "";
}

async function fetchForecast(city) {
  try {
    errorDiv.innerText = "";
    const res = await fetch(`${backendBase}/forecast?city=${encodeURIComponent(city)}`);
    const data = await res.json();

    if (data.error) {
      showError("City not found or weather unavailable");
      return;
    }

    forecastDiv.classList.remove("hidden");
    hourlyDiv.innerHTML = "";
    dailyDiv.innerHTML = "";

    data.hourly.forEach(hour => {
      const time = new Date(hour.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const card = document.createElement("div");
      card.className = "forecast-card";
      card.innerHTML = `<strong>${time}</strong><br>${hour.temp}&deg;C<br>${hour.weather[0].main}`;
      hourlyDiv.appendChild(card);
    });

    data.daily.forEach(day => {
      const date = new Date(day.dt * 1000).toDateString();
      const card = document.createElement("div");
      card.className = "forecast-card";
      card.innerHTML = `<strong>${date}</strong><br>${day.temp.min}&deg;C - ${day.temp.max}&deg;C<br>${day.weather[0].main}`;
      dailyDiv.appendChild(card);
    });

    // YouTube Videos
    const ytRes = await fetch(`${backendBase}/youtube?city=${encodeURIComponent(city)}`);
    const ytData = await ytRes.json();
    youtubeDiv.innerHTML = "";
    (ytData.videos || []).forEach(video => {
      const iframe = document.createElement("iframe");
      iframe.src = `https://www.youtube.com/embed/${video.videoId}`;
      iframe.width = "300";
      iframe.height = "180";
      iframe.style.margin = "10px";
      iframe.allowFullscreen = true;
      youtubeDiv.appendChild(iframe);
    });

    // Map
    mapFrame.src = `https://www.google.com/maps?q=${encodeURIComponent(city)}&output=embed`;
  } catch (err) {
    console.error("Fetch error:", err);
    showError("Error fetching weather data");
  }
}
