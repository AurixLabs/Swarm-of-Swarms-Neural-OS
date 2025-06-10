
use wasm_bindgen::prelude::*;
use crate::ReasoningEngine;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

macro_rules! console_log {
    ($($t:tt)*) => (log(&format_args!($($t)*).to_string()))
}

#[wasm_bindgen]
pub fn create_engine() -> ReasoningEngine {
    console_log!("🔧 WASM Bridge: Creating reasoning engine");
    ReasoningEngine::new()
}

#[wasm_bindgen]
pub fn process_json(engine: &mut ReasoningEngine, json: &str) -> Result<String, JsValue> {
    console_log!("🔧 WASM Bridge: Processing JSON request");
    engine.process_request(json)
}

#[wasm_bindgen]
pub fn validate_ethics_action(engine: &ReasoningEngine, action: &str) -> Result<bool, JsValue> {
    console_log!("🔧 WASM Bridge: Validating ethics for action");
    engine.validate_ethics(action)
}
