import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
// import ReactDOM from 'react-dom';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';

/** ALL PAGES */
import App from './App';
import Test from './pages/Test';
import Ski from './pages/data/Ski';
import CaptainPont from './pages/data/captain-pont/CaptainPont';

// Routing du site
const routing = (
  <Router basename={`${process.env.PUBLIC_URL}/`}>
    <Routes>
      <Route path='/' element={<App />} />
      <Route path='/test' element={<Test />} />
      <Route path='/ski' element={<Ski />} />
      <Route path='/captain-pont' element={<CaptainPont />} />
    </Routes>
  </Router>
);

// Rendu des elements dans la page index.html
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {routing}
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
