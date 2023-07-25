const puppeteer = require('puppeteer');
const moment = require('moment');
const _ = require('lodash');

class UpcomingAuctionsCrawler {
    #host;
    #browser;
    #page;

    constructor(host) {
        this.#host = host;
    }

    async crawl() {
        try {      
            await this.#initBrowser();
            await this.#initPage();

            await this.#gotoPage('/en/calendar');

            const pageCount = await this.#getPageCount();
        
            await this.#closePage();

            const results = [];
        
            for (let i = 1; i <= pageCount + 1; i++) {
                await this.#initPage();

                await this.#gotoPage(`/en/calendar?p=${i}&_requestType=ajax`);
        
                const result = await this.#scrapePage();

                await this.#closePage();
        
                results.push(...result);
            }
        
            return this.#formatAuctions(results);
          } catch (error) {
            console.error('Scraping failed', error);
          } finally {  
            await this.#closeBrowser();

            console.log('Browser close');
          }
    }

    async #initBrowser(options = { headless: false }) {
        try {
            this.#browser = await puppeteer.launch(options);
        } catch (error) {
            console.error('Browser initialization error', error);

            throw error;
        }
    }

    async #closeBrowser() {
        try {
            await this.#browser.close();

            this.#browser = null;
        } catch (error) {
            console.error('Browser shutdown error', error);

            throw error;
        }
    }

    async #initPage() {
        try {
            this.#page = await this.#browser.newPage();
        } catch (error) {
            console.error('Page initialization error', error);

            throw error;
        }
    }

    async #closePage() {
        try {
            await this.#page.close();

            this.#page = null;
        } catch (error) {
            console.error('Page shutdown error', error);

            throw error;
        }
    }

    async #gotoPage(path, options = { timeout: 'networkidle0' }) {
        try {
            await this.#page.goto(`${this.#host}/${path}`, options);
        } catch (error) {
            console.error('Page download error', error);

            throw error;
        }
    }

    async #getPageCount() {
        try {
            return await this.#page.evaluate(() => {
                return +document.querySelector(
                  'ul.SearchModule-pagination > li.SearchModule-pageCounts > span[data-page-count]'
                ).textContent;
              });
        } catch (error) {
            console.error('Page count error', error);

            throw error;
        }
    }

    async #scrapePage() {
        try {
            return await this.#page.evaluate(() => {
                const auctionsNumber = Array.from(document.querySelectorAll('li.SearchModule-results-item')).length;
        
                const results = [];
        
                const getSelector = i => `ul.SearchModule-results > li:nth-child(${i})`;
        
                for (let i = 1; i <= auctionsNumber; i++) {
                    const selector = getSelector(i);
                    
                    const name = document.querySelector(`${selector} .Card-title`).textContent.trim();
                    const buttonName = document.querySelector(`${selector} .AuctionActionLink-link`).textContent.trim();
                    const originUrl = document.querySelector(`${selector} .Card-info-container`).getAttribute('href');
                    const rawDateAndLocation = document.querySelector(`${selector} .Card-details`).textContent.trim();
        
                    results.push({ name, buttonName, originUrl, rawDateAndLocation });
                }
        
                return results
            });
        } catch (error) {
            console.error('Page scrape error', error);

            throw error;
        }
    }

    #formatAuctions(auctions) {
        try {
            const results = [];
    
            const validAuctions = auctions
                .filter(({ buttonName }) => buttonName.toLowerCase() !== 'preview')
                .filter(({ originUrl }) => !!originUrl) // TODO: we're not sure about this one the task is vague in this case
                .map(({ buttonName, ...rest }) => rest);
        
            for (const auction of validAuctions) {
                const { name, originUrl, rawDateAndLocation } = auction;
                const { date, location } = this.#parseDateAndLocation(rawDateAndLocation);
        
                results.push({
                    name,
                    originUrl,
                    date,
                    location,
                    upcoming: true,
                });
            }
        
            return results;
        } catch (error) {
            console.error('Auction formatting error', error);

            throw error;
        }
    }
    
    #parseDateAndLocation(rawDateAndLocation) {
        try {
            const hasTime = rawDateAndLocation.match(/\d\d*:\d\d/); // 09:00 or 5:30
            const dataTuple = rawDateAndLocation
                .replace(/…/g, '')
                .split('|')
                .map((s) => s.trim());
        
            let rawDate = null;
            let location = null;
        
            if (hasTime) {
                [rawDate, , location] = dataTuple;
            } else {
                [rawDate, location = null] = dataTuple;
            }
        
            const date = moment.utc(_.last(rawDate.split('–')), 'DD MMM YYYY').format('YYYY-MM-DD');
        
            return { date, location };
        } catch (error) {
            console.error('Date and Location parsing error', error);

            throw error;
        }
    }
}

module.exports = UpcomingAuctionsCrawler;
