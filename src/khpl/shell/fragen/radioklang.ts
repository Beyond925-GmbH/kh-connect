import type { RadioStil } from '@/khpl/match/fragen'

/**
 * Der Klang des Baustellenradios — komplett synthetisiert, keine Dateien.
 *
 * **Warum Synthese statt Aufnahmen.** Der Medienbestand hat keine einzige
 * Tonspur, Stock-Musik brächte Lizenz- und GEMA-Fragen an einen Messestand,
 * und der Kiosk muss offline laufen. Fünf generische Vier-Takt-Loops aus
 * Oszillatoren und Rauschen sind dagegen frei, ein paar Kilobyte Code — und
 * „generisch“ ist hier kein Mangel, sondern die Aufgabe: es soll klingen wie
 * *irgendein* Sender dieser Richtung, leise unter dem Messelärm.
 *
 * **Leise ist Pflicht.** `LAUTSTAERKE` ist bewusst weit unten: das Radio ist
 * eine Beilage zum Screen, keine Beschallung des Standes.
 *
 * **iOS-Regel:** Audio startet nur nach einer Geste. `entsperre()` wird darum
 * direkt im Pointer-Handler der Station aufgerufen — dort erzeugt es den
 * `AudioContext` und weckt ihn; die Effekte danach dürfen dann spielen.
 */

/** Summen-Pegel des Radios. Eine Beilage, keine Beschallung. */
const LAUTSTAERKE = 0.08
/** Rauschen zwischen den Sendern — noch einmal deutlich darunter. */
const RAUSCHPEGEL = 0.2

/** Halbtonabstand zu A1 (55 Hz) → Frequenz. */
const ton = (halbtoene: number) => 55 * 2 ** (halbtoene / 12)

interface Muster {
  /** Sechzehntel-Schritte 0–15 mit Kick. */
  kick: readonly number[]
  snare: readonly number[]
  /** [Schritt, offen?] — offene Hats klingen aus. */
  hats: readonly (readonly [number, boolean])[]
  /** [Schritt, Halbtöne über A1, Länge in Schritten] */
  bass: readonly (readonly [number, number, number])[]
  /** [Schritt, Halbtöne der Stimmen, Länge in Schritten] — Flächen/Stabs. */
  akkorde?: readonly (readonly [number, readonly number[], number])[]
  /** Akkord-Klangfarbe: weich (Dreieck) oder verzerrt (Gitarren-Ersatz). */
  akkordArt?: 'weich' | 'verzerrt'
}

/**
 * Fünf Klischees, mit Absicht: Boom-bap mit Pentatonik-Bass, Vier-Viertel
 * mit Offbeat-Hats, I–V–vi–IV, Powerchords, Humptata mit Offbeat-Stabs.
 * Wer die Richtung kennt, erkennt sie in einem Takt — mehr muss es nicht.
 */
const MUSTER: Record<RadioStil, Muster> = {
  hiphop: {
    kick: [0, 7, 10],
    snare: [4, 12],
    hats: [0, 2, 4, 6, 8, 10, 11, 12, 14].map((s) => [s, false] as const),
    bass: [
      [0, 0, 3],
      [7, 3, 2],
      [10, -2, 4],
    ],
  },
  pop: {
    kick: [0, 8],
    snare: [4, 12],
    hats: [0, 2, 4, 6, 8, 10, 12, 14].map((s) => [s, s === 14] as const),
    // I–V–vi–IV in einem Takt — das generischste Stück Pop, das es gibt.
    bass: [
      [0, 3, 4],
      [4, -2, 4],
      [8, 0, 4],
      [12, -4, 4],
    ],
    akkorde: [
      [0, [15, 19, 22], 4],
      [4, [10, 14, 17], 4],
      [8, [12, 15, 19], 4],
      [12, [8, 12, 15], 4],
    ],
    akkordArt: 'weich',
  },
  techno: {
    kick: [0, 4, 8, 12],
    snare: [],
    hats: [2, 6, 10, 14].map((s) => [s, true] as const),
    // Rollender Achtel-Bass auf E — das Laufband der Vier Viertel.
    bass: [0, 2, 4, 6, 8, 10, 12, 14].map((s) => [s, -5, 1] as const),
  },
  rock: {
    kick: [0, 3, 8, 11],
    snare: [4, 12],
    hats: [0, 2, 4, 6, 8, 10, 12, 14].map((s) => [s, false] as const),
    bass: [
      [0, -5, 8],
      [8, -2, 8],
    ],
    // Powerchords: Grundton + Quinte, verzerrt — die halbe Rockgeschichte.
    akkorde: [
      [0, [7, 14], 7],
      [8, [10, 17], 7],
    ],
    akkordArt: 'verzerrt',
  },
  schlager: {
    // Humptata: Bass wechselt Grundton und Quinte, die Stabs sitzen auf dem
    // Offbeat — Après-Ski braucht keinen zweiten Takt Erklärung.
    kick: [0, 4, 8, 12],
    snare: [],
    hats: [2, 6, 10, 14].map((s) => [s, false] as const),
    bass: [
      [0, 3, 2],
      [4, 10, 2],
      [8, 3, 2],
      [12, 10, 2],
    ],
    akkorde: [
      [2, [15, 19, 22], 2],
      [6, [15, 19, 22], 2],
      [10, [15, 19, 22], 2],
      [14, [15, 19, 22], 2],
    ],
    akkordArt: 'weich',
  },
}

export class Radioklang {
  private ctx: AudioContext | null = null
  private summe: GainNode | null = null
  private rauschBuffer: AudioBuffer | null = null

  private rauschen_: { quelle: AudioBufferSourceNode; pegel: GainNode } | null = null
  private takt: { timer: number; stil: RadioStil; bpm: number } | null = null
  private naechsterTakt = 0

  /**
   * Muss aus einer Nutzergeste heraus laufen (Pointer-Handler): erzeugt den
   * Kontext und weckt ihn. Alles Spätere darf dann aus Effekten kommen.
   */
  entsperre() {
    if (!this.ctx) {
      this.ctx = new AudioContext()
      this.summe = this.ctx.createGain()
      this.summe.gain.value = LAUTSTAERKE
      this.summe.connect(this.ctx.destination)

      const laenge = this.ctx.sampleRate
      this.rauschBuffer = this.ctx.createBuffer(1, laenge, this.ctx.sampleRate)
      const daten = this.rauschBuffer.getChannelData(0)
      for (let i = 0; i < laenge; i++) daten[i] = Math.random() * 2 - 1
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume()
  }

  /** Sender eingestellt: Loop im Stil starten, Rauschen aus. */
  sender(stil: RadioStil, bpm: number) {
    if (!this.ctx) return
    if (this.takt?.stil === stil) return
    this.stille()

    // Lookahead-Scheduler: alle 60 ms wird geprüft, ob der nächste Takt in
    // die nahe Zukunft fällt, und dann als Ganzes geplant. `setInterval`
    // allein würde auf einem Messe-iPad hörbar stolpern; geplante Zeiten auf
    // der Audio-Uhr nicht.
    this.naechsterTakt = this.ctx.currentTime + 0.08
    const timer = window.setInterval(() => {
      const ctx = this.ctx
      if (!ctx) return
      const taktDauer = (60 / bpm) * 4
      while (this.naechsterTakt < ctx.currentTime + 0.2) {
        this.planeTakt(stil, bpm, this.naechsterTakt)
        this.naechsterTakt += taktDauer
      }
    }, 60)
    this.takt = { timer, stil, bpm }
  }

  /** Zwischen den Sendern: leises Bandrauschen statt Musik. */
  rauschen() {
    if (!this.ctx || !this.summe || !this.rauschBuffer) return
    this.stopMusik()
    if (this.rauschen_) return

    const quelle = this.ctx.createBufferSource()
    quelle.buffer = this.rauschBuffer
    quelle.loop = true
    const filter = this.ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.value = 1400
    filter.Q.value = 0.5
    const pegel = this.ctx.createGain()
    // Weich einblenden: ein hart einsetzendes Rauschen klingt nach Fehler.
    pegel.gain.setValueAtTime(0, this.ctx.currentTime)
    pegel.gain.linearRampToValueAtTime(RAUSCHPEGEL, this.ctx.currentTime + 0.25)
    quelle.connect(filter).connect(pegel).connect(this.summe)
    quelle.start()
    this.rauschen_ = { quelle, pegel }
  }

  /** Alles aus, Kontext bleibt für den nächsten Dreh am Regler warm. */
  stille() {
    this.stopMusik()
    if (this.rauschen_ && this.ctx) {
      const { quelle, pegel } = this.rauschen_
      pegel.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.15)
      quelle.stop(this.ctx.currentTime + 0.2)
      this.rauschen_ = null
    }
  }

  /** Beim Verlassen der Station: Gerät ausbauen, Decoder freigeben. */
  zerstoere() {
    this.stille()
    void this.ctx?.close()
    this.ctx = null
    this.summe = null
    this.rauschBuffer = null
  }

  private stopMusik() {
    if (this.takt) {
      window.clearInterval(this.takt.timer)
      this.takt = null
    }
  }

  private planeTakt(stil: RadioStil, bpm: number, start: number) {
    const m = MUSTER[stil]
    const schritt = 60 / bpm / 4

    for (const s of m.kick) this.kick(start + s * schritt)
    for (const s of m.snare) this.snare(start + s * schritt)
    for (const [s, offen] of m.hats) this.hat(start + s * schritt, offen)
    for (const [s, halbton, laenge] of m.bass) {
      this.bass(start + s * schritt, ton(halbton), laenge * schritt)
    }
    for (const [s, stimmen, laenge] of m.akkorde ?? []) {
      this.akkord(
        start + s * schritt,
        stimmen.map(ton),
        laenge * schritt,
        m.akkordArt ?? 'weich',
      )
    }
  }

  // -- Stimmen --------------------------------------------------------------

  private kick(t: number) {
    if (!this.ctx || !this.summe) return
    const osz = this.ctx.createOscillator()
    const pegel = this.ctx.createGain()
    osz.frequency.setValueAtTime(120, t)
    osz.frequency.exponentialRampToValueAtTime(44, t + 0.11)
    pegel.gain.setValueAtTime(0.9, t)
    pegel.gain.exponentialRampToValueAtTime(0.001, t + 0.16)
    osz.connect(pegel).connect(this.summe)
    osz.start(t)
    osz.stop(t + 0.2)
  }

  private snare(t: number) {
    if (!this.ctx || !this.summe || !this.rauschBuffer) return
    const quelle = this.ctx.createBufferSource()
    quelle.buffer = this.rauschBuffer
    const filter = this.ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.value = 1900
    filter.Q.value = 0.9
    const pegel = this.ctx.createGain()
    pegel.gain.setValueAtTime(0.5, t)
    pegel.gain.exponentialRampToValueAtTime(0.001, t + 0.13)
    quelle.connect(filter).connect(pegel).connect(this.summe)
    quelle.start(t)
    quelle.stop(t + 0.15)
  }

  private hat(t: number, offen: boolean) {
    if (!this.ctx || !this.summe || !this.rauschBuffer) return
    const quelle = this.ctx.createBufferSource()
    quelle.buffer = this.rauschBuffer
    const filter = this.ctx.createBiquadFilter()
    filter.type = 'highpass'
    filter.frequency.value = 7500
    const pegel = this.ctx.createGain()
    const dauer = offen ? 0.14 : 0.035
    pegel.gain.setValueAtTime(offen ? 0.22 : 0.16, t)
    pegel.gain.exponentialRampToValueAtTime(0.001, t + dauer)
    quelle.connect(filter).connect(pegel).connect(this.summe)
    quelle.start(t)
    quelle.stop(t + dauer + 0.02)
  }

  private bass(t: number, freq: number, dauer: number) {
    if (!this.ctx || !this.summe) return
    const osz = this.ctx.createOscillator()
    osz.type = 'triangle'
    osz.frequency.value = freq
    const filter = this.ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 320
    const pegel = this.ctx.createGain()
    pegel.gain.setValueAtTime(0, t)
    pegel.gain.linearRampToValueAtTime(0.55, t + 0.015)
    pegel.gain.setValueAtTime(0.55, t + Math.max(0.02, dauer - 0.05))
    pegel.gain.linearRampToValueAtTime(0, t + dauer)
    osz.connect(filter).connect(pegel).connect(this.summe)
    osz.start(t)
    osz.stop(t + dauer + 0.05)
  }

  private akkord(t: number, freqs: number[], dauer: number, art: 'weich' | 'verzerrt') {
    if (!this.ctx || !this.summe) return
    const pegel = this.ctx.createGain()
    const staerke = art === 'verzerrt' ? 0.16 : 0.1
    pegel.gain.setValueAtTime(0, t)
    pegel.gain.linearRampToValueAtTime(staerke, t + 0.02)
    pegel.gain.setValueAtTime(staerke, t + Math.max(0.03, dauer - 0.08))
    pegel.gain.linearRampToValueAtTime(0, t + dauer)

    let ziel: AudioNode = pegel
    if (art === 'verzerrt') {
      // Ein weicher Waveshaper macht aus zwei Sägezähnen den Gitarren-Ersatz —
      // echte Gitarren gibt der Baukasten nicht her, die Geste reicht.
      const zerre = this.ctx.createWaveShaper()
      const kurve = new Float32Array(256)
      for (let i = 0; i < 256; i++) kurve[i] = Math.tanh((i / 128 - 1) * 3)
      zerre.curve = kurve
      zerre.connect(pegel)
      ziel = zerre
    }
    pegel.connect(this.summe)

    for (const f of freqs) {
      const osz = this.ctx.createOscillator()
      osz.type = art === 'verzerrt' ? 'sawtooth' : 'triangle'
      osz.frequency.value = f
      osz.connect(ziel)
      osz.start(t)
      osz.stop(t + dauer + 0.05)
    }
  }
}
