import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/emailService';

export async function GET(request: NextRequest) {
  try {
    console.log('=== EMAIL DEBUG ENDPOINT ===');
    console.log('Environment:', process.env.NODE_ENV);
    console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'Set' : 'Not set');
    console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'Set' : 'Not set');
    
    // Test basic email sending
    const testEmailSent = await sendEmail({
      to: 'arjunkondal00.7@gmail.com', // Send to yourself for testing
      subject: 'Test Email from InvoiceCraft Debug',
      html: `
        <h1>Test Email</h1>
        <p>This is a test email to verify email functionality.</p>
        <p>Timestamp: ${new Date().toISOString()}</p>
        <p>Environment: ${process.env.NODE_ENV}</p>
      `
    });

    return NextResponse.json({
      success: testEmailSent,
      message: testEmailSent ? 'Test email sent successfully' : 'Test email failed',
      environment: process.env.NODE_ENV,
      emailUser: process.env.EMAIL_USER ? 'Set' : 'Not set',
      emailPass: process.env.EMAIL_PASS ? 'Set' : 'Not set',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Debug email error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
