'use client';

import * as React from 'react';

export interface OrientationState {
  portrait: boolean;
  landscape: boolean;
  angle: number;
}

const SSR_STATE: OrientationState = {
  portrait: false,
  landscape: true,
  angle: 0,
};

export function useOrientation(): OrientationState {
  const [orientation, setOrientation] =
    React.useState<OrientationState>(SSR_STATE);

  React.useEffect(() => {
    function update() {
      const type = screen?.orientation?.type ?? '';
      const angle = screen?.orientation?.angle ?? 0;
      const portrait =
        type.startsWith('portrait') || window.innerHeight > window.innerWidth;

      setOrientation({
        portrait,
        landscape: !portrait,
        angle,
      });
    }

    update();

    window.addEventListener('orientationchange', update);
    screen?.orientation?.addEventListener('change', update);

    return () => {
      window.removeEventListener('orientationchange', update);
      screen?.orientation?.removeEventListener('change', update);
    };
  }, []);

  return orientation;
}
