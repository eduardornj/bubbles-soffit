export { d as renderers } from '../../../chunks/vendor_DQmjvFcz.mjs';

// Force server-side rendering
const prerender = false;

// GET: Load gallery order
async function GET({ request }) {
  try {
    const fs = await import('fs');
    const path = await import('path');
    
    const orderFilePath = path.join(process.cwd(), 'public', 'data', 'gallery-order.json');
    
    if (!fs.existsSync(orderFilePath)) {
      return new Response(JSON.stringify({
        success: true,
        order: [],
        message: 'No order file found, using default order'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const orderData = JSON.parse(fs.readFileSync(orderFilePath, 'utf8'));
    
    return new Response(JSON.stringify({
      success: true,
      order: orderData.order || [],
      lastUpdated: orderData.lastUpdated,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Load gallery order error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Erro ao carregar ordem da galeria',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// POST: Save gallery order
async function POST({ request }) {
  try {
    const fs = await import('fs');
    const path = await import('path');
    
    const body = await request.json();
    const { order } = body;
    
    if (!Array.isArray(order)) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Order must be an array of image IDs'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Create data directory if it doesn't exist
    const dataDir = path.join(process.cwd(), 'public', 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    const orderFilePath = path.join(dataDir, 'gallery-order.json');
    const orderData = {
      order: order,
      lastUpdated: new Date().toISOString(),
      version: '1.0'
    };
    
    fs.writeFileSync(orderFilePath, JSON.stringify(orderData, null, 2));
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Ordem da galeria salva com sucesso',
      order: order,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Save gallery order error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Erro ao salvar ordem da galeria',
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
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  OPTIONS,
  POST,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
