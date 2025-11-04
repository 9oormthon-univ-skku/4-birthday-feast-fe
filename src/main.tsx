import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './index.css';
import { queryClient } from './apis/queryClient';



ReactDOM.createRoot(document.getElementById('root')!).render(
  // <React.StrictMode>
  // <BrowserRouter>
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
  // </BrowserRouter>
  // </React.StrictMode>

);
