import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

import eruda from "eruda";
// @ts-ignore
import erudaCode from "eruda-code";
// @ts-ignore
import erudaFeatures from "eruda-features";
// @ts-ignore
import erudaTiming from "eruda-timing";
// @ts-ignore
import erudaMonitor from "eruda-monitor";

eruda.add(erudaCode);
eruda.add(erudaFeatures);
eruda.add(erudaTiming);
eruda.add(erudaMonitor);
eruda.init();


const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);
root.render(
    <React.StrictMode>
        <App/>
    </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
