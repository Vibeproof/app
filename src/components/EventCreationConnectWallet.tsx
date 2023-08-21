import React, { useEffect } from "react";
import Col from 'react-bootstrap/Col';


// @ts-ignore
export function EventCreationConnectWallet() {
    return (
        <div className="pt-5" style={{ textAlign: 'center' }}>
            <h1>Connect wallet with ENS address</h1>
            <div className="mt-5">
                For event creation you need to use wallet with ENS address. If you don't have one, you can purchase it on <a href="https://app.ens.domains/" target="blank">ENS app</a>.
                <br />
                Event creation happens offchain, you don't need to send transactions or pay gas fees.
            </div>
        </div>
    );
}