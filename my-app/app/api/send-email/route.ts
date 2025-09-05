import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, generateInvoiceEmailHTML } from '@/lib/emailService';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    console.log('=== EMAIL API REQUEST START ===');
    console.log('Timestamp:', new Date().toISOString());
    
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

    // Debug: Log received fields
    console.log('Received fields:', {
      to: !!to,
      invoiceNumber: !!invoiceNumber,
      invoiceType: !!invoiceType,
      fromDetails: !!fromDetails,
      toDetails: !!toDetails,
      items: !!items,
      itemsLength: items?.length,
      hasPdfAttachment: !!pdfAttachment
    });

    // Validate required fields
    if (!to || !invoiceNumber || !invoiceType || !fromDetails || !toDetails || !items) {
      const missingFields = [];
      if (!to) missingFields.push('to');
      if (!invoiceNumber) missingFields.push('invoiceNumber');
      if (!invoiceType) missingFields.push('invoiceType');
      if (!fromDetails) missingFields.push('fromDetails');
      if (!toDetails) missingFields.push('toDetails');
      if (!items) missingFields.push('items');
      
      console.error('❌ Missing required fields:', missingFields);
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Calculate totals
    const subtotal = items.reduce((sum: number, item: { amount: number }) => sum + item.amount, 0);
    const taxAmount = (subtotal - discount) * (taxRate / 100);
    const finalTotal = subtotal - discount + taxAmount + shipping;

    console.log('Calculated totals:', {
      subtotal,
      taxAmount,
      discount,
      shipping,
      finalTotal
    });

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
      console.log('Preparing PDF attachment...');
      attachments.push({
        filename: `${invoiceType.toLowerCase()}-${invoiceNumber}.pdf`,
        content: Buffer.from(pdfAttachment, 'base64'),
        contentType: 'application/pdf'
      });
    }

    console.log('Sending email with attachments:', attachments.length);

    // Send email with timeout
    const emailPromise = sendEmail({
      to,
      subject: `${invoiceType} #${invoiceNumber} - ${fromDetails.split('\n')[0] || 'Invoice'}`,
      html: emailHTML,
      attachments
    });

    // Add timeout to prevent hanging
    const timeoutPromise = new Promise<boolean>((_, reject) => {
      setTimeout(() => reject(new Error('Email send timeout after 30 seconds')), 30000);
    });

    const emailSent = await Promise.race([emailPromise, timeoutPromise]);

    const duration = Date.now() - startTime;
    console.log(`Email processing completed in ${duration}ms`);

    if (emailSent) {
      console.log('✅ Email sent successfully');
      return NextResponse.json(
        { 
          message: 'Email sent successfully',
          timestamp: new Date().toISOString(),
          duration: `${duration}ms`
        },
        { status: 200 }
      );
    } else {
      console.error('❌ Email send returned false');
      return NextResponse.json(
        { 
          error: 'Failed to send email - check server logs for details',
          timestamp: new Date().toISOString(),
          duration: `${duration}ms`
        },
        { status: 500 }
      );
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('❌ Error in send-email API:', error);
    console.error('Duration:', `${duration}ms`);
    
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    console.log('=== EMAIL API REQUEST FAILED ===');
    
    return NextResponse.json(
      { 
        error: `Email send failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString(),
        duration: `${duration}ms`
      },
      { status: 500 }
    );
  }
}
