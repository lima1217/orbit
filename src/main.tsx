import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { TimeProvider } from './contexts/TimeContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TimeProvider>
      <App />
    </TimeProvider>
  </StrictMode>,
)
