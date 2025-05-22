const backendURL = "https://wa-c1rh.onrender.com/api";
const weatherForm = document.getElementById("weatherForm");
const locationInput = document.getElementById("location");
const fromDate = document.getElementById("fromDate");
const toDate = document.getElementById("toDate");
const weatherDisplay = document.getElementById("weatherDisplay");
const savedList = document.getElementById("savedList");
const youtubeSection = document.getElementById("youtubeVideos");
const mapFrame = document.getElementById("mapFrame");

weatherForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const location = locationInput.value;
  const from = fromDate.value;
  const to = toDate.value;

  const body = {
    location,
    dateRange: { from, to }
  };

  const res = await fetch(`${backendURL}/weather/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  const data = await res.json();
  if (res.ok) {
    displayWeather(data.record);
    fetchSaved();
    fetchYouTube(location);
    showMap(location);
  } else {
    weatherDisplay.innerHTML = `<p style="color:red;">${data.error}</p>`;
  }
});

function displayWeather(record) {
  const iconCode = record.weatherData.weather[0].icon;
  const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

  weatherDisplay.innerHTML = `
    <h3>${record.location} Weather</h3>
    <img src="${iconUrl}" alt="Weather Icon" />
    <p>Temp: ${record.weatherData.main.temp} °C</p>
    <p>Humidity: ${record.weatherData.main.humidity}%</p>
    <p>From: ${new Date(record.dateRange.from).toDateString()}</p>
    <p>To: ${new Date(record.dateRange.to).toDateString()}</p>
  `;
}

async function fetchSaved() {
  const res = await fetch(`${backendURL}/weather/all`);
  const records = await res.json();

  savedList.innerHTML = "";
  records.forEach(record => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${record.location}</strong><br>
      ${new Date(record.dateRange.from).toDateString()} to ${new Date(record.dateRange.to).toDateString()}<br>
      Temp: ${record.weatherData.main.temp} °C
      <button onclick="deleteRecord('${record._id}')">Delete</button>
    `;
    savedList.appendChild(li);
  });
}

async function deleteRecord(id) {
  await fetch(`${backendURL}/weather/delete/${id}`, { method: "DELETE" });
  fetchSaved();
}

async function fetchYouTube(city) {
  const res = await fetch(`${backendURL}/youtube?city=${city}`);
  const data = await res.json();

  youtubeSection.innerHTML = "";
  if (data.videos && data.videos.length > 0) {
    data.videos.forEach(video => {
      const iframe = document.createElement("iframe");
      iframe.src = `https://www.youtube.com/embed/${video.videoId}`;
      iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      youtubeSection.appendChild(iframe);
    });
  } else {
    youtubeSection.innerHTML = "<p>No videos found.</p>";
  }
}

function showMap(city) {
  const mapSrc = `https://www.google.com/maps/embed/v1/place?key=AIzaSyAsMJvxZ0svpk_D5eSQqMeiap3_GLNPSoI&q=${encodeURIComponent(city)}`;
  mapFrame.src = mapSrc;
}

// Initial load
fetchSaved();
