'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import React, { createContext, useContext, useMemo } from 'react';

type SupabaseContextValue = SupabaseClient;

const SupabaseContext = createContext<SupabaseContextValue | null>(null);

/**
 * Provides a shared Supabase browser client for client components.
 * Expects public URL + anon key to be set in environment variables.
 */
export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const client = useMemo(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables for the frontend.');
    }

    return createBrowserClient(supabaseUrl, supabaseAnonKey);
  }, []);

  return <SupabaseContext.Provider value={client}>{children}</SupabaseContext.Provider>;
}

export function useSupabase() {
  const client = useContext(SupabaseContext);

  if (!client) {
    throw new Error('Supabase client is not available; wrap children in SupabaseProvider.');
  }

  return client;
}
