import React, { lazy, ComponentType, LazyExoticComponent } from "react";

/**
 * Utility for creating lazy-loaded components with better error handling
 */
export const createLazyComponent = <T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: ComponentType
): LazyExoticComponent<T> => {
  return lazy(async () => {
    try {
      const module = await importFn();
      return module;
    } catch (error) {
      console.error("Failed to load component:", error);

      // Return a fallback component if loading fails
      if (fallback) {
        return { default: fallback as T };
      }

      // Re-throw the error if no fallback is provided
      throw error;
    }
  });
};

/**
 * Higher-order component for adding loading states to lazy components
 */
export const withLoadingState = <P extends object>(
  Component: ComponentType<P>,
  LoadingComponent?: ComponentType
) => {
  return (props: P) => {
    const Loading = LoadingComponent || (() => <div>Loading...</div>);

    return (
      <React.Suspense fallback={<Loading />}>
        <Component {...props} />
      </React.Suspense>
    );
  };
};

/**
 * Preload a lazy component to improve perceived performance
 */
export const preloadComponent = (
  lazyComponent: LazyExoticComponent<any>
): Promise<void> => {
  // Access the _payload to trigger the import
  const componentImport = (lazyComponent as any)._payload;

  if (componentImport && typeof componentImport._result === "undefined") {
    return componentImport._result;
  }

  return Promise.resolve();
};

/**
 * Create a lazy component with preloading capability
 */
export const createPreloadableLazyComponent = <T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>
) => {
  const LazyComponent = createLazyComponent(importFn);

  // Add preload method to the lazy component
  (LazyComponent as any).preload = () => importFn();

  return LazyComponent;
};
