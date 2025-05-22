import express from 'express';
import axios from 'axios';
const router = express.Router();

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;

router.get('/forecast', async (req, res) => {
  try {
    const { city } = req.query;
    if (!city) return res.status(400).json({ error: 'City is required' });

    // STEP 1: Get Lat/Lon from city
    const geoRes = await axios.get(`http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${OPENWEATHER_API_KEY}`);
    const geoData = geoRes.data;

    if (!geoData || geoData.length === 0) {
      return res.status(404).json({ error: 'City not found' });
    }

    const { lat, lon } = geoData[0];

    // STEP 2: Get forecast using One Call API
    const forecastRes = await axios.get(`https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,alerts&units=metric&appid=${OPENWEATHER_API_KEY}`);
    const forecastData = forecastRes.data;

    res.json({
      lat,
      lon,
      current: forecastData.current,
      hourly: forecastData.hourly.slice(0, 12),
      daily: forecastData.daily.slice(0, 6)
    });
  } catch (err) {
    console.error("Forecast error details:", err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to fetch forecast data' });
  }
});

export default router;
