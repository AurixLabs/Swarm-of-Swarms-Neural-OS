
import { BrowserEventEmitter } from '../BrowserEventEmitter';

// Define search history specific event types
export type SearchHistoryEvent = 
  | { type: 'SEARCH_ADDED'; payload: any }
  | { type: 'FOLDER_CREATED'; payload: any }
  | { type: 'FOLDER_UPDATED'; payload: any }
  | { type: 'FOLDER_DELETED'; payload: any }
  | { type: 'ACTIVE_FOLDER_CHANGED'; payload: any }
  | { type: 'RECENT_SEARCHES_CLEARED'; payload: any }
  | { type: 'DATA_UPDATED'; payload: any };

// Specialized event bus for search history communication
export class SearchHistoryEventBus extends BrowserEventEmitter {
  emitEvent<T extends SearchHistoryEvent>(event: T) {
    this.emit(event.type, event.payload);
    return event;
  }
  
  onEvent<T extends SearchHistoryEvent>(eventType: T['type'], handler: (payload: any) => void) {
    this.on(eventType, handler);
    return () => this.off(eventType, handler);
  }
}

// Export a singleton instance for the application to use
export const searchHistoryEvents = new SearchHistoryEventBus();
