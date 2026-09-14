import { expect, test } from '@playwright/test'

async function starte(page: import('@playwright/test').Page) {
  await page.goto('/')
  await page.getByTestId('splash').click({ position: { x: 20, y: 20 } })
  await expect(
    page.getByRole('heading', { name: 'Deine Ausrüstung', exact: true }),
  ).toBeVisible()
}

test('Ausrüstung und Radio sind optional; neutrale Antworten ergeben keinen Vorschlag', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await starte(page)
  await page.getByTestId('helm-ueberspringen').click()
  await page.getByTestId('radio-ueberspringen').click()
  await expect(page.getByRole('heading', { name: 'Wo wärst du gern?' })).toBeVisible()
  await page.getByTestId('antwort-offen').click()
  await expect(
    page.getByRole('heading', { name: 'Was würdest du ausprobieren?' }),
  ).toBeVisible()
  await page.reload()
  await expect(
    page.getByRole('heading', { name: 'Was würdest du ausprobieren?' }),
  ).toBeVisible()
  await page.getByTestId('antwort-offen').click()
  await expect(page.getByTestId('berufsliste')).toBeVisible()
  await expect(page.getByText('Unser Vorschlag', { exact: true })).toHaveCount(0)
  for (const beruf of [
    'zimmerer',
    'dachdecker',
    'zerspanungsmechaniker',
    'anlagenmechaniker',
  ]) {
    await expect(page.getByTestId(`beruf-${beruf}`)).toBeVisible()
  }
  await page.getByTestId('beruf-dachdecker').click()
  await expect(page.getByTestId('auftrag-annehmen')).toBeInViewport()
  await expect
    .poll(async () => {
      const musik = await page.getByTestId('sitzungsmusik').boundingBox()
      const zurueck = await page.getByTestId('zurueck-zur-liste').boundingBox()
      return musik!.y - (zurueck!.y + zurueck!.height)
    })
    .toBeGreaterThanOrEqual(0)
})

test('Helm und Werkzeug bleiben erhalten; Berufe zeigen keine Mannequins', async ({
  page,
}) => {
  await starte(page)
  await page.getByTestId('helm-farbe-blau').click()
  await expect(page.getByTestId('helm-farbe-blau')).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  await page.getByTestId('werkzeug-tablet').click()
  await page.getByTestId('helm-weiter').click()
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Was läuft bei dir?' })).toBeVisible()
  const helm = await page.evaluate(
    () => JSON.parse(localStorage.getItem('khpl-progress')!).helm,
  )
  expect(helm).toEqual({ farbe: 'blau', werkzeug: 'tablet' })
  await page.getByTestId('radio-ueberspringen').click()
  await page.getByTestId('antwort-offen').click()
  await expect(
    page.getByRole('heading', { name: 'Was würdest du ausprobieren?' }),
  ).toBeVisible()
  await page.getByTestId('antwort-maschine').click()
  await expect(page.getByTestId('berufsliste')).toBeVisible()
  await expect(page.getByText('Unser Vorschlag', { exact: true })).toBeVisible()
  await page.getByTestId('beruf-zerspanungsmechaniker').click()
  await expect(page.locator('[data-figur]')).toHaveCount(0)
  await page.getByTestId('auftrag-annehmen').click()
  await expect(page.getByTestId('step')).toHaveAttribute('data-step', 'Z2')
  await expect(page.locator('[data-figur]')).toHaveCount(0)
})

test('Musik pausiert nach dem Einstieg; bewusst fortgesetzte Musik bleibt im Beruf an und wird beim Neustart beendet', async ({
  page,
}) => {
  await starte(page)
  await page.getByTestId('helm-ueberspringen').click()
  await page.getByTestId('antwort-rock').click()
  await expect(page.getByTestId('musik-oeffnen')).toHaveAttribute(
    'aria-label',
    /Musik an: Rock/,
  )
  await page.getByTestId('radio-weiter').click()
  await page.getByTestId('antwort-offen').click()
  await expect(
    page.getByRole('heading', { name: 'Was würdest du ausprobieren?' }),
  ).toBeVisible()
  await page.getByTestId('antwort-offen').click()
  await expect(page.getByTestId('berufsliste')).toBeVisible()
  await expect(page.getByTestId('musik-oeffnen')).toHaveAttribute(
    'aria-label',
    /Musik aus/,
  )
  await page.getByTestId('musik-direkt-umschalten').click()
  await expect(page.getByTestId('musik-oeffnen')).toHaveAttribute(
    'aria-label',
    /Musik an: Rock/,
  )
  await page.getByTestId('beruf-dachdecker').click()
  await page.getByTestId('auftrag-annehmen').click()
  await expect(page.getByTestId('step')).toHaveAttribute('data-step', 'M1')
  await page.getByTestId('weiter').click()
  const ansage = page.getByTestId('ansage')
  if (await ansage.isVisible()) await ansage.getByRole('button').last().click()
  await expect(page.getByTestId('step')).toHaveAttribute('data-step', 'M4')
  await expect(page.getByTestId('musik-oeffnen')).toHaveAttribute(
    'aria-label',
    /Musik an: Rock/,
  )
  await page.getByTestId('zurueck-zu-berufen').click()
  await page.getByTestId('neustart').click()
  await page.getByTestId('neustart-ja').click()
  await expect(page.getByTestId('splash')).toBeVisible()
  await page.getByTestId('musik-oeffnen').click()
  await expect(page.getByTestId('musik-umschalten')).toHaveText('Musik an')
  await expect(page.getByTestId('musik-stil-pop')).toHaveAttribute('aria-pressed', 'true')
})
