import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  ShoppingBag, 
  FileText, 
  Settings, 
  LogOut,
  Download,
  MessageCircle,
  Heart,
  Eye,
  Edit,
  Save,
  X,
  Plus,
  Image as ImageIcon,
  Send,
  ThumbsUp,
  Share2,
  Bell,
  Package,
  CreditCard,
  Sparkles,
  Camera,
  Upload,
  Trash2,
  CheckCircle,
  TrendingUp,
  Award
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface UserDashboardProps {
  user: {
    email: string;
    name: string;
    token: string;
  };
  onLogout: () => void;
  onNavigate: (section: string) => void;
}

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  location: string;
  profilePicture?: string;
  bio?: string;
}

interface Order {
  id: string;
  productName: string;
  price: number;
  date: string;
  status: string;
  paymentMethod: string;
}

interface BlogPost {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  likes: number;
  comments: Comment[];
  isLiked?: boolean;
}

interface Comment {
  id: string;
  postId: string;
  authorName: string;
  content: string;
  createdAt: string;
}

export function UserDashboard({ user, onLogout, onNavigate }: UserDashboardProps) {
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState<UserProfile>({
    name: user.name || '',
    email: user.email,
    phone: '',
    location: '',
    profilePicture: '',
    bio: ''
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [newPost, setNewPost] = useState({ title: '', content: '', imageFile: null as File | null });
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingProfilePic, setUploadingProfilePic] = useState(false);
  const profilePicInputRef = useRef<HTMLInputElement>(null);
  const postImageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadUserData();
  }, [user.email]);

  const loadUserData = async () => {
    try {
      // Load profile from localStorage
      const savedProfile = localStorage.getItem(`user-profile-${user.email}`);
      if (savedProfile) {
        setProfile(JSON.parse(savedProfile));
      }

      // Load orders (mock data for now - will integrate with backend)
      setOrders([
        {
          id: 'ORD-001',
          productName: 'Premium Massage Oil',
          price: 2500,
          date: '2025-01-10',
          status: 'Delivered',
          paymentMethod: 'M-Pesa'
        },
        {
          id: 'ORD-002',
          productName: 'Silk Lingerie Set',
          price: 3500,
          date: '2025-01-15',
          status: 'Processing',
          paymentMethod: 'Cash on Delivery'
        }
      ]);

      // Load blog posts
      loadBlogPosts();
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadBlogPosts = async () => {
    try {
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-afd25991/blog`,
        {
          headers: { Authorization: `Bearer ${publicAnonKey}` }
        }
      );
      const data = await res.json();
      setBlogPosts(data.posts || []);
    } catch (error) {
      console.error('Error loading blog posts:', error);
    }
  };

  const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setUploadingProfilePic(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', user.email);

      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-afd25991/upload-profile-picture`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${publicAnonKey}` },
          body: formData
        }
      );

      const data = await res.json();

      if (data.url) {
        const updatedProfile = { ...profile, profilePicture: data.url };
        setProfile(updatedProfile);
        localStorage.setItem(`user-profile-${user.email}`, JSON.stringify(updatedProfile));
        toast.success('Profile picture updated!');
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      toast.error('Failed to upload profile picture');
    } finally {
      setUploadingProfilePic(false);
    }
  };

  const handleSaveProfile = () => {
    localStorage.setItem(`user-profile-${user.email}`, JSON.stringify(profile));
    setIsEditingProfile(false);
    toast.success('Profile updated successfully!');
  };

  const handlePostImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setNewPost({ ...newPost, imageFile: file });
    toast.success('Image selected');
  };

  const handleCreatePost = async () => {
    if (!newPost.title.trim() || !newPost.content.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsCreatingPost(true);

    try {
      let imageUrl = '';

      // Upload image if present
      if (newPost.imageFile) {
        const formData = new FormData();
        formData.append('file', newPost.imageFile);
        formData.append('type', 'blog');

        const uploadRes = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-afd25991/upload-image`,
          {
            method: 'POST',
            headers: { Authorization: `Bearer ${publicAnonKey}` },
            body: formData
          }
        );

        const uploadData = await uploadRes.json();
        if (uploadData.url) {
          imageUrl = uploadData.url;
        }
      }

      // Create post
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-afd25991/blog`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            title: newPost.title,
            content: newPost.content,
            imageUrl,
            authorName: profile.name || user.name,
            authorId: user.email
          })
        }
      );

      if (res.ok) {
        toast.success('Blog post created!');
        setNewPost({ title: '', content: '', imageFile: null });
        loadBlogPosts();
      } else {
        throw new Error('Failed to create post');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create blog post');
    } finally {
      setIsCreatingPost(false);
    }
  };

  const stats = [
    { label: 'Total Orders', value: orders.length, icon: ShoppingBag, color: 'text-pink-500' },
    { label: 'Blog Posts', value: blogPosts.filter(p => p.authorId === user.email).length, icon: FileText, color: 'text-purple-500' },
    { label: 'Total Spent', value: `KES ${orders.reduce((sum, o) => sum + o.price, 0).toLocaleString()}`, icon: CreditCard, color: 'text-green-500' },
    { label: 'Member Since', value: 'Jan 2025', icon: Award, color: 'text-blue-500' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <motion.div 
        className="relative bg-gradient-to-r from-pink-600 via-pink-500 to-purple-600 text-white overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }} />
        </div>

        <div className="container mx-auto px-4 py-12 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Profile Picture */}
            <motion.div 
              className="relative"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', duration: 0.6 }}
            >
              <Avatar className="h-32 w-32 border-4 border-white shadow-2xl">
                {profile.profilePicture ? (
                  <AvatarImage src={profile.profilePicture} alt={profile.name} />
                ) : (
                  <AvatarFallback className="bg-gradient-to-br from-pink-400 to-purple-500 text-white text-4xl">
                    {profile.name?.charAt(0) || user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>
              
              <motion.button
                onClick={() => profilePicInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-white text-primary p-2 rounded-full shadow-lg hover:bg-primary hover:text-white transition-all"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                disabled={uploadingProfilePic}
              >
                {uploadingProfilePic ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <Upload className="h-5 w-5" />
                  </motion.div>
                ) : (
                  <Camera className="h-5 w-5" />
                )}
              </motion.button>
              <input
                ref={profilePicInputRef}
                type="file"
                accept="image/*"
                onChange={handleProfilePictureUpload}
                className="hidden"
              />
            </motion.div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              <motion.h1 
                className="text-white mb-2"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Welcome back, {profile.name || user.name}!
              </motion.h1>
              <motion.p 
                className="text-white/90 mb-4"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {user.email}
              </motion.p>
              {profile.bio && (
                <motion.p
                  className="text-white/80 text-sm max-w-2xl"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  {profile.bio}
                </motion.p>
              )}
            </div>

            {/* Logout Button */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Button
                onClick={onLogout}
                variant="outline"
                className="bg-white/10 border-white/30 text-white hover:bg-white hover:text-pink-600 gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-16">
            <path
              d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
              className="fill-background"
            />
          </svg>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="container mx-auto px-4 -mt-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <Card className="border-2 border-primary/10 hover:border-primary/30 transition-all hover:shadow-xl hover:shadow-primary/10">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 ${stat.color}`}>
                      <stat.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="profile" className="gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-2">
              <ShoppingBag className="h-4 w-4" />
              <span className="hidden sm:inline">Orders</span>
            </TabsTrigger>
            <TabsTrigger value="blog" className="gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Blog</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="border-2 border-primary/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        My Profile
                      </CardTitle>
                      <CardDescription>Manage your personal information</CardDescription>
                    </div>
                    <Button
                      onClick={() => isEditingProfile ? handleSaveProfile() : setIsEditingProfile(true)}
                      variant={isEditingProfile ? 'default' : 'outline'}
                      className="gap-2"
                    >
                      {isEditingProfile ? (
                        <>
                          <Save className="h-4 w-4" />
                          Save Changes
                        </>
                      ) : (
                        <>
                          <Edit className="h-4 w-4" />
                          Edit Profile
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label>Nickname</Label>
                      <Input
                        value={profile.name}
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                        disabled={!isEditingProfile}
                        placeholder="What should we call you?"
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input
                        value={profile.email}
                        disabled
                        className="mt-2 bg-muted"
                      />
                    </div>
                    <div>
                      <Label>Phone Number</Label>
                      <Input
                        value={profile.phone}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        disabled={!isEditingProfile}
                        placeholder="+254 712 345 678"
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Location</Label>
                      <Input
                        value={profile.location}
                        onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                        disabled={!isEditingProfile}
                        placeholder="Nairobi, Kenya"
                        className="mt-2"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Bio</Label>
                    <Textarea
                      value={profile.bio || ''}
                      onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                      disabled={!isEditingProfile}
                      placeholder="Tell us about yourself..."
                      className="mt-2 min-h-[100px]"
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="border-2 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    Order History
                  </CardTitle>
                  <CardDescription>View and track your orders</CardDescription>
                </CardHeader>
                <CardContent>
                  {orders.length === 0 ? (
                    <div className="text-center py-12">
                      <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
                      <p className="text-muted-foreground mb-4">No orders yet</p>
                      <Button onClick={() => onNavigate('main-store')} className="gap-2">
                        <Sparkles className="h-4 w-4" />
                        Start Shopping
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <motion.div
                          key={order.id}
                          className="p-6 border-2 border-primary/10 rounded-lg hover:border-primary/30 transition-all"
                          whileHover={{ scale: 1.01 }}
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h4 className="font-semibold">{order.productName}</h4>
                              <p className="text-sm text-muted-foreground">Order #{order.id}</p>
                            </div>
                            <Badge variant={order.status === 'Delivered' ? 'default' : 'secondary'}>
                              {order.status}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">{new Date(order.date).toLocaleDateString()}</span>
                            <span className="font-semibold">KES {order.price.toLocaleString()}</span>
                          </div>
                          <div className="flex gap-2 mt-4">
                            <Button variant="outline" size="sm" className="flex-1 gap-2">
                              <Download className="h-4 w-4" />
                              Receipt
                            </Button>
                            <Button variant="outline" size="sm" className="flex-1 gap-2">
                              <MessageCircle className="h-4 w-4" />
                              Support
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Blog Tab */}
          <TabsContent value="blog">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Create New Post */}
              <Card className="border-2 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5 text-primary" />
                    Create Blog Post
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Title</Label>
                    <Input
                      value={newPost.title}
                      onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                      placeholder="Enter post title..."
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label>Content</Label>
                    <Textarea
                      value={newPost.content}
                      onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                      placeholder="Write your post..."
                      className="mt-2 min-h-[150px]"
                    />
                  </div>
                  <div>
                    <Label>Featured Image (Optional)</Label>
                    <div className="mt-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => postImageInputRef.current?.click()}
                        className="w-full gap-2"
                      >
                        <ImageIcon className="h-4 w-4" />
                        {newPost.imageFile ? newPost.imageFile.name : 'Upload Image'}
                      </Button>
                      <input
                        ref={postImageInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handlePostImageUpload}
                        className="hidden"
                      />
                    </div>
                  </div>
                  <Button 
                    onClick={handleCreatePost} 
                    disabled={isCreatingPost}
                    className="w-full gap-2"
                  >
                    {isCreatingPost ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        >
                          <Send className="h-4 w-4" />
                        </motion.div>
                        Publishing...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Publish Post
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* My Blog Posts */}
              <Card className="border-2 border-primary/20">
                <CardHeader>
                  <CardTitle>My Blog Posts</CardTitle>
                </CardHeader>
                <CardContent>
                  {blogPosts.filter(p => p.authorId === user.email).length === 0 ? (
                    <div className="text-center py-12">
                      <FileText className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
                      <p className="text-muted-foreground">No blog posts yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {blogPosts
                        .filter(p => p.authorId === user.email)
                        .map((post) => (
                          <motion.div
                            key={post.id}
                            className="p-6 border-2 border-primary/10 rounded-lg hover:border-primary/30 transition-all"
                            whileHover={{ scale: 1.01 }}
                          >
                            <h4 className="font-semibold mb-2">{post.title}</h4>
                            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{post.content}</p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Heart className="h-4 w-4" />
                                {post.likes || 0}
                              </span>
                              <span className="flex items-center gap-1">
                                <MessageCircle className="h-4 w-4" />
                                {post.comments?.length || 0}
                              </span>
                              <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                            </div>
                          </motion.div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="border-2 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-primary" />
                    Account Settings
                  </CardTitle>
                  <CardDescription>Manage your account preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-4 border-2 border-primary/10 rounded-lg">
                    <div>
                      <h4 className="font-semibold">Email Notifications</h4>
                      <p className="text-sm text-muted-foreground">Receive order updates via email</p>
                    </div>
                    <Button variant="outline" size="sm">Enable</Button>
                  </div>
                  <div className="flex items-center justify-between p-4 border-2 border-primary/10 rounded-lg">
                    <div>
                      <h4 className="font-semibold">SMS Notifications</h4>
                      <p className="text-sm text-muted-foreground">Get delivery updates via SMS</p>
                    </div>
                    <Button variant="outline" size="sm">Enable</Button>
                  </div>
                  <Separator />
                  <div className="space-y-4">
                    <h4 className="font-semibold text-destructive">Danger Zone</h4>
                    <Button variant="destructive" className="w-full gap-2">
                      <Trash2 className="h-4 w-4" />
                      Delete Account
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
