
import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { toast } from '@/hooks/use-toast';

interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  avatar_url: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  birth_date: string | null;
  created_at: string;
  updated_at: string;
}

interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  created_at: string;
}

type AuthContextType = {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  notifications: Notification[];
  unreadCount: number;
  isAdmin: boolean;
  isCustomer: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  signUp: (email: string, password: string, userData: Partial<UserProfile>) => Promise<{ error: any | null }>;
  signIn: (email: string, password: string) => Promise<{ error: any | null }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<{ error: any | null }>;
  refreshProfile: () => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCustomer, setIsCustomer] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  // Computed properties
  const isAuthenticated = !!user;
  const unreadCount = notifications.filter(n => !n.read).length;

  // Load initial session and set up auth state change listener
  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      
      try {
        // Check for existing session
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error getting session:", error);
          throw error;
        }
        
        console.log("Initial session check:", data?.session?.user?.id || "No session");
        
        if (data.session?.user) {
          setUser(data.session.user);
          setSession(data.session);
          await checkUserType(data.session.user.id);
          await fetchUserProfile(data.session.user.id);
          await fetchNotifications(data.session.user.id);
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        toast({
          variant: "destructive",
          title: "Erro ao carregar sessão",
          description: "Houve um problema ao carregar sua sessão. Por favor, tente novamente.",
        });
      } finally {
        setIsLoading(false);
        setAuthChecked(true);
      }
    };
    
    initialize();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.id || "No session");
      
      if (session?.user) {
        setUser(session.user);
        setSession(session);
        
        if (event === 'SIGNED_IN') {
          await checkUserType(session.user.id);
          await fetchUserProfile(session.user.id);
          await fetchNotifications(session.user.id);
        } else if (event === 'USER_UPDATED') {
          // Just update the user object
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setSession(null);
        setProfile(null);
        setNotifications([]);
        setIsAdmin(false);
        setIsCustomer(false);
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  // Check if user is admin or customer
  const checkUserType = async (userId: string) => {
    try {
      // Check if admin
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('role')
        .eq('id', userId)
        .single();
      
      if (adminError && adminError.code !== 'PGRST116') {
        console.error("Error checking admin status:", adminError);
      }
      
      setIsAdmin(!!adminData);
      
      // Check if customer
      const { data: customerData, error: customerError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id', userId)
        .single();
      
      if (customerError && customerError.code !== 'PGRST116') {
        console.error("Error checking customer status:", customerError);
      }
      
      setIsCustomer(!!customerData);
      
      console.log("User type checked:", { isAdmin: !!adminData, isCustomer: !!customerData });
    } catch (error) {
      console.error("Error checking user type:", error);
    }
  };
  
  // Fetch user profile data
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user profile:', error);
        return;
      }
      
      if (data) {
        setProfile(data as UserProfile);
        console.log("Profile fetched:", data);
      }
    } catch (error) {
      console.error("Error in fetchUserProfile:", error);
    }
  };
  
  // Fetch user notifications
  const fetchNotifications = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) {
        console.error('Error fetching notifications:', error);
        return;
      }
      
      setNotifications(data as Notification[]);
    } catch (error) {
      console.error("Error in fetchNotifications:", error);
    }
  };
  
  // Sign up new user
  const signUp = async (email: string, password: string, userData: Partial<UserProfile>) => {
    try {
      // 1. First create the user in auth.users
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: userData.name
          }
        }
      });
      
      if (error) return { error };
      
      if (data.user) {
        try {
          // 2. Try to create profile after the user is created
          const { error: profileError } = await supabase
            .from('user_profiles')
            .insert({
              id: data.user.id,
              email: email,
              name: userData.name,
              phone: userData.phone || null,
              address: userData.address || null,
              city: userData.city || null,
              state: userData.state || null,
              postal_code: userData.postal_code || null,
              birth_date: userData.birth_date || null,
            });
          
          if (profileError) {
            console.error("Profile creation error:", profileError);
            // Don't return the error, just log it, as the user is created successfully
          }
        } catch (profileCreationError) {
          console.error("Error in profile creation:", profileCreationError);
          // We don't throw here because the auth user was created successfully
        }
      }
      
      return { error: null };
    } catch (error) {
      console.error("Sign up process error:", error);
      return { error };
    }
  };
  
  // Sign in user
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (!error && data.session) {
        // Store session in memory
        setUser(data.user);
        setSession(data.session);
        await checkUserType(data.user.id);
        await fetchUserProfile(data.user.id);
        await fetchNotifications(data.user.id);
      }
      
      return { error };
    } catch (error) {
      return { error };
    }
  };
  
  // Sign out user
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error);
      toast({
        variant: "destructive",
        title: "Erro ao sair",
        description: "Houve um problema ao fazer logout. Por favor, tente novamente.",
      });
    } else {
      setUser(null);
      setSession(null);
      setProfile(null);
      setNotifications([]);
      setIsAdmin(false);
      setIsCustomer(false);
    }
  };
  
  // Update user profile
  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user || !profile) return { error: new Error('No user logged in') };
    
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update(data)
        .eq('id', user.id);
      
      if (!error) {
        await fetchUserProfile(user.id);
      }
      
      return { error };
    } catch (error) {
      return { error };
    }
  };
  
  // Refresh user profile data
  const refreshProfile = async () => {
    if (!user) return;
    await fetchUserProfile(user.id);
  };
  
  // Mark notification as read
  const markNotificationAsRead = async (id: string) => {
    if (!user) return;
    
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id)
      .eq('user_id', user.id);
    
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };
  
  // Mark all notifications as read
  const markAllNotificationsAsRead = async () => {
    if (!user) return;
    
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false);
    
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };
  
  // Refresh notifications
  const refreshNotifications = async () => {
    if (!user) return;
    await fetchNotifications(user.id);
  };
  
  const value = {
    user,
    session,
    profile,
    notifications,
    unreadCount,
    isAdmin,
    isCustomer,
    isAuthenticated,
    isLoading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    refreshProfile,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    refreshNotifications
  };
  
  // Only render children once we've checked authentication status
  if (!authChecked && isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-purple border-t-transparent"></div>
      </div>
    );
  }
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
