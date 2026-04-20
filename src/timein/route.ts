import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import DTRLog from '@/models/DTRLog';
import User from '@/models/User';
import { NextResponse } from 'next/server';

// ITO YUNG DAGDAG KO BRO - PARA MAMATAY NA SI CACHE AT EDGE RUNTIME
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic'; 
export const revalidate = 0;

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  await dbConnect();
  const user = await User.findById(session.user.id);

  // BRUTE FORCE: UTC + 8 = Manila. Wala nang drama.
  const utcDate = new Date();
  const manilaHours = (utcDate.getUTCHours() + 8) % 24;
  const manilaMinutes = utcDate.getUTCMinutes();
  const manilaSeconds = utcDate.getUTCSeconds();
  
  // Para sa date grouping na naka-Manila na
  const todayManila = new Date();
  todayManila.setUTCHours(manilaHours, manilaMinutes, manilaSeconds, 0);
  todayManila.setUTCHours(0, 0, 0, 0); // Set sa 12:00 AM Manila

  // Gawa tayo ng timeIn na naka-offset na
  const phTime = new Date();
  phTime.setUTCHours(manilaHours, manilaMinutes, manilaSeconds, 0);

  const existing = await DTRLog.findOne({ 
    intern: user._id, 
    date: todayManila, 
    timeOut: null 
  });
  
  if (existing) return NextResponse.json({ error: 'Already timed in' }, { status: 400 });

  // 8:30 AM cutoff gamit yung brute force hours
  const isLate = manilaHours > 8 || (manilaHours === 8 && manilaMinutes >= 31);

  // DEBUG: Check mo to sa Vercel Logs after mo mag time-in
  console.log('UTC Hour:', utcDate.getUTCHours(), 'Manila Hour:', manilaHours, 'isLate:', isLate);

  await DTRLog.create({
    intern: user._id,
    timeIn: phTime,
    date: todayManila,
    isLate
  });

  // Format pang display
  const displayHours = manilaHours % 12 || 12;
  const ampm = manilaHours >= 12 ? 'PM' : 'AM';
  const timeInFormatted = `${displayHours}:${manilaMinutes.toString().padStart(2, '0')} ${ampm}`;

  return NextResponse.json({ 
    msg: 'Timed in', 
    isLate, 
    timeIn: timeInFormatted 
  });
}