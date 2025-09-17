use crate::constants::*;
use crate::types::*;
use crate::utils::*;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct SoffitCalculator {
    material_cost_per_foot: f64,
    labor_cost_per_foot: f64,
    tax_rate: f64,
}

#[wasm_bindgen]
impl SoffitCalculator {
    #[wasm_bindgen(constructor)]
    pub fn new() -> SoffitCalculator {
        SoffitCalculator {
            material_cost_per_foot: ORLANDO_MATERIAL_COST_PER_FOOT,
            labor_cost_per_foot: ORLANDO_LABOR_COST_PER_FOOT,
            tax_rate: FLORIDA_TAX_RATE,
        }
    }

    /// Calcula área de soffit baseado em medidas da casa
    #[wasm_bindgen]
    pub fn calculate_linear_feet(
        &self,
        house_length: f64,
        house_width: f64,
        has_gables: bool,
        gable_count: u32,
        gable_length: f64,
    ) -> f64 {
        // Perímetro básico da casa
        let perimeter = 2.0 * (house_length + house_width);
        
        // Adicionar comprimento dos gables se existirem
        let gable_footage = if has_gables {
            gable_count as f64 * gable_length * 2.0 // Ambos os lados do gable
        } else {
            0.0
        };
        
        perimeter + gable_footage
    }

    /// Calcula estimativa de custo completa
    #[wasm_bindgen]
    pub fn calculate_cost_estimate(
        &self,
        linear_feet: f64,
        material_type: &str,
        project_details: &JsValue,
    ) -> Result<JsValue, JsValue> {
        let details: ProjectDetails = serde_wasm_bindgen::from_value(project_details.clone())
            .map_err(|e| JsValue::from_str(&format!("Erro ao parsear detalhes: {}", e)))?;

        // Determinar multiplicador do material
        let material_multiplier = get_material_multiplier(material_type);

        // Determinar multiplicador do tipo de serviço
        let service_multiplier = match details.service_type.as_str() {
            "new_construction" => NEW_CONSTRUCTION_MULTIPLIER,
            "remove_replace" => REMOVE_REPLACE_MULTIPLIER,
            "repair" => REPAIR_MULTIPLIER,
            _ => NEW_CONSTRUCTION_MULTIPLIER,
        };

        // Determinar multiplicador de urgência
        let urgency_multiplier = match details.urgency.as_str() {
            "urgent" => URGENT_MULTIPLIER,
            _ => STANDARD_URGENCY_MULTIPLIER,
        };

        // Calcular custos base
        let base_material_cost = linear_feet * self.material_cost_per_foot * material_multiplier;
        let base_labor_cost = linear_feet * self.labor_cost_per_foot;

        // Aplicar multiplicadores
        let material_cost = base_material_cost * service_multiplier * urgency_multiplier;
        let labor_cost = base_labor_cost * service_multiplier * urgency_multiplier;

        let subtotal = material_cost + labor_cost;

        // Aplicar desconto por volume se aplicável
        let (discounted_total, discount_amount, volume_discount_applied) = 
            calculate_volume_discount(subtotal, linear_feet);

        // Calcular impostos
        let tax_amount = discounted_total * self.tax_rate;
        let final_total = discounted_total + tax_amount;

        let estimate = CostEstimate {
            material_cost,
            labor_cost,
            total_cost: discounted_total,
            linear_feet,
            tax_rate: self.tax_rate,
            final_total,
            volume_discount_applied,
            discount_amount,
        };

        serde_wasm_bindgen::to_value(&estimate)
            .map_err(|e| JsValue::from_str(&format!("Erro ao serializar estimativa: {}", e)))
    }

    /// Calcula múltiplas opções de material
    #[wasm_bindgen]
    pub fn calculate_material_options(
        &self,
        linear_feet: f64,
        project_details: &JsValue,
    ) -> Result<JsValue, JsValue> {
        let materials = vec!["vinyl", "aluminum", "wood", "fiber_cement"];
        let mut options = Vec::new();

        for material in materials {
            match self.calculate_cost_estimate(linear_feet, material, project_details) {
                Ok(estimate_js) => {
                    let estimate: CostEstimate = serde_wasm_bindgen::from_value(estimate_js)
                        .map_err(|e| JsValue::from_str(&format!("Erro ao deserializar: {}", e)))?;
                    
                    // Criar informações do material
                    let material_info = MaterialType {
                        name: material.to_string(),
                        cost_per_foot: self.material_cost_per_foot * get_material_multiplier(material),
                        durability_years: get_material_durability(material),
                        description: get_material_description(material),
                    };
                    
                    // Calcular custo anualizado
                    let cost_per_year = calculate_annualized_cost(
                        estimate.final_total, 
                        material_info.durability_years
                    );
                    
                    let option = MaterialOption {
                        material: material_info,
                        estimate,
                        cost_per_year,
                    };
                    
                    options.push(option);
                }
                Err(e) => return Err(e),
            }
        }

        serde_wasm_bindgen::to_value(&options)
            .map_err(|e| JsValue::from_str(&format!("Erro ao serializar opções: {}", e)))
    }

    /// Validar medidas de entrada
    #[wasm_bindgen]
    pub fn validate_measurements(
        &self,
        house_length: f64,
        house_width: f64,
        gable_count: u32,
        gable_length: f64,
    ) -> Result<JsValue, JsValue> {
        let house_validation = validate_house_dimensions(house_length, house_width);
        let gable_validation = validate_gable_parameters(gable_count, gable_length);

        let mut all_errors = house_validation.errors;
        all_errors.extend(gable_validation.errors);

        let result = ValidationResult {
            is_valid: all_errors.is_empty(),
            errors: all_errors,
        };

        serde_wasm_bindgen::to_value(&result)
            .map_err(|e| JsValue::from_str(&format!("Erro ao serializar validação: {}", e)))
    }

    /// Validar código postal da Flórida
    #[wasm_bindgen]
    pub fn validate_zip_code(&self, zip_code: &str) -> bool {
        validate_florida_zip_code(zip_code)
    }

    /// Obter informações de um material específico
    #[wasm_bindgen]
    pub fn get_material_info(&self, material_type: &str) -> Result<JsValue, JsValue> {
        let material_info = MaterialType {
            name: material_type.to_string(),
            cost_per_foot: self.material_cost_per_foot * get_material_multiplier(material_type),
            durability_years: get_material_durability(material_type),
            description: get_material_description(material_type),
        };

        serde_wasm_bindgen::to_value(&material_info)
            .map_err(|e| JsValue::from_str(&format!("Erro ao serializar material: {}", e)))
    }

    /// Formatar valor monetário
    #[wasm_bindgen]
    pub fn format_currency(&self, amount: f64) -> String {
        format_currency(amount)
    }
}