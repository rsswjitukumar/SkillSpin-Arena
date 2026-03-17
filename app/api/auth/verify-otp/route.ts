import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { phone, code } = await request.json();

    if (!phone || !code) {
      return NextResponse.json({ error: 'Phone and OTP are required' }, { status: 400 });
    }

    // 1. Find the latest valid OTP for this phone
    const validOtp = await prisma.otp.findFirst({
      where: {
        phone,
        code,
        isUsed: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!validOtp) {
      return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 });
    }

    // 2. Mark OTP as used
    await prisma.otp.update({
      where: { id: validOtp.id },
      data: { isUsed: true },
    });

    // 3. Find or Create User
    let user = await prisma.user.findUnique({
      where: { phone },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          phone,
          walletBalance: 0,
        },
      });
    }

    // 4. Return Session Data (In a real app, set an HTTP-only cookie JWT here)
    return NextResponse.json({ 
      success: true, 
      user: {
        id: user.id,
        phone: user.phone,
        balance: user.walletBalance,
      },
      message: 'Successfully logged in'
    });

  } catch (error) {
    console.error('OTP_VERIFY_ERROR:', error);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
