import { MessageCircle, Mail, Phone, MapPin, Clock, Sparkles, Heart, Lock, ShoppingBag, Truck, CreditCard, RotateCcw, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

interface ContactPageProps {
  onShowAdminAuth?: () => void;
}

export function ContactPage({ onShowAdminAuth }: ContactPageProps) {
  const handleWhatsApp = () => {
    window.open('https://wa.me/254112327141', '_blank');
  };

  const contactInfo = [
    {
      icon: MessageCircle,
      title: 'WhatsApp',
      content: '+254 112 327 141',
      action: handleWhatsApp
    },
    {
      icon: Mail,
      title: 'Email',
      content: 'hello@sensualkenya.co.ke',
      action: () => window.location.href = 'mailto:hello@sensualkenya.co.ke'
    },
    {
      icon: Phone,
      title: 'Phone',
      content: '+254 112 327 141',
      action: () => window.location.href = 'tel:+254112327141'
    },
    {
      icon: MapPin,
      title: 'Location',
      content: 'Nairobi, Kenya',
      action: null
    }
  ];

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
              backgroundImage: 'url(https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200)',
            }}
          />
          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-pink-900/70 to-purple-900/80" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </motion.div>

        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              initial={{ 
                x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
                y: (typeof window !== 'undefined' ? window.innerHeight : 800) + 50,
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
        
        <div className="container mx-auto px-4 py-24 relative z-10">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
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
              <Badge className="px-4 py-2 text-sm shadow-xl">
                <MessageCircle className="h-3 w-3 mr-2" />
                We're Here to Help
              </Badge>
            </motion.div>

            {/* Title with Glow */}
            <h1 
              className="text-white mb-6 drop-shadow-2xl"
              style={{
                textShadow: '0 0 40px rgba(236, 72, 153, 0.4), 0 0 80px rgba(236, 72, 153, 0.2)',
              }}
            >
              Get in Touch
            </h1>
            
            <motion.p 
              className="text-white/95 text-xl max-w-2xl mx-auto drop-shadow-lg"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              We're here to help with any questions or concerns
            </motion.p>
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

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Contact Information Cards */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-12"
          >
            <h2 className="text-center mb-8">Contact Information</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {contactInfo.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    whileHover={{ scale: 1.03, y: -5 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card 
                      className={`h-full ${item.action ? 'cursor-pointer hover:shadow-xl hover:border-primary/50' : ''} transition-all duration-300`}
                      onClick={item.action || undefined}
                    >
                      <CardContent className="flex items-center gap-4 p-6">
                        <motion.div 
                          className="p-4 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 relative"
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.6 }}
                        >
                          <Icon className="h-6 w-6 text-primary" />
                          {/* Glow Effect */}
                          <motion.div
                            className="absolute inset-0 bg-primary/20 rounded-full blur-md"
                            animate={{
                              scale: [1, 1.3, 1],
                              opacity: [0.5, 0.8, 0.5]
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              delay: index * 0.3
                            }}
                          />
                        </motion.div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">{item.title}</p>
                          <p className="font-medium">{item.content}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Business Hours */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mb-12"
          >
            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Business Hours
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                {[
                  { day: 'Monday - Friday', hours: '9:00 AM - 6:00 PM' },
                  { day: 'Saturday', hours: '10:00 AM - 4:00 PM' },
                  { day: 'Sunday', hours: 'Closed' }
                ].map((schedule, index) => (
                  <motion.div 
                    key={index}
                    className="flex justify-between items-center p-3 rounded-lg hover:bg-muted/50 transition-colors"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.9 + index * 0.1 }}
                  >
                    <span className="text-muted-foreground">{schedule.day}</span>
                    <span className="font-medium">{schedule.hours}</span>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* WhatsApp CTA */}
          <motion.div
            initial={{ y: 20, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ delay: 1.2, type: "spring" }}
            whileHover={{ scale: 1.02 }}
          >
            <Card className="relative overflow-hidden border-0 shadow-2xl">
              {/* Gradient Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary via-pink-500 to-purple-600" />
              
              {/* Animated Shine Effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{
                  x: ['-100%', '100%']
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatDelay: 2
                }}
              />

              <CardContent className="p-8 text-center relative z-10">
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
                  <MessageCircle className="h-16 w-16 mx-auto mb-4 text-white" />
                </motion.div>
                
                <h3 className="text-white mb-3">Quick Response via WhatsApp</h3>
                <p className="text-white/90 mb-6 text-lg">
                  Get instant answers to your questions
                </p>
                
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    variant="secondary" 
                    onClick={handleWhatsApp}
                    className="gap-2 px-8 py-6 text-lg shadow-xl"
                    size="lg"
                  >
                    <MessageCircle className="h-5 w-5" />
                    Chat on WhatsApp
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Support Message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="text-center mt-8"
          >
            <p className="text-muted-foreground">
              We typically respond within 24 hours • Available 9 AM - 9 PM EAT
            </p>
          </motion.div>

          {/* Shop Policy Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.7 }}
            className="mt-16"
          >
            <div className="text-center mb-8">
              <h2 className="mb-2">Shop Policy</h2>
              <p className="text-muted-foreground">
                Important information about our ordering and delivery process
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Orders Policy */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.8 }}
                whileHover={{ y: -5, scale: 1.02 }}
              >
                <Card className="h-full border-2 border-primary/20 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10">
                  <CardContent className="p-6">
                    <motion.div
                      className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-4 mx-auto"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <ShoppingBag className="h-6 w-6 text-primary" />
                    </motion.div>
                    <h3 className="text-center mb-3">Orders</h3>
                    <div className="space-y-3 text-sm text-muted-foreground">
                      <div className="flex gap-2">
                        <AlertCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <p>All items are carefully inspected before dispatch</p>
                      </div>
                      <div className="flex gap-2">
                        <AlertCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <p>Items reserved only after full payment</p>
                      </div>
                      <div className="flex gap-2">
                        <AlertCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <p>Availability depends on current market price if unpaid</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Delivery Policy */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.9 }}
                whileHover={{ y: -5, scale: 1.02 }}
              >
                <Card className="h-full border-2 border-primary/20 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10">
                  <CardContent className="p-6">
                    <motion.div
                      className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-4 mx-auto"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <Truck className="h-6 w-6 text-primary" />
                    </motion.div>
                    <h3 className="text-center mb-3">Delivery</h3>
                    <div className="space-y-3 text-sm text-muted-foreground">
                      <div className="flex gap-2">
                        <Sparkles className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <p><strong className="text-foreground">Free delivery</strong> within Nairobi CBD</p>
                      </div>
                      <div className="flex gap-2">
                        <Sparkles className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <p>Outside Nairobi: Full payment required for courier/shuttle</p>
                      </div>
                      <div className="flex gap-2">
                        <Sparkles className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <p>100% discreet packaging guaranteed</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Payment Policy */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.0 }}
                whileHover={{ y: -5, scale: 1.02 }}
              >
                <Card className="h-full border-2 border-primary/20 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10">
                  <CardContent className="p-6">
                    <motion.div
                      className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-4 mx-auto"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <CreditCard className="h-6 w-6 text-primary" />
                    </motion.div>
                    <h3 className="text-center mb-3">Payment</h3>
                    <div className="space-y-3 text-sm text-muted-foreground">
                      <div className="flex gap-2">
                        <Heart className="h-4 w-4 text-primary flex-shrink-0 mt-0.5 fill-primary" />
                        <p><strong className="text-foreground">M-Pesa Till:</strong> 8499736</p>
                      </div>
                      <div className="flex gap-2">
                        <Heart className="h-4 w-4 text-primary flex-shrink-0 mt-0.5 fill-primary" />
                        <p><strong className="text-foreground">Cash on Delivery:</strong> Nairobi only (via official riders)</p>
                      </div>
                      <div className="flex gap-2">
                        <Heart className="h-4 w-4 text-primary flex-shrink-0 mt-0.5 fill-primary" />
                        <p>Full payment secures your order</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Returns Policy */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
              >
                <Card className="h-full border-2 border-primary/20 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10">
                  <CardContent className="p-6">
                    <motion.div
                      className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-4 mx-auto"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <RotateCcw className="h-6 w-6 text-primary" />
                    </motion.div>
                    <h3 className="text-center mb-3">Returns</h3>
                    <div className="space-y-3 text-sm text-muted-foreground">
                      <div className="flex gap-2">
                        <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
                        <p><strong className="text-foreground">No returns, refunds, or exchanges</strong></p>
                      </div>
                      <div className="flex gap-2">
                        <Sparkles className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <p>All products inspected for quality before shipping</p>
                      </div>
                      <div className="flex gap-2">
                        <Heart className="h-4 w-4 text-primary flex-shrink-0 mt-0.5 fill-primary" />
                        <p>Thank you for your understanding and cooperation</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Policy Notice */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.3 }}
              className="mt-8 p-6 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-xl border border-primary/20"
            >
              <div className="flex gap-3 items-start max-w-4xl mx-auto">
                <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="mb-2">
                    <strong>Important:</strong> By placing an order with Sensual Kenya, you acknowledge and agree to our shop policy. 
                    All items are carefully selected and inspected to ensure the highest quality for our valued customers.
                  </p>
                  <p className="text-muted-foreground">
                    For any questions or concerns, please contact us via WhatsApp at <strong className="text-primary">+254 112 327 141</strong> before placing your order.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Admin Access - Hidden at bottom */}
          {onShowAdminAuth && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.5 }}
              className="text-center mt-12 pt-8 border-t border-border/50"
            >
              <button
                onClick={onShowAdminAuth}
                className="text-xs text-muted-foreground/40 hover:text-primary/60 transition-colors"
              >
                <Lock className="h-3 w-3 inline mr-1" />
                Admin Access
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
