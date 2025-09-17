import { r as rateLimit, v as validateInput, a as sendEmail } from '../../chunks/utils_XnkmivEU.mjs';
import { v as validateAISecurityMiddleware } from '../../chunks/aiSecurityMiddleware_B1Qp9P2i.mjs';
export { d as renderers } from '../../chunks/vendor_DQmjvFcz.mjs';

// Quote API endpoint with spam protection

// Rate limiting: 3 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // limit each IP to 3 requests per windowMs
  message: 'Too many quote requests from this IP, please try again later.'
});

async function POST({ request }) {
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
    
    // CSRF Token validation (enhanced security against CSRF attacks)
    const csrfToken = formData.get('_csrf');
    const userAgent = request.headers.get('user-agent') || '';
    const referer = request.headers.get('referer') || '';
    
    if (!csrfToken || csrfToken.length < 10) {
      console.log('CSRF validation failed: Missing or invalid token');
      return new Response(JSON.stringify({
        success: false,
        error: 'Security validation failed'
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Basic CSRF token format validation (UUID or fallback format)
    const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(csrfToken);
    const isValidFallback = /^csrf_[a-z0-9]{9}_\d{13}$/.test(csrfToken);
    
    if (!isValidUUID && !isValidFallback) {
      console.log('CSRF validation failed: Invalid token format');
      return new Response(JSON.stringify({
        success: false,
        error: 'Security validation failed'
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Enhanced honeypot validation for multiple dynamic fields
    const honeypotFields = ['website']; // Original field for compatibility
    
    // Check for dynamically generated honeypot fields
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('honeypot_') || key.startsWith('field_') || key.startsWith('input_')) {
        honeypotFields.push(key);
      }
    }
    
    // Validate all honeypot fields are empty
    for (const fieldName of honeypotFields) {
      const fieldValue = formData.get(fieldName);
      if (fieldValue && fieldValue.trim() !== '') {
        console.log(`Honeypot field "${fieldName}" was filled:`, fieldValue);
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Invalid form submission detected' 
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    // Enhanced JavaScript verification check
    const jsEnabled = formData.get('_js_enabled');
    if (jsEnabled !== 'true') {
      console.log('JavaScript verification failed:', jsEnabled);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'JavaScript must be enabled to submit this form' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Extract and validate form data
    const quoteData = {
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      address: formData.get('address'),
      city: formData.get('city'),
      zipCode: formData.get('zipCode'),
      serviceType: formData.get('serviceType'),
      projectDescription: formData.get('projectDescription'),
      contactMethod: formData.get('contactMethod'),
      timeline: formData.get('timeline'),
      budget: formData.get('budget')
    };

    // Validate required fields and format
    const validation = validateInput(quoteData, {
      firstName: { required: true, minLength: 2, maxLength: 50 },
      lastName: { required: true, minLength: 2, maxLength: 50 },
      email: { required: true, type: 'email' },
      phone: { required: true, type: 'phone' },
      address: { required: true, minLength: 5, maxLength: 200 },
      city: { required: true, minLength: 2, maxLength: 100 },
      zipCode: { required: true, pattern: /^\d{5}(-\d{4})?$/ },
      serviceType: { required: true },
      projectDescription: { required: true, minLength: 10, maxLength: 1000 }
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

    // Additional spam detection
    const spamScore = calculateSpamScore(quoteData);
    if (spamScore > 0.7) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Submission flagged as potential spam'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Process file uploads if any
    const photos = [];
    const photoFiles = formData.getAll('photos');
    
    for (const file of photoFiles) {
      if (file && file.size > 0) {
        // Validate file type and size
        if (!file.type.startsWith('image/')) {
          return new Response(JSON.stringify({
            success: false,
            error: 'Only image files are allowed'
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
          return new Response(JSON.stringify({
            success: false,
            error: 'File size too large. Maximum 10MB per file.'
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
        // Enhanced image validation using FileReader-like approach
        try {
          const arrayBuffer = await file.arrayBuffer();
          const uint8Array = new Uint8Array(arrayBuffer);
          
          // Basic image header validation
          const isValidImage = validateImageHeaders(uint8Array, file.type);
          if (!isValidImage) {
            return new Response(JSON.stringify({
              success: false,
              error: 'Invalid image file detected'
            }), {
              status: 400,
              headers: { 'Content-Type': 'application/json' }
            });
          }
          
          // Check for reasonable file size vs content ratio
          if (file.size < 1000 && file.type.startsWith('image/')) {
            // Suspiciously small image file
            console.log('Suspicious small image file detected:', file.name, file.size);
          }
          
        } catch (error) {
          console.log('Error validating image file:', error);
          return new Response(JSON.stringify({
            success: false,
            error: 'Error processing uploaded file'
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
        photos.push(file);
      }
    }

    // Send email notification
    const emailResult = await sendEmail({
      to: 'quotes@bubblesenterprise.com',
      subject: `New Quote Request from ${quoteData.firstName} ${quoteData.lastName}`,
      template: 'quote-request',
      data: { ...quoteData, photos },
      attachments: photos
    });

    if (!emailResult.success) {
      console.error('Failed to send quote email:', emailResult.error);
      // Don't fail the request, just log the error
    }

    // Log successful submission (for monitoring)
    console.log(`Quote request submitted: ${quoteData.email} at ${new Date().toISOString()}`);

    return new Response(JSON.stringify({
      success: true,
      message: 'Quote request submitted successfully. We will contact you within 24 hours.'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Quote API error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error. Please try again later.'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Simple spam scoring algorithm
function calculateSpamScore(data) {
  let score = 0;
  
  // Check for suspicious patterns
  const text = `${data.firstName} ${data.lastName} ${data.projectDescription}`.toLowerCase();
  
  // Expanded spam keywords (enhanced detection)
  const spamKeywords = [
    'viagra', 'casino', 'loan', 'bitcoin', 'crypto', 'investment', 'urgent', 'act now',
    'investimento urgente', 'oferta limitada', 'ganhe dinheiro', 'dinheiro fácil',
    'trabalhe em casa', 'renda extra', 'oportunidade única', 'clique aqui'
  ];
  
  const suspiciousPatterns = [
    /http[s]?:\/\//gi, // URLs in text
    /\b\d{10,}\b/g, // Long numbers
    /[A-Z]{5,}/g, // Excessive caps
    /[!]{3,}/g, // Multiple exclamation marks
  ];
  
  // Check for spam keywords
  spamKeywords.forEach(keyword => {
    if (text.includes(keyword)) score += 0.3;
  });
  
  // Check for suspicious patterns
  suspiciousPatterns.forEach(pattern => {
    if (pattern.test(text)) score += 0.2;
  });
  
  // Enhanced repetition detection - check for repeated phrases
  const words = text.split(/\s+/);
  const wordCount = {};
  words.forEach(word => {
    if (word.length > 3) { // Only count meaningful words
      wordCount[word] = (wordCount[word] || 0) + 1;
    }
  });
  
  // Check for excessive word repetition (more than 3 times)
  Object.values(wordCount).forEach(count => {
    if (count > 3) {
      score += 0.2; // Add penalty for repeated words
    }
  });
  
  // Check for very short or very generic descriptions
  if (data.projectDescription.length < 20) score += 0.2;
  if (data.projectDescription.toLowerCase().includes('test')) score += 0.3;
  
  return Math.min(score, 1); // Cap at 1.0
}

// Helper function to validate image file headers
function validateImageHeaders(uint8Array, mimeType) {
  // Check common image file signatures
  const signatures = {
    'image/jpeg': [0xFF, 0xD8, 0xFF],
    'image/png': [0x89, 0x50, 0x4E, 0x47],
    'image/webp': [0x52, 0x49, 0x46, 0x46], // RIFF header for WebP
    'image/gif': [0x47, 0x49, 0x46]
  };
  
  const signature = signatures[mimeType];
  if (!signature) return false;
  
  // Check if file starts with expected signature
  for (let i = 0; i < signature.length; i++) {
    if (uint8Array[i] !== signature[i]) {
      return false;
    }
  }
  
  return true;
}

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
