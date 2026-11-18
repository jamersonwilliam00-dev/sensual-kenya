import { useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Heart,
  LockKeyhole,
  ShieldCheck,
  ShoppingBag,
  Truck
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface CatalogProduct {
  id: string;
  name: string;
  price: number;
  category: string;
  image?: string;
  description?: string;
  inStock?: boolean;
  store: 'main' | 'lingerie';
  createdAt?: string;
  created_at?: string;
}

interface HomePageProps {
  onNavigate: (section: string) => void;
  isAdmin: boolean;
  onShowAuth: () => void;
  onAddToCart?: (product: any) => void;
  onViewProduct?: (productId: string) => void;
}

const categoryFallbacks = {
  toys: 'https://images.unsplash.com/photo-1664347770836-03d04faa3c04?w=1100',
  lingerie: 'https://images.unsplash.com/photo-1591079496752-a56c5474af3f?w=1100',
  couples: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=1100',
  accessories: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=1100'
};

function formatPrice(price: number) {
  return `KSh ${Number(price).toLocaleString()}`;
}

function getProductImage(product: CatalogProduct | undefined, fallback: string) {
  return product?.image || fallback;
}

function ProductTile({
  product,
  onAddToCart,
  onViewProduct,
  label
}: {
  product: CatalogProduct;
  onAddToCart?: (product: CatalogProduct) => void;
  onViewProduct?: (productId: string) => void;
  label?: string;
}) {
  return (
    <article className="group min-w-0">
      <button
        type="button"
        className="relative block w-full overflow-hidden bg-[#f5f0ee] text-left"
        onClick={() => onViewProduct?.(product.id)}
        aria-label={`View ${product.name}`}
      >
        <ImageWithFallback
          src={product.image || categoryFallbacks.toys}
          alt={product.name}
          className="homepage-product-image w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />
        {label && (
          <span className="absolute left-3 top-3 bg-white/90 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#292323] backdrop-blur">
            {label}
          </span>
        )}
        {product.inStock === false && (
          <span className="absolute right-3 top-3 bg-black/75 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-white">
            Sold out
          </span>
        )}
        <span className="absolute bottom-3 right-3 flex h-10 w-10 translate-y-2 items-center justify-center rounded-full bg-white text-black opacity-0 shadow-lg transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </button>
      <div className="flex items-start justify-between gap-3 pt-4">
        <button
          type="button"
          className="min-w-0 text-left"
          onClick={() => onViewProduct?.(product.id)}
        >
          <p className="homepage-product-meta mb-1 text-[10px] font-medium uppercase tracking-[0.18em]">
            {product.category}
          </p>
          <h3 className="homepage-product-name line-clamp-1 text-sm font-medium sm:text-base">
            {product.name}
          </h3>
          <p className="homepage-product-price mt-1.5 text-sm font-semibold">{formatPrice(product.price)}</p>
        </button>
        <button
          type="button"
          aria-label={`Add ${product.name} to cart`}
          disabled={product.inStock === false}
          onClick={() => onAddToCart?.(product)}
          className="homepage-cart-button mt-1 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-[#e8dadd] text-[#2a2022] transition hover:border-[#d8476d] hover:bg-[#d8476d] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ShoppingBag className="h-4 w-4" />
        </button>
      </div>
    </article>
  );
}

export function HomePage({ onNavigate, onAddToCart, onViewProduct }: HomePageProps) {
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const trendingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;

    const fetchCatalog = async () => {
      try {
        const [mainResponse, lingerieResponse] = await Promise.all([
          fetch(`https://${projectId}.supabase.co/functions/v1/make-server-afd25991/products?store=main`, {
            headers: { Authorization: `Bearer ${publicAnonKey}` }
          }),
          fetch(`https://${projectId}.supabase.co/functions/v1/make-server-afd25991/products?store=lingerie`, {
            headers: { Authorization: `Bearer ${publicAnonKey}` }
          })
        ]);

        const [mainData, lingerieData] = await Promise.all([
          mainResponse.ok ? mainResponse.json() : Promise.resolve({ products: [] }),
          lingerieResponse.ok ? lingerieResponse.json() : Promise.resolve({ products: [] })
        ]);
        if (!mainResponse.ok) console.error(`Main catalog request failed (${mainResponse.status})`);
        if (!lingerieResponse.ok) console.error(`Lingerie catalog request failed (${lingerieResponse.status})`);
        const catalog: CatalogProduct[] = [
          ...(mainData.products || []).map((product: CatalogProduct) => ({ ...product, store: 'main' as const })),
          ...(lingerieData.products || []).map((product: CatalogProduct) => ({ ...product, store: 'lingerie' as const }))
        ];

        if (active) setProducts(catalog);
      } catch (error) {
        console.error('Error loading homepage catalog:', error);
      }
    };

    fetchCatalog();
    return () => {
      active = false;
    };
  }, []);

  const mainProducts = products.filter((product) => product.store === 'main');
  const lingerieProducts = products.filter((product) => product.store === 'lingerie');
  const trendingProducts = products.slice(0, 10);
  const bestSellers = [...products]
    .sort((a, b) => Number(b.price) - Number(a.price))
    .slice(0, 4);
  const datedProducts = products.filter((product) => product.createdAt || product.created_at);
  const newArrivals = datedProducts.length > 0
    ? [...datedProducts]
      .sort((a, b) => {
        const dateA = new Date(a.createdAt || a.created_at || 0).getTime();
        const dateB = new Date(b.createdAt || b.created_at || 0).getTime();
        return dateB - dateA;
      })
      .slice(0, 4)
    : products.slice(-4);
  const heroProduct = mainProducts[0] || products[0];
  const categories = [
    {
      name: 'Sex Toys',
      detail: 'Find your new favourite',
      image: getProductImage(mainProducts[0], categoryFallbacks.toys),
      destination: 'main-store',
      index: '01'
    },
    {
      name: 'Lingerie',
      detail: 'Made to feel like you',
      image: getProductImage(lingerieProducts[0], categoryFallbacks.lingerie),
      destination: 'lingerie-store',
      index: '02'
    },
    {
      name: "Couples' Products",
      detail: 'A little closer, together',
      image: getProductImage(mainProducts.find((product) => /couple|remote|wearable/i.test(`${product.category} ${product.name}`)) || mainProducts[1], categoryFallbacks.couples),
      destination: 'main-store',
      index: '03'
    },
    {
      name: 'Accessories',
      detail: 'The finishing touches',
      image: getProductImage(mainProducts.find((product) => /accessor|lubricant|care|clean/i.test(`${product.category} ${product.name}`)) || mainProducts[2], categoryFallbacks.accessories),
      destination: 'main-store',
      index: '04'
    }
  ];

  const scrollTrending = (direction: -1 | 1) => {
    trendingRef.current?.scrollBy({ left: direction * 340, behavior: 'smooth' });
  };

  useEffect(() => {
    const track = trendingRef.current;
    if (!track || trendingProducts.length < 2) return;

    const autoplay = window.setInterval(() => {
      if (track.matches(':hover') || track.contains(document.activeElement)) return;
      const end = track.scrollWidth - track.clientWidth;
      if (track.scrollLeft >= end - 5) track.scrollTo({ left: 0, behavior: 'smooth' });
      else scrollTrending(1);
    }, 4500);

    return () => window.clearInterval(autoplay);
  }, [trendingProducts.length]);

  return (
    <main className="sk-home">
      <div className="sk-delivery-ribbon">
        <span>✦ DISCREET DELIVERY ACROSS KENYA</span>
        <span className="sk-ribbon-separator">|</span>
        <span>SHOP WITH CONFIDENCE</span>
      </div>

      <section className="sk-hero">
        <div className="sk-container sk-hero-grid">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="sk-hero-copy"
          >
            <p className="sk-eyebrow">
              SENSUAL WELLNESS, REDEFINED <span className="sk-glowing-heart" aria-label="love">❤️</span>
            </p>
            <h1>Elevate Your <em>Intimate Moments</em></h1>
            <p className="sk-hero-description">
              Discover Kenya&apos;s trusted destination for sensual wellness, intimate products and elegant lingerie.
            </p>
            <div className="sk-actions">
              <Button onClick={() => onNavigate('main-store')} className="sk-button sk-button-primary">
                Shop Adult Toys <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button onClick={() => onNavigate('lingerie-store')} className="sk-button sk-button-outline">
                Browse Lingerie
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.75 }}
            className="sk-hero-photo"
          >
            <ImageWithFallback
              src={getProductImage(heroProduct, categoryFallbacks.lingerie)}
              alt={heroProduct?.name || 'Sensual Kenya intimate wellness collection'}
              className="sk-cover-image"
            />
            {heroProduct && (
              <button
                type="button"
                className="sk-featured-product"
                onClick={() => onViewProduct?.(heroProduct.id)}
              >
                <span className="sk-featured-icon"><Heart className="h-5 w-5" /></span>
                <span>
                  <span className="sk-featured-label">Featured find</span>
                  <span className="sk-featured-name">{heroProduct.name}</span>
                  <span className="sk-featured-price">{formatPrice(heroProduct.price)}</span>
                </span>
                <ArrowUpRight className="h-4 w-4" />
              </button>
            )}
          </motion.div>
        </div>
      </section>

      <section className="sk-rating-strip">
        <div className="sk-container sk-rating-content">
          <span className="sk-stars" aria-label="5 stars">★★★★★</span>
          <strong>Loved by 10,000+ customers</strong>
          <span>Your privacy and comfort come first</span>
        </div>
      </section>

      <section id="collections" className="sk-section">
        <div className="sk-container">
          <div className="sk-section-heading">
            <div>
              <p className="sk-eyebrow">A little something for everyone</p>
              <h2>Explore Our Collections</h2>
            </div>
            <button type="button" onClick={() => onNavigate('main-store')} className="sk-text-link">
              View All <ArrowRight className="ml-1 inline h-4 w-4" />
            </button>
          </div>
          <div className="sk-collections">
            {categories.map((category, index) => (
              <motion.button
                key={category.name}
                type="button"
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.06 }}
                onClick={() => onNavigate(category.destination)}
                className="sk-collection-card"
              >
                <ImageWithFallback src={category.image} alt={`${category.name} collection`} className="sk-cover-image" />
                <span className="sk-collection-copy">
                  <span className="sk-collection-index">{category.index}</span>
                  <span className="sk-collection-title">{category.name}</span>
                  <span className="sk-collection-detail">{category.detail}<ArrowUpRight className="h-4 w-4" /></span>
                </span>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      <section className="sk-section sk-products-section">
        <div className="sk-container">
          <div className="sk-section-heading">
            <div>
              <p className="sk-eyebrow">The community loves</p>
              <h2>Trending Now</h2>
            </div>
            <button type="button" onClick={() => onNavigate('main-store')} className="sk-text-link">
              Explore All <ArrowRight className="ml-1 inline h-4 w-4" />
            </button>
          </div>
          <p className="sk-subtext">Discover what&apos;s hot and loved by our customers.</p>
          <div className="sk-carousel-wrap">
            <button type="button" className="sk-carousel-button sk-carousel-prev" aria-label="Previous trending products" onClick={() => scrollTrending(-1)}>
              <ChevronLeft className="h-5 w-5" />
            </button>
            {trendingProducts.length > 0 ? (
              <div ref={trendingRef} className="sk-product-track">
                {trendingProducts.map((product, index) => (
                  <div className="sk-product-slide" key={product.id}>
                    <ProductTile
                      product={product}
                      onAddToCart={onAddToCart}
                      onViewProduct={onViewProduct}
                      label={index === 0 ? 'Trending' : undefined}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="sk-product-track">
                {categories.map((category) => (
                  <button
                    type="button"
                    className="sk-product-slide sk-empty-product"
                    key={category.name}
                    onClick={() => onNavigate(category.destination)}
                  >
                    <ImageWithFallback src={category.image} alt={category.name} className="sk-cover-image" />
                    <span>{category.name}</span>
                  </button>
                ))}
              </div>
            )}
            <button type="button" className="sk-carousel-button sk-carousel-next" aria-label="Next trending products" onClick={() => scrollTrending(1)}>
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </section>

      <section className="sk-trust-section">
        <div className="sk-container sk-trust-grid">
          {[
            { icon: LockKeyhole, title: 'Discreet Packaging', copy: 'Plain, unmarked packaging for your complete privacy.' },
            { icon: ShieldCheck, title: 'Secure Payments', copy: 'Safe and secure M-Pesa payment processing.' },
            { icon: Truck, title: 'Fast Delivery', copy: 'Reliable delivery across Kenya, wherever you are.' }
          ].map(({ icon: Icon, title, copy }) => (
            <div className="sk-trust-card" key={title}>
              <span className="sk-trust-icon"><Icon className="h-6 w-6" strokeWidth={1.7} /></span>
              <h3>{title}</h3>
              <p>{copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="sk-section sk-featured-sections">
        <div className="sk-container sk-featured-grid">
          <div>
            <div className="sk-section-heading">
              <div><p className="sk-eyebrow">Customer favourites</p><h2>Best Sellers</h2></div>
            </div>
            {bestSellers.length > 0 ? (
              <div className="sk-small-product-grid">
                {bestSellers.map((product) => <ProductTile key={`best-${product.id}`} product={product} onAddToCart={onAddToCart} onViewProduct={onViewProduct} />)}
              </div>
            ) : (
              <button type="button" className="sk-editorial-fallback" onClick={() => onNavigate('main-store')}>
                <ImageWithFallback src={categoryFallbacks.toys} alt="Shop customer favourite products" className="sk-cover-image" />
                <span>Discover customer favourites <ArrowRight className="ml-2 inline h-4 w-4" /></span>
              </button>
            )}
          </div>
          <div>
            <div className="sk-section-heading">
              <div><p className="sk-eyebrow">Fresh from the collection</p><h2>New Arrivals</h2></div>
            </div>
            {newArrivals.length > 0 ? (
              <div className="sk-small-product-grid">
                {newArrivals.map((product) => <ProductTile key={`new-${product.id}`} product={product} onAddToCart={onAddToCart} onViewProduct={onViewProduct} label="New" />)}
              </div>
            ) : (
              <button type="button" className="sk-editorial-fallback" onClick={() => onNavigate('lingerie-store')}>
                <ImageWithFallback src={categoryFallbacks.lingerie} alt="Explore new lingerie arrivals" className="sk-cover-image" />
                <span>Meet the latest edit <ArrowRight className="ml-2 inline h-4 w-4" /></span>
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="sk-blog-section">
        <div className="sk-container sk-blog-content">
          <p className="sk-eyebrow">A little knowledge goes a long way</p>
          <h2>Discover Our Blog</h2>
          <p>Explore articles, guides and information about intimate wellness.</p>
          <Button onClick={() => onNavigate('blog')} className="sk-button sk-button-primary">Read the blog <ArrowRight className="ml-2 h-4 w-4" /></Button>
        </div>
      </section>

      <section className="sk-contact-section">
        <div className="sk-container sk-contact-content">
          <div>
            <p className="sk-eyebrow">Here for you</p>
            <h2>Need a little guidance?</h2>
            <p>Please feel free to contact us for any product enquiries or further information.</p>
          </div>
          <Button onClick={() => onNavigate('contact')} className="sk-button sk-button-primary">Contact us <ArrowRight className="ml-2 h-4 w-4" /></Button>
        </div>
      </section>

      <style>{`
        .sk-home { --sk-pink:#b52e62; --sk-hot:#d84d83; --sk-gold:#c49a62; --sk-blush:#fff0f4; --sk-ink:#24151f; --sk-muted:#755d68; --sk-line:#f0e4e9; color:var(--sk-ink); background:#fffdfd; }
        .sk-home * { box-sizing:border-box; }
        .sk-home .sk-container { width:min(1180px,92%); margin:0 auto; }
        .sk-delivery-ribbon { background:#281923; color:#fff; display:flex; justify-content:center; align-items:center; gap:10px; padding:9px 12px; font-size:10px; font-weight:600; letter-spacing:.09em; text-align:center; }
        .sk-ribbon-separator { color:#e9b9ca; }
        .sk-hero { position:relative; overflow:hidden; padding:30px 0; background:radial-gradient(circle at 85% 15%,#f6d5e0 0,transparent 35%),linear-gradient(110deg,#fff0f4,#f8e4eb); }
        .sk-hero:before,.sk-hero:after { content:""; position:absolute; border:1px solid #e7b6c8; border-radius:50%; pointer-events:none; opacity:.55; }
        .sk-hero:before { width:260px; height:260px; right:-115px; top:-125px; }
        .sk-hero:after { width:150px; height:150px; right:12%; bottom:-120px; }
        .sk-hero-grid { position:relative; z-index:1; display:grid; grid-template-columns:1.1fr .9fr; gap:34px; align-items:center; }
        .sk-hero-copy { padding:20px 0; }
        .sk-eyebrow { margin:0 0 12px; color:var(--sk-pink); font-size:10px; font-weight:700; letter-spacing:.19em; text-transform:uppercase; }
        .sk-glowing-heart { display:inline-block; margin-left:5px; font-size:15px; filter:drop-shadow(0 0 5px rgba(235,31,64,.85)); }
        .sk-hero h1,.sk-section-heading h2,.sk-blog-section h2,.sk-contact-section h2 { margin:0; color:var(--sk-ink); font-family:Georgia,'Times New Roman',serif; }
        .sk-hero h1 { max-width:600px; font-size:clamp(38px,5vw,62px); line-height:1.07; letter-spacing:-.045em; }
        .sk-hero h1 em { color:var(--sk-pink); font-style:normal; }
        .sk-hero-description { max-width:490px; margin:17px 0 24px; color:var(--sk-muted); font-size:14px; line-height:1.75; }
        .sk-actions { display:flex; flex-wrap:wrap; gap:11px; }
        .sk-button { min-height:44px; border-radius:5px!important; padding:12px 19px!important; font-size:12px!important; font-weight:700!important; transition:transform .2s,box-shadow .2s,background .2s!important; }
        .sk-button:hover { transform:translateY(-2px); box-shadow:0 8px 18px #a52e5930; }
        .sk-button-primary { background:linear-gradient(135deg,#bd356b,#8f214b)!important; color:#fff!important; }
        .sk-button-outline { border:1px solid var(--sk-pink)!important; background:transparent!important; color:var(--sk-pink)!important; }
        .sk-hero-photo { position:relative; height:340px; overflow:hidden; border-radius:9px; background:linear-gradient(135deg,#e9bdcc,#f8e9ee,#c987a2); box-shadow:0 18px 40px #6f30421c; }
        .sk-cover-image { display:block; width:100%; height:100%; object-fit:cover; transition:transform .45s; }
        .sk-hero-photo:after { position:absolute; content:""; inset:12px; border:1px solid #ffffff9c; border-radius:5px; pointer-events:none; }
        .sk-featured-product { position:absolute; z-index:1; left:22px; bottom:22px; display:flex; align-items:center; gap:12px; max-width:calc(100% - 44px); padding:11px 15px; border:0; background:#fffF; color:var(--sk-ink); text-align:left; box-shadow:0 8px 22px #29131c24; }
        .sk-featured-icon { display:grid; width:42px; height:42px; flex:0 0 auto; place-items:center; border-radius:50%; background:var(--sk-blush); color:var(--sk-pink); }
        .sk-featured-label,.sk-featured-name,.sk-featured-price { display:block; }
        .sk-featured-label { color:var(--sk-pink); font-size:9px; font-weight:700; letter-spacing:.14em; text-transform:uppercase; }
        .sk-featured-name { overflow:hidden; max-width:220px; margin:3px 0; font-size:12px; font-weight:700; text-overflow:ellipsis; white-space:nowrap; }
        .sk-featured-price { color:var(--sk-muted); font-size:11px; }
        .sk-rating-strip { padding:16px 0; border-bottom:1px solid var(--sk-line); background:#fff; }
        .sk-rating-content { display:flex; flex-wrap:wrap; justify-content:center; align-items:center; gap:12px; text-align:center; }
        .sk-rating-content strong { font-size:13px; }
        .sk-rating-content>span:last-child { color:var(--sk-muted); font-size:12px; }
        .sk-stars { color:var(--sk-gold); font-size:14px; letter-spacing:2px; }
        .sk-section { padding:55px 0; }
        .sk-section-heading { display:flex; justify-content:space-between; align-items:center; gap:15px; margin-bottom:23px; }
        .sk-section-heading .sk-eyebrow { margin-bottom:8px; }
        .sk-section-heading h2,.sk-blog-section h2,.sk-contact-section h2 { font-size:clamp(25px,3vw,34px); letter-spacing:-.035em; }
        .sk-text-link { flex:0 0 auto; border:0; background:transparent; color:var(--sk-pink); font-size:12px; font-weight:700; }
        .sk-text-link:hover { color:var(--sk-hot); }
        .sk-collections { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:18px; }
        .sk-collection-card { position:relative; height:270px; overflow:hidden; padding:0; border:0; border-radius:8px; background:var(--sk-blush); text-align:left; box-shadow:0 10px 25px #2b15200d; }
        .sk-collection-card:hover .sk-cover-image { transform:scale(1.045); }
        .sk-collection-card:after { position:absolute; content:""; inset:0; border:1px solid #ffffff35; border-radius:8px; pointer-events:none; }
        .sk-collection-copy { position:absolute; inset:0; display:flex; flex-direction:column; justify-content:flex-end; padding:19px; color:white; background:linear-gradient(0deg,rgba(28,12,22,.82),rgba(28,12,22,.02) 78%); }
        .sk-collection-index { position:absolute; top:15px; left:16px; font-size:10px; font-weight:700; letter-spacing:.16em; color:#fffC; }
        .sk-collection-title { margin-bottom:6px; font-family:Georgia,'Times New Roman',serif; font-size:21px; }
        .sk-collection-detail { display:flex; justify-content:space-between; align-items:center; gap:8px; font-size:10px; font-weight:700; letter-spacing:.1em; text-transform:uppercase; color:#fffD; }
        .sk-products-section { background:linear-gradient(110deg,#fff,#fff7f9); }
        .sk-products-section .sk-section-heading { margin-bottom:18px; }
        .sk-subtext { margin:-7px 0 22px; color:var(--sk-muted); font-size:13px; }
        .sk-carousel-wrap { position:relative; }
        .sk-product-track { display:flex; gap:18px; overflow-x:auto; padding:2px 1px 14px; scroll-behavior:smooth; scroll-snap-type:x mandatory; scrollbar-width:none; }
        .sk-product-track::-webkit-scrollbar { display:none; }
        .sk-product-slide { width:calc((100% - 54px)/4); min-width:0; flex:0 0 auto; scroll-snap-align:start; }
        .sk-carousel-button { position:absolute; z-index:2; top:40%; display:grid; width:38px; height:38px; place-items:center; transform:translateY(-50%); border:1px solid var(--sk-line); border-radius:50%; background:#fff; color:var(--sk-ink); box-shadow:0 2px 10px #0001; }
        .sk-carousel-button:hover { color:var(--sk-pink); box-shadow:0 5px 15px #a52e591b; }
        .sk-carousel-prev { left:-17px; }.sk-carousel-next { right:-17px; }
        .sk-home .homepage-product-image { display:block; aspect-ratio:4/5; background:var(--sk-blush); }
        .sk-home .group:hover .homepage-product-image { transform:scale(1.04); }
        .sk-home .homepage-product-meta { color:var(--sk-pink); font-size:9px; }
        .sk-home .homepage-product-name { color:var(--sk-ink); font-size:13px; line-height:1.4; }
        .sk-home .homepage-product-price { color:var(--sk-pink); font-size:14px; }
        .sk-home .homepage-cart-button { border-color:var(--sk-line); color:var(--sk-ink); }
        .sk-home .homepage-cart-button:hover { border-color:var(--sk-pink); background:var(--sk-pink); color:#fff; }
        .sk-empty-product { text-align:left; }
        .sk-empty-product .sk-cover-image { aspect-ratio:4/5; }
        .sk-empty-product span { display:block; padding-top:10px; font-weight:600; }
        .sk-trust-section { padding:45px 0; background:linear-gradient(110deg,#fff0f4,#f9e4ec); }
        .sk-trust-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:20px; }
        .sk-trust-card { padding:22px 18px; border:1px solid #f1dce5; border-radius:9px; background:#ffffffad; text-align:center; }
        .sk-trust-icon { display:grid; width:52px; height:52px; place-items:center; margin:0 auto 13px; border-radius:50%; background:#fff; color:var(--sk-pink); box-shadow:0 5px 16px #a52e5914; }
        .sk-trust-card h3 { margin:0 0 8px; color:var(--sk-ink); font-size:14px; font-weight:700; }
        .sk-trust-card p { margin:0; color:var(--sk-muted); font-size:12px; line-height:1.6; }
        .sk-featured-sections { background:#fff; }
        .sk-featured-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:42px; }
        .sk-featured-grid .sk-section-heading h2 { font-size:28px; }
        .sk-small-product-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:23px 16px; }
        .sk-small-product-grid .homepage-product-image { aspect-ratio:4/4.5; }
        .sk-editorial-fallback { position:relative; display:block; width:100%; overflow:hidden; padding:0; border:0; background:var(--sk-blush); text-align:left; }
        .sk-editorial-fallback .sk-cover-image { aspect-ratio:1.45; }
        .sk-editorial-fallback span { position:absolute; inset:auto 0 0; padding:20px; color:#fff; background:linear-gradient(transparent,#24151fbf); font-weight:700; }
        .sk-blog-section { padding:45px 0; background:linear-gradient(110deg,#fff,#fff7f9); text-align:center; }
        .sk-blog-content .sk-eyebrow { margin-bottom:8px; }
        .sk-blog-section h2 { font-size:31px; }
        .sk-blog-section p:not(.sk-eyebrow) { margin:11px 0 19px; color:var(--sk-muted); font-size:13px; }
        .sk-contact-section { padding:36px 0; background:var(--sk-blush); }
        .sk-contact-content { display:flex; justify-content:space-between; align-items:center; gap:24px; }
        .sk-contact-content .sk-eyebrow { margin-bottom:7px; }
        .sk-contact-content p:not(.sk-eyebrow) { margin:9px 0 0; color:var(--sk-muted); font-size:13px; line-height:1.6; }
        @media(max-width:900px) { .sk-product-slide { width:calc((100% - 36px)/3); } .sk-collections { grid-template-columns:repeat(2,minmax(0,1fr)); } }
        @media(max-width:760px) {
          .sk-delivery-ribbon { gap:7px; padding:8px 7px; font-size:8px; letter-spacing:.055em; }
          .sk-hero { padding:22px 0; }
          .sk-hero-grid { grid-template-columns:1fr; gap:17px; }
          .sk-hero-photo { height:220px; }
          .sk-hero-copy { padding:5px 0; }
          .sk-hero h1 { font-size:clamp(34px,9vw,44px); }
          .sk-hero-description { margin:13px 0 18px; font-size:13px; }
          .sk-section { padding:38px 0; }
          .sk-section-heading { margin-bottom:18px; }
          .sk-section-heading h2 { font-size:24px; }
          .sk-collections { gap:11px; }
          .sk-collection-card { height:190px; }
          .sk-collection-copy { padding:13px; }
          .sk-collection-title { font-size:17px; }
          .sk-collection-detail { font-size:8px; letter-spacing:.06em; }
          .sk-product-slide { width:72%; }
          .sk-carousel-button { width:33px; height:33px; }
          .sk-carousel-prev { left:-9px; }.sk-carousel-next { right:-9px; }
          .sk-trust-section { padding:32px 0; }
          .sk-trust-grid { grid-template-columns:1fr; gap:12px; }
          .sk-trust-card { display:grid; grid-template-columns:52px 1fr; column-gap:13px; padding:16px; text-align:left; }
          .sk-trust-icon { grid-row:span 2; margin:auto; }
          .sk-trust-card h3 { align-self:end; margin-bottom:3px; }
          .sk-trust-card p { align-self:start; }
          .sk-featured-grid { grid-template-columns:1fr; gap:34px; }
          .sk-small-product-grid { gap:20px 12px; }
          .sk-blog-section { padding:38px 0; }
          .sk-blog-section h2 { font-size:26px; }
          .sk-contact-content { align-items:flex-start; flex-direction:column; gap:18px; }
        }
        @media(prefers-reduced-motion:reduce) { .sk-home *, .sk-home *:before, .sk-home *:after { scroll-behavior:auto!important; transition-duration:.01ms!important; } }
      `}</style>
    </main>
  );
}
