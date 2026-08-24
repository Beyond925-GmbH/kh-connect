import { BEGRIFFE, type Begriffseintrag } from './begriffe'

/**
 * Das Glossar des Zimmerer-Tages (khpl-tage.md §6.1 V6, khpl-tag-zimmerer.md 9).
 *
 * **Zwei Hälften.** Acht Einträge stehen schon im gemeinsamen Bestand und
 * werden hier nur durchgereicht — `CAD`, `Abbund`, `Abbundanlage`, `KVH`,
 * `Statik`, `Gewerk`, `PSA` und `laufender Meter` sind nicht gewerkespezifisch
 * und würden als Kopie zweimal gepflegt und einmal vergessen. Zehn Einträge
 * kommen neu dazu; sie handeln vom Holzrahmenbau und haben im Dachdecker-Tag
 * nichts zu suchen.
 *
 * ⚠️ **Die zehn neuen Texte sind `ENTWURF – UNGEPRÜFT`.** khpl-tag-zimmerer.md
 * 11 führt sie ausdrücklich als „fachlich abzunehmen“ — das prüft ein Mensch
 * aus dem Gewerk, keine Suchmaschine. Wo eine Aussage einen Beleg hat, steht er
 * im Kommentar darüber; alles andere ist Formulierung, die gegengelesen gehört.
 * Hier ist eine falsche Definition peinlicher als anderswo, weil der Besucher
 * sie für die Antwort hält.
 *
 * **Nicht übernommen: `stundensatz`.** Der Bestandseintrag nennt eine Spanne
 * „im Bauhandwerk“; khpl-tage.md 0c weist ihn als gewerkeabhängig aus. Dieser
 * Tag rechnet nirgends mit einem Stundensatz — er kommt deshalb gar nicht erst
 * vor.
 */

/**
 * Die zehn neuen Begriffe dieses Tages.
 *
 * Reihenfolge: erst die Wand von unten nach oben (Schwelle, Ständerwerk, Rähm,
 * Achsmaß), dann ihre Schichten (Dampfbremse, Beplankung, Holzfaserplatte),
 * dann die Öffnung (Wechselholz), dann Transport und Kran (Innenlader,
 * Anschlagmittel). Wer die Liste am Stück liest, liest den Tag.
 */
const NEU = {
  schwelle: {
    label: 'Schwelle',
    erklaerung:
      'Das untere waagerechte Holz einer Wand. Es liegt auf der Bodenplatte oder der Geschossdecke, und in ihm stehen die Ständer. Über die Schwelle geht die Last der ganzen Wand in den Untergrund.',
  },
  staenderwerk: {
    label: 'Ständerwerk',
    erklaerung:
      'Das tragende Skelett einer Holzrahmenwand: senkrechte Ständer zwischen Schwelle und Rähm. Es nimmt die Lasten auf — steif wird die Wand aber erst durch die Beplankung, die darauf kommt.',
  },
  raehm: {
    label: 'Rähm',
    erklaerung:
      'Das obere waagerechte Holz einer Wand, auf dem die Ständer enden. Auf dem Rähm liegt später die Geschossdecke oder das nächste Stockwerk.',
  },
  // Zahl und Begründung `BELEGT` (belege/zimmerer.md 1): das Raster kommt vom
  // Plattenformat 1250 mm, **nicht** von der Dämmstoffbreite. Kein genormtes
  // Pflichtmaß — deshalb „meist“, nie „immer“.
  achsmass: {
    label: 'Achsmaß',
    erklaerung:
      'Der Abstand von Ständermitte zu Ständermitte. Im Holzrahmenbau meist 62,5 Zentimeter — genau die Hälfte einer 125 Zentimeter breiten Bauplatte. So trifft jeder Plattenstoß auf einen Ständer, und es bleibt fast kein Verschnitt übrig.',
  },
  // Lage und Prinzip `BELEGT` (belege/zimmerer.md 2, WBA Weimar; Prinzip nach
  // DIN 4108-3). Vorbehalt: Es gibt Bauweisen ohne separate Folie, in denen die
  // OSB-Beplankung diese Funktion übernimmt — deshalb kein „immer“.
  dampfbremse: {
    label: 'Dampfbremse',
    erklaerung:
      'Die Schicht auf der warmen Innenseite der Dämmung. Sie hält Luftfeuchte aus dem Zimmer aus der Wand heraus. Keine Folie gegen Regen: nach außen muss die Wand offen bleiben, sonst trocknet sie nie wieder.',
  },
  beplankung: {
    label: 'Beplankung',
    erklaerung:
      'Die Platten, die innen und außen auf das Ständerwerk genagelt oder geschraubt werden. Sie steifen die Wand aus — ohne sie ließe sich der Rahmen zum Parallelogramm schieben.',
  },
  holzfaserplatte: {
    label: 'Holzfaserplatte',
    erklaerung:
      'Die äußere Platte aus zerfasertem Holz. Sie dämmt zusätzlich und ist diffusionsoffen: Feuchtigkeit, die doch in die Wand gerät, kann nach außen entweichen.',
  },
  wechselholz: {
    label: 'Wechselholz',
    erklaerung:
      'Ein waagerechtes Holz über und unter einer Öffnung. Wo ein Fenster das Ständerwerk unterbricht, nimmt das Wechselholz die Last der fehlenden Ständer auf und gibt dem Rahmen seinen Anschlag.',
  },
  // Transportart `BELEGT` (belege/zimmerer.md 4): stehend zwischen den
  // Radschwingen, damit das Element unter die zulässige Transporthöhe passt und
  // direkt vom Anhänger an seinen Platz gehoben werden kann.
  innenlader: {
    label: 'Innenlader',
    erklaerung:
      'Ein Spezialanhänger, der hohe Bauteile stehend zwischen seinen Rädern trägt. So bleibt ein drei Meter hohes Wandelement unter der erlaubten Transporthöhe — und der Kran hebt es direkt vom Anhänger an seinen Platz.',
  },
  anschlagmittel: {
    label: 'Anschlagmittel',
    erklaerung:
      'Alles, womit eine Last an den Kranhaken kommt: Ketten, Seile, Gurte, Schlaufen. Wer sie befestigt, heißt Anschläger — und er entscheidet, ob die Last gerade hängt.',
  },
} as const satisfies Record<string, Begriffseintrag>

/**
 * Was dieser Tag antippbar machen darf. Wiederverwendetes und Neues an einer
 * Stelle, damit `ZimmererBegriff` genau eine Quelle hat.
 */
export const BEGRIFFE_ZIMMERER = {
  // Wiederverwendet aus dem gemeinsamen Bestand (khpl-tag-zimmerer.md 9).
  cad: BEGRIFFE.cad,
  abbund: BEGRIFFE.abbund,
  abbundanlage: BEGRIFFE.abbundanlage,
  kvh: BEGRIFFE.kvh,
  statik: BEGRIFFE.statik,
  gewerk: BEGRIFFE.gewerk,
  psa: BEGRIFFE.psa,
  'laufender-meter': BEGRIFFE['laufender-meter'],
  ...NEU,
} as const satisfies Record<string, Begriffseintrag>

export type ZimmererBegriffId = keyof typeof BEGRIFFE_ZIMMERER

export function istZimmererBegriffId(wert: string): wert is ZimmererBegriffId {
  return Object.hasOwn(BEGRIFFE_ZIMMERER, wert)
}
