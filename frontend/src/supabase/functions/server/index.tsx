import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const app = new Hono();

app.use('*', cors());
app.use('*', logger(console.log));

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// Initialize storage buckets
async function initStorage() {
  const buckets = ['make-afd25991-images', 'make-afd25991-profile-pictures'];
  
  for (const bucketName of buckets) {
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      await supabase.storage.createBucket(bucketName, {
        public: false,
        fileSizeLimit: 5242880 // 5MB
      });
      console.log(`Created bucket: ${bucketName}`);
    }
  }
}

// Initialize analytics on startup
async function initAnalytics() {
  const existingAnalytics = await kv.get('analytics:meta');
  if (!existingAnalytics) {
    await kv.set('analytics:meta', {
      initialized: new Date().toISOString(),
      version: '1.0'
    });
  }
}

// Initialize storage and analytics on startup
initStorage();
initAnalytics();

// Helper to get user from token
async function getUser(request: Request) {
  const accessToken = request.headers.get('Authorization')?.split(' ')[1];
  if (!accessToken) return null;
  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  return user;
}

// 🔒 NEW: Helper to require admin access
async function requireAdmin(request: Request) {
  const user = await getUser(request);
  
  if (!user) {
    return { authorized: false, error: 'Authentication required', status: 401 };
  }
  
  // Check if user has admin role in user_metadata
  const isAdmin = user.user_metadata?.role === 'admin';
  
  if (!isAdmin) {
    console.log(`⚠️ SECURITY: Unauthorized admin access attempt by ${user.email} at ${new Date().toISOString()}`);
    return { authorized: false, error: 'Forbidden: Admin privileges required', status: 403 };
  }
  
  return { authorized: true, user };
}

// Helper to track analytics
async function trackEvent(eventType: string, data: any) {
  try {
    const eventId = `analytics:events:${Date.now()}:${Math.random().toString(36).substring(7)}`;
    await kv.set(eventId, {
      type: eventType,
      data,
      timestamp: new Date().toISOString()
    });

    // Update daily stats
    const today = new Date().toISOString().split('T')[0];
    const statsKey = `analytics:daily:${today}`;
    const dailyStats = await kv.get(statsKey) || {
      date: today,
      pageViews: 0,
      productViews: 0,
      orders: 0,
      revenue: 0,
      signups: 0
    };

    // Update relevant counter
    if (eventType === 'page_view') dailyStats.pageViews++;
    if (eventType === 'product_view') dailyStats.productViews++;
    if (eventType === 'order_created') {
      dailyStats.orders++;
      dailyStats.revenue += data.amount || 0;
    }
    if (eventType === 'user_signup') dailyStats.signups++;

    await kv.set(statsKey, dailyStats);
  } catch (error) {
    console.log('Error tracking event:', error);
  }
}

// Helper to validate input
function validateInput(data: any, requiredFields: string[]) {
  for (const field of requiredFields) {
    if (!data[field]) {
      throw new Error(`Missing required field: ${field}`);
    }
  }
}

// Helper to sanitize user input (prevent XSS)
function sanitize(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// ============ AUTH ROUTES ============

app.post('/make-server-afd25991/signup', async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, name } = body;
    
    console.log('Signup request for:', email);
    
    // Validate input
    if (!email || !password || !name) {
      const missing = [];
      if (!email) missing.push('email');
      if (!password) missing.push('password');
      if (!name) missing.push('name');
      console.log('Missing fields:', missing);
      return c.json({ error: `Missing required fields: ${missing.join(', ')}` }, 400);
    }
    
    // Sanitize name
    const sanitizedName = sanitize(name);
    
    console.log('Creating user with email:', email);
    
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { 
        name: sanitizedName,
        role: 'user' // Default role is 'user', not 'admin'
      },
      email_confirm: true // Auto-confirm since email server not configured
    });

    if (error) {
      console.log('Supabase auth.admin.createUser error:', error.message, error);
      
      // If user already exists, that's actually okay
      if (error.message.includes('already registered') || error.message.includes('User already registered')) {
        console.log('User already exists - returning success');
        return c.json({ success: true, message: 'User already exists' });
      }
      
      return c.json({ error: error.message }, 400);
    }

    console.log('User created successfully:', data.user?.email);

    // Track signup
    await trackEvent('user_signup', { email, name: sanitizedName });

    return c.json({ success: true, user: data.user });
  } catch (error: any) {
    console.log('Signup exception:', error.message, error);
    return c.json({ error: error.message || String(error) }, 500);
  }
});

// ============ PRODUCTS ROUTES ============

// Get all products (with optional store filter) - PUBLIC
app.get('/make-server-afd25991/products', async (c) => {
  try {
    const store = c.req.query('store'); // 'main' or 'lingerie'
    const prefix = store ? `products:${store}:` : 'products:';
    
    const products = await kv.getByPrefix(prefix);
    
    // Track page view
    await trackEvent('page_view', { page: 'products', store });
    
    return c.json({ products: products || [] });
  } catch (error) {
    console.log('Error fetching products:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Get single product - PUBLIC
app.get('/make-server-afd25991/products/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const product = await kv.get(id);
    
    if (!product) {
      return c.json({ error: 'Product not found' }, 404);
    }
    
    // Track product view
    await trackEvent('product_view', { productId: id, productName: product.name });
    
    return c.json({ product });
  } catch (error) {
    console.log('Error fetching product:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// 🔒 Create or update product (ADMIN ONLY)
app.post('/make-server-afd25991/products', async (c) => {
  try {
    const { authorized, error, status } = await requireAdmin(c.req.raw);
    if (!authorized) {
      return c.json({ error }, status);
    }

    const product = await c.req.json();
    
    // Validate required fields
    validateInput(product, ['name', 'price', 'category', 'store']);
    
    // Sanitize text fields
    if (product.name) product.name = sanitize(product.name);
    if (product.description) product.description = sanitize(product.description);
    
    const id = product.id || `products:${product.store}:${Date.now()}`;
    
    await kv.set(id, {
      ...product,
      id,
      updatedAt: new Date().toISOString()
    });
    
    // Track product creation
    await trackEvent('product_created', { productId: id, name: product.name });
    
    return c.json({ success: true, id });
  } catch (error) {
    console.log('Error creating/updating product:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// 🔒 Delete product (ADMIN ONLY)
app.delete('/make-server-afd25991/products/:id', async (c) => {
  try {
    const { authorized, error, status } = await requireAdmin(c.req.raw);
    if (!authorized) {
      return c.json({ error }, status);
    }

    const id = c.req.param('id');
    await kv.del(id);
    
    // Track product deletion
    await trackEvent('product_deleted', { productId: id });
    
    return c.json({ success: true });
  } catch (error) {
    console.log('Error deleting product:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// ============ CATEGORIES ROUTES ============

// Get categories - PUBLIC
app.get('/make-server-afd25991/categories/:store', async (c) => {
  try {
    const store = c.req.param('store');
    const categories = await kv.get(`categories:${store}`) || [];
    return c.json({ categories });
  } catch (error) {
    console.log('Error fetching categories:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// 🔒 Update categories (ADMIN ONLY)
app.post('/make-server-afd25991/categories/:store', async (c) => {
  try {
    const { authorized, error, status } = await requireAdmin(c.req.raw);
    if (!authorized) {
      return c.json({ error }, status);
    }

    const store = c.req.param('store');
    const { categories } = await c.req.json();
    
    await kv.set(`categories:${store}`, categories);
    return c.json({ success: true });
  } catch (error) {
    console.log('Error updating categories:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// ============ ORDERS ROUTES ============

// Create order - PUBLIC (customers can place orders)
app.post('/make-server-afd25991/orders', async (c) => {
  try {
    const order = await c.req.json();
    
    // Validate order
    validateInput(order, ['customerName', 'phone', 'total']);
    
    // Sanitize customer data
    if (order.customerName) order.customerName = sanitize(order.customerName);
    if (order.notes) order.notes = sanitize(order.notes);
    
    const id = `orders:${Date.now()}`;
    
    const orderData = {
      ...order,
      id,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    await kv.set(id, orderData);
    
    // Track order creation
    await trackEvent('order_created', { 
      orderId: id, 
      amount: order.total,
      items: order.items?.length || 0
    });
    
    return c.json({ success: true, orderId: id });
  } catch (error) {
    console.log('Error creating order:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// 🔒 Get all orders (ADMIN ONLY)
app.get('/make-server-afd25991/orders', async (c) => {
  try {
    const { authorized, error, status } = await requireAdmin(c.req.raw);
    if (!authorized) {
      return c.json({ error }, status);
    }

    const orders = await kv.getByPrefix('orders:');
    return c.json({ orders: orders || [] });
  } catch (error) {
    console.log('Error fetching orders:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// 🔒 Update order status (ADMIN ONLY)
app.patch('/make-server-afd25991/orders/:id', async (c) => {
  try {
    const { authorized, error, status } = await requireAdmin(c.req.raw);
    if (!authorized) {
      return c.json({ error }, status);
    }

    const id = c.req.param('id');
    const updates = await c.req.json();
    const order = await kv.get(id);
    
    if (!order) {
      return c.json({ error: 'Order not found' }, 404);
    }
    
    const updatedOrder = {
      ...order,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    await kv.set(id, updatedOrder);
    
    // Track order update
    await trackEvent('order_updated', { orderId: id, status: updates.status });
    
    return c.json({ success: true });
  } catch (error) {
    console.log('Error updating order:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// ============ BLOG ROUTES ============

// Get all blog posts - PUBLIC
app.get('/make-server-afd25991/blog', async (c) => {
  try {
    const posts = await kv.getByPrefix('blog:');
    
    // Track blog page view
    await trackEvent('page_view', { page: 'blog' });
    
    return c.json({ posts: posts || [] });
  } catch (error) {
    console.log('Error fetching blog posts:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Get single blog post - PUBLIC
app.get('/make-server-afd25991/blog/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const post = await kv.get(`blog:${id}`);
    
    if (!post) {
      return c.json({ error: 'Post not found' }, 404);
    }
    
    // Track blog post view
    await trackEvent('blog_view', { postId: id, title: post.title });
    
    return c.json({ post });
  } catch (error) {
    console.log('Error fetching blog post:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// 🔒 Create or update blog post (ADMIN ONLY)
app.post('/make-server-afd25991/blog', async (c) => {
  try {
    const { authorized, error, status } = await requireAdmin(c.req.raw);
    if (!authorized) {
      return c.json({ error }, status);
    }

    const post = await c.req.json();
    
    // Validate required fields
    validateInput(post, ['title', 'content', 'category']);
    
    // Sanitize text fields
    if (post.title) post.title = sanitize(post.title);
    if (post.excerpt) post.excerpt = sanitize(post.excerpt);
    
    const id = post.id || `blog:${Date.now()}`;
    
    await kv.set(id, {
      ...post,
      id,
      likes: post.likes || 0,
      comments: post.comments || 0,
      updatedAt: new Date().toISOString()
    });
    
    // Track blog creation
    await trackEvent('blog_created', { postId: id, title: post.title });
    
    return c.json({ success: true, id });
  } catch (error) {
    console.log('Error creating/updating blog post:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// 🔒 Delete blog post (ADMIN ONLY)
app.delete('/make-server-afd25991/blog/:id', async (c) => {
  try {
    const { authorized, error, status } = await requireAdmin(c.req.raw);
    if (!authorized) {
      return c.json({ error }, status);
    }

    const id = c.req.param('id');
    await kv.del(`blog:${id}`);
    
    // Track blog deletion
    await trackEvent('blog_deleted', { postId: id });
    
    return c.json({ success: true });
  } catch (error) {
    console.log('Error deleting blog post:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// ============ IMAGE UPLOAD ROUTES ============

// 🔒 Upload profile picture (AUTHENTICATED USERS)
app.post('/make-server-afd25991/upload-profile-picture', async (c) => {
  try {
    const user = await getUser(c.req.raw);
    if (!user) {
      return c.json({ error: 'Authentication required' }, 401);
    }

    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;

    // Ensure user can only upload their own profile picture
    if (userId !== user.id) {
      return c.json({ error: 'Can only upload your own profile picture' }, 403);
    }

    if (!file || !userId) {
      return c.json({ error: 'File and userId required' }, 400);
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return c.json({ error: 'Only image files allowed' }, 400);
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return c.json({ error: 'File size must be less than 5MB' }, 400);
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const bucketName = 'make-afd25991-profile-pictures';

    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, uint8Array, {
        contentType: file.type,
        upsert: true
      });

    if (error) {
      console.log('Error uploading profile picture:', error);
      return c.json({ error: error.message }, 500);
    }

    // Get signed URL (valid for 1 year)
    const { data: urlData } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(fileName, 31536000);

    return c.json({ success: true, url: urlData?.signedUrl });
  } catch (error) {
    console.log('Error in profile picture upload:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// 🔒 Upload general image (ADMIN ONLY - for blog posts, products, etc.)
app.post('/make-server-afd25991/upload-image', async (c) => {
  try {
    const { authorized, error, status } = await requireAdmin(c.req.raw);
    if (!authorized) {
      return c.json({ error }, status);
    }

    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string || 'general'; // blog, product, general

    if (!file) {
      return c.json({ error: 'File required' }, 400);
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return c.json({ error: 'Only image files allowed' }, 400);
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return c.json({ error: 'File size must be less than 5MB' }, 400);
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${type}-${Date.now()}.${fileExt}`;
    const bucketName = 'make-afd25991-images';

    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, uint8Array, {
        contentType: file.type,
        upsert: false
      });

    if (error) {
      console.log('Error uploading image:', error);
      return c.json({ error: error.message }, 500);
    }

    // Get signed URL (valid for 1 year)
    const { data: urlData } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(fileName, 31536000);

    return c.json({ success: true, url: urlData?.signedUrl });
  } catch (error) {
    console.log('Error in image upload:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// ============ ANALYTICS & REPORTING ROUTES ============

// 🔒 Get analytics dashboard data (ADMIN ONLY)
app.get('/make-server-afd25991/analytics/dashboard', async (c) => {
  try {
    const { authorized, error, status } = await requireAdmin(c.req.raw);
    if (!authorized) {
      return c.json({ error }, status);
    }

    // Get date range (last 30 days)
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(date.toISOString().split('T')[0]);
    }

    // Fetch daily stats for last 30 days
    const dailyStatsKeys = days.map(day => `analytics:daily:${day}`);
    const dailyStats = await kv.mget(dailyStatsKeys);

    // Calculate totals
    let totalRevenue = 0;
    let totalOrders = 0;
    let totalPageViews = 0;
    let totalProductViews = 0;
    let totalSignups = 0;

    const chartData = days.map((day, index) => {
      const stats = dailyStats[index] || {
        date: day,
        pageViews: 0,
        productViews: 0,
        orders: 0,
        revenue: 0,
        signups: 0
      };

      totalRevenue += stats.revenue || 0;
      totalOrders += stats.orders || 0;
      totalPageViews += stats.pageViews || 0;
      totalProductViews += stats.productViews || 0;
      totalSignups += stats.signups || 0;

      return {
        date: day,
        revenue: stats.revenue || 0,
        orders: stats.orders || 0,
        pageViews: stats.pageViews || 0,
        productViews: stats.productViews || 0,
        signups: stats.signups || 0
      };
    });

    // Get today's stats
    const today = new Date().toISOString().split('T')[0];
    const todayStats = await kv.get(`analytics:daily:${today}`) || {
      pageViews: 0,
      productViews: 0,
      orders: 0,
      revenue: 0,
      signups: 0
    };

    // Get all orders and products for additional stats
    const allOrders = await kv.getByPrefix('orders:');
    const allProducts = await kv.getByPrefix('products:');

    return c.json({
      summary: {
        totalRevenue,
        totalOrders,
        totalPageViews,
        totalProductViews,
        totalSignups,
        averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
        conversionRate: totalPageViews > 0 ? (totalOrders / totalPageViews) * 100 : 0
      },
      today: todayStats,
      chartData,
      productCount: allProducts.length,
      pendingOrders: allOrders.filter(o => o.status === 'pending').length,
      completedOrders: allOrders.filter(o => o.status === 'completed').length
    });
  } catch (error) {
    console.log('Error fetching analytics:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// 🔒 Get sales report (ADMIN ONLY)
app.get('/make-server-afd25991/analytics/sales-report', async (c) => {
  try {
    const { authorized, error, status } = await requireAdmin(c.req.raw);
    if (!authorized) {
      return c.json({ error }, status);
    }

    const period = c.req.query('period') || '30'; // days
    const days = parseInt(period);

    // Get orders from the period
    const allOrders = await kv.getByPrefix('orders:');
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const filteredOrders = allOrders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= cutoffDate;
    });

    // Calculate metrics
    const totalSales = filteredOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    const averageOrderValue = filteredOrders.length > 0 ? totalSales / filteredOrders.length : 0;

    // Group by status
    const byStatus = filteredOrders.reduce((acc, order) => {
      const status = order.status || 'pending';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Top products (if order has items)
    const productSales = filteredOrders.reduce((acc, order) => {
      if (order.items) {
        order.items.forEach((item: any) => {
          if (!acc[item.id]) {
            acc[item.id] = {
              id: item.id,
              name: item.name,
              quantity: 0,
              revenue: 0
            };
          }
          acc[item.id].quantity += item.quantity || 1;
          acc[item.id].revenue += item.price * (item.quantity || 1);
        });
      }
      return acc;
    }, {} as Record<string, any>);

    const topProducts = Object.values(productSales)
      .sort((a: any, b: any) => b.revenue - a.revenue)
      .slice(0, 10);

    return c.json({
      period: `Last ${days} days`,
      totalOrders: filteredOrders.length,
      totalSales,
      averageOrderValue,
      byStatus,
      topProducts,
      orders: filteredOrders.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    });
  } catch (error) {
    console.log('Error generating sales report:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// 🔒 Export data (ADMIN ONLY - for backups)
app.get('/make-server-afd25991/export/:type', async (c) => {
  try {
    const { authorized, error, status } = await requireAdmin(c.req.raw);
    if (!authorized) {
      return c.json({ error }, status);
    }

    const type = c.req.param('type'); // products, orders, blog, all
    let data: any = {};

    if (type === 'products' || type === 'all') {
      data.products = await kv.getByPrefix('products:');
    }
    if (type === 'orders' || type === 'all') {
      data.orders = await kv.getByPrefix('orders:');
    }
    if (type === 'blog' || type === 'all') {
      data.blog = await kv.getByPrefix('blog:');
    }
    if (type === 'analytics' || type === 'all') {
      const days = [];
      for (let i = 90; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        days.push(date.toISOString().split('T')[0]);
      }
      const analyticsKeys = days.map(day => `analytics:daily:${day}`);
      data.analytics = await kv.mget(analyticsKeys);
    }

    data.exportedAt = new Date().toISOString();
    data.version = '1.0';

    return c.json(data);
  } catch (error) {
    console.log('Error exporting data:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Health check endpoint - PUBLIC
app.get('/make-server-afd25991/health', (c) => {
  return c.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

Deno.serve(app.fetch);