# Verifikation — Anlagenmechanik — Design-Fixes

Läuft gegen http://localhost:5173/, Viewport 1366x1024, localStorage geleert.
Screenshots: /tmp/khpl-shots-nach/anlagenmechanik/

Status: abgeschlossen (Trichter komplett durchlaufen, A1–A9 inkl. aller vier Abstecher A1.1/A3.1/A4.1/A5-Chip sowie A8-Faktenliste quer).

## Zusammenfassung

Von 19 eingestuften Befunden (9 System, 10 Anfänger) sind **17 behoben**, **1 offen** (A1 R1, Bühnenfüllung), **1 teilweise behoben/offen** (A2 R1). Zusätzlich 1 Regression: der systemweite Weiter=limette-Fix (R3) erzeugt auf A6 ein neues Duo aus zwei gleichzeitig gefüllten Limette-Flächen (Rueckmeldung-Banner + Weiter-Button) — derselbe R8-Verstoß wie vorher, nur mit anderen Elementen.

## A1 — Kein warmes Wasser

- **A1 R3/R8 (System) — Weiter-CTA orange↔limette invertiert**: BEHOBEN. „Weiter zur zweiten Adresse" ist jetzt voll limette gefüllt, „Ich weiß, woran es liegt" (aktion) ist limette-Kontur (nicht mehr gefüllt) — konsistent mit R3. Screenshot: /tmp/khpl-shots-nach/anlagenmechanik/nach-A1-geloest.png, nach-A1-initial.png
- **A1 R3 (System) — „geschafft"-Stempel pillenförmig gefüllt**: BEHOBEN. „✓ STÖRUNG GEFUNDEN" ist jetzt eine reine Text-Zeile mit Haken-Icon, keine gefüllte Pille mehr. Auf dem gelösten Screen gibt es dadurch nur noch EINE gefüllte Limette-Fläche (der Weiter-Button) — R8 eingehalten. Screenshot: nach-A1-geloest.png
- **A1 R1 (System) — Obere Bildschirmhälfte bleibt leer**: OFFEN. Zeichnung sitzt weiterhin isoliert im rechten Drittel (ca. x=870–1300 von 1366), links davon und oberhalb (0–120px) bleibt die Fläche komplett leer bis auf den Fortschritts-Chip. Kein sichtbarer Unterschied zum Vorher-Zustand. Screenshot: nach-A1-initial.png
- **A1 R10 (Anfänger) — „Vorlauf" unerklärt im Prüfungsergebnis**: BEHOBEN. Der Ergebnistext zur Prüfung „Läuft der Kessel?" wurde umformuliert („Das Wasser geht heiß hinaus, die Heizkörper werden warm.") — das Wort „Vorlauf" kommt im String nicht mehr vor (verifiziert im Quellcode `A1.tsx:96-101`).
- **Wegkarte „Wohin als Nächstes?" (Zusatzbeobachtung, hängt an R3/R8-Fix)**: BEHOBEN. Hauptweg-Kachel „Weiter zur zweiten Adresse" ist jetzt limette gefüllt statt orange umrandet, Nebenweg neutral mit orangem Pfeil-Icon. Screenshot: nach-A1-abstecher-angebot.png
- **A1.1 R5 (Anfänger) — vier Absätze gleichzeitig offen (~106 Wörter)**: BEHOBEN. Nur der erste Warum-Absatz (~40 Wörter) ist offen sichtbar, die beiden Absätze zu Rotation/Bezahlung liegen jetzt hinter einer eigenen, geschlossen startenden Klappzeile „Wer fährt, und wie wird das bezahlt?" — exakt der vorgeschlagene Fix. Öffnen der Klappzeile funktioniert und zeigt den Rest sauber an. Screenshots: nach-A11-abstecher.png (geschlossen), nach-A11-abstecher-offen.png (geöffnet)

## A2 — Vierzig Jahre Keller

- **A2 R1 (System) — Obere zwei Drittel der Bühne leer, Kellerhaus zu klein**: TEILWEISE BEHOBEN / OFFEN. Der Gebäudeschnitt ist jetzt deutlich größer und füllt die rechte Spalte fast von oben (y≈72) bis fast zum Panel (y≈620) — das Haus wirkt nicht mehr "zu klein und mittig verloren". Das linke Zweidrittel der Fläche (x=0–870) bleibt aber über die komplette Bildhöhe bis auf den Fortschritts-Chip leer — der Kernbefund "riesige leere Fläche links" besteht fort. Screenshot: nach-A2-initial.png
- **A2 R2 (System) — Glossar-Popover-Pfeilspitze sticht durch Titeltext**: BEHOBEN. Getestet mit Popover „Hydraulischer Abgleich" (identischer Fall wie im Befund) — der Titel steht sauber ohne Kerbe/Artefakt, kein Pfeil sticht in den Text. Auch das Popover „Vorlauf und Rücklauf" ist sauber. Screenshots: nach-A2-glossar-hydraulisch.png, nach-A2-glossar-vorlauf.png
- **Zusatzbeobachtung**: „Keller gelesen"-Stempel ist Text ohne Pillenform (konsistent mit A1-Fix), „Weiter zum Rechnen" limette gefüllt.

## A3 — Wie viel Wärme braucht ein Haus?

- **A3 R3 (System) — Slider-Griff orange statt limette**: BEHOBEN. Der Regler-Griff ist jetzt limette (mit limette Glow), passend zur limette „22 KW"-Zahl darüber. Screenshot: nach-A3-initial.png
- **A3 R12 (Anfänger) — Zahlen 10–14 kW / 7,4 t → 2,4 t ohne Körper-Anker**: BEHOBEN. Auflösung zeigt jetzt „10 bis 14 Kilowatt — so viel ziehen fünf bis sieben Wasserkocher gleichzeitig." und „7,4 Tonnen — das wiegt so viel wie fünf Kleinwagen." Auch der Dialog „Woher kommt diese Zahl?" (70–100 W/m²) trägt jetzt denselben Wasserkocher-Vergleich. Screenshot: nach-A3-geloest.png
- **A3.1 R5 (Anfänger) — drei Warum-Absätze + Aha-Text gleichzeitig offen (~140 Wörter)**: BEHOBEN. Nur Absatz 1 (Preis der Wärmepumpe, 27.000–40.000 €) plus Aha-Satz sind offen; die Absätze zu Geräteanteil und Förderung liegen jetzt hinter der geschlossen startenden Klappzeile „Was zahlt der Staat dazu?". Screenshot: nach-A31-abstecher.png
- **A3.1 R10 (Anfänger) — „KfW" unerklärt**: BEHOBEN. Satz umformuliert zu „Wer es genau wissen will, sieht bei der KfW nach — der staatlichen Förderbank." — exakt der vorgeschlagene Fix.

## A4 — Der kürzeste Weg ist nicht der richtige

- **A4 R8 (System) — „Leitung liegt" sieht in jedem Zustand identisch (deaktiviert) aus**: BEHOBEN. Getestet mit drei Zieh-Versuchen: (1) kurzer Stub ohne Ziel → Button bleibt deaktiviert/matt-grau; (2) Weg über die tragende Wand → Abweisung „Da geht nichts durch — das ist tragend." + Button bleibt deaktiviert; (3) vollständiger Weg über die untere Reihe (2 Bögen) bis zum Verteiler → Button wechselt sichtbar zu einer hell umrandeten Limette-Kontur mit weißem Text. Der Kontrastsprung deaktiviert→aktiv ist jetzt eindeutig wahrnehmbar, nicht mehr nur 40% Opacity. `amZiel()` erkennt das Ziel zuverlässig. Screenshots: nach-A4-versuch1.png (Stub), nach-A4-versuch3.png (Wand-Abweisung, 1 Bogen), nach-A4-versuch4.png (Ziel erreicht, Button aktiv, 2 Bögen)
- **A4.1 R10 (Anfänger) — „Fitting", „Lot", „entgraten" unerklärt**: BEHOBEN. „Lot" → „Lötzinn", „Fitting" → „Verbindungsstück" (beide Wörter ersetzt), „entgraten" bleibt als Fachwort stehen, wird aber jetzt im Satz selbst erklärt: „die scharfe Kante abfeilen — entgraten heißt das —". Screenshot: nach-A41-abstecher.png

## A5 — Halb eins, im Transporter

- **A5 R3 (System) — Frage-Chips hart auf Orange statt Wahlflaeche-Limette-Konvention**: BEHOBEN. Der angetippte Chip „Wie viele Adressen sind das an einem Tag?" ist jetzt vollflächig limette gefüllt (statt orange), konsistent mit A2/A4.1. Screenshot: nach-A5-geloest.png
- **A5 R5 (Anfänger) — „Warum das so ist" zeigt ~68 Wörter vor jeder Interaktion**: BEHOBEN. Nur der erste Absatz (~30 Wörter, Ankunft/Pause) ist offen; der zweite Absatz („Nicht jeder Kunde ist geduldig…") liegt jetzt hinter der geschlossen startenden Klappzeile „Und wenn der Kunde ungeduldig wird?". Screenshot: nach-A5-initial.png

## A6 — Es läuft

- **A6 R12 (Anfänger) — Einheit „bar" ohne Körper-Anker**: BEHOBEN. Faustformel-Text endet jetzt mit „Zum Anfassen: 1 bar ist ungefähr der Luftdruck, der gerade auf dir liegt — die Anlage braucht nur ein bisschen mehr." — exakt der vorgeschlagene Fix. Screenshot: nach-A6-initial.png
- **A6 R8 (System) — Zwei gefüllte Limette-Flächen gleichzeitig im Fuß**: OFFEN / NEUE AUSPRÄGUNG DERSELBEN REGEL-VERLETZUNG (Regression durch den R3-Fix). Der ursprünglich gemeldete Fall (Stempel + Weiter beide limette) ist behoben — der „IN BETRIEB"-Stempel ist jetzt reiner Text ohne Füllung. Aber weil „Weiter" jetzt grundsätzlich limette gefüllt ist (R3-Fix), entsteht auf A6 ein NEUES Duo: die große `Rueckmeldung`-Erfolgsfläche „Druck steht. Die Anlage darf starten." (limette gefüllt) UND der „Weiter nach oben"-Button (ebenfalls limette gefüllt) stehen gleichzeitig im Bild — zwei gefüllte Signalflächen, R8 „genau ein limettes Element" weiterhin verletzt, nur mit anderen Elementen als vorher gemeldet. `Rueckmeldung.tsx`s eigener Kommentar („Gelbgrün ist im ganzen System für genau das reserviert — es taucht sonst nirgends als Fläche auf") stimmt dadurch weiterhin nicht. Screenshot: nach-A6-geloest.png

## A8 — Und danach? (Meister · Techniker · Studium)

- **A8.1 R10 (Anfänger) — „Aufstiegs-BAföG" unerklärt**: BEHOBEN. Text ergänzt zu „Das Aufstiegs-BAföG — ein staatlicher Zuschuss für Weiterbildungen wie den Meister — übernimmt davon den größten Teil" — exakt der vorgeschlagene Fix.
- **A8.1–A8.3 R5/R10 (Anfänger) — Fünf Faktenblöcke im Querformat gleichzeitig offen**: BEHOBEN. Bei 1366 px Breite (Querformat) zeigt die Faktenliste jetzt exakt dasselbe Akkordeon-Verhalten wie die schmale Fassung: nur „Was ist das" startet offen, „Wie lange", „Was es kostet", „Was du verdienst", „Was NRW dazugibt" sind geschlossen und lassen sich einzeln öffnen. Screenshot: nach-A8-meister.png

## A9 — Dein nächster Schritt / Zusatzbeobachtungen

- **„Noch einen Beruf" (A1-Befund erwähnt `variant="weiter"`)**: BEHOBEN. Button ist jetzt limette gefüllt, konsistent mit dem systemweiten Weiter-Fix. Screenshot: nach-A9.png
- **„Dein Weg"-Overlay — besuchte Schritte/Abstecher limette (Welle-1-Fix)**: BEHOBEN. Besuchte Hauptschritte (1–9) sind limette umrandete Kreise mit limette Nummer, besuchte Abstecher („Löten, pressen, stecken", „Meister") tragen einen limette Haken-Kreis, „DU BIST HIER" ist eine limette gefüllte Pille. Nicht besuchte Abstecher zeigen weiterhin einen orangen „noch offen"-Chip (Fakt/Welt-Farbe, korrekt). Screenshot: nach-DeinWeg.png

---

## Regressionen (durch die Fixes verursacht)

1. **A6 — Zwei gefüllte Limette-Flächen gleichzeitig** (siehe oben unter A6 R8): Die generelle Umstellung „Weiter = immer limette gefüllt" (R3-Fix) kollidiert auf Screens mit einer `Rueckmeldung`-Erfolgsbanner (aktuell nur A6 im Anlagenmechanik-Weg beobachtet) mit der Regel „genau ein limettes Element pro Screen". Die große Erfolgsfläche „Druck steht. Die Anlage darf starten." und der „Weiter nach oben"-Button sind gleichzeitig limette gefüllt. Screenshot: /tmp/khpl-shots-nach/anlagenmechanik/nach-A6-geloest.png. Das ist keine Neuerscheinung eines neuen Bugs, sondern derselbe R8-Verstoß in neuer Form — ein Nebeneffekt, den der Weiter-Fix nicht mitbedacht hat.

Sonst keine neuen Regressionen gefunden: Limette-Kontur-Buttons (Prüfen/Lösen/aktion) sind gut sichtbar und nicht zu schwach im Kontrast; keine neuen Layout-Sprünge; Bühnen-Framing bei A4 (Raster) und A5 (Transporter) bleibt bühnenfüllend ohne Abschneiden; Klappzeilen zeigen ihren Zustand klar (Pfeil-Icon auf/zu) und verstecken nichts ohne Hinweis — im Gegenteil, sie machen jetzt sichtbar, dass mehr Text folgt.

