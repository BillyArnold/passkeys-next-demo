import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const assertionData = await request.json();
    console.log('Received assertion data:', assertionData);

    // Here you would normally verify the assertion against the stored credential data
    // For simplicity, we'll just log it and respond with success
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error handling verification request:', error);
    return NextResponse.json({ ok: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
