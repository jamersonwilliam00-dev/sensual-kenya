import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Navbar } from './components/Navbar';
import { HomePage } from './components/HomePage';
import { StorePage } from './components/StorePage';
import { CartPage } from './components/CartPage';
import { BlogPage } from './components/BlogPage';
import { ContactPage } from './components/ContactPage';
import { AdminPanel } from './components/AdminPanel';
import { AuthDialog } from './components/AuthDialog';
import { ProductDetailPage } from './components/ProductDetailPage';
import { CheckoutPage } from './components/CheckoutPage';
import { UserDashboard } from './components/UserDashboard';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner@2.0.3';
import { MessageCircle, Heart, Star, Sparkles, Package, Shield } from 'lucide-react';
import { Button } from './components/ui/button';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  category: string;
  store: string;
}

interface UserData {
  email: string;
  name: string;
  createdAt: number;
  token: string;
  role?: string;
}

// 🔒 SECURITY: Secret admin panel URL path
// Access admin by typing: yourdomain.com/#/internal-mgmt-portal-sk2025
const SECRET_ADMIN_PATH = 'internal-mgmt-portal-sk2025';

export default function App() {
  const [currentSection, setCurrentSection] = useState('home');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [checkoutProduct, setCheckoutProduct] = useState<any>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isDark, setIsDark] = useState(true);
  
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'user' | 'admin'>('user');

  // 🔒 Listen for URL hash changes to detect secret admin URL
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(2); // Remove "#/" prefix
      
      if (hash === SECRET_ADMIN_PATH) {
        // Admin panel URL detected
        if (adminToken) {
          setCurrentSection('admin-panel');
        } else {
          // Not logged in, show admin auth
          setAuthMode('admin');
          setShowAuth(true);
        }
      }
    };

    // Check on initial load
    handleHashChange();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [adminToken]);

  useEffect(() => {
    // Check for existing admin session
    const storedAdminToken = localStorage.getItem('sensual-kenya-admin');
    if (storedAdminToken) {
      verifyAdminToken(storedAdminToken);
    }

    // Check for existing user session
    const storedUser = localStorage.getItem('sensual-kenya-user');
    const storedToken = localStorage.getItem('sensual-kenya-user-token');
    if (storedUser && storedToken) {
      try {
        const user = JSON.parse(storedUser);
        setUserData(user);
      } catch (error) {
        console.error('Error loading user session:', error);
        localStorage.removeItem('sensual-kenya-user');
        localStorage.removeItem('sensual-kenya-user-token');
      }
    }
    
    // Load cart from localStorage
    const savedCart = localStorage.getItem('sensual-kenya-cart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  // 🔒 Verify admin token with backend
  const verifyAdminToken = async (token: string) => {
    try {
      const response = await fetch('https://omdutoyvodowjsdnaqfm.supabase.co/functions/v1/make-server-afd25991/analytics/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setAdminToken(token);
      } else {
        localStorage.removeItem('sensual-kenya-admin');
        setAdminToken(null);
      }
    } catch (error) {
      console.error('Error verifying admin token:', error);
      localStorage.removeItem('sensual-kenya-admin');
      setAdminToken(null);
    }
  };

  useEffect(() => {
    localStorage.setItem('sensual-kenya-cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const handleAddToCart = (product: any) => {
    const existingItem = cartItems.find(item => item.id === product.id);
    
    if (existingItem) {
      setCartItems(cartItems.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
      toast.success('Quantity updated in cart');
    } else {
      setCartItems([...cartItems, { ...product, quantity: 1 }]);
      toast.success('Added to cart');
    }
  };

  const handleUpdateQuantity = (id: string, quantity: number) => {
    setCartItems(cartItems.map(item =>
      item.id === id ? { ...item, quantity } : item
    ));
  };

  const handleRemoveFromCart = (id: string) => {
    setCartItems(cartItems.filter(item => item.id !== id));
    toast.success('Removed from cart');
  };

  const handleCheckout = async () => {
    toast.info('Please complete your order via WhatsApp');
  };

  const handleUserAuthSuccess = (user?: UserData) => {
    if (user) {
      setUserData(user);
      setCurrentSection('dashboard');
    }
  };

  // 🔒 Admin login success with role verification
  const handleAdminAuthSuccess = async () => {
    const token = localStorage.getItem('sensual-kenya-admin');
    if (!token) {
      toast.error('Authentication failed');
      return;
    }

    try {
      const response = await fetch('https://omdutoyvodowjsdnaqfm.supabase.co/functions/v1/make-server-afd25991/analytics/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setAdminToken(token);
        setCurrentSection('admin-panel');
        // Update URL to reflect admin panel access
        window.location.hash = `/${SECRET_ADMIN_PATH}`;
        toast.success('Admin access granted');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Admin access denied');
        localStorage.removeItem('sensual-kenya-admin');
      }
    } catch (error) {
      console.error('Admin verification failed:', error);
      toast.error('Authentication error');
      localStorage.removeItem('sensual-kenya-admin');
    }
  };

  const handleUserLogout = () => {
    localStorage.removeItem('sensual-kenya-user');
    localStorage.removeItem('sensual-kenya-user-token');
    setUserData(null);
    setCurrentSection('home');
    window.location.hash = '';
    toast.success('Logged out successfully');
  };

  const handleAdminLogout = async () => {
    localStorage.removeItem('sensual-kenya-admin');
    setAdminToken(null);
    setCurrentSection('home');
    window.location.hash = ''; // Clear admin URL
    toast.success('Admin logged out successfully');
  };

  const handleWhatsApp = () => {
    window.open('https://wa.me/254112327141', '_blank');
  };

  const handleViewProduct = (productId: string) => {
    setSelectedProductId(productId);
    setCurrentSection('product-detail');
  };

  const handleCheckoutProduct = (product: any) => {
    setCheckoutProduct(product);
    setCurrentSection('checkout');
  };

  const handleShowUserAuth = () => {
    setAuthMode('user');
    setShowAuth(true);
  };

  const renderSection = () => {
    // 🔒 Admin Panel
    if (currentSection === 'admin-panel') {
      if (!adminToken) {
        toast.error('Admin authentication required');
        setAuthMode('admin');
        setShowAuth(true);
        setCurrentSection('home');
        window.location.hash = '';
        return null;
      }
      return <AdminPanel accessToken={adminToken} onLogout={handleAdminLogout} />;
    }

    // User Dashboard
    if (currentSection === 'dashboard') {
      if (!userData) {
        handleShowUserAuth();
        setCurrentSection('home');
        return null;
      }
      return (
        <UserDashboard
          user={userData}
          onLogout={handleUserLogout}
          onNavigate={setCurrentSection}
        />
      );
    }

    // Product Detail
    if (currentSection === 'product-detail' && selectedProductId) {
      return (
        <ProductDetailPage
          productId={selectedProductId}
          onBack={() => {
            setCurrentSection('home');
            setSelectedProductId(null);
          }}
          onAddToCart={handleAddToCart}
          onCheckout={handleCheckoutProduct}
        />
      );
    }

    // Checkout
    if (currentSection === 'checkout' && checkoutProduct) {
      return (
        <CheckoutPage
          product={checkoutProduct}
          onBack={() => {
            setCurrentSection('product-detail');
            setCheckoutProduct(null);
          }}
        />
      );
    }

    switch (currentSection) {
      case 'home':
        return (
          <HomePage
            onNavigate={setCurrentSection}
            isAdmin={!!adminToken}
            onShowAuth={handleShowUserAuth}
            onAddToCart={handleAddToCart}
            onViewProduct={handleViewProduct}
          />
        );
      case 'main-store':
        return (
          <StorePage
            store="main"
            title="Adult Toys & Wellness"
            onAddToCart={handleAddToCart}
            onViewProduct={handleViewProduct}
            onNavigate={setCurrentSection}
          />
        );
      case 'lingerie-store':
        return (
          <StorePage
            store="lingerie"
            title="Lingerie & Pajamas"
            onAddToCart={handleAddToCart}
            onViewProduct={handleViewProduct}
            onNavigate={setCurrentSection}
          />
        );
      case 'cart':
        return (
          <CartPage
            items={cartItems}
            onUpdateQuantity={handleUpdateQuantity}
            onRemove={handleRemoveFromCart}
            onCheckout={handleCheckout}
          />
        );
      case 'blog':
        return <BlogPage onNavigate={setCurrentSection} />;
      case 'contact':
        // 🔒 Removed onShowAdminAuth prop - admin button hidden
        return <ContactPage />;
      default:
        return (
          <HomePage
            onNavigate={setCurrentSection}
            isAdmin={!!adminToken}
            onShowAuth={handleShowUserAuth}
            onAddToCart={handleAddToCart}
            onViewProduct={handleViewProduct}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        currentSection={currentSection}
        onNavigate={setCurrentSection}
        cartCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
        isAdmin={!!adminToken}
        onAdminClick={() => {
          setCurrentSection('admin-panel');
          window.location.hash = `/${SECRET_ADMIN_PATH}`;
        }}
        onShowAuth={handleShowUserAuth}
        isUserLoggedIn={!!userData}
        onUserDashboard={() => setCurrentSection('dashboard')}
      />

      {renderSection()}

      {/* WhatsApp Floating Button */}
      {currentSection !== 'contact' && (
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 1, type: "spring", stiffness: 200 }}
          className="fixed bottom-6 right-6 z-40"
        >
          <motion.div
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Button
                onClick={handleWhatsApp}
                className="rounded-full h-16 w-16 shadow-2xl relative overflow-hidden group"
                size="icon"
                style={{
                  background: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)',
                }}
              >
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-primary"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [1, 0, 1]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeOut"
                  }}
                />
                <MessageCircle className="h-7 w-7 relative z-10" />
                
                <motion.span 
                  className="absolute top-0 right-0 h-4 w-4 bg-green-500 rounded-full border-2 border-background"
                  animate={{
                    scale: [1, 1.2, 1]
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity
                  }}
                />
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}

      {/* Footer */}
      <footer className="relative bg-gradient-to-b from-card via-card to-card/95 border-t border-primary/20 mt-20 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
        
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(236, 72, 153, 0.15) 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }} />
        </div>

        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Heart className="h-6 w-6 fill-primary text-primary" />
                <h3 
                  className="bg-gradient-to-r from-primary to-pink-400 bg-clip-text text-transparent"
                  style={{ fontWeight: 600 }}
                >
                  Sensual Kenya
                </h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Kenya's trusted destination for intimate wellness and sensual products.
              </p>
              <div className="flex gap-2 mt-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
            </div>

            <div>
              <h4 className="mb-4 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Quick Links
              </h4>
              <div className="space-y-3">
                {[
                  { label: 'Adult Toys', section: 'main-store' },
                  { label: 'Lingerie', section: 'lingerie-store' },
                  { label: 'Blog', section: 'blog' },
                  { label: 'Contact', section: 'contact' }
                ].map((link) => (
                  <button
                    key={link.section}
                    onClick={() => setCurrentSection(link.section)}
                    className="block text-sm text-muted-foreground hover:text-primary transition-all hover:translate-x-1 duration-300"
                  >
                    → {link.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="mb-4 flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-primary" />
                Support
              </h4>
              <div className="space-y-3">
                <button
                  onClick={() => setCurrentSection('contact')}
                  className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Contact Us
                </button>
                <a
                  href="https://wa.me/254112327141"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  WhatsApp: +254 112 327 141
                </a>
                <p className="text-sm text-muted-foreground">
                  Available 9 AM - 9 PM EAT
                </p>
              </div>
            </div>

            <div>
              <h4 className="mb-4 flex items-center gap-2">
                <Package className="h-4 w-4 text-primary" />
                Delivery
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                Discreet delivery across Kenya. Rates based on location and distance.
              </p>
              <div className="flex gap-2">
                <Shield className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  100% Discreet Packaging
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-primary/10 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">
                © 2025 Sensual Kenya. All rights reserved.
              </p>
              <div className="flex items-center gap-6">
                <span className="text-xs text-muted-foreground">
                  Made with <Heart className="h-3 w-3 inline fill-primary text-primary" /> in Kenya
                </span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <AuthDialog
        open={showAuth}
        onOpenChange={setShowAuth}
        onSuccess={authMode === 'admin' ? handleAdminAuthSuccess : handleUserAuthSuccess}
        mode={authMode}
      />

      <Toaster />
    </div>
  );
}