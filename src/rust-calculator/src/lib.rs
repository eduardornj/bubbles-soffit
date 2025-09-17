mod calculator;
mod constants;
mod types;
mod utils;

pub use calculator::SoffitCalculator;
pub use types::*;

use wasm_bindgen::prelude::*;

// Quando o recurso `wee_alloc` estiver habilitado, use `wee_alloc` como o alocador global.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
extern "C" {
    fn alert(s: &str);
    
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

// Macro para facilitar o logging
macro_rules! console_log {
    ($($t:tt)*) => (log(&format_args!($($t)*).to_string()))
}

#[wasm_bindgen]
pub fn greet(name: &str) {
    alert(&format!("Hello, {}!", name));
}

// Função para inicializar o panic hook para melhor debugging
#[wasm_bindgen(start)]
pub fn main() {
    #[cfg(feature = "console_error_panic_hook")]
    console_error_panic_hook::set_once();
    
    console_log!("Soffit Calculator WASM module loaded successfully!");
}

// Função utilitária para testar se o WASM está funcionando
#[wasm_bindgen]
pub fn test_wasm() -> String {
    "WASM module is working correctly!".to_string()
}

// Função para obter versão do módulo
#[wasm_bindgen]
pub fn get_version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}

// Re-exportar o calculador principal
#[wasm_bindgen]
pub fn create_calculator() -> SoffitCalculator {
    SoffitCalculator::new()
}