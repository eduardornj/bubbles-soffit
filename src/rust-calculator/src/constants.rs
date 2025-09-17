// Custos médios baseados em pesquisa Orlando 2024
pub const ORLANDO_MATERIAL_COST_PER_FOOT: f64 = 7.00;
pub const ORLANDO_LABOR_COST_PER_FOOT: f64 = 5.00;
pub const FLORIDA_TAX_RATE: f64 = 0.065; // 6.5%

// Multiplicadores por tipo de serviço
pub const NEW_CONSTRUCTION_MULTIPLIER: f64 = 1.0;
pub const REMOVE_REPLACE_MULTIPLIER: f64 = 1.3;
pub const REPAIR_MULTIPLIER: f64 = 0.8;

// Multiplicadores por urgência
pub const STANDARD_URGENCY_MULTIPLIER: f64 = 1.0;
pub const URGENT_MULTIPLIER: f64 = 1.25;

// Tipos de materiais disponíveis
pub const VINYL_COST_MULTIPLIER: f64 = 1.0;
pub const ALUMINUM_COST_MULTIPLIER: f64 = 1.2;
pub const WOOD_COST_MULTIPLIER: f64 = 1.5;
pub const FIBER_CEMENT_COST_MULTIPLIER: f64 = 1.8;

// Desconto por volume (pés lineares)
pub const VOLUME_DISCOUNT_THRESHOLD: f64 = 200.0;
pub const VOLUME_DISCOUNT_RATE: f64 = 0.05; // 5%

// Durabilidade dos materiais (anos)
pub const VINYL_DURABILITY: u32 = 20;
pub const ALUMINUM_DURABILITY: u32 = 30;
pub const WOOD_DURABILITY: u32 = 15;
pub const FIBER_CEMENT_DURABILITY: u32 = 50;

// Limites de validação
pub const MIN_HOUSE_DIMENSION: f64 = 10.0; // pés
pub const MAX_HOUSE_DIMENSION: f64 = 500.0; // pés
pub const MAX_GABLE_COUNT: u32 = 20;
pub const MIN_GABLE_LENGTH: f64 = 5.0; // pés
pub const MAX_GABLE_LENGTH: f64 = 100.0; // pés