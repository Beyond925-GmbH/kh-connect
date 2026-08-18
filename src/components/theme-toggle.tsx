import { Monitor, Moon, Sun } from 'lucide-react'
import { Menu, MenuContent, MenuRadioGroup, MenuRadioItem, MenuTrigger } from '@/components/ui/menu'
import { useTheme, type Theme } from '@/lib/theme'

const options: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: 'Hell', icon: Sun },
  { value: 'dark', label: 'Dunkel', icon: Moon },
  { value: 'system', label: 'Wie im System', icon: Monitor },
]

/**
 * Dark mode is optional: the default follows the OS, and an explicit
 * choice is remembered. Sized to match the burger button next to it.
 */
export function ThemeToggle() {
  const { theme, resolved, setTheme } = useTheme()
  const Icon = resolved === 'dark' ? Moon : Sun

  return (
    <Menu>
      <MenuTrigger
        aria-label="Farbschema wählen"
        className="grid size-[35px] shrink-0 place-items-center border border-kh-rule text-kh-grey transition-colors hover:border-kh-orange hover:text-kh-orange data-[popup-open]:border-kh-orange data-[popup-open]:text-kh-orange"
      >
        <Icon className="size-[18px]" />
      </MenuTrigger>
      <MenuContent>
        <MenuRadioGroup value={theme} onValueChange={(value) => setTheme(value as Theme)}>
          {options.map(({ value, label, icon: OptionIcon }) => (
            <MenuRadioItem key={value} value={value}>
              <OptionIcon className="size-4 shrink-0" />
              {label}
            </MenuRadioItem>
          ))}
        </MenuRadioGroup>
      </MenuContent>
    </Menu>
  )
}
