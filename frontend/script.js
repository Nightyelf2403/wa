const backendBase = "https://wa-c1rh.onrender.com/api";

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const geoBtn = document.getElementById("geoBtn");
const currentDiv = document.getElementById("currentWeather");
const hourlyDiv = document.getElementById("hourlyForecast");
const dailyDiv = document.getElementById("dailyForecast");
const youtubeDiv = document.getElementById("youtubeVideos");
const mapIframe = document.getElementById("cityMap");
const errorDiv = document.getElementById("errorMessage");

searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (!city) return showError("Please enter a city name");
  fetchAll(city);
});

geoBtn.addEventListener("click", () => {
  if (!navigator.geolocation) return showError("Geolocation not supported");
  navigator.geolocation.getCurrentPosition(async (pos) => {
    const { latitude, longitude } = pos.coords;
    try {
      const response = await fetch(`https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=36ffc6ea6c048bb0fcc1752338facd48`);
      const [data] = await response.json();
      if (!data?.name) throw new Error();
      cityInput.value = data.name;
      fetchAll(data.name);
    } catch {
      showError("Unable to detect location");
    }
  });
});

function showError(msg) {
  errorDiv.innerText = msg;
  currentDiv.innerHTML = hourlyDiv.innerHTML = dailyDiv.innerHTML = youtubeDiv.innerHTML = "";
  mapIframe.src = "";
}

async function fetchAll(city) {
  try {
    errorDiv.innerText = "";
    await fetchCurrent(city);
    await fetchForecast(city);
    await fetchYouTube(city);
    mapIframe.src = `https://www.google.com/maps?q=${encodeURIComponent(city)}&output=embed`;
  } catch (e) {
    console.error("Fetch error:", e);
    showError("Something went wrong fetching the weather.");
  }
}

async function fetchCurrent(city) {
  const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=36ffc6ea6c048bb0fcc1752338facd48`);
  const data = await res.json();
  if (data.cod !== 200) throw new Error("Invalid city");
  const icon = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
  currentDiv.innerHTML = `
    <div class="forecast-card">
      <h3>${data.name}, ${data.sys.country}</h3>
      <img src="${icon}" alt="${data.weather[0].main}">
      <p><strong>${data.main.temp}°C</strong> - ${data.weather[0].description}</p>
      <p>Humidity: ${data.main.humidity}% | Wind: ${data.wind.speed} m/s</p>
    </div>
  `;
}

async function fetchForecast(city) {
  const res = await fetch(`${backendBase}/forecast?city=${encodeURIComponent(city)}`);
  const data = await res.json();
  if (data.error) throw new Error("Forecast error");

  hourlyDiv.innerHTML = "";
  data.hourly.forEach(h => {
    const card = document.createElement("div");
    card.className = "forecast-card";
    const time = new Date(h.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    card.innerHTML = `<strong>${time}</strong><br>${h.temp}°C<br>${h.weather[0].main}`;
    hourlyDiv.appendChild(card);
  });

  dailyDiv.innerHTML = "";
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
  youtubeDiv.innerHTML = "";
  if (!data.videos) return;
  data.videos.forEach(video => {
    const iframe = document.createElement("iframe");
    iframe.src = `https://www.youtube.com/embed/${video.videoId}`;
    iframe.allowFullscreen = true;
    iframe.width = 300;
    iframe.height = 180;
    youtubeDiv.appendChild(iframe);
  });
}
