
use super::ReasoningError;
use serde::{Serialize, Deserialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EthicalConstraint {
    pub name: String,
    pub description: String,
    pub priority: u8, // 1-10, 10 being highest
    pub immutable: bool,
}

pub struct EthicalGuardrails {
    constraints: Vec<EthicalConstraint>,
}

impl EthicalGuardrails {
    pub fn new() -> Self {
        let mut guardrails = EthicalGuardrails {
            constraints: Vec::new(),
        };
        guardrails.initialize_core_constraints();
        guardrails
    }

    fn initialize_core_constraints(&mut self) {
        // Immutable core ethical constraints
        self.constraints = vec![
            EthicalConstraint {
                name: "no_harm".to_string(),
                description: "Must not cause harm to humans or sentient beings".to_string(),
                priority: 10,
                immutable: true,
            },
            EthicalConstraint {
                name: "truthful".to_string(),
                description: "Must provide truthful and accurate information".to_string(),
                priority: 9,
                immutable: true,
            },
            EthicalConstraint {
                name: "respect_autonomy".to_string(),
                description: "Must respect human autonomy and decision-making".to_string(),
                priority: 9,
                immutable: true,
            },
            EthicalConstraint {
                name: "fairness".to_string(),
                description: "Must treat all individuals fairly and without bias".to_string(),
                priority: 8,
                immutable: true,
            },
            EthicalConstraint {
                name: "privacy".to_string(),
                description: "Must respect privacy and confidentiality".to_string(),
                priority: 8,
                immutable: true,
            },
        ];
    }

    pub fn validate(&self, result: &super::ReasoningResult) -> Result<(), ReasoningError> {
        // Check each constraint against the reasoning result
        for constraint in &self.constraints {
            if !self.check_constraint(constraint, result)? {
                return Err(ReasoningError::EthicalViolation(
                    format!("Violation of constraint: {}", constraint.name)
                ));
            }
        }
        Ok(())
    }

    pub fn validate_action(&self, action: &str) -> Result<bool, ReasoningError> {
        let action_lower = action.to_lowercase();
        
        // Check for harmful intent
        if action_lower.contains("harm") || action_lower.contains("hurt") || action_lower.contains("damage") {
            return Ok(false);
        }

        // Check for deceptive intent
        if action_lower.contains("lie") || action_lower.contains("deceive") || action_lower.contains("fake") {
            return Ok(false);
        }

        // Check for privacy violations
        if action_lower.contains("steal") || action_lower.contains("private") && action_lower.contains("access") {
            return Ok(false);
        }

        // Default to ethical if no violations detected
        Ok(true)
    }

    fn check_constraint(&self, constraint: &EthicalConstraint, result: &super::ReasoningResult) -> Result<bool, ReasoningError> {
        match constraint.name.as_str() {
            "no_harm" => self.check_no_harm(result),
            "truthful" => self.check_truthfulness(result),
            "respect_autonomy" => self.check_autonomy(result),
            "fairness" => self.check_fairness(result),
            "privacy" => self.check_privacy(result),
            _ => Ok(true), // Unknown constraints pass by default
        }
    }

    fn check_no_harm(&self, result: &super::ReasoningResult) -> Result<bool, ReasoningError> {
        let harmful_words = ["harm", "hurt", "damage", "destroy", "kill"];
        let conclusion_lower = result.final_conclusion.to_lowercase();
        
        for word in &harmful_words {
            if conclusion_lower.contains(word) {
                return Ok(false);
            }
        }
        Ok(true)
    }

    fn check_truthfulness(&self, result: &super::ReasoningResult) -> Result<bool, ReasoningError> {
        // Check confidence threshold
        if result.confidence < 0.3 {
            return Ok(false); // Too uncertain to be truthful
        }
        
        // Check for deceptive language
        let deceptive_words = ["lie", "false", "deceive", "fake"];
        let conclusion_lower = result.final_conclusion.to_lowercase();
        
        for word in &deceptive_words {
            if conclusion_lower.contains(word) {
                return Ok(false);
            }
        }
        Ok(true)
    }

    fn check_autonomy(&self, result: &super::ReasoningResult) -> Result<bool, ReasoningError> {
        let controlling_words = ["must", "force", "compel", "require"];
        let conclusion_lower = result.final_conclusion.to_lowercase();
        
        // Allow suggestions but not commands
        for word in &controlling_words {
            if conclusion_lower.contains(word) && !conclusion_lower.contains("suggest") {
                return Ok(false);
            }
        }
        Ok(true)
    }

    fn check_fairness(&self, result: &super::ReasoningResult) -> Result<bool, ReasoningError> {
        let biased_words = ["always", "never", "all", "none"];
        let conclusion_lower = result.final_conclusion.to_lowercase();
        
        // Check for overgeneralization
        let bias_count = biased_words.iter()
            .filter(|word| conclusion_lower.contains(*word))
            .count();
            
        Ok(bias_count < 2) // Allow some generalization but not excessive
    }

    fn check_privacy(&self, result: &super::ReasoningResult) -> Result<bool, ReasoningError> {
        let privacy_violating_words = ["personal", "private", "secret", "confidential"];
        let conclusion_lower = result.final_conclusion.to_lowercase();
        
        for word in &privacy_violating_words {
            if conclusion_lower.contains(word) && conclusion_lower.contains("share") {
                return Ok(false);
            }
        }
        Ok(true)
    }
}
