import dbConnect from '@/lib/mongodb';
import Log from '@/models/Log';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role!== 'supervisor')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await dbConnect();
  const interns = await User.find({ supervisor: session.user.email, role: 'intern' });
  const internNames = interns.map(i => i.name);
  const logs = await Log.find({ internName: { $in: internNames } }).sort({ createdAt: -1 });
  return NextResponse.json({ logs, interns });
}