import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './components/App';
import reportWebVitals from './reportWebVitals';

import { WagmiConfig } from 'wagmi'
import { ConnectKitProvider } from "connectkit";

import {wagmiConfig} from "./config";


const root = ReactDOM.createRoot(
  // @ts-ignore
  document.getElementById('root') as HTMLElement
);


root.render(
  <WagmiConfig config={wagmiConfig}>
    <ConnectKitProvider>
      <App />
    </ConnectKitProvider>
  </WagmiConfig>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
