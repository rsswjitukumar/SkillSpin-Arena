import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'skillspin_default_secret_key_2026');
    const { payload } = await jwtVerify(token, secret);
    
    // Check Admin rights
    if (request.nextUrl.pathname.startsWith('/admin')) {
      if (payload.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/', request.url)); // Kick back to dashboard if not admin
      }
    }

    return NextResponse.next();
  } catch (err) {
    // If token is invalid or expired
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('auth_token');
    return response;
  }
}

export const config = {
  matcher: ['/wallet/:path*', '/match-room/:path*', '/admin/:path*'],
};
