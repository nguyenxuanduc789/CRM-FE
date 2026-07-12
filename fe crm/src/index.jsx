import './index.scss';

import React from 'react';

import { createRoot } from 'react-dom/client';

import App from './App';
import { ConfigProvider } from './contexts/ConfigContext';

const container = document.getElementById('root');

// Create React root and render the application
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <ConfigProvider>
      <App />
    </ConfigProvider>
  </React.StrictMode>
);

// Measure performance if needed
// reportWebVitals(console.log); // Log thông tin hiệu suất ra console
