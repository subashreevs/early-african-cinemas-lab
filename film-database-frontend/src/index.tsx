// src/index.tsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import logo from './assets/logo.png';  // your favicon file

// 1️⃣ Set the browser‐tab title
document.title = 'Early African Cinemas Lab';

// 2️⃣ Swap (or add) the favicon
const existingLink = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null;
const favicon = existingLink ?? document.createElement('link');
favicon.rel  = 'icon';
favicon.type = 'image/png';
favicon.href = logo;
if (!existingLink) {
  document.head.appendChild(favicon);
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    {/* 
      Only one Router should live in your app. 
      If you already use <BrowserRouter> inside App, do NOT wrap it here.
    */}
    <App />
  </React.StrictMode>
);

reportWebVitals();
