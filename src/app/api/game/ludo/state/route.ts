import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

export async function POST(request: Request) {
  try {
    const { matchId } = await request.json();
    if (!matchId) return NextResponse.json({ error: 'Match ID required' }, { status: 400 });

    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'skillspin_default_secret_key_2026');
    const { payload } = await jwtVerify(token, secret);
    const userId = payload.id as string;

    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        player1: { select: { id: true, username: true } },
        player2: { select: { id: true, username: true } }
      }
    });

    if (!match) return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    if (match.player1Id !== userId && match.player2Id !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    let gameState = {};
    if (match.gameState) {
      try { gameState = JSON.parse(match.gameState); } catch(e){}
    }

    return NextResponse.json({ success: true, match, gameState });
  } catch (error) {
    console.error('GAME_STATE_ERROR:', error);
    return NextResponse.json({ error: 'Failed to fetch state' }, { status: 500 });
  }
}
