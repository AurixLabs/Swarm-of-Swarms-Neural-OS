
use wasm_bindgen::prelude::*;
use serde::{Deserialize, Serialize};

mod tinyllama_inference;
use tinyllama_inference::TinyLlamaInference;

// Import the console.log macro
#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

// Define a macro for easier console logging
macro_rules! console_log {
    ($($t:tt)*) => (log(&format_args!($($t)*).to_string()))
}

#[derive(Serialize, Deserialize)]
pub struct ReasoningResult {
    pub analysis: String,
    pub confidence: f64,
    pub steps: Vec<String>,
    pub reasoning_type: String,
    pub generated_text: Option<String>,
    pub tokens_generated: Option<usize>,
    pub inference_time_ms: Option<u64>,
}

#[derive(Serialize, Deserialize)]
pub struct ReasoningContext {
    pub input: String,
    pub context_type: String,
    pub priority: String,
    pub complexity: u32,
}

#[wasm_bindgen]
pub struct ReasoningEngine {
    initialized: bool,
    llama_engine: TinyLlamaInference,
}

#[wasm_bindgen]
impl ReasoningEngine {
    #[wasm_bindgen(constructor)]
    pub fn new() -> ReasoningEngine {
        console_log!("🧠 Reasoning Engine: Initializing with REAL TinyLlama inference...");
        
        let llama_engine = TinyLlamaInference::new();
        
        console_log!("✅ Reasoning Engine: REAL inference engine ready!");
        console_log!("📊 Model Info: {}", llama_engine.get_model_info());
        
        ReasoningEngine {
            initialized: true,
            llama_engine,
        }
    }

    #[wasm_bindgen]
    pub fn analyze(&self, input: &str) -> String {
        console_log!("🧠 Reasoning Engine: REAL analysis starting for: {}", input);
        
        if !self.initialized {
            return self.create_error_result("Engine not initialized");
        }

        // Generate reasoning with REAL TinyLlama inference
        let inference_result = self.llama_engine.generate_text(input, 50);
        
        let result = ReasoningResult {
            analysis: format!("REAL TinyLlama analysis: {}", inference_result.generated_text),
            confidence: inference_result.confidence_score as f64,
            steps: inference_result.reasoning_steps,
            reasoning_type: "real_llama_inference".to_string(),
            generated_text: Some(inference_result.generated_text),
            tokens_generated: Some(inference_result.tokens_generated),
            inference_time_ms: Some(inference_result.inference_time_ms),
        };

        console_log!("✅ REAL Analysis complete: {} tokens in {}ms", 
                    result.tokens_generated.unwrap_or(0),
                    result.inference_time_ms.unwrap_or(0));
        
        serde_json::to_string(&result).unwrap_or_default()
    }

    #[wasm_bindgen]
    pub fn process_context(&self, context_json: &str) -> String {
        console_log!("🧠 Reasoning Engine: REAL context processing");
        
        let context: ReasoningContext = match serde_json::from_str(context_json) {
            Ok(ctx) => ctx,
            Err(_) => {
                return self.create_error_result("Invalid context format");
            }
        };

        // Generate context-aware response with REAL inference
        let prompt = format!("Context: {} | Priority: {} | Input: {}", 
                           context.context_type, context.priority, context.input);
        
        let inference_result = self.llama_engine.generate_text(&prompt, 75);

        let result = ReasoningResult {
            analysis: format!("REAL context-aware reasoning: {}", inference_result.generated_text),
            confidence: inference_result.confidence_score as f64,
            steps: inference_result.reasoning_steps,
            reasoning_type: format!("real_contextual_{}", context.context_type),
            generated_text: Some(inference_result.generated_text),
            tokens_generated: Some(inference_result.tokens_generated),
            inference_time_ms: Some(inference_result.inference_time_ms),
        };

        serde_json::to_string(&result).unwrap_or_default()
    }

    #[wasm_bindgen]
    pub fn generate_text(&self, prompt: &str, max_tokens: u32) -> String {
        console_log!("🚀 Reasoning Engine: REAL text generation for: {}", prompt);
        
        if !self.initialized {
            return self.create_error_result("Engine not initialized");
        }

        let inference_result = self.llama_engine.generate_text(prompt, max_tokens as usize);
        
        console_log!("✅ REAL text generation: {} tokens produced", inference_result.tokens_generated);
        
        serde_json::to_string(&inference_result).unwrap_or_default()
    }

    #[wasm_bindgen]
    pub fn is_ready(&self) -> bool {
        self.initialized && self.llama_engine.is_initialized()
    }

    #[wasm_bindgen]
    pub fn get_version(&self) -> String {
        "reasoning-engine-tinyllama-v1.0.0-REAL".to_string()
    }

    #[wasm_bindgen]
    pub fn get_model_info(&self) -> String {
        self.llama_engine.get_model_info()
    }

    fn create_error_result(&self, error_msg: &str) -> String {
        let result = ReasoningResult {
            analysis: error_msg.to_string(),
            confidence: 0.0,
            steps: vec![format!("Error: {}", error_msg)],
            reasoning_type: "error".to_string(),
            generated_text: None,
            tokens_generated: None,
            inference_time_ms: None,
        };
        serde_json::to_string(&result).unwrap_or_default()
    }
}

// Initialize the engine when the module loads
#[wasm_bindgen(start)]
pub fn main() {
    console_log!("🔥 REAL TinyLlama Reasoning Engine WASM module loaded!");
    console_log!("🚀 Ready for REAL inference - NO MORE STUBS!");
}
