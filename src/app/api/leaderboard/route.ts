import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const topUsers = await prisma.user.findMany({
      orderBy: { totalWinnings: 'desc' },
      take: 20,
      select: {
        id: true,
        username: true,
        totalWinnings: true
        // Intentionally leaving out sensitive auth details
      }
    });

    return NextResponse.json({ success: true, leaderboard: topUsers });
  } catch (error) {
    console.error('LEADERBOARD_ERROR:', error);
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
  }
}
