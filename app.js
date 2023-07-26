const axios = require("axios");
const cheerio = require("cheerio");
const crawlUpcomingAuctions = require("./sothebys/crawlUpcomingAuctions");

async function removeAuctionsContainingPreview(auctions) {
  const filteredAuctions = [];

  for (const auction of auctions) {
    try {
      const response = await axios.get(auction.origin_url);
      const content = response.data;

      // Detect "Preview" button or value in HTML content
      const $ = cheerio.load(content);
      const hasPreview =
        $('button:contains("Preview")').length > 0 ||
        content.includes("Preview");

      if (!hasPreview) {
        filteredAuctions.push(auction);
      }
    } catch (error) {
      // Handle errors while fetching or parsing HTML content
      console.error(
        `Error processing auction origin_url: ${auction.origin_url}`
      );
    }
  }

  return filteredAuctions;
}

(async () => {
  try {
    const auctions = await crawlUpcomingAuctions();

    const filteredAuction = await removeAuctionsContainingPreview(auctions);

    console.log(filteredAuction);
  } catch (e) {
    console.error(e);
  }
})();
