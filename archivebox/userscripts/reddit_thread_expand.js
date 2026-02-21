#!/usr/bin/env node
/**
 * Reddit thread expander userscript.
 *
 * Clicks "load more comments" / "continue this thread" links and expands
 * collapsed comment chains so the full discussion is captured.
 *
 * Works on both new Reddit (reddit.com) and old Reddit (old.reddit.com).
 *
 * Install: copy to DATA_DIR/plugins/reddit_thread_expand/on_Snapshot__46_reddit_thread_expand.js
 *
 * Environment variables:
 *     REDDIT_THREAD_EXPAND_ENABLED: Enable/disable (default: true)
 *     REDDIT_THREAD_EXPAND_TIMEOUT: Max seconds to spend expanding (default: 30)
 *     REDDIT_THREAD_EXPAND_MAX_CLICKS: Max "load more" buttons to click (default: 30)
 */

'use strict';

if (process.env.NODE_MODULES_DIR) module.paths.unshift(process.env.NODE_MODULES_DIR);

const {
    getEnvBool,
    getEnvInt,
    readCdpUrl,
    readTargetId,
} = require('../chrome/chrome_utils.js');

const PLUGIN_NAME = 'reddit_thread_expand';
const CHROME_SESSION_DIR = '../chrome';

if (!getEnvBool('REDDIT_THREAD_EXPAND_ENABLED', true)) {
    console.error(`Skipping ${PLUGIN_NAME} (REDDIT_THREAD_EXPAND_ENABLED=False)`);
    process.exit(0);
}

const puppeteer = require('puppeteer-core');

const timeoutSec = getEnvInt('REDDIT_THREAD_EXPAND_TIMEOUT', 30);
const maxClicks = getEnvInt('REDDIT_THREAD_EXPAND_MAX_CLICKS', 30);

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
    if (!/\breddit\.com\b/.test(url)) {
        console.log(JSON.stringify({ plugin: PLUGIN_NAME, status: 'skipped', reason: 'not a Reddit page', url }));
        await browser.disconnect();
        process.exit(0);
    }

    const deadline = Date.now() + timeoutSec * 1000;
    let clicks = 0;

    while (clicks < maxClicks && Date.now() < deadline) {
        const clicked = await page.evaluate(() => {
            let found = 0;
            // New Reddit: "X more comments" / "Continue thread" buttons
            document.querySelectorAll('button, a').forEach(el => {
                const txt = (el.innerText || '').toLowerCase().trim();
                if (txt.match(/^\d+ more (comment|repl)|^load more|^continue this thread|^view more comment/)) {
                    el.click();
                    found++;
                }
            });
            // Old Reddit: collapsed comment expanders
            document.querySelectorAll('.morecomments a, .comment.collapsed .expand').forEach(el => {
                el.click();
                found++;
            });
            return found;
        });

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
