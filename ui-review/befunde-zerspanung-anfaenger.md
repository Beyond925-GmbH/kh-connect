# Befunde Zerspanung — Linse Anfänger (16-Jährige ohne Vorwissen)

Regeln geprüft: R10–R14 (Kernlinse) plus R4–R6 auf Textebene, gegen
`khpl-designregeln.md`.

## Z1 — Null Komma null zwei eins

### Z1 — R6 — Der Screen-Titel spricht die gesuchte Zahl von Anfang an laut aus
- **Screenshot:** /tmp/khpl-shots/zerspanung/khpl-zerspanung-01-z1-initial.png (auch sichtbar in -02, -03, -04)
- **Datei:** src/khpl/berufe/zerspanung.ts:64 (`titel: 'Null Komma null zwei eins'`), verwendet in src/khpl/steps/zerspanung/Z1.tsx (StepShell id="Z1")
- **Befund:** Der Titel steht schon in der Schätzphase (Screenshot 01, bevor aufgelöst wird) über dem Slider — und er ist die ausgeschriebene Lösung: „Null Komma null zwei eins" = 0,021 mm, exakt der Toleranzwert, den der Slider gerade erraten soll. R6 verbietet das ausdrücklich: „Die Überschrift verrät nie die Zahl, die gerade geschätzt wird." Wer lesen kann (auch nur den Titel, ohne den Slider anzufassen), kennt die Antwort, bevor er zieht — der ganze Schätzmoment (laut Kommentar im Code „der eine Schätzmoment dieses Tages") ist entwertet.
- **Fix:** Titel umbenennen auf etwas, das das Thema nennt, aber den Wert nicht vorwegnimmt, z. B. `titel: 'Wie viel darf danebengehen?'` oder `titel: 'Der Spielraum, den niemand sieht'`. Den ausgeschriebenen Wert „Null Komma null zwei eins" stattdessen als Signatur-Moment in der Auflösung verwenden (z. B. als eyebrow/Zwischentitel über der `kh-zahl` in `Aufloesung`), dort wo laut R6 „die ausgeschriebene Zahl als Titel der Auflösung stark" ist.

### Z1: sonst sauber (Linse anfaenger)
Glossar-Chips (Passung, Toleranz) sind vorhanden und erklären h7 im Fließtext. Der „Ein Blatt Papier"-Dialog und der Haar-Vergleich liefern Körper-Anker (R12). Die Abweichungs-Zeile „enger, als nötig wäre" beschämt nicht (R11). Der Abstecher Z1.1 zeigt ein echtes Werkstattfoto (R13-Ansatz). Ton ist durchgehend Meister-zu-Azubi (R14), z. B. „Enger heißt nicht besser — enger heißt teurer."

## Z2 — Alles muss sitzen, bevor irgendwas läuft

Z2: sauber (Linse anfaenger). Alle vier Handgriffe erklären ihr Fachwort im selben Satz (z. B. „Werkzeuglängen vermessen — die Maschine muss wissen, wie weit jede Schneide vorsteht"), der Nullpunkt-Höhepunkt trägt einen Körper-Anker über die Zahl „400 Teile um einen Zehntel falsch" (R12). Der Abstecher Z2.1 verknüpft Kühlschmierstoff explizit mit der Toleranz aus Z1 statt einer isolierten Kuriosität, Ton bleibt trocken-direkt (R14). Kleinbefund ohne eigene Regel-Kategorie: Die Achsbeschriftungen „X"/„Z" auf der gelösten Zeichnung (Screenshot 07) bleiben unerklärt — nicht blockierend, da sie Werkzeug/Koordinaten-Kontext sind und der Fließtext den Nullpunkt bereits erklärt.

## Z3 — Zeile für Zeile

### Z3 — R10 — Die 14-Zeilen-G-Code-Wand lizensiert das Nichtwissen nicht, obwohl genau dieses Beispiel in den Designregeln als Referenzfall steht
- **Screenshot:** /tmp/khpl-shots/zerspanung/khpl-zerspanung-10-z3-initial.png
- **Datei:** src/khpl/steps/zerspanung/Z3.tsx:178–184 (`warum`), Klammer-Kommentare in src/khpl/buehne/zerspanung/kanon.ts:101–117
- **Befund:** `khpl-designregeln.md` R10 nennt als Positivbeispiel wörtlich „14 Zeilen. Du musst keine davon können." — exakt die Situation in Z3 (ein 14-zeiliges CNC-Programm). Der tatsächliche Screen sagt stattdessen im Warum-Text „Lesen können muss man es, bevor man Start drückt." Das ist eine Anforderung, keine Lizenz zum Nichtwissen — für einen 16-Jährigen, der zum ersten Mal G-Code sieht (`G96 S200 M4`, `T0101`, `G50 S4000`), wirkt der Screen dadurch wie eine Prüfung „kannst du das lesen?" statt einer geführten Erkundung. Die Klammer-Kommentare zu jeder Zeile helfen zwar beim Übersetzen, aber es fehlt der ausdrückliche Freibrief, dass die Syntax selbst nicht auswendig gelernt werden muss.
- **Fix:** Im `warum`-Absatz einen zweiten Satz ergänzen, der das Nichtwissen ausdrücklich erlaubt, z. B.: „Das Programm sagt der Maschine, wohin das Werkzeug fährt. 14 Zeilen — du musst keine einzige davon auswendig können, nur lesen, was als Nächstes passiert." Alternativ als eigene Zeile über der Programmliste, damit sie vor dem ersten Tap sichtbar ist.

### Z3 — R10 — „Schneidenradiuskorrektur" fliegt als unerklärter Fachbegriff durch eine Klammer-Zeile
- **Screenshot:** /tmp/khpl-shots/zerspanung/khpl-zerspanung-10-z3-initial.png (Zeile 2, Kommentar erscheint beim Antippen von „Nächste Zeile")
- **Datei:** src/khpl/buehne/zerspanung/kanon.ts:104
- **Befund:** Der Kommentar zu Zeile 2 lautet „Millimeter, keine Schneidenradiuskorrektur, absolut". „Schneidenradiuskorrektur" ist ein hochspezifisches Fachwort ohne Glossar-Chip und ohne Erklärung im Fließtext — R10 verlangt, dass jeder unerklärte Fachbegriff entweder einen Glossar-Chip bekommt oder rausfliegt. Für eine Rüstzeile, die ohnehin nicht antippbar ist und für die Übung keine Rolle spielt, lohnt sich keine Erklärung.
- **Fix:** Kommentar vereinfachen, z. B. `kommentar: 'Millimeter, keine Sonderkorrektur, feste Nullpunkte'` oder kürzer `'Grundeinstellung der Steuerung'` — der Begriff „Schneidenradiuskorrektur" gehört ganz raus, da er für die Lektion des Screens (falsches Vorzeichen in einer Fahrzeile) nichts beiträgt.

## Z4 — Der stillste Raum der Firma

### Z4 — R13 — Das Foto zeigt eine Halle mit Spänen und Bohrer statt des beschriebenen ruhigen, sauberen Messraums
- **Screenshot:** /tmp/khpl-shots/zerspanung/khpl-zerspanung-12-z4-initial.png
- **Datei:** src/khpl/berufe/zerspanung.ts:256–259 (`Z4: { src: '.../quiz-praezision.webp' }`), Text in src/khpl/steps/zerspanung/Z4.tsx:120–123
- **Befund:** Der Fließtext verspricht „Zwei Türen weiter, und die Halle ist weg. Hier ist es leise, sauber und immer gleich warm" — das Bild daneben zeigt aber eine Nahaufnahme von Bohrer/Spindel direkt über einem Werkstück mit sichtbaren Spänen, wie mitten im Zerspanungsprozess in der lauten Halle. Für einen 16-Jährigen, der Text und Bild zusammen liest, widerspricht das Bild der Aussage „die Halle ist weg" direkt — der ruhige Ortswechsel, den R13 als „Warum das zählt"-Beat mit Bühnen-Prominenz verlangt, wird visuell nicht eingelöst, sondern sein Gegenteil gezeigt. Der Code-Kommentar selbst beschreibt das Bild als „Werkzeug über einem Stahlmaßstab" — im Screenshot ist davon kein Maßstab zu erkennen, nur Bohrer und Werkstück.
- **Fix:** Ein Motiv verwenden, das tatsächlich einen Messraum/eine Messbank zeigt (Bügelmessschraube, Höhenmessgerät, ruhige helle Umgebung) — falls im Bestand keins existiert, das an anderer Stelle bereits genutzte Mikrometerschraube-Motiv aus Z5 hier vorziehen oder ein neues Pexels-Motiv „Messraum"/„Kalibrierung" beschaffen. Bis dahin den Text nicht „leise, sauber" behaupten lassen, wenn das Bild lautes Zerspanen zeigt.

## Z5 — Und, passt es?

Z5: sauber (Linse anfaenger). Musterhaft für R11: Ein falsches Urteil („Gut" statt „Nacharbeiten") löst keine Note aus, sondern das Toleranzband fährt ein und zeigt „Sieh es dir an" statt „Falsch". Werkzeugkorrektur wird im Fließtext erklärt und per Glossar-Chip vertieft, Körper-Referenz („von oben ans Maß heran") ersetzt trockene Zahlen-Iteration durch eine verständliche Faustregel. Kein Rot, kein Tadel-Ton — R14-konform.

## Z6 — Deins ist das erste

### Z6 — R13 — Der stärkste „Warum das zählt"-Moment des Tages (die Kiste mit den 400 Teilen) ist eine abstrakte Strichzeichnung statt eines echten Fotos oder Ergebnisses
- **Screenshot:** /tmp/khpl-shots/zerspanung/khpl-zerspanung-18-z6.png
- **Datei:** src/khpl/steps/zerspanung/Z6.tsx:43–45 (Code-Kommentar „Medienlücke... kein Motiv im Bestand"), Bühne `Werkstueck zustand="kiste"`
- **Befund:** Der Text liefert hier den stärksten Realitätsanker des ganzen Tages („Getriebe, Pumpen, Mähdrescher. Irgendwo fährt deins mit.", wörtliches Interview-Zitat) — aber die Bühne zeigt nur eine schematische Linienzeichnung einer leeren Kiste mit Platzhalter-Quadraten, kein Foto einer echten Kiste, eines echten Teils oder gar des genannten Mähdreschers/Getriebes. R13 verlangt „mindestens eine echte Stimme, ein echtes Foto oder ein echtes Ergebnis ... mit Bühnen-Prominenz" — genau an der Stelle, wo der Screen den Beruf mit der Außenwelt verknüpft („Will ich das sein?"), bleibt die Bühne abstrakt und technisch, wie jede andere Zeichnungs-Bühne des Tages auch. Die Lücke ist im Code bereits als bekannt vermerkt, bleibt für die Zielgruppe aber der auffälligste Bruch zwischen starkem Text und schwacher Bühne im gesamten Durchlauf.
- **Fix:** Ein echtes Foto einer Kiste mit fertig gedrehten Wellen/Teilen (oder ersatzweise ein Foto eines Mähdreschers/Getriebes als Sinnbild für „irgendwo fährt deins mit") als Bühnenmotiv ergänzen, sobald die Rechte/Freigabe vorliegen (§11 laut Code-Kommentar) — bis dahin den bekannten Platzhalter nicht als erledigt betrachten, da er gerade den zentralen R13-Beat des Berufs trägt.

## Z7 — Und danach?

### Z7 — R13/R14 — Die Meister-Karriereseite zeigt eine Holzwerkstatt statt eines Metall-/Zerspanungsbetriebs
- **Screenshot:** /tmp/khpl-shots/zerspanung/khpl-zerspanung-20-z7-meister.png
- **Datei:** src/khpl/berufe/zerspanung.ts:270 (`'Z7.1': { src: '/medien/schritte/b91-meister.webp' }`)
- **Befund:** Der Text auf Z7.1 beschreibt ausdrücklich den „Industriemeister Metall" — einen IHK-Weg, bewusst abgegrenzt vom Handwerksmeister (siehe Kommentar in `karrierewege.ts`: „kein Handwerksmeister … deutlich günstiger und kürzer als die drei Handwerksmeister"). Das Foto daneben zeigt zwei Personen in einer Holzwerkstatt (Wandbrett, Wanduhr, Holzbohle auf der Werkbank, Flanellhemd/Latzhose) — exakt dasselbe Bild (`b91-meister.webp`) wird wörtlich identisch auch bei Dachdecker (`B9.1`) und Zimmerer (`C8.1`) verwendet. Für einen 16-Jährigen, der gerade noch CNC-Programme und Mikrometerschrauben gesehen hat, widerspricht das Bild dem gerade gelesenen Text „kein Handwerksmeister" — es zeigt exakt das Gegenteil: eine Handwerks-/Holzszene. Das schwächt den R13-Anspruch „echtes Foto ... beantwortet 'Will ich das sein?'" für genau diesen Beruf.
- **Fix:** Ein zerspanungsspezifisches Motiv für `Z7.1` ergänzen (z. B. Ausschnitt aus den bereits vorhandenen `gallery-*.webp`-Motiven dieses Berufs — CNC-Maschine, Werkstatt mit Metallteilen) statt des app-weit geteilten Holzwerkstatt-Bilds; falls kein Ersatzmotiv zur Hand ist, wenigstens einen anderen Bildausschnitt/Betrieb wählen, der nicht wie eine Schreinerei aussieht.

Z7 (Übersicht, Techniker- und Studium-Karte) sowie Z7Weg (Info-Karten) sonst sauber: Zahlen zu Kosten/Dauer/Gehalt stehen konsequent als Spannen mit „rund", kein Meisterprämien-Versprechen, das für diesen IHK-Beruf nicht gilt (R14-Ehrlichkeit).

## Z8 — Dein nächster Schritt

Z8: sauber (Linse anfaenger). Der personalisierte Aufhänger greift den zuletzt angesehenen Karriereweg auf, das Abschlussfoto zeigt ein echtes Team am Maschinenbildschirm (R13), kein Spoiler, kein Notenton.

