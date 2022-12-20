const _ = require('lodash');
const cheerio = require('cheerio');

const { fetch } = require('./fetch');
const crawlAuctions = require('./crawlAuctions');

const UPCOMING_URL = 'https://www.sothebys.com/en/calendar?s=0&from=&to=&q=';

const getUpcomingUrlByPage = page =>
  `https://www.sothebys.com/en/calendar?s=0&from=&to=&q=&p=${page}&_requestType=ajax`;

const crawlUpcomingAuctions = async () => {
  const res = await fetch({
    url: UPCOMING_URL,
  });

  const $ = cheerio.load(res.body);

  const pageCount = _.toNumber(
    $(
      '#searchModule > div > div.SearchModule-searchMain > ul.SearchModule-pagination > li.SearchModule-pageCounts > span[data-page-count]',
    ).text(),
  );

  const auctions = await Promise.all(
    _.range(1, pageCount + 1)
      .map(getUpcomingUrlByPage)
      .map(crawlAuctions),
  );

  return _(auctions)
    .flatten()
    .map(auction => ({
      ...auction,
      upcoming: true,
    }))
    .value();
};

module.exports = crawlUpcomingAuctions;
