const { chromium } = require('playwright-core');  // Use playwright-core instead of full playwright
const express = require('express');
const app = express();

// Add error handling middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/run', async (req, res) => {
    let browser;
    try {
        // Configure browser launch for serverless environment
        browser = await chromium.launch({
            executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || 
                         '/home/sbx_user1051/.cache/ms-playwright/chromium-*/chrome-linux/chrome',
            args: [
                '--disable-gpu',
                '--disable-dev-shm-usage',
                '--disable-setuid-sandbox',
                '--no-sandbox',
                '--single-process'
            ],
            headless: true
        });

        const context = await browser.newContext({
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36',
            viewport: { width: 1280, height: 720 }
        });

        const page = await context.newPage();
        
        // Add timeout and navigation handling
        await page.goto('https://www.google.com/maps/search/restaurants+in+manchester+england+uk/', {
            waitUntil: 'domcontentloaded',
            timeout: 30000
        });

        // Wait for results to load
        await page.waitForSelector('[role="feed"]', { timeout: 15000 });
        
        // Get content more efficiently
        const html = await page.content();
        const title = await page.title();
        
        res.json({
            success: true,
            title: title,
            htmlLength: html.length,
            // html: html // Be careful with sending full HTML in production
        });
        
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    } finally {
        if (browser) {
            await browser.close().catch(e => console.error('Browser close error:', e));
        }
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

const PORT = process.env.PORT || 4545;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

process.on('unhandledRejection', (err) => {
    console.error('Unhandled rejection:', err);
});