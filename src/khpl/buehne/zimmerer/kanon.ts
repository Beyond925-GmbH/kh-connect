/**
 * Three-freie Konstanten der Zimmerer-Bühne.
 *
 * Eigene Datei aus demselben Grund wie `buehne/kanon.ts`: ein Wert-Export neben
 * einer lazy geladenen Komponente wird von den Steps statisch importiert und
 * zieht dann `three` in den Erststart (`INEFFECTIVE_DYNAMIC_IMPORT`, README).
 * Steps importieren Laufzeitwerte der Bühne **ausschließlich von hier** — aus
 * `Wandelement3D` nur `import type`.
 *
 * Hier liegen deshalb alle Laufzeitkonstanten der Bühne — Kranfahrzeit,
 * Pendeldämpfung und was sonst ein Step wissen muss, ohne `three` zu laden.
 */

/**
 * Maße des Fadenobjekts in Metern.
 *
 * Das Rechenbeispiel für das Elementgewicht geht von einem Element von
 * 8 × 3 m aus. Damit ist das hier keine frei gesetzte Zahl, sondern die, auf
 * die sich der Text in C5 bezieht.
 */
export const ELEMENT_BREITE_M = 8
export const ELEMENT_HOEHE_M = 3

/**
 * Das Raster der Ständer in Zentimetern, und die Plattenbreite, aus der es
 * kommt: 1250 / 2 = 625.
 *
 * ⚠️ Kein genormtes Pflichtmaß — C2 sagt „meist“, nicht „immer“.
 */
export const ACHSMASS_CM = 62.5
export const PLATTENBREITE_CM = 125

/** Grenzen des Schätzreglers in C2 in Zentimetern — grob 30–120 cm. */
export const ACHSMASS_MIN_CM = 30
export const ACHSMASS_MAX_CM = 120

/**
 * Sekunden für die Abfahrt in C5. Das Gespann fährt **weg**, der Blick bleibt
 * in der leeren Halle zurück — die Gegenrichtung zur Anfahrt des Dachdeckers
 * (`ANFAHRT_DAUER`), und derselbe Wrapper-Vertrag: `prefers-reduced-motion`
 * heißt, das Gespann ist sofort fort.
 */
export const ABFAHRT_DAUER = 4.5

/**
 * Sekunden für den Blick nach oben in C4 — „So sieht das aus, wenn es steht.“
 * Eine Sekunde, nicht interaktiv: das hier ist die Dauer des Aufrichtens.
 * Dieselbe Dauer legt das Element danach animiert wieder ab.
 */
export const AUFRICHTEN_DAUER = 1

/**
 * Sekunden, die das aufgerichtete Element **steht**, bevor es sich zurücklegt.
 * Ohne Standzeit wäre der Blick nach oben nur der Drehweg: die träge Kamera
 * kommt in einer Sekunde kaum an, und C6 fragt genau dieses Bild ab — dieser
 * Blick ist die halbe Miete und braucht einen Moment, in dem das Element
 * wirklich steht.
 */
export const AUFRICHTEN_STANDZEIT = 1.8

/**
 * Dämpfung der pendelnden Last in C6, 0…1 je Sekunde.
 *
 * Das Bewegungsgefühl dieses Tages ist **Masse**: Trägheit, Nachlauf, ein
 * langsames Ausschwingen — die bewusst gesetzte Gegenbewegung zu den harten
 * Rastersprüngen des Zerspanungstages. Umsetzung über den
 * Frame-Loop, nicht über `motion`-Spring: die Last hängt in der Szene, nicht
 * im DOM.
 */
export const PENDEL_DAEMPFUNG = 0.75

/** Wie weit die Last höchstens ausschwingt, in Metern. */
export const PENDEL_AUSSCHLAG_M = 0.6

/**
 * Halbe Breite des Einrast-Fensters beim Absetzen in C6, seitlich in Metern.
 *
 * Der Ziehweg umfasst ±3 m. Mit ±0,2 m war das Trefferfenster rund 36 von
 * 545 Bildpunkten breit und auf der Bühne nicht markiert — am Messe-Kiosk
 * stand das Element optisch längst, während der Screen weiter „lass es ab“
 * sagte (Abnahme-Befund). Jetzt gilt das Muster von C4/M7: großzügige
 * Toleranz, denn der Lerninhalt ist das Prinzip — die Last ruhig über die
 * Schwelle führen —, nicht Pixelpräzision. Die Zielzone markiert `Zielgeist`
 * sichtbar.
 */
export const ABSETZ_FENSTER_M = 0.75
