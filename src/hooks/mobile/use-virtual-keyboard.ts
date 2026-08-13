'use client';

import * as React from 'react';

const KEYBOARD_THRESHOLD = 100;

export interface VirtualKeyboardState {
  keyboardOpen: boolean;
  keyboardHeight: number;
}

const SSR_STATE: VirtualKeyboardState = {
  keyboardOpen: false,
  keyboardHeight: 0,
};

export function useVirtualKeyboard(): VirtualKeyboardState {
  const [state, setState] =
    React.useState<VirtualKeyboardState>(SSR_STATE);

  React.useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    const initialHeight = window.innerHeight;

    function handleResize() {
      const currentHeight = vv!.height;
      const diff = Math.max(0, Math.round(initialHeight - currentHeight));
      setState({
        keyboardOpen: diff > KEYBOARD_THRESHOLD,
        keyboardHeight: diff,
      });
    }

    vv.addEventListener('resize', handleResize);
    return () => vv.removeEventListener('resize', handleResize);
  }, []);

  return state;
}
