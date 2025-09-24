export type PopupType = 'error' | 'success' | 'info';

export interface PopupState {
  message: string | null;
  type: PopupType;
  duration?: number;
}

class PopupService {
  private listeners: Set<(state: PopupState) => void> = new Set();
  private currentState: PopupState = { message: null, type: 'info', duration: 3000 };

  subscribe(listener: (state: PopupState) => void): () => void {
    this.listeners.add(listener);
    listener(this.currentState);
    // Return an unsubscribe function for cleanup
    return () => this.listeners.delete(listener);
  }

  // This is the function that any component can call to show a popup.
  show(message: string, type: PopupType = 'info', duration?: number) {
    this.currentState = { message, type, duration: duration };
    this.listeners.forEach((listener) => listener(this.currentState));
  }

  // A function to hide the popup.
  hide() {
    this.currentState = { ...this.currentState, message: null };
    this.listeners.forEach((listener) => listener(this.currentState));
  }
}

// We export a single instance so the whole app shares it.
const popupService = new PopupService();

export const showPopup = popupService.show.bind(popupService);

export default popupService;
