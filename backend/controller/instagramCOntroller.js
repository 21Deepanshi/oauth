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

    console.log("Instagram Access Token:", accessToken);
    console.log("Instagram User ID:", userId);

    // Exchange for long-lived access token
    const longTokenRes = await axios.get('https://graph.instagram.com/access_token', {
      params: {
        grant_type: 'ig_exchange_token',
        client_secret: META_APP_SECRET,
        access_token: accessToken,
      },
    });

    const longLivedToken = longTokenRes.data.access_token;
    console.log("Long-lived token:", longLivedToken);

    // Fetch user's media
    const mediaResponse = await axios.get(
      `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,thumbnail_url,timestamp&access_token=${accessToken}`
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
    
    res.redirect(`https://oauth-1-l0jt.onrender.com?user_id=${userId}`);
  } catch (err) {
    console.error("Failed to fetch Instagram access token or process reels:", err.response?.data || err.message);
    res.status(500).send('Failed to process reels');
  }
};

module.exports = {
  connectInstagram,
  instagramCallback,
};
