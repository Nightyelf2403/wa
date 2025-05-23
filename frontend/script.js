const backendBase = "https://app-jvpd.onrender.com/api";

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const geoBtn = document.getElementById("geoBtn");
const forecast = document.getElementById("forecast");
const error = document.getElementById("error");
const hourly = document.getElementById("hourly");
const daily = document.getElementById("daily");

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
    showError("Geolocation not supported");
    return;
  }
  navigator.geolocation.getCurrentPosition(async ({ coords }) => {
    const url = `https://api.openweathermap.org/geo/1.0/reverse?lat=${coords.latitude}&lon=${coords.longitude}&limit=1&appid=36ffc6ea6c048bb0fcc1752338facd48`;
    const response = await fetch(url);
    const data = await response.json();
    const city = data[0]?.name;
    if (city) {
      cityInput.value = city;
      fetchForecast(city);
    } else {
      showError("City not found from location");
    }
  });
});

function showError(msg) {
  error.innerText = msg;
  forecast.classList.add("hidden");
}

async function fetchForecast(city) {
  try {
    const res = await fetch(`${backendBase}/forecast?city=${encodeURIComponent(city)}`);
    const data = await res.json();
    if (data.error) return showError("Could not fetch forecast for your location.");

    error.innerText = "";
    forecast.classList.remove("hidden");

    hourly.innerHTML = "";
    data.hourly.forEach(h => {
      const card = document.createElement("div");
      card.className = "forecast-card";
      const time = new Date(h.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      card.innerHTML = `<strong>${time}</strong><br>${h.temp}°C<br>${h.weather[0].main}`;
      hourly.appendChild(card);
    });

    daily.innerHTML = "";
    data.daily.forEach(d => {
      const card = document.createElement("div");
      card.className = "forecast-card";
      const date = new Date(d.dt * 1000).toDateString();
      card.innerHTML = `<strong>${date}</strong><br>${d.temp.min}°C - ${d.temp.max}°C<br>${d.weather[0].main}`;
      daily.appendChild(card);
    });
  } catch (err) {
    console.error(err);
    showError("Error fetching data.");
  }
}
