import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { phone } = await request.json();

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    // 1. Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // 2. Save to Database
    await prisma.otp.create({
      data: {
        phone,
        code: otpCode,
        expiresAt: expiry,
      },
    });

    // 3. Trigger WhatsApp (Simulated/Placeholder)
    console.log(`[WHATSAPP_OTP] Sending ${otpCode} to ${phone}`);
    // Replace this with actual WhatsApp API call (e.g., Twilio, Meta API, etc.)
    // const response = await fetch('YOUR_WHATSAPP_GATEWAY', { ... });

    return NextResponse.json({ 
      success: true, 
      message: 'OTP sent successfully to WhatsApp' 
    });

  } catch (error) {
    console.error('OTP_SEND_ERROR:', error);
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
  }
}
