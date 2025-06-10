
export type UIEvent = 
  | { type: 'LAYOUT_CHANGED'; payload: any }
  | { type: 'THEME_CHANGED'; payload: any }
  | { type: 'COMPONENT_MOUNTED'; payload: any }
  | { type: 'COMPONENT_UNMOUNTED'; payload: any }
  | { type: 'COGNITIVE_UI_CHANGED'; payload: any }
  | { type: 'NAVIGATION_CHANGED'; payload: any }
  | { type: 'COUNTER_UPDATED'; payload: any };
