const backendURL = "https://wa-c1rh.onrender.com/api";

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");
const forecastSection = document.getElementById("forecastSection");
const hourlyDiv = document.getElementById("hourlyForecast");
const dailyDiv = document.getElementById("dailyForecast");
const errorDiv = document.getElementById("errorMessage");

searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (city) fetchForecast(city);
});

locationBtn.addEventListener("click", () => {
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords;
      try {
        const geoURL = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;
        const res = await fetch(geoURL);
        const data = await res.json();
        const city = data.city || data.locality || data.principalSubdivision;
        if (city) {
          cityInput.value = city;
          fetchForecast(city);
        } else {
          errorDiv.innerText = "Unable to determine city from your location.";
        }
      } catch {
        errorDiv.innerText = "Geolocation lookup failed.";
      }
    },
    () => {
      errorDiv.innerText = "Location permission denied.";
    }
  );
});

async function fetchForecast(city) {
  errorDiv.innerText = "";
  hourlyDiv.innerHTML = "";
  dailyDiv.innerHTML = "";

  try {
    const res = await fetch(`${backendURL}/forecast?city=${encodeURIComponent(city)}`);
    const data = await res.json();

    if (!data.list || !Array.isArray(data.list)) {
      errorDiv.innerText = "City not found or forecast unavailable.";
      return;
    }

    forecastSection.style.display = "block";

    // 6 hourly
    const next6 = data.list.slice(0, 6);
    next6.forEach(item => {
      const time = new Date(item.dt * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const card = document.createElement("div");
      card.className = "forecast-card";
      card.innerHTML = `<strong>${time}</strong><br>${(item.main.temp - 273.15).toFixed(1)}°C<br>${item.weather[0].main}`;
      hourlyDiv.appendChild(card);
    });

    // 5-day (every 8 steps)
    for (let i = 0; i < data.list.length; i += 8) {
      const item = data.list[i];
      const date = new Date(item.dt * 1000).toDateString();
      const card = document.createElement("div");
      card.className = "forecast-card";
      card.innerHTML = `<strong>${date}</strong><br>${(item.main.temp - 273.15).toFixed(1)}°C<br>${item.weather[0].main}`;
      dailyDiv.appendChild(card);
    }
  } catch (e) {
    errorDiv.innerText = "Error fetching data.";
  }
}
