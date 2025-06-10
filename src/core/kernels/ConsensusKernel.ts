
import { UniversalKernel } from './UniversalKernel';
import { SystemEvent } from '../events/SystemEvents';
import { resourceManager } from '../resources/ResourceManager';

export interface ConsensusProposal {
  id: string;
  type: 'resource_allocation' | 'kernel_priority' | 'system_policy' | 'ethics_enforcement';
  proposer: string;
  data: any;
  votes: Map<string, 'approve' | 'reject' | 'abstain'>;
  threshold: number;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  timestamp: number;
  deadline: number;
}

export interface ConsensusMetrics {
  totalProposals: number;
  approvedProposals: number;
  rejectedProposals: number;
  participationRate: number;
  averageConsensusTime: number;
  activeValidators: number;
}

export class ConsensusKernel extends UniversalKernel {
  private proposals: Map<string, ConsensusProposal> = new Map();
  private validators: Set<string> = new Set();
  private votingPowers: Map<string, number> = new Map();
  private metrics: ConsensusMetrics = {
    totalProposals: 0,
    approvedProposals: 0,
    rejectedProposals: 0,
    participationRate: 0,
    averageConsensusTime: 3000,
    activeValidators: 0
  };

  constructor() {
    super('consensus', 'Consensus Kernel', 'decentralized_consensus');
    this.initialize();
  }

  async initialize(): Promise<void> {
    console.log('🗳️ Initializing Consensus Kernel for decentralized decision making');
    
    // Allocate resources for consensus operations
    const allocated = resourceManager.allocateResources('consensus', 9, 64, 12);
    if (!allocated) {
      console.warn('⚠️ Consensus Kernel: Resource allocation failed');
    }

    // Initialize validator network
    this.initializeValidators();
    
    // Set up consensus monitoring
    this.setupConsensusMonitoring();
    
    this.setStatus('healthy');
    console.log('✅ Consensus Kernel initialized successfully');
  }

  proposeDecision(
    proposer: string,
    type: ConsensusProposal['type'],
    data: any,
    threshold: number = 0.67
  ): string {
    const proposalId = `proposal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const proposal: ConsensusProposal = {
      id: proposalId,
      type,
      proposer,
      data,
      votes: new Map(),
      threshold,
      status: 'pending',
      timestamp: Date.now(),
      deadline: Date.now() + (5 * 60 * 1000) // 5 minutes to vote
    };

    this.proposals.set(proposalId, proposal);
    this.metrics.totalProposals++;

    console.log(`📋 New proposal created: ${type} by ${proposer} (ID: ${proposalId})`);
    
    // Notify validators
    this.emit({
      id: `proposal_created_${Date.now()}`,
      type: 'CONSENSUS_PROPOSAL_CREATED',
      payload: { proposalId, type, proposer, threshold },
      timestamp: Date.now(),
      priority: 7
    });

    // Auto-vote for system proposals
    if (proposer === 'system') {
      this.autoVoteSystemProposal(proposalId);
    }

    return proposalId;
  }

  castVote(
    proposalId: string,
    voter: string,
    vote: 'approve' | 'reject' | 'abstain'
  ): boolean {
    const proposal = this.proposals.get(proposalId);
    if (!proposal) {
      console.warn(`❌ Vote failed: Proposal ${proposalId} not found`);
      return false;
    }

    if (proposal.status !== 'pending') {
      console.warn(`❌ Vote failed: Proposal ${proposalId} is ${proposal.status}`);
      return false;
    }

    if (Date.now() > proposal.deadline) {
      proposal.status = 'expired';
      console.warn(`❌ Vote failed: Proposal ${proposalId} has expired`);
      return false;
    }

    if (!this.validators.has(voter)) {
      console.warn(`❌ Vote failed: ${voter} is not a registered validator`);
      return false;
    }

    proposal.votes.set(voter, vote);
    console.log(`✅ Vote cast: ${voter} voted ${vote} on proposal ${proposalId}`);

    // Check if consensus is reached
    this.checkConsensus(proposalId);

    return true;
  }

  getProposal(proposalId: string): ConsensusProposal | null {
    return this.proposals.get(proposalId) || null;
  }

  getActiveProposals(): ConsensusProposal[] {
    return Array.from(this.proposals.values()).filter(p => p.status === 'pending');
  }

  getConsensusMetrics(): ConsensusMetrics {
    this.updateMetrics();
    return { ...this.metrics };
  }

  registerValidator(validatorId: string, votingPower: number = 1): boolean {
    if (this.validators.has(validatorId)) {
      console.warn(`⚠️ Validator ${validatorId} already registered`);
      return false;
    }

    this.validators.add(validatorId);
    this.votingPowers.set(validatorId, votingPower);
    
    console.log(`✅ Validator registered: ${validatorId} with power ${votingPower}`);
    
    this.emit({
      id: `validator_registered_${Date.now()}`,
      type: 'CONSENSUS_VALIDATOR_REGISTERED',
      payload: { validatorId, votingPower },
      timestamp: Date.now(),
      priority: 6
    });

    return true;
  }

  removeValidator(validatorId: string): boolean {
    if (!this.validators.has(validatorId)) {
      console.warn(`⚠️ Validator ${validatorId} not found`);
      return false;
    }

    this.validators.delete(validatorId);
    this.votingPowers.delete(validatorId);
    
    console.log(`✅ Validator removed: ${validatorId}`);
    return true;
  }

  forceConsensus(proposalId: string, decision: 'approve' | 'reject'): boolean {
    const proposal = this.proposals.get(proposalId);
    if (!proposal) {
      console.warn(`❌ Force consensus failed: Proposal ${proposalId} not found`);
      return false;
    }

    if (proposal.status !== 'pending') {
      console.warn(`❌ Force consensus failed: Proposal ${proposalId} is ${proposal.status}`);
      return false;
    }

    proposal.status = decision === 'approve' ? 'approved' : 'rejected';
    
    console.log(`🔧 Force consensus: Proposal ${proposalId} ${decision}d by system override`);
    
    this.executeProposal(proposal);
    return true;
  }

  private initializeValidators(): void {
    // Initialize core system validators
    const coreValidators = [
      { id: 'system_kernel', power: 3 },
      { id: 'ethics_kernel', power: 3 },
      { id: 'ai_kernel', power: 2 },
      { id: 'security_kernel', power: 2 },
      { id: 'memory_kernel', power: 1 },
      { id: 'ui_kernel', power: 1 }
    ];

    coreValidators.forEach(validator => {
      this.registerValidator(validator.id, validator.power);
    });
  }

  private setupConsensusMonitoring(): void {
    // Check for expired proposals every 30 seconds
    setInterval(() => {
      this.checkExpiredProposals();
      this.updateMetrics();
    }, 30000);

    // Monitor consensus health every 10 seconds
    setInterval(() => {
      this.checkConsensusHealth();
    }, 10000);
  }

  private checkConsensus(proposalId: string): void {
    const proposal = this.proposals.get(proposalId);
    if (!proposal || proposal.status !== 'pending') return;

    const totalVotingPower = this.calculateTotalVotingPower();
    const voteCounts = this.calculateVoteCounts(proposal);
    
    const approvalRate = voteCounts.approve / totalVotingPower;
    const rejectionRate = voteCounts.reject / totalVotingPower;
    
    if (approvalRate >= proposal.threshold) {
      proposal.status = 'approved';
      this.metrics.approvedProposals++;
      console.log(`✅ Consensus reached: Proposal ${proposalId} APPROVED (${(approvalRate * 100).toFixed(1)}%)`);
      this.executeProposal(proposal);
    } else if (rejectionRate >= proposal.threshold) {
      proposal.status = 'rejected';
      this.metrics.rejectedProposals++;
      console.log(`❌ Consensus reached: Proposal ${proposalId} REJECTED (${(rejectionRate * 100).toFixed(1)}%)`);
    }

    if (proposal.status !== 'pending') {
      this.emit({
        id: `consensus_reached_${Date.now()}`,
        type: 'CONSENSUS_REACHED',
        payload: { 
          proposalId, 
          status: proposal.status, 
          approvalRate: approvalRate * 100,
          rejectionRate: rejectionRate * 100
        },
        timestamp: Date.now(),
        priority: 8
      });
    }
  }

  private calculateTotalVotingPower(): number {
    let total = 0;
    this.votingPowers.forEach(power => total += power);
    return total;
  }

  private calculateVoteCounts(proposal: ConsensusProposal): { approve: number; reject: number; abstain: number } {
    const counts = { approve: 0, reject: 0, abstain: 0 };
    
    proposal.votes.forEach((vote, voter) => {
      const power = this.votingPowers.get(voter) || 1;
      counts[vote] += power;
    });
    
    return counts;
  }

  private executeProposal(proposal: ConsensusProposal): void {
    if (proposal.status !== 'approved') return;

    console.log(`🚀 Executing approved proposal: ${proposal.type}`);
    
    switch (proposal.type) {
      case 'resource_allocation':
        this.executeResourceAllocation(proposal.data);
        break;
      case 'kernel_priority':
        this.executeKernelPriority(proposal.data);
        break;
      case 'system_policy':
        this.executeSystemPolicy(proposal.data);
        break;
      case 'ethics_enforcement':
        this.executeEthicsEnforcement(proposal.data);
        break;
      default:
        console.warn(`⚠️ Unknown proposal type: ${proposal.type}`);
    }
  }

  private executeResourceAllocation(data: any): void {
    console.log('🔧 Executing resource allocation proposal:', data);
    // Implementation would coordinate with ResourceManager
  }

  private executeKernelPriority(data: any): void {
    console.log('🔧 Executing kernel priority proposal:', data);
    // Implementation would update kernel priorities
  }

  private executeSystemPolicy(data: any): void {
    console.log('🔧 Executing system policy proposal:', data);
    // Implementation would update system policies
  }

  private executeEthicsEnforcement(data: any): void {
    console.log('🔧 Executing ethics enforcement proposal:', data);
    // Implementation would coordinate with Ethics Kernel
  }

  private autoVoteSystemProposal(proposalId: string): void {
    // System validators automatically approve system proposals with high priority
    const systemValidators = ['system_kernel', 'ethics_kernel', 'security_kernel'];
    
    setTimeout(() => {
      systemValidators.forEach(validator => {
        this.castVote(proposalId, validator, 'approve');
      });
    }, 1000); // Delay to simulate processing time
  }

  private checkExpiredProposals(): void {
    const now = Date.now();
    
    this.proposals.forEach((proposal, id) => {
      if (proposal.status === 'pending' && now > proposal.deadline) {
        proposal.status = 'expired';
        console.log(`⏰ Proposal expired: ${id}`);
        
        this.emit({
          id: `proposal_expired_${Date.now()}`,
          type: 'CONSENSUS_PROPOSAL_EXPIRED',
          payload: { proposalId: id, type: proposal.type },
          timestamp: Date.now(),
          priority: 6
        });
      }
    });
  }

  private updateMetrics(): void {
    this.metrics.activeValidators = this.validators.size;
    
    // Calculate participation rate
    const activeProposals = this.getActiveProposals();
    if (activeProposals.length > 0) {
      let totalVotes = 0;
      let possibleVotes = 0;
      
      activeProposals.forEach(proposal => {
        totalVotes += proposal.votes.size;
        possibleVotes += this.validators.size;
      });
      
      this.metrics.participationRate = possibleVotes > 0 
        ? (totalVotes / possibleVotes) * 100 
        : 0;
    }
  }

  private checkConsensusHealth(): void {
    const activeProposals = this.getActiveProposals().length;
    const participationRate = this.metrics.participationRate;
    
    if (activeProposals > 10) {
      this.setStatus('warning');
      console.warn('⚠️ Consensus Kernel: High proposal backlog');
    } else if (participationRate < 50 && activeProposals > 0) {
      this.setStatus('warning');
      console.warn('⚠️ Consensus Kernel: Low participation rate');
    } else {
      this.setStatus('healthy');
    }
  }
}

export const consensusKernel = new ConsensusKernel();
