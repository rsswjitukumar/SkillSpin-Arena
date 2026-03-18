import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { orderId, status } = await request.json();

    if (!orderId || !status) {
      return NextResponse.json({ error: 'Order ID and status are required' }, { status: 400 });
    }

    // 1. Find the transaction
    const transaction = await prisma.transaction.findFirst({
      where: { orderId: orderId },
      include: { user: true }
    });

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    if (transaction.status === 'SUCCESS') {
      return NextResponse.json({ error: 'Transaction already processed' }, { status: 400 });
    }

    // 2. STRICT BEAST LOGIC: Use Prisma Transaction to update status and balance atomically
    if (status === 'SUCCESS') {
      await prisma.$transaction([
        prisma.transaction.update({
          where: { id: transaction.id },
          data: { status: 'SUCCESS' },
        }),
        prisma.user.update({
          where: { id: transaction.userId },
          data: { 
            walletBalance: { increment: transaction.amount } 
          },
        }),
      ]);

      return NextResponse.json({ 
        success: true, 
        message: 'Payment verified and balance updated' 
      });
    } else {
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: 'FAILED' },
      });
      return NextResponse.json({ success: false, message: 'Payment failed' });
    }

  } catch (error) {
    console.error('PAYMENT_VERIFY_ERROR:', error);
    return NextResponse.json({ error: 'Payment verification failed' }, { status: 500 });
  }
}
