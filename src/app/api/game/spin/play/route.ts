import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

export async function POST(request: Request) {
  try {
    const { betAmount } = await request.json();
    if (!betAmount || isNaN(betAmount) || betAmount <= 0) {
      return NextResponse.json({ error: 'Invalid bet amount' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'skillspin_default_secret_key_2026');
    const { payload } = await jwtVerify(token, secret);
    const userId = payload.id as string;

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user) throw new Error('User not found');

      if (user.walletBalance < betAmount) {
        throw new Error('Insufficient wallet balance');
      }

      // 1. Calculate Weighted Probability
      // 0x (40%), 0.5x (30%), 1.5x (15%), 2x (10%), 5x (4%), 10x (1%)
      const rand = Math.random() * 100;
      let multiplierIndex = 0;
      let multiplier = 0;

      if (rand < 40) { multiplierIndex = 0; multiplier = 0; }
      else if (rand < 70) { multiplierIndex = 1; multiplier = 0.5; }
      else if (rand < 85) { multiplierIndex = 2; multiplier = 1.5; }
      else if (rand < 95) { multiplierIndex = 3; multiplier = 2.0; }
      else if (rand < 99) { multiplierIndex = 4; multiplier = 5.0; }
      else { multiplierIndex = 5; multiplier = 10.0; }

      const winAmount = parseFloat((betAmount * multiplier).toFixed(2));
      const profitAdjustment = winAmount - betAmount;

      // 2. Update Waller & Log automatically
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          walletBalance: { increment: profitAdjustment },
          totalWinnings: winAmount > 0 ? { increment: winAmount } : undefined
        }
      });

      await tx.transaction.create({
        data: {
          userId,
          amount: Math.abs(profitAdjustment),
          type: profitAdjustment >= 0 ? 'SPIN_WIN' : 'SPIN_LOSS',
          status: 'SUCCESS',
          gateway: 'SYSTEM'
        }
      });

      return {
        success: true,
        multiplierIndex,
        multiplier,
        winAmount,
        newBalance: updatedUser.walletBalance
      };
    });

    return NextResponse.json(result);

  } catch (error: any) {
    if (error.message === 'User not found' || error.message === 'Insufficient wallet balance') {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error('SPIN_PLAY_ERROR:', error);
    return NextResponse.json({ error: 'Failed to process spin' }, { status: 500 });
  }
}
