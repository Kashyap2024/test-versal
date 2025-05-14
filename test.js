const { chromium } = require('playwright');
const express = require('express');

const app = express();

app.get('/run', async (req, res) => {
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();
    
    await page.goto('https://www.google.com/maps/search/restaurants+in+manchester+england+uk/');
    const html = await page.content();
    console.log(html);
    
    await browser.close();
    res.send('Check console for HTML output');
});

app.listen(4545, () => console.log('Server running on port 4545'));