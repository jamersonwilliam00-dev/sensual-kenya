import { ShoppingCart, Heart } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardFooter } from './ui/card';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image?: string;
  description?: string;
  inStock?: boolean;
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onViewProduct?: (productId: string) => void;
}

export function ProductCard({ product, onAddToCart, onViewProduct }: ProductCardProps) {
  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-shadow">
      <CardContent className="p-0">
        <div 
          className="relative aspect-square overflow-hidden bg-muted cursor-pointer"
          onClick={() => onViewProduct?.(product.id)}
        >
          <ImageWithFallback
            src={product.image || 'https://images.unsplash.com/photo-1625154253125-5d89afab6c7c?w=400'}
            alt={product.name}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
          />
          {product.inStock === false && (
            <Badge variant="destructive" className="absolute top-2 right-2">
              Out of Stock
            </Badge>
          )}
          <button className="absolute top-2 left-2 p-2 rounded-full bg-white/90 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white">
            <Heart className="h-4 w-4 text-pink-600" />
          </button>
        </div>
        <div 
          className="p-4 cursor-pointer"
          onClick={() => onViewProduct?.(product.id)}
        >
          <Badge variant="secondary" className="mb-2">
            {product.category}
          </Badge>
          <h3 className="line-clamp-1 mb-1">{product.name}</h3>
          {product.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
              {product.description}
            </p>
          )}
          <p className="text-primary">KSh {product.price.toLocaleString()}</p>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 gap-2">
        {onViewProduct && (
          <Button 
            variant="outline"
            className="flex-1" 
            onClick={(e) => {
              e.stopPropagation();
              onViewProduct(product.id);
            }}
          >
            View Details
          </Button>
        )}
        <Button 
          className="flex-1 gap-2" 
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart(product);
          }}
          disabled={product.inStock === false}
        >
          <ShoppingCart className="h-4 w-4" />
          {onViewProduct ? 'Add' : 'Add to Cart'}
        </Button>
      </CardFooter>
    </Card>
  );
}
