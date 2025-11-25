import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from 'sonner@2.0.3';
import { motion } from 'motion/react';
import { User, Mail, Lock, Sparkles, Heart } from 'lucide-react';

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (userData?: any) => void;
  mode?: 'user' | 'admin';
}

// Secure admin password - only for authorized personnel
const ADMIN_PASSWORD = 'Sensual2025Kenya!#Pink';

export function AuthDialog({ open, onOpenChange, onSuccess, mode = 'user' }: AuthDialogProps) {
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  
  // User registration/login fields
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [userPassword, setUserPassword] = useState('');

  // Admin login handler - simplified with auto Supabase setup
  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Verify the password
      if (password !== ADMIN_PASSWORD) {
        toast.error('Invalid admin password');
        setPassword('');
        setLoading(false);
        return;
      }

      // Get or create Supabase admin session
      const { createClient } = await import('../utils/supabase/client');
      const { projectId, publicAnonKey } = await import('../utils/supabase/info');
      const supabase = createClient();
      
      let adminToken: string | null = null;
      
      // First, try to sign in
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: 'admin@sensualkenya.co.ke',
        password: password,
      });

      if (!signInError && signInData.session) {
        // Successfully signed in
        adminToken = signInData.session.access_token;
      } else {
        // Need to create account - call server signup endpoint
        try {
          const signupRes = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-afd25991/signup`,
            {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${publicAnonKey}`
              },
              body: JSON.stringify({
                email: 'admin@sensualkenya.co.ke',
                password: password,
                name: 'Sensual Kenya Admin'
              })
            }
          );

          if (signupRes.ok) {
            // Account created, now sign in
            const { data: newSignInData, error: newSignInError } = await supabase.auth.signInWithPassword({
              email: 'admin@sensualkenya.co.ke',
              password: password,
            });
            
            if (newSignInError) {
              console.error('Sign in after signup error:', newSignInError);
              throw new Error('Account created but sign in failed. Please try logging in again.');
            }
            
            adminToken = newSignInData.session?.access_token || null;
          } else {
            // Signup failed - account might already exist, try signing in again
            const signupError = await signupRes.text();
            console.log('Signup response:', signupError);
            
            // Try one more sign in attempt
            const { data: retryData, error: retryError } = await supabase.auth.signInWithPassword({
              email: 'admin@sensualkenya.co.ke',
              password: password,
            });
            
            if (retryError) {
              console.error('Retry sign in error:', retryError);
              throw new Error('Unable to authenticate. Please check your password and try again.');
            }
            
            adminToken = retryData.session?.access_token || null;
          }
        } catch (fetchError) {
          console.error('Network error during signup:', fetchError);
          throw new Error('Network error. Please check your connection and try again.');
        }
      }

      if (!adminToken) {
        throw new Error('Failed to obtain admin access. Please try again.');
      }

      // Store token and proceed
      localStorage.setItem('sensual-kenya-admin', adminToken);
      toast.success('Admin login successful! Redirecting...');
      
      setPassword('');
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      console.error('Admin auth error:', error);
      toast.error(error.message || 'Login failed. Please try again.');
      setPassword('');
    } finally {
      setLoading(false);
    }
  };

  // User registration handler
  const handleUserRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create user account (store in localStorage for demo)
      const userData = {
        email,
        name,
        createdAt: Date.now(),
        token: btoa(`user:${email}:${Date.now()}`)
      };
      
      // Store user data
      localStorage.setItem('sensual-kenya-user', JSON.stringify(userData));
      localStorage.setItem('sensual-kenya-user-token', userData.token);
      
      toast.success(`Welcome, ${name}! Your account has been created.`);
      
      // Reset form
      setEmail('');
      setName('');
      setUserPassword('');
      
      onOpenChange(false);
      onSuccess(userData);
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // User login handler
  const handleUserLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Check if user exists (demo - just check localStorage)
      const storedUser = localStorage.getItem('sensual-kenya-user');
      
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        
        if (userData.email === email) {
          // Update token
          const newToken = btoa(`user:${email}:${Date.now()}`);
          userData.token = newToken;
          
          localStorage.setItem('sensual-kenya-user', JSON.stringify(userData));
          localStorage.setItem('sensual-kenya-user-token', newToken);
          
          toast.success(`Welcome back, ${userData.name}!`);
          
          setEmail('');
          setUserPassword('');
          
          onOpenChange(false);
          onSuccess(userData);
        } else {
          throw new Error('Invalid email or password. Please check your credentials.');
        }
      } else {
        // No user found - gracefully redirect to registration without throwing error
        toast.error('No account found with this email. Please register first!', {
          duration: 4000,
        });
        
        // Auto-switch to register tab after a brief delay
        setTimeout(() => {
          const registerTab = document.querySelector('[value="register"]') as HTMLButtonElement;
          if (registerTab) {
            registerTab.click();
          }
        }, 1000);
        
        // Return early to prevent error logging
        setLoading(false);
        return;
      }
    } catch (error: any) {
      // Only log actual authentication errors
      console.error('Login error:', error);
      toast.error(error.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (mode === 'admin') {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              Admin Login
            </DialogTitle>
            <DialogDescription>
              Authorized personnel only. Enter admin password to access the management panel.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAdminSubmit} className="space-y-4">
            <div>
              <Label>Admin Password</Label>
              <Input
                type="password"
                placeholder="Enter your admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoFocus
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Verifying...' : 'Access Admin Panel'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="mx-auto mb-2"
          >
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-pink-400 flex items-center justify-center">
              <Heart className="h-6 w-6 text-white fill-white" />
            </div>
          </motion.div>
          <DialogTitle className="text-center">Welcome to Sensual Kenya</DialogTitle>
          <DialogDescription className="text-center">
            Create an account or login to access your dashboard, post blogs, and view your orders.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4 mt-4">
            <form onSubmit={handleUserLogin} className="space-y-4">
              <div>
                <Label className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary" />
                  Email
                </Label>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div>
                <Label className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-primary" />
                  Password
                </Label>
                <Input
                  type="password"
                  placeholder="Enter your password"
                  value={userPassword}
                  onChange={(e) => setUserPassword(e.target.value)}
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full gap-2" 
                disabled={loading}
                style={{
                  background: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)',
                }}
              >
                {loading ? 'Logging in...' : (
                  <>
                    <User className="h-4 w-4" />
                    Login to Account
                  </>
                )}
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Don't have an account? Switch to the Register tab above.
              </p>
            </form>
          </TabsContent>

          <TabsContent value="register" className="space-y-4 mt-4">
            <form onSubmit={handleUserRegister} className="space-y-4">
              <div>
                <Label className="flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  Nickname
                </Label>
                <Input
                  type="text"
                  placeholder="What should we call you?"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary" />
                  Email
                </Label>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-primary" />
                  Password
                </Label>
                <Input
                  type="password"
                  placeholder="Create a password"
                  value={userPassword}
                  onChange={(e) => setUserPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <Button 
                type="submit" 
                className="w-full gap-2" 
                disabled={loading}
                style={{
                  background: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)',
                }}
              >
                {loading ? 'Creating Account...' : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Create Account
                  </>
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <p className="text-xs text-center text-muted-foreground mt-4">
          By creating an account, you agree to our terms of service and privacy policy.
        </p>
      </DialogContent>
    </Dialog>
  );
}
