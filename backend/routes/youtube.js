
import express from 'express';
import axios from 'axios';

const router = express.Router();
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

// GET /api/youtube?city=Paris
router.get('/', async (req, res) => {
  const city = req.query.city;
  if (!city) {
    return res.status(400).json({ error: 'City is required' });
  }

  try {
    const response = await axios.get(
      `https://www.googleapis.com/youtube/v3/search`,
      {
        params: {
          part: 'snippet',
          maxResults: 5,
          q: `${city} travel guide`,
          key: YOUTUBE_API_KEY
        }
      }
    );

    const videos = response.data.items.map(item => ({
      title: item.snippet.title,
      videoId: item.id.videoId,
      thumbnail: item.snippet.thumbnails.high.url
    }));

    res.json({ city, videos });
  } catch (error) {
    console.error('YouTube API Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch YouTube videos' });
  }
});

export default router;
