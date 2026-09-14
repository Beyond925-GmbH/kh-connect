import { expect, test, type Page } from '@playwright/test'

type QuellenPruefung = {
  quelle: AudioScheduledSourceNode
  start: number
  stop: number
  beendet: boolean
}
type AudioPruefung = Window & {
  __radioAudio: {
    kontexte: AudioContext[]
    master: GainNode[]
    quellen: QuellenPruefung[]
  }
}

async function radio(page: Page) {
  await page.addInitScript(() => {
    const Original = window.AudioContext
    const pruefung = {
      kontexte: [] as AudioContext[],
      master: [] as GainNode[],
      quellen: [] as QuellenPruefung[],
    }
    const beobachte = <T extends AudioScheduledSourceNode>(quelle: T): T => {
      const stand: QuellenPruefung = {
        quelle,
        start: Infinity,
        stop: Infinity,
        beendet: false,
      }
      pruefung.quellen.push(stand)
      const start = quelle.start.bind(quelle)
      const stop = quelle.stop.bind(quelle)
      quelle.start = (zeit = 0) => {
        stand.start = zeit
        start(zeit)
      }
      quelle.stop = (zeit = 0) => {
        stand.stop = zeit
        stop(zeit)
      }
      quelle.addEventListener(
        'ended',
        () => {
          stand.beendet = true
        },
        { once: true },
      )
      return quelle
    }
    ;(window as AudioPruefung).__radioAudio = pruefung
    window.AudioContext = class extends Original {
      constructor(options?: AudioContextOptions) {
        super(options)
        pruefung.kontexte.push(this)
      }
      override createOscillator() {
        return beobachte(super.createOscillator())
      }
      override createBufferSource() {
        return beobachte(super.createBufferSource())
      }
      override createGain() {
        const pegel = super.createGain()
        const connect = pegel.connect.bind(pegel)
        pegel.connect = ((
          ziel: AudioNode | AudioParam,
          ausgang?: number,
          eingang?: number,
        ) => {
          if (ziel === this.destination) pruefung.master.push(pegel)
          if (ziel instanceof AudioParam) return connect(ziel, ausgang)
          return connect(ziel, ausgang, eingang)
        }) as GainNode['connect']
        return pegel
      }
    }
  })
  await page.goto('/')
  await page.getByTestId('splash').click({ position: { x: 20, y: 20 } })
  await page.getByTestId('helm-ueberspringen').click()
  await expect(page.getByRole('heading', { name: 'Was läuft bei dir?' })).toBeVisible()
}

const audio = (page: Page) =>
  page.evaluate(() => {
    const pruefung = (window as AudioPruefung).__radioAudio
    return {
      kontexte: pruefung.kontexte.map((kontext) => kontext.state),
      pegel: pruefung.master.at(-1)?.gain.value ?? null,
    }
  })

for (const viewport of [
  { width: 1024, height: 768 },
  { width: 390, height: 844 },
]) {
  test(`Radio ${viewport.width}: Senderwahl startet Musik, Senderwechsel verwendet denselben Kontext`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport)
    await radio(page)
    expect((await audio(page)).kontexte).toHaveLength(0)
    await expect(page.getByTestId('radio-ueberspringen')).toBeInViewport()
    await page.getByTestId('antwort-rock').click()
    await expect(page.getByTestId('radio-frequenz')).toHaveText('101,8')
    await expect(page.getByTestId('radio-musik-umschalten')).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await expect.poll(async () => (await audio(page)).kontexte).toEqual(['running'])
    expect((await audio(page)).pegel).toBeGreaterThan(0)
    const band = await page.getByTestId('radio-band').boundingBox()
    await page.mouse.move(band!.x + band!.width * 0.55, band!.y + 70)
    await page.mouse.down()
    await page.mouse.move(band!.x + band!.width * 0.3, band!.y + 70)
    await page.mouse.up()
    await page.getByTestId('antwort-schlager').click()
    await expect(page.getByTestId('radio-frequenz')).toHaveText('106,0')
    await expect(page.getByTestId('musik-oeffnen')).toHaveAttribute(
      'aria-label',
      /Musik an: Schlager/,
    )
    await expect(page.getByTestId('radio-weiter')).toBeInViewport()
    expect((await audio(page)).kontexte).toEqual(['running'])
    await page.evaluate(
      () =>
        new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        ),
    )
    await page.screenshot({ path: `/tmp/connect-radio-${viewport.width}.png` })
  })
}

test('Radio überspringen bleibt ohne Ton und speichert eine neutrale Antwort', async ({
  page,
}) => {
  await radio(page)
  await page.getByTestId('radio-ueberspringen').click()
  await expect(page.getByRole('heading', { name: 'Wo wärst du gern?' })).toBeVisible()
  expect((await audio(page)).kontexte).toHaveLength(0)
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem('khpl-progress')!).gefragt.musik,
    ),
  ).toBe('offen')
})

test('Musik wird über beide Bildfragen leiser, pausiert bei Berufen und lässt sich mit voller Lautstärke fortsetzen', async ({
  page,
}) => {
  await radio(page)
  await page.getByTestId('antwort-rock').click()
  await expect.poll(async () => (await audio(page)).kontexte).toEqual(['running'])
  const vollerPegel = (await audio(page)).pegel!
  expect(vollerPegel).toBeGreaterThan(0)
  await page.getByTestId('radio-weiter').click()
  await expect(page.getByRole('heading', { name: 'Wo wärst du gern?' })).toBeVisible()
  await expect
    .poll(async () => (await audio(page)).pegel! / vollerPegel)
    .toBeCloseTo(0.6, 2)
  expect((await audio(page)).kontexte).toEqual(['running'])
  await page.getByTestId('antwort-offen').click()
  await expect(
    page.getByRole('heading', { name: 'Was würdest du ausprobieren?' }),
  ).toBeVisible()
  await expect
    .poll(async () => (await audio(page)).pegel! / vollerPegel)
    .toBeCloseTo(0.2, 2)
  expect((await audio(page)).kontexte).toEqual(['running'])
  await page.getByTestId('antwort-offen').click()
  await expect(page.getByTestId('berufsliste')).toBeVisible()
  await expect(page.getByTestId('musik-oeffnen')).toHaveAttribute(
    'aria-label',
    /Musik aus/,
  )
  await expect
    .poll(async () =>
      (await audio(page)).kontexte.every((zustand) => zustand !== 'running'),
    )
    .toBe(true)
  await page.getByTestId('musik-direkt-umschalten').click()
  await expect(page.getByTestId('musik-oeffnen')).toHaveAttribute(
    'aria-label',
    /Musik an: Rock/,
  )
  await expect
    .poll(async () => (await audio(page)).pegel! / vollerPegel)
    .toBeCloseTo(1, 2)
  await expect
    .poll(
      async () =>
        (await audio(page)).kontexte.filter((zustand) => zustand === 'running').length,
    )
    .toBe(1)
  await page.getByTestId('beruf-dachdecker').click()
  await page.getByTestId('auftrag-annehmen').click()
  await expect(page.getByTestId('step')).toHaveAttribute('data-step', 'M1')
  await expect(page.getByTestId('musik-oeffnen')).toHaveAttribute(
    'aria-label',
    /Musik an: Rock/,
  )
  expect((await audio(page)).pegel! / vollerPegel).toBeCloseTo(1, 2)
  await page.getByTestId('zurueck-zu-berufen').click()
  await page.getByTestId('neustart').click()
  await page.getByTestId('neustart-ja').click()
  await expect(page.getByTestId('splash')).toBeVisible()
  await expect
    .poll(async () =>
      (await audio(page)).kontexte.every((zustand) => zustand !== 'running'),
    )
    .toBe(true)
})

test('Globale Steuerung stimmt das Frequenzband ab; erneute Senderwahl startet nach Ausschalten wieder Musik', async ({
  page,
}) => {
  await radio(page)
  await expect(page.getByTestId('radio-frequenz')).toHaveText('95,4')
  await page.getByTestId('musik-direkt-umschalten').click()
  await expect(page.getByTestId('radio-frequenz')).toHaveText('93,2')
  await expect(page.getByTestId('radio-musik-umschalten')).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  await page.getByTestId('musik-oeffnen').click()
  await page.getByTestId('musik-stil-techno').click()
  await page.getByRole('button', { name: 'Schließen', exact: true }).click()
  await expect(page.getByTestId('radio-frequenz')).toHaveText('97,6')
  await page.getByTestId('radio-musik-umschalten').click()
  await expect(page.getByTestId('musik-oeffnen')).toHaveAttribute(
    'aria-label',
    /Musik aus/,
  )
  await page.getByTestId('antwort-techno').click()
  await expect(page.getByTestId('radio-musik-umschalten')).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  await expect
    .poll(
      async () =>
        (await audio(page)).kontexte.filter((zustand) => zustand === 'running').length,
    )
    .toBe(1)
})

test('Senderwechsel beendet auch vorausgeplante Töne des alten Senders', async ({
  page,
}) => {
  await radio(page)
  await page.getByTestId('antwort-hiphop').click()
  // Der langsame Hip-Hop-Takt enthält bereits Töne, die erst später starten sollen.
  await expect
    .poll(() =>
      page.evaluate(() => {
        const p = (window as AudioPruefung).__radioAudio
        return p.quellen.filter((q) => q.start > q.quelle.context.currentTime + 1).length
      }),
    )
    .toBeGreaterThan(0)
  const alteQuellen = await page.evaluate(() => {
    const p = (window as AudioPruefung).__radioAudio
    return p.quellen.flatMap((q, index) =>
      q.start > q.quelle.context.currentTime + 1 ? [index] : [],
    )
  })
  expect(alteQuellen.length).toBeGreaterThan(0)
  await page.getByTestId('antwort-rock').click()
  await expect(page.getByTestId('musik-oeffnen')).toHaveAttribute(
    'aria-label',
    /Musik an: Rock/,
  )
  // Eine Stop-Anforderung vor der geplanten Startzeit verhindert auch zukünftige Töne.
  expect(
    await page.evaluate((indizes) => {
      const p = (window as AudioPruefung).__radioAudio
      return indizes.every((index) => p.quellen[index].stop < p.quellen[index].start)
    }, alteQuellen),
  ).toBe(true)
  await expect
    .poll(() =>
      page.evaluate((indizes) => {
        const p = (window as AudioPruefung).__radioAudio
        return indizes.every((index) => p.quellen[index].beendet)
      }, alteQuellen),
    )
    .toBe(true)
  expect((await audio(page)).kontexte).toEqual(['running'])
})
