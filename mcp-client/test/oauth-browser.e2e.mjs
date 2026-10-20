// Run against `wippy run` in this test directory. The host adapter only replaces
// the outer application shell; the built connection editor, popup, OAuth server
// and shared KickSide callback are real. No third-party accounts are needed.
import { createServer } from 'node:http'
import { readFile, mkdir } from 'node:fs/promises'
import { basename, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
const require = createRequire(new URL('../ui/package.json', import.meta.url))
const { chromium } = require('@playwright/test')
const directory = dirname(fileURLToPath(import.meta.url))
const evidence = process.env.EVIDENCE_DIR || '/tmp/kickside-oauth-browser'
const proxy = `
export const config = {}, hostCss = {}, host = {getThemeMode: () => 'light'};
export const addIcons = () => {}, applyThemeMode = () => {}, on = () => () => {}, loadCss = async () => '';
export const define = (_url, element) => customElements.define('kickside-mcp-connect', element);
export const api = { post: async (url, body) => {
  const response = await fetch(url, {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(body)});
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Request failed');
  return {data};
}};
`
const html = `<!doctype html><html><head><title>KickSide OAuth demo</title>
<script type="importmap">{"imports":{"vue":"/vue.js","@wippy-fe/proxy":"/proxy.js"}}</script>
<style>
:root{--p-content-background:#fff;--p-text-color:#111827;--p-text-muted-color:#475569;--p-content-border-color:#cbd5e1;--p-primary-color:#4f46e5;--p-primary-contrast-color:#fff;--p-danger-color:#dc2626;--p-success-color:#15803d}
body{font:16px system-ui;max-width:760px;margin:30px auto;color:var(--p-text-color);background:var(--p-content-background)}output{display:block;margin-top:20px;font-weight:bold}
@media(prefers-color-scheme:dark){:root{--p-content-background:#111827;--p-text-color:#f1f5f9;--p-text-muted-color:#cbd5e1;--p-content-border-color:#475569;--p-primary-color:#a5b4fc;--p-primary-contrast-color:#111827;--p-danger-color:#f87171;--p-success-color:#4ade80}}
</style></head>
<body><h1>Connect Remote MCP</h1><kickside-mcp-connect></kickside-mcp-connect><output id="result"></output>
<script type="module">import '/connect.js'; document.querySelector('kickside-mcp-connect').addEventListener('connection-saved', event => {
document.querySelector('#result').textContent = event.detail.success ? 'Connected' : event.detail.error;
});</script></body></html>`
const server = createServer(async (req, res) => {
  try {
    if (req.url === '/favicon.ico') { res.writeHead(204); res.end(); return }
    if (req.url === '/api/v1/oauth/providers/mcp_remote/init') {
      let body = ''; for await (const chunk of req) body += chunk
      const upstream = await fetch('http://127.0.0.1:19129/test-oauth/mcp_remote/init', {method: 'POST', headers: {'Content-Type': 'application/json'}, body})
      res.writeHead(upstream.status, {'Content-Type': 'application/json'}); res.end(await upstream.text()); return
    }
    if (req.url === '/') { res.writeHead(200, {'Content-Type': 'text/html'}); res.end(html); return }
    let content
    if (req.url === '/proxy.js') content = proxy
    else if (req.url === '/vue.js') content = await readFile(resolve(directory, '../ui/node_modules/vue/dist/vue.esm-browser.prod.js'))
    else if (/^\/[\w.-]+\.js$/.test(req.url || '')) content = await readFile(resolve(directory, '../static', basename(req.url)))
    else { res.writeHead(404); res.end(); return }
    res.writeHead(200, {'Content-Type': 'application/javascript'}); res.end(content)
  } catch (error) { res.writeHead(500); res.end(String(error)) }
})
await new Promise(resolve => server.listen(19132, '127.0.0.1', resolve))
let browser
try {
  browser = await chromium.launch({headless: true, args: ['--no-sandbox']})
  const context = await browser.newContext({viewport: {width: 1000, height: 1000}})
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('http://127.0.0.1:19132')
  await mkdir(evidence, {recursive: true})
  try { await page.locator('input[type=url]').waitFor() }
  catch (error) { throw new Error(`Connection editor did not mount: ${errors.join('; ') || error.message}`) }
  for (const scheme of ['light', 'dark']) {
    await page.emulateMedia({colorScheme: scheme})
    await page.screenshot({path: resolve(evidence, `oauth-form-${scheme}.png`), fullPage: true})
    const contrast = await page.evaluate(() => {
      const root = document.querySelector('kickside-mcp-connect').shadowRoot
      const rgb = value => value.match(/[\d.]+/g).slice(0, 3).map(v => Number(v) * (value.startsWith('color(srgb ') ? 255 : 1))
      const luminance = color => rgb(color).map(v => v / 255).map(v => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4).reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0)
      return [...root.querySelectorAll('small,.section-title,.footnote,.primary')].filter(el => el.getClientRects().length).map(el => {
        const style = getComputedStyle(el)
        let ancestor = el, background
        while (ancestor) {
          background = getComputedStyle(ancestor).backgroundColor
          if (background !== 'rgba(0, 0, 0, 0)' && background !== 'transparent') break
          ancestor = ancestor.parentElement
        }
        background = ancestor ? background : getComputedStyle(document.body).backgroundColor
        const a = luminance(style.color), b = luminance(background)
        return {text: el.textContent.trim(), ratio: (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)}
      }).filter(item => item.ratio < 4.5)
    })
    if (contrast.length) throw new Error(`${scheme} text contrast: ${JSON.stringify(contrast)}`)
  }
  await page.emulateMedia({colorScheme: 'light'})
  await page.locator('input[type=url]').fill('http://127.0.0.1:19129/fixture/mcp')
  const popupOpened = context.waitForEvent('page')
  await page.getByRole('button', {name: 'Sign in with OAuth', exact: true}).click()
  const popup = await popupOpened
  await popup.getByRole('button', {name: 'Authorize KickSide'}).click()
  await page.locator('#result').filter({hasText: 'Connected'}).waitFor({timeout: 30000})
  if (errors.length) throw new Error(errors.join('\n'))
  await page.screenshot({path: resolve(evidence, 'oauth-connected.png'), fullPage: true})
  console.log('PASS: built connection editor -> consent popup -> shared OAuth callback -> connection-saved')
} finally {
  await browser?.close()
  await new Promise(resolve => server.close(resolve))
}
