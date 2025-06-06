const axios = require('axios');

const APIFY_API_TOKEN = 'apify_api_3xcodHizgYlLzjVSGqQ3cNtxEfZDfq454kbW';

async function runApifyInstagramScraper(username) {
  try {
    const response = await axios.post(
      `https://api.apify.com/v2/acts/apify~instagram-scraper/run-sync?token=${APIFY_API_TOKEN}`,
      {
        usernames: [username],    // Array of usernames to scrape
        resultsLimit: 10,         // Limit the number of results
        searchType: 'user',       // Type of search
      },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );

    const scrapedItems = response.data?.output?.data || [];
    console.log("Apify scraped data:", scrapedItems);

    return scrapedItems;
  } catch (err) {
    console.error("Apify scraper error:", err.response?.data || err.message);
    return [];
  }
}

// Express route handler that just uses Apify
const instagramApifyOnly = async (req, res) => {
  const username = req.query.username || 'deepanshi_02020'; // Or get username dynamically
  const data = await runApifyInstagramScraper(username);

  if (data.length > 0) {
    return res.json({ user_id: username, media: data });
  } else {
    return res.status(500).send('Apify scraper failed to fetch data');
  }
};

module.exports = {
  instagramApifyOnly,
};
