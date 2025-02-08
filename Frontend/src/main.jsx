import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import {ToastContainer} from 'react-toastify';

const baseUrl = import.meta.env.VITE_REACT_APP_API_URL;
axios.defaults.baseURL = baseUrl ; // Accessing the site key

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
    <ToastContainer/>
  </BrowserRouter>,
);
