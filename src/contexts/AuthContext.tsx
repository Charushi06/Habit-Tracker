import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase, Profile } from "../lib/supabase";
import { getBrowserTimeZone } from "../utils/timeUtils";

type AuthContextType = {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  updateTimezone: (timezone: string, manual: boolean) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state change:", event, { user: !!session?.user });
      (async () => {
        setUser(session?.user ?? null);
        if (session?.user) {
          await loadProfile(session.user.id);
        } else {
          setProfile(null);
          setLoading(false);
        }
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  async function loadProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error) throw error;
      setProfile(data);

      // Store theme in localStorage for immediate access
      if (data?.theme) {
        if (typeof window !== "undefined") {
          localStorage.setItem("theme", data.theme);
          // Dispatch custom event to notify ThemeContext of theme change
          window.dispatchEvent(
            new CustomEvent("themeChange", { detail: data.theme })
          );
        }
      }

      // Auto-detect timezone if not set or not manually overridden
      const browserTz = getBrowserTimeZone();
      if (data) {
        const shouldAutoSet = !data.timezone || data.timezone_manual === false;
        if (shouldAutoSet && data.timezone !== browserTz) {
          try {
            await supabase.from('profiles').update({ timezone: browserTz, timezone_manual: false }).eq('id', userId);
            setProfile({ ...data, timezone: browserTz, timezone_manual: false });
          } catch (e) {
            console.warn('Failed to auto-set timezone:', e);
          }
        }
        if (typeof window !== 'undefined') {
          localStorage.setItem('timezone', data.timezone || browserTz);
          localStorage.setItem('timezone_manual', String(!!data.timezone_manual));
        }
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  }

  async function signUp(email: string, password: string, fullName: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) throw error;

    if (data.user) {
      console.log("Creating profile for user:", data.user.id);
      const { error: profileError } = await supabase.from("profiles").insert({
        id: data.user.id,
        email: data.user.email!,
        full_name: fullName,
        theme: "light",
      });

      if (profileError) {
        console.error("Profile creation error:", profileError);
        throw profileError;
      }

      console.log("Profile created successfully");
      console.log("Auto-signing in user after signup...");
      await signIn(email, password);
    }
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    console.log("Sign in successful");
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  async function signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        queryParams: {
          access_type: 'offline',
          prompt: 'select_account',
        },
      },
    });
    if (error) throw error;
  }

  async function updateProfile(updates: Partial<Profile>) {
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id);

    if (error) throw error;

    if (profile) {
      setProfile({ ...profile, ...updates });
    }

    // If theme was updated, save to localStorage and dispatch event
    if (updates.theme && typeof window !== "undefined") {
      localStorage.setItem("theme", updates.theme);
      window.dispatchEvent(
        new CustomEvent("themeChange", { detail: updates.theme })
      );
    }
  }

  async function updateTimezone(timezone: string, manual: boolean) {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ timezone, timezone_manual: manual })
        .eq('id', user.id);
      if (error) throw error;
      if (profile) setProfile({ ...profile, timezone, timezone_manual: manual });
      if (typeof window !== 'undefined') {
        localStorage.setItem('timezone', timezone);
        localStorage.setItem('timezone_manual', String(manual));
      }
    } catch (e) {
      console.error('Failed to update timezone:', e);
      throw e;
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, signUp, signIn, signOut, signInWithGoogle, updateProfile, updateTimezone }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
