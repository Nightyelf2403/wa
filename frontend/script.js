const OPENWEATHER_API_KEY = "36ffc6ea6c048bb0fcc1752338facd48";
const backendBase = "https://wa-c1rh.onrender.com/api";
const RAPIDAPI_KEY = "7f735282efmshce0eccb67be20bdp13e90cjsn552d58dcfa0e";
const datalist = document.getElementById("citySuggestions");

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
      const res = await fetch(`https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${OPENWEATHER_API_KEY}`);
      const [locData] = await res.json();
      if (!locData || !locData.name) throw new Error();
      cityInput.value = locData.name;
      fetchAll(locData.name);
    } catch {
      showError("Failed to detect city from location");
    }
  });
});

cityInput.addEventListener("input", async () => {
  const query = cityInput.value;
  if (query.length < 3) return;

  try {
    const res = await fetch(`https://wft-geo-db.p.rapidapi.com/v1/geo/cities?namePrefix=${query}&limit=10`, {
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': 'wft-geo-db.p.rapidapi.com'
      }
    });

    const data = await res.json();
    datalist.innerHTML = "";

    (data.data || []).forEach(city => {
      const option = document.createElement("option");
      option.value = `${city.city}, ${city.country}`;
      datalist.appendChild(option);
    });
  } catch {
    console.log("City suggestions failed");
  }
});


function showError(msg) {
  errorMessage.innerText = msg;
  forecastSection.classList.add("hidden");
  currentWeatherDiv.classList.add("hidden");
}

async function fetchAll(city) {
  errorMessage.innerText = "";
  fetchCurrent(city);
  fetchForecast(city);
  fetchYouTube(city);
  mapFrame.src = `https://www.google.com/maps?q=${encodeURIComponent(city)}&output=embed`;
}

async function fetchCurrent(city) {
  try {
    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${OPENWEATHER_API_KEY}&units=metric`);
    const weather_data = await res.json();

    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    currentWeatherDiv.classList.remove("hidden");
    currentWeatherDiv.innerHTML = `
      <h2>Real-Time Weather</h2>
      <div class="forecast-card">
        <strong>${weather_data.name}</strong><br>
        ${weather_data.main.temp}°C - ${weather_data.weather[0].description}<br>
        Humidity: ${weather_data.main.humidity}%<br>
        Wind: ${weather_data.wind.speed} m/s<br>
        <em>Updated at: ${timeString}</em>
      </div>
    `;
  } catch (err) {
    showError("Failed to fetch real-time weather.");
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
