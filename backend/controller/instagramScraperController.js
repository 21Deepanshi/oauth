const axios = require('axios');

const {
  META_APP_ID,
  META_APP_SECRET,
  META_REDIRECT_URI
} = process.env;

const APIFY_API_TOKEN = 'apify_api_3xcodHizgYlLzjVSGqQ3cNtxEfZDfq454kbW';

// 🔁 Fallback: Use Apify Scraper
async function runApifyInstagramScraper(username) {
  try {
    const response = await axios.post(
      `https://api.apify.com/v2/actor-tasks/apify/instagram-scraper/run-sync-get-dataset?token=${APIFY_API_TOKEN}`,
      { username },
      { headers: { 'Content-Type': 'application/json' } }
    );

    const scrapedItems = response.data.items || [];
    console.log("Apify scraped data:", scrapedItems);

    return scrapedItems;
  } catch (err) {
    console.error("Apify scraper error:", err.response?.data || err.message);
    return [];
  }
}

// 🎯 Main Callback
const instagramCallback = async (req, res) => {
  const code = req.query.code;

  if (!code) {
    res.status(400).send('Authorization code not found.');
    return;
  }

  const payload = new URLSearchParams();
  payload.append('client_id', META_APP_ID || '');
  payload.append('client_secret', META_APP_SECRET || '');
  payload.append('grant_type', 'authorization_code');
  payload.append('redirect_uri', META_REDIRECT_URI || '');
  payload.append('code', code);

  try {
    // Step 1: Get short-lived access token
    const response = await axios.post(
      'https://api.instagram.com/oauth/access_token',
      payload,
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      }
    );

    const accessToken = response.data.access_token;
    const userId = response.data.user_id;

    // Step 2: Exchange for long-lived token
    let longLivedToken;
    try {
      const longTokenRes = await axios.get('https://graph.instagram.com/access_token', {
        params: {
          grant_type: 'ig_exchange_token',
          client_secret: META_APP_SECRET,
          access_token: accessToken,
        },
      });
      longLivedToken = longTokenRes.data.access_token;
    } catch (error) {
      console.error('Long-lived token error:', error.response?.data || error.message);
      longLivedToken = accessToken;
    }

    // Step 3: Fetch media
    const mediaResponse = await axios.get(`https://graph.instagram.com/me/media`, {
      params: {
        fields: 'id,caption,media_type,media_url,timestamp',
        access_token: longLivedToken,
      }
    });

    const mediaItems = mediaResponse.data.data;
    console.log('Fetched mediaItems:', mediaItems);
    return res.json({ user_id: userId, media: mediaItems });
  } catch (err) {
    console.error("Instagram API failed, falling back to Apify:", err.response?.data || err.message);

    // Step 4: Fallback with Apify
    const fallbackItems = await runApifyInstagramScraper('natgeo');

    if (fallbackItems.length > 0) {
      return res.json({ user_id: 'apify_fallback', media: fallbackItems });
    } else {
      return res.status(500).send('Failed via Instagram API and Apify fallback');
    }
  }
};

// 🔗 Connect Route
const connectInstagram = (req, res) => {
  const instagramLoginUrl =
    `https://www.instagram.com/oauth/authorize?` +
    `enable_fb_login=0&` +
    `force_authentication=1&` +
    `client_id=${META_APP_ID}&` +
    `redirect_uri=${META_REDIRECT_URI}&` +
    `response_type=code&` +
    `scope=instagram_business_basic%2Cinstagram_business_manage_messages%2Cinstagram_business_manage_comments%2Cinstagram_business_content_publish%2Cinstagram_business_manage_insights`;

  res.redirect(instagramLoginUrl);
};

module.exports = {
  connectInstagram,
  instagramCallback,
};
