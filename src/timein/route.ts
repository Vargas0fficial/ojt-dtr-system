import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import DTRLog from '@/models/DTRLog';
import User from '@/models/User';
import { NextResponse } from 'next/server';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
dayjs.extend(utc);
dayjs.extend(timezone);
export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await dbConnect();
  const user = await User.findById(session.user.id);
  // Kuhanin PH time using dayjs
  const phTime = dayjs().tz("Asia/Manila").toDate();
  
  // Set date to 12:00 AM PH time para same day grouping
  const today = dayjs(phTime).startOf('day').toDate();
  const existing = await DTRLog.findOne({ 
    intern: user._id, 
    date: today, 
    timeOut: null 
  });
  if (existing) return NextResponse.json({ error: 'Already timed in' }, { status: 400 });
  // 8:30 AM PH time cutoff. 8:30 sakto = on time pa
  const isLate = dayjs(phTime).hour() > 8 || (dayjs(phTime).hour() === 8 && dayjs(phTime).minute() >= 31);
  await DTRLog.create({
    intern: user._id,
    timeIn: phTime, // Save as PH time na
    date: today,
    isLate
  });
  return NextResponse.json({ 
    msg: 'Timed in', 
    isLate, 
    timeIn: dayjs(phTime).format('hh:mm A')
  });
}