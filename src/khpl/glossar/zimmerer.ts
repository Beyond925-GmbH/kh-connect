import { BEGRIFFE, type Begriffseintrag } from './begriffe'

/**
 * Das Glossar des Zimmerer-Tages.
 *
 * **Zwei Hälften.** Acht Einträge stehen schon im gemeinsamen Bestand und
 * werden hier nur durchgereicht — `CAD`, `Abbund`, `Abbundanlage`, `KVH`,
 * `Statik`, `Gewerk`, `PSA` und `laufender Meter` sind nicht gewerkespezifisch
 * und würden als Kopie zweimal gepflegt und einmal vergessen. Zwölf Einträge
 * kommen neu dazu; sie handeln vom Holzrahmenbau und haben im Dachdecker-Tag
 * nichts zu suchen.
 *
 * **Die zwölf neuen Texte gehören fachlich gegengelesen** — von einem Menschen
 * aus dem Gewerk, nicht von einer Suchmaschine. Wo eine Aussage eine Quelle
 * hat, steht sie im Kommentar darüber; alles andere ist Formulierung.
 * Hier ist eine falsche Definition peinlicher als anderswo, weil der Besucher
 * sie für die Antwort hält.
 *
 * **Nicht übernommen: `stundensatz`.** Der Bestandseintrag nennt eine Spanne
 * „im Bauhandwerk“, und der Wert hängt am Gewerk. Dieser
 * Tag rechnet nirgends mit einem Stundensatz — er kommt deshalb gar nicht erst
 * vor.
 */

/**
 * Die zwölf neuen Begriffe dieses Tages.
 *
 * Reihenfolge: erst die Wand von unten nach oben (Schwelle, Ausklinkung,
 * Ständerwerk, Rähm, Achsmaß), dann ihre Schichten (Dampfbremse, Beplankung,
 * Holzfaserplatte), dann die Öffnung (Wechselholz, Dichtstoff), dann Transport
 * und Kran (Innenlader, Anschlagmittel). Wer die Liste am Stück liest, liest
 * den Tag.
 */
const NEU = {
  schwelle: {
    label: 'Schwelle',
    erklaerung:
      'Das untere waagerechte Holz einer Wand. Es liegt auf der Bodenplatte oder auf der Decke des Stockwerks darunter, und in ihm stehen die Ständer. Über die Schwelle geht alles, was auf der Wand lastet, nach unten.',
  },
  ausklinkung: {
    label: 'Ausklinkung',
    erklaerung:
      'Eine gefräste Kerbe am Ende des Holzes, mit der es passgenau auf der Schwelle sitzt. Zwei gleich lange Hölzer unterscheiden sich oft nur in dieser Bearbeitung.',
  },
  staenderwerk: {
    label: 'Ständerwerk',
    erklaerung:
      'Das tragende Skelett einer Holzwand: senkrechte Hölzer zwischen Schwelle und Rähm. Sie tragen das Gewicht, das von oben kommt. Fest und steif wird die Wand aber erst durch die Platten, die darauf genagelt werden.',
  },
  raehm: {
    label: 'Rähm',
    erklaerung:
      'Das obere waagerechte Holz einer Wand, auf dem die Ständer enden. Auf dem Rähm liegt später die Decke oder das nächste Stockwerk.',
  },
  // Zahl und Begründung: das Raster kommt vom
  // Plattenformat 1250 mm, **nicht** von der Dämmstoffbreite. Kein genormtes
  // Pflichtmaß — deshalb „meist“, nie „immer“.
  achsmass: {
    label: 'Achsmaß',
    erklaerung:
      'Der Abstand von Ständermitte zu Ständermitte. Im Holzrahmenbau meist 62,5 Zentimeter — genau die Hälfte einer 125 Zentimeter breiten Bauplatte. So endet jede Platte genau auf einem Ständer, und es bleibt fast kein Rest zum Wegwerfen.',
  },
  // Lage und Prinzip nach DIN 4108-3 (Feldmessungen der WBA Weimar).
  // Vorbehalt: Es gibt Bauweisen ohne separate Folie, in denen die
  // OSB-Beplankung diese Funktion übernimmt — deshalb kein „immer“.
  dampfbremse: {
    label: 'Dampfbremse',
    erklaerung:
      'Die Schicht auf der warmen Innenseite der Dämmung. Sie hält die feuchte Luft aus dem Zimmer aus der Wand heraus. Sie ist keine Folie gegen Regen: Nach außen muss die Wand offen bleiben, sonst trocknet sie nie wieder.',
  },
  beplankung: {
    label: 'Beplankung',
    erklaerung:
      'Die Platten, die innen und außen auf das Holzgerippe der Wand genagelt oder geschraubt werden. Sie machen die Wand steif. Ohne sie ließe sich der Rahmen schief drücken wie ein Bilderrahmen ohne Rückwand.',
  },
  holzfaserplatte: {
    label: 'Holzfaserplatte',
    erklaerung:
      'Die äußere Platte. Sie besteht aus Holz, das zu feinen Fasern zermahlen und wieder zusammengepresst wurde. Sie dämmt zusätzlich und lässt Wasserdampf nach draußen: Feuchtigkeit, die doch in die Wand kommt, kann wieder heraus.',
  },
  wechselholz: {
    label: 'Wechselholz',
    erklaerung:
      'Ein waagerechtes Holz über und unter einer Öffnung. Wo ein Fenster hin soll, fehlen ein paar Ständer. Was diese Ständer sonst tragen würden, trägt jetzt das Wechselholz — und an ihm wird später der Fensterrahmen festgeschraubt.',
  },
  dichtstoff: {
    label: 'Dichtstoff',
    erklaerung:
      'Die elastische Masse, die die Fuge zwischen Fensterrahmen und Holz rundum verschließt. Sie bleibt weich und macht die Bewegung des Materials mit. Als vorgefertigtes Band heißt sie Dichtband.',
  },
  // Transportart: stehend zwischen den
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
  // Wiederverwendet aus dem gemeinsamen Bestand.
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
