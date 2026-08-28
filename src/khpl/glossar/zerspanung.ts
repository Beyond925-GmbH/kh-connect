import type { Begriffseintrag } from './begriffe'

/**
 * Das Glossar des Zerspanungs-Tages — eigene Datei je Beruf, wie bei den
 * anderen dreien: derselbe Begriff heißt in zwei Gewerken nicht dasselbe,
 * und dieser Tag redet über Hundertstel, nicht über Dachlatten.
 *
 * Aus dem Bestand ist nichts wiederverwendet: die Grundbegriffe der anderen
 * Tage (PSA, Gewerk, laufender Meter) kommen auf diesen Screens nicht vor.
 *
 * ⚠️ **Die Definitionstexte sind Copy für Vierzehn- bis Siebzehnjährige und
 * fachlich abzunehmen.** Die Zahlen darin sind Lehrbuchwerte: h7 bei
 * Nennmaß 18–30 mm = 21 µm (ISO 286), ein menschliches Haar rund 0,04 bis
 * 0,1 mm, Messschrauben lesen auf 0,01 mm ab, digitale auf 0,001 mm.
 */

export const BEGRIFFE_ZERSPANUNG = {
  zerspanung: {
    label: 'Zerspanung',
    erklaerung:
      'Metall in Form bringen, indem man wegnimmt, was zu viel ist — Span für Span. Drehen, Fräsen, Bohren sind alles Zerspanung. Das Gegenteil wäre Gießen oder 3D-Druck: da kommt Material dazu, hier kommt es weg.',
  },
  cnc: {
    label: 'CNC',
    erklaerung:
      'Computerized Numerical Control — die Steuerung der Maschine. Sie liest das Programm Satz für Satz und macht daraus Bewegung, auf Tausendstel Millimeter positioniert. Programmiert, eingerichtet und überwacht wird sie von Menschen: von Zerspanungsmechanikerinnen und -mechanikern.',
  },
  toleranz: {
    label: 'Toleranz',
    erklaerung:
      'Kein Teil der Welt wird exakt 25,000 Millimeter — Werkzeug, Maschine und Wärme streuen immer ein bisschen. Die Toleranz sagt, wie viel Abweichung erlaubt ist, damit das Teil trotzdem funktioniert. Je enger sie ist, desto teurer wird die Fertigung — deshalb steht sie nur dort eng, wo es darauf ankommt.',
  },
  passung: {
    label: 'Passung',
    erklaerung:
      'Wie Bohrung und Welle zusammensitzen: mit Luft (Spielpassung — es gleitet), fast ohne Luft (Übergangspassung — es sitzt satt) oder mit Übermaß (Presspassung — es hält ohne Schraube). Festgelegt wird das über genormte Toleranzklassen wie H7 oder h7, nach ISO 286 — damit Teile aus zwei Werken zusammenpassen, ohne dass sich die Werke je gesehen haben.',
  },
  ruesten: {
    label: 'Rüsten',
    erklaerung:
      'Alles, was vor dem ersten Span passiert: Rohteil spannen, Werkzeuge einsetzen und vermessen, Nullpunkt setzen, Programm laden. Beim Rüsten entscheidet sich, ob die Serie läuft — die Maschine macht danach nur noch, was eingerichtet wurde.',
  },
  nullpunkt: {
    label: 'Nullpunkt',
    erklaerung:
      'Der Punkt, von dem aus die Maschine alle Maße rechnet — meist die Stirnfläche des gespannten Teils. Steht er falsch, sind alle Wege falsch: das Programm wäre richtig und jedes Teil trotzdem daneben. Deshalb wird er beim Rüsten angetastet und geprüft.',
  },
  vorschub: {
    label: 'Vorschub',
    erklaerung:
      'Wie weit die Schneide je Umdrehung am Teil entlangwandert — beim Drehen in Millimetern pro Umdrehung, im Programm steht er hinter dem F. Mehr Vorschub heißt schneller fertig, aber rauere Oberfläche; weniger heißt feiner und langsamer.',
  },
  kuehlschmierstoff: {
    label: 'Kühlschmierstoff',
    erklaerung:
      'Die milchige Flüssigkeit, die beim Zerspanen über Werkzeug und Teil läuft. Sie kühlt die Schneide, schmiert den Schnitt und spült die Späne weg. Sie läuft im Kreis: auffangen, filtern, wieder drauf.',
  },
  aufmass: {
    label: 'Aufmaß',
    erklaerung:
      'Absichtlich zu viel Material stehen lassen. Der Grund ist eine einfache Asymmetrie: ein Teil, das noch zu groß ist, kann man nachdrehen — ein Teil, das zu klein geworden ist, rettet niemand mehr. Deshalb tastet man sich von oben an das Maß heran.',
  },
  messschraube: {
    label: 'Bügelmessschraube',
    erklaerung:
      'Das Messwerkzeug für die genauen Maße: ein Bügel, eine feine Gewindespindel, eine Ratsche, die die Messkraft begrenzt — damit zwei Menschen dasselbe messen. Sie liest auf ein Hundertstel Millimeter ab, digitale Ausführungen auf ein Tausendstel. Der Messschieber daneben ist das gröbere, schnellere Werkzeug.',
  },
} as const satisfies Record<string, Begriffseintrag>

export type ZerspanungBegriffId = keyof typeof BEGRIFFE_ZERSPANUNG
