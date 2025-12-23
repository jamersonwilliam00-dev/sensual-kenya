import { useState, useEffect } from "react";
import {
  Heart,
  ShoppingCart,
  Menu,
  X,
  Sun,
  Moon,
  User,
  Sparkles,
} from "lucide-react";
import { Button } from "./ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "./ui/sheet";
import { Badge } from "./ui/badge";

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
  onUserDashboard,
}: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 15);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // FIXED: Prevent background scroll when menu open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const navItems = [
    { label: "Home", value: "home" },
    { label: "Shop", value: "main-store" },
    { label: "Lingerie", value: "lingerie-store" },
    { label: "Adult Toys", value: "main-store" },
    { label: "Blog", value: "blog" },
    { label: "Contact", value: "contact" },
  ];

  const handleNavigate = (section: string) => {
    onNavigate(section);
    setIsOpen(false);
  };

  return (
    <nav
      className={`sticky top-0 z-50 w-full transition-all ${
        scrolled
          ? "bg-card/80 backdrop-blur-xl border-b border-primary/20 shadow-md"
          : "bg-card/95 backdrop-blur-lg"
      }`}
    >
      {/* MOBILE NAVIGATION - FIXED RESPONSIVENESS */}
      <div className="flex items-center justify-between px-3 sm:px-4 md:px-6 h-14 sm:h-16 lg:hidden">
        <button
          onClick={() => handleNavigate("home")}
          className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-shrink"
        >
          <Heart className="h-5 w-5 sm:h-6 sm:w-6 text-primary fill-primary flex-shrink-0" />
          <span className="font-serif text-sm sm:text-base md:text-lg bg-gradient-to-r from-primary to-pink-400 bg-clip-text text-transparent truncate">
            Sensual Kenya
          </span>
        </button>

        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
          {/* FIXED: Touch target sizing */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onToggleTheme}
            className="h-9 w-9 sm:h-10 sm:w-10"
          >
            {isDark ? (
              <Sun className="h-4 w-4 sm:h-5 sm:w-5" />
            ) : (
              <Moon className="h-4 w-4 sm:h-5 sm:w-5" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleNavigate("cart")}
            className="relative h-9 w-9 sm:h-10 sm:w-10"
          >
            <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6" />
            {cartCount > 0 && (
              <Badge className="absolute -top-1 -right-1 text-[9px] sm:text-[10px] px-1 h-4 min-w-[16px] sm:h-5 sm:min-w-[20px] flex items-center justify-center">
                {cartCount > 9 ? '9+' : cartCount}
              </Badge>
            )}
          </Button>

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="h-9 w-9 sm:h-10 sm:w-10"
              >
                {isOpen ? (
                  <X className="h-5 w-5 sm:h-6 sm:w-6" />
                ) : (
                  <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
                )}
              </Button>
            </SheetTrigger>

            <SheetContent side="right" className="w-[280px] sm:w-[320px]">
              <SheetHeader>
                <SheetTitle>Navigation</SheetTitle>
                <SheetDescription>Explore our store</SheetDescription>
              </SheetHeader>

              <div className="mt-6 flex flex-col gap-2">
                {navItems.map((item) => (
                  <button
                    key={item.value}
                    onClick={() => handleNavigate(item.value)}
                    className={`px-4 py-3 rounded-lg text-left text-sm sm:text-base font-medium transition-all min-h-[44px] ${
                      currentSection === item.value
                        ? "bg-primary text-white"
                        : "border hover:bg-primary/10"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}

                <Button
                  onClick={() => handleNavigate("main-store")}
                  className="mt-4 h-11"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Shop Now
                </Button>

                {isUserLoggedIn ? (
                  <Button onClick={onUserDashboard} className="mt-2 h-11">
                    Dashboard
                  </Button>
                ) : (
                  onShowAuth && (
                    <Button onClick={onShowAuth} variant="outline" className="mt-2 h-11">
                      Login / Register
                    </Button>
                  )
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* DESKTOP NAVIGATION - FIXED RESPONSIVENESS */}
      <div className="hidden lg:flex container mx-auto px-4 xl:px-6 h-20 items-center justify-between max-w-7xl">
        <button 
          onClick={() => handleNavigate("home")} 
          className="flex gap-2 items-center"
        >
          <Heart className="h-7 w-7 xl:h-8 xl:w-8 fill-primary text-primary" />
          <span className="font-serif text-xl xl:text-2xl bg-gradient-to-r from-primary to-pink-400 bg-clip-text text-transparent">
            Sensual Kenya
          </span>
        </button>

        <div className="flex gap-6 xl:gap-8">
          {navItems.map((item) => (
            <button
              key={item.value}
              onClick={() => handleNavigate(item.value)}
              className={`text-sm xl:text-base font-medium transition-colors ${
                currentSection === item.value
                  ? "text-primary"
                  : "text-muted-foreground hover:text-primary"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex gap-3 xl:gap-4 items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onToggleTheme}
            className="h-10 w-10"
          >
            {isDark ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>

          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => handleNavigate("cart")}
            className="relative h-10 w-10"
          >
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <Badge className="absolute -top-1 -right-1 text-xs px-1.5 h-5 min-w-[20px] flex items-center justify-center">
                {cartCount}
              </Badge>
            )}
          </Button>

          {isUserLoggedIn ? (
            <Button onClick={onUserDashboard} className="text-sm xl:text-base">
              Dashboard
            </Button>
          ) : (
            onShowAuth && (
              <Button onClick={onShowAuth} className="text-sm xl:text-base">
                Login
              </Button>
            )
          )}

          {isAdmin && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onAdminClick}
              className="h-10 w-10"
            >
              <User className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}