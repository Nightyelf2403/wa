import express from 'express';
import axios from 'axios';

const router = express.Router();
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;

// Utility to fetch lat/lon for a city
async function getLatLon(city) {
  const response = await axios.get(`https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${OPENWEATHER_API_KEY}`);
  if (!response.data.length) throw new Error('City not found');
  return {
    lat: response.data[0].lat,
    lon: response.data[0].lon
  };
}

// 📌 GET /api/forecast?city=London
router.get('/', async (req, res) => {
  try {
    const city = req.query.city;
    if (!city) return res.status(400).json({ error: 'City is required' });

    const { lat, lon } = await getLatLon(city);

    const forecastRes = await axios.get(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${OPENWEATHER_API_KEY}`);
    const data = forecastRes.data;

    // Extract 5-day forecast and first 12 hours
    const now = Date.now() / 1000;
    const hourly = data.list.slice(0, 4).map(entry => ({
      dt: entry.dt,
      temp: entry.main.temp,
      weather: entry.weather
    }));

    const dailyMap = {};
    data.list.forEach(entry => {
      const date = new Date(entry.dt * 1000).toISOString().split('T')[0];
      if (!dailyMap[date]) {
        dailyMap[date] = {
          dt: entry.dt,
          temp: { min: entry.main.temp_min, max: entry.main.temp_max },
          weather: entry.weather
        };
      } else {
        dailyMap[date].temp.min = Math.min(dailyMap[date].temp.min, entry.main.temp_min);
        dailyMap[date].temp.max = Math.max(dailyMap[date].temp.max, entry.main.temp_max);
      }
    });

    const daily = Object.values(dailyMap).slice(0, 5);

    res.json({ hourly, daily });
  } catch (err) {
    console.error("Forecast error:", err.message);
    res.status(500).json({ error: 'Failed to fetch forecast data' });
  }
});

export default router;
