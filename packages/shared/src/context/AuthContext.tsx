import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import type { AuthChangeEvent, Session, User } from "@supabase/supabase-js";
import type { DBUser } from "@/types";

interface AuthContextType {
  user: User | null;
  dbUser: DBUser | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  dbUser: null,
  isLoading: true,
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [dbUser, setDbUser] = useState<DBUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDbUser = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (!error && data) {
        if (data.is_active === false) {
          toast.error("Your account has been suspended by an administrator.");
          await supabase.auth.signOut();
          setUser(null);
          setDbUser(null);
        } else {
          setDbUser(data as DBUser);
        }
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Check active sessions
    supabase.auth
      .getSession()
      .then(({ data: { session } }: { data: { session: Session | null } }) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchDbUser(session.user.id);
        } else {
          setIsLoading(false);
        }
      });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchDbUser(session.user.id);
        } else {
          setDbUser(null);
          setIsLoading(false);
        }
      },
    );

    return () => subscription.unsubscribe();
  }, [fetchDbUser]);

  useEffect(() => {
    let hasSignedOut = false;

    const signOutOnLeave = () => {
      if (hasSignedOut) return;
      hasSignedOut = true;
      void supabase.auth.signOut();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        signOutOnLeave();
      }
    };

    window.addEventListener("pagehide", signOutOnLeave);
    window.addEventListener("beforeunload", signOutOnLeave);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("pagehide", signOutOnLeave);
      window.removeEventListener("beforeunload", signOutOnLeave);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    const idleTimeoutMs = 15 * 60 * 1000;
    const warningOffsetMs = 2 * 60 * 1000;
    const idleTimerRef = { current: null as number | null };
    const warningTimerRef = { current: null as number | null };

    const clearIdleTimer = () => {
      if (idleTimerRef.current !== null) {
        window.clearTimeout(idleTimerRef.current);
        idleTimerRef.current = null;
      }
      if (warningTimerRef.current !== null) {
        window.clearTimeout(warningTimerRef.current);
        warningTimerRef.current = null;
      }
    };

    const startIdleTimer = () => {
      clearIdleTimer();
      warningTimerRef.current = window.setTimeout(() => {
        toast.message("Session expiring", {
          description: "You will be signed out in 1 minute due to inactivity.",
          action: {
            label: "Stay signed in",
            onClick: () => startIdleTimer(),
          },
        });
      }, Math.max(0, idleTimeoutMs - warningOffsetMs));
      idleTimerRef.current = window.setTimeout(() => {
        if (user) {
          void supabase.auth.signOut();
        }
      }, idleTimeoutMs);
    };

    if (!user) {
      clearIdleTimer();
      return;
    }

    startIdleTimer();

    const resetIdleTimer = () => startIdleTimer();
    const events = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"] as const;

    events.forEach((eventName) => {
      window.addEventListener(eventName, resetIdleTimer, { passive: true });
    });

    return () => {
      events.forEach((eventName) => {
        window.removeEventListener(eventName, resetIdleTimer);
      });
      clearIdleTimer();
    };
  }, [user]);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, dbUser, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
