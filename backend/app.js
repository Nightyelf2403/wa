import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';

import weatherRoutes from './routes/weather.js';
import youtubeRoutes from './routes/youtube.js';
import exportRoutes from './routes/export.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check route (optional)
app.get('/', (req, res) => {
  res.send('Weather backend is running!');
});

// Mount routes
app.use('/api/weather', weatherRoutes);
app.use('/api/youtube', youtubeRoutes);
app.use('/api/export', exportRoutes);

// Connect to MongoDB and start server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('MongoDB connection failed:', err.message);
  });
