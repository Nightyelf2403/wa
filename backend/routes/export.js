import express from 'express';
import WeatherRecord from '../models/WeatherRecord.js';
import { Parser } from 'json2csv';
import PDFDocument from 'pdfkit';

const router = express.Router();

// === Export to JSON ===
router.get('/json', async (req, res) => {
  try {
    const data = await WeatherRecord.find();
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(data, null, 2));
  } catch (err) {
    res.status(500).json({ error: 'Failed to export JSON' });
  }
});

// === Export to CSV (flattened for nested weatherData) ===
router.get('/csv', async (req, res) => {
  try {
    const data = await WeatherRecord.find().lean();

    // Flatten nested weatherData for CSV
    const flattened = data.map(record => ({
      location: record.location,
      from: record.dateRange.from,
      to: record.dateRange.to,
      temp: record.weatherData?.main?.temp,
      humidity: record.weatherData?.main?.humidity,
      pressure: record.weatherData?.main?.pressure,
      createdAt: record.createdAt
    }));

    const parser = new Parser();
    const csv = parser.parse(flattened);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=weather.csv');
    res.send(csv);
  } catch (err) {
    console.error('CSV Export Error:', err.message);
    res.status(500).json({ error: 'Failed to export CSV' });
  }
});

// === Export to PDF ===
router.get('/pdf', async (req, res) => {
  try {
    const data = await WeatherRecord.find().lean();

    const doc = new PDFDocument();
    let filename = 'weather.pdf';
    res.setHeader('Content-disposition', 'attachment; filename=' + filename);
    res.setHeader('Content-type', 'application/pdf');

    doc.pipe(res);
    doc.fontSize(16).text('Weather Records', { underline: true });

    data.forEach((record, index) => {
      doc
        .moveDown()
        .fontSize(12)
        .text(`Record ${index + 1}`)
        .text(`Location: ${record.location}`)
        .text(`Date Range: ${record.dateRange.from} to ${record.dateRange.to}`)
        .text(`Temp: ${record.weatherData?.main?.temp} °C`)
        .text(`Humidity: ${record.weatherData?.main?.humidity} %`)
        .text(`Pressure: ${record.weatherData?.main?.pressure} hPa`)
        .text(`Created At: ${record.createdAt}`);
    });

    doc.end();
  } catch (err) {
    console.error('PDF Export Error:', err.message);
    res.status(500).json({ error: 'Failed to export PDF' });
  }
});

// === Export to Markdown ===
router.get('/markdown', async (req, res) => {
  try {
    const data = await WeatherRecord.find().lean();
    let markdown = '# Weather Records\n\n';

    data.forEach((record, index) => {
      markdown += `## Record ${index + 1}\n`;
      markdown += `**Location:** ${record.location}\n\n`;
      markdown += `**Date Range:** ${record.dateRange.from} to ${record.dateRange.to}\n\n`;
      markdown += `**Temperature:** ${record.weatherData?.main?.temp} °C\n\n`;
      markdown += `**Humidity:** ${record.weatherData?.main?.humidity} %\n\n`;
      markdown += `**Pressure:** ${record.weatherData?.main?.pressure} hPa\n\n`;
      markdown += `**Created At:** ${record.createdAt}\n\n---\n\n`;
    });

    res.setHeader('Content-Type', 'text/markdown');
    res.setHeader('Content-Disposition', 'attachment; filename=weather.md');
    res.send(markdown);
  } catch (err) {
    console.error('Markdown Export Error:', err.message);
    res.status(500).json({ error: 'Failed to export Markdown' });
  }
});

export default router;
