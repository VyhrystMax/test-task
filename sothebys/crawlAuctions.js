const cheerio = require('cheerio');
const moment = require('moment');
const _ = require('lodash');

const { fetch } = require('./fetch');

const getDate = $ => {
  const dateStr = _.first(
    $('.Card-details')
      .text()
      .split(' | '),
  );      

  return moment.utc(_.last(dateStr.split('–')), 'DD MMM YYYY').format('YYYY-MM-DD');
};

const getLocation = $ =>                                              
  _.last(
    $('.Card-details')         
      .text()
      .split(' | '),
  ).trim();

const getOriginUrl = ($, date) => {
  const overviewUrl = $('.Card-info-aside a')
    .attr('href')
    .trim();

  if (overviewUrl.includes('/digital-catalogues/')) {
    return null;
    // const year = moment.utc(date).year();
    // return overviewUrl.replace('digital-catalogues', `buy/auction/${year}`);
  }

  return overviewUrl;
};

const crawlAuction = $ => {
  const name = $('.Card-title')
    .text()
    .trim();
  const date = getDate($);
  const originUrl = getOriginUrl($, date);
  const location = getLocation($);

  return {
    name,
    date,
    origin_url: originUrl,
    location,
  };
};

const crawlAuctions = async url => {
  console.log("[sothebys][crawlAuctions]", url);

  const res = await fetch({
    url,
  });

  const $ = cheerio.load(res.body);

  let ress = $('.SearchModule-results-item').toArray();
  // console.log("[sothebys][crawlAuctions] SearchModule ress", ress.length);
  // const chrHtml = cheerio.html || cheerio.default.html;
  ress = ress
    .map(n => cheerio.load(n))
    .map(crawlAuction)
    .filter(auction => auction.origin_url);

  return ress;
};

module.exports = crawlAuctions;
