const backendURL = "https://wa-c1rh.onrender.com/api";

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");
const errorDiv = document.getElementById("error");
const forecastSection = document.getElementById("forecastSection");
const hourlyDiv = document.getElementById("hourlyForecast");
const dailyDiv = document.getElementById("dailyForecast");
const youtubeDiv = document.getElementById("youtubeVideos");
const mapIframe = document.getElementById("cityMap");

searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (!city) {
    errorDiv.innerText = "Please enter a city name.";
    return;
  }
  fetchForecast(city);
});

locationBtn.addEventListener("click", () => {
  if (!navigator.geolocation) {
    errorDiv.innerText = "Geolocation not supported by your browser.";
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async position => {
      const { latitude, longitude } = position.coords;
      try {
        const geoRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
        const geoData = await geoRes.json();
        if (geoData.city || geoData.locality) {
          const cityName = geoData.city || geoData.locality;
          cityInput.value = cityName;
          fetchForecast(cityName);
        } else {
          errorDiv.innerText = "Unable to determine city from coordinates.";
        }
      } catch {
        errorDiv.innerText = "Failed to reverse geocode your location.";
      }
    },
    () => {
      errorDiv.innerText = "Location access denied.";
    }
  );
});

async function fetchForecast(city) {
  errorDiv.innerText = "";
  hourlyDiv.innerHTML = "";
  dailyDiv.innerHTML = "";
  youtubeDiv.innerHTML = "";
  forecastSection.style.display = "none";

  try {
    const res = await fetch(`${backendURL}/forecast?city=${encodeURIComponent(city)}`);
    const data = await res.json();

    if (!data || !data.list || data.list.length === 0) {
      errorDiv.innerText = "City not found or forecast unavailable.";
      return;
    }

    forecastSection.style.display = "block";

    // Hourly forecast - next 6 intervals
    const next6 = data.list.slice(0, 6);
    next6.forEach(item => {
      const time = new Date(item.dt * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const card = document.createElement("div");
      card.className = "forecast-card";
      card.innerHTML = `<strong>${time}</strong><br>${(item.main.temp - 273.15).toFixed(1)}°C<br>${item.weather[0].main}`;
      hourlyDiv.appendChild(card);
    });

    // Daily forecast - every 8th interval (~24hr)
    for (let i = 0; i < data.list.length; i += 8) {
      const item = data.list[i];
      const date = new Date(item.dt * 1000).toDateString();
      const card = document.createElement("div");
      card.className = "forecast-card";
      card.innerHTML = `<strong>${date}</strong><br>${(item.main.temp - 273.15).toFixed(1)}°C<br>${item.weather[0].main}`;
      dailyDiv.appendChild(card);
    }

    // YouTube videos
    const ytRes = await fetch(`${backendURL}/youtube?city=${encodeURIComponent(city)}`);
    const ytData = await ytRes.json();
    if (ytData && ytData.videos) {
      ytData.videos.forEach(video => {
        const iframe = document.createElement("iframe");
        iframe.src = `https://www.youtube.com/embed/${video.videoId}`;
        youtubeDiv.appendChild(iframe);
      });
    }

    // Map
    mapIframe.src = `https://www.google.com/maps?q=${encodeURIComponent(city)}&output=embed`;

  } catch (err) {
    console.error("❌ Forecast Fetch Error:", err);
    errorDiv.innerText = "Error fetching data.";
  }
}

function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
}
