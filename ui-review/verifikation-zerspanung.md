# Verifikation Zerspanung — Nach den Design-Fixes

Durchlauf: http://localhost:5173/, Viewport 1366x1024, localStorage geleert.
Screenshots: /tmp/khpl-shots-nach/zerspanung/

## Legende
- BEHOBEN: Fix sichtbar und wirksam
- OFFEN: unverändert oder Fix wirkungslos
- NICHT PRÜFBAR: Zustand nicht erreichbar
- OFFEN-ERWARTET: bereits als gemeldet/Medienlücke markiert, Zustand bestätigt unverändert (kein neuer Fehler)

---

## Z1 — Null Komma null zwei eins

- **Z1-R3 Slider-Griff orange statt limette** — BEHOBEN. `src/index.css:352-370` (`kh-regler`) nutzt jetzt `var(--color-kh-signal)` für Thumb (webkit+moz), `:disabled`-Ausnahme bleibt kh-mute (Zeile 374-384). Screenshot: z1-initial.png (siehe unten kopiert nach /tmp/khpl-shots-nach/zerspanung/01-z1-initial.png).
- **Z1-R3 Weiter-Knopf orange statt limette (systemisch, `variant="weiter"`)** — BEHOBEN. `src/components/ui/button.tsx:43-51`: `weiter` = `bg-kh-signal` (gefüllt), `aktion` = `border-kh-signal text-kh-signal` (Kontur). Sichtbar am Dialog-Knopf „Alles klar" (bg-kh-signal bestätigt per DOM) und am „Weiter an die Maschine"-Knopf (Screenshot z1-geloest.png, gefüllte Limette-Pille). Gilt systemisch für alle Steps (Z1, Z3, Z4, Z6, Z7, Z8).
- **Z1-R7 Slider-Endpunkte reine Zahlen statt Wort-Endpunkte** — BEHOBEN. Snapshot zeigt jetzt „grob · 1,000 mm" links und „fein · 0,010 mm" rechts (Z1-initial-Snapshot, ref f1e309/f1e310).
- **Z1-R1 Obere Bühnenhälfte leer nach Auflösung** — BEHOBEN. Screenshot z1-geloest.png: Der Toleranzkreis füllt jetzt fast die gesamte Bühnenhöhe (~100px bis ~530px von 1024 Bildschirmhöhe abzüglich Fußleiste), keine große leere Fläche mehr oben.
- **Z1-R6 Titel verrät die gesuchte Zahl** — BEHOBEN. Titel jetzt „Der Spielraum, den niemand sieht" (statt „Null Komma null zwei eins“); der ausgeschriebene Wert erscheint stattdessen als Eyebrow über der `kh-zahl` in der Auflösung (genau der im Befund vorgeschlagene Fix).

Hinweis: Der Vergleichsbalken „Du hast 0,500 mm geschätzt" (Z1.tsx `Vergleich`-Komponente) ist kein `kh-regler`-Slider, sondern eine statische Vergleichsleiste mit orangem Marker für den Weltwert (Toleranz) — das ist korrekt (orange=Welt), keine Regression.

## Z2 — Alles muss sitzen, bevor irgendwas läuft

- **Z2-R8 Handgriffkarte orange statt Limette-Affordanz** — BEHOBEN. `src/khpl/steps/zerspanung/Z2.tsx:232-233`: aktive Karte jetzt `border-kh-signal bg-kh-signal/14 shadow-[0_0_18px_rgba(216,246,60,0.35)]`, unerledigte `border-kh-signal/55 bg-kh-signal/8`. Screenshot z2-initial.png zeigt limette Kontur/Glow um „Rohling spannen"-Karte.
- **Z2-R1 Obere Bühnenhälfte fast leer** — BEHOBEN. Screenshot z2-initial.png: Rohling-Zeichnung + Rundmaterial-Symbol füllen jetzt den oberen Bereich deutlich größer und zentrierter (von ~200px bis ~570px), keine große leere schwarze Fläche mehr.
- **Z2.1-R5 Beide Aha-Karten öffnen automatisch, Wortbudget gesprengt** — BEHOBEN. Screenshot z21-abstecher.png: Nur die erste Aha-Karte („Warum ist der Span das Heißeste…") ist automatisch offen (Chevron nach oben), die zweite („Und wenn niemand nachfüllt?") bleibt eingeklappt (Chevron nach unten) bis angetippt. Sichtbarer Text jetzt bei ca. 50–55 Wörtern statt ~90.

## Z3 — Zeile für Zeile

- **Z3-R3 „Start drücken" orange statt limette (Teil des systemischen Weiter-Fixes)** — BEHOBEN. DOM bestätigt `bg-kh-signal` (Screenshot z3-geloest.png).
- **Z3-R10 G-Code-Wand ohne Freibrief zum Nichtwissen** — BEHOBEN. `Z3.tsx:184-189` (warum-Absatz): „14 Zeilen, und du musst keine davon können: einmal durchgehen reicht, bevor jemand Start drückt." ersetzt den alten Satz „Lesen können muss man es, bevor man Start drückt."
- **Z3-R10 „Schneidenradiuskorrektur" unerklärter Fachbegriff** — BEHOBEN. `kanon.ts:107`: Kommentar zu Zeile 2 jetzt „Grundeinstellung der Steuerung" (bestätigt im Snapshot: „Zeile 2 von 14 · rüstet / Grundeinstellung der Steuerung"), Fachbegriff entfernt.
- Fehlersuche funktioniert weiterhin sauber, kein Rot beim Fehlversuch (nur Text „Diese Zeile stimmt."), Erfolgsmeldung „Gefunden." — kein Rückschritt bei R11.

## Z4 — Der stillste Raum der Firma

- **Z4-R3 systemischer Weiter-Knopf** — BEHOBEN (Screenshot z4-gelesen.png, „Weiter zur Messbank" gefüllt limette). „Gelesen"-Häkchen an den Fragen-Pillen weiterhin korrekt limette.
- **Z4-R13 Foto zeigt laute Halle statt ruhigem Messraum** — OFFEN-ERWARTET (Medienlücke, wie gemeldet). `src/khpl/berufe/zerspanung.ts:260-263`: Bildpfad `quiz-praezision.webp` unverändert, zeigt weiterhin Bohrer/Spindel über Werkstück mit Spänen statt Messraum/Messbank — Text „leise, sauber" widerspricht weiterhin dem Bild (Screenshot z4-initial.png).

## Z5 — Und, passt es?

- **Z5-R4 Anweisungssatz bleibt stehen, obwohl Takt gewechselt hat** — BEHOBEN. Durchlauf bestätigt korrektes Takt-Tracking: Takt „urteilen" zeigt „Und, passt es?" (statt stehengebliebenem „Dreh die Messschraube..."), Takt „gemessen" zeigt gar keinen Anweisungssatz mehr (auftrag=null, Aktion ist „Nächstes Teil"), Takt „korrigieren" zeigt „Stell den Korrektor nach und lass noch eins laufen." (Screenshots z5-gemessen.png, z5-korrigieren.png) — exakt der im Befund vorgeschlagene Fix.
- Weiterhin sauber: Toleranzband korrekt limette=drin/orange=Messwert, „Nächstes Teil"/„Noch eins laufen lassen" limette (`aktion`), kein Rot bei Fehlurteil, Slider-Griff limette (systemischer Fix greift auch hier).

## Z6 — Deins ist das erste

- **Z6-R13 Kiste bleibt abstrakte Strichzeichnung statt echtem Foto** — OFFEN-ERWARTET (Medienlücke, wie im Code-Kommentar dokumentiert §11). Screenshot z6.png: weiterhin schematische Linienzeichnung der Kiste mit Platzhalter-Quadraten, kein Foto von echten Teilen/Mähdrescher.
- **Z6-R3 systemischer Weiter-Knopf** — BEHOBEN (Screenshot z6.png, gefüllte Limette-Pille „Weiter"). Häkchen der Rückblick-Liste weiterhin korrekt limette.

## Z7 / Z7.1–Z7.3 — Und danach?

- **Z7.1–Z7.3-R5 Alle vier Antwortfelder im breiten/Quer-Layout gleichzeitig offen** — BEHOBEN. Screenshot z7-meister.png (1366×1024, Quer-Layout): Nur „Was ist das" ist initial offen (Chevron nach oben), „Wie lange"/„Was es kostet"/„Was du verdienst" bleiben eingeklappt (Chevron nach unten), auch im breiten Zweispalten-Layout. Sichtbarer Text jetzt ca. 45 Wörter statt ~105.
- **Z7-R13/R14 Meister-Karriereseite zeigt Holzwerkstatt statt Metall-/Zerspanungsmotiv** — BEHOBEN. `src/khpl/berufe/zerspanung.ts:285-288`: Bildpfad jetzt `schaetzen-spindel.webp` (Werkzeug im Futter einer Metall-CNC) statt geteiltem `b91-meister.webp` (Holzwerkstatt). Screenshot z7-meister.png zeigt CNC-Spindel mit Kühlmittelschlauch, passt zum Text „Industriemeister Metall".

## Z8 — Dein nächster Schritt

- **Z8-R3 systemischer Weiter-Knopf** — BEHOBEN (Screenshot z8-final.png, „Noch einen Beruf" gefüllte Limette-Pille). Vollflächige Bühne, keine Kollision.

## Wave-1-Fixes — systemweite Bestätigung (Zerspanung-Durchlauf)

- **Weiter-Knopf jetzt gefüllte Limette** — BEHOBEN, durchgängig bestätigt (Z1 „Weiter an die Maschine", Z2 „Weiter zur Steuerung", Z3 „Start drücken", Z4 „Weiter zur Messbank", Z6 „Weiter", Z7 „Weiter", Z8 „Noch einen Beruf"). Quelle: `button.tsx:43-47` (`variant="weiter"` = `bg-kh-signal`).
- **Prüfen/Lösen-Knöpfe Limette-Kontur** — BEHOBEN. `button.tsx:48-51` (`variant="aktion"` = `border-kh-signal text-kh-signal`), sichtbar an „Nächstes Teil"/„Noch eins laufen lassen" (Z5) und „Gut/Nacharbeiten/Ausschuss" (Z5-Urteilsknöpfe).
- **Slider-Griff limette** — BEHOBEN. `index.css:352-370` (`kh-regler`), bestätigt an Z1-Toleranzslider und Z5-Mikrometerschraube.
- **„geschafft"-Stempel ohne Pillenform** — BEHOBEN. `Verzweigung.tsx:101-116` (`data-testid="geschafft"`): reine Statuszeile (Haken + Text in Limette), keine Füllfläche, keine Pillenform — bestätigt bei „Toleranz gelesen" (Z1), „Gerüstet" (Z2), „Fehler gefunden" (Z3), „Maß sitzt" (Z5). Die „geschafft"/„du bist hier"-Chips auf der Berufsliste (`Berufsliste.tsx:216-243`) sind separate Elemente und bleiben bewusst `rounded-kh-pill` (Statuschip, kein Interaktions-Button) — kein Widerspruch zum Fix.
- **Dein-Weg besucht limette** — BEHOBEN. Screenshot dein-weg.png: besuchte Abstecher/Karrierewege („Wer zeichnet das?", „Warum es überall spritzt", „Meister", „Techniker") tragen limette Häkchen-Kreise statt Orange.
- **Akkordeons auch quer** — BEHOBEN. Screenshot z7-meister.png (1366×1024 Querformat): Z7Weg-Antwortfelder sind auch im breiten Layout als Akkordeon umgesetzt (nur ein Feld initial offen), nicht mehr alle vier gleichzeitig sichtbar.

## Regressionen

Keine gefunden. Im gesamten Durchlauf:
- Keine zwei gleichzeitig gefüllten Limette-Flächen auf einem Screen (Weiter-Knopf limette gefüllt + geschafft-Zeile limette Text, aber unterschiedliche Formsprache — klar unterscheidbar).
- Limette-Kontur-Knöpfe (`aktion`) bleiben gut lesbar (weiße Schrift auf dunklem Grund mit 2px Limette-Kontur), kein Kontrastproblem beobachtet.
- Bühnen-Framing wirkte in allen Steps (Z1–Z8) eher großzügiger/zentrierter als vorher, keine neuen Abschneidungen oder zu engen Ausschnitte festgestellt.
- Klappzeilen (Z7Weg-Akkordeon) verstecken Inhalt nicht ohne Hinweis — Chevron-Indikator klar sichtbar, erstes Feld bleibt offen als Vorschau.
- Keine neuen Layout-Sprünge beim Fix-Rollout bemerkt.
