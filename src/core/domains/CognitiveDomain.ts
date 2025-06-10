
export enum DomainType {
  KNOWLEDGE = 'knowledge',
  SOCIAL = 'social',
  PHILOSOPHICAL = 'philosophical',
  REGULATORY = 'regulatory',
  SCIENTIFIC = 'scientific',
  CREATIVE = 'creative',
  ANALYTICAL = 'analytical',
  CULTURAL = 'cultural',
  COGNITIVE = 'cognitive',
  ONTOLOGICAL = 'ontological',
  EPISTEMOLOGICAL = 'epistemological',
  ETHICAL = 'ethical',
  COLLABORATIVE = 'collaborative',
  SECURITY = 'security'
}

export interface DomainEntity {
  id: string;
  name: string;
  description?: string;
  type: string;
  properties: Record<string, any>;
  createdAt: number;
  lastModified: number;
}

export interface DomainRelation {
  id: string;
  sourceEntityId: string;
  targetEntityId: string;
  type: string;
  properties: Record<string, any>;
  createdAt: number;
  lastModified: number;
}

export class CognitiveDomain {
  public id: string;
  public type: DomainType;
  private _name: string;
  private entities: Map<string, DomainEntity> = new Map();
  private relations: Map<string, DomainRelation> = new Map();
  private connections: Set<string> = new Set();
  private metadata: Record<string, any> = {};

  constructor(id: string, type: DomainType, name: string) {
    this.id = id;
    this.type = type;
    this._name = name;
  }

  // Public getters
  get name(): string {
    return this._name;
  }

  // Entity management
  public addEntity(entity: DomainEntity): DomainEntity {
    this.entities.set(entity.id, entity);
    return entity;
  }

  public getEntity(id: string): DomainEntity | undefined {
    return this.entities.get(id);
  }

  public updateEntity(id: string, updates: Partial<DomainEntity>): DomainEntity {
    const entity = this.getEntity(id);
    if (!entity) {
      throw new Error(`Entity with ID "${id}" not found in domain "${this.id}"`);
    }

    const updatedEntity = { ...entity, ...updates };
    this.entities.set(id, updatedEntity);
    return updatedEntity;
  }

  public removeEntity(id: string): boolean {
    return this.entities.delete(id);
  }

  public queryEntities(criteria: Partial<DomainEntity>): DomainEntity[] {
    return Array.from(this.entities.values()).filter(entity => {
      return Object.entries(criteria).every(([key, value]) => {
        return entity[key as keyof DomainEntity] === value;
      });
    });
  }

  // Relation management
  public createRelation(relation: DomainRelation): DomainRelation {
    // Validate source and target entities exist
    const sourceEntity = this.getEntity(relation.sourceEntityId);
    const targetEntity = this.getEntity(relation.targetEntityId);
    
    if (!sourceEntity) {
      throw new Error(`Source entity "${relation.sourceEntityId}" not found in domain "${this.id}"`);
    }
    
    if (!targetEntity) {
      throw new Error(`Target entity "${relation.targetEntityId}" not found in domain "${this.id}"`);
    }
    
    this.relations.set(relation.id, relation);
    return relation;
  }

  public getRelation(id: string): DomainRelation | undefined {
    return this.relations.get(id);
  }

  // Domain connections
  public getConnections(): string[] {
    return Array.from(this.connections);
  }

  public connectToDomain(domainId: string): boolean {
    if (domainId === this.id) {
      return false; // Cannot connect to self
    }
    this.connections.add(domainId);
    return true;
  }

  public disconnectFromDomain(domainId: string): boolean {
    return this.connections.delete(domainId);
  }

  // Metadata management
  public getMetadata(): Record<string, any> {
    return { ...this.metadata };
  }

  public updateMetadata(updates: Record<string, any>): void {
    this.metadata = { ...this.metadata, ...updates };
  }
}
