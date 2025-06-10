
type EventHandler = (data: any) => void;

export class EventManager {
  private static instance: EventManager;
  private eventMap: Map<string, EventHandler[]> = new Map();
  
  private constructor() {}
  
  public static getInstance(): EventManager {
    if (!EventManager.instance) {
      EventManager.instance = new EventManager();
    }
    return EventManager.instance;
  }
  
  public on(eventName: string, handler: EventHandler): void {
    if (!this.eventMap.has(eventName)) {
      this.eventMap.set(eventName, []);
    }
    
    this.eventMap.get(eventName)?.push(handler);
  }
  
  public off(eventName: string, handler: EventHandler): void {
    if (!this.eventMap.has(eventName)) return;
    
    const handlers = this.eventMap.get(eventName) || [];
    const index = handlers.indexOf(handler);
    
    if (index !== -1) {
      handlers.splice(index, 1);
    }
  }
  
  public emit(eventName: string, data: any): void {
    if (!this.eventMap.has(eventName)) return;
    
    const handlers = this.eventMap.get(eventName) || [];
    handlers.forEach(handler => {
      try {
        handler(data);
      } catch (error) {
        console.error(`Error in event handler for ${eventName}:`, error);
      }
    });
  }
  
  public clear(): void {
    this.eventMap.clear();
  }
}

export const eventManager = EventManager.getInstance();
