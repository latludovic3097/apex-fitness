// CI test runner — lance tests.html dans un Chromium headless et fail si tests rouges.
// Utilisé par .github/workflows/tests.yml
import { chromium } from "playwright";
import { createServer } from "http";
import { readFileSync, existsSync, statSync } from "fs";
import { extname, join, resolve } from "path";

const PORT = 8765;
const ROOT = resolve(".");
const MIMES = {
  ".html": "text/html; charset=utf-8",
  ".js":   "application/javascript; charset=utf-8",
  ".css":  "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg":  "image/svg+xml; charset=utf-8",
  ".png":  "image/png",
  ".jpg":  "image/jpeg"
};

// Static server pour servir le repo
const server = createServer((req, res) => {
  const url = new URL(req.url, "http://localhost");
  let p = decodeURIComponent(url.pathname);
  if (p === "/") p = "/tests.html";
  const file = join(ROOT, p);
  if (!existsSync(file) || !statSync(file).isFile()) {
    res.writeHead(404); res.end("404"); return;
  }
  const ext = extname(file).toLowerCase();
  res.writeHead(200, {
    "Content-Type": MIMES[ext] || "application/octet-stream",
    "Cache-Control": "no-store"
  });
  res.end(readFileSync(file));
});

server.listen(PORT, async () => {
  console.log(`[ci] static server on http://localhost:${PORT}`);
  let exitCode = 1;
  try {
    const browser = await chromium.launch();
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    // Capture les erreurs console côté browser
    page.on("pageerror", err => console.error(`[browser] ${err.message}`));
    page.on("console", msg => {
      if (msg.type() === "error") console.error(`[browser console] ${msg.text()}`);
    });
    await page.goto(`http://localhost:${PORT}/tests.html`, { waitUntil: "networkidle" });
    // Attend que le summary apparaisse (texte non vide)
    await page.waitForFunction(() => {
      const el = document.getElementById("summary");
      return el && el.textContent.trim().length > 0;
    }, { timeout: 10000 });
    const summary = await page.$eval("#summary", el => el.textContent.trim());
    const classList = await page.$eval("#summary", el => el.className);
    const failures = await page.$$eval(".test.fail", els => els.map(el => el.textContent.trim()));
    console.log(`\n[ci] Summary: ${summary}`);
    if (failures.length) {
      console.error(`\n[ci] ${failures.length} test(s) failed:`);
      failures.forEach(f => console.error(`  - ${f}`));
      exitCode = 1;
    } else if (classList.includes("ok")) {
      console.log(`[ci] All tests passed ✓`);
      exitCode = 0;
    } else {
      console.error(`[ci] Tests didn't complete properly (summary: "${summary}")`);
      exitCode = 1;
    }
    await browser.close();
  } catch (e) {
    console.error(`[ci] error:`, e);
    exitCode = 1;
  } finally {
    server.close();
    process.exit(exitCode);
  }
});
