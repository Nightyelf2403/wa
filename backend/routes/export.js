
import express from 'express';
import WeatherRecord from '../models/WeatherRecord.js';
import { Parser } from 'json2csv';
import PDFDocument from 'pdfkit';
import fs from 'fs';

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

// === Export to CSV ===
router.get('/csv', async (req, res) => {
  try {
    const data = await WeatherRecord.find().lean();
    const parser = new Parser();
    const csv = parser.parse(data);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=weather.csv');
    res.send(csv);
  } catch (err) {
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
        .text(`Created At: ${record.createdAt}`)
        .text(`Weather: ${JSON.stringify(record.weatherData.main, null, 2)}`);
    });

    doc.end();
  } catch (err) {
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
      markdown += `**Created At:** ${record.createdAt}\n\n`;
      markdown += `**Weather Data:**\n\`\`\`json\n${JSON.stringify(record.weatherData.main, null, 2)}\n\`\`\`\n\n`;
    });

    res.setHeader('Content-Type', 'text/markdown');
    res.setHeader('Content-Disposition', 'attachment; filename=weather.md');
    res.send(markdown);
  } catch (err) {
    res.status(500).json({ error: 'Failed to export Markdown' });
  }
});

// ✅ Export the router
export default router;
