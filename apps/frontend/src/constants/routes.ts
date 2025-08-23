import type { ComponentType } from 'react';

// Define route types
export interface RouteConfig {
  path: string;
  component: ComponentType<Record<string, unknown>>;
  exact?: boolean;
  requiresAuth?: boolean;
}