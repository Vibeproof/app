import {createConfig} from "wagmi";
import { getDefaultConfig } from "connectkit";

export const wagmiConfig = createConfig(getDefaultConfig({
    infuraId: '2060450118ab4f018bcf4745b318a662',
    walletConnectProjectId: 'e9521b73bdf6521a1d1f08cd8a3c630d',
    appName: 'Snaphost',
    autoConnect: true
}));
