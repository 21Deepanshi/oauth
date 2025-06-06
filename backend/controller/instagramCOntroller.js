const axios = require('axios');

const {
  META_APP_ID,
  META_APP_SECRET,
  META_REDIRECT_URI
} = process.env;

// Get authorization URL and redirect user to Instagram
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
    // Exchange code for short-lived access token
    const response = await axios.post(
      'https://api.instagram.com/oauth/access_token',
      payload,
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      }
    );

    const accessToken = response.data.access_token;
    const userId = response.data.user_id;

    console.log("Instagram Short-lived Access Token:", accessToken);
    console.log("Instagram User ID:", userId);

    // Exchange for long-lived access token
    let longLivedToken;
    try {
      const longTokenRes = await axios.get('https://graph.instagram.com/access_token', {
        params: {
          client_secret: META_APP_SECRET,
          access_token: accessToken,
        },
      });
      console.log('Long-lived token response:', longTokenRes.data);
      longLivedToken = longTokenRes.data.access_token;
    } catch (error) {
      console.error('Long-lived token exchange error:', error.response?.data || error.message);
      // fallback to short-lived token if exchange fails
      longLivedToken = accessToken;
    }

    // Fetch user's media with long-lived token (or short-lived if exchange failed)
    const mediaResponse = await axios.get(
      `https://graph.instagram.com/me/media`,
      {
        params: {
          fields: 'id,caption,media_type,media_url,thumbnail_url,timestamp',
          access_token: longLivedToken,
        }
      }
    );

    const mediaItems = mediaResponse.data.data;
    console.log('Fetched mediaItems:', JSON.stringify(mediaItems, null, 2));

    // Process each media item
    for (const media of mediaItems) {
      if (media.media_type !== 'VIDEO' || !media.media_url) continue;

      try {
        const fileName = `${media.id}.mp4`;
        const filePath = await downloadVideo(media.media_url, fileName);
        const transcript = await transcribeWithWhisper(filePath);

        await supabase.from('reel_transcripts').insert([{
          user_id: userId,
          reel_url: media.media_url,
          caption: media.caption || '',
          transcript,
          created_at: new Date().toISOString(),
        }]);
      } catch (err) {
        console.error(`Failed processing media ${media.id}:`, err);
      }
    }
    
    res.redirect(`https://oauth-1-l0jt.onrender.com/success?user_id=${userId}`);
  } catch (err) {
    console.error("Failed to fetch Instagram access token or process reels:", err.response?.data || err.message);
    res.status(500).send('Failed to process reels');
  }
};

module.exports = {
  connectInstagram,
  instagramCallback,
};
