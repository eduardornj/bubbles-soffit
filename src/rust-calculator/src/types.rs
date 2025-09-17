use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SoffitMeasurement {
    pub length: f64,
    pub width: f64,
    pub linear_feet: f64,
}

#[wasm_bindgen]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CostEstimate {
    pub material_cost: f64,
    pub labor_cost: f64,
    pub total_cost: f64,
    pub linear_feet: f64,
    pub tax_rate: f64,
    pub final_total: f64,
    pub volume_discount_applied: bool,
    pub discount_amount: f64,
}

#[wasm_bindgen]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MaterialType {
    pub name: String,
    pub cost_per_foot: f64,
    pub durability_years: u32,
    pub description: String,
}

#[wasm_bindgen]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProjectDetails {
    pub zip_code: String,
    pub property_type: String, // "residential" | "commercial"
    pub service_type: String,  // "new_construction" | "remove_replace" | "repair"
    pub urgency: String,       // "standard" | "urgent"
}

#[wasm_bindgen]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ValidationResult {
    pub is_valid: bool,
    pub errors: Vec<String>,
}

#[wasm_bindgen]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MaterialOption {
    pub material: MaterialType,
    pub estimate: CostEstimate,
    pub cost_per_year: f64, // Custo anualizado baseado na durabilidade
}

// Implementações para wasm_bindgen
#[wasm_bindgen]
impl SoffitMeasurement {
    #[wasm_bindgen(constructor)]
    pub fn new(length: f64, width: f64, linear_feet: f64) -> SoffitMeasurement {
        SoffitMeasurement {
            length,
            width,
            linear_feet,
        }
    }

    #[wasm_bindgen(getter)]
    pub fn length(&self) -> f64 {
        self.length
    }

    #[wasm_bindgen(getter)]
    pub fn width(&self) -> f64 {
        self.width
    }

    #[wasm_bindgen(getter)]
    pub fn linear_feet(&self) -> f64 {
        self.linear_feet
    }
}

#[wasm_bindgen]
impl CostEstimate {
    #[wasm_bindgen(getter)]
    pub fn material_cost(&self) -> f64 {
        self.material_cost
    }

    #[wasm_bindgen(getter)]
    pub fn labor_cost(&self) -> f64 {
        self.labor_cost
    }

    #[wasm_bindgen(getter)]
    pub fn total_cost(&self) -> f64 {
        self.total_cost
    }

    #[wasm_bindgen(getter)]
    pub fn final_total(&self) -> f64 {
        self.final_total
    }

    #[wasm_bindgen(getter)]
    pub fn volume_discount_applied(&self) -> bool {
        self.volume_discount_applied
    }
}