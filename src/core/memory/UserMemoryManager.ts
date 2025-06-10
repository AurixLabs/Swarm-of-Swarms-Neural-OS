
import { BrowserEventEmitter } from '../BrowserEventEmitter';
import { v4 as uuidv4 } from 'uuid';
import { UserProfile, UserMemoryManager } from '../interfaces/UserMemoryTypes';
import { PersistentMemoryManager } from './PersistentMemoryManager';
import { sovereignDataService } from '../services/SovereignDataService';

/**
 * Manages user profiles and memories across generations
 */
export class MultiUserMemoryManager implements UserMemoryManager {
  private static instance: MultiUserMemoryManager;
  private users: Map<string, UserProfile> = new Map();
  private currentUserId: string = '';
  private events: BrowserEventEmitter;
  private memoryManager: PersistentMemoryManager;
  
  private constructor(events: BrowserEventEmitter, memoryManager: PersistentMemoryManager) {
    this.events = events;
    this.memoryManager = memoryManager;
    this.loadUsers();
  }
  
  /**
   * Get singleton instance
   */
  public static getInstance(
    events: BrowserEventEmitter, 
    memoryManager: PersistentMemoryManager
  ): MultiUserMemoryManager {
    if (!MultiUserMemoryManager.instance) {
      MultiUserMemoryManager.instance = new MultiUserMemoryManager(events, memoryManager);
    }
    return MultiUserMemoryManager.instance;
  }
  
  /**
   * Get current active user ID
   */
  public getCurrentUser(): string {
    return this.currentUserId;
  }
  
  /**
   * Switch to another user
   */
  public switchUser(userId: string): void {
    if (this.users.has(userId)) {
      this.currentUserId = userId;
      
      // Update last interaction time
      const user = this.users.get(userId);
      if (user) {
        user.lastInteraction = Date.now();
        this.users.set(userId, user);
        this.saveUsers();
      }
      
      this.events.emit('user:switched', { userId });
    } else {
      console.error(`User ${userId} not found`);
    }
  }
  
  /**
   * Add a new user to the system
   */
  public addUser(profile: UserProfile): string {
    const userId = profile.userId || uuidv4();
    const newProfile = { 
      ...profile, 
      userId,
      createdAt: profile.createdAt || Date.now(),
      lastInteraction: Date.now()
    };
    
    this.users.set(userId, newProfile);
    
    // If this is the first user, set as current
    if (this.users.size === 1) {
      this.currentUserId = userId;
    }
    
    this.saveUsers();
    this.events.emit('user:added', { userId });
    
    return userId;
  }
  
  /**
   * Get a user profile by ID
   */
  public getUserProfile(userId: string): UserProfile | null {
    return this.users.get(userId) || null;
  }
  
  /**
   * Update user profile
   */
  public updateUserProfile(userId: string, updates: Partial<UserProfile>): boolean {
    const profile = this.users.get(userId);
    if (!profile) return false;
    
    const updatedProfile = { ...profile, ...updates, lastInteraction: Date.now() };
    this.users.set(userId, updatedProfile);
    
    this.saveUsers();
    this.events.emit('user:updated', { userId });
    
    return true;
  }
  
  /**
   * Add a personal story to user's memories
   */
  public addPersonalStory(userId: string, story: UserProfile['personalStories'][0]): string {
    const profile = this.users.get(userId);
    if (!profile) return '';
    
    const storyId = story.id || uuidv4();
    const newStory = { ...story, id: storyId, timestamp: story.timestamp || Date.now() };
    
    profile.personalStories = [...profile.personalStories, newStory];
    this.users.set(userId, profile);
    
    this.saveUsers();
    this.events.emit('story:added', { userId, storyId });
    
    return storyId;
  }
  
  /**
   * Get personal stories, optionally filtered by tags
   */
  public getPersonalStories(userId: string, tags?: string[]): UserProfile['personalStories'] {
    const profile = this.users.get(userId);
    if (!profile) return [];
    
    if (!tags || tags.length === 0) {
      return profile.personalStories;
    }
    
    return profile.personalStories.filter(story => 
      tags.some(tag => story.tags.includes(tag))
    );
  }
  
  /**
   * Link two users with a relationship
   */
  public linkUsers(userId1: string, userId2: string, relationship: string): boolean {
    const user1 = this.users.get(userId1);
    const user2 = this.users.get(userId2);
    
    if (!user1 || !user2) return false;
    
    // Check if connection already exists
    const existingConnection = user1.familyConnections.find(
      conn => conn.relatedUserId === userId2
    );
    
    if (existingConnection) {
      // Update existing connection
      existingConnection.relationship = relationship;
    } else {
      // Create new connection
      user1.familyConnections.push({
        relatedUserId: userId2,
        relationship,
        sharedMemories: []
      });
    }
    
    // Create reciprocal relationship if it doesn't exist
    const reciprocalRelationship = this.getReciprocalRelationship(relationship);
    const existingReciprocal = user2.familyConnections.find(
      conn => conn.relatedUserId === userId1
    );
    
    if (existingReciprocal) {
      existingReciprocal.relationship = reciprocalRelationship;
    } else {
      user2.familyConnections.push({
        relatedUserId: userId1,
        relationship: reciprocalRelationship,
        sharedMemories: []
      });
    }
    
    this.users.set(userId1, user1);
    this.users.set(userId2, user2);
    
    this.saveUsers();
    this.events.emit('users:linked', { userId1, userId2, relationship });
    
    return true;
  }
  
  /**
   * Inherit a user profile (when someone passes away)
   */
  public inheritProfile(fromUserId: string, toUserId: string): boolean {
    const fromUser = this.users.get(fromUserId);
    const toUser = this.users.get(toUserId);
    
    if (!fromUser || !toUser) return false;
    
    // Mark the source user as deceased
    fromUser.isDeceased = true;
    
    // Add inheritor to the deceased user's profile
    if (!fromUser.inheritedBy) {
      fromUser.inheritedBy = [];
    }
    if (!fromUser.inheritedBy.includes(toUserId)) {
      fromUser.inheritedBy.push(toUserId);
    }
    
    this.users.set(fromUserId, fromUser);
    this.saveUsers();
    
    this.events.emit('profile:inherited', { 
      fromUserId, 
      toUserId, 
      timestamp: Date.now() 
    });
    
    return true;
  }
  
  /**
   * Get all profiles inherited by a user
   */
  public getInheritedProfiles(userId: string): UserProfile[] {
    const inheritedProfiles: UserProfile[] = [];
    
    this.users.forEach(profile => {
      if (profile.inheritedBy?.includes(userId)) {
        inheritedProfiles.push(profile);
      }
    });
    
    return inheritedProfiles;
  }
  
  /**
   * Simulate the communication style of a specific user
   */
  public simulateCommunicationStyle(userId: string, content: string): string {
    const profile = this.users.get(userId);
    if (!profile) return content;
    
    const style = profile.communicationStyle;
    let modifiedContent = content;
    
    // Apply communication style transformations
    
    // Verbosity adjustment
    if (style.verbosity < 0.3) {
      // Make more concise
      modifiedContent = modifiedContent.replace(/\b(I think|I believe|perhaps|maybe)\b/gi, '');
      modifiedContent = modifiedContent.replace(/\b(very|really|extremely|quite)\b/gi, '');
    } else if (style.verbosity > 0.7) {
      // Make more verbose
      if (!modifiedContent.includes("I think")) {
        modifiedContent = `I think ${modifiedContent}`;
      }
    }
    
    // Formality adjustment
    if (style.formality < 0.3) {
      // Make more casual
      modifiedContent = modifiedContent.replace(/\b(would like to)\b/gi, 'want to');
      modifiedContent = modifiedContent.replace(/\b(however)\b/gi, 'but');
    } else if (style.formality > 0.7) {
      // Make more formal
      modifiedContent = modifiedContent.replace(/\b(want to)\b/gi, 'would like to');
      modifiedContent = modifiedContent.replace(/\b(but)\b/gi, 'however');
    }
    
    // Add common vocabulary
    if (style.vocabulary.length > 0 && Math.random() > 0.7) {
      const randomWord = style.vocabulary[Math.floor(Math.random() * style.vocabulary.length)];
      if (!modifiedContent.includes(randomWord)) {
        if (Math.random() > 0.5) {
          modifiedContent = `${randomWord}, ${modifiedContent}`;
        } else {
          const sentences = modifiedContent.split('. ');
          if (sentences.length > 1) {
            const pos = Math.floor(Math.random() * (sentences.length - 1));
            sentences[pos] += `. ${randomWord}`;
            modifiedContent = sentences.join('. ');
          } else {
            modifiedContent += `. ${randomWord}.`;
          }
        }
      }
    }
    
    return modifiedContent;
  }
  
  /**
   * Save all users to persistent storage
   */
  private saveUsers(): void {
    try {
      const usersData: Record<string, UserProfile> = {};
      this.users.forEach((profile, id) => {
        usersData[id] = profile;
      });
      
      sovereignDataService.storeData('userProfiles', 'all', usersData);
      localStorage.setItem('current-user-id', this.currentUserId);
    } catch (error) {
      console.error('Error saving user profiles:', error);
    }
  }
  
  /**
   * Load users from persistent storage
   */
  private loadUsers(): void {
    try {
      // Load user profiles
      sovereignDataService.retrieveData<Record<string, UserProfile>>('userProfiles', 'all')
        .then(data => {
          if (data) {
            Object.entries(data).forEach(([id, profile]) => {
              this.users.set(id, profile);
            });
            
            // Load current user ID
            const currentId = localStorage.getItem('current-user-id');
            if (currentId && this.users.has(currentId)) {
              this.currentUserId = currentId;
            } else if (this.users.size > 0) {
              // Set first user as current if no current user
              this.currentUserId = this.users.keys().next().value;
            }
            
            this.events.emit('users:loaded', { count: this.users.size });
          }
        });
    } catch (error) {
      console.error('Error loading user profiles:', error);
    }
  }
  
  /**
   * Get the reciprocal relationship
   */
  private getReciprocalRelationship(relationship: string): string {
    const relationshipMap: Record<string, string> = {
      'parent': 'child',
      'child': 'parent',
      'sibling': 'sibling',
      'spouse': 'spouse',
      'friend': 'friend',
      'grandparent': 'grandchild',
      'grandchild': 'grandparent',
      'guardian': 'dependent',
      'dependent': 'guardian'
    };
    
    return relationshipMap[relationship.toLowerCase()] || 'family';
  }
}

/**
 * Factory function to create the MultiUserMemoryManager
 */
export const createMultiUserMemoryManager = (
  events: BrowserEventEmitter,
  memoryManager: PersistentMemoryManager
): MultiUserMemoryManager => {
  return MultiUserMemoryManager.getInstance(events, memoryManager);
};

// Export a singleton instance
export const multiUserMemoryManager = createMultiUserMemoryManager(
  new BrowserEventEmitter(),
  PersistentMemoryManager.getInstance(new BrowserEventEmitter())
);
