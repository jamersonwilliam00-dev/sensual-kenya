import { useEffect, useState, useRef } from 'react';
import { ArrowRight, Heart, Sparkles, Package, Shield, Truck, Star, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, useMotionValue, useAnimation, PanInfo } from "framer-motion";
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Badge } from './ui/badge';

interface HomePageProps {
  onNavigate: (section: string) => void;
  isAdmin: boolean;
  onShowAuth: () => void;
  onAddToCart?: (product: any) => void;
  onViewProduct?: (productId: string) => void;
}

// Animated Counter Component
function AnimatedCounter({ target }: { target: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const increment = target / (duration / 16);
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [target]);

  return <span>{count.toLocaleString()}+</span>;
}

// Floating Hearts Animation
function FloatingHearts() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-pink-500/20"
          initial={{ 
            x: Math.random() * window.innerWidth,
            y: window.innerHeight + 50,
            scale: Math.random() * 0.5 + 0.5,
            rotate: Math.random() * 360
          }}
          animate={{
            y: -100,
            x: Math.random() * window.innerWidth,
            rotate: Math.random() * 360 + 360
          }}
          transition={{
            duration: Math.random() * 10 + 15,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: "linear"
          }}
        >
          <Heart className="h-6 w-6 fill-current" />
        </motion.div>
      ))}
    </div>
  );
}

// Sparkles Effect
function SparklesEffect() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          initial={{ 
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            opacity: 0,
            scale: 0
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
            rotate: [0, 180, 360]
          }}
          transition={{
            duration: Math.random() * 3 + 2,
            repeat: Infinity,
            delay: Math.random() * 3,
            ease: "easeInOut"
          }}
        >
          <Sparkles className="h-4 w-4 text-pink-400" />
        </motion.div>
      ))}
    </div>
  );
}

export function HomePage({ onNavigate, isAdmin, onShowAuth, onAddToCart, onViewProduct }: HomePageProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const dragX = useMotionValue(0);
  const controls = useAnimation();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const trendingProducts = [
    {
      id: 'products:main:5',
      name: 'The Rabbit (New Model)',
      price: 2999,
      store: 'main',
      category: 'Vibrators',
      image: 'https://images.unsplash.com/photo-1625154253125-5d89afab6c7c?w=400',
      badge: 'Trending'
    },
    {
      id: 'products:lingerie:1',
      name: 'Candi Eros Lingerie',
      price: 999,
      store: 'lingerie',
      category: 'Sexy Lingerie',
      image: 'https://images.unsplash.com/photo-1591079496752-a56c5474af3f?w=400',
      badge: 'Popular'
    },
    {
      id: 'products:main:2',
      name: 'Mini Vibrating Panties',
      price: 2900,
      store: 'main',
      category: 'Vibrators',
      image: 'https://images.unsplash.com/photo-1625154253125-5d89afab6c7c?w=400',
      badge: 'New'
    },
    {
      id: 'products:lingerie:3',
      name: 'Sexy Floral Lace Bodysuit',
      price: 1600,
      store: 'lingerie',
      category: 'Sexy Lingerie',
      image: 'https://images.unsplash.com/photo-1591079496752-a56c5474af3f?w=400',
      badge: 'Hot'
    },
    {
      id: 'products:main:6',
      name: 'Luxury Massager',
      price: 3499,
      store: 'main',
      category: 'Massagers',
      image: 'https://images.unsplash.com/photo-1625154253125-5d89afab6c7c?w=400',
      badge: 'Premium'
    },
    {
      id: 'products:lingerie:4',
      name: 'Satin Robe Set',
      price: 1299,
      store: 'lingerie',
      category: 'Sleepwear',
      image: 'https://images.unsplash.com/photo-1591079496752-a56c5474af3f?w=400',
      badge: 'Bestseller'
    }
  ];

  // Auto-scroll carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % trendingProducts.length);
    }, 4000); // Change slide every 4 seconds

    return () => clearInterval(interval);
  }, [trendingProducts.length]);

  // Smooth scroll to current slide
  useEffect(() => {
    controls.start({
      x: -currentSlide * (320 + 24), // card width + gap
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    });
  }, [currentSlide, controls]);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;

    if (Math.abs(velocity) > 500 || Math.abs(offset) > 100) {
      if (offset > 0) {
        // Dragged right, go to previous
        setCurrentSlide((prev) => (prev - 1 + trendingProducts.length) % trendingProducts.length);
      } else {
        // Dragged left, go to next
        setCurrentSlide((prev) => (prev + 1) % trendingProducts.length);
      }
    }
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % trendingProducts.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + trendingProducts.length) % trendingProducts.length);
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Hero Section - World Class */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background with Parallax Effect */}
        <motion.div 
          className="absolute inset-0"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        >
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(https://images.unsplash.com/photo-1717517828262-9a326f3289ac?w=1600)`,
            }}
          />
          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-pink-900/60 to-black/90" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
        </motion.div>

        {/* Floating Effects */}
        <FloatingHearts />
        <SparklesEffect />

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            {/* Glowing Title */}
            <h1 
              className="text-5xl md:text-7xl lg:text-8xl text-white mb-6 drop-shadow-2xl"
              style={{
                textShadow: '0 0 40px rgba(236, 72, 153, 0.5), 0 0 80px rgba(236, 72, 153, 0.3)',
                fontWeight: 600,
                letterSpacing: '-0.02em'
              }}
            >
              Elevate Your Intimate Moments
            </h1>
          </motion.div>

          <motion.p
            className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto drop-shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 1, delay: 0.4 }}
          >
            Discover Kenya's most trusted destination for sensual wellness, intimate products, and elegant lingerie.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 1, delay: 0.6 }}
          >
            <motion.div
              whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(236, 72, 153, 0.6)" }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                size="lg" 
                className="text-lg px-8 py-6 bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-500 hover:to-pink-400 shadow-2xl"
                onClick={() => onNavigate('main-store')}
              >
                <Heart className="mr-2 h-5 w-5" />
                Shop Adult Toys
              </Button>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(236, 72, 153, 0.6)" }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                size="lg" 
                variant="outline"
                className="text-lg px-8 py-6 bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20"
                onClick={() => onNavigate('lingerie-store')}
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Browse Lingerie
              </Button>
            </motion.div>
          </motion.div>

          {/* Trust Badge with Animated Counter */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.8 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="inline-block"
          >
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-8 py-6 shadow-2xl">
              <motion.div
                animate={{
                  boxShadow: [
                    "0 0 20px rgba(236, 72, 153, 0.3)",
                    "0 0 40px rgba(236, 72, 153, 0.5)",
                    "0 0 20px rgba(236, 72, 153, 0.3)"
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <p className="text-white/70 text-sm mb-2">Trusted by</p>
                <div className="flex items-center gap-2">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1 + i * 0.1 }}
                    >
                      <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                    </motion.div>
                  ))}
                </div>
                <p className="text-3xl md:text-4xl text-white mt-2" style={{ fontWeight: 700 }}>
                  <AnimatedCounter target={10000} /> Happy Customers
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
            <div className="w-1 h-3 bg-white/50 rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* Trending Products - Horizontal Carousel */}
      <section className="py-20 overflow-hidden">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="text-center mb-12">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <Badge className="mb-4 text-sm px-4 py-2 shadow-lg">
                  <TrendingUp className="h-3 w-3 mr-1 animate-pulse" />
                  Trending Now
                </Badge>
              </motion.div>
              <h2 className="mb-4">Discover What's Hot</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our most popular products, loved by thousands of satisfied customers
              </p>
            </div>

            {/* Carousel Container */}
            <div className="relative">
              {/* Navigation Arrows */}
              <motion.button
                className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-background/80 backdrop-blur-md hover:bg-background border-2 border-primary/30 rounded-full p-3 shadow-xl hover:shadow-2xl transition-all"
                onClick={prevSlide}
                whileHover={{ scale: 1.1, x: -5 }}
                whileTap={{ scale: 0.9 }}
              >
                <ChevronLeft className="h-6 w-6 text-primary" />
              </motion.button>

              <motion.button
                className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-background/80 backdrop-blur-md hover:bg-background border-2 border-primary/30 rounded-full p-3 shadow-xl hover:shadow-2xl transition-all"
                onClick={nextSlide}
                whileHover={{ scale: 1.1, x: 5 }}
                whileTap={{ scale: 0.9 }}
              >
                <ChevronRight className="h-6 w-6 text-primary" />
              </motion.button>

              {/* Carousel Track */}
              <div className="overflow-hidden mx-12">
                <motion.div
                  ref={carouselRef}
                  className="flex gap-6"
                  drag="x"
                  dragConstraints={{ left: -1600, right: 0 }}
                  onDragEnd={handleDragEnd}
                  animate={controls}
                  style={{ x: dragX }}
                >
                  {trendingProducts.map((product, index) => (
                    <motion.div
                      key={product.id}
                      className="min-w-[320px]"
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <motion.div
                        whileHover={{ y: -10, scale: 1.02 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Card 
                          className="group overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer border-2 border-transparent hover:border-primary/50 bg-card/50 backdrop-blur-sm"
                          onClick={() => onViewProduct?.(product.id)}
                        >
                          <CardContent className="p-0">
                            <div className="relative aspect-square overflow-hidden">
                              {/* Image Container */}
                              <motion.div
                                className="w-full h-full"
                                whileHover={{ scale: 1.15 }}
                                transition={{ duration: 0.6, ease: "easeOut" }}
                              >
                                <ImageWithFallback
                                  src={product.image}
                                  alt={product.name}
                                  className="object-cover w-full h-full"
                                />
                              </motion.div>
                              
                              {/* Gradient Overlay */}
                              <motion.div 
                                className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"
                                initial={{ opacity: 0 }}
                                whileHover={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                              />
                              
                              {/* Badge */}
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2 + index * 0.1, type: "spring" }}
                              >
                                <Badge className="absolute top-3 right-3 shadow-xl backdrop-blur-sm bg-primary/90 animate-pulse">
                                  {product.badge}
                                </Badge>
                              </motion.div>

                              {/* Quick View Button */}
                              <motion.div
                                className="absolute bottom-3 left-3 right-3"
                                initial={{ opacity: 0, y: 20 }}
                                whileHover={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                              >
                                <Button 
                                  size="sm" 
                                  className="w-full shadow-xl backdrop-blur-sm"
                                  variant="secondary"
                                >
                                  Quick View
                                </Button>
                              </motion.div>
                            </div>
                            
                            {/* Product Info */}
                            <div className="p-4 bg-gradient-to-b from-card to-card/80">
                              <h4 className="mb-2 line-clamp-1">{product.name}</h4>
                              <div className="flex items-center justify-between">
                                <p className="text-primary" style={{ fontSize: '1.125rem', fontWeight: 600 }}>
                                  KSh {product.price.toLocaleString()}
                                </p>
                                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                  <Button 
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 rounded-full bg-primary/10 hover:bg-primary hover:text-white"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (onAddToCart) {
                                        onAddToCart(product);
                                      }
                                    }}
                                  >
                                    <Heart className="h-4 w-4" />
                                  </Button>
                                </motion.div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>

              {/* Dot Indicators */}
              <div className="flex justify-center gap-2 mt-8">
                {trendingProducts.map((_, index) => (
                  <motion.button
                    key={index}
                    className={`h-2 rounded-full transition-all ${
                      index === currentSlide 
                        ? 'w-8 bg-primary' 
                        : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                    }`}
                    onClick={() => goToSlide(index)}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    animate={{
                      scale: index === currentSlide ? 1.1 : 1,
                    }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Category Showcase with Background Images */}
      <section className="container mx-auto px-4 py-20">
        <motion.h2
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Explore Our Collections
        </motion.h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Adult Toys Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            whileHover={{ scale: 1.02 }}
          >
            <Card 
              className="group cursor-pointer overflow-hidden hover:shadow-2xl transition-all duration-500 h-[400px]"
              onClick={() => onNavigate('main-store')}
            >
              <CardContent className="p-0 h-full">
                <div className="relative h-full overflow-hidden">
                  <motion.div
                    className="absolute inset-0"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.6 }}
                  >
                    <div
                      className="absolute inset-0 bg-cover bg-center"
                      style={{
                        backgroundImage: `url(https://images.unsplash.com/photo-1664347770836-03d04faa3c04?w=1200)`
                      }}
                    />
                  </motion.div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6 text-white">
                    <motion.h3 
                      className="mb-4 drop-shadow-lg relative"
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      style={{
                        background: 'linear-gradient(135deg, #ec4899 0%, #f472b6 50%, #fbbf24 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        fontWeight: 700,
                        textShadow: '0 0 20px rgba(236, 72, 153, 0.4)',
                      }}
                    >
                      Go to Adult Toys Section
                    </motion.h3>
                    <div className="flex gap-2">
                      <motion.div 
                        whileHover={{ scale: 1.08, y: -3 }} 
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button 
                          variant="secondary" 
                          className="gap-2 shadow-xl relative overflow-hidden"
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
                          <span className="relative z-10">Shop Now</span>
                          <ArrowRight className="h-4 w-4 relative z-10" />
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Lingerie Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            whileHover={{ scale: 1.02 }}
          >
            <Card 
              className="group cursor-pointer overflow-hidden hover:shadow-2xl transition-all duration-500 h-[400px]"
              onClick={() => onNavigate('lingerie-store')}
            >
              <CardContent className="p-0 h-full">
                <div className="relative h-full overflow-hidden">
                  <motion.div
                    className="absolute inset-0"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.6 }}
                  >
                    <div
                      className="absolute inset-0 bg-cover bg-center"
                      style={{
                        backgroundImage: `url(https://images.unsplash.com/photo-1668191219162-b58465065deb?w=1200)`
                      }}
                    />
                  </motion.div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6 text-white">
                    <motion.h3 
                      className="mb-4 drop-shadow-lg relative"
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      style={{
                        background: 'linear-gradient(135deg, #ec4899 0%, #f472b6 50%, #fbbf24 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        fontWeight: 700,
                        textShadow: '0 0 20px rgba(236, 72, 153, 0.4)',
                      }}
                    >
                      Go to Lingerie and Pajamas Section
                    </motion.h3>
                    <div className="flex gap-2">
                      <motion.div 
                        whileHover={{ scale: 1.08, y: -3 }} 
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button 
                          variant="secondary" 
                          className="gap-2 shadow-xl relative overflow-hidden"
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
                          <span className="relative z-10">Shop Now</span>
                          <ArrowRight className="h-4 w-4 relative z-10" />
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gradient-to-br from-pink-600/10 via-purple-600/10 to-pink-600/10 py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Package,
                title: 'Discreet Packaging',
                description: 'Plain, unmarked packaging for your complete privacy'
              },
              {
                icon: Shield,
                title: 'Secure Payments',
                description: 'Safe and secure M-Pesa payment processing'
              },
              {
                icon: Truck,
                title: 'Fast Delivery',
                description: '1-2 business days delivery across Kenya'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <Card className="text-center p-8 hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-primary/30">
                  <CardContent className="p-0">
                    <motion.div
                      className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4"
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <feature.icon className="h-8 w-8 text-primary" />
                    </motion.div>
                    <h3 className="mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Romantic Setting */}
      <section className="relative py-32 overflow-hidden">
        <motion.div
          className="absolute inset-0"
          initial={{ scale: 1.1 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5 }}
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(https://images.unsplash.com/photo-1760067538083-b9d87cd6706c?w=1600)`
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-pink-900/70 to-black/80" />
        </motion.div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <motion.div whileHover={{ scale: 1.08, y: -5 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  size="lg" 
                  className="gap-2 px-10 py-7 text-lg shadow-2xl relative overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)',
                  }}
                  onClick={() => onNavigate('blog')}
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
                  <Sparkles className="h-5 w-5 relative z-10" />
                  <span className="relative z-10">Read Blogs</span>
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.08, y: -5 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  size="lg" 
                  className="gap-2 px-10 py-7 text-lg shadow-2xl relative overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)',
                  }}
                  onClick={() => onNavigate('contact')}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{
                      x: ['-100%', '100%']
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 1.5
                    }}
                  />
                  <Heart className="h-5 w-5 relative z-10" />
                  <span className="relative z-10">Contact Us</span>
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.08, y: -5 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  size="lg" 
                  className="gap-2 px-10 py-7 text-lg shadow-2xl relative overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)',
                  }}
                  onClick={() => onShowAuth()}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{
                      x: ['-100%', '100%']
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 2
                    }}
                  />
                  <ArrowRight className="h-5 w-5 relative z-10" />
                  <span className="relative z-10">Post Blogs</span>
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
