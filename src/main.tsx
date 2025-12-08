import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ThemeProvider } from './components/theme-provider.tsx'
import { ThemeColorProvider } from './components/theme-customizer.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeColorProvider>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <App />
      </ThemeProvider>
    </ThemeColorProvider>
  </StrictMode>
);