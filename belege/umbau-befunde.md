# Umbau der vier Tage — Befunde

> Ein Dokument statt vier: der Umbau ist seriell von Hand gemacht worden,
> nicht von vier Agenten parallel (siehe `khpl-vereinfachung.md` §9).
> Auftrag und Regeln: [`umbau-auftrag.md`](./umbau-auftrag.md).

## Was gemessen wurde

| | vorher | nachher |
| --- | --- | --- |
| Steps mit Auftragszeile | 0 von 52 | 28 (24 bewusst `null`) |
| Steps mit Ansage | 0 | 11 |
| Absätze über 30 Wörter | 35 (längster 65) | **0** |
| Absätze mit >1 Fachwort | 13 | **0** |
| Steps mit doppelter Textfassung | 12 | 8 (nur noch Layout, keine Prosa) |

## Auftragszeilen je Tag

**Dachdecker** — M1 „Tipp an, was du sonst noch mitnimmst." · M2 „Schätz, was
dieses Dach kostet." · M4 „Zieh die Schnittlinie auf das Maß aus dem Plan." ·
M5 „Tipp das Teil an, das als Nächstes drankommt." · M7 „Zieh das Teil an
seinen Platz." · M9 „Sieh dir an, welcher Weg dich interessiert." · B3.2 „Tipp
die Teile an, die du im Plan wiedererkennst." · B4.1 „Zieh auf den Anhänger,
was morgen gebraucht wird." — Lese-Steps: M3, M6, M8, M10, B3.1, B5.1, B9.

**Zimmerer** — C1 „Such dein Holz im Stapel und tipp es an." · C2 „Schätz, wie
weit die Ständer auseinanderstehen." · C3 „Tipp die Schichten an, von innen
nach außen." · C4 „Wähl den Rahmen, der in den Ausschnitt passt." · C6 zwei
Beats („Dreh das Element so, wie es stehen muss." / „Führ das Element über die
Schwelle und lass es ab.") · C8 Karriere. — Lese-Steps: C5, C7, C9, C1.1,
C3.1, C5.1, C8.1–C8.3.

**Zerspanung** — Z1 „Schätz, wie weit dieses Maß danebengehen darf." · Z2 „Tipp
dich durch die vier Handgriffe." · Z3 „Geh das Programm durch, Zeile für
Zeile." · Z4 „Tipp an, was dich im Messraum wundert." · Z5 „Dreh die
Messschraube zu, bis sie anliegt." · Z7 Karriere. — Lese-Steps: Z6, Z8, Z1.1,
Z2.1, Z7.1–Z7.3.

**Anlagenmechanik** — A1 „Wähl drei Prüfungen und finde die Ursache." · A2
„Tipp an, was in diesem Keller steht." · A3 „Schätz, wie viel Wärme dieses Haus
braucht." · A4 „Zieh die Leitung von der Pumpe zum Verteiler." · A6 „Dreh auf,
bis der Druck stimmt." · A7 „Erklär es so, dass sie es versteht." · A4.1/A8. —
Lese-Steps: A5, A9, A1.1, A3.1, A8.1–A8.3.

## Die elf Ansagen

`ziehen-regler` — M2, C2, Z1, Z5, A3, A6 (die vier Rate-Regler tragen
`RATEN_HAKEN` wörtlich aus `gesten.ts`).
`ziehen-frei` — M4, A4, C6 (Beat 2).
`ziehen-karte` — M7, B4.1.
`drehen` — C6 (Beat 1).
`tippen` bekommt nie eine.

**Zwei Ansagen tragen einen Anker statt nur einer Anweisung**, weil die Frage
sonst nicht schätzbar wäre: C2 nennt vorher das Plattenmaß (1,25 m), Z1 den
Papiervergleich (ein Zehntelmillimeter). Beide verraten die Antwort nicht — sie
machen aus Raten Schätzen.

## Was gemeldet und nicht gebaut wurde

- **Z3 ist nicht umgedreht worden.** Der Plan (§6) will: Programm laufen
  lassen → Luftschnitt zeigen → *dann* nach der Zeile fragen, mit drei
  Verdächtigen statt vierzehn Zeilen. Das ist ein Umbau der Interaktion und
  der Bühnensteuerung, nicht der Copy, und er ändert womöglich die Form von
  `answers.z3` — beides außerhalb dessen, was hier gemacht wurde. Der Screen
  hat jetzt Auftragszeile, gekürzte Absätze und ein Fachwort statt zweier; die
  Umkehr steht weiterhin aus.
- **A7 ist nicht hervorgehoben worden.** Der Plan nennt ihn „die beste Übung
  der App" und will ihn sichtbarer machen. Passiert ist nur die Auftragszeile
  („Erklär es so, dass sie es versteht."). Was „sichtbarer" heißen soll, ist
  eine Gestaltungsfrage, die niemand entschieden hat.
- **C4s Fuge wird nicht auf der Bühne bemaßt** (§6). Das ist Arbeit an
  `Wandelement3D`, also an einer Bühne — außerhalb dieses Umbaus.
