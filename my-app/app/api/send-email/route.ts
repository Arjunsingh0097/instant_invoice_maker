import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, generateInvoiceEmailHTML } from '@/lib/emailService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      to,
      invoiceNumber,
      invoiceType,
      fromDetails,
      toDetails,
      invoiceDate,
      items,
      taxRate,
      discount,
      shipping,
      pdfAttachment
    } = body;

    // Validate required fields
    if (!to || !invoiceNumber || !invoiceType || !fromDetails || !toDetails) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Calculate totals
    const subtotal = items.reduce((sum: number, item: { amount: number }) => sum + item.amount, 0);
    const taxAmount = (subtotal - discount) * (taxRate / 100);
    const finalTotal = subtotal - discount + taxAmount + shipping;

    // Generate email HTML
    const emailHTML = generateInvoiceEmailHTML(
      invoiceNumber,
      invoiceType,
      fromDetails,
      toDetails,
      finalTotal,
      invoiceDate
    );

    // Prepare attachments
    const attachments = [];
    if (pdfAttachment) {
      attachments.push({
        filename: `${invoiceType.toLowerCase()}-${invoiceNumber}.pdf`,
        content: Buffer.from(pdfAttachment, 'base64'),
        contentType: 'application/pdf'
      });
    }

    // Send email
    const emailSent = await sendEmail({
      to,
      subject: `${invoiceType} #${invoiceNumber} - ${fromDetails.split('\n')[0] || 'Invoice'}`,
      html: emailHTML,
      attachments
    });

    if (emailSent) {
      return NextResponse.json(
        { message: 'Email sent successfully' },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in send-email API:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return NextResponse.json(
      { error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
