/**
 * List of routes that require authentication
 */
export const PROTECTED_ROUTES = [
  '/predictions',
  '/dashboard',
  '/profile',
  '/settings'
];

/**
 * Check if a route requires authentication
 * @param pathname - The pathname to check
 * @returns true if the route requires authentication
 */
export function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(route => pathname.startsWith(route));
}

/**
 * Get the redirect URL after successful authentication
 * @param pathname - The current pathname
 * @returns The URL to redirect to after auth, or null if no redirect needed
 */
export function getAuthRedirectUrl(pathname: string): string | null {
  if (isProtectedRoute(pathname)) {
    return pathname;
  }
  return null;
}
