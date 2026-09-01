# Medien — `public/medien/schritte/`

Die Motive, die die Step-Screens tragen. Zugekauft wurde nichts: alles Pexels,
heruntergeladen am 2026-08-18 — mit **einer Ausnahme**: die zwölf
Bauteilfotos der Anlagenmechanik (sechs in A1, sechs in A2) stammen von
Wikimedia Commons und sind teils CC BY-SA, also
**namensnennungspflichtig**. Ihre Quellen stehen im Abschnitt
„Anlagenmechanik“ unten, die Namensnennung in der App im Sheet „Dein Weg“
(Bildnachweis).

**Lizenz (Pexels-Bestand):** [Pexels-Lizenz](https://www.pexels.com/license/)
— kostenlos, kommerziell nutzbar, keine Namensnennung nötig. Die
Urheber:innen stehen trotzdem unten, weil eine Datei ohne Herkunft in zwei
Jahren niemand mehr zuordnen kann.

**Technisch:** WebP, 1600 px breit, Qualität 82. Zusammen 1,9 MB. Die Bühne
eines Steps lädt `eager`, weil sie das Wichtigste auf dem Screen ist; ins
Erststart-Budget zählt nur das Motiv des Splash (flow 8.5).

Welcher Step welches Motiv trägt, steht **im Code** am Beruf (`bilder` in
`src/khpl/berufe/<beruf>.ts`) — dort zusammen mit dem Bildmittelpunkt. Diese
Datei ist die Herkunftsliste, nicht die Zuordnung.

| Datei | Step | Pexels | Urheber:in | Motiv |
| --- | --- | --- | --- | --- |
| `m1-ortstermin.webp` | M1 | [8961003](https://www.pexels.com/photo/8961003/) | Mikael Blomkvist | Gespräch auf der Baustelle, Klemmbrett in der Hand |
| `m2-kalkulation.webp` | M2 | [11269740](https://www.pexels.com/photo/11269740/) | Pilan Filmes | Hände über einem Grundriss, Maßstab und Taschenrechner |
| `m3-cad.webp` | M3 | [15764116](https://www.pexels.com/photo/15764116/) | Grove Brands | CAD-Modell eines Holzhauses am Monitor |
| `b31-lager.webp` | B3.1 | [12278570](https://www.pexels.com/photo/12278570/) | Mark Stebnicki | Gestapelte Bohlen in einer Lagerhalle |
| `m4-zuschnitt.webp` | M4 | [8447892](https://www.pexels.com/photo/8447892/) | Cristian Rojas (Los Muertos Crew) | Zimmerin an der Kappsäge |
| `b41-lagerhalle.webp` | B4.1 | [5484741](https://www.pexels.com/photo/5484741/) | Mike van Schoonderwalt | Gebündeltes Konstruktionsvollholz im Regal |
| `b51-team.webp` | B5.1 | [8829878](https://www.pexels.com/photo/8829878/) | Ron Lach | Zwei Personen am Sparrenwerk |
| `m6-pause.webp` | M6 | [8961262](https://www.pexels.com/photo/8961262/) | Mikael Blomkvist | Brotzeit am Holzbau |
| `m8-feierabend.webp` | M8 | [4370095](https://www.pexels.com/photo/4370095/) | Pebo Lieve | Haus im Abendlicht |
| `m9-karriere.webp` | M9 | [8830265](https://www.pexels.com/photo/8830265/) | Ron Lach | Blick von unten ins Sparrenwerk |
| `b91-meister.webp` | B9.1 | [7484154](https://www.pexels.com/photo/7484154/) | cottonbro studio | Zwei in der Werkstatt, einer erklärt |
| `b92-techniker.webp` | B9.2 | [3861946](https://www.pexels.com/photo/3861946/) | ThisIsEngineering | Ingenieurin an der technischen Zeichnung |
| `b93-studium.webp` | B9.3 | [31367507](https://www.pexels.com/photo/31367507/) | Yusuf Çelik | Studierende im Hörsaal |
| `intro-aufrichten.webp` | M10 | [37499254](https://www.pexels.com/photo/37499254/) | Serhat Tuğ | Zimmerer prüft das Sparrenwerk, Sonne |

## Zerspanung (Stand 2026-08-28)

Drei zusätzliche Pexels-Motive, WebP, 1400–1600 px breit. Sie liegen unter
`public/medien/media/zerspanungsmechaniker/` und nicht unter `schritte/`, weil
sie zu **einem** Beruf gehören.

| Datei | Wo | Pexels | Urheber:in | Motiv |
| --- | --- | --- | --- | --- |
| `z4-messraum.webp` | Z7 | [5290119](https://www.pexels.com/photo/5290119/) | Carlos Yanez | Messschieber, Zirkel und ein gedrehtes Teil auf dunklem Grund |
| `z6-kiste.webp` | Z6 | [12951634](https://www.pexels.com/photo/12951634/) | Instasky | Haufen gleicher gedrehter Hülsen |
| `z7-meister.webp` | Z8.1 | [3846262](https://www.pexels.com/photo/3846262/) | Olly | Älterer erklärt einem Jüngeren etwas an der Werkbank |

Die vollständige Motivliste des Tages steht in `berufe/zerspanung.ts`
(`bilder`), mit Begründung je Zuordnung. Die drei Übungs-Kerne (Z1 Zeichnung,
Z3 Werkzeugweg, Z4 Messschraube) sind **gezeichnet** (`buehne/zerspanung/`)
und tragen kein Foto — ein Foto, das etwas anderes zeigt als der Text daneben
behauptet, wäre der Fehler, nicht die Lösung. `b91-meister.webp` (Karriere,
Holzwerkstatt) ist für diesen Metallberuf bewusst nicht verwendet; Z8.1 trägt
das eigene Meister-Motiv.

### Anlagenmechanik: Bauteilfotos für A1 und A2, ein Nachtmotiv für A1.1, sonst gezeichnet

Für A3 wurde gesucht und **nichts eingebaut**. Der Bestand an
SHK-Motiven auf Pexels zeigt Fußbodenheizungs-Verteiler und
Wärmepumpen-Außeneinheiten; dieser Screen braucht aber vier benannte
Verlustflächen an **einem** Haus — und zwar an Stellen, die man treffen kann.
Ein Foto, das etwas anderes zeigt als der Text daneben behauptet, ist genau
der Fehler, der bei der Zerspanung schon einmal korrigiert wurde. A3 bleibt
deshalb gezeichnet; besser lesbar ist der Screen trotzdem geworden (Pfeile an
den Verlustflächen).

**A2 hat seine Fotos inzwischen bekommen** — nicht von Pexels, sondern nach
demselben Muster wie A1: **einzelne Bauteile** von Wikimedia Commons, jedes
für sich, ohne Anlage drumherum, über die es etwas Falsches behaupten könnte
(Abschnitt „A2“ unten). Der Einwand oben zieht dort nicht, weil der Screen
seit dem Kartenstapel kein Anlagenschema mehr zeigt, sondern ein Ding nach
dem anderen.

Gesucht und für später notiert, falls doch ein Foto gewünscht ist:
Pexels 7937299, 7937300 und 7937309 (Pavel Danilyuk, Heizkreisverteiler mit
Pumpe und Manometer), 12644994 (Boom, Hand am Thermostatventil), 5640691
(Tima Miroshnichenko, Manometer in der Hand).

#### A1.1: der Notdienst (Stand 2026-09-01)

Der Abstecher „Wer fährt eigentlich nachts?" trug bis hierher die
Transporter-Zeichnung bei Nacht — nicht als erste Wahl, sondern weil es für
ihn kein Motiv gab. Jetzt hat er eins: derselbe Standpunkt wie die Zeichnung
(über das Armaturenbrett, durch die Scheibe), nur echt. Auf einem Screen,
dessen ganze Frage „fährt da wirklich jemand?" lautet, ist genau das der
Unterschied. **A5 (Mittag im Transporter) behält seine Zeichnung** — die
frühere Klammer „eine Welt, zwei Zustände" gilt damit nicht mehr.

| Datei | Step | Pexels | Urheber:in | Motiv |
| --- | --- | --- | --- | --- |
| `anlagenmechaniker/a11-nachtfahrt.webp` | A1.1 | [1600909](https://www.pexels.com/photo/1600909/) | Lukas Rychvalsky | Blick über das Armaturenbrett durch eine nasse Windschutzscheibe, draußen Lichter im Regen |

WebP, 1600 px breit, **Qualität 74 statt 82** (150 KB): das Motiv ist eine
Nachtaufnahme mit sichtbarem Filmkorn, und Korn ist für WebP der teuerste
Bildinhalt überhaupt — bei 82 wog dieselbe Datei 225 KB, ohne dass im
Bühnenformat ein Unterschied zu sehen wäre.

Pexels-Lizenz, keine Namensnennung nötig — der Bildnachweis im Sheet „Dein
Weg" bleibt deshalb unverändert (er führt nur die CC-BY-SA-Bauteilfotos).
Geprüft auf lesbare Fremdmarken: keine. Sichtbar sind zwei Runduhren und ein
Radiodisplay, dessen Text (Sender, Uhrzeit) schon im 100-%-Ausschnitt kaum
und in Bühnengröße gar nicht lesbar ist.

#### A1: sechs Bauteilfotos (Stand 2026-08-31)

**A1 ist seit dem Kachel-Umbau die Ausnahme.** Die Fehlersuche läuft über
sechs Foto-Kacheln (`steps/anlagenmechanik/PruefKacheln.tsx`), und jede zeigt
**ein einzelnes Bauteil**, kein Anlagenschema — genau der Zuschnitt, an dem
das Argument oben nicht zieht: ein Foto, das nur eine Pumpe zeigt, kann über
die Anlage daneben nichts Falsches behaupten.

Quelle ist **Wikimedia Commons** (nicht Pexels), heruntergeladen am
2026-08-31, beschnitten und als WebP unter
`public/medien/media/anlagenmechaniker/` abgelegt (970–1200 px breit,
zusammen ~340 KB). Anders als bei der Pexels-Lizenz verlangt CC BY-SA die
**Namensnennung im Medium selbst** — die App trägt sie deshalb im Sheet
„Dein Weg“ unter „Bildnachweis“ (`src/khpl/shell/DeinWeg.tsx`); wer ein Foto
tauscht, zieht beide Stellen nach. Die Ausschnitte von `pruefung-kessel`,
`pruefung-speicher`, `pruefung-regelung`, `pruefung-ladepumpe` und
`pruefung-zirkulation` sind Bearbeitungen und stehen als solche **selbst
unter der jeweiligen CC BY-SA-Lizenz** (ShareAlike); nur `pruefung-mischer`
kommt aus einer CC0-Aufnahme.

| Datei | Prüfpunkt | Quelle (Commons) | Urheber:in | Lizenz | Motiv |
| --- | --- | --- | --- | --- | --- |
| `pruefung-kessel.webp` | Kessel | [Vitodens 200 condensing boiler.JPG](https://commons.wikimedia.org/wiki/File:Vitodens_200_condensing_boiler.JPG) | Boulderhydronics | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) | Wandhängender Gaskessel, Kupferrohre (Ausschnitt) |
| `pruefung-speicher.webp` | Speicher | [Hot water storage.jpg](https://commons.wikimedia.org/wiki/File:Hot_water_storage.jpg) | Julie Anne Workman | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) | Weißer Warmwasserspeicher mit Kupferrohren (Ausschnitt) |
| `pruefung-regelung.webp` | Regelung | [Dornbirn-Montfortstraße-KOeB Hackschnitzelheizung-Steuerung-02ASD.jpg](https://commons.wikimedia.org/wiki/File:Dornbirn-Montfortstra%C3%9Fe-KOeB_Hackschnitzelheizung-Steuerung-02ASD.jpg) | Asurnipal | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | Schaltfeld einer Heizungssteuerung: Lampen, beschriftete Schalter, Schaltuhren (Ausschnitt) |
| `pruefung-ladepumpe.webp` | Speicherladepumpe | [Dornbirn-Montfortstraße-Grundfos-Umwaelzpumpe-01ASD (cropped).jpg](https://commons.wikimedia.org/wiki/File:Dornbirn-Montfortstra%C3%9Fe-Grundfos-Umwaelzpumpe-01ASD_(cropped).jpg) | Asurnipal | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | Rote Grundfos-Umwälzpumpe an dickem Rohr (Ausschnitt) |
| `pruefung-zirkulation.webp` | Zirkulationspumpe | [Trinkwasser-Zirkulationspumpe.jpeg](https://commons.wikimedia.org/wiki/File:Trinkwasser-Zirkulationspumpe.jpeg) | wiDaki | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) | Kleine Trinkwasser-Zirkulationspumpe (Wilo Star Z) an Messingrohren (Ausschnitt) |
| `pruefung-mischer.webp` | Mischer | [Regelung Vorlauftemperatur Fußbodenheizung.jpg](https://commons.wikimedia.org/wiki/File:Regelung_Vorlauftemperatur_Fu%C3%9Fbodenheizung.jpg) | SchmiAlf | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) | Schwarzer Mischer-Drehgriff mit roter Skala an einem Rohr (Ausschnitt) |

Hinweis für die Abnahme: Auf den Fotos sind Herstellernamen lesbar
(Viessmann, Ariston, Grundfos, KÖB, Wilo, ESBE). Das ist bei echten
Bauteilen kaum zu vermeiden und hier Alltag statt Werbung — wer es dennoch
stört, tauscht das Motiv, nicht das Konzept.

#### A2: sechs Kellerfotos für den Kartenstapel (Stand 2026-09-01)

A2 sortiert seinen Keller seit dem Umbau als **Wischkarten**
(`steps/anlagenmechanik/KellerKarten.tsx`): ein Bauteil je Karte, links weg
heißt „fliegt raus", rechts weg heißt „bleibt". Dafür braucht jede Karte ein
Foto — ein Wort ist kein Ding, und „Ausdehnungsgefäß" ist für einen
Vierzehnjährigen genau ein Wort.

Quelle wie bei A1 **Wikimedia Commons**, heruntergeladen am 2026-09-01,
beschnitten auf **3:2** (die Kartenform) und als WebP unter
`public/medien/media/anlagenmechaniker/` abgelegt (767–1100 px breit,
zusammen ~320 KB). Fünf der sechs Ausschnitte stehen als Bearbeitung unter
der ShareAlike-Lizenz ihres Originals; `keller-kessel` ist CC BY. Die
Namensnennung steht in der App im Sheet „Dein Weg" (`shell/DeinWeg.tsx`) —
wer ein Foto tauscht, zieht beide Stellen nach.

| Datei | Karte | Quelle (Commons) | Urheber:in | Lizenz | Motiv |
| --- | --- | --- | --- | --- | --- |
| `keller-kessel.webp` | Ölkessel | [Home oil furnace.jpg](https://commons.wikimedia.org/wiki/File:Home_oil_furnace.jpg) | Versageek | [CC BY 2.5](https://creativecommons.org/licenses/by/2.5/) | Alter blauer Ölkessel im Keller, Manometer und angeflanschter Ölbrenner (Ausschnitt) |
| `keller-tank.webp` | Öltank | [Heizoelkeller.JPG](https://commons.wikimedia.org/wiki/File:Heizoelkeller.JPG) | Flux Garden | [CC BY-SA 2.5](https://creativecommons.org/licenses/by-sa/2.5/) | Drei Kunststoff-Batterietanks in einem Heizölkeller (Ausschnitt) |
| `keller-verteiler.webp` | Verteiler | [Heizkreisverteiler.jpg](https://commons.wikimedia.org/wiki/File:Heizkreisverteiler.jpg) | Tetris L | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) | Verteilerbalken mit Durchflussmessern, von dem die Heizkreise abgehen (Ausschnitt) |
| `keller-pumpe.webp` | Umwälzpumpe | [CentralHeatingPump.JPG](https://commons.wikimedia.org/wiki/File:CentralHeatingPump.JPG) | Mariegriffiths | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) | Grüne Wilo-Umwälzpumpe an einem Kupferrohr (Ausschnitt) |
| `keller-ausdehnungsgefaess.webp` | Ausdehnungsgefäß | [Diaphragm expansion tank, stopcock and drain valve.jpg](https://commons.wikimedia.org/wiki/File:Diaphragm_expansion_tank,_stopcock_and_drain_valve.jpg) | The RedBurn | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | Rotes Membran-Ausdehnungsgefäß an einer Kellerwand (Ausschnitt) |
| `keller-thermostatventile.webp` | Thermostatventile | [Danfoss thermostatic radiator valve.jpg](https://commons.wikimedia.org/wiki/File:Danfoss_thermostatic_radiator_valve.jpg) | Santeri Viinamäki | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | Vergilbtes Thermostatventil an einem alten Heizkörper (Ausschnitt) |

⚠️ **Zwei Kompromisse, die zur fachlichen Abnahme gehören:**

1. **Der Verteiler ist ein Fußbodenheizungs-Verteiler**, das Haus in A2 hat
   aber Heizkörper. Das Foto zeigt richtig, *was ein Verteiler tut* — hier
   teilt sich die Leitung auf die Kreise auf —, nicht den Verteiler dieses
   Kellers. Auf Commons gibt es zu „Heizungsverteiler“ nichts Besseres; wer
   ein Bild eines Verteilerbalkens mit Pumpengruppe hat, tauscht das Motiv.
2. **Der Ölkessel steht in einem amerikanischen Keller.** Einen deutschen
   Öl-Heizkessel im Wohnhaus gibt Commons nicht her (gesucht über
   „Heizkessel“, „Ölheizung“, „Ölbrenner“, Kategorien *Domestic boilers*,
   *Heating boilers*, *Oil burners*). Der Ausschnitt zeigt, worauf es
   ankommt: alter Kessel, Manometer, Ölbrenner. Der Rest ist Keller.

Auch hier sind Herstellernamen lesbar (Wilo, Danfoss, Zilmet, Roth) —
dieselbe Abwägung wie bei A1.

#### A5: ein Pexels-Motiv für die Pause (Stand 2026-09-01)

A5 („Halb eins, im Transporter") trug bis hierher die Transporter-Zeichnung,
weil es für den Screen kein Motiv gab. Jetzt gibt es eins — und anders als bei
A2/A3 zieht das Argument oben hier nicht: Die Pause im Transporter behauptet
keine Anlage, sie zeigt zwei Leute beim Brot. Der Zuschnitt ist damit
unverfänglich.

| Datei | Step | Pexels | Urheber:in | Motiv |
| --- | --- | --- | --- | --- |
| `a5-pause.webp` | A5 | [4487669](https://www.pexels.com/photo/4487669/) | Tiger Lily | Zwei Männer in Arbeitsjacken im offenen Laderaum, Brote in der Hand, einer zeigt etwas auf dem Handy |

WebP, 1600 px breit, Qualität 82 (~140 KB), abgelegt unter
`public/medien/media/anlagenmechaniker/`. Auf keiner Bildhälfte ist im
100-%-Ausschnitt ein Firmenname lesbar: blanke Kartons, Jacken ohne Aufdruck.

⚠️ **Ohne Herkunftseintrag:** `a11-nachtfahrt.webp` (A1.1, Blick über das
Armaturenbrett durch eine nasse Scheibe) liegt im selben Ordner und wird von
`bilder['A1.1']` benutzt, die Quelle steht hier aber noch nicht. Wer sie kennt,
trägt sie nach.

Aus dem Altbestand (`public/medien/media/`) wird weiterhin benutzt:

| Datei | Wo |
| --- | --- |
| `shared/start-loop.mp4` + `start-poster.webp` | Splash (S0) — Attract über alle Berufe. **Deckt nur drei Gewerke ab; Dachdecker fehlt.** |
| `zimmerer/szenario.mp4` + `szenario-poster.webp` | Auftragsannahme (S1) des **Dachdeckers** — der gebaute Tag. Ordnername und Motive stammen vom Zimmerer und sind noch nicht ersetzt. |
| `zimmerer/hero.mp4` + `hero-poster.webp` | Karte und Vorschlag des Dachdeckers, dito |

## Was bei der Auswahl galt

- **Keine lesbaren Fremdmarken.** Deshalb liegt `schaetzen-balken.webp` aus dem
  Altbestand ungenutzt herum, obwohl es inhaltlich für B4.1 gepasst hätte: auf
  dem Polohemd steht ein Firmenlogo. `MEDIEN-INVENTAR.md` führt genau das als
  Ausschlussgrund und hat aus demselben Grund schon zwei Motive aussortiert.
- **Nicht nur Männer.** Der Altbestand zeigte in keinem einzigen Motiv eine Frau
  im Handwerk — für ein Berufsorientierungs-Tool eine inhaltliche Lücke, keine
  technische. Jetzt tragen M4 (Zimmerin an der Kappsäge) und B9.2 (Ingenieurin)
  je einen Hauptschritt bzw. Karriereweg.
- **Gesichter dort, wo es um Menschen geht.** M1, M6, B9.1 und der Abschluss
  zeigen Personen, keine Werkzeugstillleben. Der Screen, der jemanden vom iPad
  weg an den Stand schicken soll, war vorher eine leere orange Fläche.

## Was weiterhin fehlt

Das hier ersetzt keinen Fototermin, es macht ihn nur weniger dringend:

1. **Es ist Stock, nicht OWL.** Kein Motiv zeigt einen Betrieb aus Paderborn
   oder Lippe, keine echten Azubis, keine Werkstatt, die jemand am Stand
   wiedererkennt. Sobald es eigene Fotos gibt, ist der Tausch eine Zeile je
   Motiv in der Motivliste des Berufs — die Dateinamen können bleiben.
2. **PSA bleibt uneinheitlich.** `b51-team.webp` zeigt Arbeit auf dem
   Sparrenwerk ohne Helm. Für B5.1 (Teamarbeit) ist das vertretbar, für M5 und
   M7 nicht — dort baut der Aha-Moment auf Absturzsicherung und PSA auf, und ein
   Zimmerermeister am Stand sieht den Widerspruch sofort. Die beiden Steps
   tragen deshalb das 3D-Modell und kein Foto.
3. **Kein Richtfest.** Der Abschluss der Erzählung hat kein eigenes Motiv;
   `m8-feierabend.webp` ist ein Haus im Abendlicht, kein gefeierter Richtkranz.
