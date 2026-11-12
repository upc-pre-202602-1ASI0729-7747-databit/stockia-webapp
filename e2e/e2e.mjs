// End-to-end test of the StockIA Web Application against the real StockIA Platform API (demo data).
// Usage: node e2e/e2e.mjs http://localhost:4200
// Prints PASS/FAIL per check (failures also as GitHub Actions annotations) and saves screenshots.
import {chromium} from 'playwright';
import {mkdir} from 'node:fs/promises';

const BASE = (process.argv[2] ?? 'http://localhost:4200').replace(/\/$/, '');
const SHOTS = 'e2e/screenshots';
const results = [];
await mkdir(SHOTS, {recursive: true});

function check(name, condition, detail = '') {
  results.push(Boolean(condition));
  console.log(`${condition ? 'PASS' : 'FAIL'} ${name}${condition ? '' : ` -> ${detail}`}`);
  if (!condition) console.log(`::error title=E2E::${name} -> ${String(detail).slice(0, 300).replace(/\n/g, ' ')}`);
}

async function step(name, action) {
  try {
    await action();
  } catch (error) {
    check(name, false, error.message.split('\n')[0]);
    await page.screenshot({path: `${SHOTS}/failed-${results.length}.png`, fullPage: true}).catch(() => undefined);
  }
}

const browser = await chromium.launch();
const context = await browser.newContext({viewport: {width: 1366, height: 900}, locale: 'en-US'});
const page = await context.newPage();
const consoleErrors = [];
page.on('pageerror', error => consoleErrors.push(String(error)));
page.setDefaultTimeout(15000);
const snackbar = () => page.locator('mat-snack-bar-container').last();
const shot = name => page.screenshot({path: `${SHOTS}/${name}.png`, fullPage: true});

async function signIn(email, password) {
  await page.goto(`${BASE}/auth/sign-in`);
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password', {exact: true}).fill(password);
  await page.getByRole('button', {name: 'Sign in', exact: true}).click();
}

async function signOut() {
  await page.locator('.user-button').click();
  await page.getByRole('menuitem', {name: 'Sign out'}).click();
  await page.waitForURL('**/auth/sign-in');
}

await step('guard redirects to sign-in', async () => {
  await page.goto(`${BASE}/app/inventory`);
  await page.waitForURL('**/auth/sign-in?redirect=%2Fapp%2Finventory');
  check('protected view without session goes to /auth/sign-in', true);
  await shot('01-sign-in');
});

await step('wrong password', async () => {
  await signIn('empleado@databitecorp.com', 'wrong-pass1');
  const banner = page.locator('.banner-error');
  await banner.waitFor();
  const text = await banner.textContent();
  check('wrong password shows the API message and the attempts left', text.includes('Incorrect email or password') && text.includes('of 5'), text);
});

await step('employee', async () => {
  await signIn('empleado@databitecorp.com', 'stockia123');
  await page.waitForURL('**/app/dashboard');
  const navigation = await page.locator('mat-nav-list').textContent();
  check('employee menu hides Recommendations and Roles', !navigation.includes('Recommendations') && !navigation.includes('Roles'), navigation);
  await page.goto(`${BASE}/app/roles`);
  await page.waitForURL('**/app/dashboard');
  check('employee cannot open /app/roles (redirected to dashboard)', true);
  await signOut();
});

await step('admin dashboard', async () => {
  await page.goto(`${BASE}/auth/sign-in`);
  await page.getByRole('button', {name: 'admin@databitecorp.com'}).click();
  await page.getByRole('button', {name: 'Sign in', exact: true}).click();
  await page.waitForURL('**/app/dashboard');
  await page.getByText('Registered supplies').waitFor();
  const heading = await page.locator('h1').first().textContent();
  check('dashboard greets the administrator', heading.includes('Carla Gallardo'), heading);
  await page.getByText('Weekly savings').waitFor();
  check('weekly savings card for the administrator', true);
  const kpis = await page.locator('.kpis').textContent();
  check('dashboard KPIs from the API', kpis.includes('10'), kpis);
  await shot('02-dashboard');
});

await step('inventory', async () => {
  await page.getByRole('link', {name: 'Inventory'}).click();
  await page.waitForURL('**/app/inventory');
  await page.locator('tr.mat-mdc-row').first().waitFor();
  check('inventory lists the 10 demo lots', (await page.locator('tr.mat-mdc-row').count()) === 10, await page.locator('tr.mat-mdc-row').count());
  check('freshest chicken lot is marked as used first', (await page.getByText('Used first in sales').count()) === 1);
  await page.getByRole('button', {name: 'New supply'}).click();
  await page.getByLabel('Supply name').fill('Lime');
  await page.getByLabel('Current quantity').fill('1.12345678901234567890123456789012');
  await page.getByLabel('Minimum stock').fill('0.5');
  await page.getByLabel('Unit price (S/)').fill('6.5');
  await page.getByRole('button', {name: 'Save', exact: true}).click();
  await snackbar().getByText('Lime was added to the inventory.').waitFor();
  const firstRow = await page.locator('tr.mat-mdc-row').first().textContent();
  check('new supply keeps its 32 decimals', firstRow.includes('Lime') && firstRow.includes('1.12345678901234567890123456789012'), firstRow);
  await shot('03-inventory');
});

await step('recipes and sales', async () => {
  await page.getByRole('link', {name: 'Recipes'}).click();
  await page.locator('mat-card').filter({hasText: 'Fettuccine Alfredo'}).waitFor();
  await page.getByRole('button', {name: 'Sell one Fettuccine Alfredo'}).click();
  const dialog = page.locator('mat-dialog-container');
  await dialog.getByText('Sale not processed').waitFor();
  const text = await dialog.textContent();
  check('expired supply blocks the sale (422 CannotSell)', text.includes('Heavy cream') && text.includes('expired'), text);
  await shot('04-sale-blocked');
  await dialog.getByRole('button', {name: 'Understood'}).click();
  await page.getByRole('button', {name: 'Sell one Chicken Caesar Salad'}).click();
  await snackbar().getByText('Chicken Caesar Salad sold for S/ 3.12').waitFor();
  check('dish sold at the cost of its ingredients', true);
  check('sold dish is highlighted', (await page.locator('mat-card.sold').textContent()).includes('Chicken Caesar Salad'));
  await page.getByRole('link', {name: 'Sales history'}).click();
  await page.locator('tr.mat-mdc-row').first().waitFor();
  const firstSale = await page.locator('tr.mat-mdc-row').first().textContent();
  check('new sale first in the history', firstSale.includes('Chicken Caesar Salad') && firstSale.includes('Confirmed'), firstSale);
  await page.locator('tr.mat-mdc-row').first().getByRole('button', {name: /Void the sale/}).click();
  await page.locator('mat-dialog-container').getByRole('button', {name: 'Void'}).click();
  await snackbar().getByText('The sale was voided.').waitFor();
  check('sale voided', (await page.locator('tr.mat-mdc-row').first().textContent()).includes('Voided'));
});

await step('forecast and recommendations', async () => {
  await page.getByRole('link', {name: 'Demand forecast'}).click();
  await page.getByRole('button', {name: 'Generate new forecast (AI)'}).click();
  await snackbar().getByText('A new forecast was generated.').waitFor();
  const summary = await page.locator('.summary').textContent();
  check('forecast generated with the ONNX model', summary.includes('ML model v1.0.0'), summary);
  check('chart shows 7 days', (await page.locator('.bar-column').count()) === 7, await page.locator('.bar-column').count());
  await shot('05-forecast');
  await page.getByRole('link', {name: 'Recommendations'}).click();
  await page.locator('tr.mat-mdc-row').first().waitFor();
  const table = await page.locator('table').textContent();
  check('purchase recommendation for the supply without stock', table.includes('Beef tenderloin'), table);
  await page.locator('tr.mat-mdc-row').first().getByRole('button', {name: /Apply/}).click();
  await snackbar().getByText('The recommendation was applied.').waitFor();
  check('recommendation applied', true);
});

await step('alerts', async () => {
  await page.getByRole('link', {name: 'Alerts'}).click();
  await page.waitForURL('**/app/alerts');
  await page.getByRole('button', {name: 'New alert'}).waitFor();
  await page.locator('tr.mat-mdc-row').first().waitFor();
  const table = await page.locator('table').textContent();
  check('automatic alerts in English', table.includes('Beef tenderloin has no stock available.'), table);
  await page.getByRole('button', {name: 'New alert'}).click();
  const dialog = page.locator('mat-dialog-container');
  await dialog.getByLabel('Severity').click();
  await page.getByRole('option', {name: 'Critical'}).click();
  await dialog.getByLabel('Message').fill('Fridge #2 open for 6 minutes');
  await dialog.getByRole('button', {name: 'Create alert'}).click();
  await snackbar().getByText('The alert was created.').waitFor();
  const row = page.locator('tr.mat-mdc-row').filter({hasText: 'Fridge #2'});
  check('critical alert waits for the email delivery', (await row.textContent()).includes('Email pending'), await row.textContent());
  await row.getByRole('button', {name: /Retry the delivery/}).click();
  await snackbar().getByText('Delivered by Email.').waitFor();
  await row.getByRole('button', {name: /Mark the alert/}).click();
  await snackbar().getByText('The alert was marked as attended.').waitFor();
  check('alert delivered on both channels and attended', (await row.textContent()).includes('Attended'), await row.textContent());
  await shot('06-alerts');
});

await step('spanish', async () => {
  await page.locator('app-language-switcher mat-button-toggle').nth(1).locator('button').click();
  await page.reload();
  await page.getByRole('link', {name: 'Inventario'}).waitFor();
  await page.locator('tr.mat-mdc-row').first().waitFor();
  const table = await page.locator('table').textContent();
  check('interface and API messages in Spanish', table.includes('Beef tenderloin sin stock disponible.'), table);
  await shot('07-alerts-es');
  await page.locator('app-language-switcher mat-button-toggle').nth(0).locator('button').click();
  await page.getByRole('link', {name: 'Inventory'}).waitFor();
});

await step('team and plans', async () => {
  await page.getByRole('link', {name: 'Roles & permissions'}).click();
  await page.locator('tr.mat-mdc-row').first().waitFor();
  await page.getByRole('button', {name: 'Invite member'}).click();
  await page.getByLabel('Full name').fill('Ana Torres');
  await page.getByLabel('Email').fill('ana@databitecorp.com');
  await page.getByRole('button', {name: 'Send invitation'}).click();
  await snackbar().getByText('Ana Torres was invited to the team.').waitFor();
  check('member invited', (await page.locator('tr.mat-mdc-row').first().textContent()).includes('Ana Torres'));
  await page.getByRole('button', {name: 'Remove Ana Torres from the team'}).click();
  await page.locator('mat-dialog-container').getByRole('button', {name: 'Delete'}).click();
  await snackbar().getByText('Ana Torres was removed from the team.').waitFor();
  check('member removed', true);
  await page.goto(`${BASE}/app/settings/plans`);
  await page.getByRole('button', {name: 'Pay the Profesional plan with Stripe'}).click();
  await snackbar().getByText('✓ Subscription activated: Profesional plan.').waitFor();
  check('plan upgraded with the simulated Stripe checkout', (await page.locator('mat-card.highlighted').textContent()).includes('Your current plan'));
  await shot('08-plans');
  await page.goto(`${BASE}/app/settings/account`);
  await page.getByLabel('Restaurant name').waitFor();
  check('account settings show the restaurant data', (await page.getByLabel('Restaurant name').inputValue()).startsWith('DataBite'));
  await signOut();
});

const email = `owner${Date.now()}@example.com`;
await step('sign-up', async () => {
  await page.goto(`${BASE}/auth/sign-in`);
  await page.evaluate(() => localStorage.clear());
  await page.goto(`${BASE}/auth/sign-up`);
  await page.getByLabel('Full name').fill('Luis Paz');
  await page.getByLabel('Restaurant name').fill('La Esquina');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password', {exact: true}).fill('Esquina2026');
  await page.getByLabel('Confirm password').fill('Esquina2026');
  await page.getByRole('button', {name: 'Create account'}).click();
  await page.waitForURL('**/app/dashboard');
  check('sign-up opens the dashboard of the new restaurant', (await page.locator('h1').first().textContent()).includes('Luis Paz'));
  await page.getByRole('link', {name: 'Inventory'}).click();
  await page.getByText('You have not registered supplies yet').waitFor();
  check('new restaurant starts with an empty inventory (tenant isolation)', true);
  await signOut();
});

await step('password recovery', async () => {
  await page.goto(`${BASE}/auth/sign-in`);
  await page.evaluate(() => localStorage.clear());
  await page.goto(`${BASE}/auth/forgot-password`);
  await page.getByLabel('Email').fill(email);
  await page.getByRole('button', {name: 'Send recovery link'}).click();
  await page.getByRole('link', {name: 'Open the recovery link'}).click();
  await page.waitForURL('**/auth/reset-password?**');
  await page.getByLabel('New password', {exact: true}).fill('Nueva2026x');
  await page.getByLabel('Confirm the new password').fill('Nueva2026x');
  await page.getByRole('button', {name: 'Save new password'}).click();
  await page.waitForURL('**/auth/sign-in');
  await signIn(email, 'Nueva2026x');
  await page.waitForURL('**/app/dashboard');
  check('password reset with the recovery link', true);
});

await step('terms', async () => {
  await page.goto(`${BASE}/terms`);
  check('terms of service page', (await page.locator('h1').textContent()).includes('Terms of service'));
});

check('no uncaught errors in the browser', consoleErrors.length === 0, consoleErrors.join(' | '));
await browser.close();
const passed = results.filter(Boolean).length;
console.log(`\n${passed}/${results.length} passed`);
console.log(`::notice title=Web App E2E::${passed}/${results.length} passed against the StockIA Platform API`);
process.exit(passed === results.length ? 0 : 1);
