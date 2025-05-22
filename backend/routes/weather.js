
import express from 'express';
import axios from 'axios';
import WeatherRecord from '../models/WeatherRecord.js';

const router = express.Router();
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;

// 📌 POST /api/weather/create
router.post('/create', async (req, res) => {
  try {
    const { location, dateRange } = req.body;

    // Input validation
    if (!location || !dateRange || !dateRange.from || !dateRange.to) {
      return res.status(400).json({ error: 'Location and date range are required' });
    }

    // Get current weather data from OpenWeatherMap
    const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${OPENWEATHER_API_KEY}&units=metric`);

    const weatherData = response.data;

    const newRecord = new WeatherRecord({
      location,
      dateRange: {
        from: new Date(dateRange.from),
        to: new Date(dateRange.to)
      },
      weatherData
    });

    await newRecord.save();
    res.status(201).json({ message: 'Weather record saved', record: newRecord });
  } catch (err) {
    if (err.response && err.response.status === 404) {
      res.status(404).json({ error: 'Location not found' });
    } else {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  }
});

export default router;
