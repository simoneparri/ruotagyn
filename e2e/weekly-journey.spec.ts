import { expect, test } from '@playwright/test';

test('scheda settimanale, finestre, fonti e date indipendenti dall’anteprima', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await page.locator('#lmp').fill('2026-06-08');
  const dueDate = await page.locator('#due-date').inputValue();
  const saved = await page.evaluate(() => localStorage.getItem('ruotagyn.dates.v1'));
  const card = page.locator('app-weekly-journey');
  const slider = page.locator('#week');
  await slider.fill('20');
  await expect(card.getByRole('heading', { name: 'Settimana 20 · Un passo nel percorso' })).toBeVisible();
  await expect(card.locator('.size-value')).toHaveText('330 g');
  await expect(page.locator('.explore-controls .selected-trimester')).toHaveText('2° trimestre');
  await expect(card.locator('.animal')).toContainText('Scoiattolo rosso');
  await expect(card.locator('.animal-emoji')).toHaveText('🐿️');
  await expect(card.locator('.animal')).toContainText('Circa il 55% del riferimento animale di 600 g');
  await slider.fill('29');
  await expect(card.locator('.animal')).toContainText('Circa il 135% del riferimento animale di 1000 g');
  await expect(card.locator('.animal')).not.toContainText('volte');
  await slider.fill('20');
  await expect(card.getByRole('heading', { name: 'Ecografia morfologica', exact: true })).toBeVisible();
  await expect(card.locator('.window')).toHaveText('19+0–21+0');
  await expect(card.locator('.journey-grid a')).toHaveCount(0);
  await expect(card).not.toContainText('Fonte della misura (sito esterno)');
  await expect(card).not.toContainText('Fonte del paragone (sito esterno)');
  await expect(card).not.toContainText('Fonte ISS (PDF, sito esterno)');
  await expect(card.locator('details')).not.toHaveAttribute('open');
  await card.locator('summary').focus();
  await page.keyboard.press('Enter');
  await expect(card.locator('details')).toHaveAttribute('open');
  await expect(card.locator('details a')).toHaveCount(11);
  expect(await card.locator('a').evaluateAll((links) => links.every((link) =>
    link.getAttribute('href')?.startsWith('https://') &&
    link.getAttribute('rel')?.includes('noopener')))).toBe(true);
  await slider.fill('11');
  await expect(card.getByRole('heading', { name: 'Test combinato', exact: true })).toBeVisible();
  await expect(card.getByRole('heading', { name: 'Ecografia morfologica', exact: true })).toHaveCount(0);
  await expect(card.locator('.size-value')).toHaveText('4,38 cm');
  await slider.fill('13');
  await slider.focus();
  await page.keyboard.press('ArrowRight');
  await expect(card.getByRole('heading', { name: 'Test combinato', exact: true })).toHaveCount(0);
  await expect(card.locator('.size-value')).toHaveText('90 g');
  await slider.fill('36');
  await expect(card.getByRole('heading', { name: 'Tampone per streptococco di gruppo B', exact: true })).toBeVisible();
  await slider.fill('38');
  await expect(card.getByRole('heading', { name: 'Tampone per streptococco di gruppo B', exact: true })).toHaveCount(0);
  await page.locator('#week').focus();
  await page.keyboard.press('Home');
  await expect(card.getByRole('heading', { name: 'Settimana 0 · Un passo nel percorso' })).toBeVisible();
  await expect(card.locator('.size-value')).toHaveCount(0);
  await page.keyboard.press('End');
  await expect(card.getByRole('heading', { name: 'Settimana 42 · Un passo nel percorso' })).toBeVisible();
  await expect(card).toContainText('Non estrapoliamo');
  await expect(page.locator('#lmp')).toHaveValue('2026-06-08');
  await expect(page.locator('#due-date')).toHaveValue(dueDate);
  expect(await page.evaluate(() => localStorage.getItem('ruotagyn.dates.v1'))).toBe(saved);
  expect(errors).toEqual([]);
});

test('trimestre selezionato con gli stessi colori della ruota e confini a 14 e 28 settimane', async ({ page }) => {
  await page.goto('/');
  const badge = page.locator('.explore-controls .selected-trimester');
  for (const [week, trimester, color] of [
    [0, 1, 'rgb(217, 227, 206)'], [13, 1, 'rgb(217, 227, 206)'],
    [14, 2, 'rgb(226, 217, 236)'], [27, 2, 'rgb(226, 217, 236)'],
    [28, 3, 'rgb(241, 216, 200)'], [42, 3, 'rgb(241, 216, 200)'],
  ] as const) {
    await page.locator('#week').fill(String(week));
    await expect(badge).toHaveText(`${trimester}° trimestre`);
    await expect(badge).toHaveCSS('background-color', color);
    expect(await page.locator('app-wheel svg path').evaluateAll(
      (paths, expectedColor) => paths.some((path) => getComputedStyle(path).stroke === expectedColor), color,
    )).toBe(true);
  }
});

test('tutte le settimane leggibili su mobile senza richieste a fonti esterne', async ({ page }) => {
  const externalRequests: string[] = [];
  page.on('request', (request) => {
    if (new URL(request.url()).origin !== 'http://127.0.0.1:4173') externalRequests.push(request.url());
  });
  await page.goto('/');
  for (const width of [320, 375, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    for (let week = 0; week <= 42; week++) {
      await page.locator('#week').fill(String(week));
      const card = page.locator('app-weekly-journey');
      await expect(card.locator('h3')).toContainText(`Settimana ${week} ·`);
      expect(await card.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
  }
  expect(externalRequests).toEqual([]);
});

test('contenuti settimanali disponibili offline dopo il primo caricamento', async ({ page, context }) => {
  await page.goto('/');
  await page.evaluate(async () => {
    await navigator.serviceWorker.register(new URL('ngsw-worker.js', document.baseURI).href);
    await navigator.serviceWorker.ready;
  });

  await page.reload();
  await page.waitForFunction(() => !!navigator.serviceWorker.controller);
  await context.setOffline(true);
  await page.reload();
  await page.locator('#week').fill('12');
  await expect(page.locator('app-weekly-journey').getByRole('heading', { name: 'Test combinato', exact: true })).toBeVisible();
  await page.locator('#week').fill('20');
  await expect(page.locator('app-weekly-journey .size-value')).toHaveText('330 g');
  await expect(page.locator('app-weekly-journey').getByRole('heading', { name: 'Ecografia morfologica', exact: true })).toBeVisible();
  await context.setOffline(false);
});

test('tooltip delle note accessibili con mouse, tastiera e tocco su mobile', async ({ page, browser }) => {
    await page.goto('/');
    await page.locator('#week').fill('20');
    for (const [id, label, text] of [
      ['measure-tooltip', 'Sulla misura di riferimento', 'Mediana (50° percentile) a settimana +0, non una misura personale né un obiettivo di crescita.'],
      ['animal-tooltip', 'Sul paragone animale', 'Paragone ludico e approssimativo, non clinico.'],
      ['calendar-tooltip', 'Sul calendario informativo', 'Calendario informativo e non esaustivo'],
    ]) {
      const tip = page.locator(`#${id}`);
      const button = page.getByRole('button', { name: label });
      await expect(tip).not.toBeVisible();
      await button.hover();
      await expect(tip).toBeVisible();
      await expect(tip).toContainText(text);
      await tip.hover();
      await expect(tip).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(tip).not.toBeVisible();
      await page.mouse.move(0, 0);
      await button.focus();
      await expect(tip).toBeVisible();
      await expect(button).toHaveAttribute('aria-describedby', id);
      await page.keyboard.press('Escape');
      await expect(tip).not.toBeVisible();
      await page.keyboard.press('Enter');
      await expect(tip).toBeVisible();
      await page.locator('#journey-title').click();
      await expect(tip).not.toBeVisible();
    }
    const context = await browser.newContext({ viewport: { width: 320, height: 800 }, isMobile: true, hasTouch: true });
    const mobile = await context.newPage();
    await mobile.goto('/');
    for (const label of ['Sulla misura di riferimento', 'Sul paragone animale', 'Sul calendario informativo']) {
      await mobile.getByRole('button', { name: label }).tap();
      const tip = mobile.getByRole('tooltip');
      await expect(tip).toBeVisible();
      const box = await tip.boundingBox();
      if (!box) throw new Error('Tooltip non visibile');
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(320);
      await mobile.locator('#journey-title').tap();
      await expect(tip).not.toBeVisible();
    }
    await context.close();
});
