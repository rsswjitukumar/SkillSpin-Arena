import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { matchId } = await request.json();
    if (!matchId) return NextResponse.json({ error: 'Match ID required' }, { status: 400 });

    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        player1: { select: { username: true, name: true } },
        player2: { select: { username: true, name: true } }
      }
    });

    if (!match) return NextResponse.json({ error: 'Match not found' }, { status: 404 });

    return NextResponse.json({ success: true, match });

  } catch (error) {
    console.error('MATCHMAKING_STATUS_ERROR:', error);
    return NextResponse.json({ error: 'Failed to fetch match status' }, { status: 500 });
  }
}
