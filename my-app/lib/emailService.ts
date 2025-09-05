import nodemailer from 'nodemailer';

// Email configuration using environment variables
const emailConfig = {
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER || 'arjunkondal00.7@gmail.com',
    pass: process.env.EMAIL_PASS || 'dspq kmok dpep oerh' // Gmail app password
  },
  tls: {
    rejectUnauthorized: false,
    ciphers: 'SSLv3'
  },
  connectionTimeout: 30000, // 30 seconds
  greetingTimeout: 15000, // 15 seconds
  socketTimeout: 30000, // 30 seconds
  pool: false, // Disable pooling for Vercel
  maxConnections: 1, // Single connection for Vercel
  maxMessages: 1, // Single message per connection
  rateLimit: 5 // Reduce rate limit for Vercel
};

// Transporter will be created fresh for each email to avoid Vercel issues

export interface EmailData {
  to: string;
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    content: Buffer;
    contentType: string;
  }>;
}

// Retry logic is now built into the sendEmail function

export const sendEmail = async (emailData: EmailData): Promise<boolean> => {
  const maxRetries = 3;
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`=== EMAIL SEND ATTEMPT ${attempt}/${maxRetries} ===`);
      console.log('Environment:', process.env.NODE_ENV);
      console.log('Attempting to send email to:', emailData.to);
      console.log('Using email user:', emailConfig.auth.user);
      console.log('Email pass exists:', !!emailConfig.auth.pass);
      console.log('Timestamp:', new Date().toISOString());
      
      // Verify transporter configuration
      if (!emailConfig.auth.user || !emailConfig.auth.pass) {
        console.error('❌ Email configuration missing: user or pass not set');
        console.error('EMAIL_USER:', process.env.EMAIL_USER ? 'Set' : 'Not set');
        console.error('EMAIL_PASS:', process.env.EMAIL_PASS ? 'Set' : 'Not set');
        return false;
      }
      
      // Create a fresh transporter for each attempt (Vercel-specific)
      const freshTransporter = nodemailer.createTransport(emailConfig);
      
      const mailOptions = {
        from: `"InvoiceCraft" <${emailConfig.auth.user}>`,
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.html,
        attachments: emailData.attachments || []
      };

      console.log('Mail options prepared:', {
        from: mailOptions.from,
        to: mailOptions.to,
        subject: mailOptions.subject,
        attachmentsCount: mailOptions.attachments.length
      });

      // Verify connection first
      console.log('Verifying SMTP connection...');
      await freshTransporter.verify();
      console.log('✅ SMTP connection verified successfully');
      
      // Send email
      console.log('Sending email...');
      const info = await freshTransporter.sendMail(mailOptions);
      console.log('✅ Email sent successfully:', info.messageId);
      console.log('=== EMAIL SEND SUCCESS ===');
      
      // Close the connection
      freshTransporter.close();
      return true;
      
    } catch (error) {
      lastError = error as Error;
      console.error(`❌ Email send attempt ${attempt} failed:`, error);
      
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error name:', error.name);
        
        // Check for specific Gmail errors
        if (error.message.includes('Invalid login')) {
          console.error('❌ Gmail authentication failed - check email credentials');
          return false; // Don't retry auth errors
        } else if (error.message.includes('Less secure app access')) {
          console.error('❌ Gmail requires app password - enable 2FA and use app password');
          return false; // Don't retry auth errors
        } else if (error.message.includes('Connection timeout')) {
          console.error('❌ Connection timeout - will retry');
        } else if (error.message.includes('Rate limit exceeded')) {
          console.error('❌ Rate limit exceeded - will retry');
        } else if (error.message.includes('ECONNRESET')) {
          console.error('❌ Connection reset - will retry');
        } else if (error.message.includes('ETIMEDOUT')) {
          console.error('❌ Connection timed out - will retry');
        }
      }
      
      // If this is not the last attempt, wait before retrying
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000; // Exponential backoff: 2s, 4s, 8s
        console.log(`⏳ Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  console.error('❌ Email send failed after all retries:', lastError);
  console.log('=== EMAIL SEND FAILED ===');
  return false;
};

export const generateInvoiceEmailHTML = (
  invoiceNumber: string,
  invoiceType: string,
  fromDetails: string,
  toDetails: string,
  total: number,
  invoiceDate: string
): string => {
  const companyName = fromDetails.split('\n')[0] || 'Company Name';
  const clientName = toDetails.split('\n')[0] || 'Client Name';
  const companyAddress = fromDetails.split('\n').slice(1).join('<br>') || 'Company Address';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${invoiceType} - ${invoiceNumber}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Arial', sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f5f5f5;
          padding: 20px;
        }
        .email-wrapper {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        .header {
          background-color: #1e3a8a;
          color: white;
          padding: 30px;
          text-align: center;
        }
        .header h1 {
          font-size: 28px;
          font-weight: bold;
          margin-bottom: 8px;
        }
        .header .subtitle {
          font-size: 14px;
          opacity: 0.9;
        }
        .content {
          padding: 30px;
        }
        .greeting {
          font-size: 16px;
          color: #333;
          margin-bottom: 20px;
          font-weight: bold;
        }
        .main-content {
          font-size: 14px;
          color: #666;
          margin-bottom: 25px;
          line-height: 1.6;
        }
        .main-content p {
          margin-bottom: 15px;
        }
        .invoice-summary {
          background-color: #ffffff;
          border: 1px solid #e0e0e0;
          border-left: 4px solid #1e3a8a;
          padding: 20px;
          margin: 25px 0;
        }
        .summary-title {
          font-size: 16px;
          font-weight: bold;
          color: #333;
          margin-bottom: 15px;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid #f0f0f0;
        }
        .detail-row:last-child {
          border-bottom: none;
        }
        .detail-label {
          font-weight: bold;
          color: #333;
          font-size: 13px;
        }
        .detail-value {
          color: #333;
          font-size: 13px;
        }
        .total-amount {
          color: #22c55e;
          font-weight: bold;
        }
        .additional-info {
          background-color: #f8f9fa;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
        }
        .additional-info h3 {
          font-size: 14px;
          font-weight: bold;
          color: #333;
          margin-bottom: 8px;
        }
        .additional-info p {
          font-size: 13px;
          color: #666;
          margin: 0;
        }
        .payment-section {
          background-color: #1e3a8a;
          color: white;
          padding: 20px;
          text-align: center;
          margin: 25px 0;
        }
        .payment-section h3 {
          font-size: 16px;
          font-weight: bold;
          margin-bottom: 10px;
        }
        .payment-section p {
          font-size: 13px;
          margin: 0;
          opacity: 0.9;
        }
        .closing-content {
          font-size: 14px;
          color: #666;
          margin: 25px 0;
          line-height: 1.6;
        }
        .closing-content p {
          margin-bottom: 15px;
        }
        .footer {
          background-color: #ffffff;
          padding: 25px 30px;
          border-top: 1px solid #e0e0e0;
        }
        .signature {
          font-size: 14px;
          color: #333;
          margin-bottom: 15px;
        }
        .company-name {
          font-weight: bold;
          margin-bottom: 5px;
        }
        .company-address {
          font-size: 13px;
          color: #666;
          line-height: 1.4;
        }
        @media (max-width: 600px) {
          .email-wrapper {
            margin: 0;
            border-radius: 0;
          }
          .header, .content, .footer {
            padding: 20px;
          }
          .header h1 {
            font-size: 24px;
          }
        }
      </style>
    </head>
    <body>
      <div class="email-wrapper">
        <div class="header">
          <h1>${invoiceType} #${invoiceNumber}</h1>
          <div class="subtitle">Professional Business Document</div>
        </div>
        
        <div class="content">
          <div class="greeting">Dear ${clientName},</div>
          
          <div class="main-content">
            <p>We hope this message finds you well. Please find attached your ${invoiceType} #${invoiceNumber} for the services provided. We appreciate your business and look forward to continuing our professional relationship.</p>
          </div>
          
          <div class="invoice-summary">
            <div class="summary-title">Invoice Summary</div>
            <div class="detail-row">
              <span class="detail-label">INVOICE NUMBER:</span>
              <span class="detail-value">${invoiceNumber}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">ISSUE DATE:</span>
              <span class="detail-value">${new Date(invoiceDate).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">PAYMENT TERMS:</span>
              <span class="detail-value">Net 15</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">TOTAL AMOUNT:</span>
              <span class="detail-value total-amount">$${total.toFixed(2)}</span>
            </div>
          </div>
          
          <div class="additional-info">
            <h3>Additional Information</h3>
            <p>Please review the attached PDF for complete payment details and remittance instructions.</p>
          </div>
          
          <div class="payment-section">
            <h3>Payment Information</h3>
            <p>Please review the attached PDF for complete payment details and remittance instructions.</p>
          </div>
          
          <div class="closing-content">
            <p>Should you have any questions regarding this ${invoiceType.toLowerCase()} or require any clarification, please do not hesitate to contact us. We are committed to providing exceptional service and ensuring your complete satisfaction.</p>
            
            <p>Thank you for your continued trust in our services. We look forward to serving you again in the future.</p>
          </div>
        </div>
        
        <div class="footer">
          <div class="signature">
            Best regards,<br>
            <div class="company-name">${companyName}</div>
            <div class="company-address">${companyAddress}</div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};
