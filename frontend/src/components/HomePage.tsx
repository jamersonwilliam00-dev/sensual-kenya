import { useEffect, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Heart,
  LockKeyhole,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
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
      name: 'Sex toys',
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
      name: 'For two',
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

  const SectionHeading = ({ eyebrow, title, copy }: { eyebrow: string; title: string; copy?: string }) => (
    <div className="mb-8 flex flex-col gap-3 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#ad6d81]">{eyebrow}</p>
        <h2 className="font-serif text-3xl leading-tight tracking-[-0.035em] text-[#211b1b] sm:text-4xl">{title}</h2>
      </div>
      {copy && <p className="max-w-sm text-sm leading-6 text-[#75696a]">{copy}</p>}
    </div>
  );

  return (
    <main className="homepage-redesign overflow-hidden" style={{ backgroundColor: '#ffffff', color: '#241e1e' }}>
      <section className="homepage-hero relative">
        <div className="mx-auto max-w-[1480px]">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="homepage-hero-copy flex flex-col justify-center"
          >
            <p className="homepage-eyebrow mb-7 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em]">
              Sensual Kenya
              <span className="heart-glow text-base leading-none" aria-label="love">❤️</span>
              <span className="ml-1 h-px w-8 bg-[#d7b6be]" />
              Intimate wellness, considered
            </p>
            <h1 className="homepage-hero-title max-w-xl font-serif">
              Feel good
              <br />
              <span className="homepage-accent italic">in your</span>
              <br />
              own skin.
            </h1>
            <p className="homepage-subcopy mt-7 max-w-md">
              A thoughtful edit of intimate essentials, beautiful lingerie, and little things that bring you closer.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                size="lg"
                onClick={() => onNavigate('main-store')}
                className="homepage-primary-cta h-12 rounded-none px-6 text-sm font-medium"
              >
                Explore the edit <ArrowRight className="ml-3 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => onNavigate('lingerie-store')}
                className="homepage-secondary-cta h-12 rounded-none px-6 text-sm font-medium"
              >
                Discover lingerie
              </Button>
            </div>
            <a href="#collections" className="mt-12 hidden w-fit items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8b7779] lg:flex">
              Scroll to explore <ArrowDown className="h-3.5 w-3.5" />
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 1.025 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9 }}
            className="homepage-hero-art relative overflow-hidden bg-[#e7d9d6]"
          >
            <ImageWithFallback
              src={getProductImage(heroProduct, categoryFallbacks.lingerie)}
              alt={heroProduct?.name || 'Sensual Kenya intimate wellness collection'}
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/5" />
            <div className="absolute left-5 top-5 flex items-center gap-2 border border-white/40 bg-white/80 px-3 py-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#302526] backdrop-blur sm:left-8 sm:top-8">
              <Sparkles className="h-3.5 w-3.5 text-[#c56681]" />
              Curated for you
            </div>
            {heroProduct && (
              <button
                type="button"
                onClick={() => onViewProduct?.(heroProduct.id)}
                className="absolute bottom-5 left-5 flex max-w-[calc(100%-2.5rem)] items-center gap-4 bg-white/95 p-3 text-left shadow-xl backdrop-blur transition hover:bg-white sm:bottom-8 sm:left-8 sm:p-4"
              >
                <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center bg-[#f6e8eb] text-[#bd637c]">
                  <Heart className="h-5 w-5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[9px] font-semibold uppercase tracking-[0.2em] text-[#a46a7d]">Featured find</span>
                  <span className="mt-1 block truncate text-sm font-semibold text-[#241e1e]">{heroProduct.name}</span>
                  <span className="mt-0.5 block text-xs text-[#706566]">{formatPrice(heroProduct.price)}</span>
                </span>
                <ArrowUpRight className="ml-1 h-4 w-4 flex-shrink-0 text-[#6e5d60]" />
              </button>
            )}
            <div className="absolute bottom-8 right-7 hidden max-w-[140px] text-right text-[10px] font-medium uppercase leading-5 tracking-[0.2em] text-white/90 lg:block">
              Intimacy, on your terms
            </div>
          </motion.div>
        </div>
      </section>

      <section className="homepage-trust border-b">
        <div className="mx-auto grid max-w-7xl grid-cols-1 divide-y divide-[#eee6e4] px-6 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:px-8">
          {[
            { icon: LockKeyhole, title: 'Your privacy, protected', copy: 'Discreet packaging on every order' },
            { icon: ShieldCheck, title: 'Shop with confidence', copy: 'Thoughtfully selected essentials' },
            { icon: Truck, title: 'Delivered across Kenya', copy: 'Reliable delivery, wherever you are' }
          ].map(({ icon: Icon, title, copy }) => (
            <div key={title} className="flex items-center gap-4 py-5 sm:justify-center sm:py-6">
              <Icon className="h-4 w-4 flex-shrink-0 text-[#bd7185]" strokeWidth={1.6} />
              <div>
                <p className="text-xs font-semibold text-[#302627]">{title}</p>
                <p className="mt-1 text-[11px] text-[#877b7c]">{copy}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="collections" className="homepage-collections">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 sm:py-24">
        <SectionHeading
          eyebrow="A world of possibility"
          title="Find what feels like you."
          copy="Explore a considered collection made for confidence, connection, and a little more pleasure in the everyday."
        />
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {categories.map((category, index) => (
            <motion.button
              key={category.name}
              type="button"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.45, delay: index * 0.07 }}
              onClick={() => onNavigate(category.destination)}
              className={`group relative block overflow-hidden bg-[#eee5e3] text-left ${index % 2 === 1 ? 'mt-7 sm:mt-10' : ''}`}
            >
              <ImageWithFallback
                src={category.image}
                alt={`${category.name} collection`}
                className="homepage-category-image w-full object-cover transition-transform duration-700 group-hover:scale-[1.045]"
              />
              <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent" />
              <span className="absolute left-4 top-4 text-[9px] font-semibold tracking-[0.18em] text-white/80 sm:left-6 sm:top-6">{category.index}</span>
              <span className="absolute inset-x-4 bottom-4 text-white sm:inset-x-6 sm:bottom-6">
                <span className="block font-serif text-xl leading-tight sm:text-2xl">{category.name}</span>
                <span className="mt-1.5 flex items-center justify-between gap-2 text-[10px] font-medium uppercase tracking-[0.12em] text-white/75 sm:text-[11px]">
                  {category.detail}
                  <ArrowUpRight className="h-4 w-4 flex-shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </span>
              </span>
            </motion.button>
          ))}
        </div>
        </div>
      </section>

      <section className="homepage-trending py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <div className="flex items-end justify-between gap-4">
            <SectionHeading
              eyebrow="The community loves"
              title="Trending now."
              copy="The pieces people are coming back for."
            />
            {trendingProducts.length > 3 && (
              <div className="mb-9 hidden gap-2 sm:flex">
                <button type="button" aria-label="Previous products" onClick={() => scrollTrending(-1)} className="flex h-10 w-10 items-center justify-center border border-[#dfd2d0] transition hover:border-[#241e1e] hover:bg-white">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button type="button" aria-label="Next products" onClick={() => scrollTrending(1)} className="flex h-10 w-10 items-center justify-center border border-[#dfd2d0] transition hover:border-[#241e1e] hover:bg-white">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
          {trendingProducts.length > 0 ? (
            <div ref={trendingRef} className="-mx-6 flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-3 scrollbar-hide sm:mx-0 sm:px-0">
              {trendingProducts.map((product, index) => (
                <div key={product.id} className="homepage-trending-item snap-start">
                  <ProductTile product={product} onAddToCart={onAddToCart} onViewProduct={onViewProduct} label={index === 0 ? 'Most loved' : undefined} />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
              {categories.slice(0, 4).map((category) => (
                <button key={category.name} type="button" onClick={() => onNavigate(category.destination)} className="text-left">
                  <ImageWithFallback src={category.image} alt={category.name} className="aspect-[4/5] w-full object-cover" />
                  <span className="mt-3 block text-sm font-medium">{category.name}</span>
                </button>
              ))}
            </div>
          )}
          <div className="mt-8 flex justify-center sm:justify-start">
            <Button variant="link" onClick={() => onNavigate('main-store')} className="h-auto p-0 text-xs font-semibold uppercase tracking-[0.17em] text-[#392b2d] hover:text-[#bd637c]">
              Shop all products <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      <section className="homepage-product-showcase">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 sm:py-24">
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-12">
          <div>
            <SectionHeading eyebrow="Worth discovering" title="Best sellers." />
            {bestSellers.length > 0 ? (
              <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6">
                {bestSellers.map((product) => (
                  <ProductTile key={`best-${product.id}`} product={product} onAddToCart={onAddToCart} onViewProduct={onViewProduct} />
                ))}
              </div>
            ) : (
              <button type="button" onClick={() => onNavigate('main-store')} className="group relative block w-full overflow-hidden bg-[#f5f0ee] text-left">
                <ImageWithFallback src={categoryFallbacks.toys} alt="Explore best-loved intimate essentials" className="aspect-[1.45] w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
                <span className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent" />
                <span className="absolute bottom-5 left-5 text-lg font-medium text-white">Find your new favourite <ArrowRight className="ml-2 inline h-4 w-4" /></span>
              </button>
            )}
          </div>
          <div>
            <SectionHeading eyebrow="Just arrived" title="New arrivals." />
            {newArrivals.length > 0 ? (
              <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6">
                {newArrivals.map((product) => (
                  <ProductTile key={`new-${product.id}`} product={product} onAddToCart={onAddToCart} onViewProduct={onViewProduct} label="New" />
                ))}
              </div>
            ) : (
              <button type="button" onClick={() => onNavigate('lingerie-store')} className="group relative block w-full overflow-hidden bg-[#f5f0ee] text-left">
                <ImageWithFallback src={categoryFallbacks.lingerie} alt="Discover new lingerie arrivals" className="aspect-[1.45] w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
                <span className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent" />
                <span className="absolute bottom-5 left-5 text-lg font-medium text-white">Meet the latest edit <ArrowRight className="ml-2 inline h-4 w-4" /></span>
              </button>
            )}
          </div>
        </div>
        </div>
      </section>

      <section className="homepage-contact relative overflow-hidden">
        <div className="absolute -right-20 -top-32 h-80 w-80 rounded-full border border-white/70 sm:h-[30rem] sm:w-[30rem]" />
        <div className="absolute -right-10 -top-20 h-60 w-60 rounded-full border border-white/50 sm:h-[24rem] sm:w-[24rem]" />
        <div className="relative mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-6 py-14 sm:px-8 sm:py-20 lg:flex-row lg:items-center">
          <div className="max-w-2xl">
            <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#a46779]">Here for you</p>
            <h2 className="font-serif text-3xl leading-tight tracking-[-0.035em] text-[#241e1e] sm:text-5xl">
              A question? We’re always happy to help.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-[#746668] sm:text-base">
              Please feel free to contact us for any product enquiries or further information.
            </p>
          </div>
          <Button
            size="lg"
            onClick={() => onNavigate('contact')}
            className="homepage-primary-cta h-12 rounded-none px-6 text-sm"
          >
            Get in touch <ArrowRight className="ml-3 h-4 w-4" />
          </Button>
        </div>
      </section>
      <style>{`
        .homepage-redesign { color: #241e1e; background: #fff; }
        .homepage-hero { background: #f2d3dc; }
        .homepage-hero > div { display: grid; grid-template-columns: minmax(0, 1fr); }
        .homepage-hero-copy { order: 2; padding: 2.25rem 1.5rem 3rem; }
        .homepage-hero-art { order: 1; height: min(94vw, 560px); min-height: 360px; }
        .homepage-hero-title { color: #211b1b; font-size: clamp(2.65rem, 10vw, 6.6rem); line-height: .92; letter-spacing: -.065em; }
        .homepage-accent { color: #ca3d68; }
        .homepage-eyebrow { color: #805461; }
        .homepage-subcopy { color: #6e6263; font-size: 1rem; line-height: 1.8; }
        .homepage-primary-cta { background: #d8476d !important; color: #fff !important; }
        .homepage-primary-cta:hover { background: #241e1e !important; }
        .homepage-secondary-cta { border: 1px solid #d8c8c8 !important; background: transparent !important; color: #241e1e !important; }
        .homepage-secondary-cta:hover { border-color: #d8476d !important; background: rgba(255,255,255,.55) !important; }
        .homepage-product-image { display: block; aspect-ratio: 4 / 5; }
        .homepage-category-image { display: block; aspect-ratio: .78; }
        .homepage-trending-item { width: 72vw; max-width: 285px; flex-shrink: 0; }
        .homepage-trust { background: #241e1e; border-color: #51343d; color: #fff; }
        .homepage-trust p:first-child { color: #fff; }
        .homepage-trust p:last-child { color: #dfb5c0; }
        .homepage-trust svg { color: #ef8ca8; }
        .homepage-collections { background: #fff2f6; }
        .homepage-trending { background: #f1ccd7; }
        .homepage-product-showcase { background: #241e1e; color: #fff; }
        .homepage-redesign .homepage-product-showcase h2 { color: #fff; }
        .homepage-product-showcase .homepage-product-name,
        .homepage-product-showcase .homepage-product-price { color: #fff; }
        .homepage-product-showcase .homepage-product-meta { color: #e5aabc; }
        .homepage-product-showcase .homepage-cart-button { border-color: #6a4651; color: #fff; }
        .homepage-product-showcase .homepage-cart-button:hover { border-color: #d8476d; background: #d8476d; }
        .homepage-contact { background: #d65b7b; color: #fff; padding: 3.5rem 0; }
        .homepage-redesign .homepage-contact h2 { color: #fff; }
        .homepage-redesign .homepage-contact p { color: #fff0f4; }
        .homepage-contact .homepage-primary-cta { background: #241e1e !important; }
        .homepage-contact .homepage-primary-cta:hover { background: #fff !important; color: #241e1e !important; }
        .homepage-redesign h2 { color: #211b1b; font-family: Georgia, 'Times New Roman', serif; font-size: clamp(2rem, 4vw, 2.75rem); line-height: 1.12; letter-spacing: -.035em; }
        @media (min-width: 640px) {
          .homepage-hero-copy { padding: 2.5rem 2.5rem 3rem; }
          .homepage-trending-item { width: calc((100% - 2.5rem) / 3); max-width: none; }
        }
        @media (min-width: 1024px) {
          .homepage-hero > div { grid-template-columns: minmax(0, .83fr) minmax(0, 1.17fr); min-height: 690px; }
          .homepage-hero-copy { order: 1; padding: 4rem 3.5rem 4rem 4rem; }
          .homepage-hero-art { order: 2; height: auto; min-height: 690px; }
          .homepage-subcopy { font-size: 1.125rem; }
          .homepage-contact { padding: 5rem 0; }
          .homepage-trending-item { width: calc((100% - 3.75rem) / 4); }
        }
        .scrollbar-hide { scrollbar-width: none; -ms-overflow-style: none; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .heart-glow { filter: drop-shadow(0 0 5px rgba(235, 31, 64, .75)); }
      `}</style>
    </main>
  );
}
