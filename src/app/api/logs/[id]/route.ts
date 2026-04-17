import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import DTRLog from '@/models/DTRLog';
import { NextResponse } from 'next/server';

export async function DELETE(
  req: Request, 
  { params }: { params: Promise<{ id: string }> } // params is a Promise now
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params; // must await params first
  
  await dbConnect();
  await DTRLog.findOneAndDelete({ _id: id, intern: session.user.id });

  return NextResponse.json({ msg: 'Deleted' });
}