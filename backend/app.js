// backend/app.js

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cors from 'cors';

// Import route modules (to be implemented)
import weatherRoutes from './routes/weather.js';
import youtubeRoutes from './routes/youtube.js';
import exportRoutes from './routes/export.js';

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

app.get('/', (req, res) => {
  res.send('Weather backend is running!');
});

// Middleware
app.use(cors());
app.use(bodyParser.json());

// API routes
app.use('/api/weather', weatherRoutes);
app.use('/api/youtube', youtubeRoutes);
app.use('/api/export', exportRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.send('Weather App API is running.');
});

// Connect to MongoDB and start server
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('Connected to MongoDB');
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})
.catch(err => {
  console.error('Error connecting to MongoDB:', err.message);
});
