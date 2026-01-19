import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-for-dev-only'
);

async function isAdmin(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return false;
  const token = authHeader.split(' ')[1];
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload.role === 'Admin';
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest) {
  if (!await isAdmin(req)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const recentLogs = await prisma.auditLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: 50,
      include: {
        user: {
          select: {
            username: true,
            email: true
          }
        }
      }
    });

    const totalEvents = await prisma.auditLog.count();
    const failedLogins = await prisma.auditLog.count({
      where: { eventType: 'ACCESS_DENIED' }
    });

    return NextResponse.json({
      total_events: totalEvents,
      failed_logins: failedLogins,
      recent_events: recentLogs
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
