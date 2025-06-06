async function runApifyInstagramScraper(username) {
  try {
    const response = await axios.post(
      `https://api.apify.com/v2/acts/apify~instagram-scraper/run-sync?token=${APIFY_API_TOKEN}`,
      {
        usernames: [username],
        resultsLimit: 10,
        searchType: 'user',
        useLegacyScraper: true, // ✅ Makes scraping more reliable
      },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );

    console.log("Full Apify response:", JSON.stringify(response.data, null, 2));

    const scrapedItems = response.data?.output?.data || [];
    console.log("Apify scraped data:", scrapedItems);

    return scrapedItems; // ✅ MUST be returned or else `data` will be undefined
  } catch (err) {
    console.error("Apify scraper error:", err.response?.data || err.message);
    return [];
  }
}
