import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    // Normally, you would lookup the user by email and retrieve their stored credentials
    // Here, we just use the stored cookie for simplicity
    const credentialData = request.cookies.get('webauthn_credential');
    if (!credentialData) {
      return NextResponse.json({ ok: false, error: 'No credentials found' }, { status: 404 });
    }

    const parsedCredentialData = JSON.parse(credentialData.value);
    const allowCredentials = [{
      type: parsedCredentialData.type,
      id: parsedCredentialData.rawId,
    }];

    const publicKeyCredentialRequestOptions = {
      challenge: base64ToArrayBuffer("dGhpcy1pcy1qdXN0LWZha2UtdGVzdC1jaGFsbGVuZ2U="),
      allowCredentials,
      userVerification: "preferred",
    };

    return NextResponse.json(publicKeyCredentialRequestOptions);
  } catch (error) {
    console.error('Error handling authentication request:', error);
    return NextResponse.json({ ok: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

