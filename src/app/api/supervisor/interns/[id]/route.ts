import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { NextResponse } from 'next/server';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role!== 'supervisor') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const { requiredHours } = await req.json();

  if (!requiredHours || requiredHours < 1) {
    return NextResponse.json({ error: 'Invalid hours' }, { status: 400 });
  }

  await dbConnect();
  await User.findByIdAndUpdate(id, { requiredHours: Number(requiredHours) });

  return NextResponse.json({ msg: 'Updated' });
}