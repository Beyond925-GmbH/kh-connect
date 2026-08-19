import { cn } from '@/lib/utils'

/**
 * Der Schriftzug ist fast schwarze Zeichnung auf Transparenz und verschwindet
 * damit auf dunklem Grund. Seit die App einfarbig dunkel ist, gibt es keinen
 * hellen Grund mehr — deshalb fällt die Theme-Abfrage weg und die App zeigt
 * durchgängig die hell eingefärbte Kopie derselben Datei.
 *
 * Eingefärbt, nicht gefiltert: kein CSS-Filter führt das Orange der Marke
 * sauber zurück — `invert()` allein macht daraus Blau, und die Korrektur der
 * Farbe zieht es nach Rot oder Oliv. `kh-paderborn-lippe2-dark.png` färbt nur
 * den Schriftzug um und lässt Achteck und Kantenglättung Byte für Byte
 * unangetastet.
 *
 * `aufHell` gibt es für die eine Ausnahme: den Abschluss-Screen M10, wo der
 * Grund eine volle orange Fläche ist.
 */
function Logo({
  className,
  aufHell = false,
  ...props
}: React.ComponentProps<'img'> & { aufHell?: boolean }) {
  return (
    <img
      src={
        aufHell ? '/brand/kh-paderborn-lippe2.png' : '/brand/kh-paderborn-lippe2-dark.png'
      }
      alt="Kreishandwerkerschaft Paderborn-Lippe"
      width={150}
      height={38}
      className={cn('h-[38px] w-auto', className)}
      {...props}
    />
  )
}

export { Logo }
