import { expect, test, type Page } from '@playwright/test';
import { readFile, writeFile } from 'node:fs/promises';

test('gennaio è centrato a ore 12 nell’anello del calendario', async ({ page }) => {
  await page.goto('/');
  await page.locator('#lmp').fill('2024-06-08');
  const january = page.locator('app-wheel .month').filter({ hasText: 'GENNAIO' });
  await expect(january).toHaveCount(1);
  const position = await january.evaluate((label: SVGTextElement) => ({
    x: Number(label.getAttribute('x')),
    y: Number(label.getAttribute('y')),
  }));
  expect(position.x).toBeCloseTo(280, 0);
  expect(position.y).toBeLessThan(45);
});

test('ruota a tutto schermo interattiva, uscita e focus su desktop e mobile', async ({ page }) => {
  await page.goto('/');
  await page.locator('#lmp').fill('2026-06-08');
  for (const width of [1280, 375, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await page.getByRole('button', { name: 'Tutto schermo', exact: true }).click();
    const dialog = page.getByRole('dialog', { name: 'La tua ruota', exact: true });
    await expect(dialog).toBeVisible();
    await expect(page.locator('app-wheel')).toHaveCount(1);
    const bounds = await dialog.boundingBox();
    expect(bounds?.width).toBe(width);
    expect(bounds?.height).toBe(900);
    await page.locator('app-wheel svg').focus();
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('#lmp')).toHaveValue(width === 1280 ? '2026-06-09' : width === 375 ? '2026-06-10' : '2026-06-11');
    if (width === 375) await page.getByRole('button', { name: 'Esci da tutto schermo' }).click();
    else await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
    await expect(page.getByRole('button', { name: 'Tutto schermo', exact: true })).toBeFocused();
    await expect(page.locator('app-wheel')).toHaveCount(1);
  }
  await page.getByRole('button', { name: 'Apri menu' }).click();
  await page.getByRole('button', { name: 'Solo ruota', exact: true }).click();
  await page.getByRole('button', { name: 'Tutto schermo', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'La tua ruota', exact: true })).toBeVisible();
  await page.keyboard.press('Escape');
});

async function selectView(page: Page, view: string): Promise<void> {
  await page.getByRole('button', { name: 'Apri menu' }).click();
  await page.getByRole('button', { name: view === 'wheel' ? 'Solo ruota' : 'Vista completa', exact: true }).click();
}

test('accordion accessibilità e legenda apribili da tastiera in entrambe le viste', async ({ page }) => {
  await page.goto('/');
  for (const view of ['full', 'wheel']) {
    await selectView(page, view);
    await expect(page.locator('#wheel-help')).toBeHidden();
    await expect(page.locator('.wheel-legend')).toBeHidden();
    const help = page.locator('.wheel-help-accordion > summary');
    await help.focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('#wheel-help')).toBeVisible();
    await expect(page.locator('#wheel-help')).toContainText('Da tastiera: frecce');
    await page.keyboard.press('Enter');
    await expect(page.locator('#wheel-help')).toBeHidden();
    const legend = page.locator('.legend-accordion > summary');
    await legend.focus();
    await page.keyboard.press('Space');
    await expect(page.locator('.wheel-legend')).toBeVisible();
    await expect(page.locator('.wheel-caption')).toBeVisible();
    await page.keyboard.press('Space');
    await expect(page.locator('.wheel-legend')).toBeHidden();
  }
});

test('menu solo ruota con date collegate in entrambi i versi e ritorno alla vista completa', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-10-29T12:00:00+01:00') });
  await page.goto('/');
  await selectView(page, 'wheel');
  await expect(page.locator('.intro')).toBeHidden();
  await expect(page.locator('.summary-card')).toBeHidden();
  await expect(page.locator('.explore-card')).toBeHidden();
  await page.locator('#due-date').fill('2027-03-15');
  await expect(page.locator('#lmp')).toHaveValue('2026-06-08');
  await expect(page.locator('.indicator-hand[data-indicator="due-date"]')).toHaveAttribute('data-date', '2027-03-15');
  await page.locator('#lmp').fill('2026-06-15');
  await expect(page.locator('#due-date')).toHaveValue('2027-03-22');
  await rotateWheel(page, 7);
  await expect(page.locator('#lmp')).toHaveValue('2026-06-22');
  await expect(page.locator('#due-date')).toHaveValue('2027-03-29');
  await selectView(page, 'full');
  await expect(page.locator('.summary-card')).toBeVisible();
  await expect(page.locator('.summary-card')).toContainText('29 marzo 2027');
  await expect(page.locator('#lmp')).toHaveValue('2026-06-22');
  await page.locator('#due-date').fill('2024-12-05');
  await expect(page.locator('#lmp')).toHaveValue('2024-02-29');
  await page.locator('#due-date').fill('2027-12-31');
  await expect(page.locator('#date-error')).not.toBeEmpty();
  await expect(page.locator('app-wheel')).toHaveCount(0);
  await page.locator('#due-date').fill('');
  await expect(page.locator('#lmp')).toHaveValue('');
  await expect(page.locator('#date-error')).not.toBeEmpty();
  await page.locator('#due-date').fill('1900-01-01');
  await expect(page.locator('#date-error')).toContainText('1900');
  await page.locator('#due-date').fill('2027-03-15');
  await expect(page.locator('#date-error')).toBeEmpty();
  await selectView(page, 'wheel');
  for (const width of [320, 375, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await expect(page.locator('#lmp')).toBeVisible();
    await expect(page.locator('#due-date')).toBeVisible();
  }
});

async function rotateWheel(page: Page, days: number, yearDays = 365): Promise<void> {
  const wheel = page.locator('app-wheel svg');
  await wheel.scrollIntoViewIfNeeded();
  const bounds = await wheel.boundingBox();
  if (!bounds) throw new Error('Ruota non visibile');
  const radius = bounds.width * .35;
  const steps = Math.max(2, Math.ceil(Math.abs(days) / 5));
  const position = (step: number) => {
    const angle = (-100 + step / steps * days / yearDays * 360) * Math.PI / 180;
    return { x: bounds.x + bounds.width / 2 + radius * Math.cos(angle),
      y: bounds.y + bounds.height / 2 + radius * Math.sin(angle) };
  };
  const first = position(0);
  await page.mouse.move(first.x, first.y);
  await page.mouse.down();
  for (let step = 1; step <= steps; step++) {
    const point = position(step);
    await page.mouse.move(point.x, point.y);
  }
  await page.mouse.up();
}

test('rotazione mouse aggiorna date e risultati attraversando mesi e lo zero angolare', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-10-29T12:00:00+01:00') });
  await page.goto('/');
  await rotateWheel(page, 7);
  await expect(page.locator('#lmp')).toHaveValue('2026-06-15');
  await expect(page.locator('.gestation-value')).toContainText('19 settimane');
  await expect(page.locator('.gestation-value')).toContainText('e 3 giorni');
  await expect(page.locator('.due-block')).toContainText('22 marzo 2027');
  await expect(page.getByText('Stai esplorando un esempio.')).toHaveCount(0);
  await rotateWheel(page, -20);
  await expect(page.locator('#lmp')).toHaveValue('2026-05-26');
  await expect(page.locator('app-wheel svg')).not.toHaveClass(/dragging/);
  await rotateWheel(page, -365);
  await expect(page.locator('#lmp')).toHaveValue('2025-05-26');
});

test('quattro lancette con date, angoli e aggiornamento coerenti con il regolo', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-10-29T12:00:00+01:00') });
  await page.goto('/');
  await page.locator('#lmp').fill('2026-06-08');
  const expected = [
    { id: 'lmp', offset: 0, date: '2026-06-08', label: 'Ultima mestruazione' },
    { id: 'conception', offset: 14, date: '2026-06-22', label: 'Concepimento stimato' },
    { id: 'missed-period', offset: 28, date: '2026-07-06', label: 'Mestruazione mancata stimata' },
    { id: 'due-date', offset: 280, date: '2027-03-15', label: 'Data presunta del parto' },
  ];
  await expect(page.locator('.indicator-hand')).toHaveCount(4);
  for (const indicator of expected) {
    const hand = page.locator(`.indicator-hand[data-indicator="${indicator.id}"]`);
    await expect(hand).toHaveAttribute('data-date', indicator.date);
    await expect(hand.locator('.hand-label')).toHaveText(indicator.label);
    const angle = Number(await hand.getAttribute('data-angle'));
    expect(angle).toBeCloseTo((7 + indicator.offset) / 365 * 360, 6);
    await expect(page.locator(`.indicator-list [data-indicator="${indicator.id}"] time`))
      .toHaveAttribute('datetime', indicator.date);
  }
  await expect(page.locator('#indicator-assumptions')).toContainText('ciclo convenzionale di 28 giorni');
  await rotateWheel(page, 7);
  for (const indicator of expected) {
    const date = new Date(`${indicator.date}T00:00:00Z`);
    date.setUTCDate(date.getUTCDate() + 7);
    await expect(page.locator(`.indicator-hand[data-indicator="${indicator.id}"]`))
      .toHaveAttribute('data-date', date.toISOString().slice(0, 10));
  }
  const dates = await page.locator('.indicator-hand').evaluateAll((hands) => hands.map((hand) => hand.getAttribute('data-date')));
  await page.getByLabel('Settimana successiva', { exact: true }).click();
  expect(await page.locator('.indicator-hand').evaluateAll((hands) => hands.map((hand) => hand.getAttribute('data-date')))).toEqual(dates);
  await page.locator('#lmp').fill('2024-02-20');
  await expect(page.locator('.indicator-hand[data-indicator="conception"]')).toHaveAttribute('data-date', '2024-03-05');
  await expect(page.locator('.indicator-hand[data-indicator="missed-period"]')).toHaveAttribute('data-date', '2024-03-19');
  for (const width of [320, 375, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await expect(page.getByRole('list', { name: 'Lancette del regolo ostetrico' })).toBeVisible();
  }
});

test('tastiera sulla ruota e limiti espliciti delle date', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-10-29T12:00:00+01:00') });
  await page.goto('/');
  await page.locator('#lmp').fill('2026-10-29');
  const wheel = page.getByRole('slider', { name: 'Ruota per modificare l’ultima mestruazione' });
  await wheel.focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#lmp')).toHaveValue('2026-10-29');
  await expect(page.locator('.interaction-status')).toContainText('non può essere futura');
  await page.keyboard.press('PageDown');
  await expect(page.locator('#lmp')).toHaveValue('2026-10-22');
  await page.keyboard.press('ArrowUp');
  await expect(page.locator('#lmp')).toHaveValue('2026-10-23');
  await page.locator('#lmp').fill('1900-01-01');
  await wheel.focus();
  await page.keyboard.press('ArrowLeft');
  await expect(page.locator('#lmp')).toHaveValue('1900-01-01');
  await expect(page.locator('.interaction-status')).toContainText('data minima');
});

test('rotazione attraversa il giorno bisestile e impedisce date future', async ({ page }) => {
  await page.clock.install({ time: new Date('2024-03-10T12:00:00+01:00') });
  await page.goto('/');
  await page.locator('#lmp').fill('2024-02-28');
  await rotateWheel(page, 2, 366);
  await expect(page.locator('#lmp')).toHaveValue('2024-03-01');
  await expect(page.locator('.gestation-value')).toContainText('1 settimane');
  await expect(page.locator('.gestation-value')).toContainText('e 2 giorni');
  await rotateWheel(page, 20, 366);
  await expect(page.locator('#lmp')).toHaveValue('2024-03-10');
  await expect(page.locator('.interaction-status')).toContainText('non può essere futura');
  await rotateWheel(page, -1, 366);
  await expect(page.locator('#lmp')).toHaveValue('2024-03-09');
  await expect(page.locator('.interaction-status')).toBeEmpty();
});

test('touch reale ruota senza scorrere e si arresta al rilascio o annullamento', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 375, height: 850 }, hasTouch: true, isMobile: true });
  const page = await context.newPage();
  await page.clock.install({ time: new Date('2026-10-29T12:00:00+01:00') });
  await page.goto('/');
  await page.locator('#lmp').fill('2026-06-08');
  const wheel = page.locator('app-wheel svg');
  await wheel.scrollIntoViewIfNeeded();
  const bounds = await wheel.boundingBox();
  if (!bounds) throw new Error('Ruota non visibile');
  const scroll = await page.evaluate(() => window.scrollY);
  const cdp = await context.newCDPSession(page);
  const position = (degrees: number) => ({
    x: bounds.x + bounds.width / 2 + bounds.width * .35 * Math.cos(degrees * Math.PI / 180),
    y: bounds.y + bounds.height / 2 + bounds.width * .35 * Math.sin(degrees * Math.PI / 180),
  });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [position(-100)] });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [position(-80)] });
  await expect(page.locator('#lmp')).toHaveValue('2026-06-28');
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchCancel', touchPoints: [] });
  await expect(wheel).not.toHaveClass(/dragging/);
  expect(await page.evaluate(() => window.scrollY)).toBe(scroll);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [position(-80)] });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [position(-100)] });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await expect(page.locator('#lmp')).toHaveValue('2026-06-08');
  await expect(wheel).not.toHaveClass(/dragging/);
  await context.close();
});

test('calcolo, selezione settimane, errori e cancellazione', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.clock.install({ time: new Date('2026-10-29T12:00:00+01:00') });
  await page.goto('/');
  await expect(page.getByText('Stai esplorando un esempio.')).toBeVisible();
  await page.getByLabel('Ultima mestruazione', { exact: true }).fill('2026-06-08');
  await expect(page.getByText('Stai esplorando un esempio.')).toHaveCount(0);
  const summary = page.getByRole('region', { name: 'Il tuo percorso', exact: true });
  await expect(summary).toContainText('20 settimane');
  await expect(summary).toContainText('e 3 giorni');
  await expect(summary).toContainText('15 marzo 2027');
  await page.getByLabel('Settimana successiva', { exact: true }).click();
  await expect(page.locator('.selected-heading')).toContainText('21 settimane');
  await expect(page.locator('.selected-heading')).toContainText('2 novembre 2026');
  await expect(summary).toContainText('20 settimane');
  await page.getByRole('button', { name: 'Torna a oggi' }).click();
  await expect(page.locator('.selected-heading')).toContainText('+ 3 giorni');
  await page.getByLabel('Ultima mestruazione', { exact: true }).fill('2026-10-30');
  await expect(page.locator('#date-error')).not.toBeEmpty();
  await expect(page.locator('app-wheel')).toHaveCount(0);
  await page.getByRole('button', { name: 'Cancella', exact: true }).click();
  await expect(page.locator('#lmp')).toHaveValue('');
  await expect(page.getByRole('heading', { name: 'La tua ruota ti aspetta' })).toBeVisible();
  await page.getByRole('button', { name: 'Esplora la ruota' }).click();
  await expect(page.locator('app-wheel')).toBeVisible();
  await expect(page.locator('app-wheel svg')).toHaveAttribute('aria-valuetext', /20 settimane complete e 3 giorni/);
  expect(errors).toEqual([]);
});

test('layout mobile e tastiera senza overflow', async ({ page }) => {
  await page.goto('/');
  for (const width of [320, 375, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await expect(page.locator('#lmp')).toBeVisible();
  }
  await page.setViewportSize({ width: 375, height: 850 });
  await page.locator('#week').focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#week')).toHaveValue('21');
  await page.getByRole('button', { name: 'Apri menu' }).click();
  await page.getByRole('button', { name: 'Installa sul dispositivo' }).click();
  // Headless Chrome may offer a native install prompt instead of the help panel.
  await expect(page.getByRole('heading', { name: 'La tua ruota', exact: true })).toBeVisible();
});

test('anni bisestili e conteggio oltre il termine senza azzeramento', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-10-29T12:00:00+01:00') });
  await page.goto('/');
  await page.locator('#lmp').fill('2025-12-25');
  await expect(page.locator('.gestation-value')).toContainText('44 settimane');
  await expect(page.locator('.range-note')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Torna a oggi' })).toBeDisabled();
  await page.locator('#lmp').fill('2024-02-29');
  await expect(page.locator('.due-block')).toContainText('5 dicembre 2024');
});

test('PWA: manifest, icone, cache senza dati personali e ricarica offline', async ({ page, context }) => {
  await page.goto('/');
  await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.register(new URL('ngsw-worker.js', document.baseURI).href);
    await navigator.serviceWorker.ready;
    if (!registration.active) throw new Error('Service worker non attivo');
  });
  await expect.poll(() => page.evaluate(async () => {
    const keys = await caches.keys();
    return keys.some((key) => key.includes('app-shell'));
  })).toBe(true);
  await page.reload();
  await page.waitForFunction(() => !!navigator.serviceWorker.controller);
  const manifestUrl = await page.locator('link[rel="manifest"]').evaluate((link: HTMLLinkElement) => link.href);
  const manifestResponse = await page.request.get(manifestUrl);
  const manifest = await manifestResponse.json();
  const appBasePath = await page.evaluate(() => new URL(document.baseURI).pathname);
  expect(manifest.display).toBe('standalone');
  expect(new URL(manifest.start_url, manifestUrl).pathname).toBe(appBasePath);
  expect(new URL(manifest.scope, manifestUrl).pathname).toBe(appBasePath);
  for (const icon of manifest.icons) {
    expect((await page.request.get(new URL(icon.src, manifestUrl).href)).ok()).toBe(true);
  }
  await page.locator('#lmp').fill('2026-01-01');
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('ruotagyn.dates.v1')!)))
    .toEqual({ lmp: '2026-01-01', dueDate: '2026-10-08' });
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'La tua ruota', exact: true })).toBeVisible();
  await expect(page.getByText('Sei offline')).toBeVisible();
  await expect(page.locator('#lmp')).toHaveValue('2026-01-01');
  await page.locator('#lmp').fill('2026-06-08');
  await expect(page.locator('app-wheel')).toBeVisible();
  await context.setOffline(false);
});

test('aggiornamento PWA proposto senza perdere input prima della conferma', async ({ page }) => {
  const path = 'dist/ruotagyn/browser/ngsw.json';
  const original = await readFile(path, 'utf8');
  await page.goto('/');
  await page.evaluate(async () => {
    await navigator.serviceWorker.register(new URL('ngsw-worker.js', document.baseURI).href);
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await page.waitForFunction(() => !!navigator.serviceWorker.controller);
  await page.locator('#lmp').fill('2026-06-08');
  try {
    const updated = { ...JSON.parse(original), appData: { testVersion: 'next-version' } };
    await writeFile(path, JSON.stringify(updated));
    await page.evaluate(async () => {
      await new Promise<void>((resolve, reject) => {
        const nonce = 1001;
        const timeout = setTimeout(() => reject(new Error('Controllo aggiornamenti scaduto')), 10000);
        const receive = (event: MessageEvent) => {
          if (event.data.type === 'OPERATION_COMPLETED' && event.data.nonce === nonce) {
            clearTimeout(timeout);
            navigator.serviceWorker.removeEventListener('message', receive);
            if (event.data.result === true) resolve();
            else reject(new Error('Nessun aggiornamento disponibile'));
          }
        };
        navigator.serviceWorker.addEventListener('message', receive);
        navigator.serviceWorker.controller!.postMessage({ action: 'CHECK_FOR_UPDATES', nonce });
      });
    });
    const dialog = page.getByRole('dialog', { name: 'È disponibile una nuova versione.' });
    await expect(dialog).toBeVisible();
    await expect(page.locator('#lmp')).toHaveValue('2026-06-08');
    await expect(page.getByRole('button', { name: 'Più tardi' })).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Ricarica ora' })).toBeFocused();
    await page.getByRole('button', { name: 'Più tardi' }).click();
    await expect(dialog).not.toBeVisible();
    await expect(page.locator('#lmp')).toHaveValue('2026-06-08');
    // A later release must reopen the modal after the previous one was deferred.
    await writeFile(path, JSON.stringify({ ...updated, appData: { testVersion: 'next-version-2' } }));
    await page.evaluate(() => navigator.serviceWorker.controller!.postMessage({ action: 'CHECK_FOR_UPDATES', nonce: 1002 }));
    await expect(dialog).toBeVisible();
    await page.getByRole('button', { name: 'Ricarica ora' }).click();
    await expect(page.locator('#lmp')).toHaveValue('2026-06-08');
    await expect(page.locator('#due-date')).toHaveValue('2027-03-15');
  } finally {
    await writeFile(path, original);
  }
});

test('salvataggio da entrambi i campi e rotazione, esempio separato e cancellazione persistente', async ({ page }) => {
  await page.goto('/');
  expect(await page.evaluate(() => localStorage.getItem('ruotagyn.dates.v1'))).toBeNull();
  await page.locator('#lmp').fill('2026-06-08');
  await page.reload();
  await expect(page.locator('#lmp')).toHaveValue('2026-06-08');
  await expect(page.locator('#due-date')).toHaveValue('2027-03-15');
  await page.locator('#due-date').fill('2027-03-22');
  await page.reload();
  await expect(page.locator('#lmp')).toHaveValue('2026-06-15');
  await rotateWheel(page, 7);
  await page.reload();
  await expect(page.locator('#lmp')).toHaveValue('2026-06-22');
  await expect(page.locator('#due-date')).toHaveValue('2027-03-29');
  await page.getByRole('button', { name: 'Prova un esempio' }).click();
  await page.reload();
  await expect(page.locator('#lmp')).toHaveValue('2026-06-22');
  await page.getByRole('button', { name: 'Cancella', exact: true }).click();
  expect(await page.evaluate(() => localStorage.getItem('ruotagyn.dates.v1'))).toBeNull();
  await page.reload();
  await expect(page.getByText('Stai esplorando un esempio.')).toBeVisible();
});

test('dati corrotti ed errori del localStorage sono segnalati senza bloccare la ruota', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('ruotagyn.dates.v1', '{'));
  await page.goto('/');
  await expect(page.getByRole('alert')).toContainText('date salvate non sono valide');
  await page.locator('#lmp').fill('2026-06-08');
  await expect(page.getByText('Le date salvate non sono valide', { exact: false })).toHaveCount(0);
  await page.evaluate(() => {
    Storage.prototype.setItem = () => { throw new DOMException('Blocked', 'QuotaExceededError'); };
    Storage.prototype.removeItem = () => { throw new DOMException('Blocked', 'SecurityError'); };
  });
  await page.locator('#lmp').fill('2026-06-15');
  await expect(page.getByRole('alert')).toContainText('Salvataggio sul dispositivo non riuscito');
  await expect(page.locator('app-wheel')).toBeVisible();
  await page.getByRole('button', { name: 'Cancella', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Impossibile eliminare');
});
