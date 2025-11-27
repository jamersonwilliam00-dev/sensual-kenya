import { useState, useEffect } from 'react';
import { Search, Filter, Sparkles, TrendingUp, Heart, Star } from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import { ProductCard } from './ProductCard';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Skeleton } from './ui/skeleton';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image?: string;
  description?: string;
  inStock?: boolean;
  store: string;
}

interface StorePageProps {
  store: 'main' | 'lingerie';
  title: string;
  onAddToCart: (product: Product) => void;
  onViewProduct?: (productId: string) => void;
  onNavigate?: (section: string) => void;
}

// Floating particles effect
function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(10)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          initial={{ 
            x: Math.random() * window.innerWidth,
            y: window.innerHeight + 50,
            opacity: 0.3,
          }}
          animate={{
            y: -100,
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: Math.random() * 5 + 10,
            repeat: Infinity,
            delay: Math.random() * 3,
            ease: "linear"
          }}
        >
          {i % 2 === 0 ? (
            <Heart className="h-4 w-4 text-pink-400/40 fill-current" />
          ) : (
            <Sparkles className="h-4 w-4 text-pink-400/40" />
          )}
        </motion.div>
      ))}
    </div>
  );
}

export function StorePage({ store, title, onAddToCart, onViewProduct, onNavigate }: StorePageProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    loadData();
  }, [store]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Fetch products
      const productsRes = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-afd25991/products?store=${store}`,
        {
          headers: { Authorization: `Bearer ${publicAnonKey}` }
        }
      );
      const productsData = await productsRes.json();
      setProducts(productsData.products || []);

      // Fetch categories
      const categoriesRes = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-afd25991/categories/${store}`,
        {
          headers: { Authorization: `Bearer ${publicAnonKey}` }
        }
      );
      const categoriesData = await categoriesRes.json();
      setCategories(categoriesData.categories || []);
    } catch (error) {
      console.error('Error loading store data:', error);
    } finally {
      setLoading(false);
    }
  };

  const allProductsLabel = store === 'main' ? 'All Products for Adult Toys' : 'All Products for Lingerie';

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const headerBgImage = store === 'main' 
    ? 'https://images.unsplash.com/photo-1664347770836-03d04faa3c04?w=1200'
    : 'https://images.unsplash.com/photo-1668191219162-b58465065deb?w=1200';

  return (
    <div className="min-h-screen bg-background">
      {/* Luxurious Header with Background Image */}
      <motion.div 
        className="relative text-white overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Background Image with Parallax */}
        <motion.div
          className="absolute inset-0"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${headerBgImage})`,
            }}
          />
          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-pink-900/70 to-purple-900/80" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </motion.div>

        {/* Floating Particles */}
        <FloatingParticles />
        
        <div className="container mx-auto px-4 py-24 relative z-10">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: isVisible ? 0 : 30, opacity: isVisible ? 1 : 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center"
          >
            {/* Badge */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
              className="inline-block mb-6"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Badge 
                  className="px-4 py-2 text-sm shadow-xl cursor-pointer hover:shadow-2xl transition-all"
                  onClick={() => onNavigate?.(store === 'main' ? 'lingerie-store' : 'main-store')}
                >
                  <TrendingUp className="h-3 w-3 mr-2" />
                  {store === 'main' ? 'Go to Lingerie and Pajamas Section' : 'Go to Adult Toys Section'}
                </Badge>
              </motion.div>
            </motion.div>

            {/* Title with Glow */}
            <h1 
              className="text-white mb-6 drop-shadow-2xl"
              style={{
                textShadow: '0 0 40px rgba(236, 72, 153, 0.4), 0 0 80px rgba(236, 72, 153, 0.2)',
              }}
            >
              {title}
            </h1>
            
            <motion.p 
              className="text-white/95 text-xl max-w-2xl mx-auto drop-shadow-lg"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              {store === 'main' 
                ? 'Premium intimate products for enhanced pleasure and wellness.'
                : 'Elegant lingerie and sleepwear that makes you feel beautiful.'
              }
            </motion.p>

            {/* Decorative Stars */}
            <div className="flex justify-center gap-2 mt-8">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.5 + i * 0.1, type: "spring" }}
                >
                  <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bottom Wave Effect */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-16">
            <motion.path
              d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
              className="fill-background"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            />
          </svg>
        </div>
      </motion.div>

      <div className="container mx-auto px-4 py-8">
        {/* Filters Section */}
        <motion.div 
          className="mb-12 space-y-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {/* Search Bar */}
          <motion.div 
            className="max-w-2xl mx-auto"
            whileHover={{ scale: 1.01 }}
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 text-lg border-2 border-primary/20 focus:border-primary rounded-xl shadow-lg"
              />
              <motion.div
                className="absolute right-4 top-1/2 transform -translate-y-1/2"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Button size="icon" variant="ghost" className="rounded-full">
                  <Filter className="h-5 w-5 text-primary" />
                </Button>
              </motion.div>
            </div>
          </motion.div>

          {/* Category Filters */}
          <div className="flex flex-wrap justify-center gap-3">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Badge
                variant={selectedCategory === 'All' ? 'default' : 'outline'}
                className={`cursor-pointer px-6 py-3 text-sm rounded-full transition-all ${
                  selectedCategory === 'All' 
                    ? 'shadow-lg shadow-primary/30' 
                    : 'hover:border-primary/50'
                }`}
                onClick={() => setSelectedCategory('All')}
              >
                {allProductsLabel}
              </Badge>
            </motion.div>
            {categories.map((category, index) => (
              <motion.div
                key={category}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4 + index * 0.05 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Badge
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  className={`cursor-pointer px-6 py-3 text-sm rounded-full transition-all ${
                    selectedCategory === category 
                      ? 'shadow-lg shadow-primary/30' 
                      : 'hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Badge>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Products Grid - Optimized for Mobile (2-3 columns) */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {[...Array(10)].map((_, i) => (
                <motion.div 
                  key={i} 
                  className="space-y-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Skeleton className="aspect-square w-full rounded-xl" />
                  <Skeleton className="h-4 w-3/4 rounded-full" />
                  <Skeleton className="h-4 w-1/2 rounded-full" />
                </motion.div>
              ))}
            </motion.div>
          ) : filteredProducts.length === 0 ? (
            <motion.div 
              className="text-center py-20"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
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
                <Sparkles className="h-16 w-16 text-primary mx-auto mb-4 opacity-50" />
              </motion.div>
              <h3 className="mb-2">No products found</h3>
              <p className="text-muted-foreground">
                {products.length === 0 
                  ? 'Products will be added soon. Check back later!'
                  : 'Try adjusting your filters or search query.'
                }
              </p>
            </motion.div>
          ) : (
            <motion.div 
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.5 }}
                >
                  <ProductCard
                    product={product}
                    onAddToCart={onAddToCart}
                    onViewProduct={onViewProduct}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Count */}
        {!loading && filteredProducts.length > 0 && (
          <motion.div
            className="text-center mt-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Badge variant="outline" className="px-6 py-2 text-sm">
              Showing {filteredProducts.length} of {products.length} products
            </Badge>
          </motion.div>
        )}
      </div>
    </div>
  );
}
