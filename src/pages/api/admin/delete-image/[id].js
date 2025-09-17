// Force server-side rendering
export const prerender = false;

export async function DELETE({ params, request }) {
  try {
    const { id } = params;
    
    if (!id) {
      return new Response(JSON.stringify({
        success: false,
        error: 'ID da imagem é obrigatório'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Import fs and path modules
    const fs = await import('fs');
    const path = await import('path');
    
    // Define the images directory
    const imagesDir = path.join(process.cwd(), 'public', 'images', 'works');
    
    // Check if directory exists
    if (!fs.existsSync(imagesDir)) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Diretório de imagens não encontrado'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Find the image file by ID
    const files = fs.readdirSync(imagesDir);
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    
    let imageFile = null;
    
    // Look for file by ID (could be filename or timestamp-randomId)
    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      
      if (imageExtensions.includes(ext)) {
        // Check if file matches ID (exact filename match)
        if (file === id || file.startsWith(id)) {
          imageFile = file;
          break;
        }
        
        // Check if ID matches the timestamp-randomId pattern
        const nameMatch = file.match(/^soffit-projeto-(.+)-(\d+)-([a-z0-9]+)\.(\w+)$/i);
        if (nameMatch) {
          const fileId = `${nameMatch[2]}-${nameMatch[3]}`;
          if (fileId === id) {
            imageFile = file;
            break;
          }
        }
        
        // Also check if the entire filename without extension matches
        const nameWithoutExt = path.basename(file, ext);
        if (nameWithoutExt === id) {
          imageFile = file;
          break;
        }
      }
    }
    
    if (!imageFile) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Imagem não encontrada'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Delete the file
    const filePath = path.join(imagesDir, imageFile);
    
    try {
      fs.unlinkSync(filePath);
      
      return new Response(JSON.stringify({
        success: true,
        message: 'Imagem excluída com sucesso',
        deletedFile: imageFile
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
      
    } catch (deleteError) {
      console.error('Error deleting file:', deleteError);
      
      return new Response(JSON.stringify({
        success: false,
        error: 'Erro ao excluir arquivo físico',
        details: deleteError.message
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
  } catch (error) {
    console.error('Delete image error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
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
      'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}