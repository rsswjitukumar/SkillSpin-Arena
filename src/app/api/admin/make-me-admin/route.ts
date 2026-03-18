import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { jwtVerify, SignJWT } from 'jose';

// ONLY FOR DEVELOPMENT / INITIAL SETUP.
// This allows you to visit /api/admin/make-me-admin in your browser to instantly grant yourself permissions.
export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) return NextResponse.json({ error: 'Unauthorized. Please login first.' }, { status: 401 });

    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'skillspin_default_secret_key_2026');
    const { payload } = await jwtVerify(token, secret);
    const userId = payload.id as string;

    // Upgrade User in DB
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: 'ADMIN' }
    });

    // Reissue JWT Token with Admin Role
    const newToken = await new SignJWT({ 
        id: updatedUser.id, 
        phone: updatedUser.phone, 
        username: updatedUser.username, 
        role: updatedUser.role 
      })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(secret);

    cookieStore.set('auth_token', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/'
    });

    return NextResponse.redirect(new URL('/admin', request.url));

  } catch (error) {
    console.error('MAKE_ADMIN_ERROR:', error);
    return NextResponse.json({ error: 'Failed to upgrade role' }, { status: 500 });
  }
}
