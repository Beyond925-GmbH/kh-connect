import { motion } from 'motion/react'

/**
 * Das Auftragsband — **der eine Satz, der sagt, was zu tun ist.**
 *
 * **Warum es das geben muss.** `StepShell` kannte die Slots
 * `buehne · fachtext · interaktion · aha · fuss`. Einen Platz für die Aufgabe
 * gab es nicht, und weil man ihn nicht vergessen konnte, stand die Anweisung
 * auf jedem Screen woanders: im letzten Halbsatz des Fachtexts (A6 „… die
 * Inbetriebnahme. Dreh auf, bis der Druck stimmt.“), in einer eigenen
 * Komponente, die genau einmal existierte (C4), auf der Bühne (M5) — oder gar
 * nicht (C2, C3, A1, A2), sodass man die Aufgabe aus dem Steuerelement
 * erschließen musste. Fünfzehn Screens, und auf jedem muss neu gesucht werden,
 * wo die Aufgabe steht.
 *
 * Jetzt steht sie auf **jedem** Screen an derselben Stelle: oben im Panel,
 * unter der Warum-Zeile, über der Interaktion.
 *
 * **Der Kasten bewegt sich nicht, er füllt sich um.** Ist die Übung gelöst,
 * setzt der Step `auftrag` auf `null`; das Band verschwindet, und an seine
 * Stelle rückt die Rückmeldung aus der Interaktion. Vorher wuchs das Panel
 * beim Lösen — es wurde also genau in dem Moment größer, in dem der Screen
 * fertig war.
 *
 * **Höchstens zwölf Wörter, Imperativ, ein Verb.** `pruefe:sprache` bricht ab,
 * wenn das nicht eingehalten wird — das ist die einzige Durchsetzung, die über
 * vier parallel entstehende Tage hinweg trägt.
 */
export function Auftragsband({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      // Der Auftrag ist das Erste, was nach dem Titel gelesen werden soll —
      // aber nicht das Erste, was sich bewegt. Er kommt einen Takt nach dem
      // Panel, sonst steht der Satz da, bevor der Screen steht.
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
      data-testid="auftrag"
      className="flex shrink-0 flex-col gap-1.5"
    >
      {/*
        Größer als der Fachtext je war, und in `font-semibold`.

        Die Aufgabe ist nicht eine Zeile unter vielen, sie ist der Screen. Sie
        muss aus zwei Metern Abstand lesbar sein — jemand steht davor, im
        Stehen, mit ausgestrecktem Arm, und hat vielleicht drei Sekunden übrig,
        bevor er weitertippt.
      */}
      <p className="text-[clamp(1.25rem,1.05rem+0.85vw,1.65rem)] leading-[1.28] font-semibold text-kh-paper text-balance">
        {children}
      </p>
    </motion.div>
  )
}
