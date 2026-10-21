// Records the real VeilLLM Gradio playground masking a sample message.
// Needs `python playground.py` from github.com/h-f-fares/VeilLLM on :7860 and `npm i playwright-core`.
// Cut with ffmpeg: typing at 4x, then jump past the ~6s analyzer rebuild to the result (see examples/README.md).
import { chromium } from "playwright-core";
const TEXT = "Hi, I'm Sarah Mitchell from Acme Corp. Email me at sarah.m@acme.com or call +1 415 555 0142. Deploy key: sk-proj-8fK2Lw9xQ7mR3tZpV4nB.";
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const open = async (ctx) => {
  const p = await ctx.newPage();
  await p.goto("http://127.0.0.1:7860/?__theme=dark");
  await p.evaluate(() => { document.body.style.zoom = "2"; });
  await p.getByRole("tab", { name: /PII Detection/ }).click();
  await p.waitForTimeout(800);
  return p;
};
// Warm-up (not recorded): the first mask loads the spaCy model.
{ const ctx = await b.newContext({ viewport: { width: 1200, height: 2000 } }); const p = await open(ctx);
  await p.getByRole("button", { name: "Mask", exact: true }).click(); await p.waitForTimeout(6000);
  await p.getByRole("button", { name: "Mask", exact: true }).click(); await p.waitForTimeout(3000); await ctx.close(); }
const ctx = await b.newContext({ viewport: { width: 1200, height: 2000 }, recordVideo: { dir: "vid", size: { width: 1200, height: 2000 } } });
const T0 = Date.now(); console.log("REC_START", T0);
const p = await open(ctx);
await p.evaluate(() => { document.querySelector("h1, h2, .prose")?.scrollIntoView(); });
const input = p.getByLabel("Input Text");
await input.fill("");
await p.waitForTimeout(500);
await input.pressSequentially(TEXT, { delay: 22 });
await p.waitForTimeout(700);
const t0 = Date.now();
await p.getByRole("button", { name: "Mask", exact: true }).click();
await p.getByText("entity(s)").waitFor({ timeout: 60000 });
console.log("MASK_CLICK_MS", t0, "DONE_MS", Date.now());
await p.waitForTimeout(2500);
await p.mouse.wheel(0, 700);
await p.waitForTimeout(3500);
await ctx.close();
await p.video().path().then((v) => console.log(v));
await b.close();
