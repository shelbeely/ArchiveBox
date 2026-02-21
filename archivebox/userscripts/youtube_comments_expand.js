#!/usr/bin/env node
/**
 * YouTube comments expander userscript.
 *
 * Scrolls the page to trigger lazy-loading of comments and clicks
 * "Show more replies" links so the full comment section is captured.
 *
 * Install: copy to DATA_DIR/plugins/youtube_comments_expand/on_Snapshot__46_youtube_comments_expand.js
 *
 * Environment variables:
 *     YOUTUBE_COMMENTS_EXPAND_ENABLED: Enable/disable (default: true)
 *     YOUTUBE_COMMENTS_EXPAND_TIMEOUT: Max seconds to spend expanding (default: 45)
 *     YOUTUBE_COMMENTS_EXPAND_SCROLL_STEPS: Number of scroll steps to load comments (default: 5)
 */

'use strict';

if (process.env.NODE_MODULES_DIR) module.paths.unshift(process.env.NODE_MODULES_DIR);

const {
    getEnvBool,
    getEnvInt,
    readCdpUrl,
    readTargetId,
} = require('../chrome/chrome_utils.js');

const PLUGIN_NAME = 'youtube_comments_expand';
const CHROME_SESSION_DIR = '../chrome';

if (!getEnvBool('YOUTUBE_COMMENTS_EXPAND_ENABLED', true)) {
    console.error(`Skipping ${PLUGIN_NAME} (YOUTUBE_COMMENTS_EXPAND_ENABLED=False)`);
    process.exit(0);
}

const puppeteer = require('puppeteer-core');

const timeoutSec = getEnvInt('YOUTUBE_COMMENTS_EXPAND_TIMEOUT', 45);
const scrollSteps = getEnvInt('YOUTUBE_COMMENTS_EXPAND_SCROLL_STEPS', 5);

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

    const url = page.url();
    if (!/\byoutube\.com\/watch\b/.test(url)) {
        console.log(JSON.stringify({ plugin: PLUGIN_NAME, status: 'skipped', reason: 'not a YouTube watch page', url }));
        await browser.disconnect();
        process.exit(0);
    }

    const deadline = Date.now() + timeoutSec * 1000;
    let scrollsDone = 0;
    let repliesExpanded = 0;

    // Scroll down in steps to trigger comment lazy-loading
    for (let i = 0; i < scrollSteps && Date.now() < deadline; i++) {
        await page.evaluate(() => window.scrollBy(0, window.innerHeight * 2));
        await sleep(2000);
        scrollsDone++;
    }

    // Click "Show replies" buttons to expand reply chains
    while (Date.now() < deadline) {
        const clicked = await page.evaluate(() => {
            let found = 0;
            document.querySelectorAll('ytd-comment-replies-renderer #more-replies, #replies #expander-contents button').forEach(el => {
                const txt = (el.innerText || '').toLowerCase();
                if (txt.includes('show') || txt.includes('repl') || txt.includes('more')) {
                    el.click();
                    found++;
                }
            });
            return found;
        });
        if (clicked === 0) break;
        repliesExpanded += clicked;
        await sleep(1500);
    }

    console.log(JSON.stringify({ plugin: PLUGIN_NAME, status: 'success', scrollsDone, repliesExpanded, url }));
    await browser.disconnect();
}

main().catch(err => {
    console.error(`[!] ${PLUGIN_NAME}: ${err.message}`);
    process.exit(1);
});
