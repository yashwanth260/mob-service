import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from './supabaseClient';
import { mockServices, initialRepairs, mockTestimonials, initialStoreModels } from './data.js';













const rawGalleryModules = import.meta.glob('./assets/gallery/*.{png,jpg,jpeg,webp,svg}', { eager: true });
const autoGalleryImages = Object.values(rawGalleryModules).map(mod => mod.default);

const rawDeviceModules = import.meta.glob('./assets/devices/*.{png,jpg,jpeg,webp,svg}', { eager: true });
const autoDeviceImages = {};
for (const path in rawDeviceModules) {
  const filename = path.split('/').pop().split('.')[0].replace(/-/g, ' ').toLowerCase();
  autoDeviceImages[filename] = rawDeviceModules[path].default;
}

const FloatingParticles = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute bg-white/20 rounded-full"
          style={{
            width: Math.random() * 4 + 1 + 'px',
            height: Math.random() * 4 + 1 + 'px',
            top: Math.random() * 100 + '%',
            left: Math.random() * 100 + '%',
          }}
          animate={{
            y: [0, Math.random() * -100 - 50],
            x: [0, Math.random() * 50 - 25],
            opacity: [0, 0.8, 0],
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            ease: "linear",
            delay: Math.random() * 5,
          }}
        />
      ))}
    </div>
  );
};

const TypewriterText = ({ text, className }) => {
  return (
    <motion.span
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={{
        hidden: { opacity: 1 },
        visible: {
          opacity: 1,
          transition: { staggerChildren: 0.05 }
        }
      }}
    >
      {text.split('').map((char, index) => (
        <motion.span
          key={index}
          variants={{
            hidden: { opacity: 0, y: 10 },
            visible: { opacity: 1, y: 0 }
          }}
        >
          {char}
        </motion.span>
      ))}
    </motion.span>
  );
};

export default function Storefront({ session }) {
  const [currentView, setCurrentView] = useState('home');
  const [cart, setCart] = useState([]);
  const [repairs, setRepairs] = useState([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(3);

  // Auth State
  const isLoggedIn = !!session;
  const [authData, setAuthData] = useState({ email: '', phone: '', password: '' });
  const [authLoading, setAuthLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState('');
  const [authError, setAuthError] = useState('');
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (!authData.email) {
      setAuthError("Please enter your email address first.");
      return;
    }
    setAuthLoading(true);
    setAuthMessage('');
    setAuthError('');
    
    const { error } = await supabase.auth.resetPasswordForEmail(authData.email, {
      redirectTo: window.location.origin,
    });
    
    if (error) setAuthError(error.message);
    else setAuthMessage('Password reset link sent to your email!');
    
    setAuthLoading(false);
  };

  const handleAuth = async (e, type) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthMessage('');
    setAuthError('');
    
    if (type === 'signup') {
      const { error } = await supabase.auth.signUp({
        email: authData.email,
        password: authData.password,
        options: { data: { phone: authData.phone } }
      });
      if (error) setAuthError(error.message);
      else setAuthMessage('Account created! You are now logged in.');
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email: authData.email,
        password: authData.password
      });
      if (error) setAuthError(error.message);
    }
    setAuthLoading(false);
  };

  const handleGoogleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        queryParams: {
          prompt: 'select_account'
        }
      }
    });

    if (error) {
      console.error('Error logging in with Google:', error.message);
    }
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error.message);
    } else {
      window.location.href = '/';
    }
  };

  // Store Gallery State
  const [activeStoreImage, setActiveStoreImage] = useState(autoGalleryImages[0] || '/storefront.png');
  const [storeImages, setStoreImages] = useState([]);

  // Repair Wizard & Brand Models State
  const [storeModels, setStoreModels] = useState([]);
  const [brandSearchQuery, setBrandSearchQuery] = useState('');
  const [serviceSearchQuery, setServiceSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');

  const [repairStep, setRepairStep] = useState(1);
  const [notification, setNotification] = useState(null);
  const [repairData, setRepairData] = useState({ brand: '', model: '', services: [], name: '', phone: '' });

  const dynamicBrands = Array.from(new Set(storeModels.map(m => m.brand)));

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [modelsRes, galleryRes] = await Promise.all([
        supabase.from('devices').select('*'),
        supabase.from('gallery').select('*')
      ]);
      const modelsData = modelsRes.data || [];
      const enrichedModels = modelsData.map(m => {
        const match = autoDeviceImages[m.name.toLowerCase()];
        return (match && !m.image) ? { ...m, image: match } : m;
      });
      setStoreModels(enrichedModels.length > 0 ? enrichedModels : initialStoreModels);
      
      const galleryData = galleryRes.data || [];
      const loadedImages = galleryData.map(img => img.image_url);
      if (loadedImages.length > 0) {
        setStoreImages(loadedImages);
        setActiveStoreImage(loadedImages[0]);
      } else if (autoGalleryImages.length > 0) {
        setStoreImages(autoGalleryImages);
      } else {
        setStoreImages(['/storefront.png', '/storefront_interior.png', '/storefront_repair_lab.png']);
      }
    } catch(err) {
      console.error("Error fetching data", err);
      // Fallback
      setStoreImages(['/storefront.png']);
      setStoreModels(initialStoreModels);
    }
  };

  // Cart Functions
  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { ...product, quantity: 1 }];
    });
  };
  const removeFromCart = (id) => setCart(prev => prev.filter(item => item.id !== id));
  const getCartTotalQuantity = () => cart.reduce((total, item) => total + item.quantity, 0);

  // Coverflow Controls
  useEffect(() => {
    if (currentView !== 'home') return;
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') setActiveIndex(Math.max(0, activeIndex - 1));
      if (e.key === 'ArrowRight') setActiveIndex(Math.min(storeModels.length - 1, activeIndex + 1));
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, currentView]);

  const getCoverflowClass = (i) => {
    const d = i - activeIndex;
    if (d === 0) return 'cf-pos-0';
    if (d === 1) return 'cf-pos-1';
    if (d === 2) return 'cf-pos-2';
    if (d >= 3) return 'cf-pos-3';
    if (d === -1) return 'cf-pos-n1';
    if (d === -2) return 'cf-pos-n2';
    if (d <= -3) return 'cf-pos-n3';
    return 'cf-hidden';
  };

  const handleNavClick = (view) => {
    if (view === 'repair' && !isLoggedIn) {
      setCurrentView('home');
      setIsMobileMenuOpen(false);
      setTimeout(() => {
        document.getElementById('login-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      setNotification({ type: 'error', title: 'Authentication Required', message: 'Please login first to book a repair service.' });
      setTimeout(() => setNotification(null), 3500);
      return;
    }
    setCurrentView(view);
    setIsMobileMenuOpen(false);
    if (view === 'repair') {
      setRepairStep(1);
      setRepairData({ brand: '', model: '', services: [], name: '', phone: '' });
    }
  };

  const renderHeader = () => (
    <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-ink/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        {/* Brand */}
        <button onClick={() => handleNavClick('home')} className="flex items-center gap-2.5">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-aqua to-magenta shadow-lg shadow-aqua/20">
            <span className="iconify text-ink text-[18px]" data-icon="ph:cards-three-fill"></span>
          </div>
          <span className="font-display text-lg font-bold tracking-tight text-white">7 Star Mobiles</span>
        </button>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <button onClick={() => handleNavClick('shop')} className="transition hover:text-white">Shop</button>
          <button onClick={() => handleNavClick('repair')} className="transition hover:text-white">Book Repair</button>
        </div>

        {/* Right CTA / Cart */}
        <div className="flex items-center gap-3">
          <button onClick={() => handleNavClick('cart')} className="hidden sm:flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white transition">
            <span className="iconify text-lg" data-icon="ph:shopping-cart"></span>
            Cart ({getCartTotalQuantity()})
          </button>
          {isLoggedIn ? (
            <button onClick={handleSignOut} className="rounded-full bg-red-500/20 text-red-400 border border-red-500/30 px-4 py-2 text-sm font-semibold transition hover:bg-red-500/30">
              Sign Out
            </button>
          ) : (
            <button onClick={() => {
              setCurrentView('home');
              setTimeout(() => document.getElementById('login-section')?.scrollIntoView({ behavior: 'smooth' }), 100);
            }} className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-aqua">
              Sign In
            </button>
          )}
          <button 
            className="md:hidden grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-white/5" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <span className="iconify text-lg text-white" data-icon={isMobileMenuOpen ? "ph:x-bold" : "ph:list-bold"}></span>
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-white/5 bg-ink/95 backdrop-blur-xl flex flex-col px-6 py-3 space-y-1">
          {['shop', 'repair', 'cart'].map((v) => (
            <button key={v} onClick={() => handleNavClick(v)} className="rounded-lg px-2 py-3 text-left font-medium text-slate-300 hover:bg-white/5 hover:text-white capitalize">
              {v}
            </button>
          ))}
        </div>
      )}
    </nav>
  );

  const renderHome = () => (
    <>
      <header className="relative w-full overflow-hidden">
        <FloatingParticles />
        <div className="aurora"></div>
        <div className="aurora-mid"></div>
        <div className="grid-tex"></div>

        <div className="relative mx-auto max-w-6xl px-6 pt-16 pb-10 text-center sm:pt-20">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-slate-300 backdrop-blur">
            <div className="h-1.5 w-1.5 rounded-full bg-aqua shadow-[0_0_8px] shadow-aqua"></div>
            New: depth-aware coverflow engine
          </div>
          <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl">
            <TypewriterText text="Carousels that" className="block" />
            <span className="gradient-text"><TypewriterText text="turn heads" /></span>, not stomachs.
          </h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1, duration: 1 }} className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-400 sm:text-lg">
            Experience our premium devices in true CSS 3D perspective. Swipe or use arrow keys to navigate the gallery.
          </motion.p>
        </div>

        <div className="relative mx-auto max-w-5xl px-4 pb-6 sm:px-6">
          <div className="pointer-events-none absolute inset-x-0 bottom-16 mx-auto h-24 max-w-2xl rounded-[100%] bg-aqua/10 blur-3xl"></div>
          
          <div className="coverflow" id="coverflow">
            {storeModels.map((p, i) => (
              <div 
                key={p.id} 
                className={`cf-card ${getCoverflowClass(i)}`} 
                style={{ background: p.bgGradient }} 
                onClick={() => setActiveIndex(i)}
              >
                <div className="absolute inset-0" style={{ background: 'radial-gradient(120% 80% at 30% 20%, rgba(255,255,255,0.18), transparent 60%)' }}></div>
                <div className="absolute inset-0 flex items-center justify-center drop-shadow-[0_30px_30px_rgba(0,0,0,0.6)]">
                  {p.image ? <img src={p.image} alt={p.name} className="w-48 h-48 object-contain" /> : <span className="text-8xl">{p.emoji}</span>}
                </div>
                <div className="absolute left-0 right-0 bottom-0 p-4 pb-4" style={{ background: 'linear-gradient(to top, rgba(7,10,14,0.92), rgba(7,10,14,0.45) 55%, transparent)' }}>
                  <div className="text-[11px] uppercase tracking-widest text-white/70 font-semibold">{p.brand}</div>
                  <div className="text-[17px] font-display text-white mt-1">{p.name}</div>
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-aqua font-bold">₹{p.price.toLocaleString('en-IN')}</span>
                    <button onClick={(e) => { e.stopPropagation(); addToCart(p); }} className="px-4 py-1.5 bg-white/10 rounded-full text-white text-xs font-bold hover:bg-aqua hover:text-ink transition-colors border border-white/20">Add</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-7 flex items-center justify-center gap-6">
            <button onClick={() => setActiveIndex(Math.max(0, activeIndex - 1))} className="nav-btn glass text-slate-200">
              <span className="iconify text-xl" data-icon="ph:caret-left-bold"></span>
            </button>
            <div className="flex items-center gap-2.5">
              {storeModels.map((_, i) => (
                <div key={i} onClick={() => setActiveIndex(i)} className={`dot ${i === activeIndex ? 'active' : ''}`} />
              ))}
            </div>
            <button onClick={() => setActiveIndex(Math.min(storeModels.length - 1, activeIndex + 1))} className="nav-btn glass text-slate-200">
              <span className="iconify text-xl" data-icon="ph:caret-right-bold"></span>
            </button>
          </div>
        </div>

        <div className="relative mx-auto mt-4 max-w-6xl px-6 pb-16 text-center">
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <motion.button whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(45, 212, 191, 0.5)" }} whileTap={{ scale: 0.95 }} onClick={() => handleNavClick('shop')} className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-aqua to-magenta px-7 py-3.5 text-sm font-semibold text-ink shadow-xl shadow-aqua/20">
              Build your cart
              <span className="iconify transition-transform group-hover:translate-x-1" data-icon="ph:arrow-right-bold"></span>
            </motion.button>
            <motion.button whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.15)" }} whileTap={{ scale: 0.95 }} onClick={() => handleNavClick('repair')} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur">
              <span className="iconify text-lg" data-icon="ph:wrench"></span> Book a Repair
            </motion.button>
          </div>
          <div className="mt-5 text-xs text-slate-400">Trusted by 12,000+ customers · No credit card required</div>
        </div>
      </header>

      <motion.section initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6 }} id="popular-brands" className="relative w-full py-24">
        <div className="aurora-mid" style={{ top: '10%', opacity: 0.4 }}></div>
        <div className="mx-auto max-w-5xl text-center px-6 relative z-10">
          <div className="text-sm font-semibold uppercase tracking-[0.2em] text-aqua">New Box Pieces</div>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">Shop Top Brands</h2>
          <p className="mt-4 text-slate-400 max-w-2xl mx-auto mb-6">Explore our extensive collection of brand new, sealed devices from the world's leading smartphone manufacturers.</p>
          <div className="max-w-md mx-auto relative mb-14">
            <input 
              type="text" 
              placeholder="Search for a brand..." 
              value={brandSearchQuery}
              onChange={(e) => setBrandSearchQuery(e.target.value)}
              className="w-full bg-ink2/50 border border-white/10 rounded-full pl-12 pr-4 py-3 text-white focus:border-aqua outline-none transition shadow-inner" 
            />
            <span className="iconify text-xl text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" data-icon="ph:magnifying-glass"></span>
          </div>
        </div>
        <div className="mx-auto max-w-6xl px-6 mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
          {[
            { icon: 'ph:apple-logo-fill', name: 'Apple' },
            { icon: 'simple-icons:samsung', name: 'Samsung' },
            { icon: 'mdi:google', name: 'Google' },
            { icon: 'simple-icons:oneplus', name: 'OnePlus' },
            { icon: 'simple-icons:xiaomi', name: 'Xiaomi' },
            { icon: 'simple-icons:vivo', name: 'Vivo' },
            { icon: 'simple-icons:oppo', name: 'Oppo' },
            { icon: 'ph:dots-nine-bold', name: 'Nothing' },
            { icon: 'ph:device-mobile-camera', name: 'Realme' },
            { icon: 'ph:device-mobile', name: 'Infinix' },
            { icon: 'ph:device-mobile-speaker', name: 'Tecno' },
            { icon: 'ph:lightning', name: 'iQOO' },
            { icon: 'simple-icons:motorola', name: 'Motorola' },
            { icon: 'simple-icons:nokia', name: 'Nokia' },
            { icon: 'ph:device-mobile-camera', name: 'Karbonn' },
            { icon: 'ph:wifi-high-bold', name: 'Jio' },
            { icon: 'ph:fire-bold', name: 'Lava' },
            { icon: 'ph:device-mobile', name: 'Itel' }
          ].filter(brand => brand.name.toLowerCase().includes(brandSearchQuery.toLowerCase())).map((brand, i) => (
            <div key={i} className="glass rounded-2xl p-6 flex flex-col items-center justify-center gap-3 hover:border-aqua/50 transition-colors group cursor-pointer" onClick={() => { setSelectedBrand(brand.name); handleNavClick('brand-models'); window.scrollTo(0, 0); }}>
              <span className="iconify text-4xl text-slate-400 group-hover:text-aqua transition-colors" data-icon={brand.icon}></span>
              <span className="text-sm font-semibold text-white tracking-wide">{brand.name}</span>
            </div>
          ))}
        </div>
        
        {brandSearchQuery && storeModels.filter(m => m.name.toLowerCase().includes(brandSearchQuery.toLowerCase()) || m.brand.toLowerCase().includes(brandSearchQuery.toLowerCase())).length > 0 && (
          <div className="mx-auto max-w-6xl px-6 mt-14">
            <h3 className="text-white font-semibold mb-4 text-left uppercase tracking-widest text-sm text-slate-400">Matching Models</h3>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {storeModels.filter(m => m.name.toLowerCase().includes(brandSearchQuery.toLowerCase()) || m.brand.toLowerCase().includes(brandSearchQuery.toLowerCase())).map(m => (
                <div key={m.id} className="group glass rounded-2xl overflow-hidden flex flex-col hover:border-aqua/30 transition-colors">
                  <div className="h-40 flex items-center justify-center text-6xl relative" style={{ background: m.bgGradient || 'linear-gradient(150deg, #2dd4bf 0%, #22a89a 45%, #0c3b45 78%)' }}>
                    <div className="absolute inset-0" style={{ background: 'radial-gradient(120% 80% at 30% 20%, rgba(255,255,255,0.18), transparent 60%)' }}></div>
                    <span className="drop-shadow-2xl z-10 flex items-center justify-center h-full w-full">
                      {m.image ? <img src={m.image} alt={m.name} className="h-32 w-32 object-contain" /> : m.emoji || '📱'}
                    </span>
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="text-[11px] uppercase tracking-widest text-slate-500 font-semibold mb-1">{m.brand} &bull; {m.category || 'Device'}</div>
                    <h3 className="font-display text-xl font-bold text-white flex-grow">{m.name}</h3>
                    <div className="mt-2 text-aqua font-semibold">₹{Number(m.price).toLocaleString()}</div>
                    <button 
                      onClick={() => addToCart({ id: m.id, name: m.name, brand: m.brand, price: m.price, emoji: m.emoji || '📱', bgGradient: m.bgGradient || 'linear-gradient(150deg, #2dd4bf 0%, #22a89a 45%, #0c3b45 78%)' })} 
                      className="mt-6 w-full rounded-full bg-white/5 border border-white/10 px-4 py-2.5 text-sm font-bold text-white hover:bg-aqua hover:text-ink transition-colors"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Dedicated HP Laptops Section */}
        <div className="mx-auto max-w-6xl px-6 mt-8">
          <div 
            onClick={() => { setSelectedBrand('HP'); handleNavClick('brand-models'); window.scrollTo(0, 0); }}
            className="group relative overflow-hidden rounded-3xl p-1 cursor-pointer transition-transform hover:-translate-y-1"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-aqua/30 to-magenta/30 group-hover:from-aqua/50 group-hover:to-magenta/50 transition-opacity blur-lg"></div>
            <div className="relative flex flex-col md:flex-row items-center justify-between bg-ink2/80 backdrop-blur-xl rounded-[22px] p-8 md:p-12 border border-white/10 group-hover:border-white/20 transition-colors">
              <div className="flex items-center gap-6 mb-6 md:mb-0">
                <div className="bg-white/10 p-5 rounded-2xl backdrop-blur-md border border-white/5 shadow-inner">
                  <span className="iconify text-6xl text-white" data-icon="simple-icons:hp"></span>
                </div>
                <div>
                  <h3 className="font-display text-3xl font-bold text-white mb-2 tracking-tight">HP Laptops Showcase</h3>
                  <p className="text-slate-300 max-w-lg leading-relaxed">Discover our premium selection of high-performance HP laptops, perfect for gaming, creation, and productivity.</p>
                </div>
              </div>
              <button className="flex items-center gap-2 rounded-full bg-white text-ink px-8 py-3.5 font-bold hover:bg-gradient-to-r hover:from-aqua hover:to-magenta hover:text-white transition-all shadow-xl hover:shadow-aqua/20 whitespace-nowrap">
                Shop HP Models <span className="iconify" data-icon="ph:arrow-right-bold"></span>
              </button>
            </div>
          </div>
        </div>

        {/* PC Accessories */}
        <div className="mx-auto max-w-6xl px-6 mt-8 relative z-10">
          <div className="flex flex-wrap justify-center gap-3 md:gap-4">
            {[
              { name: 'Keyboards', icon: 'ph:keyboard-bold' },
              { name: 'Mouses', icon: 'ph:mouse-bold' },
              { name: 'Speakers', icon: 'ph:speaker-hifi-bold' },
              { name: 'Laptop Bags', icon: 'ph:briefcase-bold' },
              { name: 'Adapters & Hubs', icon: 'ph:plug-bold' }
            ].map((acc, i) => (
              <div key={i} className="flex items-center gap-2.5 px-5 py-3 rounded-full bg-white/5 border border-white/10 hover:border-aqua/50 hover:bg-aqua/10 transition-all cursor-pointer group shadow-sm backdrop-blur-md">
                <span className="iconify text-lg text-slate-400 group-hover:text-aqua transition-colors" data-icon={acc.icon}></span>
                <span className="text-xs font-semibold text-slate-200 group-hover:text-white tracking-wide">{acc.name}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6 }} id="tabs-accessories" className="relative w-full py-12">
        <div className="mx-auto max-w-5xl text-center px-6 relative z-10">
          <div className="text-sm font-semibold uppercase tracking-[0.2em] text-magenta">Premium Gear</div>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">Tabs and Accessories</h2>
          <p className="mt-4 text-slate-400 max-w-2xl mx-auto mb-10">Enhance your digital life with our selection of top-tier tablets, audio gear, and essential accessories.</p>
        </div>
        <div className="mx-auto max-w-3xl px-6 grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[
            { icon: 'ph:apple-logo-fill', name: 'Apple' },
            { icon: 'simple-icons:xiaomi', name: 'Redmi' },
            { icon: 'simple-icons:samsung', name: 'Samsung' }
          ].map((brand, i) => (
            <div key={i} className="glass rounded-2xl p-6 flex flex-col items-center justify-center gap-3 hover:border-magenta/50 transition-colors group cursor-pointer" onClick={() => { setSelectedBrand(brand.name); handleNavClick('brand-models'); window.scrollTo(0, 0); }}>
              <span className="iconify text-4xl text-slate-400 group-hover:text-magenta transition-colors" data-icon={brand.icon}></span>
              <span className="text-sm font-semibold text-white tracking-wide">{brand.name === 'Apple' ? 'Apple (iPhone/iPad)' : brand.name}</span>
            </div>
          ))}
        </div>

        <div className="mx-auto max-w-5xl px-6 mt-16 relative z-10">
          <h3 className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 mb-6">Shop by Category</h3>
          <div className="flex flex-wrap justify-center gap-3 md:gap-4">
            {[
              { name: 'Chargers & Adapters', icon: 'ph:plug-charging-bold' },
              { name: 'Data Cables', icon: 'ph:usb-bold' },
              { name: 'Power Banks', icon: 'ph:battery-charging-vertical-bold' },
              { name: 'Audio & Earbuds', icon: 'ph:headphones-bold' },
              { name: 'Cases & Covers', icon: 'ph:device-mobile-bold' },
              { name: 'Screen Protectors', icon: 'ph:shield-check-bold' },
              { name: 'Smartwatches', icon: 'ph:watch-bold' },
              { name: 'Car Mounts', icon: 'ph:car-profile-bold' }
            ].map((acc, i) => (
              <div key={i} className="flex items-center gap-2.5 px-5 py-3 rounded-full bg-white/5 border border-white/10 hover:border-aqua/50 hover:bg-aqua/10 transition-all cursor-pointer group shadow-sm backdrop-blur-md">
                <span className="iconify text-lg text-slate-400 group-hover:text-aqua transition-colors" data-icon={acc.icon}></span>
                <span className="text-xs font-semibold text-slate-200 group-hover:text-white tracking-wide">{acc.name}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.section>
      <motion.section initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6 }} id="cameras-accessories" className="relative w-full py-12">
        <div className="mx-auto max-w-5xl text-center px-6 relative z-10">
          <div className="text-sm font-semibold uppercase tracking-[0.2em] text-aqua">Capture the Moment</div>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">Cameras & Photography</h2>
          <p className="mt-4 text-slate-400 max-w-2xl mx-auto mb-10">Discover premium cameras, lenses, and essential photography gear for professionals and enthusiasts alike.</p>
        </div>
        
        <div className="mx-auto max-w-4xl px-6 grid grid-cols-1 sm:grid-cols-4 gap-5">
          {[
            { icon: 'ph:camera-fill', name: 'DSLR Cameras' },
            { icon: 'mdi:camera-iris', name: 'Mirrorless' },
            { icon: 'ph:aperture-fill', name: 'Lenses' },
            { icon: 'mdi:camera-gopro', name: 'Action Cameras' }
          ].map((item, i) => (
            <div key={i} className="glass rounded-2xl p-6 flex flex-col items-center justify-center gap-3 hover:border-aqua/50 transition-colors group cursor-pointer" onClick={() => { handleNavClick('shop'); window.scrollTo(0, 0); }}>
              <span className="iconify text-4xl text-slate-400 group-hover:text-aqua transition-colors" data-icon={item.icon}></span>
              <span className="text-sm font-semibold text-white tracking-wide text-center">{item.name}</span>
            </div>
          ))}
        </div>

        <div className="mx-auto max-w-5xl px-6 mt-12 relative z-10">
          <h3 className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 mb-6">Camera Accessories</h3>
          <div className="flex flex-wrap justify-center gap-3 md:gap-4">
            {[
              { name: 'Tripods & Stands', icon: 'mdi:tripod' },
              { name: 'Gimbals', icon: 'mdi:video-stabilization' },
              { name: 'Memory Cards', icon: 'mdi:sd' },
              { name: 'Camera Bags', icon: 'mdi:bag-personal' },
              { name: 'Flashes & Lighting', icon: 'mdi:flash' },
              { name: 'Extra Batteries', icon: 'mdi:battery-plus' }
            ].map((acc, i) => (
              <div key={i} className="flex items-center gap-2.5 px-5 py-3 rounded-full bg-white/5 border border-white/10 hover:border-aqua/50 hover:bg-aqua/10 transition-all cursor-pointer group shadow-sm backdrop-blur-md">
                <span className="iconify text-lg text-slate-400 group-hover:text-aqua transition-colors" data-icon={acc.icon}></span>
                <span className="text-xs font-semibold text-slate-200 group-hover:text-white tracking-wide">{acc.name}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.6 }} id="popular-services" className="relative w-full py-24 bg-ink2/30 border-t border-white/5 border-b">
        <div className="mx-auto max-w-5xl text-center px-6 relative z-10">
          <div className="text-sm font-semibold uppercase tracking-[0.2em] text-aqua">Expert Technicians</div>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">Popular Repaired Services</h2>
          <p className="mt-4 text-slate-400 max-w-2xl mx-auto mb-6">From shattered screens to battery issues, we fix it all with genuine parts and lightning-fast turnaround times.</p>
          <div className="max-w-md mx-auto relative mb-14">
            <input 
              type="text" 
              placeholder="Search for a service..." 
              value={serviceSearchQuery}
              onChange={(e) => setServiceSearchQuery(e.target.value)}
              className="w-full bg-ink2/50 border border-white/10 rounded-full pl-12 pr-4 py-3 text-white focus:border-aqua outline-none transition shadow-inner" 
            />
            <span className="iconify text-xl text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" data-icon="ph:magnifying-glass"></span>
          </div>
        </div>
        
        <div className="mx-auto max-w-7xl px-6 mt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {mockServices.filter(s => s.name.toLowerCase().includes(serviceSearchQuery.toLowerCase())).map((service, idx) => (
              <div 
                key={service.id}
                onClick={() => {
                  setRepairStep(1);
                  handleNavClick('repair');
                  window.scrollTo(0, 0);
                }}
                className="glass rounded-2xl p-5 flex flex-col items-center text-center gap-3 hover:border-aqua/40 hover:bg-white/10 transition-all cursor-pointer group"
              >
                <div className="h-20 w-20 flex items-center justify-center p-1 rounded-full group-hover:scale-110 transition-transform">
                  <img src={service.img} alt={service.name} className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(255,255,255,0.1)] group-hover:drop-shadow-[0_0_12px_rgba(45,212,191,0.5)] transition-all" />
                </div>
                <h4 className="text-xs font-semibold text-slate-200 group-hover:text-white transition-colors leading-tight">{service.name}</h4>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <button onClick={() => { setRepairStep(1); handleNavClick('repair'); window.scrollTo(0, 0); }} className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-aqua to-magenta px-8 py-3.5 text-sm font-bold text-ink shadow-lg shadow-aqua/20 hover:shadow-aqua/40 transition-shadow">
              Book a Repair Now <span className="iconify" data-icon="ph:arrow-right-bold"></span>
            </button>
          </div>
        </div>
      </motion.section>

      <motion.section initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.6 }} id="visit-store" className="relative w-full py-24">
        <div className="grid-tex" style={{ opacity: 0.3 }}></div>
        <div className="mx-auto max-w-6xl px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="text-sm font-semibold uppercase tracking-[0.2em] text-magenta mb-3">Experience Premium</div>
              <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl mb-6">Visit our Flagship Store</h2>
              <p className="text-slate-400 mb-10 text-lg">Step into the future of mobile retail and repair. Located in the heart of Bangalore, our futuristic, glass-fronted hub is designed to offer a seamless, high-tech experience.</p>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-slate-300">
                  <span className="iconify text-aqua text-xl" data-icon="ph:coffee"></span>
                  <span>Premium waiting lounge with free coffee</span>
                </div>
                <div className="flex items-center gap-3 text-slate-300">
                  <span className="iconify text-aqua text-xl" data-icon="ph:clock"></span>
                  <span>Average repair time: 45 minutes</span>
                </div>
                <div className="flex items-center gap-3 text-slate-300">
                  <span className="iconify text-aqua text-xl" data-icon="ph:shield-check"></span>
                  <span>100% transparent open-repair lab</span>
                </div>
              </div>
            </div>
            <section className="relative w-full py-32 mt-12 mb-24 overflow-hidden">
        <div className="absolute inset-0 bg-ink">
          <div className="absolute inset-0 bg-gradient-to-r from-aqua/5 via-ink to-magenta/5"></div>
          {storeImages.map((src, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0 }}
              animate={{ opacity: activeStoreImage === src ? 0.3 : 0 }}
              transition={{ duration: 1 }}
              className="absolute inset-0"
            >
              <img src={src} alt="Background" className="w-full h-full object-cover mix-blend-overlay filter blur-sm scale-105" />
            </motion.div>
          ))}
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink"></div>
        </div>
        
        <div className="mx-auto max-w-6xl px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold tracking-tight text-white mb-4">Visit our <span className="text-transparent bg-clip-text bg-gradient-to-r from-aqua to-magenta">Flagship Store</span></h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Experience our state-of-the-art repair lab and explore the latest tech in person. We've built a space where technology meets craftsmanship.</p>
          </div>
          
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8">
              <div className="relative aspect-video rounded-3xl overflow-hidden border border-white/10 shadow-2xl group">
                <AnimatePresence mode="wait">
                  <motion.img 
                    key={activeStoreImage}
                    src={activeStoreImage}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full h-full object-cover"
                  />
                </AnimatePresence>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute bottom-6 left-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-aqua/20 flex items-center justify-center backdrop-blur-md border border-aqua/30">
                    <span className="iconify text-aqua text-xl" data-icon="ph:storefront-fill"></span>
                  </div>
                  <div>
                    <div className="text-white font-bold text-lg leading-tight">7 Star Mobiles HQ</div>
                    <div className="text-aqua text-sm font-medium">Main Showroom</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:col-span-4 flex flex-row lg:flex-col gap-4 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 hide-scrollbar">
              {storeImages.map((src, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveStoreImage(src)}
                  className={`relative rounded-2xl overflow-hidden border-2 transition-all duration-300 flex-shrink-0 w-32 lg:w-full aspect-video ${
                    activeStoreImage === src 
                      ? 'border-aqua shadow-[0_0_20px_rgba(45,212,191,0.3)] scale-105 z-10' 
                      : 'border-white/5 hover:border-white/20 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={src} className="w-full h-full object-cover" alt={`Thumbnail ${idx}`} />
                  {activeStoreImage === src && (
                    <div className="absolute inset-0 bg-aqua/10 backdrop-blur-[2px]"></div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
          </div>
        </div>
      </motion.section>

      <motion.section initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.6 }} id="testimonials" className="relative w-full py-24 bg-ink2/30 border-t border-white/5">
        <div className="mx-auto max-w-7xl px-6 relative z-10">
          <div className="text-center mb-16">
            <div className="text-sm font-semibold uppercase tracking-[0.2em] text-magenta mb-3">Testimonials</div>
            <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">Our Clients Say!!!</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {mockTestimonials.map(t => (
              <div key={t.id} className="glass rounded-2xl p-6 flex flex-col items-center text-center hover:border-aqua/30 transition-colors group">
                <div className="w-20 h-20 rounded-full overflow-hidden mb-4 border-2 border-aqua/50 group-hover:border-aqua transition-colors p-1">
                  <img src={t.img} alt={t.name} className="w-full h-full rounded-full object-cover" />
                </div>
                <div className="flex text-aqua mb-3 gap-1">
                  {[...Array(t.rating)].map((_, i) => <span key={i} className="iconify" data-icon="ph:star-fill"></span>)}
                </div>
                <p className="text-slate-300 italic mb-4 text-sm flex-grow">"{t.text}"</p>
                <div className="text-sm font-bold text-white uppercase tracking-wider">{t.name}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.6 }} id="login-section" className="relative w-full py-24 bg-black/40 border-t border-white/5">
        <div className="aurora-mid" style={{ top: '50%', opacity: 0.15 }}></div>
        <div className="mx-auto max-w-md px-6 relative z-10 text-center">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-aqua to-magenta mx-auto mb-6 shadow-[0_0_20px_rgba(45,212,191,0.3)]">
            <span className="iconify text-ink text-[24px]" data-icon="ph:lock-key-fill"></span>
          </div>
          <h2 className="font-display text-3xl font-bold tracking-tight text-white mb-2">Customer Portal</h2>
          <p className="text-slate-400 mb-8">Login to book repairs, track tickets, and more.</p>
          
          {isLoggedIn ? (
            <div className="glass rounded-2xl p-8">
              <span className="iconify text-5xl text-aqua mb-4" data-icon="ph:check-circle-fill"></span>
              <h3 className="text-xl font-bold text-white mb-2">You are securely logged in</h3>
              <p className="text-sm text-slate-400 mb-6">Welcome back to 7 Star Mobiles.</p>
              <button onClick={() => handleNavClick('repair')} className="w-full rounded-full bg-gradient-to-r from-aqua to-magenta px-7 py-3 text-sm font-bold text-ink hover:shadow-[0_0_15px_rgba(45,212,191,0.4)] transition">
                Book a Repair Now
              </button>
            </div>
          ) : (
            <div className="glass rounded-2xl p-8 text-left space-y-5">
              <form className="space-y-5" onSubmit={isResettingPassword ? handlePasswordReset : (e) => handleAuth(e, 'signin')}>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Email Address</label>
                  <input required type="email" value={authData.email} onChange={(e) => setAuthData({...authData, email: e.target.value})} className="w-full bg-ink2/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-aqua outline-none transition" placeholder="hello@example.com" />
                </div>
                
                {!isResettingPassword && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Phone Number</label>
                      <input required type="tel" value={authData.phone} onChange={(e) => setAuthData({...authData, phone: e.target.value})} className="w-full bg-ink2/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-aqua outline-none transition" placeholder="+91 98765 43210" />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest">Password</label>
                        <button type="button" onClick={() => { setIsResettingPassword(true); setAuthError(''); setAuthMessage(''); }} className="text-xs text-aqua hover:text-white transition-colors">
                          Forgot Password?
                        </button>
                      </div>
                      <input required type="password" value={authData.password} onChange={(e) => setAuthData({...authData, password: e.target.value})} className="w-full bg-ink2/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-aqua outline-none transition" placeholder="••••••••" />
                    </div>
                  </>
                )}
                
                {authError && (
                  <p className="text-sm text-center font-medium text-red-400 bg-red-400/10 border border-red-400/20 p-3 rounded-lg">
                    {authError}
                  </p>
                )}
                {authMessage && (
                  <p className="text-sm text-center font-medium text-aqua bg-aqua/10 border border-aqua/20 p-3 rounded-lg">
                    {authMessage}
                  </p>
                )}
                
                <div className="pt-2">
                  {isResettingPassword ? (
                    <div className="space-y-3">
                      <button type="submit" disabled={authLoading} className="w-full rounded-full bg-white px-5 py-3.5 text-sm font-bold text-ink hover:bg-aqua transition-colors disabled:opacity-50">
                        {authLoading ? '...' : 'Send Reset Link'}
                      </button>
                      <button type="button" onClick={() => { setIsResettingPassword(false); setAuthError(''); setAuthMessage(''); }} className="w-full text-xs text-slate-400 hover:text-white transition-colors">
                        Back to Login
                      </button>
                    </div>
                  ) : (
                    <button type="submit" disabled={authLoading} className="w-full rounded-full bg-white px-5 py-3.5 text-sm font-bold text-ink hover:bg-aqua transition-colors disabled:opacity-50">
                      {authLoading ? '...' : 'Sign In securely'}
                    </button>
                  )}
                </div>
              </form>

              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-white/10"></div>
                <span className="flex-shrink-0 mx-4 text-slate-500 text-xs font-semibold uppercase tracking-widest">or</span>
                <div className="flex-grow border-t border-white/10"></div>
              </div>

              <div className="flex justify-center w-full">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="flex w-full items-center justify-center gap-3 rounded-full bg-white px-5 py-3 text-sm font-bold text-ink hover:bg-slate-200 transition-colors"
                >
                  <span className="iconify text-xl text-red-500" data-icon="mdi:google"></span>
                  Continue with Google
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.section>
    </>
  );

  const renderShop = () => (
    <section className="relative w-full py-24 min-h-screen">
      <div className="aurora" style={{ opacity: 0.2 }}></div>
      <div className="mx-auto max-w-6xl px-6 relative z-10">
        <div className="text-sm font-semibold uppercase tracking-[0.2em] text-magenta mb-3">Complete Collection</div>
        <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl mb-12">Browse all devices</h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {storeModels.map(p => (
            <div key={p.id} className="group glass overflow-hidden rounded-2xl hover:-translate-y-1 transition-transform hover:border-aqua/30 flex flex-col">
              <div className="h-48 flex items-center justify-center text-7xl relative" style={{ background: p.bgGradient }}>
                <div className="absolute inset-0" style={{ background: 'radial-gradient(120% 80% at 30% 20%, rgba(255,255,255,0.18), transparent 60%)' }}></div>
                <span className="drop-shadow-2xl z-10">{p.emoji}</span>
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <span className="text-[11px] uppercase tracking-widest text-slate-400 font-semibold mb-1">{p.brand}</span>
                <h3 className="font-display text-lg font-semibold text-white flex-grow">{p.name}</h3>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-xl font-bold text-aqua">₹{p.price.toLocaleString()}</span>
                  <button onClick={() => addToCart(p)} className="px-4 py-2 bg-white/5 rounded-full text-white text-sm font-bold border border-white/10 hover:bg-aqua hover:text-ink transition-colors">Add to Cart</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  const renderCart = () => {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.18;
    const total = subtotal + tax;

    return (
      <section className="relative w-full py-24 min-h-screen">
        <div className="aurora-mid" style={{ top: '20%', opacity: 0.3 }}></div>
        <div className="mx-auto max-w-6xl px-6 relative z-10">
          <div className="text-sm font-semibold uppercase tracking-[0.2em] text-aqua mb-3">Secure Checkout</div>
          <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl mb-12">Your Cart</h2>
          
          {cart.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center">
              <span className="iconify text-6xl text-slate-600 mx-auto mb-4" data-icon="ph:shopping-cart-bold"></span>
              <h3 className="font-display text-2xl text-white font-bold mb-2">Cart is empty</h3>
              <p className="text-slate-400 mb-6">You haven't added any premium devices yet.</p>
              <button onClick={() => handleNavClick('shop')} className="rounded-full bg-gradient-to-r from-aqua to-magenta px-7 py-3 text-sm font-semibold text-ink shadow-lg shadow-aqua/20">Explore Shop</button>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {cart.map(item => (
                  <div key={item.id} className="glass rounded-2xl p-5 flex items-center gap-6">
                    <div className="h-20 w-20 rounded-xl flex items-center justify-center text-4xl shadow-inner border border-white/10" style={{ background: item.bgGradient }}>
                      {item.emoji}
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-display text-lg font-semibold text-white">{item.name}</h4>
                      <p className="text-sm text-slate-400">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-aqua mb-2">₹{(item.price * item.quantity).toLocaleString()}</div>
                      <button onClick={() => removeFromCart(item.id)} className="text-slate-500 hover:text-red-400 transition-colors">
                        <span className="iconify text-xl" data-icon="ph:trash-bold"></span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="glass rounded-2xl p-6 h-fit sticky top-28">
                <h3 className="font-display text-xl font-bold text-white mb-6">Summary</h3>
                <div className="space-y-4 mb-6 text-sm text-slate-300">
                  <div className="flex justify-between"><span>Subtotal</span><span className="text-white">₹{subtotal.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span>Tax (18%)</span><span className="text-white">₹{tax.toLocaleString({maximumFractionDigits:0})}</span></div>
                  <div className="border-t border-white/10 pt-4 flex justify-between text-lg font-bold">
                    <span>Total</span><span className="text-aqua">₹{total.toLocaleString({maximumFractionDigits:0})}</span>
                  </div>
                </div>
                <button onClick={async () => {
                  if (!isLoggedIn) {
                    setNotification({ type: 'error', title: 'Authentication Required', message: 'Please log in to place an order.' });
                    setTimeout(() => setNotification(null), 3500);
                    handleNavClick('login');
                    return;
                  }
                  try {
                    const payload = {
                      user_id: session.user.id,
                      total_amount: total,
                      status: 'Pending',
                      items: cart.map(item => ({
                        product_name: item.name,
                        price: item.price,
                        quantity: item.quantity
                      }))
                    };
                    const { error } = await supabase.from('orders').insert([payload]);
                    if (!error) {
                      setCart([]);
                      setNotification({ type: 'success', title: 'Order Confirmed!', message: 'Your items will be shipped soon.' });
                      handleNavClick('home');
                      setTimeout(() => setNotification(null), 3500);
                    } else {
                      console.error(error);
                      setNotification({ type: 'error', title: 'Failed to place order', message: error.message });
                      setTimeout(() => setNotification(null), 3500);
                    }
                  } catch (err) {
                    console.error(err);
                    setNotification({ type: 'error', title: 'Error', message: 'An error occurred during checkout.' });
                    setTimeout(() => setNotification(null), 3500);
                  }
                }} className="w-full rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-ink hover:bg-aqua transition-colors">
                  Confirm Checkout
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    );
  };

  const renderRepair = () => {
    const handleServiceToggle = (serviceName) => {
      setRepairData(prev => {
        const selected = prev.services;
        if (selected.includes(serviceName)) return { ...prev, services: selected.filter(s => s !== serviceName) };
        return { ...prev, services: [...selected, serviceName] };
      });
    };

    const handleConfirmRepair = async () => {
      const ticket_id = 'TKT-' + Math.floor(Math.random() * 10000);
      const payload = {
        user_id: session?.user?.id,
        ticket_id,
        customer_name: repairData.name,
        device: `${repairData.brand} ${repairData.model}`,
        issue: repairData.services.join(', ') + (repairData.phone ? ` (Contact: ${repairData.phone})` : ''),
        status: 'Pending'
      };
      
      try {
        const { error } = await supabase.from('tickets').insert([payload]);
        if (error) throw error;
        
        setNotification({ type: 'success', title: 'Repair Booked!', message: `Your ticket ID is ${ticket_id}. Our team will contact you shortly.` });
        setRepairStep(1);
        setCurrentView('home');
        setTimeout(() => setNotification(null), 4000);
      } catch(err) {
        console.error("Error booking repair", err);
        setNotification({ type: 'error', title: 'Booking Failed', message: err.message || "Please try again later." });
        setTimeout(() => setNotification(null), 4000);
      }
    };

    return (
      <section className="relative w-full py-24 min-h-screen">
        <div className="grid-tex" style={{ opacity: 0.5 }}></div>
        <div className="mx-auto max-w-4xl px-6 relative z-10">
          <div className="text-sm font-semibold uppercase tracking-[0.2em] text-magenta text-center mb-3">Service Center</div>
          <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl text-center mb-10">Book a Repair</h2>
          
          <div className="glass rounded-2xl p-8">
            {/* Stepper */}
            <div className="flex items-center justify-between mb-10 border-b border-white/10 pb-6">
              {[
                { s: 1, title: 'Brand' },
                { s: 2, title: 'Model' },
                { s: 3, title: 'Services' },
                { s: 4, title: 'Details' }
              ].map((step, idx) => (
                <div key={idx} className="flex flex-col items-center gap-2">
                  <div className={`grid h-8 w-8 place-items-center rounded-full text-sm font-bold transition-colors ${repairStep >= step.s ? 'bg-aqua text-ink' : 'bg-white/5 text-slate-500'}`}>
                    {step.s}
                  </div>
                  <span className={`text-xs font-semibold uppercase tracking-widest hidden sm:block ${repairStep >= step.s ? 'text-white' : 'text-slate-500'}`}>{step.title}</span>
                </div>
              ))}
            </div>

            {/* Step 1: Brands */}
            {repairStep === 1 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <h3 className="font-display text-xl text-white">Select your brand</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
                  {dynamicBrands.map(brand => (
                    <button 
                      key={brand} 
                      onClick={() => { setRepairData({...repairData, brand}); setRepairStep(2); }}
                      className={`p-4 rounded-xl border transition-all flex flex-col items-center justify-center gap-2 hover:bg-white/10 hover:border-aqua/50 ${repairData.brand === brand ? 'border-aqua bg-white/10' : 'border-white/5 bg-white/5'}`}
                    >
                      <span className="font-medium text-white text-sm">{brand}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 2: Model */}
            {repairStep === 2 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <h3 className="font-display text-xl text-white">What is your {repairData.brand} model?</h3>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Device Model</label>
                  <input 
                    type="text" 
                    value={repairData.model}
                    onChange={(e) => setRepairData({...repairData, model: e.target.value})}
                    placeholder="e.g. iPhone 14 Pro Max"
                    className="w-full bg-ink2/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-aqua outline-none transition" 
                  />
                </div>
                <div className="flex justify-between pt-4">
                  <button onClick={() => setRepairStep(1)} className="px-6 py-2.5 rounded-full text-slate-300 font-semibold text-sm hover:text-white transition">Back</button>
                  <button 
                    disabled={!repairData.model}
                    onClick={() => setRepairStep(3)} 
                    className="px-6 py-2.5 rounded-full bg-aqua text-ink font-semibold text-sm disabled:opacity-50 transition"
                  >
                    Next Step
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Services */}
            {repairStep === 3 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <h3 className="font-display text-xl text-white">Select required services</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {mockServices.map(service => {
                    const isSelected = repairData.services.includes(service.name);
                    return (
                      <button 
                        key={service.id} 
                        onClick={() => handleServiceToggle(service.name)}
                        className={`p-4 rounded-xl border transition-all flex flex-col items-center justify-center gap-3 text-center hover:bg-white/10 ${isSelected ? 'border-magenta bg-magenta/10 shadow-[0_0_15px_rgba(232,121,249,0.2)]' : 'border-white/5 bg-white/5'}`}
                      >
                        <img src={service.img} alt={service.name} className={`h-16 w-16 object-contain transition-all ${isSelected ? 'drop-shadow-[0_0_12px_rgba(232,121,249,0.8)] scale-110' : 'opacity-60 drop-shadow-[0_0_5px_rgba(255,255,255,0.1)]'}`} />
                        <span className={`text-xs font-medium ${isSelected ? 'text-white' : 'text-slate-300'}`}>{service.name}</span>
                      </button>
                    )
                  })}
                </div>
                <div className="flex justify-between pt-4">
                  <button onClick={() => setRepairStep(2)} className="px-6 py-2.5 rounded-full text-slate-300 font-semibold text-sm hover:text-white transition">Back</button>
                  <button 
                    disabled={repairData.services.length === 0}
                    onClick={() => setRepairStep(4)} 
                    className="px-6 py-2.5 rounded-full bg-aqua text-ink font-semibold text-sm disabled:opacity-50 transition"
                  >
                    Next Step
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 4: Submit */}
            {repairStep === 4 && (
              <motion.form initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} onSubmit={(e) => { e.preventDefault(); handleConfirmRepair(); }} className="space-y-6">
                <h3 className="font-display text-xl text-white">Final Details</h3>
                
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-6 text-sm text-slate-300">
                  <div className="flex justify-between mb-2"><span className="text-slate-500">Device:</span> <span className="font-bold text-white">{repairData.brand} {repairData.model}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Services:</span> <span className="font-bold text-aqua text-right">{repairData.services.join(', ')}</span></div>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Name</label>
                    <input 
                      required 
                      type="text" 
                      value={repairData.name}
                      onChange={(e) => setRepairData({...repairData, name: e.target.value})}
                      className="w-full bg-ink2/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-aqua outline-none transition" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Phone</label>
                    <input 
                      required 
                      type="tel" 
                      value={repairData.phone}
                      onChange={(e) => setRepairData({...repairData, phone: e.target.value})}
                      className="w-full bg-ink2/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-aqua outline-none transition" 
                    />
                  </div>
                </div>
                
                <div className="flex justify-between pt-4">
                  <button type="button" onClick={() => setRepairStep(3)} className="px-6 py-2.5 rounded-full text-slate-300 font-semibold text-sm hover:text-white transition">Back</button>
                  <button type="submit" className="px-6 py-2.5 rounded-full bg-gradient-to-r from-aqua to-magenta text-ink font-bold text-sm shadow-lg hover:shadow-aqua/30 transition">
                    Confirm Booking
                  </button>
                </div>
              </motion.form>
            )}
          </div>
        </div>
      </section>
    );
  };

  const renderBrandModels = () => {
    const brandModelsList = storeModels.filter(m => m.brand === selectedBrand);

    return (
      <section className="relative w-full py-24 min-h-screen">
        <div className="aurora-mid" style={{ opacity: 0.2 }}></div>
        <div className="mx-auto max-w-6xl px-6 relative z-10">
          <button onClick={() => handleNavClick('home')} className="mb-8 flex items-center gap-2 text-slate-400 hover:text-white transition">
            <span className="iconify text-lg" data-icon="ph:arrow-left-bold"></span> Back to Brands
          </button>
          
          <div className="text-sm font-semibold uppercase tracking-[0.2em] text-magenta mb-3">{selectedBrand} Devices</div>
          <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl mb-12">Available New Devices</h2>
          
          {brandModelsList.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center">
              <span className="iconify text-6xl text-slate-600 mx-auto mb-4" data-icon="ph:device-mobile-slash"></span>
              <h3 className="font-display text-xl text-white font-bold mb-2">No models listed</h3>
              <p className="text-slate-400">We couldn't find any {selectedBrand} models in our inventory. Please check back later or contact support.</p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {brandModelsList.map(m => (
                <div key={m.id} className="group glass rounded-2xl overflow-hidden flex flex-col hover:border-aqua/30 transition-colors">
                  <div className="h-40 flex items-center justify-center text-6xl relative" style={{ background: m.bgGradient || 'linear-gradient(150deg, #2dd4bf 0%, #22a89a 45%, #0c3b45 78%)' }}>
                    <div className="absolute inset-0" style={{ background: 'radial-gradient(120% 80% at 30% 20%, rgba(255,255,255,0.18), transparent 60%)' }}></div>
                    <span className="drop-shadow-2xl z-10 flex items-center justify-center h-full w-full">
                      {m.image ? <img src={m.image} alt={m.name} className="h-32 w-32 object-contain" /> : m.emoji || '📱'}
                    </span>
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="text-[11px] uppercase tracking-widest text-slate-500 font-semibold mb-1">{m.brand} &bull; {m.category || 'Device'}</div>
                    <h3 className="font-display text-xl font-bold text-white flex-grow">{m.name}</h3>
                    <div className="mt-2 text-aqua font-semibold">₹{Number(m.price).toLocaleString()}</div>
                    <button 
                      onClick={() => addToCart({ id: m.id, name: m.name, brand: m.brand, price: m.price, emoji: m.emoji || '📱', bgGradient: m.bgGradient || 'linear-gradient(150deg, #2dd4bf 0%, #22a89a 45%, #0c3b45 78%)' })} 
                      className="mt-6 w-full rounded-full bg-white/5 border border-white/10 px-4 py-2.5 text-sm font-bold text-white hover:bg-aqua hover:text-ink transition-colors"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    );
  };

  return (
    <div className="flex flex-col min-h-screen">
      {renderHeader()}
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="flex-grow flex flex-col"
          >
            {currentView === 'home' && renderHome()}
            {currentView === 'shop' && renderShop()}
            {currentView === 'cart' && renderCart()}
            {currentView === 'repair' && renderRepair()}
            
            {currentView === 'brand-models' && renderBrandModels()}
          </motion.div>
        </AnimatePresence>
      </main>
      <footer className="relative w-full border-t border-white/5 bg-ink2/60">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
          <div className="flex items-center gap-2.5">
            <div className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-aqua to-magenta">
              <span className="iconify text-ink text-[15px]" data-icon="ph:cards-three-fill"></span>
            </div>
            <span className="font-display font-bold text-white">7 Star Mobiles</span>
          </div>
          <div className="text-xs text-slate-400">© 2026 Coverflow Labs. Crafted in the dark.</div>
          <div className="flex items-center gap-4 text-slate-400 text-lg">
            <span className="iconify hover:text-aqua cursor-pointer transition-colors" data-icon="ph:x-logo"></span>
            <span className="iconify hover:text-aqua cursor-pointer transition-colors" data-icon="ph:github-logo"></span>
          </div>
        </div>
      </footer>
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.9, y: 20 }} 
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <div className="bg-slate-900 border border-aqua/30 rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl relative overflow-hidden">
               <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${notification.type === 'error' ? 'from-red-500 to-orange-500' : 'from-aqua to-magenta'}`}></div>
               <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${notification.type === 'error' ? 'bg-red-500/20 text-red-500' : 'bg-aqua/20 text-aqua'}`}>
                 <span className="iconify text-3xl" data-icon={notification.type === 'error' ? 'ph:x-circle-fill' : 'ph:check-circle-fill'}></span>
               </div>
               <h3 className="text-xl font-bold text-white mb-2">{notification.title}</h3>
               <p className="text-slate-300 mb-6">{notification.message}</p>
               <button onClick={() => setNotification(null)} className="w-full py-3 rounded-full bg-white text-ink font-semibold hover:bg-aqua transition-colors">
                 Done
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
