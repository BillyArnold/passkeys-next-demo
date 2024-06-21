'use client'

import { FormEvent, useState, useEffect } from "react";

function arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}

export default function Login({ webauthn_credential }: { webauthn_credential?: string }) {
    const [isLoggedIn, setIsLoggedIn] = useState(!!webauthn_credential);

    useEffect(() => {
        // Check if the authentication cookie exists
        const cookieValue = webauthn_credential;
        setIsLoggedIn(!!cookieValue); // Update isLoggedIn state based on cookie presence
    }, []);
    const onRegister = (e: FormEvent) => {
        e.preventDefault();

        const createAndSubmitCredentials = async () => {
            try {
                const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
                    challenge: new Uint8Array([117, 61, 252, 231, 191, 241]),
                    rp: { id: "localhost", name: "ACME Corporation" },
                    user: {
                        id: new Uint8Array([79, 252, 83, 72, 214, 7, 89, 26]),
                        name: "jamiedoe",
                        displayName: "Jamie Doe"
                    },
                    pubKeyCredParams: [{ type: "public-key", alg: -7 }],
                    authenticatorSelection: {
                        userVerification: "preferred"
                    },
                    timeout: 60000,
                    attestation: "direct"
                };

                let credential = await navigator.credentials.create({
                    publicKey: publicKeyCredentialCreationOptions
                }) as PublicKeyCredential;

                const credentialData = {
                    id: credential.id,
                    type: credential.type,
                    rawId: arrayBufferToBase64(credential.rawId),
                    user: {
                        name: publicKeyCredentialCreationOptions.user.name,
                    },
                    response: {
                        attestationObject: arrayBufferToBase64((credential.response as AuthenticatorAttestationResponse).attestationObject),
                        clientDataJSON: arrayBufferToBase64((credential.response as AuthenticatorAttestationResponse).clientDataJSON),
                    }
                };

                const response = await fetch('/api', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(credentialData),
                });

                const result = await response.json();
                console.log(result);

            } catch (error) {
                console.error('Error creating credentials:', error);
            }
        }

        createAndSubmitCredentials();
    }

    const onLogin = (e: FormEvent) => {
        e.preventDefault();

        const requestCredentials = async () => {
            try {
                // Fetch credential request options from the server
                const response = await fetch('/api/authenticate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email: 'jamiedoe@example.com' }), // Replace with actual user email
                });

                const publicKeyCredentialRequestOptions = await response.json();

                publicKeyCredentialRequestOptions.challenge = base64ToArrayBuffer(publicKeyCredentialRequestOptions.challenge);
                publicKeyCredentialRequestOptions.allowCredentials.forEach((cred: any) => {
                    cred.id = base64ToArrayBuffer(cred.id);
                });

                let assertion = await navigator.credentials.get({
                    publicKey: publicKeyCredentialRequestOptions
                }) as PublicKeyCredential;

                const assertionData = {
                    id: assertion.id,
                    type: assertion.type,
                    rawId: arrayBufferToBase64(assertion.rawId),
                    response: {
                        authenticatorData: arrayBufferToBase64((assertion.response as AuthenticatorAssertionResponse).authenticatorData),
                        clientDataJSON: arrayBufferToBase64((assertion.response as AuthenticatorAssertionResponse).clientDataJSON),
                        signature: arrayBufferToBase64((assertion.response as AuthenticatorAssertionResponse).signature),
                        userHandle: (assertion.response as AuthenticatorAssertionResponse).userHandle
                            ? arrayBufferToBase64((assertion.response as AuthenticatorAssertionResponse).userHandle!)
                            : null,
                    }
                };

                const verificationResponse = await fetch('/api/verify', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(assertionData),
                });

                const verificationResult = await verificationResponse.json();
                console.log(verificationResult);

            } catch (error) {
                console.error('Error requesting credentials:', error);
            }
        }

        requestCredentials();
    }

    return (
        <>
            {isLoggedIn && (
                <div>
                    <p>You are logged in!</p>
                    {/* Add logout button or other authenticated content here */}
                </div>
            )}
            <form onSubmit={onRegister} className="max-width-sm margin-auto">
                <input type="email" placeholder="Email" className="h-10 rounded-sm w-full p-2 mb-4 text-black" />
                <button type="submit" className="h-10 rounded-sm w-full p-2 mb-4 text-white bg-blue-500">Register</button>
            </form>
            <form onSubmit={onLogin} className="max-width-sm margin-auto">
                <input type="email" placeholder="Email" className="h-10 rounded-sm w-full p-2 mb-4 text-black" />
                <button type="submit" className="h-10 rounded-sm w-full p-2 mb-4 text-white bg-green-500">Login</button>
            </form>
        </>
    );
}
