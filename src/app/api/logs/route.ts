import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import DTRLog from '@/models/DTRLog';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  await dbConnect();
  const logs = await DTRLog.find({ intern: session.user.id }).sort({ date: -1 });
  const totalHours = logs.reduce((sum, log) => sum + (log.hours || 0), 0);
  
  return NextResponse.json({ logs, totalHours });
}