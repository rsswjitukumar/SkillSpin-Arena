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

    const matches = await prisma.match.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        player1: { select: { username: true } },
        player2: { select: { username: true } },
      }
    });

    return NextResponse.json({ success: true, matches });

  } catch (error) {
    console.error('ADMIN_MATCHES_ERROR:', error);
    return NextResponse.json({ error: 'Failed to fetch matches' }, { status: 500 });
  }
}
