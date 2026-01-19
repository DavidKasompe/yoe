import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-for-dev-only'
);

export async function verifyRole(req: NextRequest, allowedRoles: string[]) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { authenticated: false, error: 'Unauthorized' };
    }

    const token = authHeader.split(' ')[1];
    const { payload } = await jwtVerify(token, JWT_SECRET);
    
    const userRole = payload.role as string;

    if (!allowedRoles.includes(userRole) && userRole !== 'Admin') {
      return { authenticated: true, authorized: false, error: 'Forbidden: Insufficient Permissions' };
    }

    return { authenticated: true, authorized: true, user: payload };
  } catch (error) {
    return { authenticated: false, error: 'Invalid Token' };
  }
}
