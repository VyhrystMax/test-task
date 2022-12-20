const Utils = require('../utils/fetch');

const HEADERS = {
  host: 'www.sothebys.com',
  'user-agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:91.0) Gecko/20100101 Firefox/91.0',
  accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'accept-language': 'en-US,en;q=0.5',
  // 'accept-encoding': 'gzip, deflate, br',
  'accept-encoding': 'identity',
  connection: 'keep-alive',
  'upgrade-insecure-requests': '1',
  'sec-fetch-dest': 'document',
  'sec-fetch-mode': 'navigate',
  'sec-fetch-site': 'none',
  'sec-fetch-user': '?1',
};

const modifyHost = url => {
  HEADERS.host = /\/\/(.*?)\//i.exec(url)[1];
};

const fetch = async (params, iteration = 0) => {
  modifyHost(params.url);
  let headers = params.headers;
  headers = { ...headers, ...HEADERS };
  const res = await Utils.fetch({
    headers,
    ...params,
  });

  if (
    (res.statusCode === 403 || res.statusCode === 400 || res.statusCode === 404) &&
    iteration < 15
  ) {
    return fetch(params, iteration + 1);
  }
  if (res.statusCode !== 200) {
    throw new Error(`HTTP CODE ${res.statusCode} - Invalid result`);
  }

  return res.toJSON();
};

module.exports = { fetch };
