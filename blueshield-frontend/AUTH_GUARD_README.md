# Authentication Guard Implementation

## Overview
Implemented a comprehensive authentication guard system to protect routes and ensure users must be authenticated to access certain pages like the microplastic predictions page.

## Components Created

### 1. AuthGuard.tsx
- **Purpose**: Wraps protected content and shows authentication UI when user is not logged in
- **Features**:
  - Loading state while checking authentication
  - Fallback UI for unauthenticated users
  - Automatic auth modal trigger
  - "Go Back" functionality

### 2. withAuth.tsx (HOC)
- **Purpose**: Higher-order component for easier route protection
- **Usage**: `const ProtectedComponent = withAuth(MyComponent)`
- **Benefits**: Reusable pattern for protecting any component

### 3. auth.ts (Utilities)
- **Purpose**: Utility functions for route protection logic
- **Features**:
  - `isProtectedRoute()` - Check if route requires auth
  - `getAuthRedirectUrl()` - Get redirect URL after auth
  - Centralized list of protected routes

## Updated Components

### 1. AuthContext.tsx
- **Added**: `redirectUrl` state and functionality
- **Enhanced**: `openAuthModal()` now accepts optional redirect URL
- **Behavior**: After successful login, redirects to intended URL

### 2. Header.tsx
- **Enhanced**: Navigation links now check if route is protected
- **Behavior**: 
  - If user clicks protected route while unauthenticated → shows auth modal
  - Passes intended URL to auth modal for redirect after login
  - Works for both desktop and mobile navigation

### 3. PredictionsPage.tsx
- **Wrapped**: Entire page content with `<AuthGuard>`
- **Result**: Page is now fully protected and requires authentication

## Protected Routes
Currently protected routes (defined in `auth.ts`):
- `/predictions` - Microplastic prediction page
- `/dashboard` - User dashboard (future)
- `/profile` - User profile (future)
- `/settings` - User settings (future)

## User Flow

### Unauthenticated User
1. User clicks "Predictions" in navigation
2. Auth modal opens immediately
3. User signs in/up
4. After successful authentication, user is redirected to `/predictions`
5. User can now access the protected content

### Direct URL Access
1. User tries to access `/predictions` directly
2. AuthGuard detects unauthenticated state
3. Shows authentication required screen
4. User can click "Sign In / Sign Up" to open auth modal
5. After auth, user is redirected to the intended page

### Authenticated User
1. User clicks "Predictions" in navigation
2. User is taken directly to `/predictions`
3. No authentication prompts

## Technical Details

### Authentication Check
- Uses `useAuth()` hook to check authentication state
- Handles loading states during auth verification
- Graceful error handling for auth failures

### Redirect Logic
- Stores intended URL when auth modal is opened
- Redirects after successful login/registration
- Clears redirect URL when modal is closed

### Route Protection
- Centralized list of protected routes
- Easy to add new protected routes
- Type-safe route checking

## Usage Examples

### Protecting a New Page
```tsx
// Option 1: Wrap with AuthGuard
<AuthGuard>
  <MyProtectedPage />
</AuthGuard>

// Option 2: Use withAuth HOC
const ProtectedMyPage = withAuth(MyPage);
```

### Adding New Protected Route
```typescript
// In auth.ts
export const PROTECTED_ROUTES = [
  '/predictions',
  '/dashboard',
  '/profile',
  '/settings',
  '/new-protected-route' // Add here
];
```

## Benefits
- **Security**: Prevents unauthorized access to protected content
- **UX**: Smooth authentication flow with redirects
- **Maintainable**: Centralized auth logic
- **Flexible**: Easy to add/remove protected routes
- **Type-safe**: Full TypeScript support
