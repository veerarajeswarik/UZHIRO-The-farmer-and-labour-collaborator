import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './theme.css'
import './layouts/layout.css'
import './components/forms.css'
import './components/ui.css'
import './pages/crops.css'
import './pages/schemes.css'
import './pages/auth.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
