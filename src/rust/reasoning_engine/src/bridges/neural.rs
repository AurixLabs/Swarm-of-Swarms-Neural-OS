
use crate::core::{ReasoningResult, ReasoningStep};
use serde_json::Value;

pub struct NeuralInterface {
    spike_threshold: f64,
    activation_patterns: Vec<f64>,
}

impl NeuralInterface {
    pub fn new() -> Self {
        NeuralInterface {
            spike_threshold: 0.7,
            activation_patterns: Vec::new(),
        }
    }

    pub fn convert_to_spikes(&mut self, reasoning_result: &ReasoningResult) -> Vec<f64> {
        let mut spikes = Vec::new();
        
        // Convert reasoning steps to spike patterns
        for step in &reasoning_result.steps {
            let spike_intensity = step.confidence;
            spikes.push(spike_intensity);
            
            // Add temporal spacing between spikes
            if spike_intensity > self.spike_threshold {
                spikes.push(0.0); // Rest period
            }
        }
        
        // Add final confidence as output spike
        spikes.push(reasoning_result.confidence);
        
        self.activation_patterns = spikes.clone();
        spikes
    }

    pub fn process_neural_input(&mut self, spikes: &[f64]) -> Value {
        // Convert spike patterns back to reasoning format
        let mut steps = Vec::new();
        
        for (i, &spike) in spikes.iter().enumerate() {
            if spike > self.spike_threshold {
                steps.push(format!("Neural activation {} with intensity {:.2}", i, spike));
            }
        }
        
        serde_json::json!({
            "neural_processing": {
                "steps": steps,
                "total_spikes": spikes.len(),
                "average_activation": spikes.iter().sum::<f64>() / spikes.len() as f64
            }
        })
    }

    pub fn get_activation_patterns(&self) -> &[f64] {
        &self.activation_patterns
    }
}
