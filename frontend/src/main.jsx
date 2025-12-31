import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

import { AuthProvider } from './context/AuthContext.jsx'
import {Toaster} from "react-hot-toast"
import App from "./App.jsx";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <Toaster position='top-right' toastOptions={{duration:3000}}/>
      <App/>

    </AuthProvider>
    
  </StrictMode>,
)
