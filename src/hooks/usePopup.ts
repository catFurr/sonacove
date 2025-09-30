import { useState, useEffect } from 'react';
import popupService, { type PopupState } from '../utils/popupService';

/**
 * A custom hook that provides the current popup state and a function to hide it.
 * It handles subscribing and unsubscribing to the global `popupService`.
 *
 * @returns {object} An object containing the current popup state and a hidePopup function.
 * @property {PopupState} popup - The current state of the popup (message and type).
 * @property {() => void} hidePopup - A function to call to hide the currently displayed popup.
 */
export const usePopup = () => {
  /** State to hold the popup's message, type and duration, synced with the popupService. */
  const [popup, setPopup] = useState<PopupState>({
    message: null,
    type: 'info',
    duration: 3000
  });

  useEffect(() => {
    const unsubscribe = popupService.subscribe(setPopup);

    return unsubscribe;
  }, []);

  return {
    popup,
    hidePopup: popupService.hide.bind(popupService),
  };
};
