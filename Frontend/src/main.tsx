import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './theme/ThemeContext'
import { AppToaster } from './components/AppToaster'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider><BrowserRouter><AuthProvider><App /><AppToaster /></AuthProvider></BrowserRouter></ThemeProvider>
  </StrictMode>,
)
