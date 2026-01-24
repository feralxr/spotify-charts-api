require('dotenv').config();
const express = require('express');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const path = require('path');

puppeteer.use(StealthPlugin());
const app = express();
const PORT = 3000;

const USER_DATA_DIR = path.join(__dirname, 'spotify_session');

//Endpoint Mapping
const CHART_ENDPOINTS = {
    'global_daily': 'https://charts.spotify.com/charts/view/regional-global-daily/latest',
    'global_weekly': 'https://charts.spotify.com/charts/view/regional-global-weekly/latest',
    'usa_weekly': 'https://charts.spotify.com/charts/view/regional-us-weekly/latest',
    'usa_daily': 'https://charts.spotify.com/charts/view/regional-us-daily/latest'
};

let browser;

async function initBrowser() {
    if (!browser || !browser.isConnected()) {
        console.log('🚀 Launching shared browser...');
        browser = await puppeteer.launch({
            headless: true,
            userDataDir: USER_DATA_DIR,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,800']
        });
        const blank = await browser.newPage();
        await blank.goto('about:blank');
    }
    return browser;
}

async function fetchSpecificChart(targetUrl, chartName) {
    const browserInstance = await initBrowser();
    const page = await browserInstance.newPage();
    let chartData = null;

    try {
        // Interceptor
        const interceptor = async (response) => {
            const url = response.url();
            if (url.includes('/auth/v0/charts/') && url.includes('/latest')) {
                if (response.status() === 200 && response.request().method() !== 'OPTIONS') {
                    try {
                        const buffer = await response.buffer();
                        chartData = JSON.parse(buffer.toString());
                        // LOG 1: Interception Success
                        console.log(`   🎯 [Internal] Intercepted JSON for ${chartName}`);
                    } catch (e) { }
                }
            }
        };

        page.on('response', interceptor);

        // console.log(`   >> Opening tab for ${chartName}...`);
        await page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 60000 });

        let attempts = 0;
        while (!chartData && attempts < 15) {
            await new Promise(r => setTimeout(r, 1000));
            attempts++;
        }

        return chartData;

    } catch (error) {
        console.error(`   ❌ Error on ${chartName}:`, error.message);
        return null;
    } finally {
        await page.close();
    }
}

app.get('/:chart_id', async (req, res) => {
    const chartId = req.params.chart_id;
    const targetUrl = CHART_ENDPOINTS[chartId];

    // Timestamp for the log
    const time = new Date().toLocaleTimeString();

    if (!targetUrl) {
        console.log(`[${time}] ⚠️  404 Request for unknown chart: ${chartId}`);
        return res.status(404).json({ error: "Invalid Endpoint" });
    }

    console.log(`[${time}] 📥 Received request: /${chartId}`);

    const data = await fetchSpecificChart(targetUrl, chartId);

    if (data) {
        // LOG 2: Request Fulfillment Success
        console.log(`[${time}] ✅ FULFILLED: Sent ${chartId} data to client.`);
        res.json(data);
    } else {
        console.log(`[${time}] ❌ FAILED: Could not fetch ${chartId}.`);
        res.status(500).json({ error: "Failed to fetch data." });
    }
});

app.listen(PORT, async () => {
    console.log(`\n🟢 Server Ready on Port ${PORT}`);
    console.log(`   Waiting for Python requests...\n`);
    await initBrowser();
});