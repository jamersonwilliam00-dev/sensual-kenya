import { useState } from 'react';
import { Trash2, Plus, Minus, ShoppingBag, MessageCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { RegionSelector } from './RegionSelector';
import { Badge } from './ui/badge';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  category: string;
}

interface CartPageProps {
  items: CartItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
  onCheckout: (deliveryInfo: { charge: number; location: string; total: number }) => void;
}

export function CartPage({ items, onUpdateQuantity, onRemove, onCheckout }: CartPageProps) {
  const [deliveryCharge, setDeliveryCharge] = useState<number>(0);
  const [deliveryLocation, setDeliveryLocation] = useState<string>('');

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal + deliveryCharge;

  const handleRegionSelect = (charge: number, region: string) => {
    setDeliveryCharge(charge);
    setDeliveryLocation(region);
  };

  const handleWhatsAppCheckout = () => {
    if (!deliveryLocation) {
      alert('Please select your delivery location first');
      return;
    }

    const message = `Hi! I'd like to place an order:\n\n${items
      .map(item => `${item.name} x${item.quantity} - KSh ${(item.price * item.quantity).toLocaleString()}`)
      .join('\n')}\n\nSubtotal: KSh ${subtotal.toLocaleString()}\nDelivery (${deliveryLocation}): KSh ${deliveryCharge.toLocaleString()}\n\nTotal: KSh ${total.toLocaleString()}\n\nPayment by M-Pesa Paybill: 247247, Account Number: 0706525741, Account Name: Paul M`;
    
    window.open(`https://wa.me/254112327141?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-20 text-center">
          <ShoppingBag className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
          <h2 className="mb-4">Your cart is empty</h2>
          <p className="text-muted-foreground mb-8">
            Start shopping to add items to your cart
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-8">Shopping Cart</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      <ImageWithFallback
                        src={item.image || 'https://images.unsplash.com/photo-1625154253125-5d89afab6c7c?w=200'}
                        alt={item.name}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="mb-1 truncate">{item.name}</h4>
                      <p className="text-sm text-muted-foreground mb-2">{item.category}</p>
                      <p className="text-primary">KSh {item.price.toLocaleString()}</p>
                    </div>
                    <div className="flex flex-col items-end justify-between">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onRemove(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <div className="flex items-center gap-2 border rounded-lg">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary & Delivery */}
          <div className="lg:col-span-1 space-y-4">
            {/* Region Selector */}
            <RegionSelector 
              onSelect={handleRegionSelect}
              selectedRegion={deliveryLocation}
            />

            {/* Order Summary */}
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>KSh {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery</span>
                  <span>
                    {deliveryCharge > 0 ? `KSh ${deliveryCharge.toLocaleString()}` : 'Select location'}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span>Total</span>
                  <span className="text-xl text-primary">
                    KSh {total.toLocaleString()}
                  </span>
                </div>
                
                {/* M-Pesa Till Info */}
                <div className="p-3 bg-primary/10 rounded-lg text-center">
                Pay to: 
                <br/>
                Paybill Number: <span className="text-primary font-semibold">247247</span>
                <br/>
                Account Number: <span className="text-primary font-semibold">0706525741</span>
                <br/>
                Account Name: <span className="text-primary font-semibold">Eric M</span>
                </div>
              </CardContent>
              <CardFooter className="flex-col gap-3">
                <Button 
                  className="w-full gap-2" 
                  onClick={handleWhatsAppCheckout}
                  disabled={!deliveryLocation}
                >
                  <MessageCircle className="h-4 w-4" />
                  Complete Order via WhatsApp
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  Send us your order details on WhatsApp. M-Pesa Paybill: 247247, Account Number: 0706525741, Account Name: Paul M
                </p>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
