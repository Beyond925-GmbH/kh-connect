import { test, expect, type Page } from '@playwright/test'

test.use({ viewport: { width: 1024, height: 768 }, reducedMotion: 'reduce' })

async function starteZimmerer(page: Page, step = 'C1') {
  await page.addInitScript((ziel) => {
    if (localStorage.getItem('khpl-progress')) return
    localStorage.setItem(
      'khpl-progress',
      JSON.stringify({
        version: 3,
        bildschirm: 'step',
        aktiverBeruf: 'zimmerer',
        angesehenerBeruf: null,
        helm: null,
        gefragt: {},
        gelernteGesten: ['drehen', 'ziehen-regler', 'tippen'],
        updatedAt: Date.now(),
        berufe: {
          zimmerer: {
            currentStepId: ziel,
            hoechsterStep: ziel,
            visited: [ziel],
            branchesTaken: [],
            answers: {},
            detourReturnTo: null,
          },
        },
      }),
    )
  }, step)
  await page.goto('/')
  await expect(page.locator('[data-buehne="wandelement"]')).toHaveAttribute(
    'data-bereit',
    'true',
  )
}

test('eigenes Holz bleibt nach Neuladen gewählt', async ({ page }) => {
  await starteZimmerer(page)
  await page.getByTestId('c1-holz-warm').click()
  await expect(page.getByTestId('c1-holz-warm')).toHaveAttribute('aria-pressed', 'true')
  await page.screenshot({ path: '/tmp/zimmerer-c1-desktop.png' })
  await page.reload()
  await expect(page.getByTestId('c1-holz-warm')).toHaveAttribute('aria-pressed', 'true')
  const gespeichert = await page.evaluate(
    () => JSON.parse(localStorage.getItem('khpl-progress')!).berufe.zimmerer.answers.c1,
  )
  expect(gespeichert.holzId).toBe('warm')
})

test('Plattenpassprobe verlangt eine passende Position und bietet Hilfe', async ({
  page,
}) => {
  await starteZimmerer(page, 'C2')
  await page.screenshot({ path: '/tmp/zimmerer-c2-desktop.png' })
  await page.getByTestId('c2-aufloesen').click()
  await expect(page.getByRole('status').filter({ hasText: 'Noch etwas' })).toBeVisible()
  await page.getByTestId('c2-aufloesen').click()
  await page.getByTestId('c2-hilfe').click()
  await page.getByTestId('c2-aufloesen').click()
  await expect(page.getByRole('status').filter({ hasText: 'Passt.' })).toBeVisible()
})

test('Wand selbst bauen, erkunden, Ansicht zurücksetzen und neu bauen', async ({
  page,
}) => {
  const fehler: string[] = []
  page.on('pageerror', (e) => fehler.push(e.message))
  await starteZimmerer(page, 'C3')
  await page.screenshot({ path: '/tmp/zimmerer-c3-game.png' })
  await page.getByTestId('c3-material-fassade').click()
  await expect(
    page.getByRole('status').filter({ hasText: 'Beginne auf der Zimmerseite' }),
  ).toBeVisible()
  for (const id of ['innen', 'dampfbremse', 'daemmung', 'holzfaser', 'fassade'])
    await page.getByTestId(`c3-material-${id}`).click()
  await expect(page.getByTestId('c3-neu-bauen')).toBeVisible()
  await page.getByTestId('c3-erkunden').click()
  await page.getByRole('button', { name: 'Fassade', exact: true }).click()
  await expect(
    page.getByRole('status').filter({ hasText: 'Außenbekleidung:' }),
  ).toBeVisible()
  await page.getByLabel('Ansicht drehen').fill('35')
  await page.screenshot({ path: '/tmp/zimmerer-c3-exploded.png' })
  await page.getByRole('button', { name: 'Ansicht zurücksetzen' }).click()
  await expect(page.getByLabel('Ansicht drehen')).toHaveValue('0')
  await expect(page.getByLabel('Schichten auseinanderziehen')).toHaveValue('0')
  await page.mouse.click(800, 350)
  await expect(
    page.getByRole('status').filter({ hasText: 'Außenbekleidung:' }),
  ).toBeVisible()
  await page.screenshot({ path: '/tmp/zimmerer-c3-desktop.png' })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.screenshot({ path: '/tmp/zimmerer-c3-mobile.png' })
  await page.getByTestId('c3-erkunden').click()
  await page.getByTestId('c3-neu-bauen').click()
  await expect(page.getByTestId('c3-material-innen')).toBeEnabled()
  expect(fehler).toEqual([])
})

test('Abschluss zählt nur ausgeführte Tätigkeiten', async ({ page }) => {
  await starteZimmerer(page)
  await page.getByTestId('c1-holz-dunkel').click()
  for (let i = 0; i < 5; i++) await page.getByTestId('weiter').click()
  await expect(page.getByTestId('c9-rueckblick')).toContainText('Dein Holz gewählt')
  await expect(page.getByTestId('c9-rueckblick')).not.toContainText('Fünf Schichten')
  await page.getByTestId('c9-noch-einen').click()
  await expect(page.getByTestId('c9-rueckblick')).not.toBeVisible()
})

test('mobil bleiben alle fünf Materialien, Hilfe und Erkundung im sichtbaren Bereich', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await starteZimmerer(page, 'C3')
  const weiter = await page.getByTestId('weiter').boundingBox()
  for (const id of ['innen', 'dampfbremse', 'daemmung', 'holzfaser', 'fassade']) {
    const box = await page.getByTestId(`c3-material-${id}`).boundingBox()
    expect(box!.height).toBeGreaterThanOrEqual(44)
    expect(box!.y + box!.height).toBeLessThan(weiter!.y)
  }
  const erkunden = await page.getByTestId('c3-erkunden').boundingBox()
  expect(erkunden!.y + erkunden!.height).toBeLessThan(weiter!.y)
  await page.getByTestId('c3-material-fassade').click()
  await expect(
    page.getByRole('status').filter({ hasText: 'Beginne auf der Zimmerseite' }),
  ).toBeInViewport()
  for (const id of ['innen', 'dampfbremse', 'daemmung', 'holzfaser', 'fassade'])
    await page.getByTestId(`c3-material-${id}`).click()
  await page.getByTestId('c3-erkunden').click()
  await page.getByLabel('Schicht ansehen').selectOption('fassade')
  await expect(
    page.getByRole('status').filter({ hasText: 'Außenbekleidung:' }),
  ).toBeInViewport()
  await expect(
    page.getByRole('button', { name: 'Ansicht zurücksetzen' }),
  ).toBeInViewport()
  await page.screenshot({ path: '/tmp/zimmerer-C3-mobile-explore-final.png' })
})
