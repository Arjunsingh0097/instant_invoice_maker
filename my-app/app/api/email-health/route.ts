import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function GET(request: NextRequest) {
  try {
    const emailConfig = {
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER || 'arjunkondal00.7@gmail.com',
        pass: process.env.EMAIL_PASS || 'dspq kmok dpep oerh'
      },
      tls: {
        rejectUnauthorized: false,
        ciphers: 'SSLv3'
      },
      connectionTimeout: 10000,
      greetingTimeout: 5000,
      socketTimeout: 10000
    };

    const transporter = nodemailer.createTransporter(emailConfig);
    
    // Test connection
    await transporter.verify();
    transporter.close();
    
    return NextResponse.json({
      status: 'healthy',
      message: 'Email service is working',
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
      emailUser: process.env.EMAIL_USER ? 'Set' : 'Not set',
      emailPass: process.env.EMAIL_PASS ? 'Set' : 'Not set'
    });
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      message: 'Email service is not working',
      error: error instanceof Error ? error.message : 'Unknown error',
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
      emailUser: process.env.EMAIL_USER ? 'Set' : 'Not set',
      emailPass: process.env.EMAIL_PASS ? 'Set' : 'Not set'
    }, { status: 500 });
  }
}
