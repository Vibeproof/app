import nacl from 'tweetnacl';
import naclUtil from 'tweetnacl-util';
import crypto from 'crypto';


const eventNote = 'This is a secret event note';
const applicationNote = 'This is a secret application note';
const responseNote = 'This is a secret response note';

const algorithm = 'aes-256-cbc';


describe('Testing encryption', () => {
    // Usually stored in the metamask
    // Which means it's better to access it once and then work with in-memory keys (better UX)
    // - Used to decrypt the event key pair and the event key
    // - Does not published anywhere
    const eventOwnerMetaMaskKey: nacl.BoxKeyPair = nacl.box.keyPair();

    // Used by applicants to encrypt their application note
    // - Private key can be accessed by the event owner
    // - Public key can be accessed by anyone
    // - Private key is encrypted with `eventOwnerWalletKey` and published too
    const eventKeyPair: nacl.BoxKeyPair = nacl.box.keyPair();

    // Used to encrypt the event note
    const eventKey = {
        iv: crypto.randomBytes(16),
        key: crypto.randomBytes(32)
    };

    it('Encrypt event note', () => {
        const cipher = crypto.createCipheriv(
            algorithm,
            eventKey.key,
            eventKey.iv
        );

        const encryptedEventNote = cipher.update(eventNote, 'utf8', 'hex') + cipher.final('hex');
    });

    it('Encrypt event key', () => {
        console.log(Buffer.from(eventOwnerMetaMaskKey.publicKey).toString('hex'));
    });
});