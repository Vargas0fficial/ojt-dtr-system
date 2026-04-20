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

  // KUNIN MANILA TIME AS PARTS - WALANG DATE CONVERSION
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Manila',
    year: 'numeric',
    month: 'numeric', 
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false // 24-hour format para madali i-compare
  });
  
  const parts = formatter.formatToParts(now);
  const getPart = (type: string) => Number(parts.find(p => p.type === type)?.value);
  
  const year = getPart('year');
  const month = getPart('month'); // 1-12
  const day = getPart('day');
  const hours = getPart('hour'); // 0-23 NA. ITO NA YUNG MANILA HOUR
  const minutes = getPart('minute');
  const seconds = getPart('second');

  // Gawa tayo ng Date object na naka-set na sa Manila time
  // Month - 1 kasi 0-indexed si JS
  const phTime = new Date(year, month - 1, day, hours, minutes, seconds);
  const today = new Date(year, month - 1, day, 0, 0, 0);

  const existing = await DTRLog.findOne({ 
    intern: user._id, 
    date: today, 
    timeOut: null 
  });
  
  if (existing) return NextResponse.json({ error: 'Already timed in' }, { status: 400 });

  // 8:30 AM cutoff. hours = Manila hour na talaga to
  const isLate = hours > 8 || (hours === 8 && minutes >= 31);

  await DTRLog.create({
    intern: user._id,
    timeIn: phTime,
    date: today,
    isLate
  });

  // Format pang display
  const timeInFormatted = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Manila',
    hour: '2-digit',
    minute: '2-digit', 
    hour12: true
  }).format(now);

  return NextResponse.json({ 
    msg: 'Timed in', 
    isLate, 
    timeIn: timeInFormatted 
  });
}