import express from 'express';
import { parse } from 'json2csv';
import WeatherRecord from '../models/WeatherRecord.js';

const router = express.Router();

router.get('/csv', async (req, res) => {
  try {
    const records = await WeatherRecord.findAll();

    // Format the CSV fields
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
