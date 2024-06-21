import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const credentialData = await request.json();
    console.log('Received credential data:', credentialData);

    // Create a cookie to temporarily store the credential data
    const credentialCookie = JSON.stringify(credentialData);
    const response = NextResponse.json({ ok: true });
    
    // Set the cookie (expires in 1 day for demonstration purposes)
    response.cookies.set('webauthn_credential', credentialCookie, {
      httpOnly: true,
      secure: true,
      maxAge: 86400,
    });

    return response;
  } catch (error) {
    console.error('Error handling POST request:', error);
    return NextResponse.json({ ok: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
