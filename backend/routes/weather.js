import express from 'express';
import axios from 'axios';
import WeatherRecord from '../models/WeatherRecord.js';

const router = express.Router();
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;

// 📌 POST /api/weather/create
router.post('/create', async (req, res) => {
  try {
    const { location, dateRange } = req.body;

    if (!location || !dateRange?.from || !dateRange?.to) {
      return res.status(400).json({ error: 'Location and date range are required' });
    }

    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${OPENWEATHER_API_KEY}&units=metric`
    );

    const weatherData = response.data;

    const record = await WeatherRecord.create({
      location,
      date_from: dateRange.from,
      date_to: dateRange.to,
      weather_data: weatherData
    });

    res.status(201).json({ message: 'Weather record saved', record });
  } catch (err) {
    console.error(err.message);
    if (err.response?.status === 404) {
      res.status(404).json({ error: 'Location not found' });
    } else {
      res.status(500).json({ error: 'Server error' });
    }
  }
});

// 📌 GET /api/weather/all
router.get('/all', async (req, res) => {
  try {
    const records = await WeatherRecord.findAll({ order: [['createdAt', 'DESC']] });
    res.json(records);
  } catch (err) {
    console.error('Read error:', err.message);
    res.status(500).json({ error: 'Failed to fetch records' });
  }
});

// 📌 GET /api/weather/search?location=City
router.get('/search', async (req, res) => {
  const location = req.query.location;

  try {
    const records = await WeatherRecord.findAll({
      where: {
        location: {
          [WeatherRecord.sequelize.Op.iLike]: `%${location}%`
        }
      }
    });

    if (records.length === 0) {
      return res.status(404).json({ message: 'No records found' });
    }

    res.json(records);
  } catch (err) {
    console.error('Search error:', err.message);
    res.status(500).json({ error: 'Search failed' });
  }
});

// 📌 PUT /api/weather/update/:id
router.put('/update/:id', async (req, res) => {
  const { from, to } = req.body;

  if (!from || !to) {
    return res.status(400).json({ error: 'from and to dates are required' });
  }

  try {
    const updated = await WeatherRecord.update(
      { date_from: from, date_to: to },
      { where: { id: req.params.id }, returning: true }
    );

    if (!updated[0]) {
      return res.status(404).json({ error: 'Record not found' });
    }

    res.json({ message: 'Weather record updated', updated: updated[1][0] });
  } catch (err) {
    console.error('Update error:', err.message);
    res.status(500).json({ error: 'Update failed' });
  }
});

// 📌 DELETE /api/weather/delete/:id
router.delete('/delete/:id', async (req, res) => {
  try {
    const deleted = await WeatherRecord.destroy({ where: { id: req.params.id } });

    if (!deleted) {
      return res.status(404).json({ error: 'Record not found' });
    }

    res.json({ message: 'Weather record deleted' });
  } catch (err) {
    console.error('Delete error:', err.message);
    res.status(500).json({ error: 'Delete failed' });
  }
});

export default router;
