import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './pages/App';
import reportWebVitals from './reportWebVitals';

import { WagmiConfig } from 'wagmi'
import { ConnectKitProvider } from "connectkit";

import {wagmiConfig} from "./config";
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';


const root = ReactDOM.createRoot(
  // @ts-ignore
  document.getElementById('root') as HTMLElement
);


root.render(
  <WagmiConfig config={wagmiConfig}>
    <ConnectKitProvider>
      <MantineProvider 
        withGlobalStyles
        withNormalizeCSS
        theme={{
          primaryColor: 'blue',
          colors: {
            blue: [
              "#eaf3ff",
              "#d6e2fb",
              "#adc3ee",
              "#82a2e2",
              "#5d86d7",
              "#4674d1",
              "#386bd0",
              "#295bb8",
              "#2050a7",
              "#0d4594"
            ]
          }
        }}
      >
        <Notifications />
        <App />
      </MantineProvider>
    </ConnectKitProvider>
  </WagmiConfig>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
