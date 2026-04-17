import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  const { name, email, password, company, requiredHours, role } = await req.json();

  if (!name ||!email ||!password ||!company ||!role) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  await dbConnect();

  const exists = await User.findOne({ email });
  if (exists) {
    return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await User.create({
    name,
    email,
    password: hashedPassword,
    company,
    requiredHours: role === 'intern'? requiredHours : 0,
    role
  });

  return NextResponse.json({ msg: 'User created' });
}