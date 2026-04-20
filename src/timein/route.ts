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
// ETO YUNG FIX: Force Manila timezone para sa lahat ng dayjs()
dayjs.tz.setDefault("Asia/Manila");

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  await dbConnect();
  const user = await User.findById(session.user.id);

  // Ngayon automatic Manila na lahat ng dayjs() call
  const phTime = dayjs().toDate(); 
  const today = dayjs().startOf('day').toDate(); 

  const existing = await DTRLog.findOne({ 
    intern: user._id, 
    date: today, 
    timeOut: null 
  });
  
  if (existing) return NextResponse.json({ error: 'Already timed in' }, { status: 400 });

  // 8:30 AM PH cutoff. 8:30 sakto = on time pa
  const currentHour = dayjs().hour();
  const currentMinute = dayjs().minute();
  const isLate = currentHour > 8 || (currentHour === 8 && currentMinute >= 31);

  await DTRLog.create({
    intern: user._id,
    timeIn: phTime,
    date: today,
    isLate
  });

  return NextResponse.json({ 
    msg: 'Timed in', 
    isLate, 
    timeIn: dayjs().format('hh:mm A') 
  });
}