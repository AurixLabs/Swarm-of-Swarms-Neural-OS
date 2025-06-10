
use wasm_bindgen::prelude::*;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

macro_rules! console_log {
    ($($t:tt)*) => (log(&format_args!($($t)*).to_string()))
}

#[derive(Serialize, Deserialize, Clone)]
pub struct TokenizerConfig {
    vocab_size: usize,
    max_position_embeddings: usize,
    hidden_size: usize,
    num_attention_heads: usize,
    num_hidden_layers: usize,
}

impl Default for TokenizerConfig {
    fn default() -> Self {
        Self {
            vocab_size: 32000,
            max_position_embeddings: 2048,
            hidden_size: 2048,
            num_attention_heads: 32,
            num_hidden_layers: 22,
        }
    }
}

#[derive(Serialize, Deserialize)]
pub struct InferenceResult {
    pub generated_text: String,
    pub tokens_generated: usize,
    pub inference_time_ms: u64,
    pub confidence_score: f32,
    pub reasoning_steps: Vec<String>,
}

pub struct TinyLlamaInference {
    config: TokenizerConfig,
    vocab: HashMap<String, u32>,
    reverse_vocab: HashMap<u32, String>,
    initialized: bool,
}

impl TinyLlamaInference {
    pub fn new() -> Self {
        console_log!("🧠 TinyLlama Inference: Initializing engine...");
        
        let mut engine = Self {
            config: TokenizerConfig::default(),
            vocab: HashMap::new(),
            reverse_vocab: HashMap::new(),
            initialized: false,
        };
        
        engine.initialize_vocab();
        engine.initialized = true;
        
        console_log!("✅ TinyLlama Inference: Engine initialized with {} vocab tokens", engine.vocab.len());
        engine
    }
    
    fn initialize_vocab(&mut self) {
        // Initialize a basic vocabulary (in real implementation, this would load from model files)
        let basic_tokens = vec![
            "<unk>", "<s>", "</s>", "<pad>",
            "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "by",
            "I", "you", "he", "she", "it", "we", "they", "me", "him", "her", "us", "them",
            "is", "am", "are", "was", "were", "be", "been", "being", "have", "has", "had", "do", "does", "did",
            "can", "could", "will", "would", "should", "shall", "may", "might", "must",
            "not", "no", "yes", "true", "false", "good", "bad", "big", "small", "new", "old",
            "this", "that", "these", "those", "here", "there", "where", "when", "why", "how", "what", "who",
            "one", "two", "three", "first", "second", "last", "next", "all", "some", "many", "much",
            "think", "know", "see", "say", "get", "go", "come", "make", "take", "give", "work", "look",
            "cognitive", "reasoning", "intelligence", "analysis", "swarm", "distributed", "edge", "neural",
            ".", ",", "!", "?", ":", ";", "(", ")", "[", "]", "{", "}", "'", "\"", "-", "_",
        ];
        
        for (idx, token) in basic_tokens.iter().enumerate() {
            self.vocab.insert(token.to_string(), idx as u32);
            self.reverse_vocab.insert(idx as u32, token.to_string());
        }
        
        // Add more tokens for better coverage
        for i in 0..1000 {
            let token = format!("token_{}", i);
            let id = (basic_tokens.len() + i) as u32;
            self.vocab.insert(token.clone(), id);
            self.reverse_vocab.insert(id, token);
        }
    }
    
    fn tokenize(&self, text: &str) -> Vec<u32> {
        let words: Vec<&str> = text.split_whitespace().collect();
        let mut tokens = Vec::new();
        
        for word in words {
            let clean_word = word.to_lowercase().trim_matches(|c: char| !c.is_alphanumeric()).to_string();
            let token_id = self.vocab.get(&clean_word).unwrap_or(self.vocab.get("<unk>").unwrap());
            tokens.push(*token_id);
        }
        
        tokens
    }
    
    fn detokenize(&self, tokens: &[u32]) -> String {
        tokens.iter()
            .filter_map(|&token_id| self.reverse_vocab.get(&token_id))
            .cloned()
            .collect::<Vec<String>>()
            .join(" ")
    }
    
    pub fn generate_text(&self, prompt: &str, max_tokens: usize) -> InferenceResult {
        let start_time = std::time::Instant::now();
        console_log!("🚀 TinyLlama: Generating text for prompt: '{}'", prompt);
        
        let input_tokens = self.tokenize(prompt);
        console_log!("📝 TinyLlama: Tokenized input: {} tokens", input_tokens.len());
        
        let mut reasoning_steps = Vec::new();
        reasoning_steps.push(format!("Input tokenized to {} tokens", input_tokens.len()));
        
        // Simulate real inference (in production, this would run the actual TinyLlama model)
        let generated_tokens = self.simulate_inference(&input_tokens, max_tokens, &mut reasoning_steps);
        
        let generated_text = self.detokenize(&generated_tokens);
        let inference_time = start_time.elapsed().as_millis() as u64;
        
        console_log!("✅ TinyLlama: Generated {} tokens in {}ms", generated_tokens.len(), inference_time);
        
        InferenceResult {
            generated_text: format!("{} {}", prompt, generated_text),
            tokens_generated: generated_tokens.len(),
            inference_time_ms: inference_time,
            confidence_score: self.calculate_confidence(&generated_tokens),
            reasoning_steps,
        }
    }
    
    fn simulate_inference(&self, input_tokens: &[u32], max_tokens: usize, reasoning_steps: &mut Vec<String>) -> Vec<u32> {
        reasoning_steps.push("Starting autoregressive generation".to_string());
        
        let mut generated = Vec::new();
        let context_length = input_tokens.len();
        
        for i in 0..max_tokens {
            // Simulate attention mechanism
            let attention_score = self.simulate_attention(input_tokens, &generated, i);
            reasoning_steps.push(format!("Step {}: Attention score {:.3}", i + 1, attention_score));
            
            // Generate next token based on context
            let next_token = self.predict_next_token(input_tokens, &generated, attention_score);
            generated.push(next_token);
            
            // Stop if we generate end token
            if let Some(token_str) = self.reverse_vocab.get(&next_token) {
                if token_str == "</s>" {
                    reasoning_steps.push("Generated end-of-sequence token, stopping".to_string());
                    break;
                }
            }
        }
        
        reasoning_steps.push(format!("Generation complete: {} tokens produced", generated.len()));
        generated
    }
    
    fn simulate_attention(&self, input_tokens: &[u32], generated: &[u32], step: usize) -> f32 {
        let total_context = input_tokens.len() + generated.len();
        let position_factor = (step as f32 + 1.0) / (total_context as f32 + 1.0);
        
        // Simulate attention decay
        0.9 - (position_factor * 0.3)
    }
    
    fn predict_next_token(&self, input_tokens: &[u32], generated: &[u32], attention_score: f32) -> u32 {
        // Simple heuristic-based next token prediction
        let all_context: Vec<u32> = input_tokens.iter().chain(generated.iter()).cloned().collect();
        
        if all_context.is_empty() {
            return *self.vocab.get("the").unwrap_or(&0);
        }
        
        let last_token = *all_context.last().unwrap();
        
        // Context-aware token generation
        if let Some(last_word) = self.reverse_vocab.get(&last_token) {
            match last_word.as_str() {
                "cognitive" => *self.vocab.get("reasoning").unwrap_or(&last_token),
                "swarm" => *self.vocab.get("intelligence").unwrap_or(&last_token),
                "distributed" => *self.vocab.get("computing").unwrap_or(&last_token),
                "neural" => *self.vocab.get("network").unwrap_or(&last_token),
                "the" => *self.vocab.get("system").unwrap_or(&last_token),
                "is" => *self.vocab.get("advanced").unwrap_or(&last_token),
                _ => {
                    // Probabilistic selection based on attention
                    let vocab_size = self.vocab.len() as u32;
                    let seed = (last_token as f32 * attention_score * 1000.0) as u32;
                    (seed % vocab_size).max(1)
                }
            }
        } else {
            last_token
        }
    }
    
    fn calculate_confidence(&self, tokens: &[u32]) -> f32 {
        if tokens.is_empty() {
            return 0.0;
        }
        
        // Calculate confidence based on token coherence
        let mut coherence_score = 0.0;
        for i in 1..tokens.len() {
            let prev_token = tokens[i - 1];
            let curr_token = tokens[i];
            
            if let (Some(prev_word), Some(curr_word)) = 
                (self.reverse_vocab.get(&prev_token), self.reverse_vocab.get(&curr_token)) {
                
                // Simple coherence check
                if self.tokens_are_coherent(prev_word, curr_word) {
                    coherence_score += 1.0;
                }
            }
        }
        
        (coherence_score / (tokens.len() - 1) as f32).max(0.1).min(0.95)
    }
    
    fn tokens_are_coherent(&self, prev: &str, curr: &str) -> bool {
        // Simple coherence rules
        match (prev, curr) {
            ("cognitive", "reasoning") => true,
            ("swarm", "intelligence") => true,
            ("distributed", "computing") => true,
            ("neural", "network") => true,
            ("the", _) => !curr.starts_with(char::is_uppercase),
            (_, ".") => true,
            _ => prev.len() > 1 && curr.len() > 1,
        }
    }
    
    pub fn is_initialized(&self) -> bool {
        self.initialized
    }
    
    pub fn get_model_info(&self) -> String {
        format!("TinyLlama-1.1B | Vocab: {} | Max Context: {}", 
                self.vocab.len(), 
                self.config.max_position_embeddings)
    }
}
