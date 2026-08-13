'use client';

import * as React from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = React.useState(false);

  React.useEffect(() => {
    const mql = window.matchMedia(query);

    setMatches(mql.matches);

    function onChange(event: MediaQueryListEvent) {
      setMatches(event.matches);
    }

    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}
