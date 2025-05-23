// weather/models/WeatherRecord.js
import { DataTypes } from 'sequelize';
import sequelize from '../db/sequelize.js';

const WeatherRecord = sequelize.define('WeatherRecord', {
  location: {
    type: DataTypes.STRING,
    allowNull: false
  },
  date_from: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  date_to: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  weather_data: {
    type: DataTypes.JSONB
  }
}, {
  timestamps: true
});

export default WeatherRecord;


// weather/routes/export.js
import express from 'express';
import { parse } from 'json2csv';
import WeatherRecord from '../models/WeatherRecord.js';

const router = express.Router();

router.get('/csv', async (req, res) => {
  try {
    const records = await WeatherRecord.findAll();

    const data = records.map(record => ({
      id: record.id,
      location: record.location,
      date_from: record.date_from,
      date_to: record.date_to,
      temperature: record.weather_data?.main?.temp || '',
      description: record.weather_data?.weather?.[0]?.description || ''
    }));

    const csv = parse(data);
    res.header('Content-Type', 'text/csv');
    res.attachment('weather_data.csv');
    res.send(csv);
  } catch (error) {
    console.error('❌ CSV Export Error:', error);
    res.status(500).json({ error: 'Failed to export CSV', details: error.message });
  }
});

export default router;


// weather/routes/forecast.js
import express from 'express';
import axios from 'axios';

const router = express.Router();
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;

async function getLatLon(city) {
  const response = await axios.get(`https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${OPENWEATHER_API_KEY}`);
  if (!response.data.length) throw new Error('City not found');
  return { lat: response.data[0].lat, lon: response.data[0].lon };
}

router.get('/', async (req, res) => {
  try {
    const city = req.query.city;
    if (!city) return res.status(400).json({ error: 'City is required' });

    const { lat, lon } = await getLatLon(city);
    const forecastRes = await axios.get(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${OPENWEATHER_API_KEY}`);
    const data = forecastRes.data;

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
    console.error('❌ Forecast error:', err.message);
    res.status(500).json({ error: 'Failed to fetch forecast data' });
  }
});

export default router;


// weather/routes/weather.js
import express from 'express';
import axios from 'axios';
import WeatherRecord from '../models/WeatherRecord.js';
import { Op } from 'sequelize';

const router = express.Router();
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;

router.post('/create', async (req, res) => {
  try {
    const { location, dateRange } = req.body;
    if (!location || !dateRange?.from || !dateRange?.to) return res.status(400).json({ error: 'Location and date range are required' });

    const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${OPENWEATHER_API_KEY}&units=metric`);
    const weatherData = response.data;

    const record = await WeatherRecord.create({ location, date_from: dateRange.from, date_to: dateRange.to, weather_data: weatherData });
    res.status(201).json({ message: 'Weather record saved', record });
  } catch (err) {
    console.error("❌ Weather Create Error:", err);
    if (err.response && err.response.status === 404) {
      res.status(404).json({ error: 'Location not found' });
    } else {
      res.status(500).json({ error: 'Server error', details: err.message });
    }
  }
});

router.get('/all', async (req, res) => {
  try {
    const records = await WeatherRecord.findAll({ order: [['createdAt', 'DESC']] });
    res.json(records);
  } catch (err) {
    console.error('Read error:', err.message);
    res.status(500).json({ error: 'Failed to fetch records' });
  }
});

router.get('/search', async (req, res) => {
  const location = req.query.location;
  try {
    const records = await WeatherRecord.findAll({ where: { location: { [Op.iLike]: `%${location}%` } } });
    if (records.length === 0) return res.status(404).json({ message: 'No records found' });
    res.json(records);
  } catch (err) {
    console.error('Search error:', err.message);
    res.status(500).json({ error: 'Search failed' });
  }
});

router.put('/update/:id', async (req, res) => {
  const { from, to } = req.body;
  if (!from || !to) return res.status(400).json({ error: 'from and to dates are required' });

  try {
    const [rowsUpdated, [updatedRecord]] = await WeatherRecord.update(
      { date_from: from, date_to: to },
      { where: { id: req.params.id }, returning: true }
    );

    if (!rowsUpdated) return res.status(404).json({ error: 'Record not found' });
    res.json({ message: 'Weather record updated', updated: updatedRecord });
  } catch (err) {
    console.error('Update error:', err.message);
    res.status(500).json({ error: 'Update failed' });
  }
});

router.delete('/delete/:id', async (req, res) => {
  try {
    const deleted = await WeatherRecord.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ error: 'Record not found' });
    res.json({ message: 'Weather record deleted' });
  } catch (err) {
    console.error('Delete error:', err.message);
    res.status(500).json({ error: 'Delete failed' });
  }
});

export default router;


// weather/routes/youtube.js
import express from 'express';
import axios from 'axios';

const router = express.Router();
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

router.get('/', async (req, res) => {
  const city = req.query.city;
  if (!city) return res.status(400).json({ error: 'City is required' });
  if (!YOUTUBE_API_KEY) return res.status(500).json({ error: 'YouTube API key not configured' });

  try {
    const url = 'https://www.googleapis.com/youtube/v3/search';
    const params = {
      part: 'snippet',
      q: `${city} travel guide`,
      type: 'video',
      maxResults: 5,
      key: YOUTUBE_API_KEY,
    };
    const response = await axios.get(url, { params });
    if (!response.data.items || response.data.items.length === 0) return res.status(404).json({ error: 'No videos found' });

    const videos = response.data.items.map(item => ({
      title: item.snippet?.title || 'Untitled',
      videoId: item.id?.videoId || '',
      thumbnail: item.snippet?.thumbnails?.high?.url || '',
      channel: item.snippet?.channelTitle || '',
      publishedAt: item.snippet?.publishedAt || '',
    }));

    res.status(200).json({ city, videos });
  } catch (error) {
    const errorDetails = error?.response?.data || error.message;
    console.error('YouTube API Error:', errorDetails);
    res.status(500).json({ error: 'Failed to fetch YouTube videos', details: errorDetails });
  }
});

export default router;
