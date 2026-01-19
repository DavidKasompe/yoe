import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-for-dev-only'
);

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        const userId = payload.userId as string;

        await prisma.auditLog.create({
          data: {
            userId: userId,
            eventType: 'LOGOUT',
            description: 'User logged out',
            ipAddress: req.ip || req.headers.get('x-forwarded-for') || null,
            userAgent: req.headers.get('user-agent') || null,
          }
        });
      } catch (e) {
        // Token might be expired, still proceed with "logout"
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: true }); // Always return success on logout
  }
}
