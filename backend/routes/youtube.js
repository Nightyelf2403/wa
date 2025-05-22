import express from 'express';
import axios from 'axios';

const router = express.Router();
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

router.get('/', async (req, res) => {
  const city = req.query.city;

  if (!city) {
    return res.status(400).json({ error: 'City is required' });
  }

  if (!YOUTUBE_API_KEY) {
    return res.status(500).json({ error: 'YouTube API key not configured' });
  }

  try {
    const url = 'https://www.googleapis.com/youtube/v3/search';

    const params = {
      part: 'snippet',
      q: `${city} travel guide`,
      type: 'video',
      maxResults: 5,
      key: YOUTUBE_API_KEY,
    };

    const response = await axios.get(url, { params });

    if (!response.data.items || response.data.items.length === 0) {
      return res.status(404).json({ error: 'No videos found' });
    }

    const videos = response.data.items.map(item => ({
      title: item.snippet?.title || 'Untitled',
      videoId: item.id?.videoId || '',
      thumbnail: item.snippet?.thumbnails?.high?.url || '',
      channel: item.snippet?.channelTitle || '',
      publishedAt: item.snippet?.publishedAt || '',
    }));

    res.status(200).json({ city, videos });

  } catch (error) {
    const errorDetails = error?.response?.data || error.message;
    console.error('YouTube API Error:', errorDetails);

    res.status(500).json({
      error: 'Failed to fetch YouTube videos',
      details: errorDetails
    });
  }
});

export default router;
