import { expect, test, type Page } from '@playwright/test'

async function spiel(page: Page, beruf: string, step: string, answers = {}) {
  await page.addInitScript(
    ({ beruf, step, answers }) => {
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
              answers,
              detourReturnTo: null,
            },
          },
          helm: null,
          gefragt: {},
          gelernteGesten: ['ziehen-regler', 'ziehen-frei', 'ziehen-karte'],
          updatedAt: Date.now(),
        }),
      )
    },
    { beruf, step, answers },
  )
  await page.goto('/')
}

async function antwort(page: Page, beruf: string, key: string) {
  return page.evaluate(
    ({ beruf, key }) =>
      JSON.parse(localStorage.getItem('khpl-progress')!).berufe[beruf].answers[key],
    { beruf, key },
  )
}

const Z = 'zerspanungsmechaniker'
const A = 'anlagenmechaniker'

test('Z2 gibt nach dem ersten Fehlgriff konkrete Bildhilfe und speichert erst die passende Halterung', async ({
  page,
}) => {
  await spiel(page, Z, 'Z2')
  await page.getByTestId('z2-spannmittel-schraubstock').click()
  await expect(page.getByText('Tipp: Suche drei Backen', { exact: false })).toBeVisible()
  expect((await antwort(page, Z, 'z2')).gespannt).toBe(false)
  await page.getByTestId('z2-spannmittel-futter').click()
  await expect(page.getByText('Stange eingespannt', { exact: true })).toBeVisible()
  expect((await antwort(page, Z, 'z2')).gespannt).toBe(true)
})

test('Z3 erfordert alle drei richtigen Bewegungen, ein falscher Befehl bewegt nicht weiter', async ({
  page,
}) => {
  await spiel(page, Z, 'Z3')
  await expect(page.getByTestId('z3-platz-0')).toHaveAttribute('aria-current', 'step')
  await page.getByTestId('z3-befehl-1').click()
  await expect(
    page.getByText('Fahre zuerst an das Metall', { exact: false }),
  ).toBeVisible()
  expect((await antwort(page, Z, 'z3')).gesehen).toEqual([])
  await expect(page.getByTestId('z3-platz-0')).toHaveAttribute('aria-current', 'step')
  for (const [i, bewegung] of ['Heranfahren', 'Schneiden', 'Wegfahren'].entries()) {
    await page.getByTestId(`z3-befehl-${i}`).click()
    await expect(page.getByTestId(`z3-platz-${i}`)).toContainText(bewegung)
    if (i < 2)
      await expect(page.getByTestId(`z3-platz-${i + 1}`)).toHaveAttribute(
        'aria-current',
        'step',
      )
  }
  await expect(page.getByText('Werkzeugweg gesteuert', { exact: true })).toBeVisible()
  expect((await antwort(page, Z, 'z3')).gefunden).toBe(true)
})

test('Z4 zeigt nach zu viel Abtrag ein neues Rohteil und hilft nach dem ersten Fehler', async ({
  page,
}) => {
  await spiel(page, Z, 'Z4')
  const regler = page.getByTestId('z4-abtrag')
  await regler.focus()
  await regler.press('End')
  await page.getByTestId('z4-nachdrehen').click()
  await expect(page.getByText('Zu viel abgetragen.', { exact: false })).toBeVisible()
  await expect(regler).toHaveValue('0')
  await page.getByTestId('z4-zeig-mir-wie').click()
  await page.getByTestId('z4-nachdrehen').click()
  await expect(page.getByText('Teil passt', { exact: true })).toBeVisible()
  expect((await antwort(page, Z, 'z4')).freigegeben).toBe(true)
})

test('Z6 ist sofort aktiv, braucht die Korrektur und wird erst nach drei Proben fertig', async ({
  page,
}) => {
  await spiel(page, Z, 'Z6')
  await page.getByTestId('z6-nachstellen').click()
  await expect(
    page.getByText('Der Strich steht im grünen Bereich.', { exact: false }),
  ).toBeVisible()
  await page.getByTestId('z6-laufen-lassen').click()
  await expect(page.getByText('Probe 2 von 3', { exact: false })).toBeVisible()
  await page.getByTestId('z6-laufen-lassen').click()
  await expect(page.getByText('Das Teil ist zu dick.', { exact: false })).toBeVisible()
  expect((await antwort(page, Z, 'z6')).stabil).toBe(false)
  await page.getByTestId('z6-nachstellen').click()
  await page.getByTestId('z6-laufen-lassen').click()
  await expect(page.getByText('Serie kontrolliert', { exact: true })).toBeVisible()
  expect((await antwort(page, Z, 'z6')).stabil).toBe(true)
})

test('A1 erlaubt alle sechs Prüfungen und zeigt vor der Diagnose beide entscheidenden Befunde', async ({
  page,
}) => {
  await spiel(page, A, 'A1')
  for (const id of [
    'kessel',
    'speicher',
    'regelung',
    'ladepumpe',
    'zirkulation',
    'mischer',
  ]) {
    await page.getByTestId(`a1-pruefung-${id}`).click()
  }
  expect((await antwort(page, A, 'a1')).geprueft).toHaveLength(6)
  await page.getByTestId('a1-entscheiden').click()
  await expect(page.getByText('Wasser im Speicher', { exact: true })).toBeVisible()
  await expect(page.getByText('Anzeige behauptet', { exact: true })).toBeVisible()
  await page.getByTestId('a1-ursache-pumpe').click()
  await expect(
    page.getByText('Wähle den Temperaturfühler', { exact: false }),
  ).toBeVisible()
  await page.getByTestId('a1-ursache-fuehler').click()
  await expect(page.getByText('Störung gefunden', { exact: true })).toBeVisible()
})

test('A2 wertet sechs eindeutige Fälle, wechselt automatisch und bietet bis zum Ende Überspringen', async ({
  page,
}) => {
  await spiel(page, A, 'A2')
  await page.getByTestId('a2-vlies').click()
  await page.getByTestId('a2-bleibt-kessel').click()
  await expect(page.getByTestId('a2-rueckmeldung')).toContainText(
    'Falsch: Das kommt raus.',
  )
  expect(
    await page.getByTestId('a2-rueckmeldung').evaluate((el) => {
      const rect = el.getBoundingClientRect()
      const visible = el.closest('[data-scroll]')!.getBoundingClientRect()
      return rect.top >= visible.top && rect.bottom <= visible.bottom
    }),
  ).toBe(true)
  await expect(page.getByTestId('weiter')).toHaveText(/Überspringen/)
  await expect(page.getByTestId('a2-raus-tank')).toBeEnabled()
  for (const [id, los] of [
    ['tank', 'raus'],
    ['verteiler', 'bleibt'],
    ['pumpe', 'raus'],
    ['ausdehnungsgefaess', 'bleibt'],
    ['thermostatventile', 'bleibt'],
  ]) {
    await page.getByTestId(`a2-${los}-${id}`).click()
    await expect(page.getByTestId('a2-rueckmeldung')).toContainText('Richtig')
  }
  await expect(
    page.getByText('Alle sechs Teile sortiert.', { exact: true }),
  ).toBeVisible()
  expect((await antwort(page, A, 'a2')).angetippt).toHaveLength(7)
})

test('A2 erlaubt langsames Lesen ohne automatischen Wechsel', async ({ page }) => {
  await spiel(page, A, 'A2')
  await page.getByTestId('a2-vlies').click()
  await page.getByLabel('Automatisch zum nächsten Teil').uncheck()
  await page.getByTestId('a2-raus-kessel').click()
  await page.waitForTimeout(1100)
  await expect(page.getByTestId('a2-karte-kessel')).toBeVisible()
  await page.getByTestId('a2-naechstes').click()
  await expect(page.getByTestId('a2-raus-tank')).toBeEnabled()
})

test('A6 hilft nach einem Fehler; A7 zählt eine gelungene zweite Antwort', async ({
  page,
}) => {
  await spiel(page, A, 'A6')
  await page.getByTestId('a6-starten').click()
  await expect(
    page.getByText('Schiebe den Regler nach rechts', { exact: false }),
  ).toBeVisible()
  await page.getByTestId('a6-zeig-mir-wie').click()
  await page.getByTestId('a6-starten').click()
  await expect(page.getByText('In Betrieb', { exact: true })).toBeVisible()
  await page.getByTestId('weiter').click()
  await page.getByTestId('a7-antwort-anleitung').click()
  await expect(
    page.getByText('Gib ihr einen konkreten nächsten Schritt', { exact: false }),
  ).toBeVisible()
  await page.getByTestId('a7-antwort-anrufen').click()
  expect((await antwort(page, A, 'a7')).gut).toBe(1)
})

test('Abschluss behauptet keine erledigten Aufgaben, wenn alles übersprungen wurde', async ({
  page,
}) => {
  await spiel(page, Z, 'Z9')
  await expect(
    page.getByText('Du kannst die Spiele jederzeit ausprobieren', { exact: false }),
  ).toBeVisible()
  await expect(page.getByText('Das hast du ausprobiert')).toHaveCount(0)
  await page.getByTestId('z9-karriere').click()
  await expect(page.getByText('Industriemeister Metall', { exact: true })).toBeVisible()
})
