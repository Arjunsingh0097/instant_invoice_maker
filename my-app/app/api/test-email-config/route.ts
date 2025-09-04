import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;
    
    return NextResponse.json({
      emailUser: emailUser ? 'Set' : 'Not set',
      emailPass: emailPass ? 'Set' : 'Not set',
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to check email config' },
      { status: 500 }
    );
  }
}
