import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Login from './app/pages/login.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Login/>
  </StrictMode>,
)
