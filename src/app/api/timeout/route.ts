import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import DTRLog from '@/models/DTRLog';
import { NextResponse } from 'next/server';

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  await dbConnect();
  const today = new Date();
  today.setHours(0,0,0,0);
  
  const log = await DTRLog.findOne({ intern: session.user.id, date: today, timeOut: null });
  if (!log) return NextResponse.json({ error: 'No active time in' }, { status: 400 });
  
  const now = new Date();
  log.timeOut = now;
  log.hours = (now.getTime() - log.timeIn.getTime()) / 1000 / 60 / 60;
  await log.save();
  
  return NextResponse.json({ msg: 'Timed out', hours: log.hours });
}