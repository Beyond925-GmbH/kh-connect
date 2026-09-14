import { test, expect, type Page } from '@playwright/test'

const routes = {
  zimmerer: ['C1', 'C2', 'C3', 'C4', 'C6', 'C9'],
  dachdecker: ['M1', 'M4', 'B4.1', 'M5', 'M7', 'M10'],
  zerspanungsmechaniker: ['Z2', 'Z3', 'Z4', 'Z6', 'Z9'],
  anlagenmechaniker: ['A1', 'A2', 'A4', 'A6', 'A7', 'A9'],
}

async function seed(page: Page, beruf: string, step: string) {
  await page.addInitScript(
    ({ beruf, step }) => {
      localStorage.setItem(
        'khpl-progress',
        JSON.stringify({
          version: 3,
          bildschirm: 'step',
          angesehenerBeruf: null,
          aktiverBeruf: beruf,
          berufe: {
            [beruf]: {
              currentStepId: step,
              visited: [step],
              hoechsterStep: step,
              branchesTaken: [],
              answers: {},
              detourReturnTo: null,
            },
          },
          helm: { figurId: 'kurz', farbe: 'weiss', werkzeug: '' },
          gefragt: { umgebung: 'offen', taetigkeit: 'offen' },
          gelernteGesten: [
            'ziehen-frei',
            'ziehen-ziel',
            'wischen',
            'drehen',
            'regeln',
            'kippen',
          ],
          updatedAt: Date.now(),
        }),
      )
    },
    { beruf, step },
  )
  await page.goto('/')
  const ohne = page.getByRole('button', { name: /Ohne|Ablehnen|Nur notwendige/ }).first()
  if (await ohne.isVisible().catch(() => false)) await ohne.click()
}

async function dismissInstruction(page: Page) {
  const ansage = page.getByTestId('ansage')
  if (await ansage.isVisible().catch(() => false)) {
    await ansage.getByRole('button').last().click()
  }
}

for (const [beruf, steps] of Object.entries(routes)) {
  test(`${beruf}: kurze Route, direkter Berufswechsel und kein falscher Abschluss`, async ({
    page,
  }) => {
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(e.message))
    await seed(page, beruf, steps[0])
    for (const step of steps) {
      await expect(page.getByTestId('step')).toHaveAttribute('data-step', step)
      await dismissInstruction(page)
      await expect(page.getByTestId('zurueck-zu-berufen')).toBeVisible()
      const isLast = step === steps.at(-1)
      if (!isLast) await page.getByTestId('weiter').click()
    }
    await expect(page.getByTestId('geschafft')).toHaveCount(0)
    expect(errors).toEqual([])
    await page.getByTestId('zurueck-zu-berufen').click()
    await expect(page.getByTestId('berufsliste')).toBeVisible()
    await page.getByTestId(`beruf-${beruf}`).click()
    await expect(page.getByTestId('step')).toHaveAttribute('data-step', steps.at(-1)!)
  })
}

test('Dachaufbau: falsche Wahl baut nichts, eigener Aufbau bleibt beim Wechsel erhalten', async ({
  page,
}) => {
  await seed(page, 'dachdecker', 'M5')
  await page.getByTestId('m5-teil-Fußpfetten').waitFor()
  const falsch = page
    .locator('[data-testid^="m5-teil-"]')
    .filter({ hasNotText: 'Balken auf der Mauer' })
    .first()
  await falsch.click()
  await expect(page.getByRole('status')).toContainText('Beginne unten')
  await expect(page.getByText('0 von 7 Bauteilen gesetzt')).toBeVisible()
  await page.getByTestId('m5-teil-Fußpfetten').click()
  await expect(page.getByText('1 von 7 Bauteilen gesetzt')).toBeVisible()
  await page.getByTestId('zurueck-zu-berufen').click()
  await page.getByTestId('beruf-dachdecker').click()
  await expect(page.getByText('1 von 7 Bauteilen gesetzt')).toBeVisible()
})

test('Freiwillige Informationen führen zur unveränderten Spielstelle zurück', async ({
  page,
}) => {
  await seed(page, 'dachdecker', 'M1')
  await page.getByTestId('mehr-themen').click()
  await page.getByTestId('abstecher-M2').click()
  await expect(page.getByTestId('step')).toHaveAttribute('data-step', 'M2')
  await dismissInstruction(page)
  await page.getByTestId('zurueck-zum-tag').click()
  await expect(page.getByTestId('step')).toHaveAttribute('data-step', 'M1')
  await expect(page.getByTestId('geschafft')).toHaveCount(0)
})

test('Alte Demo-Abschlüsse werden nicht als gelöste neue Spiele geladen', async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem(
      'khpl-progress',
      JSON.stringify({
        version: 2,
        updatedAt: Date.now(),
        bildschirm: 'step',
        aktiverBeruf: 'zerspanungsmechaniker',
        berufe: {
          zerspanungsmechaniker: {
            currentStepId: 'Z6',
            visited: ['Z6'],
            answers: { z6: { stabil: true, stueck: 154, nachkorrigiert: true } },
          },
        },
      }),
    ),
  )
  await page.goto('/')
  await expect(page.getByTestId('step')).toHaveCount(0)
  await expect(page.getByTestId('splash')).toBeVisible()
})

test('Dachdecker: alle fünf Aufgaben durch eigenes Handeln abschließen', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  await seed(page, 'dachdecker', 'M1')
  for (const id of ['balken', 'kran', 'aufmass'])
    await page.getByTestId(`m1-pruefen-${id}`).click()
  await expect(page.getByTestId('geschafft')).toContainText('Drei Stellen angesehen')
  await page.getByTestId('weiter').click()
  await dismissInstruction(page)
  // Das Maß stammt aus dem sichtbaren Plan, nicht aus einem internen Lösungszustand.
  const zeichnung = await page
    .locator('svg[aria-label^="Zeichnung:"]')
    .getAttribute('aria-label')
  const match = zeichnung!.match(/Länge ([\d,]+) m, Winkel (\d+) Grad/)!
  await page
    .getByRole('slider', { name: 'Schnittposition' })
    .fill(String(Math.round(Number(match[1].replace(',', '.')) * 1000)))
  await page.getByTestId(`m4-winkel-${match[2]}`).click()
  await page.getByTestId('m4-pruefen').click()
  await expect(page.getByTestId('m4-rueckmeldung')).toContainText('Passt')
  await page.getByTestId('weiter').click()
  await dismissInstruction(page)
  await page.getByTestId('b41-ziegel').click()
  await expect(page.getByTestId('b41-fortschritt')).toContainText('0')
  for (const id of ['sparren', 'anker', 'psa', 'werkzeug', 'leiter'])
    await page.getByTestId(`b41-${id}`).click()
  await expect(page.getByTestId('geschafft')).toBeVisible()
  await page.getByTestId('weiter').click()
  for (const teil of [
    'Fußpfetten',
    'Bundbalken',
    'Stuhlschwellen',
    'Stuhlsäulen',
    'Mittelpfetten',
    'Firstpfette',
    'Kopfbänder',
  ])
    await page.getByTestId(`m5-teil-${teil}`).click()
  await expect(page.getByText('Der Unterbau steht.')).toBeVisible()
  await page.getByTestId('weiter').click()
  for (const teil of [
    'Sparrenpaare',
    'Kehlbalken',
    'Windrispenbänder',
    'Konterlattung',
    'Dachlattung',
  ])
    await page.getByTestId(`m7-teil-${teil}`).click()
  await expect(page.getByText('Die Dachkonstruktion steht.')).toBeVisible()
  await page.getByTestId('weiter').click()
  await expect(page.getByTestId('step')).toHaveAttribute('data-step', 'M10')
  await expect(page.getByText('Einen Balken zugeschnitten')).toBeVisible()
  await expect(page.getByText('Den Dachstuhl ergänzt')).toBeVisible()
  expect(errors).toEqual([])
})

for (const width of [1024, 390]) {
  test(`Hauptspiele bei ${width}px: Auftrag, Auswahl und Footer ohne abgeschnittene Bedienung`, async ({
    page,
  }) => {
    test.setTimeout(90_000)
    await page.setViewportSize({ width, height: width === 1024 ? 768 : 844 })
    for (const [beruf, steps] of Object.entries(routes)) {
      for (const step of steps.slice(0, -1)) {
        await seed(page, beruf, step)
        await dismissInstruction(page)
        await page.evaluate(() => document.fonts.ready)
        const scroll = page.locator('[data-scroll]')
        await expect
          .poll(() => scroll.evaluate((el) => el.scrollHeight - el.clientHeight), {
            message: `${step}: alle Bedienelemente müssen ins Panel passen`,
          })
          .toBeLessThanOrEqual(12)
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
          step,
        ).toBeTruthy()
        await expect(page.getByTestId('weiter')).toBeInViewport()
      }
    }
  })
}

test('Mehr erfahren: per Escape schließen und Fokus ans Spiel zurückgeben', async ({
  page,
}) => {
  await seed(page, 'dachdecker', 'M5')
  await page.getByTestId('mehr-themen').click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(
    page.getByText('Baue von unten nach oben.', { exact: false }),
  ).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(page.getByTestId('mehr-themen')).toBeFocused()
  await expect(page.getByTestId('step')).toHaveAttribute('data-step', 'M5')
})

test('Mobile Fehlerhilfe überlappt weder Informationen noch Hauptaktion', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  for (const [beruf, step, pruefen, hilfe] of [
    ['anlagenmechaniker', 'A6', 'a6-starten', 'a6-zeig-mir-wie'],
    ['dachdecker', 'M4', 'm4-pruefen', 'm4-zeig-mir-wie'],
  ]) {
    await seed(page, beruf, step)
    await dismissInstruction(page)
    await page.getByTestId(pruefen).click()
    await expect(page.getByTestId(hilfe)).toBeInViewport()
    await expect
      .poll(() =>
        page.locator('[data-scroll]').evaluate((el) => el.scrollHeight - el.clientHeight),
      )
      .toBeLessThanOrEqual(12)
    const ids = ['mehr-themen', 'weiter', pruefen, hilfe]
    const boxen = await Promise.all(ids.map((id) => page.getByTestId(id).boundingBox()))
    for (let i = 0; i < boxen.length; i++)
      for (let j = i + 1; j < boxen.length; j++) {
        const a = boxen[i]!,
          b = boxen[j]!
        const ueberlappt =
          a.x < b.x + b.width &&
          a.x + a.width > b.x &&
          a.y < b.y + b.height &&
          a.y + a.height > b.y
        expect(ueberlappt, `${step}: ${ids[i]} und ${ids[j]}`).toBeFalsy()
      }
    await page.getByTestId('mehr-themen').click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.keyboard.press('Escape')
  }
})
