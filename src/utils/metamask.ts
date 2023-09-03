import nacl from 'tweetnacl';
import { 
    decodeBase64,
    encodeBase64,
    decodeUTF8,
} from 'tweetnacl-util';


export const encrypt = function(message: string, public_key: string) {
    // generate ephemeral keypair
    const ephemeralKeyPair = nacl.box.keyPair();

    // assemble encryption parameters - from string to UInt8
    let pubKeyUInt8Array: Uint8Array;
    try {
        pubKeyUInt8Array = decodeBase64(public_key);
    } catch (err) {
        throw new Error('Bad public key');
    }

    const msgParamsUInt8Array = decodeUTF8(message);
    const nonce = nacl.randomBytes(nacl.box.nonceLength);

    // encrypt
    const encryptedMessage = nacl.box(
        msgParamsUInt8Array,
        nonce,
        pubKeyUInt8Array,
        ephemeralKeyPair.secretKey,
    );

    // handle encrypted data
    const output = {
        version: 'x25519-xsalsa20-poly1305',
        nonce: encodeBase64(nonce),
        ephemPublicKey: encodeBase64(ephemeralKeyPair.publicKey),
        ciphertext: encodeBase64(encryptedMessage),
    };

    // return encrypted msg data
    return encodeBase64(decodeUTF8(JSON.stringify(output)));
}