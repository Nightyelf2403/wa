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


