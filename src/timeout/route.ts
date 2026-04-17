import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import DTRLog from '@/models/DTRLog';
import { NextResponse } from 'next/server';

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await dbConnect();
  
  // Gamitin PH timezone para makita yung time-in today
  const now = new Date();
  const phTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Manila' }));
  
  const today = new Date(phTime);
  today.setHours(0, 0, 0, 0);

  const log = await DTRLog.findOne({ 
    intern: session.user.id, 
    date: today, 
    timeOut: null 
  });
  
  if (!log) return NextResponse.json({ error: 'No active time in' }, { status: 400 });

  log.timeOut = now; // Save as UTC pa rin sa DB
  // Compute hours: UTC - UTC = accurate pa rin
  const hours = (now.getTime() - log.timeIn.getTime()) / 1000 / 60 / 60;
  log.hours = parseFloat(hours.toFixed(2)); // 2 decimal places lang
  
  await log.save();

  return NextResponse.json({ 
    msg: 'Timed out', 
    hours: log.hours,
    timeOut: phTime.toLocaleTimeString('en-US', { 
      timeZone: 'Asia/Manila',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true 
    })
  });
}