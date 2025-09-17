// Force server-side rendering
export const prerender = false;

export async function POST({ request }) {
  const timestamp = new Date().toISOString();
  
  console.log(`\n=== UPLOAD DEBUG ${timestamp} ===`);
  console.log('Method:', request.method);
  console.log('URL:', request.url);
  
  let contentType = 'unknown';
  let headers = {};
  
  try {
    contentType = request.headers.get('content-type') || 'unknown';
    headers = Object.fromEntries(request.headers.entries());
  } catch (headerError) {
    console.warn('Could not access headers:', headerError.message);
  }
  
  console.log('Content-Type:', contentType);
  console.log('Headers available:', Object.keys(headers).length > 0 ? 'Yes' : 'No');
  
  try {
    // If we can't access headers, try to process FormData anyway
    if (contentType === 'unknown') {
      console.log('Headers not accessible, attempting FormData parsing anyway...');
    } else if (!contentType.includes('multipart/form-data')) {
      console.error('Invalid content type. Expected multipart/form-data, got:', contentType);
      return new Response(JSON.stringify({ 
        success: false, 
        error: `Content-Type inválido. Esperado multipart/form-data, recebido: ${contentType}`,
        contentType: contentType,
        timestamp: new Date().toISOString()
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    let formData;
    let file;
    
    // Try to parse FormData
    try {
      console.log('Attempting to parse FormData...');
      formData = await request.formData();
      console.log('FormData parsed successfully');
      console.log('FormData entries:', [...formData.entries()].map(([k, v]) => [k, v instanceof File ? `File: ${v.name} (${v.size} bytes)` : v]));
      
      file = formData.get('image');
      console.log('Retrieved file from FormData:', file ? 'SUCCESS' : 'NULL');
      
    } catch (formDataError) {
      console.error('FormData parsing failed:', formDataError.message);
      console.error('Error stack:', formDataError.stack);
      
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Falha ao processar FormData: ' + formDataError.message,
        contentType: contentType,
        timestamp: new Date().toISOString()
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    if (!file || file.size === 0) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Nenhum arquivo enviado' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Tipo de arquivo não permitido. Use JPEG, PNG, WebP ou GIF.' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Arquivo muito grande. Máximo 10MB.' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Generate SEO-friendly filename
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    
    // Extract base name without extension
    const baseName = file.name.split('.')[0];
    const nameSlug = baseName.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim()
      .substring(0, 30); // Limit length
    
    const extension = file.name.split('.').pop().toLowerCase();
    const seoFilename = `soffit-projeto-${nameSlug}-${timestamp}-${randomId}.${extension}`;

    try {
      // Import fs and path modules
      const fs = await import('fs');
      const path = await import('path');
      
      // Create directory if it doesn't exist
      const uploadDir = path.join(process.cwd(), 'public', 'images', 'works');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Convert file to buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Save file
      const filePath = path.join(uploadDir, seoFilename);
      fs.writeFileSync(filePath, buffer);

      // Generate optimized alt text
      const optimizedAlt = `Projeto de soffit e fascia realizado pela Soffit 2025 em Orlando, FL. Trabalho profissional de alta qualidade com garantia. ${baseName}`;

      // Return success response with file info
      return new Response(JSON.stringify({
        success: true,
        message: 'Imagem enviada com sucesso!',
        id: `${timestamp}-${randomId}`,
        filename: seoFilename,
        url: `/images/works/${seoFilename}`,
        alt: optimizedAlt,
        size: file.size,
        type: file.type,
        uploadDate: new Date().toISOString()
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });

    } catch (fsError) {
      console.error('File system error:', fsError);
      
      // Fallback: return base64 data URL for client-side storage
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64 = buffer.toString('base64');
      const dataUrl = `data:${file.type};base64,${base64}`;
      
      return new Response(JSON.stringify({
        success: true,
        message: 'Imagem processada (modo fallback)',
        id: `${timestamp}-${randomId}`,
        filename: seoFilename,
        url: dataUrl,
        alt: `Projeto de soffit e fascia - ${baseName}`,
        size: file.size,
        type: file.type,
        uploadDate: new Date().toISOString(),
        fallback: true
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

  } catch (error) {
    const errorTimestamp = new Date().toISOString();
    console.error(`\n=== UPLOAD ERROR [${errorTimestamp}] ===`);
    console.error('Upload error:', error);
    console.error('Error stack:', error.stack);
    
    return new Response(JSON.stringify({ 
      success: false,
      error: 'Erro interno do servidor',
      details: error.message,
      timestamp: errorTimestamp
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}