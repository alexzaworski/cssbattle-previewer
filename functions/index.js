const functions = require("firebase-functions");

const chromium = require("chrome-aws-lambda");
const puppeteer = chromium.puppeteer;

// admin seems to be necessary in order
// to run the function via `firebase emulators`
const admin = require("firebase-admin");
admin.initializeApp();

exports.preview = functions
  .runWith({ memory: "512MB", timeoutSeconds: 10 })
  .https.onRequest(async (req, res) => {
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: { width: 400, height: 300 },
      executablePath: await chromium.executablePath,
      headless: true
    });

    const {
      query: { q = "" }
    } = req;

    const page = await browser.newPage();

    await page.setContent(q);
    const screenshot = await page.screenshot();
    await browser.close();

    res.header({ "Content-Type": "image/png" });
    res.end(screenshot, "binary");
  });
