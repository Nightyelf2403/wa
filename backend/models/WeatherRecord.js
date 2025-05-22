import mongoose from 'mongoose';

const WeatherRecordSchema = new mongoose.Schema({
  location: {
    type: String,
    required: true
  },
  dateRange: {
    from: { type: Date, required: true },
    to: { type: Date, required: true }
  },
  weatherData: {
    type: Object,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const WeatherRecord = mongoose.model('WeatherRecord', WeatherRecordSchema);
export default WeatherRecord;
