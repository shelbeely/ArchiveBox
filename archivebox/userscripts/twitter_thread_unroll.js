#!/usr/bin/env node
/**
 * Twitter/X thread unroller userscript.
 *
 * Expands "Show more replies", "Show X more replies" buttons and lazy-loaded
 * tweet continuations so the full thread is visible before the snapshot is taken.
 *
 * Install: copy to DATA_DIR/plugins/twitter_thread_unroll/on_Snapshot__46_twitter_thread_unroll.js
 *
 * Environment variables:
 *     TWITTER_THREAD_UNROLL_ENABLED: Enable/disable (default: true)
 *     TWITTER_THREAD_UNROLL_TIMEOUT: Max seconds to spend expanding (default: 30)
 *     TWITTER_THREAD_UNROLL_MAX_CLICKS: Max "show more" buttons to click (default: 20)
 */

'use strict';

if (process.env.NODE_MODULES_DIR) module.paths.unshift(process.env.NODE_MODULES_DIR);

const {
    getEnvBool,
    getEnvInt,
    readCdpUrl,
    readTargetId,
} = require('../chrome/chrome_utils.js');

const PLUGIN_NAME = 'twitter_thread_unroll';
const CHROME_SESSION_DIR = '../chrome';

if (!getEnvBool('TWITTER_THREAD_UNROLL_ENABLED', true)) {
    console.error(`Skipping ${PLUGIN_NAME} (TWITTER_THREAD_UNROLL_ENABLED=False)`);
    process.exit(0);
}

const puppeteer = require('puppeteer-core');

const timeoutSec = getEnvInt('TWITTER_THREAD_UNROLL_TIMEOUT', 30);
const maxClicks = getEnvInt('TWITTER_THREAD_UNROLL_MAX_CLICKS', 20);

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
    const cdpUrl = readCdpUrl(CHROME_SESSION_DIR);
    if (!cdpUrl) {
        console.error(`[!] ${PLUGIN_NAME}: no Chrome session found (chrome plugin must run first)`);
        process.exit(1);
    }

    const targetId = readTargetId(CHROME_SESSION_DIR);
    const browser = await puppeteer.connect({ browserWSEndpoint: cdpUrl });
    const pages = await browser.pages();
    const page = targetId
        ? pages.find(p => p.target().targetId() === targetId) || pages[pages.length - 1]
        : pages[pages.length - 1];

    if (!page) {
        console.error(`[!] ${PLUGIN_NAME}: no open tab found`);
        await browser.disconnect();
        process.exit(1);
    }

    // Only act on Twitter/X pages
    const url = page.url();
    if (!/\b(twitter\.com|x\.com)\b/.test(url)) {
        console.log(JSON.stringify({ plugin: PLUGIN_NAME, status: 'skipped', reason: 'not a Twitter/X page', url }));
        await browser.disconnect();
        process.exit(0);
    }

    const deadline = Date.now() + timeoutSec * 1000;
    let clicks = 0;

    // Selectors for "show more replies" / thread continuation buttons
    const SHOW_MORE_SELECTORS = [
        '[data-testid="tweet"] a[href*="/status/"]',
        'div[role="button"]:has(span)',
        'a[href*="thread"]',
    ];

    while (clicks < maxClicks && Date.now() < deadline) {
        const clicked = await page.evaluate((selectors) => {
            let found = 0;
            for (const sel of selectors) {
                document.querySelectorAll(sel).forEach(el => {
                    const txt = (el.innerText || '').toLowerCase();
                    if (txt.includes('show more') || txt.includes('show replies') ||
                        txt.includes('more replies') || txt.includes('continue thread')) {
                        el.click();
                        found++;
                    }
                });
            }
            return found;
        }, SHOW_MORE_SELECTORS);

        if (clicked === 0) break;
        clicks += clicked;
        await sleep(1500);
    }

    console.log(JSON.stringify({ plugin: PLUGIN_NAME, status: 'success', clicks, url }));
    await browser.disconnect();
}

main().catch(err => {
    console.error(`[!] ${PLUGIN_NAME}: ${err.message}`);
    process.exit(1);
});
