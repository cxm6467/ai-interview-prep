import { ComponentType, lazy, Suspense } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function lazyLoad<T = any>(
  importFunc: () => Promise<{ default: ComponentType<T> }>
): ComponentType<T> {
  const LazyComponent = lazy(importFunc);

  return function WrappedComponent(props: T) {
    return (
      <Suspense fallback={<div>Loading...</div>}>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <LazyComponent {...(props as any)} />
      </Suspense>
    );
  };
}