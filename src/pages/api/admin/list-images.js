// Force server-side rendering
export const prerender = false;

export async function GET({ request }) {
  try {
    // Import fs and path modules
    const fs = await import('fs');
    const path = await import('path');
    
    // Define the images directory
    const imagesDir = path.join(process.cwd(), 'public', 'images', 'works');
    
    // Check if directory exists
    if (!fs.existsSync(imagesDir)) {
      return new Response(JSON.stringify({
        success: true,
        images: [],
        message: 'Images directory does not exist yet'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Read directory contents
    const files = fs.readdirSync(imagesDir);
    
    // Filter for image files and get their stats
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    const images = [];
    
    for (const file of files) {
      const filePath = path.join(imagesDir, file);
      const ext = path.extname(file).toLowerCase();
      
      if (imageExtensions.includes(ext)) {
        try {
          const stats = fs.statSync(filePath);
          
          // Extract metadata from filename if it follows our naming convention
          // Format: soffit-projeto-{name}-{timestamp}-{randomId}.{ext}
          const nameMatch = file.match(/^soffit-projeto-(.+)-(\d+)-([a-z0-9]+)\.(\w+)$/i);
          
          let displayName = file;
          let timestamp = stats.birthtime.getTime();
          let id = file;
          
          if (nameMatch) {
            displayName = nameMatch[1].replace(/-/g, ' ');
            timestamp = parseInt(nameMatch[2]);
            id = `${nameMatch[2]}-${nameMatch[3]}`;
          }
          
          images.push({
            id: id,
            filename: file,
            displayName: displayName,
            url: `/images/works/${file}`,
            imageData: `/images/works/${file}`, // For compatibility with Gallery.astro
            size: stats.size,
            uploadDate: stats.birthtime.toISOString(),
            modifiedDate: stats.mtime.toISOString(),
            timestamp: timestamp,
            title: `Projeto Soffit - ${displayName}`,
            description: 'Projeto realizado pela Soffit 2025 em Orlando, FL',
            location: 'Orlando, FL',
            serviceType: 'Soffit & Fascia',
            alt: `Projeto de soffit e fascia realizado pela Soffit 2025 em Orlando, FL. Trabalho profissional de alta qualidade com garantia. ${displayName}`,
            order: timestamp // Default order by upload time
          });
        } catch (statError) {
          console.warn(`Could not get stats for file ${file}:`, statError.message);
        }
      }
    }
    
    // Sort by timestamp (newest first)
    images.sort((a, b) => b.timestamp - a.timestamp);
    
    return new Response(JSON.stringify({
      success: true,
      images: images,
      count: images.length,
      directory: '/images/works',
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('List images error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Erro ao listar imagens',
      details: error.message,
      timestamp: new Date().toISOString()
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
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}