import React from "react";


export interface WalletContextType {
    address: string | undefined;
}  


export const WalletContext = React.createContext<WalletContextType>({
    address: undefined,
});