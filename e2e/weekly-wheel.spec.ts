import { expect, test } from '@playwright/test';

test('settori settimanali a colori alternati anche dopo la rotazione', async ({ page }) => {
  await page.goto('/#settimane');
  const segments = page.locator('.outer-ring .week-segment');
  await expect(segments).toHaveCount(43);
  const colors = await segments.evaluateAll((items) => items.map((item) => item.getAttribute('stroke')));
  expect(new Set(colors).size).toBe(2);
  for (let index = 1; index < colors.length; index++) {
    expect(colors[index]).not.toBe(colors[index - 1]);
  }
  await page.getByRole('button', { name: 'Settimana successiva' }).click();
  expect(await segments.evaluateAll((items) => items.map((item) => item.getAttribute('stroke')))).toEqual(colors);
});

test('pagina settimane, fonti e ritorno al regolo senza modifiche alle date', async ({ page }) => {
  await page.goto('/');
  await page.locator('#lmp').fill('2026-06-08');
  const saved = await page.evaluate(() => localStorage.getItem('ruotagyn.dates.v1'));
  await page.getByRole('button', { name: 'Apri menu' }).click();
  await page.getByRole('navigation', { name: 'Menu applicazione' }).getByRole('link', { name: 'Ruota delle settimane' }).click();
  await expect(page.getByRole('heading', { name: 'La ruota delle settimane.' })).toBeVisible();
  await expect(page.locator('app-wheel')).toHaveCount(0);
  await expect(page.locator('[data-reference="efw"] .value-number')).toContainText('330 g');
  await expect(page.locator('[data-reference="mca-pi"] .value-number')).toContainText('Riferimento a 20+3');
  await expect(page.locator('[data-reference="tad"] .value-number')).toContainText('Non disponibile');
  const sources = page.getByRole('region', { name: 'Fonti dei valori e limiti di utilizzo' });
  await expect(sources).toBeVisible();
  await expect(sources.locator('details')).not.toHaveAttribute('open');
  await expect(page.locator('#source-who')).not.toBeVisible();
  await expect(page.locator('app-weekly-wheel')).not.toContainText(/fotograf/i);
  await expect(sources.locator('a[href^="https://"]')).toHaveCount(11);
  await page.locator('[data-reference="efw"]').getByRole('link').click();
  await expect(sources.locator('details')).toHaveAttribute('open');
  await expect(page.locator('#source-who')).toBeInViewport();
  await expect(page.locator('app-weekly-wheel')).toBeVisible();
  await page.reload();
  await expect(page.locator('app-weekly-wheel')).toBeVisible();
  await expect(page.locator('#source-who')).toBeVisible();
  const summary = page.locator('.reference-sources summary');
  await summary.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#source-who')).not.toBeVisible();
  await page.keyboard.press('Space');
  await expect(page.locator('#source-who')).toBeVisible();
  await page.getByRole('button', { name: 'Apri menu' }).click();
  await page.getByRole('navigation', { name: 'Menu applicazione' }).getByRole('link', { name: 'Regolo ostetrico' }).click();
  await expect(page.locator('#lmp')).toHaveValue('2026-06-08');
  expect(await page.evaluate(() => localStorage.getItem('ruotagyn.dates.v1'))).toBe(saved);
});

test('comandi, estremi e centro fisso durante la rotazione esterna', async ({ page }) => {
  await page.goto('/#settimane');
  const ring = page.getByRole('slider', { name: 'Anello esterno delle settimane' });
  const pointer = page.locator('.fixed-pointer');
  const marker = await pointer.getAttribute('d');
  await ring.focus();
  await page.keyboard.press('ArrowRight');
  await expect(ring).toHaveAttribute('aria-valuenow', '21');
  await expect(page.locator('.outer-ring')).toHaveAttribute('transform', 'rotate(157.5 280 280)');
  await page.keyboard.press('End');
  await expect(ring).toHaveAttribute('aria-valuenow', '42');
  await expect(page.getByRole('button', { name: 'Settimana successiva' })).toBeDisabled();
  await expect(page.locator('.value-number strong').filter({ hasText: 'Non disponibile' })).toHaveCount(11);
  await page.keyboard.press('Home');
  await page.keyboard.press('ArrowLeft');
  await expect(ring).toHaveAttribute('aria-valuenow', '0');
  await expect(page.getByRole('button', { name: 'Settimana precedente' })).toBeDisabled();
  await page.keyboard.press('PageUp');
  await expect(ring).toHaveAttribute('aria-valuenow', '4');
  const bounds = await ring.boundingBox();
  if (!bounds) throw new Error('Ruota non visibile');
  const center = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
  const radius = bounds.width * .44;
  await page.mouse.move(center.x, center.y - radius);
  await page.mouse.down();
  await page.mouse.move(center.x + radius, center.y, { steps: 20 });
  await page.mouse.up();
  await expect(ring).toHaveAttribute('aria-valuenow', '16');
  await expect(page.locator('.outer-ring')).toHaveAttribute('transform', 'rotate(120 280 280)');
  expect(await pointer.getAttribute('d')).toBe(marker);
  expect(await page.locator('.fixed-panel').getAttribute('style')).toBeNull();
});

test('pagina settimane leggibile senza overflow su mobile e desktop', async ({ page }) => {
  await page.goto('/#settimane');
  for (const width of [320, 375, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(page.locator('.fixed-panel')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    const disc = await page.locator('.fixed-panel').boundingBox();
    const heading = await page.locator('.panel-heading').boundingBox();
    const lastRow = await page.locator('.fixed-panel dl > div').last().boundingBox();
    if (!disc || !heading || !lastRow) throw new Error('Pannello non visibile');
    expect(heading.y).toBeGreaterThanOrEqual(disc.y);
    expect(lastRow.y + lastRow.height).toBeLessThanOrEqual(disc.y + disc.height + 1);
    const overlap = await page.locator('.fixed-panel dl > div').evaluateAll((rows) =>
      rows.some((row) => row.children[0].getBoundingClientRect().right > row.children[1].getBoundingClientRect().left));
    expect(overlap).toBe(false);
  }
});

test('navigazione settimane da menu e cronologia del browser', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Apri menu' }).click();
  const menu = page.getByRole('navigation', { name: 'Menu applicazione' });
  await menu.getByRole('link', { name: 'Ruota delle settimane' }).click();
  await expect(menu).toBeHidden();
  await expect(page.locator('app-weekly-wheel')).toBeVisible();
  await page.goBack();
  await expect(page.locator('app-wheel')).toBeVisible();
  await page.goForward();
  await expect(page.locator('app-weekly-wheel')).toBeVisible();
});

test('header sempre visibile durante lo scroll e navigazione soltanto dal menu', async ({ page }) => {
  for (const width of [320, 1280]) {
    await page.setViewportSize({ width, height: 800 });
    for (const hash of ['#regolo', '#settimane']) {
      await page.goto(`/${hash}`);
      await expect(page.locator('.page-nav')).toHaveCount(0);
      await page.evaluate(() => window.scrollTo(0, 900));
      expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
      const header = page.locator('.site-header');
      await expect(header).toBeInViewport();
      expect((await header.boundingBox())?.y).toBe(0);
      await page.getByRole('button', { name: 'Apri menu' }).click();
      const menu = page.getByRole('navigation', { name: 'Menu applicazione' });
      await expect(menu).toBeInViewport();
      await menu.getByRole('link', { name: hash === '#regolo' ? 'Ruota delle settimane' : 'Regolo ostetrico' }).click();
      await expect(menu).toBeHidden();
      await expect(page.locator(hash === '#regolo' ? 'app-weekly-wheel' : 'app-wheel')).toBeVisible();
    }
    await page.goto('/');
    await page.getByRole('link', { name: 'Personalizza' }).click();
    const header = await page.locator('.site-header').boundingBox();
    const input = await page.locator('#lmp').boundingBox();
    if (!header || !input) throw new Error('Header o campo data non visibile');
    expect(input.y).toBeGreaterThanOrEqual(header.y + header.height);
  }
});

test('ruota, valori e fonti descrittive disponibili offline senza nuovi salvataggi', async ({ page, context }) => {
  await page.goto('/#settimane');
  await page.evaluate(async () => {
    await navigator.serviceWorker.register(new URL('ngsw-worker.js', document.baseURI).href);
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await page.waitForFunction(() => !!navigator.serviceWorker.controller);
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator('app-weekly-wheel')).toBeVisible();
  await page.getByRole('button', { name: 'Settimana successiva' }).click();
  await expect(page.locator('[data-reference="efw"] .value-number')).toContainText('398 g');
  await expect(page.locator('#source-who')).toContainText('Kiserud');
  expect(await page.evaluate(() => localStorage.length)).toBe(0);
  await context.setOffline(false);
});

test('touch sull’anello esterno senza scroll e arresto alla cancellazione', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 375, height: 850 }, hasTouch: true, isMobile: true });
  const page = await context.newPage();
  await page.goto('/#settimane');
  const ring = page.getByRole('slider', { name: 'Anello esterno delle settimane' });
  await ring.scrollIntoViewIfNeeded();
  const bounds = await ring.boundingBox();
  if (!bounds) throw new Error('Ruota non visibile');
  const scroll = await page.evaluate(() => window.scrollY);
  const position = (degrees: number) => ({
    x: bounds.x + bounds.width / 2 + bounds.width * .44 * Math.cos(degrees * Math.PI / 180),
    y: bounds.y + bounds.height / 2 + bounds.width * .44 * Math.sin(degrees * Math.PI / 180),
  });
  const cdp = await context.newCDPSession(page);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [position(-100)] });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [position(-70)] });
  await expect(ring).toHaveAttribute('aria-valuenow', '24');
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchCancel', touchPoints: [] });
  await expect(ring).not.toHaveClass(/dragging/);
  expect(await page.evaluate(() => window.scrollY)).toBe(scroll);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [position(-70)] });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [position(-100)] });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await expect(ring).toHaveAttribute('aria-valuenow', '20');
  await expect(ring).not.toHaveClass(/dragging/);
  await context.close();
});
