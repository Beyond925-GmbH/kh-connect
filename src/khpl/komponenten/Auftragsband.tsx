/** Die Aufgabe erscheint ohne Verzögerung und bleibt über der Handlung sichtbar. */
export function Auftragsband({ children }: { children: React.ReactNode }) {
  return (
    <div data-testid="auftrag" className="shrink-0">
      <p className="text-[clamp(1.2rem,1.05rem+0.7vw,1.6rem)] leading-snug font-semibold text-kh-paper text-balance">
        {children}
      </p>
    </div>
  )
}
