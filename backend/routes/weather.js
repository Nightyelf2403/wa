import express from 'express';
import axios from 'axios';
import WeatherRecord from '../models/WeatherRecord.js';

const router = express.Router();
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;

// 📌 POST /api/weather/create
router.post('/create', async (req, res) => {
  try {
    const { location, dateRange } = req.body;

    if (!location || !dateRange || !dateRange.from || !dateRange.to) {
      return res.status(400).json({ error: 'Location and date range are required' });
    }

    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${OPENWEATHER_API_KEY}&units=metric`
    );

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
    if (err.response?.status === 404) {
      res.status(404).json({ error: 'Location not found' });
    } else {
      console.error(err.message);
      res.status(500).json({ error: 'Server error' });
    }
  }
});

// 📌 GET /api/weather/all
router.get('/all', async (req, res) => {
  try {
    const records = await WeatherRecord.find().sort({ createdAt: -1 });
    res.status(200).json(records);
  } catch (err) {
    console.error('Read error:', err.message);
    res.status(500).json({ error: 'Failed to fetch weather records' });
  }
});

// 📌 GET /api/weather/search?location=Paris
router.get('/search', async (req, res) => {
  const location = req.query.location;

  try {
    const records = await WeatherRecord.find({
      location: { $regex: location, $options: 'i' }
    });

    if (records.length === 0) {
      return res.status(404).json({ message: 'No records found' });
    }

    res.status(200).json(records);
  } catch (err) {
    console.error('Search error:', err.message);
    res.status(500).json({ error: 'Failed to search weather records' });
  }
});

// 📌 PUT /api/weather/update/:id
router.put('/update/:id', async (req, res) => {
  const { from, to } = req.body;

  if (!from || !to) {
    return res.status(400).json({ error: 'from and to dates are required' });
  }

  try {
    const updated = await WeatherRecord.findByIdAndUpdate(
      req.params.id,
      { $set: { 'dateRange.from': new Date(from), 'dateRange.to': new Date(to) } },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Record not found' });
    }

    res.status(200).json({ message: 'Weather record updated', updated });
  } catch (err) {
    console.error('Update error:', err.message);
    res.status(500).json({ error: 'Failed to update weather record' });
  }
});

// 📌 DELETE /api/weather/delete/:id
router.delete('/delete/:id', async (req, res) => {
  try {
    const deleted = await WeatherRecord.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ error: 'Record not found' });
    }

    res.status(200).json({ message: 'Weather record deleted' });
  } catch (err) {
    console.error('Delete error:', err.message);
    res.status(500).json({ error: 'Failed to delete weather record' });
  }
});

export default router;
