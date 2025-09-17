use crate::constants::*;
use crate::types::*;

/// Valida as dimensões da casa
pub fn validate_house_dimensions(length: f64, width: f64) -> ValidationResult {
    let mut errors = Vec::new();

    if length < MIN_HOUSE_DIMENSION {
        errors.push(format!("Comprimento deve ser pelo menos {} pés", MIN_HOUSE_DIMENSION));
    }
    if length > MAX_HOUSE_DIMENSION {
        errors.push(format!("Comprimento não pode exceder {} pés", MAX_HOUSE_DIMENSION));
    }
    if width < MIN_HOUSE_DIMENSION {
        errors.push(format!("Largura deve ser pelo menos {} pés", MIN_HOUSE_DIMENSION));
    }
    if width > MAX_HOUSE_DIMENSION {
        errors.push(format!("Largura não pode exceder {} pés", MAX_HOUSE_DIMENSION));
    }

    ValidationResult {
        is_valid: errors.is_empty(),
        errors,
    }
}

/// Valida parâmetros de gable
pub fn validate_gable_parameters(gable_count: u32, gable_length: f64) -> ValidationResult {
    let mut errors = Vec::new();

    if gable_count > MAX_GABLE_COUNT {
        errors.push(format!("Número de gables não pode exceder {}", MAX_GABLE_COUNT));
    }
    if gable_length < MIN_GABLE_LENGTH {
        errors.push(format!("Comprimento do gable deve ser pelo menos {} pés", MIN_GABLE_LENGTH));
    }
    if gable_length > MAX_GABLE_LENGTH {
        errors.push(format!("Comprimento do gable não pode exceder {} pés", MAX_GABLE_LENGTH));
    }

    ValidationResult {
        is_valid: errors.is_empty(),
        errors,
    }
}

/// Obtém o multiplicador de custo para um tipo de material
pub fn get_material_multiplier(material_type: &str) -> f64 {
    match material_type {
        "vinyl" => VINYL_COST_MULTIPLIER,
        "aluminum" => ALUMINUM_COST_MULTIPLIER,
        "wood" => WOOD_COST_MULTIPLIER,
        "fiber_cement" => FIBER_CEMENT_COST_MULTIPLIER,
        _ => VINYL_COST_MULTIPLIER, // Default para vinyl
    }
}

/// Obtém a durabilidade em anos para um tipo de material
pub fn get_material_durability(material_type: &str) -> u32 {
    match material_type {
        "vinyl" => VINYL_DURABILITY,
        "aluminum" => ALUMINUM_DURABILITY,
        "wood" => WOOD_DURABILITY,
        "fiber_cement" => FIBER_CEMENT_DURABILITY,
        _ => VINYL_DURABILITY, // Default para vinyl
    }
}

/// Obtém a descrição de um material
pub fn get_material_description(material_type: &str) -> String {
    match material_type {
        "vinyl" => "Vinil - Econômico e de baixa manutenção".to_string(),
        "aluminum" => "Alumínio - Durável e resistente à corrosão".to_string(),
        "wood" => "Madeira - Aparência natural e tradicional".to_string(),
        "fiber_cement" => "Fibrocimento - Máxima durabilidade e resistência".to_string(),
        _ => "Material padrão".to_string(),
    }
}

/// Formata um valor monetário para exibição
pub fn format_currency(amount: f64) -> String {
    format!("${:.2}", amount)
}

/// Calcula o custo anualizado baseado na durabilidade
pub fn calculate_annualized_cost(total_cost: f64, durability_years: u32) -> f64 {
    if durability_years == 0 {
        return total_cost;
    }
    total_cost / durability_years as f64
}

/// Valida um código postal da Flórida
pub fn validate_florida_zip_code(zip_code: &str) -> bool {
    // Códigos postais da Flórida começam com 3
    if zip_code.len() != 5 {
        return false;
    }
    
    if let Ok(zip_num) = zip_code.parse::<u32>() {
        // Flórida: 32000-34999
        zip_num >= 32000 && zip_num <= 34999
    } else {
        false
    }
}

/// Calcula desconto por volume
pub fn calculate_volume_discount(subtotal: f64, linear_feet: f64) -> (f64, f64, bool) {
    if linear_feet >= VOLUME_DISCOUNT_THRESHOLD {
        let discount_amount = subtotal * VOLUME_DISCOUNT_RATE;
        let discounted_total = subtotal - discount_amount;
        (discounted_total, discount_amount, true)
    } else {
        (subtotal, 0.0, false)
    }
}