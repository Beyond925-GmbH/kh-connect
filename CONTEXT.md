# CONTEXT — Glossar

Die verbindliche Sprache dieses Projekts. Nur Begriffe, keine
Implementierungsdetails.

## Level (gesprochen) / Hauptschritt (im Code)

Ein Bildschirm auf der Hauptlinie eines Berufstags. „Level N" meint immer den
Hauptschritt mit der Id `<Präfix>N` (Zerspanung Level 6 = `Z6`). Die Rail
zählt nur Hauptschritte.

## Zwischenlevel (gesprochen) / Abstecher (im Code)

Ein freiwilliger Seitenschritt, der von einem Hauptschritt abzweigt
(`Z1.1`, `A3.1`, …). Er hat kein eigenes Rail-Segment und mündet in denselben
nächsten Hauptschritt wie sein Elternschritt. Typisches Muster: ein Thema,
drei wählbare Vertiefungen.

## Beruf / Tag

Ein erkundbarer Ausbildungsberuf, erzählt als ein Arbeitstag (Route aus
Hauptschritten und Abstechern). Aktuell: Zimmerer, Dachdecker,
Zerspanungsmechaniker:in (`Z`), Anlagenmechaniker:in SHK (`A`).
