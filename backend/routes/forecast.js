import express from 'express';
import axios from 'axios';

const router = express.Router();
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;

// 📌 GET /api/forecast?city=London
router.get('/', async (req, res) => {
  const city = req.query.city;

  if (!city) {
    return res.status(400).json({ error: 'City is required' });
  }

  try {
  const geoRes = await axios.get(
    `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${OPENWEATHER_API_KEY}`
  );

  if (!geoRes.data.length) {
    return res.status(404).json({ error: 'City not found' });
  }

  const { lat, lon } = geoRes.data[0];
  console.log(`Lat/Lon for ${city}:`, lat, lon);

  const forecastRes = await axios.get(
    `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,alerts&units=metric&appid=${OPENWEATHER_API_KEY}`
  );

  const { hourly, daily } = forecastRes.data;

  res.json({
    city,
    hourly: hourly.slice(0, 12),
    daily: daily.slice(0, 5)
  });

} catch (err) {
  console.error('Forecast error details:', err.response?.data || err.message);
  res.status(500).json({ error: 'Failed to fetch forecast data' });
}

});

export default router;
