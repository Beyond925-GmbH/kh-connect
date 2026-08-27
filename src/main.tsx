import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { starteVerlauf } from '@/khpl/store/verlauf'

// Vor dem ersten Rendern: der Verlaufseintrag entscheidet mit, welcher Screen
// gleich steht. Danach gäbe es ein Bild lang den falschen.
starteVerlauf()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
