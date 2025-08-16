import Fuse, { type FuseOptionKey } from 'fuse.js';
import { useEffect, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';

export const useSearch = <T>(
  data: T[],
  options: {
    keys: (keyof T)[];
    threshold: number;
  }
) => {
  const [results, setResults] = useState(data);

  useEffect(() => {
    setResults(data);
  }, [data]);

  const fuse = new Fuse(data, {
    keys: options.keys as FuseOptionKey<T>[],
    threshold: options.threshold,
  });

  const debouncedSearch = useDebouncedCallback((query: string) => {
    if (query.length > 0) {
      const results = fuse.search(query);
      setResults(results.map((result) => result.item));
    } else {
      setResults(data);
    }
  }, 500);

  return {
    search: debouncedSearch,
    results,
  };
};
