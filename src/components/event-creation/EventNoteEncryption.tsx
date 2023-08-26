import React, { useEffect } from 'react';

import Button from 'react-bootstrap/Button';

import { createWalletClient, custom } from 'viem'
import { mainnet } from 'viem/chains'

import nacl from 'tweetnacl';
import naclUtil from 'tweetnacl-util';


function EventNoteEncryption({ 
    eventId,
    note,
    address,
    setNoteEncrypted,
} : {
    eventId: string,
    note: string,
    address: string,
    setNoteEncrypted: (note: string, publicKey: string) => void,
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
        }).then(async (publicKey) => {
            // Generate random note key
            const noteKey = utils.crypto.AES.generateKey();

            // Generate random event key pair
            const eventKeyPair: nacl.BoxKeyPair = nacl.box.keyPair();

            // Encrypt note with note key
            const noteEncrypted = utils.crypto.AES.encrypt(note, noteKey);

            const keystorePlainJSON = {
                version: 0,
                noteKey: naclUtil.encodeBase64(noteKey),
                eventPrivateKey: naclUtil.encodeBase64(eventKeyPair.secretKey),
            };

            // const ephemeralKeyPair = nacl.box.keyPair();

            // // @ts-ignore
            // const pubKeyUInt8Array = naclUtil.decodeBase64(publicKey);
            // const msgParamsUInt8Array = naclUtil.decodeUTF8(note);
            // const nonce = nacl.randomBytes(nacl.box.nonceLength);
            
            // const encryptedMessage = nacl.box(
            //     msgParamsUInt8Array,
            //     nonce,
            //     pubKeyUInt8Array,
            //     ephemeralKeyPair.secretKey,
            // );

            // const output = {
            //     version: 'x25519-xsalsa20-poly1305',
            //     nonce: naclUtil.encodeBase64(nonce),
            //     ephemPublicKey: naclUtil.encodeBase64(ephemeralKeyPair.publicKey),
            //     ciphertext: naclUtil.encodeBase64(encryptedMessage),
            // };

            // const noteEncrypted = Buffer.from(JSON.stringify(output), "utf8").toString('hex');

            // // @ts-ignore
            // setNoteEncrypted(noteEncrypted, publicKey);

            // // // Test decrypt
            // // const noteDecrypted = await client.request({
            // //     // @ts-ignore
            // //     method: 'eth_decrypt',
            // //     // @ts-ignore
            // //     params: [noteEncrypted, address]
            // // });

            // // console.log(noteDecrypted);
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