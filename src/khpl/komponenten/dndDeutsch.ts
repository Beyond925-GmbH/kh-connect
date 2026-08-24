import type { Announcements, ScreenReaderInstructions } from '@dnd-kit/core'

/**
 * Deutsche Ansagen für dnd-kit (B4.1, M7).
 *
 * Ohne diese Übergabe spricht die Live-Region die englischen Defaults
 * („Draggable item … was dropped over droppable area …“) — für sehende
 * Besucher unsichtbar, aber ein Bruch der Deutsch-Policy für assistive
 * Technologie. Die Texte nennen bewusst keine technischen Ids: welches Teil
 * gegriffen ist, sagt der fokussierte Kartentext selbst.
 */
export const DND_ANSAGEN: Announcements = {
  onDragStart: () => 'Karte aufgenommen.',
  onDragOver: ({ over }) =>
    over ? 'Karte über der Ablagefläche.' : 'Karte über keiner Ablagefläche.',
  onDragEnd: ({ over }) =>
    over ? 'Karte abgelegt.' : 'Karte losgelassen, nicht abgelegt.',
  onDragCancel: () => 'Ziehen abgebrochen.',
}

export const DND_ANLEITUNG: ScreenReaderInstructions = {
  draggable:
    'Drück die Leertaste oder die Eingabetaste, um die Karte aufzunehmen. ' +
    'Beweg sie mit den Pfeiltasten, leg sie mit Leertaste oder Eingabetaste ab. ' +
    'Mit Escape brichst du ab.',
}
