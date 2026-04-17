import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import DTRLog from '@/models/DTRLog';
import User from '@/models/User';
import { NextResponse } from 'next/server';

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  await dbConnect();
  const user = await User.findById(session.user.id);
  
  const today = new Date();
  today.setHours(0,0,0,0);
  
  const existing = await DTRLog.findOne({ intern: user._id, date: today, timeOut: null });
  if (existing) return NextResponse.json({ error: 'Already timed in' }, { status: 400 });
  
  const now = new Date();
  const startTime = user.expectedStartTime || '09:00';
  const [h, m] = startTime.split(':');
  const expected = new Date(now);
  expected.setHours(parseInt(h), parseInt(m), 0, 0);
  const isLate = now > expected;
  
  await DTRLog.create({ intern: user._id, timeIn: now, date: today, isLate });
  return NextResponse.json({ msg: 'Timed in', isLate });
}