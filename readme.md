Sure! Here's the complete and polished copy of your `README.md` — ready to paste directly into your project:

---

### ✅ `README.md`

````markdown
# 🌦️ Full-Stack Weather App

A full-featured, responsive weather app that provides real-time weather updates, a 5-day forecast, YouTube travel videos, Google Map view, and data export features. Built with a modern tech stack and designed to meet the technical assessment requirements from PM Accelerator.

---

## 🚀 Features

- 🔍 Search weather by City, Zip Code, Landmark, or GPS
- 🌐 Real-time weather info with updated timestamp
- 📅 5-Day Forecast + Hourly Forecast
- 📍 Detect and display weather based on current location
- 🔁 Smart autocomplete suggestions via GeoDB API
- 🎥 YouTube travel videos for searched cities
- 🗺️ Google Maps embed for each city
- 🌗 Dark mode toggle
- ⚙️ Full CRUD operations with MongoDB
- 📤 Export weather data to JSON, CSV, PDF, and Markdown
- ❌ Graceful error handling for invalid cities or failed API calls

---

## 🧰 Technologies Used

### 🔹 Frontend

- HTML5, CSS3 (Flexbox + Grid), JavaScript (ES6+)
- OpenWeatherMap API (Weather + Forecast)
- GeoDB Cities API (Suggestions)
- YouTube Data API
- Google Maps Embed API

### 🔹 Backend

- Node.js + Express
- MongoDB Atlas (NoSQL DB)
- Axios
- CORS, dotenv
- PDFKit, json2csv, csv-writer, markdown-pdf

---

## 🌐 API Routes

### 📡 Weather (Backend)
| Method | Route                       | Description                          |
|--------|-----------------------------|--------------------------------------|
| GET    | `/api/weather/search`       | Fetch real-time weather              |
| GET    | `/api/forecast?city=`       | Fetch 5-day + hourly forecast        |
| POST   | `/api/weather/create`       | Store weather for location+date      |
| GET    | `/api/weather/read`         | Read all saved weather data          |
| PUT    | `/api/weather/update/:id`   | Update a weather record              |
| DELETE | `/api/weather/delete/:id`   | Delete a weather record              |

### 🧾 Data Export
| Format    | Route                  |
|-----------|------------------------|
| JSON      | `/api/export/json`     |
| CSV       | `/api/export/csv`      |
| PDF       | `/api/export/pdf`      |
| Markdown  | `/api/export/md`       |

---

## ⚙️ Setup & Installation

```bash
# Clone the repository
git clone https://github.com/Nightyelf2403/weather-app.git
cd weather-app

# Backend setup
cd backend
npm install

# Setup .env
# MONGO_URI=
# OPENWEATHER_API_KEY=
# YOUTUBE_API_KEY=
# GOOGLE_MAPS_API_KEY=

npm start

# Frontend setup (if separate)
cd ../frontend
npm install
npm run dev
````

---

## 🧠 About PM Accelerator

The Product Manager Accelerator Program supports PM professionals at every level — from students to VPs — through real-world experience, mentorship, and hands-on product development with engineers and designers.
🔗 [Visit PM Accelerator on LinkedIn](https://www.linkedin.com/school/pmaccelerator/about/)

---

## ✍️ Author

**Lalith Aditya Chunduri**
[GitHub Profile](https://github.com/Nightyelf2403)

---

## 🖼️ Screenshots

> Add screenshots here showing the main interface, dark mode, mobile view, etc.

---

## 📄 License

MIT License (or specify if proprietary)


