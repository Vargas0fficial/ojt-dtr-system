import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export async function POST(req: Request) {
  const { email } = await req.json();
  await dbConnect();

  const user = await User.findOne({ email });
  if (!user) {
    console.log('Password reset requested for non-existent email:', email);
    return NextResponse.json({ msg: 'If email exists, link sent' });
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

  user.resetToken = resetToken;
  user.resetTokenExpiry = resetTokenExpiry;
  await user.save();

  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;
  
  console.log('=== PASSWORD RESET LINK ===');
  console.log(resetUrl);
  console.log('===========================');

  try {
    await transporter.sendMail({
      from: `"OJT DTR System" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Reset your OJT DTR password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #1f2937;">Password Reset Request</h2>
          <p>You requested a password reset for your OJT DTR account.</p>
          <p>Click the button below to reset your password. This link expires in 1 hour.</p>
          <a href="${resetUrl}" style="background:#2563eb;color:white;padding:12px 24px;text-decoration:none;border-radius:8px;display:inline-block;margin:16px 0;font-weight:600;">Reset Password</a>
          <p style="color:#6b7280;font-size:14px;">Or copy this URL:<br/>${resetUrl}</p>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;">
          <p style="color:#6b7280;font-size:12px;">If you didn't request this, you can safely ignore this email.</p>
        </div>
      `
    });
    
    console.log('Email sent successfully to:', email);
  } catch (e) {
    console.error('Email send failed:', e);
    // Don't throw error - link is still in console for testing
  }

  return NextResponse.json({ msg: 'If an account exists, a reset link has been sent' });
}