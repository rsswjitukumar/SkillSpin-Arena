import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
// import Razorpay from 'razorpay'; // Will use dynamic import or conditional

export async function POST(request: Request) {
  try {
    const { userId, amount, gateway } = await request.json();

    if (!userId || !amount || !gateway) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Check if user exists
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let orderData: any = {};

    if (gateway === 'RAZORPAY') {
      // Razorpay Order Logic
      // const razorpay = new Razorpay({ key_id: '...', key_secret: '...' });
      // const response = await razorpay.orders.create({ amount: amount * 100, currency: 'INR' });
      
      orderData = {
        id: `rzp_test_${Math.random().toString(36).substr(2, 9)}`,
        amount: amount,
        currency: 'INR'
      };
    } else if (gateway === 'PAYTM') {
      // Paytm Order Logic Placeholder
      orderData = {
        id: `paytm_order_${Math.random().toString(36).substr(2, 9)}`,
        amount: amount,
      };
    }

    // 3. Create Pending Transaction in DB
    await prisma.transaction.create({
      data: {
        userId,
        amount: parseFloat(amount),
        type: 'DEPOSIT',
        status: 'PENDING',
        gateway: gateway,
        orderId: orderData.id,
      },
    });

    return NextResponse.json({ 
      success: true, 
      order: orderData 
    });

  } catch (error) {
    console.error('PAYMENT_ORDER_ERROR:', error);
    return NextResponse.json({ error: 'Failed to create payment order' }, { status: 500 });
  }
}
