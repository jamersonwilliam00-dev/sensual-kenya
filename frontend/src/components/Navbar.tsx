import { useState, useEffect } from 'react';
import { Heart, ShoppingCart, Menu, X, Sun, Moon, User, Sparkles, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from './ui/sheet';
import { Badge } from './ui/badge';

interface NavbarProps {
  currentSection: string;
  onNavigate: (section: string) => void;
  cartCount: number;
  isDark: boolean;
  onToggleTheme: () => void;
  isAdmin: boolean;
  onAdminClick: () => void;
  onShowAuth?: () => void;
  isUserLoggedIn?: boolean;
  onUserDashboard?: () => void;
}

export function Navbar({ 
  currentSection, 
  onNavigate, 
  cartCount, 
  isDark, 
  onToggleTheme,
  isAdmin,
  onAdminClick,
  onShowAuth,
  isUserLoggedIn = false,
  onUserDashboard
}: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Fade in animation on load
    setIsVisible(true);

    // Handle scroll for blur/transparency effect
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Home', value: 'home', key: 'nav-home' },
    { label: 'Shop', value: 'main-store', key: 'nav-shop' },
    { label: 'Lingerie', value: 'lingerie-store', key: 'nav-lingerie' },
    { label: 'Adult Toys', value: 'main-store', key: 'nav-adult-toys' },
    { label: 'Blog', value: 'blog', key: 'nav-blog' },
    { label: 'Contact', value: 'contact', key: 'nav-contact' }
  ];

  const handleNavigate = (section: string) => {
    onNavigate(section);
    setIsOpen(false);
  };

  return (
    <motion.nav 
      className={`sticky top-0 z-50 w-full transition-all duration-500 ${
        scrolled 
          ? 'bg-card/70 backdrop-blur-xl shadow-lg border-b border-primary/20' 
          : 'bg-card/95 backdrop-blur-md border-b border-border'
      }`}
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: isVisible ? 0 : -100, opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Gradient Glow Effect at Top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
      
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between">
          {/* Logo - Left Side with Glow Effect */}
          <motion.button 
            onClick={() => handleNavigate('home')}
            className="flex items-center gap-3 group relative"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {/* Glow Effect Behind Logo */}
            <motion.div
              className="absolute inset-0 bg-primary/20 rounded-full blur-xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            
            {/* Heart Icon with Shine Effect */}
            <motion.div
              className="relative"
              animate={{
                rotate: [0, -5, 5, -5, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Heart className="h-8 w-8 fill-primary text-primary relative z-10 drop-shadow-[0_0_8px_rgba(236,72,153,0.6)]" />
              <motion.div
                className="absolute inset-0 bg-white/40 rounded-full blur-sm"
                animate={{
                  scale: [0.8, 1.2, 0.8],
                  opacity: [0.5, 0.8, 0.5]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </motion.div>

            {/* Brand Name with Gradient and Glow */}
            <span 
              className="font-serif relative z-10"
              style={{
                fontSize: '1.5rem',
                fontWeight: 600,
                background: 'linear-gradient(135deg, #ec4899 0%, #f472b6 50%, #ec4899 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 0 30px rgba(236, 72, 153, 0.3)',
                letterSpacing: '0.02em'
              }}
            >
              Sensual Kenya
            </span>
          </motion.button>

          {/* Desktop Navigation - Center */}
          <div className="hidden lg:flex items-center gap-8">
            {navItems.map((item, index) => (
              <motion.button
                key={item.key}
                onClick={() => handleNavigate(item.value)}
                className="relative group"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.4 }}
                whileHover={{ y: -2 }}
              >
                <span 
                  className={`transition-all duration-300 ${
                    currentSection === item.value 
                      ? 'text-primary' 
                      : 'text-foreground/70 hover:text-primary'
                  }`}
                  style={{ fontWeight: 500 }}
                >
                  {item.label}
                </span>
                
                {/* Animated Underline */}
                <motion.div
                  className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-pink-400"
                  initial={{ scaleX: 0 }}
                  animate={{ 
                    scaleX: currentSection === item.value ? 1 : 0 
                  }}
                  whileHover={{ scaleX: 1 }}
                  transition={{ duration: 0.3 }}
                  style={{ originX: 0 }}
                />

                {/* Glow Effect on Hover */}
                <motion.div
                  className="absolute inset-0 bg-primary/10 rounded-lg blur-lg -z-10"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.button>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            {/* CTA Buttons - Desktop Only */}
            <div className="hidden xl:flex items-center gap-3">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={() => handleNavigate('main-store')}
                  className="relative overflow-hidden group shadow-lg hover:shadow-xl transition-shadow"
                  style={{
                    background: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)',
                    borderRadius: '9999px'
                  }}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Shop Now
                  </span>
                  {/* Shimmer Effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{
                      x: ['-100%', '100%']
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 1
                    }}
                  />
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={() => handleNavigate('blog')}
                  variant="outline"
                  className="rounded-full border-2 border-primary/50 hover:bg-primary/10 shadow-md backdrop-blur-sm"
                >
                  Explore Blog
                </Button>
              </motion.div>
            </div>

            {/* User Dashboard / Login Button */}
            {isUserLoggedIn ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                className="hidden md:block"
              >
                <Button
                  onClick={onUserDashboard}
                  className="rounded-full px-6 shadow-lg relative overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)',
                  }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{
                      x: ['-100%', '100%']
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 1
                    }}
                  />
                  <User className="h-4 w-4 mr-2 relative z-10" />
                  <span className="relative z-10">Dashboard</span>
                </Button>
              </motion.div>
            ) : !isAdmin && onShowAuth ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                className="hidden md:block"
              >
                <Button
                  onClick={onShowAuth}
                  className="rounded-full px-6 shadow-lg relative overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)',
                  }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{
                      x: ['-100%', '100%']
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 1
                    }}
                  />
                  <span className="relative z-10">Login</span>
                </Button>
              </motion.div>
            ) : null}

            {/* Theme Toggle */}
            <motion.div
              whileHover={{ scale: 1.1, rotate: 180 }}
              whileTap={{ scale: 0.9 }}
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleTheme}
                className="hidden sm:flex rounded-full hover:bg-primary/10"
              >
                <motion.div
                  initial={{ rotate: 0 }}
                  animate={{ rotate: isDark ? 0 : 180 }}
                  transition={{ duration: 0.5 }}
                >
                  {isDark ? (
                    <Sun className="h-5 w-5 text-primary" />
                  ) : (
                    <Moon className="h-5 w-5 text-primary" />
                  )}
                </motion.div>
              </Button>
            </motion.div>

            {/* Admin Icon */}
            {isAdmin && (
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onAdminClick}
                  className="rounded-full hover:bg-primary/10 relative"
                >
                  <User className="h-5 w-5 text-primary" />
                  <span className="absolute top-0 right-0 h-2 w-2 bg-primary rounded-full animate-pulse" />
                </Button>
              </motion.div>
            )}

            {/* Cart Icon with Count */}
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleNavigate('cart')}
                className="relative rounded-full hover:bg-primary/10"
              >
                <ShoppingCart className="h-5 w-5 text-primary" />
                <AnimatePresence>
                  {cartCount > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-1 -right-1"
                    >
                      <Badge 
                        className="h-5 w-5 flex items-center justify-center p-0 text-xs animate-pulse shadow-lg"
                        style={{
                          background: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)'
                        }}
                      >
                        {cartCount}
                      </Badge>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </motion.div>

            {/* Mobile Menu Trigger */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10">
                    <AnimatePresence mode="wait">
                      {isOpen ? (
                        <motion.div
                          key="close"
                          initial={{ rotate: -90, opacity: 0 }}
                          animate={{ rotate: 0, opacity: 1 }}
                          exit={{ rotate: 90, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <X className="h-5 w-5 text-primary" />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="menu"
                          initial={{ rotate: 90, opacity: 0 }}
                          animate={{ rotate: 0, opacity: 1 }}
                          exit={{ rotate: -90, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Menu className="h-5 w-5 text-primary" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Button>
                </motion.div>
              </SheetTrigger>
              
              <SheetContent 
                side="right" 
                className="w-[320px] bg-gradient-to-b from-card via-card to-card/95 backdrop-blur-xl border-l-2 border-primary/20"
              >
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5 fill-primary text-primary" />
                    <span className="bg-gradient-to-r from-primary to-pink-400 bg-clip-text text-transparent">
                      Navigation
                    </span>
                  </SheetTitle>
                  <SheetDescription>
                    Explore our sensual collection
                  </SheetDescription>
                </SheetHeader>

                <div className="flex flex-col gap-3 mt-8">
                  {navItems.map((item, index) => (
                    <motion.button
                      key={item.key}
                      onClick={() => handleNavigate(item.value)}
                      className={`text-left px-6 py-4 rounded-xl transition-all relative overflow-hidden group ${
                        currentSection === item.value
                          ? 'bg-gradient-to-r from-primary to-pink-500 text-white shadow-lg'
                          : 'hover:bg-primary/10 border border-border'
                      }`}
                      initial={{ x: -50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ x: 5 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {/* Shine effect on hover */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        initial={{ x: '-100%' }}
                        whileHover={{ x: '100%' }}
                        transition={{ duration: 0.6 }}
                      />
                      <span className="relative z-10" style={{ fontWeight: 500 }}>
                        {item.label}
                      </span>
                    </motion.button>
                  ))}

                  {/* Mobile CTA Buttons */}
                  <div className="mt-6 space-y-3">
                    <Button
                      onClick={() => handleNavigate('main-store')}
                      className="w-full rounded-xl shadow-lg"
                      style={{
                        background: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)'
                      }}
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Shop Now
                    </Button>

                    <Button
                      onClick={() => handleNavigate('blog')}
                      variant="outline"
                      className="w-full rounded-xl border-2 border-primary/50"
                    >
                      Explore Blog
                    </Button>

                    {/* Dashboard / Login Button in Mobile Menu */}
                    {isUserLoggedIn ? (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <Button
                          onClick={() => {
                            onUserDashboard?.();
                            setIsOpen(false);
                          }}
                          className="w-full rounded-xl shadow-xl relative overflow-hidden"
                          style={{
                            background: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)',
                          }}
                        >
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                            animate={{
                              x: ['-100%', '100%']
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              repeatDelay: 1
                            }}
                          />
                          <User className="h-4 w-4 mr-2 relative z-10" />
                          <span className="relative z-10">My Dashboard</span>
                        </Button>
                      </motion.div>
                    ) : !isAdmin && onShowAuth ? (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <Button
                          onClick={() => {
                            onShowAuth();
                            setIsOpen(false);
                          }}
                          className="w-full rounded-xl shadow-xl relative overflow-hidden"
                          style={{
                            background: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)',
                          }}
                        >
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                            animate={{
                              x: ['-100%', '100%']
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              repeatDelay: 1
                            }}
                          />
                          <User className="h-4 w-4 mr-2 relative z-10" />
                          <span className="relative z-10">Login / Register</span>
                        </Button>
                      </motion.div>
                    ) : null}
                  </div>

                  {/* Theme Toggle Mobile */}
                  <motion.div
                    whileTap={{ scale: 0.95 }}
                    className="mt-4"
                  >
                    <Button
                      variant="outline"
                      onClick={onToggleTheme}
                      className="w-full justify-start gap-3 rounded-xl border-border"
                    >
                      {isDark ? (
                        <>
                          <Sun className="h-4 w-4 text-primary" />
                          <span>Light Mode</span>
                        </>
                      ) : (
                        <>
                          <Moon className="h-4 w-4 text-primary" />
                          <span>Dark Mode</span>
                        </>
                      )}
                    </Button>
                  </motion.div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Bottom Glow Line */}
      <motion.div 
        className="absolute bottom-0 left-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent"
        animate={{
          opacity: [0.3, 0.6, 0.3],
          scaleX: [0.8, 1, 0.8]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </motion.nav>
  );
}
