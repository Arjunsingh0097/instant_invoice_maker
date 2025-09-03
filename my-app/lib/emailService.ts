import nodemailer from 'nodemailer';

// Email configuration
const emailConfig = {
  service: 'gmail',
  auth: {
    user: 'arjunkondal00.7@gmail.com',
    pass: 'dspq kmok dpep oerh' // Gmail app password
  }
};

// Create transporter
const transporter = nodemailer.createTransport(emailConfig);

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

export const sendEmail = async (emailData: EmailData): Promise<boolean> => {
  try {
    console.log('Attempting to send email to:', emailData.to);
    
    const mailOptions = {
      from: `"InvoiceCraft" <${emailConfig.auth.user}>`,
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.html,
      attachments: emailData.attachments || []
    };

    // Skip connection verification for faster sending
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
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

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${invoiceType} - ${invoiceNumber}</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f8f9fa;
        }
        .email-container {
          background-color: white;
          padding: 40px;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
          border: 1px solid #e9ecef;
        }
        .header {
          text-align: center;
          border-bottom: 3px solid #007bff;
          padding-bottom: 25px;
          margin-bottom: 35px;
        }
        .header h1 {
          color: #007bff;
          margin: 0;
          font-size: 32px;
          font-weight: 600;
          letter-spacing: -0.5px;
        }
        .header p {
          color: #6c757d;
          font-size: 16px;
          margin: 8px 0 0 0;
          font-weight: 500;
        }
        .greeting {
          font-size: 18px;
          color: #495057;
          margin-bottom: 25px;
          font-weight: 500;
        }
        .main-content {
          font-size: 16px;
          color: #495057;
          margin-bottom: 30px;
          line-height: 1.7;
        }
        .invoice-details {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          padding: 25px;
          border-radius: 8px;
          margin: 25px 0;
          border-left: 4px solid #007bff;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12px;
          padding: 8px 0;
          border-bottom: 1px solid #dee2e6;
        }
        .detail-row:last-child {
          border-bottom: none;
        }
        .detail-label {
          font-weight: 600;
          color: #495057;
          font-size: 15px;
        }
        .detail-value {
          color: #212529;
          font-weight: 500;
          font-size: 15px;
        }
        .total-section {
          background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
          color: white;
          padding: 30px;
          border-radius: 10px;
          text-align: center;
          margin: 30px 0;
          box-shadow: 0 4px 15px rgba(0,123,255,0.3);
        }
        .total-label {
          font-size: 18px;
          font-weight: 500;
          margin-bottom: 10px;
          opacity: 0.9;
        }
        .total-amount {
          font-size: 36px;
          font-weight: 700;
          margin: 15px 0;
          text-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        .attachment-notice {
          background-color: #e7f3ff;
          border: 1px solid #b3d9ff;
          border-radius: 8px;
          padding: 20px;
          margin: 25px 0;
          text-align: center;
        }
        .attachment-notice p {
          margin: 0;
          color: #0066cc;
          font-weight: 500;
          font-size: 16px;
        }
        .footer {
          text-align: center;
          margin-top: 40px;
          padding-top: 25px;
          border-top: 2px solid #e9ecef;
          color: #6c757d;
          font-size: 15px;
        }
        .signature {
          font-weight: 600;
          color: #495057;
          margin: 15px 0;
        }
        .disclaimer {
          font-size: 13px;
          color: #868e96;
          margin-top: 20px;
          font-style: italic;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <h1>${invoiceType}</h1>
          <p>Document #${invoiceNumber}</p>
        </div>
        
        <div class="greeting">Dear ${clientName},</div>
        
        <div class="main-content">
          <p>We hope this message finds you well. We are pleased to present your ${invoiceType.toLowerCase()} for the services provided.</p>
          
          <p>Please find below a summary of your ${invoiceType.toLowerCase()}. For a detailed PDF document, please contact us and we will provide it promptly.</p>
        </div>
        
        <div class="invoice-details">
          <div class="detail-row">
            <span class="detail-label">Service Provider:</span>
            <span class="detail-value">${companyName}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Document Date:</span>
            <span class="detail-value">${new Date(invoiceDate).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Reference Number:</span>
            <span class="detail-value">${invoiceNumber}</span>
          </div>
        </div>
        
        <div class="total-section">
          <div class="total-label">Total Amount Due</div>
          <div class="total-amount">$${total.toFixed(2)}</div>
        </div>
        
        <div class="attachment-notice">
          <p>📄 For a detailed PDF version of this ${invoiceType.toLowerCase()}, please contact us</p>
        </div>
        
        <div class="main-content">
          <p>Should you have any questions regarding this ${invoiceType.toLowerCase()} or require clarification on any items, please do not hesitate to contact us. We are committed to providing excellent service and ensuring your complete satisfaction.</p>
          
          <p>We appreciate your business and look forward to continuing our professional relationship.</p>
        </div>
        
        <div class="footer">
          <div class="signature">
            Best regards,<br>
            <strong>${companyName}</strong>
          </div>
          <div class="disclaimer">
            This is an automated message. Please do not reply directly to this email address.
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};
