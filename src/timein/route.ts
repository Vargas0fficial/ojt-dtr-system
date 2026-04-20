import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import DTRLog from '@/models/DTRLog';
import User from '@/models/User';
import { NextResponse } from 'next/server';

// Tanggal na si dayjs. Native JS tayo.

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  await dbConnect();
  const user = await User.findById(session.user.id);

  // KUHA MANILA TIME GAMIT NATIVE JS - SUREBALL TO
  const now = new Date();
  const phTimeString = now.toLocaleString("en-US", { timeZone: "Asia/Manila" });
  const phTime = new Date(phTimeString); // Eto na yung actual Manila time
  
  // 12:00 AM Manila time para sa date grouping
  const today = new Date(phTime);
  today.setHours(0, 0, 0, 0);

  const existing = await DTRLog.findOne({ 
    intern: user._id, 
    date: today, 
    timeOut: null 
  });
  
  if (existing) return NextResponse.json({ error: 'Already timed in' }, { status: 400 });

  const hours = phTime.getHours(); // 0-23 format
  const minutes = phTime.getMinutes();
  
  // 8:30 AM cutoff. 8:30 = on time pa, 8:31 = late na
  const isLate = hours > 8 || (hours === 8 && minutes >= 31);

  await DTRLog.create({
    intern: user._id,
    timeIn: phTime,
    date: today,
    isLate
  });

  // Format para sa response
  const timeInFormatted = phTime.toLocaleTimeString("en-US", { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true,
    timeZone: "Asia/Manila" 
  });

  return NextResponse.json({ 
    msg: 'Timed in', 
    isLate, 
    timeIn: timeInFormatted 
  });
}