// Estimate API endpoint with spam protection
import { rateLimit } from '../../utils/rateLimit.js';
import { validateAISecurityMiddleware } from '../../middleware/aiSecurityMiddleware.js';
import { validateInput } from '../../utils/validation.js';
import { sendEmail } from '../../utils/email.js';

// Rate limiting: 5 requests per 10 minutes per IP (more lenient for calculator)
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many estimate requests from this IP, please try again later.'
});

export async function POST({ request }) {
  try {
    // Apply rate limiting
    const rateLimitResult = await limiter(request);
    if (rateLimitResult.error) {
      return new Response(JSON.stringify({
        success: false,
        error: rateLimitResult.error
      }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Apply AI security validation
    const aiSecurityResult = await validateAISecurityMiddleware(request);
    if (!aiSecurityResult.allowed) {
      console.log('AI Security blocked request:', {
        riskLevel: aiSecurityResult.riskLevel,
        analysis: aiSecurityResult.analysis
      });
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Security validation failed. Please try again.',
          riskLevel: aiSecurityResult.riskLevel
        }),
        { 
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Log security analysis for monitoring
    if (aiSecurityResult.riskLevel !== 'MINIMAL') {
      console.log('AI Security analysis:', {
        riskLevel: aiSecurityResult.riskLevel,
        requiresChallenge: aiSecurityResult.requiresChallenge,
        factors: aiSecurityResult.analysis?.riskFactors
      });
    }

    const formData = await request.formData();
    
    // Honeypot field check
    const honeypot = formData.get('website');
    if (honeypot) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid submission detected'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Extract form data
    const estimateData = {
      // Contact info
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      contactMethod: formData.get('contactMethod'),
      notes: formData.get('notes'),
      
      // Calculator data
      linearFeet: parseFloat(formData.get('linearFeet')),
      overhang: parseFloat(formData.get('overhang')),
      installationType: formData.get('installationType'),
      materialType: formData.get('materialType'),
      serviceType: formData.get('serviceType'),
      zipCode: formData.get('zipCode'),
      totalPrice: parseFloat(formData.get('totalPrice'))
    };

    // Validate required fields
    const validation = validateInput(estimateData, {
      firstName: { required: true, minLength: 2, maxLength: 50 },
      lastName: { required: true, minLength: 2, maxLength: 50 },
      email: { required: true, type: 'email' },
      phone: { required: true, type: 'phone' },
      linearFeet: { required: true, type: 'number', min: 1, max: 10000 },
      overhang: { required: true, type: 'number', min: 0, max: 100 },
      installationType: { required: true },
      materialType: { required: true },
      serviceType: { required: true },
      zipCode: { required: true, pattern: /^\d{5}(-\d{4})?$/ },
      totalPrice: { required: true, type: 'number', min: 0 }
    });

    if (!validation.isValid) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Validation failed',
        details: validation.errors
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Additional validation for calculator values
    if (estimateData.totalPrice < 100 || estimateData.totalPrice > 100000) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid price calculation detected'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Spam detection
    const spamScore = calculateSpamScore(estimateData);
    if (spamScore > 0.7) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Submission flagged as potential spam'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Send email with estimate details
    const emailResult = await sendEmail({
      to: estimateData.email,
      bcc: 'estimates@bubblesenterprise.com',
      subject: `Your Soffit & Fascia Estimate - $${estimateData.totalPrice.toFixed(2)}`,
      template: 'estimate-details',
      data: estimateData
    });

    if (!emailResult.success) {
      console.error('Failed to send estimate email:', emailResult.error);
      return new Response(JSON.stringify({
        success: false,
        error: 'Failed to send estimate. Please try again.'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Log successful submission
    console.log(`Estimate sent: ${estimateData.email} - $${estimateData.totalPrice} at ${new Date().toISOString()}`);

    return new Response(JSON.stringify({
      success: true,
      message: 'Estimate sent to your email successfully!'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Estimate API error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error. Please try again later.'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Spam scoring for estimate requests
function calculateSpamScore(data) {
  let score = 0;
  
  const text = `${data.firstName} ${data.lastName} ${data.notes || ''}`.toLowerCase();
  
  // Check for suspicious patterns
  const spamKeywords = ['test', 'spam', 'fake', 'bot'];
  const suspiciousPatterns = [
    /http[s]?:\/\//gi,
    /\b\d{10,}\b/g,
    /[A-Z]{5,}/g
  ];
  
  spamKeywords.forEach(keyword => {
    if (text.includes(keyword)) score += 0.4;
  });
  
  suspiciousPatterns.forEach(pattern => {
    if (pattern.test(text)) score += 0.3;
  });
  
  // Check for unrealistic calculator values
  if (data.linearFeet > 5000 || data.overhang > 50) score += 0.3;
  if (data.totalPrice < 200 || data.totalPrice > 50000) score += 0.2;
  
  return Math.min(score, 1);
}