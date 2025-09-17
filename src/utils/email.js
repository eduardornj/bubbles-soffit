// Email utility for sending notifications and confirmations

// Email service configuration (use environment variables in production)
const EMAIL_CONFIG = {
  // For development, you can use services like:
  // - Nodemailer with Gmail SMTP
  // - SendGrid API
  // - Mailgun API
  // - AWS SES
  
  service: process.env.EMAIL_SERVICE || 'smtp',
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || 'your-email@gmail.com',
    pass: process.env.SMTP_PASS || 'your-app-password'
  },
  from: process.env.FROM_EMAIL || 'noreply@bubblesenterprise.com'
};

// Email templates
const EMAIL_TEMPLATES = {
  'quote-request': {
    subject: 'New Quote Request - {{firstName}} {{lastName}}',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">New Quote Request</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Bubbles Enterprise - Soffit & Fascia Services</p>
        </div>
        
        <div style="padding: 30px; background: #f8fafc;">
          <h2 style="color: #1e40af; margin-top: 0;">Customer Information</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; font-weight: bold;">Name:</td><td>{{firstName}} {{lastName}}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Email:</td><td><a href="mailto:{{email}}">{{email}}</a></td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Phone:</td><td><a href="tel:{{phone}}">{{phone}}</a></td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Address:</td><td>{{address}}, {{city}} {{zipCode}}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Preferred Contact:</td><td>{{contactMethod}}</td></tr>
          </table>
          
          <h3 style="color: #1e40af; margin-top: 30px;">Project Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; font-weight: bold;">Service Type:</td><td>{{serviceType}}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Timeline:</td><td>{{timeline}}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Budget:</td><td>{{budget}}</td></tr>
          </table>
          
          <h3 style="color: #1e40af; margin-top: 30px;">Project Description</h3>
          <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6;">
            {{projectDescription}}
          </div>
          
          <div style="margin-top: 30px; padding: 20px; background: #dbeafe; border-radius: 8px;">
            <p style="margin: 0; color: #1e40af; font-weight: bold;">📞 Next Steps:</p>
            <p style="margin: 10px 0 0 0;">Contact the customer within 24 hours using their preferred method: {{contactMethod}}</p>
          </div>
        </div>
        
        <div style="background: #1f2937; color: white; padding: 20px; text-align: center;">
          <p style="margin: 0; opacity: 0.8;">Bubbles Enterprise | Orlando, FL | (407) 715-1790</p>
        </div>
      </div>
    `
  },
  
  'estimate-details': {
    subject: 'Your Soffit & Fascia Estimate - ${{totalPrice}}',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">Your Estimate is Ready!</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Professional Soffit & Fascia Services in Orlando</p>
        </div>
        
        <div style="padding: 30px; background: #f8fafc;">
          <div style="background: white; padding: 25px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin-bottom: 30px;">
            <h2 style="color: #1e40af; margin-top: 0; text-align: center; font-size: 32px;">${{totalPrice}}</h2>
            <p style="text-align: center; color: #6b7280; margin: 0;">Estimated Total Cost</p>
          </div>
          
          <h3 style="color: #1e40af;">Project Specifications</h3>
          <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden;">
            <tr style="background: #f3f4f6;"><td style="padding: 12px; font-weight: bold;">Linear Feet:</td><td style="padding: 12px;">{{linearFeet}} ft</td></tr>
            <tr><td style="padding: 12px; font-weight: bold;">Overhang:</td><td style="padding: 12px;">{{overhang}} inches</td></tr>
            <tr style="background: #f3f4f6;"><td style="padding: 12px; font-weight: bold;">Installation Type:</td><td style="padding: 12px;">{{installationType}}</td></tr>
            <tr><td style="padding: 12px; font-weight: bold;">Material:</td><td style="padding: 12px;">{{materialType}}</td></tr>
            <tr style="background: #f3f4f6;"><td style="padding: 12px; font-weight: bold;">Service:</td><td style="padding: 12px;">{{serviceType}}</td></tr>
            <tr><td style="padding: 12px; font-weight: bold;">Location:</td><td style="padding: 12px;">{{zipCode}}</td></tr>
          </table>
          
          {{#if notes}}
          <h3 style="color: #1e40af; margin-top: 30px;">Additional Notes</h3>
          <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6;">
            {{notes}}
          </div>
          {{/if}}
          
          <div style="margin-top: 30px; padding: 25px; background: #dbeafe; border-radius: 12px; text-align: center;">
            <h3 style="color: #1e40af; margin-top: 0;">🎯 Ready to Get Started?</h3>
            <p style="margin: 15px 0;">This estimate is valid for 30 days. Contact us to schedule your free on-site consultation!</p>
            <div style="margin-top: 20px;">
              <a href="tel:+14077151790" style="display: inline-block; background: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 5px;">📞 Call (407) 715-1790</a>
              <a href="mailto:contact@bubblesenterprise.com" style="display: inline-block; background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 5px;">✉️ Email Us</a>
            </div>
          </div>
          
          <div style="margin-top: 30px; padding: 20px; background: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
            <p style="margin: 0; color: #92400e;"><strong>⚠️ Important:</strong> This is a preliminary estimate based on the information provided. Final pricing may vary after our free on-site inspection.</p>
          </div>
        </div>
        
        <div style="background: #1f2937; color: white; padding: 30px; text-align: center;">
          <h3 style="margin-top: 0; color: #60a5fa;">Why Choose Bubbles Enterprise?</h3>
          <div style="display: flex; justify-content: space-around; flex-wrap: wrap; margin: 20px 0;">
            <div style="margin: 10px; text-align: center;">
              <div style="font-size: 24px; margin-bottom: 5px;">🏆</div>
              <div style="font-size: 14px;">Licensed & Insured</div>
            </div>
            <div style="margin: 10px; text-align: center;">
              <div style="font-size: 24px; margin-bottom: 5px;">⚡</div>
              <div style="font-size: 14px;">24hr Response</div>
            </div>
            <div style="margin: 10px; text-align: center;">
              <div style="font-size: 24px; margin-bottom: 5px;">💯</div>
              <div style="font-size: 14px;">Quality Guarantee</div>
            </div>
          </div>
          <p style="margin: 20px 0 0 0; opacity: 0.8; font-size: 14px;">Bubbles Enterprise | Orlando, FL | Licensed General Contractor</p>
        </div>
      </div>
    `
  }
};

// Main email sending function
export async function sendEmail(options) {
  try {
    const {
      to,
      cc,
      bcc,
      subject,
      template,
      data = {},
      attachments = []
    } = options;
    
    // In a real implementation, you would use a proper email service
    // For now, we'll simulate the email sending and log the details
    
    let emailContent;
    
    if (template && EMAIL_TEMPLATES[template]) {
      const templateData = EMAIL_TEMPLATES[template];
      emailContent = {
        subject: interpolateTemplate(subject || templateData.subject, data),
        html: interpolateTemplate(templateData.html, data)
      };
    } else {
      emailContent = {
        subject: subject || 'Notification from Bubbles Enterprise',
        html: `<p>${JSON.stringify(data, null, 2)}</p>`
      };
    }
    
    // Log email details (in production, replace with actual email sending)
    console.log('📧 Email would be sent:');
    console.log('To:', to);
    console.log('Subject:', emailContent.subject);
    console.log('Template:', template);
    console.log('Data:', data);
    
    // Simulate email service response
    const success = Math.random() > 0.1; // 90% success rate simulation
    
    if (success) {
      return {
        success: true,
        messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };
    } else {
      throw new Error('Simulated email service error');
    }
    
  } catch (error) {
    console.error('Email sending error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Template interpolation function
function interpolateTemplate(template, data) {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return data[key] || match;
  });
}

// Email validation
export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Bulk email sending with rate limiting
export async function sendBulkEmails(emails, options = {}) {
  const {
    batchSize = 10,
    delayBetweenBatches = 1000 // 1 second
  } = options;
  
  const results = [];
  
  for (let i = 0; i < emails.length; i += batchSize) {
    const batch = emails.slice(i, i + batchSize);
    
    const batchPromises = batch.map(emailOptions => 
      sendEmail(emailOptions)
    );
    
    const batchResults = await Promise.allSettled(batchPromises);
    results.push(...batchResults);
    
    // Delay between batches to avoid overwhelming the email service
    if (i + batchSize < emails.length) {
      await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
    }
  }
  
  return results;
}

// Email queue for handling high volume (simplified version)
class EmailQueue {
  constructor() {
    this.queue = [];
    this.processing = false;
  }
  
  add(emailOptions) {
    this.queue.push(emailOptions);
    if (!this.processing) {
      this.process();
    }
  }
  
  async process() {
    this.processing = true;
    
    while (this.queue.length > 0) {
      const emailOptions = this.queue.shift();
      try {
        await sendEmail(emailOptions);
        await new Promise(resolve => setTimeout(resolve, 100)); // Small delay
      } catch (error) {
        console.error('Queue email error:', error);
        // Could implement retry logic here
      }
    }
    
    this.processing = false;
  }
}

export const emailQueue = new EmailQueue();