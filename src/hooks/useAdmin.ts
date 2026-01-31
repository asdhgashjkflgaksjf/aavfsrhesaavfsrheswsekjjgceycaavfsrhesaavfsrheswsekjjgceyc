import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

interface AdminState {
  user: User | null;
  isAdmin: boolean;
  isLoading: boolean;
  error: string | null;
}

export const useAdmin = () => {
  const [state, setState] = useState<AdminState>({
    user: null,
    isAdmin: false,
    isLoading: true,
    error: null
  });

  const checkAdminRole = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .maybeSingle();

      if (error) {
        console.error('Error checking admin role:', error);
        return false;
      }

      return !!data;
    } catch (err) {
      console.error('Error checking admin role:', err);
      return false;
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          if (isMounted) {
            setState({
              user: null,
              isAdmin: false,
              isLoading: false,
              error: error.message
            });
          }
          return;
        }
        
        if (session?.user) {
          const isAdmin = await checkAdminRole(session.user.id);
          if (isMounted) {
            setState({
              user: session.user,
              isAdmin,
              isLoading: false,
              error: null
            });
          }
        } else {
          if (isMounted) {
            setState({
              user: null,
              isAdmin: false,
              isLoading: false,
              error: null
            });
          }
        }
      } catch (err: any) {
        console.error('Auth check error:', err);
        if (isMounted) {
          setState({
            user: null,
            isAdmin: false,
            isLoading: false,
            error: err?.message || 'Failed to check authentication'
          });
        }
      }
    };

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Synchronous state update only
      if (session?.user) {
        if (isMounted) {
          setState(prev => ({
            ...prev,
            user: session.user,
            isLoading: true
          }));
        }
        // Defer admin check with setTimeout to avoid deadlock
        setTimeout(async () => {
          const isAdmin = await checkAdminRole(session.user.id);
          if (isMounted) {
            setState({
              user: session.user,
              isAdmin,
              isLoading: false,
              error: null
            });
          }
        }, 0);
      } else {
        if (isMounted) {
          setState({
            user: null,
            isAdmin: false,
            isLoading: false,
            error: null
          });
        }
      }
    });

    // THEN check for existing session
    checkAuth();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [checkAdminRole]);

  const signIn = async (email: string, password: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      setState(prev => ({ ...prev, isLoading: false, error: error.message }));
      return { error };
    }

    return { data };
  };

  const signUp = async (email: string, password: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });

    if (error) {
      setState(prev => ({ ...prev, isLoading: false, error: error.message }));
      return { error };
    }

    return { data };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setState({
      user: null,
      isAdmin: false,
      isLoading: false,
      error: null
    });
  };

  return {
    ...state,
    signIn,
    signUp,
    signOut
  };
};
