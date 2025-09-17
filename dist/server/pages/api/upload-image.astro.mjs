export { d as renderers } from '../../chunks/vendor_DQmjvFcz.mjs';

async function POST({ request }) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const altText = formData.get('alt') || '';
    const title = formData.get('title') || '';
    const category = formData.get('category') || 'projeto';
    
    if (!file || file.size === 0) {
      return new Response(JSON.stringify({ error: 'Nenhum arquivo enviado' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return new Response(JSON.stringify({ error: 'Tipo de arquivo não permitido. Use JPEG, PNG ou WebP.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return new Response(JSON.stringify({ error: 'Arquivo muito grande. Máximo 10MB.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Generate SEO-friendly filename
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    const categorySlug = category.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim();
    
    const titleSlug = title.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim()
      .substring(0, 50); // Limit length
    
    const extension = file.name.split('.').pop().toLowerCase();
    const seoFilename = `soffit-${categorySlug}-${titleSlug}-${timestamp}-${randomId}.${extension}`;

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Import fs and path modules
    const fs = await import('fs');
    const path = await import('path');
    
    // Create directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public', 'images', 'works');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Save file
    const filePath = path.join(uploadDir, seoFilename);
    fs.writeFileSync(filePath, buffer);

    // Generate optimized alt text if not provided
    const optimizedAlt = altText || `${title} - Projeto de ${category} realizado pela Soffit 2025 em Orlando, FL. Trabalho profissional de alta qualidade com garantia.`;

    // Return success response with file info
    const fileInfo = {
      id: `${timestamp}-${randomId}`,
      name: seoFilename,
      originalName: file.name,
      title: title,
      category: category,
      url: `/images/works/${seoFilename}`,
      alt: optimizedAlt,
      size: file.size,
      type: file.type,
      uploadDate: new Date().toISOString(),
      seoOptimized: true
    };

    return new Response(JSON.stringify({
      success: true,
      message: 'Imagem enviada com sucesso!',
      file: fileInfo
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Upload error:', error);
    return new Response(JSON.stringify({ 
      error: 'Erro interno do servidor',
      details: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Handle OPTIONS request for CORS
async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  OPTIONS,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
