import { useState, useEffect } from 'react';
import { ArrowLeft, ShoppingCart, Package, Shield, Truck, CreditCard, Mail, Phone, MapPin, MessageCircle, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from 'sonner@2.0.3';

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

interface ProductDetailPageProps {
  productId: string;
  onBack: () => void;
  onAddToCart: (product: Product) => void;
  onCheckout?: (product: Product) => void;
}

export function ProductDetailPage({ productId, onBack, onAddToCart, onCheckout }: ProductDetailPageProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  useEffect(() => {
    loadProduct();
  }, [productId]);

  const loadProduct = async () => {
    setLoading(true);
    try {
      // Fetch the specific product
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-afd25991/products/${productId}`,
        {
          headers: { Authorization: `Bearer ${publicAnonKey}` }
        }
      );
      const data = await response.json();
      setProduct(data.product);

      // Fetch related products from same category
      if (data.product) {
        const relatedRes = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-afd25991/products?store=${data.product.store}`,
          {
            headers: { Authorization: `Bearer ${publicAnonKey}` }
          }
        );
        const relatedData = await relatedRes.json();
        const related = (relatedData.products || [])
          .filter((p: Product) => p.category === data.product.category && p.id !== productId)
          .slice(0, 4);
        setRelatedProducts(related);
      }
    } catch (error) {
      console.error('Error loading product:', error);
      toast.error('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted rounded w-32" />
            <div className="grid md:grid-cols-2 gap-8">
              <div className="aspect-square bg-muted rounded-lg" />
              <div className="space-y-4">
                <div className="h-8 bg-muted rounded w-3/4" />
                <div className="h-6 bg-muted rounded w-1/4" />
                <div className="h-24 bg-muted rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Product not found</p>
          <Button onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Products
        </Button>

        {/* Product Detail */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Image */}
          <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
            <ImageWithFallback
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {!product.inStock && (
              <Badge className="absolute top-4 right-4" variant="destructive">
                Out of Stock
              </Badge>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <Badge variant="secondary" className="mb-2">
                {product.category}
              </Badge>
              <h1 className="mb-3">{product.name}</h1>
              <p className="text-3xl text-primary mb-4">
                KSh {product.price.toLocaleString()}
              </p>
            </div>

            <Separator />

            <div>
              <h3 className="mb-2">Description</h3>
              <p className="text-muted-foreground leading-relaxed">
                {product.description || 'No description available.'}
              </p>
            </div>

            <Separator />

            {/* Features */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Package className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Discreet Packaging</p>
                  <p className="text-sm text-muted-foreground">
                    Plain packaging for your privacy
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Quality Guaranteed</p>
                  <p className="text-sm text-muted-foreground">
                    Premium products from trusted brands
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Truck className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Fast Delivery</p>
                  <p className="text-sm text-muted-foreground">
                    1-2 business days within Nairobi
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Action Buttons */}
            <div className="space-y-3">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  size="lg"
                  className="w-full relative overflow-hidden group shadow-lg"
                  style={{
                    background: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)',
                  }}
                  onClick={() => {
                    if (onCheckout) {
                      onCheckout(product);
                    }
                  }}
                  disabled={!product.inStock}
                >
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
                  <CreditCard className="h-5 w-5 mr-2 relative z-10" />
                  <span className="relative z-10">
                    {product.inStock ? 'Buy Now - Checkout' : 'Out of Stock'}
                  </span>
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full border-2 border-primary/50 hover:bg-primary/10"
                  onClick={() => {
                    onAddToCart(product);
                    toast.success('Added to cart!');
                  }}
                  disabled={!product.inStock}
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Add to Cart
                </Button>
              </motion.div>
            </div>

            <Separator />

            {/* Contact Information Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <h4 className="text-primary">Contact Information</h4>
                  </div>
                  <div className="space-y-4">
                    {/* WhatsApp */}
                    <motion.a
                      href="https://wa.me/254112327141"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg bg-background/50 hover:bg-background transition-all group"
                      whileHover={{ x: 5 }}
                    >
                      <div className="relative">
                        <MessageCircle className="h-5 w-5 text-primary" />
                        <motion.div
                          className="absolute inset-0 bg-primary/20 rounded-full blur-md"
                          animate={{
                            scale: [1, 1.3, 1],
                            opacity: [0.5, 0.8, 0.5]
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity
                          }}
                        />
                      </div>
                      <div>
                        <p className="text-sm">WhatsApp</p>
                        <p className="text-xs text-muted-foreground">+254 112 327 141</p>
                      </div>
                    </motion.a>

                    {/* Email */}
                    <motion.a
                      href="mailto:hello@sensualkenya.co.ke"
                      className="flex items-center gap-3 p-3 rounded-lg bg-background/50 hover:bg-background transition-all group"
                      whileHover={{ x: 5 }}
                    >
                      <div className="relative">
                        <Mail className="h-5 w-5 text-primary" />
                        <motion.div
                          className="absolute inset-0 bg-primary/20 rounded-full blur-md"
                          animate={{
                            scale: [1, 1.3, 1],
                            opacity: [0.5, 0.8, 0.5]
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: 0.5
                          }}
                        />
                      </div>
                      <div>
                        <p className="text-sm">Email</p>
                        <p className="text-xs text-muted-foreground">hello@sensualkenya.co.ke</p>
                      </div>
                    </motion.a>

                    {/* Phone */}
                    <motion.a
                      href="tel:+254112327141"
                      className="flex items-center gap-3 p-3 rounded-lg bg-background/50 hover:bg-background transition-all group"
                      whileHover={{ x: 5 }}
                    >
                      <div className="relative">
                        <Phone className="h-5 w-5 text-primary" />
                        <motion.div
                          className="absolute inset-0 bg-primary/20 rounded-full blur-md"
                          animate={{
                            scale: [1, 1.3, 1],
                            opacity: [0.5, 0.8, 0.5]
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: 1
                          }}
                        />
                      </div>
                      <div>
                        <p className="text-sm">Phone</p>
                        <p className="text-xs text-muted-foreground">+254 112 327 141</p>
                      </div>
                    </motion.a>

                    {/* Location */}
                    <motion.div
                      className="flex items-center gap-3 p-3 rounded-lg bg-background/50"
                      whileHover={{ x: 5 }}
                    >
                      <div className="relative">
                        <MapPin className="h-5 w-5 text-primary" />
                        <motion.div
                          className="absolute inset-0 bg-primary/20 rounded-full blur-md"
                          animate={{
                            scale: [1, 1.3, 1],
                            opacity: [0.5, 0.8, 0.5]
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: 1.5
                          }}
                        />
                      </div>
                      <div>
                        <p className="text-sm">Location</p>
                        <p className="text-xs text-muted-foreground">Nairobi, Kenya</p>
                      </div>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="mb-6">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.map((related) => (
                <Card
                  key={related.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => {
                    setProduct(related);
                    setLoading(true);
                    loadProduct();
                    window.scrollTo(0, 0);
                  }}
                >
                  <CardContent className="p-0">
                    <div className="aspect-square overflow-hidden rounded-t-lg">
                      <ImageWithFallback
                        src={related.image}
                        alt={related.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="p-3">
                      <h4 className="text-sm line-clamp-1 mb-1">{related.name}</h4>
                      <p className="text-primary text-sm">
                        KSh {related.price.toLocaleString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
