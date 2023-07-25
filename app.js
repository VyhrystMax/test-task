// const crawlUpcomingAuctions = require('./sothebys/crawlUpcomingAuctions');
const UpcomingAuctionsCrawler = require('./sothebys/upcomingAuctionsCrawler');

(async () => {
  try {
    // const auctions = await crawlUpcomingAuctions();
    const crawler = new UpcomingAuctionsCrawler('https://www.sothebys.com');

    const auctions = await crawler.crawl();
    console.log(auctions);
  } catch (e) {
    console.error(e);
  }
})();
