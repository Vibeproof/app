import React, { useEffect } from 'react';

import Button from 'react-bootstrap/Button';

import { createWalletClient, custom } from 'viem'
import { mainnet } from 'viem/chains'
import * as sigUtil from "@metamask/eth-sig-util";
import * as ethUtil from "ethereumjs-util";



function EventNoteEncryption({ 
    eventId,
    note,
    address,
    setNoteEncrypted,
} : {
    eventId: string,
    note: string,
    address: string,
    setNoteEncrypted: (note: string) => void,
}) {
    const client = createWalletClient({
        chain: mainnet,
        // @ts-ignore
        transport: custom(window.ethereum)
    });

    const requestPublicKey = async () => {
        client.request({
            // @ts-ignore
            method: 'eth_getEncryptionPublicKey',
            // @ts-ignore
            params: [address],
        }).then(publicKey => {
            console.log(publicKey);
            console.log(note);

            const result = sigUtil.encrypt({
                // @ts-ignore
                publicKey,
                data: note,
                // https://github.com/MetaMask/eth-sig-util/blob/v4.0.0/src/encryption.ts#L40
                version: "x25519-xsalsa20-poly1305"
              });
            
            //   // https://docs.metamask.io/guide/rpc-api.html#other-rpc-methods
            //   return ethUtil.bufferToHex(Buffer.from(JSON.stringify(result), "utf8"));            
        }).catch(e => {
            console.log(e);
        });
    }

    return (<div>
        <div style={{ textAlign: 'center' }}>
            <h1 className="pt-3">Encrypt private note with your wallet</h1>
            <p>The note will be end-to-end encrypted, meaning that only you and who you approved, will be able to see it's content.</p>

            <Button variant="dark" size="lg" onClick={requestPublicKey}>Encrypt note</Button>

            {/* {isSuccess && <div>Signature: {data}</div>}
            {isError && <div>Error signing message: {error?.message}</div>} */}
        </div>
    </div>);
}


export default EventNoteEncryption;