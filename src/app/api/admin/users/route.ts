import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'skillspin_default_secret_key_2026');
    const { payload } = await jwtVerify(token, secret);
    
    if (payload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden. Admin Access Required.' }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      select: {
        id: true,
        username: true,
        phone: true,
        walletBalance: true,
        totalWinnings: true,
        role: true,
        createdAt: true,
        referredBy: true,
        referralEarnings: true
      }
    });

    return NextResponse.json({ success: true, users });

  } catch (error) {
    console.error('ADMIN_USERS_ERROR:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
