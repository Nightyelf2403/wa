// frontend/script.js

const backendBase = "https://wa-c1rh.onrender.com/api";

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const geoBtn = document.getElementById("geoBtn");
const errorMessage = document.getElementById("errorMessage");
const forecastSection = document.getElementById("forecastSection");
const hourlyDiv = document.getElementById("hourlyForecast");
const dailyDiv = document.getElementById("dailyForecast");
const youtubeDiv = document.getElementById("youtubeVideos");
const mapFrame = document.getElementById("cityMap");

searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (!city) {
    showError("Please enter a city");
    return;
  }
  fetchWeather(city);
});

geoBtn.addEventListener("click", () => {
  if (!navigator.geolocation) {
    showError("Geolocation is not supported");
    return;
  }
  navigator.geolocation.getCurrentPosition(async (pos) => {
    const { latitude, longitude } = pos.coords;
    try {
      const locRes = await fetch(
        `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=36ffc6ea6c048bb0fcc1752338facd48`
      );
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
  forecastSection.classList.add("hidden");
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

    forecastSection.classList.remove("hidden");
    hourlyDiv.innerHTML = "";
    dailyDiv.innerHTML = "";
    youtubeDiv.innerHTML = "";

    data.hourly.forEach((h) => {
      const card = document.createElement("div");
      card.className = "forecast-card";
      const time = new Date(h.dt * 1000).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      card.innerHTML = `<strong>${time}</strong><br>${h.temp}&deg;C<br>${h.weather[0].main}`;
      hourlyDiv.appendChild(card);
    });

    data.daily.forEach((d) => {
      const card = document.createElement("div");
      card.className = "forecast-card";
      const date = new Date(d.dt * 1000).toDateString();
      card.innerHTML = `<strong>${date}</strong><br>${d.temp.min}&deg;C - ${d.temp.max}&deg;C<br>${d.weather[0].main}`;
      dailyDiv.appendChild(card);
    });

    const ytRes = await fetch(`${backendBase}/youtube?city=${encodeURIComponent(city)}`);
    const ytData = await ytRes.json();
    (ytData.videos || []).forEach((video) => {
      const iframe = document.createElement("iframe");
      iframe.src = `https://www.youtube.com/embed/${video.videoId}`;
      iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      iframe.allowFullscreen = true;
      iframe.width = "300";
      iframe.height = "180";
      youtubeDiv.appendChild(iframe);
    });

    mapFrame.src = `https://www.google.com/maps?q=${encodeURIComponent(city)}&output=embed`;
  } catch (err) {
    console.error(err);
    showError("Error fetching data.");
  }
}
