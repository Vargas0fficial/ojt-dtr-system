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
  
  // Kuhanin current time sa PH timezone
  const now = new Date();
  const phTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Manila' }));
  
  // Set date to 12:00 AM PH time para same day grouping
  const today = new Date(phTime);
  today.setHours(0, 0, 0, 0);

  const existing = await DTRLog.findOne({ 
    intern: user._id, 
    date: today, 
    timeOut: null 
  });
  
  if (existing) return NextResponse.json({ error: 'Already timed in' }, { status: 400 });

  // 8:30 AM PH time cutoff. 8:30 sakto = on time pa
  const hours = phTime.getHours();
  const minutes = phTime.getMinutes();
  const isLate = hours > 8 || (hours === 8 && minutes >= 31);

  await DTRLog.create({ 
    intern: user._id, 
    timeIn: now, // Save mo pa rin as UTC sa DB
    date: today, 
    isLate 
  });

  return NextResponse.json({ 
    msg: 'Timed in', 
    isLate,
    timeIn: phTime.toLocaleTimeString('en-US', { 
      timeZone: 'Asia/Manila',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true 
    })
  });
}