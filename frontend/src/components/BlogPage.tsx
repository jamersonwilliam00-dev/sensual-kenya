import { useState, useEffect } from 'react';
import { Calendar, Clock, ArrowRight, Search, Heart, ThumbsUp, MessageCircle, Share2, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { Card, CardContent, CardFooter } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Separator } from './ui/separator';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  image?: string;
  createdAt: string;
  readTime?: number;
  likes?: number;
  comments?: number;
}

interface BlogPageProps {
  onNavigate: (section: string) => void;
}

export function BlogPage({ onNavigate }: BlogPageProps) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

  const blogCategories = ['All', 'Gossip', 'Education', 'Product Guides', 'Relationship Tips'];

  // Sample blog post
  const samplePost: BlogPost = {
    id: 'sample-post-1',
    title: '5 Ways to Spice Up Your Relationship',
    excerpt: 'Discover exciting ways to bring back the spark and deepen intimacy with your partner.',
    content: `# 5 Ways to Spice Up Your Relationship

Relationships are beautiful journeys that require care, attention, and occasional excitement! Whether you've been together for months or years, it's important to keep the flame alive. Here are five proven ways to add that special spark back into your relationship.

## 1. Surprise Them with Thoughtful Gestures 💝

Small surprises can make a big impact! It doesn't have to be expensive - a handwritten note, their favorite treat, or planning a surprise date night shows you're thinking about them.

## 2. Try Something New Together 🎉

Break out of your routine! This could be:
- Taking a dance class together
- Trying a new restaurant or cuisine
- Learning a new hobby as a team
- Exploring new intimate experiences

## 3. Communicate Your Desires Openly 💬

Honest communication is the foundation of any strong relationship. Don't be shy about expressing your needs, desires, and fantasies. Create a safe space where both partners feel comfortable sharing.

## 4. Invest in Quality Time ⏰

In our busy lives, quality time often gets sacrificed. Make it a priority:
- Schedule regular date nights
- Put away phones during meals
- Plan weekend getaways
- Create rituals you both enjoy

## 5. Explore Sensual Products Together 🌹

Sometimes a little help can go a long way! Exploring sensual products as a couple can:
- Open up new conversations
- Add excitement to intimate moments
- Help you discover new preferences
- Strengthen your bond through shared experiences

At Sensual Kenya, we believe that every couple deserves to experience joy, pleasure, and deep connection. Our carefully curated collection of products is designed to enhance your intimate moments while prioritizing safety and quality.

## Final Thoughts

Remember, every relationship is unique. What works for one couple might not work for another, and that's perfectly okay! The key is to keep trying, communicating, and growing together.

💖 **Need help finding the perfect products to enhance your relationship?** Check out our [Adult Toys Collection](/main-store) or our [Lingerie Section](/lingerie-store) for inspiration!

---

*Have questions or want to share your own tips? Reach out to us on WhatsApp!*`,
    category: 'Relationship Tips',
    image: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=800',
    createdAt: new Date('2025-01-10').toISOString(),
    readTime: 5,
    likes: 42,
    comments: 8
  };

  useEffect(() => {
    loadPosts();
    // Load liked posts from localStorage
    const saved = localStorage.getItem('sensual-kenya-liked-posts');
    if (saved) {
      setLikedPosts(new Set(JSON.parse(saved)));
    }
  }, []);

  const loadPosts = async () => {
    try {
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-afd25991/blog`,
        {
          headers: { Authorization: `Bearer ${publicAnonKey}` }
        }
      );
      const data = await res.json();
      const loadedPosts = data.posts || [];
      
      // Add sample post if no posts exist
      if (loadedPosts.length === 0) {
        setPosts([samplePost]);
      } else {
        // Always include sample post at the beginning
        setPosts([samplePost, ...loadedPosts]);
      }
    } catch (error) {
      console.error('Error loading blog posts:', error);
      // Show sample post on error
      setPosts([samplePost]);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = (postId: string) => {
    const newLikedPosts = new Set(likedPosts);
    
    if (likedPosts.has(postId)) {
      // Unlike
      newLikedPosts.delete(postId);
      setPosts(posts.map(p => 
        p.id === postId 
          ? { ...p, likes: (p.likes || 0) - 1 }
          : p
      ));
      toast.success('Removed from favorites');
    } else {
      // Like
      newLikedPosts.add(postId);
      setPosts(posts.map(p => 
        p.id === postId 
          ? { ...p, likes: (p.likes || 0) + 1 }
          : p
      ));
      toast.success('Added to favorites! ❤️');
    }
    
    setLikedPosts(newLikedPosts);
    localStorage.setItem('sensual-kenya-liked-posts', JSON.stringify([...newLikedPosts]));
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (selectedPost) {
    const isLiked = likedPosts.has(selectedPost.id);
    
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Button
            variant="ghost"
            onClick={() => setSelectedPost(null)}
            className="mb-6"
          >
            ← Back to Blog
          </Button>

          <article>
            {selectedPost.image && (
              <motion.div 
                className="aspect-video rounded-xl overflow-hidden mb-8 shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <ImageWithFallback
                  src={selectedPost.image}
                  alt={selectedPost.title}
                  className="object-cover w-full h-full"
                />
              </motion.div>
            )}

            <Badge className="mb-4">{selectedPost.category}</Badge>
            <h1 className="mb-4">{selectedPost.title}</h1>

            <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {new Date(selectedPost.createdAt).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </div>
                {selectedPost.readTime && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {selectedPost.readTime} min read
                  </div>
                )}
              </div>

              {/* Like and Share Buttons */}
              <div className="flex items-center gap-3">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant={isLiked ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleLike(selectedPost.id)}
                    className="gap-2"
                  >
                    <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                    {selectedPost.likes || 0}
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="outline" size="sm" className="gap-2">
                    <MessageCircle className="h-4 w-4" />
                    {selectedPost.comments || 0}
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      toast.success('Link copied to clipboard!');
                    }}
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </motion.div>
              </div>
            </div>

            <Separator className="mb-8" />

            {/* Render markdown-style content */}
            <div className="prose prose-pink dark:prose-invert max-w-none">
              {selectedPost.content.split('\n').map((line, i) => {
                // Headers
                if (line.startsWith('# ')) {
                  return <h1 key={i} className="mt-8 mb-4">{line.substring(2)}</h1>;
                }
                if (line.startsWith('## ')) {
                  return <h2 key={i} className="mt-6 mb-3">{line.substring(3)}</h2>;
                }
                if (line.startsWith('### ')) {
                  return <h3 key={i} className="mt-4 mb-2">{line.substring(4)}</h3>;
                }
                // List items
                if (line.startsWith('- ')) {
                  return <li key={i} className="ml-6">{line.substring(2)}</li>;
                }
                // Horizontal rule
                if (line.trim() === '---') {
                  return <Separator key={i} className="my-8" />;
                }
                // Empty lines
                if (line.trim() === '') {
                  return <div key={i} className="h-4" />;
                }
                // Regular paragraphs
                return <p key={i} className="mb-4 leading-relaxed">{line}</p>;
              })}
            </div>

            <Separator className="my-12" />

            {/* Call to Action */}
            <motion.div 
              className="bg-gradient-to-r from-primary/10 to-pink-500/10 p-8 rounded-xl border-2 border-primary/20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="mb-4 text-center">Ready to Enhance Your Intimate Life?</h3>
              <p className="text-center text-muted-foreground mb-6">
                Explore our curated collection of premium products
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Button 
                  onClick={() => onNavigate('main-store')}
                  className="gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  Browse Adult Toys
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => onNavigate('lingerie-store')}
                  className="gap-2"
                >
                  <Heart className="h-4 w-4" />
                  Shop Lingerie
                </Button>
              </div>
            </motion.div>
          </article>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Luxurious Header with Background Image */}
      <div className="relative text-white overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1760111719408-cf29d2b23610?w=1600)',
          }}
        />
        {/* Gradient Overlays for text readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/75 via-pink-900/65 to-purple-900/75" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        
        <div className="container mx-auto px-4 py-20 relative z-10 text-center">
          <h1 
            className="text-white mb-4 drop-shadow-2xl"
            style={{
              textShadow: '0 0 40px rgba(236, 72, 153, 0.5), 0 0 80px rgba(236, 72, 153, 0.3)',
            }}
          >
            Sensual Kenya Blog
          </h1>
          <p className="text-white/95 text-xl max-w-3xl mx-auto drop-shadow-lg">
            Expert advice, product guides, and tips for intimate wellness.
          </p>
        </div>

        {/* Bottom Wave Effect */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-16">
            <path
              d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
              className="fill-background"
            />
          </svg>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search */}
        <div className="mb-6 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {blogCategories.map((category) => (
            <Badge
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              className="cursor-pointer px-4 py-2"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Badge>
          ))}
        </div>

        {/* Posts Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-video w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground mb-4">No blog posts found</p>
            <p className="text-sm text-muted-foreground">
              {posts.length === 0
                ? 'Blog posts coming soon. Stay tuned!'
                : 'Try a different search query.'
              }
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => {
              const isLiked = likedPosts.has(post.id);
              return (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -5 }}
                >
                  <Card className="group hover:shadow-lg transition-shadow h-full flex flex-col">
                    <CardContent className="p-0 flex-1">
                      {post.image && (
                        <div 
                          className="aspect-video overflow-hidden cursor-pointer"
                          onClick={() => setSelectedPost(post)}
                        >
                          <ImageWithFallback
                            src={post.image}
                            alt={post.title}
                            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <div className="p-6 cursor-pointer" onClick={() => setSelectedPost(post)}>
                        <Badge className="mb-3">{post.category}</Badge>
                        <h3 className="mb-2 line-clamp-2">{post.title}</h3>
                        <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(post.createdAt).toLocaleDateString()}
                          </div>
                          {post.readTime && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {post.readTime} min
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="px-6 pb-6 pt-0 flex items-center justify-between">
                      <Button 
                        variant="ghost" 
                        className="gap-2 p-0 h-auto"
                        onClick={() => setSelectedPost(post)}
                      >
                        Read More
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                      <div className="flex items-center gap-2">
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLike(post.id);
                            }}
                            className="gap-1 h-auto p-1"
                          >
                            <Heart className={`h-4 w-4 ${isLiked ? 'fill-primary text-primary' : ''}`} />
                            <span className="text-xs">{post.likes || 0}</span>
                          </Button>
                        </motion.div>
                        <Button variant="ghost" size="sm" className="gap-1 h-auto p-1">
                          <MessageCircle className="h-4 w-4" />
                          <span className="text-xs">{post.comments || 0}</span>
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* CTA */}
        {!loading && posts.length > 0 && (
          <div className="mt-16 text-center bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-950/20 dark:to-purple-950/20 rounded-2xl p-12">
            <h2 className="mb-4">Ready to Shop?</h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Explore our curated collections of premium intimate products
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button onClick={() => onNavigate('main-store')}>
                Browse Adult Toys
              </Button>
              <Button variant="outline" onClick={() => onNavigate('lingerie-store')}>
                Browse Lingerie
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
