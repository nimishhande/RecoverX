import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './styles/app-layout.css'

// Force the app to clear session data on refresh so judges ALWAYS see the Login Page first
localStorage.removeItem('token');

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
