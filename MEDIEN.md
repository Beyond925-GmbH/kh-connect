# Medien — `public/medien/schritte/`

Die Motive, die die Step-Screens tragen. Zugekauft wurde nichts: alles Pexels,
heruntergeladen am 2026-08-18.

**Lizenz:** [Pexels-Lizenz](https://www.pexels.com/license/) — kostenlos,
kommerziell nutzbar, keine Namensnennung nötig. Die Urheber:innen stehen
trotzdem unten, weil eine Datei ohne Herkunft in zwei Jahren niemand mehr
zuordnen kann.

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
