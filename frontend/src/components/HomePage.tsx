import { useEffect, useState, useRef } from 'react';
import { ArrowRight, Heart, Sparkles, Package, Shield, Truck, Star, TrendingUp, ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react';
import { motion, useMotionValue, useAnimation, PanInfo } from 'framer-motion';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Badge } from './ui/badge';
import { ProductCard } from './ProductCard';
import { projectId, publicAnonKey } from '../utils/supabase/info';

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

interface CatalogProduct {
  id: string;
  name: string;
  price: number;
  category: string;
  image?: string;
  description?: string;
  inStock?: boolean;
  store: 'main' | 'lingerie';
}

export function HomePage({ onNavigate, isAdmin, onShowAuth, onAddToCart, onViewProduct }: HomePageProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [trendingProducts, setTrendingProducts] = useState<CatalogProduct[]>([
    { id: 'products:main:5', name: 'The Rabbit (New Model)', price: 2999, store: 'main', category: 'Vibrators', image: 'https://images.unsplash.com/photo-1625154253125-5d89afab6c7c?w=900', inStock: true },
    { id: 'products:main:2', name: 'Mini Vibrating Panties', price: 2900, store: 'main', category: 'Vibrators', image: 'https://images.unsplash.com/photo-1625154253125-5d89afab6c7c?w=900', inStock: true },
    { id: 'products:main:6', name: 'Luxury Massager', price: 3499, store: 'main', category: 'Massagers', image: 'https://images.unsplash.com/photo-1625154253125-5d89afab6c7c?w=900', inStock: true },
    { id: 'products:lingerie:1', name: 'Candi Eros Lingerie', price: 999, store: 'lingerie', category: 'Sexy Lingerie', image: 'https://images.unsplash.com/photo-1591079496752-a56c5474af3f?w=900', inStock: true },
    { id: 'products:lingerie:3', name: 'Sexy Floral Lace Bodysuit', price: 1600, store: 'lingerie', category: 'Sexy Lingerie', image: 'https://images.unsplash.com/photo-1591079496752-a56c5474af3f?w=900', inStock: true },
    { id: 'products:lingerie:4', name: 'Satin Robe Set', price: 1299, store: 'lingerie', category: 'Sleepwear', image: 'https://images.unsplash.com/photo-1591079496752-a56c5474af3f?w=900', inStock: true }
  ]);
  const [bestSellers, setBestSellers] = useState<CatalogProduct[]>([]);
  const [newArrivals, setNewArrivals] = useState<CatalogProduct[]>([]);
  const carouselRef = useRef<HTMLDivElement>(null);
  const dragX = useMotionValue(0);
  const controls = useAnimation();

  const categoryCards = [
    {
      title: 'Sex Toys',
      subtitle: 'Powerful essentials for deeper comfort and pleasure.',
      image: 'https://images.unsplash.com/photo-1664347770836-03d04faa3c04?w=1200',
      action: 'Shop Toys',
      onClick: () => onNavigate('main-store')
    },
    {
      title: 'Lingerie',
      subtitle: 'Elegant silhouettes designed to feel beautiful.',
      image: 'https://images.unsplash.com/photo-1591079496752-a56c5474af3f?w=1200',
      action: 'Shop Lingerie',
      onClick: () => onNavigate('lingerie-store')
    },
    {
      title: "Couples' Products",
      subtitle: 'Shared rituals and magnetic date-night finds.',
      image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=1200',
      action: 'Explore Couples',
      onClick: () => onNavigate('main-store')
    },
    {
      title: 'Accessories',
      subtitle: 'Thoughtful add-ons for a polished, elevated experience.',
      image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=1200',
      action: 'Browse Accessories',
      onClick: () => onNavigate('main-store')
    }
  ];

  const customerPerks = [
    'Discreet nationwide delivery',
    'M-Pesa friendly checkout',
    '100% confidential shopping'
  ];

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const [mainResponse, lingerieResponse] = await Promise.all([
          fetch(`https://${projectId}.supabase.co/functions/v1/make-server-afd25991/products?store=main`, {
            headers: { Authorization: `Bearer ${publicAnonKey}` }
          }),
          fetch(`https://${projectId}.supabase.co/functions/v1/make-server-afd25991/products?store=lingerie`, {
            headers: { Authorization: `Bearer ${publicAnonKey}` }
          })
        ]);

        const mainProducts = mainResponse.ok ? (await mainResponse.json()).products || [] : [];
        const lingerieProducts = lingerieResponse.ok ? (await lingerieResponse.json()).products || [] : [];
        const allProducts: CatalogProduct[] = [...mainProducts, ...lingerieProducts];

        if (allProducts.length > 0) {
          const featured = allProducts.slice(0, 8);
          setTrendingProducts(featured);
          setBestSellers([...allProducts].sort((a, b) => Number(b.price) - Number(a.price)).slice(0, 4));
          setNewArrivals(allProducts.slice(-4));
        }
      } catch (error) {
        console.error('Error loading homepage products:', error);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % Math.max(trendingProducts.length, 1));
    }, 4000);

    return () => clearInterval(interval);
  }, [trendingProducts.length]);

  useEffect(() => {
    if (trendingProducts.length > 0) {
      controls.start({
        x: -currentSlide * (320 + 24),
        transition: {
          type: 'spring',
          stiffness: 260,
          damping: 28
        }
      });
    }
  }, [currentSlide, controls, trendingProducts.length]);

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;

    if (Math.abs(velocity) > 500 || Math.abs(offset) > 100) {
      if (offset > 0) {
        setCurrentSlide((prev) => (prev - 1 + trendingProducts.length) % trendingProducts.length);
      } else {
        setCurrentSlide((prev) => (prev + 1) % trendingProducts.length);
      }
    }
  };

  const goToSlide = (index: number) => setCurrentSlide(index);
  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % trendingProducts.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + trendingProducts.length) % trendingProducts.length);

  return (
    <div className="min-h-screen overflow-hidden bg-[#f8f5f3] text-slate-900">
      <section className="relative overflow-hidden bg-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(236,72,153,0.12),_transparent_38%),radial-gradient(circle_at_bottom_right,_rgba(15,23,42,0.08),_transparent_30%)]" />
        <div className="relative z-10 mx-auto flex min-h-[760px] max-w-7xl items-center px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid w-full items-center gap-12 lg:grid-cols-[1.05fr_1.2fr]">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 24 }}
              transition={{ duration: 0.8 }}
              className="mx-auto w-full max-w-xl lg:mx-0"
            >
              <Badge className="mb-5 border-pink-200 bg-pink-50 text-pink-700 shadow-sm">
                <Sparkles className="mr-2 h-3.5 w-3.5" />
                Premium pleasure, beautifully curated
              </Badge>

              <h1 className="mb-5 text-4xl font-semibold tracking-[-0.05em] text-slate-950 sm:text-5xl lg:text-[4.2rem] leading-[0.95]">
                Intimate essentials for every moment.
              </h1>

              <p className="mb-8 max-w-lg text-lg leading-relaxed text-slate-600">
                Discover premium sex toys, elegant lingerie, and thoughtful couple's favourites designed for confidence, comfort, and connection.
              </p>

              <div className="mb-8 flex flex-col gap-4 sm:flex-row">
                <Button
                  size="lg"
                  className="gap-2 bg-slate-950 px-6 py-6 text-base text-white shadow-lg shadow-slate-900/10 hover:bg-slate-800"
                  onClick={() => onNavigate('main-store')}
                >
                  <Heart className="h-4 w-4 fill-pink-500 text-pink-500" />
                  Shop sex toys
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-slate-200 bg-white px-6 py-6 text-base text-slate-900 shadow-sm hover:border-pink-300 hover:text-pink-700"
                  onClick={() => onNavigate('lingerie-store')}
                >
                  <Sparkles className="h-4 w-4 text-pink-500" />
                  Browse lingerie
                </Button>
              </div>

              <div className="mb-8 flex flex-wrap gap-3">
                {customerPerks.map((perk) => (
                  <div key={perk} className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm">
                    {perk}
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-4 rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_20px_50px_rgba(15,23,42,0.06)]">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <div>
                  <p className="text-2xl font-semibold text-slate-950"><AnimatedCounter target={10000} /></p>
                  <p className="text-sm text-slate-500">happy customers</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 32 }}
              animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : 32 }}
              transition={{ duration: 0.9, delay: 0.2 }}
              className="relative"
            >
              <div className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-white p-3 shadow-[0_40px_80px_rgba(15,23,42,0.12)]">
                <div className="grid gap-3 sm:grid-cols-[1.2fr_0.8fr]">
                  <div className="relative overflow-hidden rounded-[24px]">
                    <ImageWithFallback
                      src="https://images.unsplash.com/photo-1664347770836-03d04faa3c04?w=1200"
                      alt="Sensual Kenya intimate product collection"
                      className="h-[430px] w-full rounded-[24px] object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 to-transparent" />
                    <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-pink-200">Featured</p>
                        <h3 className="mt-2 text-2xl font-semibold text-white">Premium toys</h3>
                      </div>
                      <Button
                        size="sm"
                        className="bg-white text-slate-900 hover:bg-pink-50"
                        onClick={() => onNavigate('main-store')}
                      >
                        Shop now
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <div className="overflow-hidden rounded-[24px]">
                      <ImageWithFallback
                        src="https://images.unsplash.com/photo-1591079496752-a56c5474af3f?w=1200"
                        alt="Sensual Kenya lingerie selection"
                        className="h-[210px] w-full rounded-[24px] object-cover"
                      />
                    </div>
                    <div className="rounded-[24px] bg-slate-950 p-4 text-white">
                      <p className="mb-2 text-xs uppercase tracking-[0.2em] text-pink-200">New</p>
                      <h3 className="mb-1 text-2xl font-semibold">Luxe lingerie</h3>
                      <p className="mb-4 text-sm text-slate-300">Soft fabrics. Beautiful silhouettes.</p>
                      <Button
                        variant="secondary"
                        className="bg-white text-slate-900 hover:bg-pink-50"
                        onClick={() => onNavigate('lingerie-store')}
                      >
                        View collection
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-8 -left-8 rounded-full border border-pink-200 bg-pink-50 px-5 py-3 text-sm font-medium text-pink-700 shadow-lg shadow-pink-100">
                ✨ Discreet delivery across Kenya
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
            <div className="mb-10 flex flex-col items-center justify-center text-center">
              <Badge className="mb-4 border-pink-200 bg-pink-50 text-pink-700 shadow-sm">
                <TrendingUp className="mr-2 h-3.5 w-3.5" />
                Trending now
              </Badge>
              <h2 className="mb-3 text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-4xl">Best-loved picks this week</h2>
              <p className="max-w-2xl text-lg text-slate-600">Curated favourites from our most-loved adult toys and lingerie collections.</p>
            </div>
          </motion.div>

          <div className="relative">
            <motion.button
              className="absolute left-0 top-1/2 z-20 hidden -translate-y-1/2 rounded-full border border-slate-200 bg-white p-3 shadow-lg shadow-slate-200/60 md:block"
              onClick={prevSlide}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronLeft className="h-5 w-5 text-slate-900" />
            </motion.button>

            <motion.button
              className="absolute right-0 top-1/2 z-20 hidden -translate-y-1/2 rounded-full border border-slate-200 bg-white p-3 shadow-lg shadow-slate-200/60 md:block"
              onClick={nextSlide}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronRight className="h-5 w-5 text-slate-900" />
            </motion.button>

            <div className="overflow-hidden px-2 pb-8 md:px-10">
              <motion.div
                ref={carouselRef}
                className="flex gap-5"
                drag="x"
                dragConstraints={{ left: -1600, right: 0 }}
                onDragEnd={handleDragEnd}
                animate={controls}
                style={{ x: dragX }}
              >
                {trendingProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    className="min-w-[270px] sm:min-w-[290px] md:min-w-[320px]"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                  >
                    <Card className="group overflow-hidden border border-slate-200 bg-white shadow-[0_20px_45px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_25px_50px_rgba(236,72,153,0.14)]">
                      <CardContent className="p-0">
                        <div className="relative overflow-hidden">
                          <ImageWithFallback
                            src={product.image || 'https://images.unsplash.com/photo-1625154253125-5d89afab6c7c?w=900'}
                            alt={product.name}
                            className="aspect-[4/5] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <Badge className="absolute right-3 top-3 border-0 bg-white/90 text-slate-900 shadow-sm backdrop-blur-sm">
                            {product.category}
                          </Badge>
                        </div>
                        <div className="p-4">
                          <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.18em] text-pink-600">Sensual Kenya</p>
                          <h3 className="mb-3 line-clamp-2 min-h-[3rem] text-xl font-medium text-slate-900">{product.name}</h3>
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-xl font-semibold text-slate-950">KSh {Number(product.price).toLocaleString()}</p>
                            <Button
                              size="sm"
                              className="bg-slate-950 text-white hover:bg-slate-800"
                              onClick={() => onAddToCart?.(product)}
                            >
                              Add
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>

          <div className="mt-6 flex justify-center gap-2">
            {trendingProducts.map((_, index) => (
              <button
                key={index}
                aria-label={`Go to slide ${index + 1}`}
                className={`h-2.5 rounded-full transition-all ${index === currentSlide ? 'w-8 bg-slate-950' : 'w-2.5 bg-slate-300 hover:bg-slate-400'}`}
                onClick={() => goToSlide(index)}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="mb-10 text-center">
            <Badge className="mb-4 border-pink-200 bg-pink-50 text-pink-700 shadow-sm">Curated collections</Badge>
            <h2 className="text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-4xl">Shop by category</h2>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {categoryCards.map((category, index) => (
              <motion.div key={category.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.1 }}>
                <Card className="group cursor-pointer overflow-hidden border border-slate-200 bg-white shadow-[0_20px_45px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_25px_50px_rgba(236,72,153,0.12)]" onClick={category.onClick}>
                  <CardContent className="p-0">
                    <div className="relative h-[360px] overflow-hidden">
                      <div className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105" style={{ backgroundImage: `url(${category.image})` }} />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                        <p className="mb-2 text-[11px] uppercase tracking-[0.2em] text-pink-200">Collection</p>
                        <h3 className="mb-2 text-2xl font-semibold">{category.title}</h3>
                        <p className="mb-4 text-sm text-slate-200">{category.subtitle}</p>
                        <Button variant="secondary" className="bg-white text-slate-900 hover:bg-pink-50" onClick={(event) => { event.stopPropagation(); category.onClick(); }}>
                          {category.action}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-2">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
              <div className="mb-8 flex items-center gap-3">
                <Badge className="border-pink-200 bg-pink-50 text-pink-700 shadow-sm">Best sellers</Badge>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                {bestSellers.map((product) => (
                  <ProductCard key={product.id} product={product} onAddToCart={(item) => onAddToCart?.(item)} onViewProduct={onViewProduct} />
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.1 }}>
              <div className="mb-8 flex items-center gap-3">
                <Badge className="border-pink-200 bg-pink-50 text-pink-700 shadow-sm">New arrivals</Badge>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                {newArrivals.map((product) => (
                  <ProductCard key={product.id} product={product} onAddToCart={(item) => onAddToCart?.(item)} onViewProduct={onViewProduct} />
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-slate-950 via-slate-900 to-pink-950 py-20 text-white">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
            <div className="mb-5 inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 p-3 text-pink-200">
              <MessageCircle className="h-5 w-5" />
            </div>
            <h2 className="mb-4 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Need a little guidance?</h2>
            <p className="mx-auto max-w-2xl text-lg text-slate-200">Please feel free to contact us for any product enquiries or further information.</p>
            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <Button className="bg-white text-slate-950 hover:bg-pink-50" onClick={() => onNavigate('contact')}>
                Contact us
              </Button>
              <Button variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/10" onClick={() => onNavigate('blog')}>
                Read our blog
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { icon: Package, title: 'Discreet packaging', description: 'Private, secure delivery to keep your order confidential.' },
              { icon: Shield, title: 'Secure checkout', description: 'Trusted payment options with a smooth, safe shopping experience.' },
              { icon: Truck, title: 'Fast delivery', description: 'National delivery with quick turnaround times across Kenya.' }
            ].map((feature, index) => (
              <motion.div key={feature.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.08 }}>
                <Card className="h-full border border-slate-200 bg-white shadow-[0_20px_45px_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_25px_50px_rgba(236,72,153,0.10)]">
                  <CardContent className="flex h-full flex-col items-center p-8 text-center">
                    <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-pink-50 text-pink-600">
                      <feature.icon className="h-7 w-7" />
                    </div>
                    <h3 className="mb-3 text-xl font-semibold text-slate-950">{feature.title}</h3>
                    <p className="text-slate-600">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}