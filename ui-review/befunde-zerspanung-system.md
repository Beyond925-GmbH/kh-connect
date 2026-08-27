# Befunde Zerspanung — Linse: Visuelles System (R1–R9)

Review-Grundlage: khpl-designregeln.md, Screenshot-Manifest Walkthrough Zerspanung, Quellcode src/khpl/steps/zerspanung/.

## Z1 — Null Komma null zwei eins

### Z1 — R3 — Slider-Griff ist orange statt limette, obwohl der Wert daneben limette ist
- **Screenshot:** /tmp/khpl-shots/zerspanung/khpl-zerspanung-01-z1-initial.png
- **Datei:** src/index.css:329-380 (Utility `kh-regler`, `::-webkit-slider-thumb`/`::-moz-range-thumb`, `background: var(--color-kh-orange)`) — betrifft `Z1.tsx:245` (`className="kh-regler w-full"`) und jeden weiteren Slider der App.
- **Fix:** In `kh-regler` den Thumb-Hintergrund auf `var(--color-kh-signal)` (limette) ändern (webkit + moz + `:disabled`-Ausnahme beibehalten als `kh-mute`). Regel R3 ist explizit: „Slider-Griff limette (wie sein Wert)"; aktuell ist der Wert (`0,500 mm`, kh-zahl) limette, aber der Griff, den man tatsächlich zieht, orange — das zeigt auf die Zeichnung/Welt statt auf die eigene Eingabe.

### Z1 — R3 — Primärer „Weiter"-Knopf ist orange statt limette (systemisch, `variant="weiter"`)
- **Screenshot:** /tmp/khpl-shots/zerspanung/khpl-zerspanung-02-z1-geloest.png (Button „Weiter an die Maschine"), auch khpl-zerspanung-01-z1-intro-dialog.png (Button „Alles klar")
- **Datei:** src/components/ui/button.tsx:39-48 (Variante `weiter` = `bg-kh-orange`, Variante `aktion` = `bg-kh-signal`); verwendet in src/khpl/komponenten/Verzweigung.tsx:123-131 und src/khpl/komponenten/Ansage.tsx:118-125.
- **Fix:** Die Farbzuordnung der beiden Varianten tauschen: `weiter` (der Knopf, der den Screen verlässt/den Hauptweg nimmt) bekommt `bg-kh-signal`/limette, `aktion` (Prüfen/Auflösen innerhalb der Übung) bleibt wie gehabt oder wird eigenständig markiert. Der Kommentar in Verzweigung.tsx:36-38 dokumentiert die aktuelle (falsche) Zuordnung explizit als Absicht — das widerspricht R3 wörtlich („Alle Weiter-CTAs limette"). Dieser Fund gilt für **jeden** Step, in dem eine Karte durchlaufen wird (Z1, Z2, Z4, Z6, Z7, Z8 u.a.) — hier nur einmal notiert, da die Ursache in der Shell liegt.

### Z1 — R7 — Slider-Endpunkte sind reine Zahlen, obwohl rechts=feiner (Ausnahme) gilt
- **Screenshot:** /tmp/khpl-shots/zerspanung/khpl-zerspanung-01-z1-initial.png
- **Datei:** src/khpl/steps/zerspanung/Z1.tsx:247-250 (`<span>{mm(MAX_MM)}</span>` / `<span>{mm(MIN_MM)}</span>`)
- **Fix:** R7 erlaubt die Ausnahme „rechts = feiner", verlangt dafür aber Wort-Endpunkte, nicht nur Zahlen. Endpunkt-Beschriftungen ergänzen, z. B. `grob · {mm(MAX_MM)}` links und `fein · {mm(MIN_MM)}` rechts (oder als eigene `<span>` über den Zahlen), damit ein Erstnutzer ohne Nachdenken erkennt, warum rechts die kleinere Zahl steht.

### Z1 — R1 — Nach dem Auflösen bleibt die obere Bühnenhälfte leer, die Zeichnung schrumpft auf einen kleinen Kreis unten rechts
- **Screenshot:** /tmp/khpl-shots/zerspanung/khpl-zerspanung-02-z1-geloest.png
- **Datei:** src/khpl/steps/zerspanung/Z1.tsx:132-134 (`buehne={<Werkstueck zustand="zeichnung" massHervorgehoben toleranzfeld={aufgeloest} />}`), vermutlich Layout in src/khpl/buehne/zerspanung/Werkstueck.tsx
- **Fix:** Den Toleranzfeld-Kreis im aufgelösten Zustand vertikal zentrieren oder vergrößern, sodass er den oberen Bereich der Bühne mitnutzt (Prüffrage R1: „Was steht in der oberen Hälfte?" — aktuell: nichts). Alternativ das Kreis-Element weiter nach oben verschieben, damit über den ersten ~350px keine leere Fläche bleibt.

Z1.1 (Abstecher „Wer zeichnet das?"): sauber (Linse system) — bis auf den systemischen R3-Fund oben (Weiter-Knopf orange), sonst volle Bühne, keine Kollision, klarer Fortschrittspfad.

## Z2 — Alles muss sitzen, bevor irgendwas läuft

### Z2 — R8 — Die Handgriffkarte ist selbst der Knopf, trägt aber Orange statt Limette-Affordanz
- **Screenshot:** /tmp/khpl-shots/zerspanung/khpl-zerspanung-06-z2-initial.png
- **Datei:** src/khpl/steps/zerspanung/Z2.tsx:217-221 (`griff.hoehepunkt ? 'border-kh-orange bg-kh-orange/16' : 'border-kh-orange/50 bg-kh-orange/10'`)
- **Fix:** R8 verlangt für „die Bühne/das Objekt ist selbst die Interaktion" ausdrücklich eine Limette-Affordanz (Glow/Puls), nicht Orange. Rahmen und Füllung der `Handgriffkarte` auf `border-kh-signal` / `bg-kh-signal/12` (bzw. beim Höhepunkt kräftiger) umstellen; Name/Label darin (`text-kh-orange`, Zeile 235) kann orange bleiben, da es sich auf den Fachbegriff bezieht — aber der tappbare Rahmen selbst muss die Primärhandlung limette markieren, sonst ist auf dem ganzen Screen kein einziges limettes Element zu sehen (Verstoß gegen R8 zusätzlich zu R3).

### Z2 — R1 — Obere Bühnenhälfte bleibt bei allen vier Handgriffen fast leer
- **Screenshot:** /tmp/khpl-shots/zerspanung/khpl-zerspanung-06-z2-initial.png, khpl-zerspanung-07-z2-geloest.png
- **Datei:** src/khpl/steps/zerspanung/Z2.tsx:109-115 (`buehne={<Werkstueck zustand="rohling" ruestschritte={gesetzt} nullpunkt={...} />}`), Layout vermutlich in src/khpl/buehne/zerspanung/Werkstueck.tsx
- **Fix:** Die Rohling-Zeichnung sitzt klein und mittig-rechts, der komplette obere Bereich (ca. 45 % der Bühnenhöhe) ist reine schwarze Fläche. Zeichnung vergrößern und näher an den oberen Bildrand rücken (z. B. vertikal zentriert über die volle Bühnenhöhe statt nur unteres Drittel), damit „Was steht in der oberen Hälfte?" eine Antwort hat.

Z2.1 (Abstecher „Warum es überall spritzt"): sauber für R1–R3 (volles Bühnenfoto, keine Kollision) — siehe aber R5-Fund unten.

### Z2.1 — R5 — Beide Aha-Karten öffnen automatisch nach 800 ms und heben das Wortbudget klar über ~50 Wörter
- **Screenshot:** /tmp/khpl-shots/zerspanung/khpl-zerspanung-09-z21-abstecher.png
- **Datei:** src/khpl/steps/zerspanung/Z21.tsx:26-32 (`setTimeout(() => setAha(true), 800)`) und :48-61 (zwei `AhaKarte sichtbar={aha}`)
- **Fix:** R5 sieht die Klappzeilen als Ort für den Text *hinter* dem Budget vor — hier öffnen sich automatisch zwei Aha-Karten plus der Warum-Absatz gleichzeitig sichtbar, macht zusammen ca. 90 Wörter ohne einen einzigen Tap. Entweder die zweite Aha-Karte („Und wenn niemand nachfüllt?") geschlossen lassen, bis die erste angetippt/gelesen wurde, oder eine der beiden Karten ganz streichen und ihren Inhalt in den `warum`-Absatz einweben, damit der sichtbare Text ohne Interaktion wieder unter ~50 Wörtern bleibt.

## Z3 — Zeile für Zeile

Z3: größtenteils sauber (Linse system) — Bühne füllt die Höhe gut, `Erste Zeile` korrekt limette (variant `aktion`), Fehlermarkierung ohne Rot/Note (R11 sauber). Der finale Weiter-Knopf trägt den Text „Start drücken" (`src/khpl/berufe/zerspanung.ts:348`) und ist damit derselbe R3-Fund wie oben (`variant="weiter"` = orange statt limette) — hier besonders unglücklich, weil „Start drücken" eine aktive Handlung des Besuchers ist und nach Farblogik (limette=du) eigentlich limette verdient hätte, nicht Orange (=Welt). Kein neuer Fund, siehe Z1-Fund zu `button.tsx`.

## Z4 — Der stillste Raum der Firma

Z4: sauber (Linse system) — Bühnenfoto füllt den ganzen Screen ohne Leerraum (R1), „gelesen"-Haken an den Fragen-Pillen korrekt limette (`text-kh-signal`, Z4.tsx:172, gutes R3-Beispiel), keine Kollision. Einzige Auffälligkeit ist wieder der systemische orange „Weiter zur Messbank"-Knopf (gleicher R3-Fund wie Z1), hier nicht erneut aufgeführt.

## Z5 — Und, passt es?

### Z5 — R4 — Der Anweisungssatz „Dreh die Messschraube zu, bis sie anliegt." bleibt über alle vier Takte stehen, auch wenn längst etwas anderes zu tun ist
- **Screenshot:** /tmp/khpl-shots/zerspanung/khpl-zerspanung-15-z5-geloest.png (Takt „gemessen", Aktion ist „Nächstes Teil"), khpl-zerspanung-16-z5-teil2-initial.png (Takt „korrigieren", Aktion ist Korrektor + „Noch eins laufen lassen")
- **Datei:** src/khpl/steps/zerspanung/Z5.tsx:264 (`auftrag={fertig ? null : 'Dreh die Messschraube zu, bis sie anliegt.'}`)
- **Fix:** `auftrag` an `takt` koppeln statt nur an `fertig`, z. B. `takt === 'zudrehen' ? 'Dreh die Messschraube zu, bis sie anliegt.' : takt === 'urteilen' ? 'Und, passt es?' : takt === 'gemessen' ? null : takt === 'korrigieren' ? 'Stell den Korrektor nach und lass noch eins laufen.' : null`. R4 verlangt genau einen Anweisungssatz, der sagt, was **jetzt** zu tun ist — aktuell steht dort eine abgeschlossene Handlung, während die Karte längst eine andere Übung zeigt (Urteilen, Werkzeugkorrektur), was besonders am Messestand verwirrt, weil Text und Interaktion auseinanderlaufen.

Ansonsten sauber: `Toleranzband`-Marke folgt korrekt R3 (limette = drin, orange = eigener Messwert), „Nächstes Teil"/„Noch eins laufen lassen" korrekt limette (`variant="aktion"`), kein Rot bei Fehlurteil (R11). Wiederkehrende, bereits dokumentierte Funde: Slider-Griff orange (wie Z1) und die große leere obere Bühnenhälfte über der Messschraubenzeichnung (wie Z1/Z2, siehe `Bild.tsx` `useFreieFlaeche`/Letterboxing) — hier nicht erneut ausformuliert.

## Z6 — Deins ist das erste

Z6: sauber (Linse system) — Kiste sitzt zentriert mit „Nr. 1"-Beschriftung, die den oberen Bühnenbereich sinnvoll füllt (kein reiner Leerraum wie bei Z1/Z2/Z5); Häkchen der Rückblick-Liste korrekt limette (`bg-kh-signal`, Z6.tsx:181); genau eine Ebene Karten-Verschachtelung (Fold „Warum das so ist" + ein `kh-feld` darunter). Einzige Auffälligkeit der bereits bekannte systemische orange „Weiter"-Knopf.

## Z7 / Z7.1–Z7.3 — Und danach? (Karriere-Wege)

Z7 (Kartenübersicht): sauber (Linse system) — volles Bühnenfoto, drei gleichrangige Karten ohne falsche Hervorhebung, Fork-Dialog sauber (Bild-Karten, ein orangener Hauptweg). Bekannter systemischer Weiter-Knopf, nicht erneut notiert.

### Z7.1–Z7.3 — R5 — Alle vier Antwortfelder liegen im breiten/Quer-Layout gleichzeitig offen und sprengen das Wortbudget um das Doppelte bis Dreifache
- **Screenshot:** /tmp/khpl-shots/zerspanung/khpl-zerspanung-20-z7-meister.png (~105 Wörter sichtbar), khpl-zerspanung-22-z7-techniker.png, khpl-zerspanung-23-z7-studium.png
- **Datei:** src/khpl/steps/zerspanung/Z7Weg.tsx:97-122 (`Antwortliste`, Zweig `!schmal`: `<dl>` rendert alle Abschnitte gleichzeitig offen, kein Akkordeon)
- **Fix:** R5 gilt auch im breiten/Quer-Layout — die Datei selbst löst das Problem für schmale Screens bereits korrekt (Zeile 125-163: erstes Feld offen, Rest per Tap). Dieselbe Klapplogik auch im `!schmal`-Zweig verwenden (z. B. `WIE LANGE` und `WAS ES KOSTET` initial eingeklappt, nur `WAS IST DAS`/erster Abschnitt offen), oder die Feldtexte auf das Wesentliche kürzen (aktuell 20–45 Wörter pro Feld statt der für R5 kalkulierten Kürze). Sonst begrüßt der Screen mit einer Wand aus vier Absätzen, obwohl das System an jeder anderen Stelle genau dagegen baut (Klappzeilen, Wortbudget).

## Z8 — Dein nächster Schritt

Z8: sauber (Linse system) — vollflächige Bühne (Orange-Marke über Foto, R1 erfüllt durch bewusste Markenfläche statt Leerraum), keine Kollision, „Noch einen Beruf" bleibt gegen die dunkle Fußleiste kontrastreich lesbar. Das orange „Noch einen Beruf" ist dieselbe dokumentierte, systemische R3-Entscheidung wie überall (`variant="weiter"`), hier nicht erneut aufgeführt. Letzter Schritt der Rail, keine weiteren Auffälligkeiten.

