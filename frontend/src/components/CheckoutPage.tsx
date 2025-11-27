import { useState } from 'react';
import { motion } from "framer-motion";
import { ArrowLeft, Package, MapPin, Phone, CreditCard, Sparkles, Check, MessageCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { RegionSelector } from './RegionSelector';
import { toast } from 'sonner@2.0.3';

interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
  category: string;
}

interface CheckoutPageProps {
  product: Product;
  onBack: () => void;
}

export function CheckoutPage({ product, onBack }: CheckoutPageProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    location: '',
    additionalNotes: ''
  });
  const [deliveryFee, setDeliveryFee] = useState<number | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const total = deliveryFee !== null ? product.price + deliveryFee : null;

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRegionSelect = (charge: number, region: string) => {
    setDeliveryFee(charge);
    setSelectedRegion(region);
    setFormData(prev => ({ ...prev, location: region }));
  };

  const handleCheckout = () => {
    // Validate form
    if (!formData.name || !formData.phone || !selectedRegion) {
      toast.error('Please fill in all required fields and select a delivery location');
      return;
    }

    setIsProcessing(true);

    // Create WhatsApp message
    const message = `
🛍️ *New Order from Sensual Kenya*

📦 *Product:* ${product.name}
💰 *Price:* KSh ${product.price.toLocaleString()}
🚚 *Delivery Fee:* KSh ${deliveryFee === 0 ? 'FREE' : deliveryFee?.toLocaleString()}
💳 *Total:* KSh ${total?.toLocaleString()}

👤 *Customer Details:*
• Name: ${formData.name}
• Phone: ${formData.phone}
• Email: ${formData.email || 'Not provided'}
• Location: ${formData.location}

📝 *Additional Notes:*
${formData.additionalNotes || 'None'}

💳 *Payment:* M-Pesa Paybill: 247247, Account Number: 0706525741, Account Name: Paul M
    `.trim();

    const whatsappUrl = `https://wa.me/254112327141?text=${encodeURIComponent(message)}`;
    
    setTimeout(() => {
      window.open(whatsappUrl, '_blank');
      toast.success('Redirecting to WhatsApp...');
      setIsProcessing(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
            >
              <Badge className="mb-4 px-4 py-2 shadow-lg">
                <Sparkles className="h-3 w-3 mr-2" />
                Secure Checkout
              </Badge>
            </motion.div>
            <h1 
              className="mb-2"
              style={{
                background: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Complete Your Order
            </h1>
            <p className="text-muted-foreground">
              Just one step away from your purchase
            </p>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Product Card */}
                <div className="flex gap-4 p-4 rounded-lg bg-muted/50">
                  <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                    <ImageWithFallback
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <Badge variant="secondary" className="mb-2 text-xs">
                      {product.category}
                    </Badge>
                    <h4 className="mb-1 line-clamp-2">{product.name}</h4>
                    <p className="text-primary">
                      KSh {product.price.toLocaleString()}
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Price Breakdown */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>KSh {product.price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Delivery Fee</span>
                    {deliveryFee !== null ? (
                      <span className={deliveryFee === 0 ? 'text-green-500' : ''}>
                        {deliveryFee === 0 ? 'FREE 🎉' : `KSh ${deliveryFee.toLocaleString()}`}
                      </span>
                    ) : (
                      <span className="text-xs italic text-muted-foreground">Select location</span>
                    )}
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span>Total</span>
                    {total !== null ? (
                      <span className="text-primary" style={{ fontSize: '1.25rem', fontWeight: 600 }}>
                        KSh {total.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-xs italic text-muted-foreground">-</span>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Payment Info */}
                <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                  <div className="flex items-start gap-3">
                    <CreditCard className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm mb-1">M-Pesa Payment</p>
                      <p className="text-xs text-muted-foreground">
                        Pay to Paybill Number: <span className="text-primary font-semibold">247247</span>
                        <br/>
                        Account Number: <span className="text-primary font-semibold">0706525741</span>
                        <br/>
                        Account Name: <span className="text-primary font-semibold">Eric M</span>
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Customer Information Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-primary" />
                  Your Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Nickname */}
                <div>
                  <Label htmlFor="name">Nickname *</Label>
                  <Input
                    id="name"
                    placeholder="What should we call you?"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="mt-1.5"
                  />
                </div>

                {/* Phone */}
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+254 712 345 678"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="mt-1.5"
                  />
                </div>

                {/* Email */}
                <div>
                  <Label htmlFor="email">Email (Optional)</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="mt-1.5"
                  />
                </div>

                {/* Additional Notes */}
                <div>
                  <Label htmlFor="notes">Additional Notes (Optional)</Label>
                  <Input
                    id="notes"
                    placeholder="Any special instructions?"
                    value={formData.additionalNotes}
                    onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
                    className="mt-1.5"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Region Selector */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <RegionSelector 
                onSelect={handleRegionSelect}
                selectedRegion={selectedRegion}
              />
            </motion.div>

            {/* Features & Checkout */}
            <Card>
              <CardContent className="pt-6 space-y-6">
                {/* Features */}
                <div className="grid grid-cols-1 gap-3">
                  {[
                    { icon: Package, text: '100% Discreet Packaging' },
                    { icon: Check, text: 'Secure Payment via M-Pesa' },
                    { icon: MessageCircle, text: 'Order Confirmation via WhatsApp' }
                  ].map((feature, index) => (
                    <motion.div
                      key={index}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                    >
                      <feature.icon className="h-4 w-4 text-primary" />
                      <p className="text-sm text-muted-foreground">{feature.text}</p>
                    </motion.div>
                  ))}
                </div>

                <Separator />

                {/* Complete Order Button */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    size="lg"
                    className="w-full relative overflow-hidden shadow-lg"
                    style={{
                      background: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)',
                    }}
                    onClick={handleCheckout}
                    disabled={isProcessing || deliveryFee === null}
                  >
                    {/* Shimmer Effect */}
                    {!isProcessing && deliveryFee !== null && (
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
                    )}
                    <MessageCircle className="h-5 w-5 mr-2 relative z-10" />
                    <span className="relative z-10">
                      {isProcessing 
                        ? 'Processing...' 
                        : deliveryFee === null 
                          ? 'Select Delivery Location First'
                          : 'Complete Order via WhatsApp'}
                    </span>
                  </Button>
                </motion.div>

                <p className="text-xs text-center text-muted-foreground">
                  By completing this order, you agree to our terms and conditions.
                  Your order will be confirmed via WhatsApp.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
