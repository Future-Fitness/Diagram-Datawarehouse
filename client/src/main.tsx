import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename='/Diagram-Datawarehouse'>
    <App />
    <ToastContainer />
    </BrowserRouter>
  </StrictMode>,
)
