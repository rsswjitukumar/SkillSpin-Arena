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
    
    // Explicit Role Check
    if (payload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden. Admin Access Required.' }, { status: 403 });
    }

    const [totalUsers, totalMatches, successfulDeposits, platformWealthAgg] = await Promise.all([
      prisma.user.count(),
      prisma.match.count({ where: { status: 'PLAYING' } }),
      prisma.transaction.count({ where: { status: 'SUCCESS', type: 'DEPOSIT' } }),
      prisma.user.aggregate({ _sum: { walletBalance: true } })
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        activeMatches: totalMatches,
        totalDeposits: successfulDeposits,
        totalWealth: platformWealthAgg._sum.walletBalance || 0
      }
    });

  } catch (error) {
    console.error('ADMIN_STATS_ERROR:', error);
    return NextResponse.json({ error: 'Failed to fetch admin stats' }, { status: 500 });
  }
}
