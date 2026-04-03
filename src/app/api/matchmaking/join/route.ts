import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

export async function POST(request: Request) {
  try {
    const { entryFee } = await request.json();
    if (!entryFee || isNaN(entryFee)) {
      return NextResponse.json({ error: 'Valid entry fee is required' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'skillspin_default_secret_key_2026');
    const { payload } = await jwtVerify(token, secret);
    const userId = payload.id as string;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const totalBalance = (user.depositBalance || 0) + (user.winningBalance || 0) + (user.bonusBalance || 0);
    if (totalBalance < entryFee) {
      return NextResponse.json({ error: 'Insufficient wallet balance' }, { status: 402 });
    }

    // Check if user is already in a WAITING or PLAYING match
    const existingActiveMatch = await prisma.match.findFirst({
      where: {
        OR: [{ player1Id: userId }, { player2Id: userId }],
        status: { in: ['WAITING', 'PLAYING'] }
      }
    });

    if (existingActiveMatch) {
      return NextResponse.json({ 
        success: true, 
        message: 'Already in a match',
        match: existingActiveMatch
      });
    }

    // Use Prisma transaction to ensure atomic join
    return await prisma.$transaction(async (tx) => {
      // Find a waiting match with the exact entry fee
      const waitingMatch = await tx.match.findFirst({
        where: {
          status: 'WAITING',
          entryFee: parseFloat(entryFee),
          player1Id: { not: userId } // Don't match with self
        },
        orderBy: { createdAt: 'asc' }
      });

      if (waitingMatch) {
        // Join existing match
        const joinedMatch = await tx.match.update({
          where: { id: waitingMatch.id },
          data: {
            player2Id: userId,
            status: 'PLAYING',
            updatedAt: new Date(),
            gameState: JSON.stringify({
              currentTurn: waitingMatch.player1Id, // Player 1 starts
              player1Score: 0,
              player2Score: 0,
              player1Tokens: [0, 0, 0, 0],
              player2Tokens: [0, 0, 0, 0],
              diceValue: null,
              winnerId: null,
              message: "Game started! Player 1's turn to roll."
            })
          },
          include: { player1: { select: { username: true, name: true } } }
        });

        // Deduct balance from player 2 (player 1 already deducted when creating) using prioritized logic
        let amountToDeduct = parseFloat(entryFee);
        const bB = user.bonusBalance || 0;
        const dB = user.depositBalance || 0;
        const wB = user.winningBalance || 0;

        const fromBonus = Math.min(bB, amountToDeduct);
        amountToDeduct -= fromBonus;
        const fromDeposit = Math.min(dB, amountToDeduct);
        amountToDeduct -= fromDeposit;
        const fromWinning = Math.min(wB, amountToDeduct);

        await tx.user.update({
          where: { id: userId },
          data: {
            bonusBalance: { decrement: fromBonus },
            depositBalance: { decrement: fromDeposit },
            winningBalance: { decrement: fromWinning }
          }
        });

        return NextResponse.json({ success: true, match: joinedMatch });
      } else {
        // Create new match
        const newMatch = await tx.match.create({
          data: {
            entryFee: parseFloat(entryFee),
            status: 'WAITING',
            player1Id: userId
          }
        });

        // Deduct balance from player 1 using prioritized logic
        let amountToDeduct = parseFloat(entryFee);
        const bB = user.bonusBalance || 0;
        const dB = user.depositBalance || 0;
        const wB = user.winningBalance || 0;

        const fromBonus = Math.min(bB, amountToDeduct);
        amountToDeduct -= fromBonus;
        const fromDeposit = Math.min(dB, amountToDeduct);
        amountToDeduct -= fromDeposit;
        const fromWinning = Math.min(wB, amountToDeduct);

        await tx.user.update({
          where: { id: userId },
          data: {
            bonusBalance: { decrement: fromBonus },
            depositBalance: { decrement: fromDeposit },
            winningBalance: { decrement: fromWinning }
          }
        });

        return NextResponse.json({ success: true, match: newMatch });
      }
    });

  } catch (error) {
    console.error('MATCHMAKING_JOIN_ERROR:', error);
    return NextResponse.json({ error: 'Failed to join matchmaking' }, { status: 500 });
  }
}
