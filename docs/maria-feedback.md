# Überarbeitung nach Marias Testfeedback

Stand: 14. September 2026. Ziel ist spielerische Berufsorientierung auf der Messe,
mit etwa drei bis fünf Minuten je Beruf und freiwilliger Vertiefung.

## Ursachen

Die langen Pflichtstrecken vermischten Berufsorientierung, Fachunterricht und
Personalisierung. Einige Aufgaben erhöhten nur einen Fortschrittszähler, ohne eine
eigene Entscheidung zu verlangen. Die Wanddarstellung enthielt für die fünfte
Schicht keine zusätzliche Geometrie. Beim Wischen konkurrierten mehrere nächste
Schritte; einzelne Fälle waren ohne Zusatzprüfung mehrdeutig. Erklärungen waren
im gemeinsamen Layout teilweise unerreichbar. Der Musikgenerator gehörte nur zur
Musikfrage und wurde beim Verlassen beendet. Nicht beantwortete Einstiegsfragen
konnten trotzdem eine Empfehlung beeinflussen.

## Umsetzung

| Bereich | Neues Verhalten |
| --- | --- |
| Einstieg | Freiwillige Helm- und Werkzeugwahl, Baustellenradio und zwei Bildfragen mit „Weiß ich noch nicht“. Keine Höhenfrage und keine Empfehlung aus unbeantworteten Fragen. |
| Personalisierung | Ursprüngliche Helmfarben und Werkzeugauswahl wiederhergestellt. Auf Wunsch des Nutzers entfallen die nachträglich ergänzten Figuren vollständig. |
| Musik | Ursprüngliches Frequenzband mit fünf Stilen. Senderwahl startet Musik. Bei den beiden Bildfragen sinkt der Pegel weich auf 60 % und 20 %; bei der Berufswahl pausiert die Musik. Der globale Schalter setzt sie mit einem Tipp in voller Lautstärke fort. Pause im Hintergrund, neue Sitzung startet ohne Musik. |
| Sprache und Hierarchie | Ein kurzer Auftrag, dann die Handlung. Hilfe nach Fehlern, Erklärungen und weitere Themen unter „Mehr erfahren“. Kein Punkteabzug und keine Prüfungsnoten. |
| Navigation | „Zurück zu den Berufen“ im Beruf und am Abschluss; Wiedereinstieg an derselben Stelle. Überspringen bleibt eine Nebenaktion und erzeugt keinen Lösungserfolg. |
| Zimmerer | Eigenes Holz auswählen und markieren; Markierung bis ins Haus verfolgen. Fünf Schichten selbst bauen, konkrete Hilfe bei falscher Reihenfolge. Vollständiges Modell mit Fassade, freiwillig drehen, auseinanderziehen und Schichten ansehen. |
| Dachdecker | Vorhandene Dachgeschichte bleibt. Baustelle ansehen, Balken zuschneiden, Material auswählen und beide Aufbauabschnitte durch echte Bauteilwahl lösen. Keine neue Aufgabe zum Ziegeldecken. |
| Zerspanung | Bildliche Auswahl und sichtbare Werkzeugbewegungen. Maßbereich statt Rechenhürde. In Aufgabe 6 sofort selbst Proben prüfen und nachstellen. Industriemeister Metall bleibt als IHK-Weiterbildungsweg erhalten. |
| Anlagenmechanik | Eindeutiges Wischszenario mit sechs Teilen. Kurze Rückmeldung durch Wort, Symbol und Farbe, danach automatisch das nächste Bild. Automatik abschaltbar. Klare Diagnosebefunde, Hilfe nach Fehlern und eine kurze Kundenfrage. |
| Abschluss | Nennt ausschließlich tatsächlich ausgeführte Tätigkeiten; kein erfundenes Erfolgslob nach Überspringen. |

## Hauptwege

- Zimmerer: C1 → C2 → C3 → C4 → C6 → C9.
- Dachdecker: M1 → M4 → B4.1 → M5 → M7 → M10.
- Zerspanung: Z2 → Z3 → Z4 → Z6 → Z9.
- Anlagenmechanik: A1 → A2 → A4 → A6 → A7 → A9.

Die bisherigen zusätzlichen Schritte bleiben als freiwillige Vertiefung erreichbar.
Eine Vertiefung führt zur ursprünglichen Spielstelle zurück. Alte Spielstände der
Version 2 werden verworfen, weil die früheren Demo-Abschlüsse keine gelösten neuen
Spiele darstellen. Neue Spielstände verwenden Version 3.

## Prüfung

Automatisierte Browserprüfungen stehen in `tests/`: vollständige Berufswege,
eigenständiger Dachaufbau, Fehlerhilfe, gespeicherter Fortschritt, Überspringen,
Vertiefungsrückkehr, Wandaufbau und Modellbedienung, Wischrückmeldung, Zerspanung,
Orientierung, Ausrüstung und Musik. Reine Logikprüfungen ergänzen die Browserabläufe.
Die App wurde in Chrome bei 1024 × 768 und 390 × 844 visuell geprüft.
Die Browserprüfungen prüfen auch die wiederhergestellte Ausrüstungswahl und das
Radio: Ton erst nach Senderwahl, abnehmender tatsächlicher Audiopegel bei den
Bildfragen, Pause bei der Berufswahl und Fortsetzen mit voller Lautstärke.
Zusätzliche Prüfungen nach der letzten Layoutkorrektur bestätigen sichtbare
Hauptaktionen und überlagerungsfreie Fehlerhilfe auf dem Handy. Typecheck, Formatprüfung und Logikprüfungen bestanden.
Lint hat keine Fehler; Hinweise zu gemischten Komponentenexporten bleiben.
Der Produktionsbuild läuft erfolgreich, mit Hinweisen auf große JavaScript-Chunks.

```sh
pnpm check
pnpm test:logik
pnpm test:e2e
pnpm build
```

Die Zielzeit von drei bis fünf Minuten ist eine Gestaltungsentscheidung, keine
bereits mit Schülern gemessene Besuchsdauer. Die Prüfung mit mobilen Browsermaßen
ersetzt keinen Test auf dem konkreten Messegerät. Marias persönliche Abnahme und
ein Nutzertest mit Schülern sind durch technische Prüfungen nicht vorweggenommen.
