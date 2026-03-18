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

    return await prisma.$transaction(async (tx) => {
      const match = await tx.match.findUnique({ where: { id: matchId } });
      if (!match) return NextResponse.json({ error: 'Match not found' }, { status: 404 });

      // Only allow cancellation if user is player1 and match is WAITING
      if (match.player1Id !== userId || match.status !== 'WAITING') {
        return NextResponse.json({ error: 'Cannot cancel this match or match already started' }, { status: 400 });
      }

      await tx.match.update({
        where: { id: matchId },
        data: { status: 'CANCELLED' }
      });

      // Refund the entry fee
      await tx.user.update({
        where: { id: userId },
        data: { walletBalance: { increment: match.entryFee } }
      });

      return NextResponse.json({ success: true, message: 'Match cancelled and refunded' });
    });

  } catch (error) {
    console.error('MATCH_CANCEL_ERROR:', error);
    return NextResponse.json({ error: 'Failed to cancel match' }, { status: 500 });
  }
}
