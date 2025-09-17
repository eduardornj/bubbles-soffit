// Database configuration and setup for Bubbles Enterprise
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database file path
const dbPath = path.join(process.cwd(), 'data', 'bubbles_enterprise.db');

// Initialize database
let db;

try {
  db = new Database(dbPath);
  console.log('✅ Database connected successfully');
} catch (error) {
  console.error('❌ Database connection failed:', error);
  throw error;
}

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables if they don't exist
function initializeTables() {
  try {
    // Clients table
    db.exec(`
      CREATE TABLE IF NOT EXISTS clients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT NOT NULL,
        address TEXT NOT NULL,
        city TEXT NOT NULL,
        state TEXT NOT NULL,
        zip_code TEXT NOT NULL,
        company TEXT,
        position TEXT,
        type TEXT DEFAULT 'Residential',
        status TEXT DEFAULT 'Active',
        source TEXT,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Add new columns to existing clients table if they don't exist
    try {
      db.exec('ALTER TABLE clients ADD COLUMN company TEXT');
    } catch (e) { /* Column already exists */ }
    
    try {
      db.exec('ALTER TABLE clients ADD COLUMN position TEXT');
    } catch (e) { /* Column already exists */ }
    
    try {
      db.exec('ALTER TABLE clients ADD COLUMN type TEXT DEFAULT "Residential"');
    } catch (e) { /* Column already exists */ }
    
    try {
      db.exec('ALTER TABLE clients ADD COLUMN status TEXT DEFAULT "Active"');
    } catch (e) { /* Column already exists */ }
    
    try {
      db.exec('ALTER TABLE clients ADD COLUMN source TEXT');
    } catch (e) { /* Column already exists */ }
    
    try {
      db.exec('ALTER TABLE clients ADD COLUMN notes TEXT');
    } catch (e) { /* Column already exists */ }

    // Products/Inventory table - Enhanced for complete inventory management
    db.exec(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sku TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        category TEXT NOT NULL,
        subcategory TEXT,
        brand TEXT,
        model TEXT,
        barcode TEXT,
        unit TEXT NOT NULL DEFAULT 'pcs',
        quantity DECIMAL(10,3) DEFAULT 0,
        reserved_quantity DECIMAL(10,3) DEFAULT 0,
        minimum_stock DECIMAL(10,3) NOT NULL DEFAULT 10,
        maximum_stock DECIMAL(10,3),
        reorder_point DECIMAL(10,3),
        unit_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
        last_cost DECIMAL(10,2),
        average_cost DECIMAL(10,2),
        selling_price DECIMAL(10,2),
        location TEXT,
        supplier TEXT,
        supplier_code TEXT,
        lead_time_days INTEGER DEFAULT 7,
        minimum_order DECIMAL(10,3) DEFAULT 1,
        requires_inspection BOOLEAN DEFAULT 0,
        shelf_life_days INTEGER,
        storage_conditions TEXT,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Quotes table
    db.exec(`
      CREATE TABLE IF NOT EXISTS quotes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        quote_number TEXT UNIQUE NOT NULL,
        client_id INTEGER NOT NULL,
        project_type TEXT NOT NULL,
        square_footage DECIMAL(10,2),
        material_type TEXT,
        subtotal DECIMAL(10,2) NOT NULL,
        tax_amount DECIMAL(10,2) NOT NULL,
        total_amount DECIMAL(10,2) NOT NULL,
        status TEXT DEFAULT 'draft',
        valid_until DATE,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (client_id) REFERENCES clients(id)
      )
    `);

    // Chat conversations table
    db.exec(`
      CREATE TABLE IF NOT EXISTS chat_conversations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT UNIQUE NOT NULL,
        client_email TEXT,
        client_name TEXT,
        client_phone TEXT,
        client_address TEXT,
        client_problem TEXT,
        messages TEXT NOT NULL,
        is_expanded BOOLEAN DEFAULT 0,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_activity DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Add new columns to existing chat_conversations table if they don't exist
    try {
      db.exec('ALTER TABLE chat_conversations ADD COLUMN client_phone TEXT');
    } catch (e) { /* Column already exists */ }
    
    try {
      db.exec('ALTER TABLE chat_conversations ADD COLUMN client_address TEXT');
    } catch (e) { /* Column already exists */ }
    
    try {
      db.exec('ALTER TABLE chat_conversations ADD COLUMN client_problem TEXT');
    } catch (e) { /* Column already exists */ }
    
    try {
      db.exec('ALTER TABLE chat_conversations ADD COLUMN is_expanded BOOLEAN DEFAULT 0');
    } catch (e) { /* Column already exists */ }

    // Quote items table
    db.exec(`
      CREATE TABLE IF NOT EXISTS quote_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        quote_id INTEGER NOT NULL,
        product_id INTEGER,
        description TEXT NOT NULL,
        quantity DECIMAL(10,2) NOT NULL,
        unit_price DECIMAL(10,2) NOT NULL,
        total_price DECIMAL(10,2) NOT NULL,
        item_type TEXT DEFAULT 'material',
        FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id)
      )
    `);

    // Invoices table
    db.exec(`
      CREATE TABLE IF NOT EXISTS invoices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        invoice_number TEXT UNIQUE NOT NULL,
        client_id INTEGER NOT NULL,
        quote_id INTEGER,
        subtotal DECIMAL(10,2) NOT NULL,
        tax_amount DECIMAL(10,2) NOT NULL,
        total_amount DECIMAL(10,2) NOT NULL,
        amount_paid DECIMAL(10,2) DEFAULT 0,
        status TEXT DEFAULT 'pending',
        due_date DATE,
        paid_date DATE,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (client_id) REFERENCES clients(id),
        FOREIGN KEY (quote_id) REFERENCES quotes(id)
      )
    `);

    // Invoice items table
    db.exec(`
      CREATE TABLE IF NOT EXISTS invoice_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        invoice_id INTEGER NOT NULL,
        product_id INTEGER,
        description TEXT NOT NULL,
        quantity DECIMAL(10,2) NOT NULL,
        unit_price DECIMAL(10,2) NOT NULL,
        total_price DECIMAL(10,2) NOT NULL,
        item_type TEXT DEFAULT 'material',
        FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id)
      )
    `);

    // Stock movements table for inventory tracking - Enhanced
    db.exec(`
      CREATE TABLE IF NOT EXISTS stock_movements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL,
        type TEXT NOT NULL, -- 'in', 'out', 'transfer', 'adjustment', 'return', 'loss'
        quantity DECIMAL(10,3) NOT NULL,
        unit_cost DECIMAL(10,2) DEFAULT 0,
        total_cost DECIMAL(10,2) DEFAULT 0,
        reference TEXT,
        notes TEXT,
        location_from TEXT,
        location_to TEXT,
        supplier TEXT,
        batch_number TEXT,
        expiry_date DATE,
        user_id INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id)
      )
    `);

    // Suppliers table
    db.exec(`
      CREATE TABLE IF NOT EXISTS suppliers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        contact_person TEXT,
        email TEXT,
        phone TEXT,
        address TEXT,
        city TEXT,
        state TEXT,
        zip_code TEXT,
        tax_id TEXT,
        payment_terms TEXT,
        lead_time_days INTEGER DEFAULT 7,
        minimum_order DECIMAL(10,2) DEFAULT 0,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Physical inventory table for inventory counts
    db.exec(`
      CREATE TABLE IF NOT EXISTS physical_inventory (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL,
        counted_quantity DECIMAL(10,3) NOT NULL,
        system_quantity DECIMAL(10,3) NOT NULL,
        variance DECIMAL(10,3) NOT NULL,
        unit_cost DECIMAL(10,2) DEFAULT 0,
        variance_value DECIMAL(10,2) DEFAULT 0,
        location TEXT,
        counter_name TEXT,
        notes TEXT,
        count_date DATE NOT NULL,
        status TEXT DEFAULT 'pending', -- pending, approved, rejected
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id)
      )
    `);

    // Settings table for application configuration
    db.exec(`
      CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT UNIQUE NOT NULL,
        value TEXT NOT NULL,
        description TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Database tables initialized successfully');
    
    // Insert default settings
    insertDefaultSettings();
    
    // Insert sample data if tables are empty
    insertSampleData();
    
  } catch (error) {
    console.error('❌ Error initializing database tables:', error);
    throw error;
  }
}

// Insert default settings
function insertDefaultSettings() {
  const settings = [
    { key: 'company_name', value: 'Bubbles Enterprise', description: 'Company name' },
    { key: 'company_phone', value: '(407) 715-1790', description: 'Company phone number' },
    { key: 'company_email', value: 'contact@bubblesenterprise.com', description: 'Company email' },
    { key: 'company_address', value: 'Orlando, Florida', description: 'Company address' },
    { key: 'tax_rate', value: '0.065', description: 'Tax rate (6.5%)' },
    { key: 'quote_validity_days', value: '30', description: 'Quote validity in days' },
    { key: 'invoice_due_days', value: '30', description: 'Invoice due days' }
  ];

  const insertSetting = db.prepare(`
    INSERT OR IGNORE INTO settings (key, value, description) 
    VALUES (?, ?, ?)
  `);

  settings.forEach(setting => {
    insertSetting.run(setting.key, setting.value, setting.description);
  });
}

// Insert sample data for testing
function insertSampleData() {
  try {
    // Check if we already have data
    const clientCount = db.prepare('SELECT COUNT(*) as count FROM clients').get();
    const productCount = db.prepare('SELECT COUNT(*) as count FROM products').get();
    
    if (clientCount.count === 0) {
      // Insert sample clients
      const insertClient = db.prepare(`
        INSERT INTO clients (name, email, phone, address, city, state, zip_code)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      
      const sampleClients = [
        ['John Smith', 'john.smith@email.com', '(407) 555-0101', '123 Oak Street', 'Orlando', 'FL', '32801'],
        ['Maria Garcia', 'maria.garcia@email.com', '(407) 555-0102', '456 Pine Avenue', 'Winter Park', 'FL', '32789'],
        ['Robert Johnson', 'robert.johnson@email.com', '(407) 555-0103', '789 Maple Drive', 'Kissimmee', 'FL', '34741']
      ];
      
      sampleClients.forEach(client => {
        insertClient.run(...client);
      });
      
      console.log('✅ Sample clients inserted');
    }
    
    if (productCount.count === 0) {
      // Insert sample products
      const insertProduct = db.prepare(`
        INSERT INTO products (name, description, sku, barcode, category, quantity, unit_cost, selling_price, minimum_stock, location)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      const sampleProducts = [
        ['Soffit Ventilated White 16"', 'High-quality ventilated soffit panel for proper attic ventilation', 'SOF-VEN-W16', '35ALS V16WH', 'soffit', 150, 24.99, 18.50, 25, 'Warehouse A-1'],
        ['J-Channel White 3/8"', 'Standard J-channel for siding installation and trim work', 'JCH-W38', '37ALU38WH', 'accessories', 8, 12.50, 9.25, 20, 'Warehouse B-3'],
        ['Fascia White 4" with Gutter', 'Premium fascia board with integrated gutter compatibility', 'FAS-W4-GUT', '37ALF W4WH', 'fascia', 89, 18.99, 14.75, 15, 'Warehouse A-2'],
        ['Aluminum Nails 1.5"', 'Corrosion-resistant aluminum nails for soffit installation', 'NAIL-AL-15', '45NAL15', 'fasteners', 500, 0.15, 0.08, 100, 'Warehouse C-1'],
        ['Soffit Solid White 12"', 'Solid soffit panel for areas without ventilation needs', 'SOF-SOL-W12', '35ALS S12WH', 'soffit', 75, 22.99, 17.25, 20, 'Warehouse A-1']
      ];
      
      sampleProducts.forEach(product => {
        insertProduct.run(...product);
      });
      
      console.log('✅ Sample products inserted');
    }
    
  } catch (error) {
    console.error('❌ Error inserting sample data:', error);
  }
}

// Database operations
export const dbOperations = {
  // Clients
  getAllClients: () => {
    return db.prepare('SELECT * FROM clients ORDER BY created_at DESC').all();
  },
  
  getClientById: (id) => {
    return db.prepare('SELECT * FROM clients WHERE id = ?').get(id);
  },
  
  createClient: (clientData) => {
    const { name, email, phone, address, city, state, zip_code, company, position, type, status, source, notes } = clientData;
    const result = db.prepare(`
      INSERT INTO clients (name, email, phone, address, city, state, zip_code, company, position, type, status, source, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(name, email, phone, address, city, state, zip_code, company, position, type || 'Residential', status || 'Active', source, notes);
    return result.lastInsertRowid;
  },
  
  updateClient: (id, clientData) => {
    const { name, email, phone, address, city, state, zip_code, company, position, type, status, source, notes } = clientData;
    return db.prepare(`
      UPDATE clients 
      SET name = ?, email = ?, phone = ?, address = ?, city = ?, state = ?, zip_code = ?, company = ?, position = ?, type = ?, status = ?, source = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(name, email, phone, address, city, state, zip_code, company, position, type, status, source, notes, id);
  },
  
  deleteClient: (id) => {
    return db.prepare('DELETE FROM clients WHERE id = ?').run(id);
  },
  
  // Products - Enhanced for complete inventory management
  getAllProducts: () => {
    return db.prepare('SELECT * FROM products ORDER BY name').all();
  },
  
  getProductById: (id) => {
    return db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  },
  
  getProductBySku: (sku) => {
    return db.prepare('SELECT * FROM products WHERE sku = ?').get(sku);
  },
  
  createProduct: (productData) => {
    const stmt = db.prepare(`
      INSERT INTO products (
        sku, name, description, category, subcategory, brand, model, barcode, unit,
        quantity, reserved_quantity, minimum_stock, maximum_stock, reorder_point,
        unit_cost, last_cost, average_cost, selling_price, location, supplier,
        supplier_code, lead_time_days, minimum_order, requires_inspection,
        shelf_life_days, storage_conditions, status, created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
    `);
    
    const result = stmt.run(
      productData.sku, productData.name, productData.description || '',
      productData.category, productData.subcategory || '', productData.brand || '',
      productData.model || '', productData.barcode || '', productData.unit || 'pcs',
      productData.quantity || 0, productData.reserved_quantity || 0,
      productData.minimum_stock || 10, productData.maximum_stock || null,
      productData.reorder_point || null, productData.unit_cost || 0,
      productData.last_cost || null, productData.average_cost || null,
      productData.selling_price || null, productData.location || '',
      productData.supplier || '', productData.supplier_code || '',
      productData.lead_time_days || 7, productData.minimum_order || 1,
      productData.requires_inspection || 0, productData.shelf_life_days || null,
      productData.storage_conditions || '', productData.status || 'active',
      productData.created_at || new Date().toISOString(),
      productData.updated_at || new Date().toISOString()
    );
    
    return db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid);
  },
  
  updateProduct: (id, productData) => {
    const fields = [];
    const values = [];
    
    // Build dynamic update query
    Object.keys(productData).forEach(key => {
      if (key !== 'id' && productData[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(productData[key]);
      }
    });
    
    if (fields.length === 0) return null;
    
    fields.push('updated_at = ?');
    values.push(new Date().toISOString());
    values.push(id);
    
    const query = `UPDATE products SET ${fields.join(', ')} WHERE id = ?`;
    db.prepare(query).run(...values);
    
    return db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  },
  
  deleteProduct: (id) => {
    return db.prepare('UPDATE products SET status = \'inactive\', updated_at = ? WHERE id = ?')
      .run(new Date().toISOString(), id);
  },
  
  // Stock movements - Enhanced
  getAllMovements: () => {
    return db.prepare(`
      SELECT sm.*, p.sku, p.name as product_name, p.unit
      FROM stock_movements sm
      JOIN products p ON sm.product_id = p.id
      ORDER BY sm.created_at DESC
    `).all();
  },
  
  getProductMovements: (productId) => {
    return db.prepare(`
      SELECT * FROM stock_movements 
      WHERE product_id = ? 
      ORDER BY created_at DESC
    `).all(productId);
  },
  
  createMovement: (movementData) => {
    const stmt = db.prepare(`
      INSERT INTO stock_movements (
        product_id, type, quantity, unit_cost, total_cost, reference, notes,
        location_from, location_to, supplier, batch_number, expiry_date, user_id, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      movementData.product_id, movementData.type, movementData.quantity,
      movementData.unit_cost || 0, movementData.total_cost || 0,
      movementData.reference || '', movementData.notes || '',
      movementData.location_from || '', movementData.location_to || '',
      movementData.supplier || '', movementData.batch_number || '',
      movementData.expiry_date || null, movementData.user_id || 1,
      movementData.created_at || new Date().toISOString()
    );
    
    return db.prepare('SELECT * FROM stock_movements WHERE id = ?').get(result.lastInsertRowid);
  },
  
  addStockMovement: (productId, movementType, quantity, reason, referenceNumber, createdBy) => {
    // Legacy function for backward compatibility
    return this.createMovement({
      product_id: productId,
      type: movementType,
      quantity: quantity,
      notes: reason,
      reference: referenceNumber,
      user_id: createdBy || 1
    });
  },
  
  // Quotes - Enhanced with complete functionality
  getAllQuotes: () => {
    return db.prepare(`
      SELECT q.*, c.name as client_name, c.email as client_email, c.phone as client_phone, c.address as client_address
      FROM quotes q
      JOIN clients c ON q.client_id = c.id
      ORDER BY q.created_at DESC
    `).all();
  },
  
  getQuoteById: (id) => {
    return db.prepare(`
      SELECT q.*, c.name as client_name, c.email as client_email, c.phone as client_phone, c.address as client_address
      FROM quotes q
      JOIN clients c ON q.client_id = c.id
      WHERE q.id = ?
    `).get(id);
  },
  
  getQuoteByNumber: (quoteNumber) => {
    return db.prepare(`
      SELECT q.*, c.name as client_name, c.email as client_email, c.phone as client_phone, c.address as client_address
      FROM quotes q
      JOIN clients c ON q.client_id = c.id
      WHERE q.quote_number = ?
    `).get(quoteNumber);
  },
  
  createQuote: (quoteData) => {
    const { quote_number, client_id, project_type, square_footage, material_type, subtotal, tax_amount, total_amount, valid_until, notes, status } = quoteData;
    const result = db.prepare(`
      INSERT INTO quotes (quote_number, client_id, project_type, square_footage, material_type, subtotal, tax_amount, total_amount, valid_until, notes, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(quote_number, client_id, project_type, square_footage, material_type, subtotal, tax_amount, total_amount, valid_until, notes, status || 'draft', new Date().toISOString(), new Date().toISOString());
    return result.lastInsertRowid;
  },
  
  updateQuote: (id, quoteData) => {
    const { project_type, square_footage, material_type, subtotal, tax_amount, total_amount, valid_until, notes, status } = quoteData;
    return db.prepare(`
      UPDATE quotes 
      SET project_type = ?, square_footage = ?, material_type = ?, subtotal = ?, tax_amount = ?, total_amount = ?, valid_until = ?, notes = ?, status = ?, updated_at = ?
      WHERE id = ?
    `).run(project_type, square_footage, material_type, subtotal, tax_amount, total_amount, valid_until, notes, status, new Date().toISOString(), id);
  },
  
  deleteQuote: (id) => {
    // Delete quote items first
    db.prepare('DELETE FROM quote_items WHERE quote_id = ?').run(id);
    // Delete quote
    return db.prepare('DELETE FROM quotes WHERE id = ?').run(id);
  },
  
  // Quote Items
  getQuoteItems: (quoteId) => {
    return db.prepare(`
      SELECT qi.*, p.name as product_name, p.sku
      FROM quote_items qi
      LEFT JOIN products p ON qi.product_id = p.id
      WHERE qi.quote_id = ?
      ORDER BY qi.id
    `).all(quoteId);
  },
  
  createQuoteItem: (itemData) => {
    const { quote_id, product_id, description, quantity, unit_price, total_price, item_type } = itemData;
    const result = db.prepare(`
      INSERT INTO quote_items (quote_id, product_id, description, quantity, unit_price, total_price, item_type)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(quote_id, product_id, description, quantity, unit_price, total_price, item_type || 'material');
    return result.lastInsertRowid;
  },
  
  updateQuoteItem: (id, itemData) => {
    const { product_id, description, quantity, unit_price, total_price, item_type } = itemData;
    return db.prepare(`
      UPDATE quote_items 
      SET product_id = ?, description = ?, quantity = ?, unit_price = ?, total_price = ?, item_type = ?
      WHERE id = ?
    `).run(product_id, description, quantity, unit_price, total_price, item_type, id);
  },
  
  deleteQuoteItem: (id) => {
    return db.prepare('DELETE FROM quote_items WHERE id = ?').run(id);
  },

  deleteQuoteItems: (quoteId) => {
    return db.prepare('DELETE FROM quote_items WHERE quote_id = ?').run(quoteId);
  },

  deleteInvoiceItems: (invoiceId) => {
    return db.prepare('DELETE FROM invoice_items WHERE invoice_id = ?').run(invoiceId);
  },
  
  // Quote Statistics
  getQuoteStats: () => {
    const totalQuotes = db.prepare('SELECT COUNT(*) as count FROM quotes').get();
    const pendingQuotes = db.prepare('SELECT COUNT(*) as count FROM quotes WHERE status = ?').get('pending');
    const approvedQuotes = db.prepare('SELECT COUNT(*) as count FROM quotes WHERE status = ?').get('approved');
    const draftQuotes = db.prepare('SELECT COUNT(*) as count FROM quotes WHERE status = ?').get('draft');
    const totalValue = db.prepare('SELECT SUM(total_amount) as total FROM quotes').get();
    const monthlyValue = db.prepare(`SELECT SUM(total_amount) as total FROM quotes WHERE DATE(created_at) >= DATE('now', 'start of month')`).get();
    
    return {
      total: totalQuotes.count,
      pending: pendingQuotes.count,
      approved: approvedQuotes.count,
      draft: draftQuotes.count,
      totalValue: totalValue.total || 0,
      monthlyValue: monthlyValue.total || 0,
      conversionRate: totalQuotes.count > 0 ? ((approvedQuotes.count / totalQuotes.count) * 100).toFixed(1) : 0
    };
  },
  
  generateQuoteNumber: () => {
    const year = new Date().getFullYear();
    const lastQuote = db.prepare('SELECT quote_number FROM quotes WHERE quote_number LIKE ? ORDER BY id DESC LIMIT 1').get(`QUO-${year}-%`);
    
    if (!lastQuote) {
      return `QUO-${year}-001`;
    }
    
    const lastNumber = parseInt(lastQuote.quote_number.split('-')[2]);
    const nextNumber = (lastNumber + 1).toString().padStart(3, '0');
    return `QUO-${year}-${nextNumber}`;
  },
  
  // Invoices
  getAllInvoices: () => {
    return db.prepare(`
      SELECT i.*, c.name as client_name, c.email as client_email
      FROM invoices i
      JOIN clients c ON i.client_id = c.id
      ORDER BY i.created_at DESC
    `).all();
  },
  
  getInvoiceById: (id) => {
    return db.prepare(`
      SELECT i.*, c.name as client_name, c.email as client_email, c.phone as client_phone, c.address as client_address
      FROM invoices i
      JOIN clients c ON i.client_id = c.id
      WHERE i.id = ?
    `).get(id);
  },
  
  getInvoiceByNumber: (invoiceNumber) => {
    return db.prepare(`
      SELECT i.*, c.name as client_name, c.email as client_email
      FROM invoices i
      JOIN clients c ON i.client_id = c.id
      WHERE i.invoice_number = ?
    `).get(invoiceNumber);
  },
  
  createInvoice: (invoiceData) => {
    const { invoice_number, client_id, quote_id, subtotal, tax_amount, total_amount, due_date, notes } = invoiceData;
    const result = db.prepare(`
      INSERT INTO invoices (invoice_number, client_id, quote_id, subtotal, tax_amount, total_amount, due_date, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(invoice_number, client_id, quote_id, subtotal, tax_amount, total_amount, due_date, notes);
    return result.lastInsertRowid;
  },
  
  updateInvoice: (id, invoiceData) => {
    const { subtotal, tax_amount, total_amount, amount_paid, status, due_date, paid_date, notes } = invoiceData;
    return db.prepare(`
      UPDATE invoices 
      SET subtotal = ?, tax_amount = ?, total_amount = ?, amount_paid = ?, status = ?, due_date = ?, paid_date = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(subtotal, tax_amount, total_amount, amount_paid, status, due_date, paid_date, notes, id);
  },
  
  deleteInvoice: (id) => {
    // Delete invoice items first
    db.prepare('DELETE FROM invoice_items WHERE invoice_id = ?').run(id);
    // Delete invoice
    return db.prepare('DELETE FROM invoices WHERE id = ?').run(id);
  },
  
  generateInvoiceNumber: () => {
    const year = new Date().getFullYear();
    const lastInvoice = db.prepare('SELECT invoice_number FROM invoices WHERE invoice_number LIKE ? ORDER BY id DESC LIMIT 1').get(`INV-${year}-%`);
    
    if (!lastInvoice) {
      return `INV-${year}-001`;
    }
    
    const lastNumber = parseInt(lastInvoice.invoice_number.split('-')[2]);
    const nextNumber = (lastNumber + 1).toString().padStart(3, '0');
    return `INV-${year}-${nextNumber}`;
  },

  createInvoiceItem: (itemData) => {
    const { invoice_id, product_id, description, quantity, unit_price, total_price, item_type } = itemData;
    const result = db.prepare(`
      INSERT INTO invoice_items (invoice_id, product_id, description, quantity, unit_price, total_price, item_type)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(invoice_id, product_id || null, description, quantity, unit_price, total_price, item_type || 'material');
    return result.lastInsertRowid;
  },

  getInvoiceItems: (invoiceId) => {
    return db.prepare(`
      SELECT ii.*, p.name as product_name, p.sku as product_sku
      FROM invoice_items ii
      LEFT JOIN products p ON ii.product_id = p.id
      WHERE ii.invoice_id = ?
      ORDER BY ii.id
    `).all(invoiceId);
  },
  
  getInvoiceStats: () => {
    const totalInvoices = db.prepare('SELECT COUNT(*) as count FROM invoices').get();
    const pendingInvoices = db.prepare('SELECT COUNT(*) as count FROM invoices WHERE status = ?').get('pending');
    const paidInvoices = db.prepare('SELECT COUNT(*) as count FROM invoices WHERE status = ?').get('paid');
    const overdueInvoices = db.prepare('SELECT COUNT(*) as count FROM invoices WHERE status = ?').get('overdue');
    const totalRevenue = db.prepare('SELECT SUM(total_amount) as total FROM invoices WHERE status = ?').get('paid');
    const totalOutstanding = db.prepare('SELECT SUM(total_amount - amount_paid) as total FROM invoices WHERE status IN (?, ?)').get('pending', 'overdue');
    
    return {
      total: totalInvoices.count,
      pending: pendingInvoices.count,
      paid: paidInvoices.count,
      overdue: overdueInvoices.count,
      totalRevenue: totalRevenue.total || 0,
      totalOutstanding: totalOutstanding.total || 0
    };
  },
  
  // Settings
  getSetting: (key) => {
    return db.prepare('SELECT value FROM settings WHERE key = ?').get(key)?.value;
  },
  
  setSetting: (key, value) => {
    return db.prepare(`
      INSERT OR REPLACE INTO settings (key, value, updated_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
    `).run(key, value);
  },
  
  // Suppliers
  getAllSuppliers: () => {
    return db.prepare('SELECT * FROM suppliers WHERE status = ? ORDER BY name').all('active');
  },
  
  getSupplierById: (id) => {
    return db.prepare('SELECT * FROM suppliers WHERE id = ?').get(id);
  },
  
  createSupplier: (supplierData) => {
    const stmt = db.prepare(`
      INSERT INTO suppliers (
        name, contact_person, email, phone, address, city, state, zip_code,
        tax_id, payment_terms, lead_time_days, minimum_order, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      supplierData.name, supplierData.contact_person || '',
      supplierData.email || '', supplierData.phone || '',
      supplierData.address || '', supplierData.city || '',
      supplierData.state || '', supplierData.zip_code || '',
      supplierData.tax_id || '', supplierData.payment_terms || '',
      supplierData.lead_time_days || 7, supplierData.minimum_order || 0,
      supplierData.status || 'active', new Date().toISOString(), new Date().toISOString()
    );
    
    return db.prepare('SELECT * FROM suppliers WHERE id = ?').get(result.lastInsertRowid);
  },
  
  // Physical Inventory
  createPhysicalCount: (countData) => {
    const stmt = db.prepare(`
      INSERT INTO physical_inventory (
        product_id, counted_quantity, system_quantity, variance, unit_cost,
        variance_value, location, counter_name, notes, count_date, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      countData.product_id, countData.counted_quantity, countData.system_quantity,
      countData.variance, countData.unit_cost || 0, countData.variance_value || 0,
      countData.location || '', countData.counter_name || '',
      countData.notes || '', countData.count_date, countData.status || 'pending',
      new Date().toISOString()
    );
    
    return db.prepare('SELECT * FROM physical_inventory WHERE id = ?').get(result.lastInsertRowid);
  },
  
  getPhysicalCounts: (status = null) => {
    const query = status ? 
      'SELECT pi.*, p.sku, p.name as product_name FROM physical_inventory pi JOIN products p ON pi.product_id = p.id WHERE pi.status = ? ORDER BY pi.created_at DESC' :
      'SELECT pi.*, p.sku, p.name as product_name FROM physical_inventory pi JOIN products p ON pi.product_id = p.id ORDER BY pi.created_at DESC';
    
    return status ? db.prepare(query).all(status) : db.prepare(query).all();
  },
  
  // Analytics - Enhanced
  getInventoryStats: () => {
    const totalItems = db.prepare('SELECT COUNT(*) as count FROM products WHERE status = \'active\'').get();
    const lowStockItems = db.prepare('SELECT COUNT(*) as count FROM products WHERE quantity <= minimum_stock AND status = \'active\'').get();
    const criticalStockItems = db.prepare('SELECT COUNT(*) as count FROM products WHERE quantity < (minimum_stock * 0.5) AND status = \'active\'').get();
    const outOfStockItems = db.prepare('SELECT COUNT(*) as count FROM products WHERE quantity = 0 AND status = \'active\'').get();
    const totalValue = db.prepare('SELECT SUM(quantity * unit_cost) as total FROM products WHERE status = \'active\'').get();
    
    return {
      totalItems: totalItems.count,
      lowStockItems: lowStockItems.count,
      criticalStockItems: criticalStockItems.count,
      outOfStockItems: outOfStockItems.count,
      totalValue: totalValue.total || 0
    };
  },
  
  getLowStockProducts: () => {
    return db.prepare('SELECT * FROM products WHERE quantity <= minimum_stock AND status = \'active\' ORDER BY quantity ASC').all();
  },
  
  getCriticalStockProducts: () => {
    return db.prepare('SELECT * FROM products WHERE quantity < (minimum_stock * 0.5) AND status = \'active\' ORDER BY quantity ASC').all();
  },
  
  getProductsByCategory: (category = null) => {
    return category ? 
      db.prepare('SELECT * FROM products WHERE category = ? AND status = \'active\' ORDER BY name').all(category) :
      db.prepare('SELECT category, COUNT(*) as count, SUM(quantity * unit_cost) as total_value FROM products WHERE status = \'active\' GROUP BY category ORDER BY category').all();
  },
  
  getReorderSuggestions: () => {
    return db.prepare(`
      SELECT *, 
        CASE 
          WHEN maximum_stock IS NOT NULL THEN maximum_stock - quantity
          ELSE minimum_stock * 2 - quantity
        END as suggested_order_quantity
      FROM products 
      WHERE (quantity <= reorder_point OR quantity <= minimum_stock) 
        AND status = 'active'
      ORDER BY (quantity / NULLIF(minimum_stock, 0)) ASC
    `).all();
  },

  // Chat conversation operations
  getAllConversations: () => {
    return db.prepare('SELECT * FROM chat_conversations ORDER BY last_activity DESC').all();
  },

  getConversationBySessionId: (sessionId) => {
    return db.prepare('SELECT * FROM chat_conversations WHERE session_id = ?').get(sessionId);
  },

  createConversation: (conversationData) => {
    const { session_id, client_email, client_name, messages } = conversationData;
    const result = db.prepare(`
      INSERT INTO chat_conversations (session_id, client_email, client_name, messages)
      VALUES (?, ?, ?, ?)
    `).run(session_id, client_email, client_name, JSON.stringify(messages));
    return result.lastInsertRowid;
  },

  updateConversation: (sessionId, conversationData) => {
    const { client_email, client_name, messages, client_phone, client_address, client_problem } = conversationData;
    return db.prepare(`
      UPDATE chat_conversations 
      SET client_email = ?, client_name = ?, messages = ?, client_phone = ?, client_address = ?, client_problem = ?,
          updated_at = CURRENT_TIMESTAMP, last_activity = CURRENT_TIMESTAMP
      WHERE session_id = ?
    `).run(client_email, client_name, JSON.stringify(messages), client_phone, client_address, client_problem, sessionId);
  },

  saveConversation: (conversationData) => {
    const { session_id, client_email, client_name, messages, client_phone, client_address, client_problem, is_expanded, status } = conversationData;
    console.log('🔍 DEBUG BANCO - Dados recebidos:', {
      session_id: typeof session_id + ' = ' + session_id,
      client_email: typeof client_email + ' = ' + client_email,
      client_name: typeof client_name + ' = ' + client_name,
      messages: typeof messages + ' = ' + (messages ? messages.substring(0, 50) + '...' : 'null'),
      client_phone: typeof client_phone + ' = ' + client_phone,
      client_address: typeof client_address + ' = ' + client_address,
      client_problem: typeof client_problem + ' = ' + client_problem,
      is_expanded: typeof is_expanded + ' = ' + is_expanded,
      status: typeof status + ' = ' + status
    });
    const result = db.prepare(`
      INSERT INTO chat_conversations (session_id, client_email, client_name, messages, client_phone, client_address, client_problem, is_expanded, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      session_id,
      client_email || null,
      client_name || null,
      messages,
      client_phone || null,
      client_address || null,
      client_problem || null,
      is_expanded ? 1 : 0, // Converter boolean para integer
      status
    );
    return result.lastInsertRowid;
  },

  deleteConversation: (sessionId) => {
    return db.prepare('DELETE FROM chat_conversations WHERE session_id = ?').run(sessionId);
  },

  updateConversationFields: (sessionId, updateData) => {
    const { client_name, client_phone, client_email, client_address, client_problem, status } = updateData;
    return db.prepare(`
      UPDATE chat_conversations 
      SET client_name = ?, client_phone = ?, client_email = ?, client_address = ?, client_problem = ?, status = ?,
          updated_at = CURRENT_TIMESTAMP, last_activity = CURRENT_TIMESTAMP
      WHERE session_id = ?
    `).run(client_name, client_phone, client_email, client_address, client_problem, status, sessionId);
  },

  getConversationStats: () => {
    const totalStmt = db.prepare('SELECT COUNT(*) as total FROM chat_conversations');
    const activeStmt = db.prepare('SELECT COUNT(*) as active FROM chat_conversations WHERE status = ?');
    const todayStmt = db.prepare("SELECT COUNT(*) as today FROM chat_conversations WHERE DATE(created_at) = DATE('now')");
    
    return {
      total: totalStmt.get().total,
      active: activeStmt.get('active').active,
      today: todayStmt.get().today
    };
  }
};

// Initialize database on import
initializeTables();

// Export database instance
export default db;

// Graceful shutdown
process.on('exit', () => {
  if (db) {
    db.close();
    console.log('✅ Database connection closed');
  }
});

process.on('SIGINT', () => {
  if (db) {
    db.close();
    console.log('✅ Database connection closed');
  }
  process.exit(0);
});