import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';

import weatherRoutes from './routes/weather.js';
import youtubeRoutes from './routes/youtube.js';
import exportRoutes from './routes/export.js';
import forecastRoutes from './routes/forecast.js';
import sequelize from './db/sequelize.js';
import WeatherRecord from './models/WeatherRecord.js';

dotenv.config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Optional: Health check
app.get('/', (req, res) => {
  res.send('✅ Weather backend is running!');
});

// Mount Routes
app.use('/api/weather', weatherRoutes);
app.use('/api/youtube', youtubeRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/forecast', forecastRoutes);

// Connect to PostgreSQL using Sequelize
sequelize.sync()
  .then(() => {
    console.log('✅ PostgreSQL synced');

    // Connect to MongoDB
    mongoose.connect(process.env.MONGO_URI)
      .then(() => {
        console.log('✅ Connected to MongoDB');

        // Start server
        app.listen(PORT, () => {
          console.log(`🚀 Server running on port ${PORT}`);
        });
      })
      .catch(err => {
        console.error('❌ MongoDB connection failed:', err.message);
      });

  })
  .catch(err => {
    console.error('❌ PostgreSQL sync failed:', err.message);
  });
