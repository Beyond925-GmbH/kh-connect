import { expect, test, type Page } from '@playwright/test'

type Beruf = 'dachdecker' | 'zimmerer' | 'zerspanungsmechaniker' | 'anlagenmechaniker'

async function oeffneStep(page: Page, beruf: Beruf, step: string) {
  await page.addInitScript(
    ({ berufId, stepId }) => {
      localStorage.setItem('khpl-analytik', 'anonym')
      localStorage.setItem(
        'khpl-progress',
        JSON.stringify({
          version: 3,
          bildschirm: 'step',
          angesehenerBeruf: null,
          aktiverBeruf: berufId,
          berufe: {
            [berufId]: {
              currentStepId: stepId,
              visited: [stepId],
              hoechsterStep: stepId,
              branchesTaken: [],
              answers: {},
              detourReturnTo: null,
            },
          },
          helm: null,
          gefragt: {},
          gelernteGesten: ['tippen', 'ziehen-regler', 'drehen', 'ziehen-frei'],
          updatedAt: Date.now(),
        }),
      )
    },
    { berufId: beruf, stepId: step },
  )
  await page.goto('/')
  await expect(page.getByTestId('step')).toHaveAttribute('data-step', step)
}

test('Z1 hält die Genauigkeitsskala im Querformat vollständig neben der Karte frei', async ({
  page,
}) => {
  await oeffneStep(page, 'zerspanungsmechaniker', 'Z1')

  const karte = await page.getByTestId('karte').boundingBox()
  const skala = await page
    .getByTestId('massstab-buehne')
    .locator(':scope > div')
    .boundingBox()
  expect(karte).not.toBeNull()
  expect(skala).not.toBeNull()
  expect(skala!.x).toBeGreaterThanOrEqual(karte!.x + karte!.width + 16)
})

test('A3 zeigt auf dem Smartphone an, dass weitere Antworten nach unten folgen', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await oeffneStep(page, 'anlagenmechaniker', 'A3')

  await expect(page.getByTestId('scroll-hinweis')).toBeVisible()
  await expect(page.getByTestId('scroll-hinweis')).toContainText('wischen')

  const scrollFlaeche = page.getByTestId('karte').locator('[data-scroll]')
  await scrollFlaeche.evaluate((element) => {
    element.scrollTop = element.scrollHeight
    element.dispatchEvent(new Event('scroll'))
  })
  await expect(page.getByTestId('scroll-hinweis')).toBeHidden()
})

test('die helle Dachstuhl-Demo verwendet dunkle Metadaten auf der hellen Bühne', async ({
  page,
}) => {
  await page.goto('/?demo=dachstuhl&theme=hell&t=1&ansicht=front')
  await expect(page.locator('html')).toHaveAttribute('data-bereit', 'true')

  const farbe = await page
    .getByText('Dachstuhl · Beweis-Prototyp')
    .evaluate((element) => getComputedStyle(element).color)
  expect(farbe).toBe('rgb(38, 34, 28)')
})
