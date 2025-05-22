import { DataTypes } from 'sequelize';
import sequelize from '../db/sequelize.js';

const WeatherRecord = sequelize.define('WeatherRecord', {
  location: {
    type: DataTypes.STRING,
    allowNull: false
  },
  date_from: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  date_to: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  weather_data: {
    type: DataTypes.JSONB
  }
}, {
  timestamps: true
});

export default WeatherRecord;
