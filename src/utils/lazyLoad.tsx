import React, { ComponentType, lazy, Suspense } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function lazyLoad<T = any>(
  importFunc: () => Promise<{ default: ComponentType<T> }>
): ComponentType<T> {
  const LazyComponent = lazy(importFunc);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function WrappedComponent(props: T) {
    return (
      <Suspense fallback={<div>Loading...</div>}>
        <LazyComponent {...(props as any)} />
      </Suspense>
    );
  };
}