import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Package, FileText, Settings, LogOut, BarChart3, RefreshCw, ShoppingBag, Newspaper, Sparkles, Clock } from 'lucide-react';
import { Button } from './ui/button';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface AdminPanelProps {
  accessToken: string;
  onLogout: () => void;
}

export function AdminPanel({ accessToken, onLogout }: AdminPanelProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [editingPost, setEditingPost] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load products
      const productsRes = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-afd25991/products`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      
      if (!productsRes.ok) {
        throw new Error('Failed to load products');
      }
      
      const productsData = await productsRes.json();
      setProducts(productsData.products || []);

      // Load orders
      const ordersRes = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-afd25991/orders`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      
      if (!ordersRes.ok) {
        throw new Error('Failed to load orders');
      }
      
      const ordersData = await ordersRes.json();
      setOrders(ordersData.orders || []);

      // Load blog posts
      const blogRes = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-afd25991/blog`,
        { headers: { Authorization: `Bearer ${publicAnonKey}` } }
      );
      
      if (!blogRes.ok) {
        throw new Error('Failed to load blog posts');
      }
      
      const blogData = await blogRes.json();
      setBlogPosts(blogData.posts || []);
      
      toast.success('Data loaded successfully');
    } catch (error: any) {
      console.error('Error loading admin data:', error);
      toast.error(error.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const saveProduct = async (product: any) => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-afd25991/products`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`
          },
          body: JSON.stringify(product)
        }
      );
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save product');
      }
      
      toast.success('Product saved successfully');
      setEditingProduct(null);
      loadData();
    } catch (error: any) {
      console.error('Error saving product:', error);
      toast.error(error.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    setLoading(true);
    try {
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-afd25991/products/${id}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${accessToken}` }
        }
      );
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete product');
      }
      
      toast.success('Product deleted');
      loadData();
    } catch (error: any) {
      console.error('Error deleting product:', error);
      toast.error(error.message || 'Failed to delete product');
    } finally {
      setLoading(false);
    }
  };

  const saveBlogPost = async (post: any) => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-afd25991/blog`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`
          },
          body: JSON.stringify({
            ...post,
            createdAt: post.createdAt || new Date().toISOString()
          })
        }
      );
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save blog post');
      }
      
      toast.success('Blog post saved successfully');
      setEditingPost(null);
      loadData();
    } catch (error: any) {
      console.error('Error saving blog post:', error);
      toast.error(error.message || 'Failed to save blog post');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-afd25991/orders/${orderId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`
          },
          body: JSON.stringify({ status })
        }
      );
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update order');
      }
      
      toast.success('Order status updated');
      loadData();
    } catch (error: any) {
      console.error('Error updating order:', error);
      toast.error(error.message || 'Failed to update order');
    } finally {
      setLoading(false);
    }
  };

  const deleteBlogPost = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return;
    
    setLoading(true);
    try {
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-afd25991/blog/${id}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${accessToken}` }
        }
      );
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete blog post');
      }
      
      toast.success('Blog post deleted');
      loadData();
    } catch (error: any) {
      console.error('Error deleting blog post:', error);
      toast.error(error.message || 'Failed to delete blog post');
    } finally {
      setLoading(false);
    }
  };

  const addSampleProducts = async () => {
    const sampleProducts = [
      {
        store: 'main',
        name: 'Anal Ruby Sex Toy',
        price: 3999,
        category: 'Butt Plugs',
        description: 'Premium ruby-studded anal toy for advanced pleasure',
        image: 'https://images.unsplash.com/photo-1625154253125-5d89afab6c7c?w=400',
        inStock: true
      },
      {
        store: 'main',
        name: 'Mini Vibrating Panties',
        price: 2900,
        category: 'Vibrators',
        description: 'Rechargeable, Remote Controlled. Discreet pleasure anywhere',
        image: 'https://images.unsplash.com/photo-1625154253125-5d89afab6c7c?w=400',
        inStock: true
      },
      {
        store: 'main',
        name: 'Anna G-Spot Vibrator',
        price: 3800,
        category: 'Vibrators',
        description: 'Curved design for perfect G-spot stimulation',
        image: 'https://images.unsplash.com/photo-1625154253125-5d89afab6c7c?w=400',
        inStock: true
      },
      {
        store: 'main',
        name: '3-in-1 Male Sex Toy',
        price: 6500,
        category: 'Male Toys',
        description: 'Triple action pleasure device for men',
        image: 'https://images.unsplash.com/photo-1625154253125-5d89afab6c7c?w=400',
        inStock: true
      },
      {
        store: 'main',
        name: 'The Rabbit (New Model)',
        price: 2999,
        category: 'Vibrators',
        description: 'Finding beauty in unexpected places 🫦',
        image: 'https://images.unsplash.com/photo-1625154253125-5d89afab6c7c?w=400',
        inStock: true
      },
      {
        store: 'main',
        name: 'Clit Suction Rose Toy',
        price: 4200,
        category: 'Vibrators',
        description: 'Experience pure bliss with rose petal technology 🌹',
        image: 'https://images.unsplash.com/photo-1625154253125-5d89afab6c7c?w=400',
        inStock: true
      },
      {
        store: 'main',
        name: 'Heating Wand Massager',
        price: 3500,
        category: 'Vibrators',
        description: 'Powerful massage with soothing heat function',
        image: 'https://images.unsplash.com/photo-1625154253125-5d89afab6c7c?w=400',
        inStock: true
      },
      {
        store: 'lingerie',
        name: 'Candi Eros Lingerie',
        price: 999,
        category: 'Sexy Lingerie',
        description: 'Feel irresistible in this stunning set',
        image: 'https://images.unsplash.com/photo-1591079496752-a56c5474af3f?w=400',
        inStock: true
      },
      {
        store: 'lingerie',
        name: 'Kelli Eros Set',
        price: 600,
        category: 'Sexy Sets',
        description: 'Affordable elegance for every occasion',
        image: 'https://images.unsplash.com/photo-1591079496752-a56c5474af3f?w=400',
        inStock: true
      },
      {
        store: 'lingerie',
        name: 'Sexy Floral Lace Bodysuit',
        price: 1600,
        category: 'Sexy Lingerie',
        description: 'Intricate lace design with ultimate comfort',
        image: 'https://images.unsplash.com/photo-1591079496752-a56c5474af3f?w=400',
        inStock: true
      },
      {
        store: 'lingerie',
        name: 'Butterfly Stretch Lace Lingerie',
        price: 1800,
        category: 'Sexy Lingerie',
        description: 'Delicate butterfly pattern with stretch comfort',
        image: 'https://images.unsplash.com/photo-1591079496752-a56c5474af3f?w=400',
        inStock: true
      },
      {
        store: 'lingerie',
        name: 'Full Body Fishnet Outfit',
        price: 1500,
        category: 'Fishnet Stockings',
        description: 'Complete fishnet body suit for bold statements',
        image: 'https://images.unsplash.com/photo-1591079496752-a56c5474af3f?w=400',
        inStock: true
      }
    ];

    setLoading(true);
    try {
      for (const product of sampleProducts) {
        await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-afd25991/products`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`
            },
            body: JSON.stringify(product)
          }
        );
      }
      toast.success('Sample products added successfully!');
      loadData();
    } catch (error) {
      console.error('Error adding sample products:', error);
      toast.error('Failed to add sample products');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative">
      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-card p-6 rounded-lg shadow-lg flex items-center gap-3">
            <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span>Processing...</span>
          </div>
        </div>
      )}
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="mb-1">Admin Panel</h1>
            <p className="text-sm text-muted-foreground">
              Manage your products, orders, and content
            </p>
          </div>
          <Button variant="outline" onClick={onLogout} className="gap-2">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>

        <Tabs defaultValue="analytics" className="w-full">
          <div className="flex justify-between items-center mb-4">
            <TabsList className="grid grid-cols-5 w-auto">
              <TabsTrigger value="analytics" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Analytics</span>
              </TabsTrigger>
              <TabsTrigger value="products" className="gap-2">
                <Package className="h-4 w-4" />
                <span className="hidden sm:inline">Products</span>
              </TabsTrigger>
              <TabsTrigger value="orders" className="gap-2">
                <ShoppingBag className="h-4 w-4" />
                <span className="hidden sm:inline">Orders</span>
              </TabsTrigger>
              <TabsTrigger value="blog" className="gap-2">
                <Newspaper className="h-4 w-4" />
                <span className="hidden sm:inline">Blog</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-2">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Settings</span>
              </TabsTrigger>
            </TabsList>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loadData}
              disabled={loading}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <AnalyticsDashboard accessToken={accessToken} />
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-4">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <div>
                <h2 className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  Products ({products.length})
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Manage your product catalog across both stores
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => addSampleProducts()}
                  disabled={loading}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Add Sample Products
                </Button>
                <Dialog open={!!editingProduct} onOpenChange={(open) => !open && setEditingProduct(null)}>
                  <DialogTrigger asChild>
                    <Button onClick={() => setEditingProduct({})}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Product
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {editingProduct?.id ? 'Edit Product' : 'Add New Product'}
                      </DialogTitle>
                      <DialogDescription>
                        {editingProduct?.id 
                          ? 'Update product details and save changes.' 
                          : 'Fill in the product details to add it to your store.'}
                      </DialogDescription>
                    </DialogHeader>
                    <ProductForm
                      product={editingProduct}
                      onSave={saveProduct}
                      loading={loading}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product) => (
                <Card key={product.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <Badge>{product.store}</Badge>
                      <div className="flex gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setEditingProduct(product)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => deleteProduct(product.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <h4 className="mb-1">{product.name}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{product.category}</p>
                    <p className="text-primary">KSh {product.price?.toLocaleString()}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-4">
            <div className="mb-4">
              <h2 className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-primary" />
                Orders ({orders.length})
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Track and manage customer orders
              </p>
            </div>
            {orders.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  No orders yet
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <Card key={order.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Order ID</p>
                          <p className="text-xs">{order.id}</p>
                        </div>
                        <Select
                          value={order.status}
                          onValueChange={(status) => updateOrderStatus(order.id, status)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="processing">Processing</SelectItem>
                            <SelectItem value="shipped">Shipped</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {order.items && (
                        <div className="space-y-1 text-sm">
                          {order.items.map((item: any, i: number) => (
                            <p key={i}>{item.name} x{item.quantity}</p>
                          ))}
                        </div>
                      )}
                      {order.total && (
                        <p className="text-primary mt-2">Total: KSh {order.total.toLocaleString()}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Blog Tab */}
          <TabsContent value="blog" className="space-y-4">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <div>
                <h2 className="flex items-center gap-2">
                  <Newspaper className="h-5 w-5 text-primary" />
                  Blog Posts ({blogPosts.length})
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Create and manage blog content
                </p>
              </div>
              <Dialog open={!!editingPost} onOpenChange={(open) => !open && setEditingPost(null)}>
                <DialogTrigger asChild>
                  <Button onClick={() => setEditingPost({})}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Post
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingPost?.id ? 'Edit Post' : 'Add New Post'}
                    </DialogTitle>
                    <DialogDescription>
                      {editingPost?.id 
                        ? 'Update blog post content and settings.' 
                        : 'Create a new blog post for your readers.'}
                    </DialogDescription>
                  </DialogHeader>
                  <BlogPostForm
                    post={editingPost}
                    onSave={saveBlogPost}
                    loading={loading}
                  />
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {blogPosts.map((post) => (
                <Card key={post.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <Badge>{post.category}</Badge>
                      <div className="flex gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setEditingPost(post)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => deleteBlogPost(post.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                    <h4 className="mb-2">{post.title}</h4>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {post.excerpt}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Website Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="mb-4">Business Information</h3>
                  <div className="space-y-4">
                    <div>
                      <Label>WhatsApp Number</Label>
                      <Input defaultValue="+254 112 327 141" disabled />
                    </div>
                    <div>
                      <Label>M-Pesa Till Number</Label>
                      <Input defaultValue="8499736" disabled />
                    </div>
                    <div>
                      <Label>Business Hours</Label>
                      <Textarea 
                        defaultValue="Monday - Friday: 9:00 AM - 6:00 PM&#10;Saturday: 10:00 AM - 4:00 PM&#10;Sunday: Closed"
                        rows={3}
                        disabled
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="mb-4">Statistics</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <p className="text-2xl text-primary">{products.length}</p>
                        <p className="text-sm text-muted-foreground">Total Products</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <p className="text-2xl text-primary">{orders.length}</p>
                        <p className="text-sm text-muted-foreground">Total Orders</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <p className="text-2xl text-primary">{blogPosts.length}</p>
                        <p className="text-sm text-muted-foreground">Blog Posts</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <p className="text-2xl text-primary">
                          {orders.filter((o: any) => o.status === 'pending').length}
                        </p>
                        <p className="text-sm text-muted-foreground">Pending Orders</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="mb-4">Categories Management</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Categories are managed through the backend. Current categories are automatically synced.
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Main Store Categories</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {['Vibrators', 'Dildos', 'Male Toys', 'BDSM', 'Butt Plugs', 'Kegel Balls', 'Adult Games', 'Lubes', 'Condoms', 'Vitality', 'Adult Toy Sets'].map(cat => (
                          <Badge key={cat} variant="secondary">{cat}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label>Lingerie Store Categories</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {['Sexy Lingerie', 'Pajamas', 'Fishnet Stockings', 'Bondage Kits', 'Sexy Sets', 'Corsets & Babydolls', 'Accessories'].map(cat => (
                          <Badge key={cat} variant="secondary">{cat}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function ProductForm({ product, onSave, loading }: any) {
  const [formData, setFormData] = useState(product || {});
  const [uploading, setUploading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formDataObj = new FormData();
      formDataObj.append('file', file);

      const { projectId, publicAnonKey } = await import('../utils/supabase/info');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-afd25991/upload-image`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${publicAnonKey}`
          },
          body: formDataObj
        }
      );

      const data = await response.json();
      if (data.url) {
        setFormData({ ...formData, image: data.url });
        toast.success('Image uploaded successfully!');
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Store</Label>
        <Select
          value={formData.store || 'main'}
          onValueChange={(value) => setFormData({ ...formData, store: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="main">Main Store (Adult Toys)</SelectItem>
            <SelectItem value="lingerie">Lingerie Store</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Product Name</Label>
        <Input
          value={formData.name || ''}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>
      <div>
        <Label>Category</Label>
        <Input
          value={formData.category || ''}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          required
        />
      </div>
      <div>
        <Label>Price (KSh)</Label>
        <Input
          type="number"
          value={formData.price || ''}
          onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
          required
        />
      </div>
      <div>
        <Label>Description</Label>
        <Textarea
          value={formData.description || ''}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
        />
      </div>
      <div className="space-y-3">
        <Label>Product Image</Label>
        
        {/* Image Preview */}
        {formData.image && (
          <div className="relative aspect-square w-32 rounded-lg overflow-hidden border">
            <img 
              src={formData.image} 
              alt="Preview" 
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        {/* Upload from Device */}
        <div>
          <Label htmlFor="image-upload" className="text-sm text-muted-foreground">
            Upload from Device (Mobile/Camera)
          </Label>
          <Input
            id="image-upload"
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleImageUpload}
            disabled={uploading}
            className="cursor-pointer"
          />
          {uploading && (
            <p className="text-sm text-muted-foreground mt-1">Uploading...</p>
          )}
        </div>

        {/* Or paste URL */}
        <div>
          <Label htmlFor="image-url" className="text-sm text-muted-foreground">
            Or paste image URL
          </Label>
          <Input
            id="image-url"
            value={formData.image || ''}
            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
            placeholder="https://..."
          />
        </div>
      </div>
      <Button type="submit" disabled={loading || uploading} className="w-full">
        {loading ? 'Saving...' : 'Save Product'}
      </Button>
    </form>
  );
}

function BlogPostForm({ post, onSave, loading }: any) {
  const [formData, setFormData] = useState(post || {});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Title</Label>
        <Input
          value={formData.title || ''}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>
      <div>
        <Label>Category</Label>
        <Input
          value={formData.category || ''}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          placeholder="e.g., Product Guide, Relationship Tips"
          required
        />
      </div>
      <div>
        <Label>Excerpt (Short Description)</Label>
        <Textarea
          value={formData.excerpt || ''}
          onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
          rows={2}
          required
        />
      </div>
      <div>
        <Label>Content</Label>
        <Textarea
          value={formData.content || ''}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          rows={10}
          required
        />
      </div>
      <div>
        <Label>Featured Image URL</Label>
        <Input
          value={formData.image || ''}
          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
          placeholder="https://..."
        />
      </div>
      <div>
        <Label>Read Time (minutes)</Label>
        <Input
          type="number"
          value={formData.readTime || ''}
          onChange={(e) => setFormData({ ...formData, readTime: parseInt(e.target.value) })}
          placeholder="5"
        />
      </div>
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Saving...' : 'Save Post'}
      </Button>
    </form>
  );
}
