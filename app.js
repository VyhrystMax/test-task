const crawlUpcomingAuctions = require('./sothebys/crawlUpcomingAuctions');

(async () => {
  try {
    const auctions = await crawlUpcomingAuctions();
    console.log(auctions);
  } catch (e) {
    console.error(e);
  }
})();