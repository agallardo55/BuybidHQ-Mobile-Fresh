/**
 * AuthContext Tests
 * 
 * Tests for authentication context, session management, and role-based access.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import type { User, Session } from '@supabase/supabase-js';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
      refreshSession: vi.fn(),
    },
  },
}));

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual as any,
    useNavigate: () => mockNavigate,
  };
});

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    warning: vi.fn(),
    error: vi.fn(),
  },
}));

// Test component that uses auth context
const TestComponent = () => {
  const { user, session, isLoading } = useAuth();
  
  return (
    <div>
      <div data-testid="loading">{isLoading ? 'loading' : 'loaded'}</div>
      <div data-testid="user">{user ? user.email : 'no user'}</div>
      <div data-testid="session">{session ? 'has session' : 'no session'}</div>
    </div>
  );
};

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('AuthContext', () => {
  const mockUser: Partial<User> = {
    id: 'test-user-id',
    email: 'test@example.com',
    aud: 'authenticated',
    created_at: '2024-01-01T00:00:00.000Z',
    app_metadata: {
      role: 'basic',
      app_role: 'member',
    },
    user_metadata: {
      full_name: 'Test User',
    },
  };

  const mockSession: Partial<Session> = {
    user: mockUser as User,
    access_token: 'test-token',
    refresh_token: 'test-refresh-token',
    expires_at: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
    expires_in: 3600,
    token_type: 'bearer',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should initialize with loading state', () => {
    const { supabase } = require('@/integrations/supabase/client');
    
    supabase.auth.getSession.mockResolvedValue({ data: { session: null }, error: null });
    supabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { id: 'test-sub', callback: vi.fn(), unsubscribe: vi.fn() } },
    });

    renderWithRouter(<TestComponent />);

    expect(screen.getByTestId('loading')).toHaveTextContent('loading');
  });

  it('should set user and session when authenticated', async () => {
    const { supabase } = require('@/integrations/supabase/client');

    supabase.auth.getSession.mockResolvedValue({ 
      data: { session: mockSession }, 
      error: null 
    });
    supabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { id: 'test-sub', callback: vi.fn(), unsubscribe: vi.fn() } },
    });

    renderWithRouter(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('loaded');
    });

    expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
    expect(screen.getByTestId('session')).toHaveTextContent('has session');
  });

  it('should handle session expiration warning', async () => {
    const { toast } = await import('sonner');
    const { supabase } = require('@/integrations/supabase/client');

    // Session expires in 15 minutes
    const nearExpirySession = {
      ...mockSession,
      expires_at: Math.floor(Date.now() / 1000) + 900, // 15 minutes
    };

    supabase.auth.getSession.mockResolvedValue({ 
      data: { session: nearExpirySession }, 
      error: null 
    });
    supabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { id: 'test-sub', callback: vi.fn(), unsubscribe: vi.fn() } },
    });

    renderWithRouter(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('loaded');
    });

    // Fast-forward to trigger warning (5 minutes before expiry)
    act(() => {
      vi.advanceTimersByTime(5 * 60 * 1000); // 5 minutes
    });

    expect(toast.warning).toHaveBeenCalledWith(
      "Your session will expire in 10 minutes. Please save any unsaved work."
    );
  });

  it('should handle automatic session refresh', async () => {
    const { supabase } = require('@/integrations/supabase/client');

    const nearExpirySession = {
      ...mockSession,
      expires_at: Math.floor(Date.now() / 1000) + 400, // 6.67 minutes (less than 7 minutes)
    };

    supabase.auth.getSession.mockResolvedValue({ 
      data: { session: nearExpirySession }, 
      error: null 
    });

    let authStateCallback: (event: string, session: any) => void;
    supabase.auth.onAuthStateChange.mockImplementation((callback: any) => {
      authStateCallback = callback;
      return {
        data: { subscription: { id: 'test-sub', callback: vi.fn(), unsubscribe: vi.fn() } },
      };
    });

    supabase.auth.refreshSession.mockResolvedValue({
      data: { session: mockSession },
      error: null,
    });

    renderWithRouter(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('loaded');
    });

    // Trigger auth state change with near-expiry session
    act(() => {
      authStateCallback!('TOKEN_REFRESHED', nearExpirySession);
    });

    // Fast-forward to trigger refresh (1.67 minutes before expiry)
    act(() => {
      vi.advanceTimersByTime(100 * 1000); // 1.67 minutes
    });

    await waitFor(() => {
      expect(supabase.auth.refreshSession).toHaveBeenCalled();
    });
  });

  it('should handle session refresh failure', async () => {
    const { toast } = await import('sonner');
    const { supabase } = require('@/integrations/supabase/client');

    const nearExpirySession = {
      ...mockSession,
      expires_at: Math.floor(Date.now() / 1000) + 400,
    };

    supabase.auth.getSession.mockResolvedValue({ 
      data: { session: nearExpirySession }, 
      error: null 
    });

    let authStateCallback: (event: string, session: any) => void;
    supabase.auth.onAuthStateChange.mockImplementation((callback: any) => {
      authStateCallback = callback;
      return {
        data: { subscription: { id: 'test-sub', callback: vi.fn(), unsubscribe: vi.fn() } },
      };
    });

    supabase.auth.refreshSession.mockResolvedValue({
      data: { session: null },
      error: { message: 'Refresh failed', code: '', status: 0, __isAuthError: true },
    });

    renderWithRouter(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('loaded');
    });

    // Trigger auth state change and refresh failure
    act(() => {
      authStateCallback!('TOKEN_REFRESHED', nearExpirySession);
    });

    act(() => {
      vi.advanceTimersByTime(100 * 1000);
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Session refresh failed. Please sign in again."
      );
      expect(mockNavigate).toHaveBeenCalledWith('/signin');
    });
  });

  it('should throw error when used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => render(<TestComponent />)).toThrow(
      'useAuth must be used within an AuthProvider'
    );

    consoleSpy.mockRestore();
  });

  it('should cleanup timers on unmount', async () => {
    const { supabase } = require('@/integrations/supabase/client');
    const mockUnsubscribe = vi.fn();

    supabase.auth.getSession.mockResolvedValue({ 
      data: { session: mockSession }, 
      error: null 
    });
    supabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { id: 'test-sub', callback: vi.fn(), unsubscribe: mockUnsubscribe } },
    });

    const { unmount } = renderWithRouter(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('loaded');
    });

    unmount();

    expect(mockUnsubscribe).toHaveBeenCalled();
  });
});