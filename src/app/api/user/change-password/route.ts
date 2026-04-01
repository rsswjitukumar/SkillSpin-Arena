import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'skillspin_default_secret_key_2026');
    const { payload } = await jwtVerify(token, secret);
    const userId = payload.id as string;

    const body = await request.json();
    const { oldPassword, password } = body;

    if (!oldPassword || !password) {
      return NextResponse.json({ error: 'Please provide both old and new passwords' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'New password must be at least 6 characters' }, { status: 400 });
    }

    // Fetch user for current password verification
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user || user.password === null) {
      return NextResponse.json({ error: 'User password not found. Please contact support.' }, { status: 404 });
    }

    // Verify current (old) password
    const isOldPasswordMatch = await bcrypt.compare(oldPassword, user.password as string);
    if (!isOldPasswordMatch) {
      return NextResponse.json({ error: 'Old password is incorrect' }, { status: 403 });
    }

    // Hash the new password securely
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user in database
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    return NextResponse.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('CHANGE_PASSWORD_ERROR:', error);
    return NextResponse.json({ error: 'Failed to update password' }, { status: 500 });
  }
}
