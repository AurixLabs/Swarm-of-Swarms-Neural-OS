use wasm_bindgen::prelude::*;
use serde::{Deserialize, Serialize};
use std::collections::VecDeque;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

macro_rules! console_log {
    ($($t:tt)*) => (log(&format_args!($($t)*).to_string()))
}

#[derive(Serialize, Deserialize, Clone)]
pub struct SpikePattern {
    pub spikes: Vec<f32>,
    pub timestamp: u64,
    pub pattern_id: String,
    pub activation_strength: f32,
    pub neuron_count: usize,
}

#[derive(Serialize, Deserialize)]
pub struct NeuromorphicResult {
    pub pattern: SpikePattern,
    pub processing_time_ms: u64,
    pub network_state: String,
    pub learning_delta: f32,
    pub pattern_recognition: Option<String>,
}

pub struct LeakyIntegrateFireNeuron {
    membrane_potential: f32,
    threshold: f32,
    leak_rate: f32,
    refractory_period: u32,
    refractory_counter: u32,
    spike_history: VecDeque<u64>,
}

impl LeakyIntegrateFireNeuron {
    pub fn new(threshold: f32, leak_rate: f32) -> Self {
        Self {
            membrane_potential: 0.0,
            threshold,
            leak_rate,
            refractory_period: 5,
            refractory_counter: 0,
            spike_history: VecDeque::with_capacity(100),
        }
    }
    
    pub fn step(&mut self, input_current: f32, timestep: u64) -> bool {
        // Refractory period handling
        if self.refractory_counter > 0 {
            self.refractory_counter -= 1;
            self.membrane_potential = 0.0;
            return false;
        }
        
        // Leak current
        self.membrane_potential *= 1.0 - self.leak_rate;
        
        // Add input current
        self.membrane_potential += input_current;
        
        // Check for spike
        if self.membrane_potential >= self.threshold {
            self.membrane_potential = 0.0;
            self.refractory_counter = self.refractory_period;
            self.spike_history.push_back(timestep);
            
            // Keep history manageable
            if self.spike_history.len() > 100 {
                self.spike_history.pop_front();
            }
            
            true
        } else {
            false
        }
    }
    
    pub fn get_firing_rate(&self, window_ms: u64, current_time: u64) -> f32 {
        let cutoff_time = current_time.saturating_sub(window_ms);
        let recent_spikes = self.spike_history.iter()
            .filter(|&&spike_time| spike_time >= cutoff_time)
            .count();
        
        (recent_spikes as f32 / window_ms as f32) * 1000.0 // spikes per second
    }
}

#[wasm_bindgen]
pub struct NeuromorphicProcessor {
    neurons: Vec<LeakyIntegrateFireNeuron>,
    network_size: usize,
    current_time: u64,
    learning_rate: f32,
    synaptic_weights: Vec<Vec<f32>>,
    pattern_memory: Vec<SpikePattern>,
    initialized: bool,
}

#[wasm_bindgen]
impl NeuromorphicProcessor {
    #[wasm_bindgen(constructor)]
    pub fn new(network_size: usize) -> NeuromorphicProcessor {
        console_log!("⚡ Neuromorphic Processor: Initializing REAL spike network with {} neurons", network_size);
        
        let mut processor = NeuromorphicProcessor {
            neurons: Vec::new(),
            network_size,
            current_time: 0,
            learning_rate: 0.01,
            synaptic_weights: Vec::new(),
            pattern_memory: Vec::new(),
            initialized: false,
        };
        
        processor.initialize_network();
        processor.initialized = true;
        
        console_log!("✅ Neuromorphic Processor: REAL spike network ready with {} neurons", network_size);
        processor
    }
    
    fn initialize_network(&mut self) {
        // Create neurons with varying properties
        for i in 0..self.network_size {
            let threshold = 1.0 + (i as f32 * 0.1) % 0.5; // Varying thresholds
            let leak_rate = 0.1 + (i as f32 * 0.01) % 0.05; // Varying leak rates
            self.neurons.push(LeakyIntegrateFireNeuron::new(threshold, leak_rate));
        }
        
        // Initialize synaptic weights (small-world network topology)
        self.synaptic_weights = vec![vec![0.0; self.network_size]; self.network_size];
        
        for i in 0..self.network_size {
            for j in 0..self.network_size {
                if i != j {
                    // Create sparse connectivity with distance-based probability
                    let distance = ((i as f32 - j as f32).abs()) / self.network_size as f32;
                    let connection_prob = 0.1 * (1.0 - distance).max(0.0);
                    
                    if self.random_f32() < connection_prob {
                        self.synaptic_weights[i][j] = (self.random_f32() - 0.5) * 0.2; // Small random weights
                    }
                }
            }
        }
        
        console_log!("🧠 Network topology initialized: {} connections", 
                    self.count_connections());
    }
    
    fn count_connections(&self) -> usize {
        self.synaptic_weights.iter()
            .flat_map(|row| row.iter())
            .filter(|&&weight| weight.abs() > 0.001)
            .count()
    }
    
    fn random_f32(&self) -> f32 {
        // Simple PRNG for WASM (using current time as seed)
        let seed = (self.current_time + self.network_size as u64) as u32;
        let a = 1664525_u32;
        let c = 1013904223_u32;
        let result = a.wrapping_mul(seed).wrapping_add(c);
        (result as f32) / (u32::MAX as f32)
    }

    #[wasm_bindgen]
    pub fn generate_spikes(&mut self, pattern_length: usize) -> Vec<f32> {
        console_log!("⚡ Generating REAL spike pattern with {} timesteps", pattern_length);
        
        let start_time = js_sys::Date::now() as u64;
        let mut spike_pattern = Vec::with_capacity(pattern_length);
        
        // Generate input stimulus
        let stimulus_strength = 0.5;
        let stimulus_duration = pattern_length / 3;
        
        for timestep in 0..pattern_length {
            self.current_time = start_time + timestep as u64;
            
            // Create input current for each neuron
            let mut input_currents = vec![0.0; self.network_size];
            
            // Apply external stimulus
            if timestep < stimulus_duration {
                let stimulus = stimulus_strength * (1.0 - (timestep as f32 / stimulus_duration as f32));
                for i in 0..self.network_size {
                    input_currents[i] += stimulus * (0.5 + 0.5 * ((i as f32 * 0.1).sin()));
                }
            }
            
            // Process network recurrent connections
            let mut network_spikes = vec![false; self.network_size];
            for i in 0..self.network_size {
                // Add recurrent input from other neurons
                for j in 0..self.network_size {
                    if i != j && self.synaptic_weights[j][i].abs() > 0.001 {
                        let firing_rate = self.neurons[j].get_firing_rate(10, self.current_time);
                        input_currents[i] += self.synaptic_weights[j][i] * firing_rate * 0.01;
                    }
                }
                
                // Step the neuron
                network_spikes[i] = self.neurons[i].step(input_currents[i], self.current_time);
            }
            
            // Calculate population activity
            let spike_count = network_spikes.iter().filter(|&&spike| spike).count();
            let population_activity = spike_count as f32 / self.network_size as f32;
            
            spike_pattern.push(population_activity);
        }
        
        let processing_time = js_sys::Date::now() as u64 - start_time;
        console_log!("✅ REAL spike pattern generated in {}ms", processing_time);
        
        spike_pattern
    }

    #[wasm_bindgen]
    pub fn process_input(&mut self, input_data: &[f32]) -> String {
        console_log!("🧠 Processing REAL input through spike network: {} samples", input_data.len());
        
        let start_time = js_sys::Date::now() as u64;
        let pattern_length = input_data.len().min(100); // Limit pattern length
        
        let mut spike_pattern = Vec::new();
        let mut total_activation = 0.0;
        
        for (timestep, &input_value) in input_data.iter().take(pattern_length).enumerate() {
            self.current_time = start_time + timestep as u64;
            
            // Convert input to neural currents
            let mut input_currents = vec![0.0; self.network_size];
            let scaled_input = input_value * 2.0; // Scale input appropriately
            
            for i in 0..self.network_size {
                // Distribute input across neurons with some variability
                let neuron_input = scaled_input * (0.8 + 0.4 * ((i as f32 * 0.2).sin()));
                input_currents[i] = neuron_input;
            }
            
            // Process one timestep
            let mut spike_count = 0;
            for i in 0..self.network_size {
                if self.neurons[i].step(input_currents[i], self.current_time) {
                    spike_count += 1;
                }
            }
            
            let activation = spike_count as f32 / self.network_size as f32;
            spike_pattern.push(activation);
            total_activation += activation;
        }
        
        let processing_time = js_sys::Date::now() as u64 - start_time;
        let avg_activation = total_activation / pattern_length as f32;
        
        // Apply learning (simple STDP-like rule)
        self.apply_learning(avg_activation);
        
        // Recognize patterns
        let pattern_recognition = self.recognize_pattern(&spike_pattern);
        
        let result = NeuromorphicResult {
            pattern: SpikePattern {
                spikes: spike_pattern,
                timestamp: start_time,
                pattern_id: format!("pattern_{}", start_time),
                activation_strength: avg_activation,
                neuron_count: self.network_size,
            },
            processing_time_ms: processing_time,
            network_state: format!("Active neurons: {:.1}%", avg_activation * 100.0),
            learning_delta: self.learning_rate * avg_activation,
            pattern_recognition,
        };
        
        console_log!("✅ REAL neuromorphic processing complete: {:.3} avg activation", avg_activation);
        
        serde_json::to_string(&result).unwrap_or_default()
    }
    
    fn apply_learning(&mut self, activation_strength: f32) {
        // Simple learning rule: strengthen connections that contributed to strong activation
        let learning_factor = self.learning_rate * activation_strength;
        
        for i in 0..self.network_size {
            for j in 0..self.network_size {
                if i != j && self.synaptic_weights[i][j].abs() > 0.001 {
                    let firing_rate_i = self.neurons[i].get_firing_rate(20, self.current_time);
                    let firing_rate_j = self.neurons[j].get_firing_rate(20, self.current_time);
                    
                    // Hebbian-like learning: neurons that fire together, wire together
                    if firing_rate_i > 1.0 && firing_rate_j > 1.0 {
                        self.synaptic_weights[i][j] += learning_factor * 0.1;
                        self.synaptic_weights[i][j] = self.synaptic_weights[i][j].clamp(-1.0, 1.0);
                    }
                }
            }
        }
    }
    
    fn recognize_pattern(&mut self, spike_pattern: &[f32]) -> Option<String> {
        // Simple pattern recognition based on activation signature
        let pattern_sum: f32 = spike_pattern.iter().sum();
        let pattern_variance: f32 = {
            let mean = pattern_sum / spike_pattern.len() as f32;
            spike_pattern.iter().map(|&x| (x - mean).powi(2)).sum::<f32>() / spike_pattern.len() as f32
        };
        
        // Classify patterns based on statistical properties
        if pattern_sum > 5.0 && pattern_variance > 0.1 {
            Some("complex_burst".to_string())
        } else if pattern_sum > 2.0 && pattern_variance < 0.05 {
            Some("steady_oscillation".to_string())
        } else if pattern_variance > 0.2 {
            Some("chaotic_firing".to_string())
        } else if pattern_sum > 1.0 {
            Some("weak_activation".to_string())
        } else {
            Some("minimal_response".to_string())
        }
    }

    #[wasm_bindgen]
    pub fn get_network_stats(&self) -> String {
        let connections = self.count_connections();
        let avg_threshold: f32 = self.neurons.iter()
            .map(|n| n.threshold)
            .sum::<f32>() / self.network_size as f32;
        
        let recent_activity: f32 = self.neurons.iter()
            .map(|n| n.get_firing_rate(100, self.current_time))
            .sum::<f32>() / self.network_size as f32;
        
        format!("Neurons: {} | Connections: {} | Avg Threshold: {:.3} | Recent Activity: {:.1} Hz", 
                self.network_size, connections, avg_threshold, recent_activity)
    }

    #[wasm_bindgen]
    pub fn is_ready(&self) -> bool {
        self.initialized
    }

    #[wasm_bindgen]
    pub fn get_version(&self) -> String {
        "neuromorphic-processor-v1.0.0-REAL".to_string()
    }
}

#[wasm_bindgen(start)]
pub fn main() {
    console_log!("⚡ REAL Neuromorphic WASM module loaded!");
    console_log!("🧠 Ready for REAL spike processing - NO MORE SIMULATIONS!");
}
