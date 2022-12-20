const request = require('request');
const randomUa = require('random-useragent');

const AXIOS_TIMEOUT = 900000;
let reqCount = 0;

const extendOptions = opt => {
  const options = opt || {};

  options.noTor = options.proxy ? true : options.noTor;

  options.headers = Object.assign(
    {
      'User-Agent': randomUa.getRandom(),
      Connection: 'keep-alive',
    },
    options.headers,
  );

  options.rejectUnauthorized = false;
  options.requestCert = false;
  options.strictSSL = false;
  options.followAllRedirects = true;
  options.timeout = AXIOS_TIMEOUT;

  return options;
};

const fetch = options => {
  return new Promise((resolve, reject) => {
    ++reqCount;
    console.log("REQ_COUNT[fetch]", reqCount, options.url);

    request(extendOptions(options), (err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res);
      }
    });
  });
}

module.exports = { fetch };
