import React, { useEffect } from "react";
import Col from 'react-bootstrap/Col';


// @ts-ignore
export function EventCreationConnectWallet({ notEns } : { notEns: boolean }) {
    return (
        <div className="pt-3" style={{ textAlign: 'center' }}>
            <h1>Connect wallet with ENS address</h1>
            <div className="mt-5">
                For event creation you need to use wallet with ENS address. 
                If you don't have one, you can purchase it on <a href="https://app.ens.domains/" target="blank">ENS app</a>.
                <br />
                Currently, single ENS address can be used to create up to 5 events.
                <br />
                Event creation happens offchain, you don't need to send transactions or pay gas fees.

                { notEns ? <div className="mt-5 text-danger">Seems like your address doesn't have an ENS, try another wallet</div> : null }
            </div>
        </div>
    );
}