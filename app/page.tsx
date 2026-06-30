'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

function AutoSlider() {
  useEffect(() => {
    let current = 0;
    const total = 7;

    const interval = setInterval(() => {
      current = (current + 1) % total;
      const slider = document.getElementById('weddingSlider');
      if (slider) {
        slider.style.transform = `translateX(-${current * 100}%)`;
      }
      const dots = document.querySelectorAll('.wedding-dot');
      dots.forEach((dot, i) => {
        const el = dot as HTMLElement;
        el.style.width = i === current ? '24px' : '8px';
        el.style.background = i === current ? '#1f2937' : '#d1d5db';
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return null;
}

export default function Home() {
  const [showMenu, setShowMenu] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<'Men' | 'Women' | 'Kids' | 'Home' | 'Beauty' | 'GenZ'>('Men');

  // const menuTabs = ['Men', 'Women', 'Kids', 'Home', 'Beauty', 'GenZ'] as const;
  // const menuData: Record<typeof menuTabs[number], Array<{ title: string; items: string[] }>> = {
  //   Men: [
  //     { title: 'Casual Wear', items: ['T-Shirts', 'Polos', 'Shirts', 'Sweatshirts & Pullovers', 'Jackets', 'Jeans', 'Shorts', 'Co-ords'] },
  //     { title: 'Formal Wear', items: ['Shirts', 'Trousers', 'Suit Sets', 'Blazers & Coats'] },
  //     { title: 'Indian & Festive Wear', items: ['Kurtas', 'Kurta Sets', 'Nehru Jackets', 'Dhotis & Pyjamas'] },
  //     { title: 'Winterwear', items: ['Sweaters & Cardigans', 'Sweatshirts & Pullovers', 'Jackets & Coats', 'Thermals'] },
  //     { title: 'Innerwear & Sleepwear', items: ['Vests', 'Loungewear T-Shirts', 'Briefs & Trunks', 'Boxers', 'Socks'] },
  //     { title: 'Athleisure', items: ['Active T-Shirts', 'Jackets & Sweatshirts', 'Shorts', 'Track Pants & Joggers', 'Tracksuits & Sets'] },
  //     { title: 'Footwear', items: ['Casual Shoes & Loafers', 'Sports Shoes', 'Formal Shoes', 'Sandals & Floaters', 'Boots'] },
  //     { title: 'Accessories', items: ['Belts', 'Caps & Hats', 'Travel Accessories', 'Watches', 'Sunglasses & Frames'] },
  //   ],
  //   Women: [
  //     { title: 'Western Wear', items: ['Dresses', 'Tops', 'Tshirts', 'Jeans', 'Trousers & Capris', 'Shorts & Skirts', 'Co-ords', 'Playsuits', 'Jumpsuits', 'Shrugs'] },
  //     { title: 'Ethnic Wear', items: ['Kurtas & Suits', 'Kurtis, Tunics & Tops', 'Sarees', 'Leggings, Salwars & Churidars', 'Skirts & Palazzos', 'Dress Materials', 'Lehenga Cholis', 'Dupattas & Shawls'] },
  //     { title: 'Lingerie & Sleepwear', items: ['Bra', 'Briefs', 'Shapewear', 'Sleepwear & Loungewear', 'Swimwear', 'Camisoles & Thermals'] },
  //     { title: 'Footwear', items: ['Flats', 'Casual Shoes', 'Heels', 'Boots', 'Sports Shoes & Floaters'] },
  //     { title: 'Beauty & Personal Care', items: ['Makeup', 'Skincare', 'Fragrances', 'Haircare', 'Premium Beauty'] },
  //     { title: 'Jewellery', items: ['Fashion Jewellery', 'Fine Jewellery'] },
  //   ],
  //   Kids: [
  //     { title: 'Boys Clothing', items: ['T-Shirts', 'Shirts', 'Clothing Sets', 'Ethnic Wear'] },
  //     { title: 'Girls Clothing', items: ['Dresses', 'Tops', 'Tshirts', 'Clothing Sets', 'Party Wear', 'Lehenga Choli', 'Kurta Sets', 'Skirts & Shorts'] },
  //     { title: 'Footwear', items: ['Casual Shoes', 'Flipflops', 'Sports Shoes', 'Flats', 'Sandals', 'Heels', 'School Shoes', 'Socks'] },
  //     { title: 'Toys & Games', items: ['Learning & Development', 'Activity Toys', 'Soft Toys', 'Action Figures'] },
  //     { title: 'Infants', items: ['Bodysuits', 'Rompers & Sleepsuits', 'Clothing Sets', 'T-Shirts & Tops', 'Dresses', 'Bottomwear', 'Winter Wear'] },
  //   ],
  //   Home: [
  //     { title: 'Bed Linen & Furnishing', items: ['Bed Sheets', 'Bedding Sets', 'Blankets', 'Pillows', 'Cushions'] },
  //     { title: 'Bath', items: ['Bath Towels', 'Hand & Face Towels', 'Bath Rugs', 'Bath Robes'] },
  //     { title: 'Decor', items: ['Wall Decor', 'Showpieces & Vases', 'Planters', 'Clocks', 'Lamps'] },
  //     { title: 'Kitchen & Table', items: ['Dinnerware', 'Cookware', 'Kitchen Storage', 'Barware'] },
  //     { title: 'Storage', items: ['Bins', 'Hangers', 'Organisers', 'Laundry Bags'] },
  //   ],
  //   Beauty: [
  //     { title: 'Makeup', items: ['Lipstick', 'Lip Gloss', 'Mascara', 'Eyeliner', 'Kajal'] },
  //     { title: 'Skincare', items: ['Moisturiser', 'Cleanser', 'Masks', 'Sunscreen'] },
  //     { title: 'Haircare', items: ['Shampoo', 'Conditioner', 'Hair Oil', 'Serum'] },
  //     { title: 'Fragrances', items: ['Perfume', 'Deodorant', 'Body Mist'] },
  //     { title: 'Personal Care', items: ['Bath & Body', 'Wellness', 'Appliances'] },
  //   ],
  //   GenZ: [
  //     { title: 'Women’s Western', items: ['Dresses Under ₹599', 'Tops Under ₹399', 'Jeans Under ₹599'] },
  //     { title: 'Men’s Casual', items: ['T-Shirts Under ₹299', 'Shirts Under ₹499', 'Jeans Under ₹599'] },
  //     { title: 'Footwear', items: ['Heels Under ₹599', 'Flats Under ₹499', 'Casual Shoes Under ₹699', 'Sports Shoes Under ₹999'] },
  //     { title: 'Beauty & Grooming', items: ['Skincare Under ₹299', 'Haircare Under ₹399', 'Makeup Under ₹299'] },
  //     { title: 'Accessories', items: ['Jewellery Under ₹299', 'Bags Under ₹499', 'Sunglasses Under ₹699'] },
  //   ],
  // };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        :root {
          --bg: #fdfbff;
          --surface: #faf7ff;
          --card: #ffffff;
          --pink: #ec4899;
          --pink-light: #f472b6;
          --pink-glow: rgba(236,72,153,0.15);
          --rose: #fb7185;
          --text: #1f2937;
          --muted: #9ca3af;
          --border: rgba(236,72,153,0.1);
        }

        .shopore-wrap {
          background: var(--bg);
          color: var(--text);
          font-family: 'DM Sans', sans-serif;
          overflow-x: hidden;
          min-height: 100vh;
        }

        /* ── HERO ── */
.s-hero {
  min-height: 100vh;
  display: flex;
  align-items: center;
  padding: 140px 60px 80px;
  position: relative;
  overflow: hidden;
  background: #fdfbff;
}
        .s-hero::before {
          content: '';
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(236,72,153,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(236,72,153,0.03) 1px, transparent 1px);
          background-size: 60px 60px;
        }

        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          opacity: 0.3;
          animation: floatOrb 12s ease-in-out infinite;
          pointer-events: none;
          mix-blend-mode: screen;
        }
        .orb-1 { width: 600px; height: 600px; background: #ec4899; top: -150px; right: 50px; opacity: 0.15; animation: floatOrb 15s ease-in-out infinite; }
        .orb-2 { width: 400px; height: 400px; background: #f472b6; bottom: 50px; right: 200px; animation-delay: -4s; opacity: 0.12; }
        .orb-3 { width: 300px; height: 300px; background: #fb7185; top: 100px; left: -100px; animation-delay: -6s; opacity: 0.1; }
        @keyframes floatOrb {
          0%,100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(40px, -50px) scale(1.1); }
          50% { transform: translate(0, -80px) scale(1.05); }
          75% { transform: translate(-40px, -50px) scale(1.08); }
        }

        .hero-content {
          position: relative; z-index: 2;
          max-width: 700px;
          animation: fadeUp 0.7s ease both;
        }

        .badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: linear-gradient(135deg, rgba(236,72,153,0.15) 0%, rgba(244,114,182,0.08) 100%);
          border: 1px solid rgba(236,72,153,0.3);
          padding: 8px 18px; border-radius: 50px;
          font-size: 11px; color: #ec4899;
          margin-bottom: 28px;
          font-weight: 600;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          animation: fadeUp 0.8s ease both;
          box-shadow: 0 0 20px rgba(236,72,153,0.1);
        }
        .badge-dot {
          width: 8px; height: 8px;
          background: #ec4899;
          border-radius: 50%;
          animation: pulse 2s infinite;
          box-shadow: 0 0 10px #ec4899;
        }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(1.2)} }

        .hero-h1 {
          font-family: 'DM Sans', sans-serif;
          font-size: clamp(48px, 8vw, 90px);
          font-weight: 800;
          line-height: 1.1;
          letter-spacing: -1px;
          margin-bottom: 24px;
          color: #1f2937;
          animation: slideDown 0.8s ease both;
        }
        .hero-h1 .accent {
          background: linear-gradient(135deg, #ec4899 0%, #f472b6 50%, #fb7185 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          filter: drop-shadow(0 0 20px rgba(236,72,153,0.3));
          animation: glow 3s ease-in-out infinite;
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes glow {
          0%, 100% { filter: drop-shadow(0 0 10px rgba(236,72,153,0.3)); }
          50% { filter: drop-shadow(0 0 30px rgba(236,72,153,0.6)); }
        }

        .hero-sub {
          font-size: 18px;
          color: #6b7280;
          line-height: 1.8;
          max-width: 600px;
          margin-bottom: 40px;
          font-weight: 400;
          animation: fadeUp 0.8s ease both 0.2s;
          opacity: 0;
        }

        .hero-actions {
          display: flex; gap: 20px; align-items: center;
          margin: 40px 0 48px;
          flex-wrap: wrap;
          animation: fadeUp 0.8s ease both 0.3s;
          opacity: 0;
        }
        .btn-primary {
  background: #ffffff;
  color: #ec4899;
  border: 2px solid rgba(236,72,153,0.3);
  padding: 16px 40px; border-radius: 50px;
  font-size: 16px; font-weight: 600;
  cursor: pointer; text-decoration: none;
  transition: all 0.3s;
  box-shadow: 0 8px 24px rgba(236,72,153,0.15);
  font-family: 'DM Sans', sans-serif;
  display: inline-block;
  position: relative;
  overflow: hidden;
}

        .btn-primary::before {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);
          animation: shimmerBtn 3s infinite;
        }
        @keyframes shimmerBtn {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
.btn-primary:hover {
  transform: none;
  background: linear-gradient(135deg, rgba(236,72,153,0.08), rgba(244,114,182,0.05));
  border-color: #ec4899;
  box-shadow: 0 16px 36px rgba(236,72,153,0.25);
  color: #ec4899;
}
        .btn-ghost {
          color: #6b7280; text-decoration: none;
          font-size: 15px; display: inline-flex; align-items: center; gap: 8px;
          transition: color 0.2s;
        }
        .btn-ghost:hover { color: #ec4899; }

        .hero-pills {
          display: flex; gap: 12px; flex-wrap: wrap;
          animation: fadeUp 0.8s ease both 0.4s;
          opacity: 0;
        }
        .pill {
          display: inline-flex; align-items: center; gap: 8px;
          background: linear-gradient(135deg, rgba(236,72,153,0.08) 0%, rgba(244,114,182,0.04) 100%);
          border: 1px solid rgba(236,72,153,0.2);
          padding: 10px 18px; border-radius: 50px;
          font-size: 13px; color: #6b7280;
          transition: all 0.3s;
          font-weight: 500;
          box-shadow: 0 0 15px rgba(236,72,153,0.08);
        }
        .pill:hover {
          border-color: #f472b6;
          color: #ec4899;
          background: linear-gradient(135deg, rgba(236,72,153,0.15) 0%, rgba(244,114,182,0.1) 100%);
          transform: none;
          box-shadow: 0 8px 25px rgba(236,72,153,0.15);
        }

        /* ── STATS BAR ── */
        .stats-bar {
          background: linear-gradient(to right, rgba(236,72,153,0.03), rgba(244,114,182,0.02));
          border-top: 1px solid rgba(236,72,153,0.08);
          border-bottom: 1px solid rgba(236,72,153,0.08);
          padding: 40px 60px;
          display: flex; justify-content: space-around;
        }
        .stat { text-align: center; }
        .stat-number {
          font-family: 'DM Sans', sans-serif;
          font-size: 32px; font-weight: 700;
          background: linear-gradient(135deg, #ec4899, #fb7185);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          display: block;
        }
        .stat-label { font-size: 13px; color: #9ca3af; margin-top: 4px; }

        /* ── FEATURES ── */
        .features { padding: 100px 60px; background: #ffffff; }
        .section-tag {
          display: inline-block;
          font-size: 11px; font-weight: 600;
          letter-spacing: 3px;
          color: #ec4899;
          text-transform: uppercase;
          margin-bottom: 16px;
        }
        .section-title {
          font-family: 'DM Sans', sans-serif;
          font-size: clamp(28px, 3vw, 42px);
          font-weight: 700; line-height: 1.2;
          margin-bottom: 60px;
          max-width: 550px;
          color: #1f2937;
        }
        .features-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }
        .feature-card {
          background: #ffffff;
          border: 2px solid rgba(236,72,153,0.1);
          border-radius: 20px; padding: 28px;
          transition: transform 0.35s ease, box-shadow 0.35s ease, border-color 0.35s ease;
          position: relative; overflow: hidden;
          animation: fadeUp 0.6s ease both;
          box-shadow: 0 6px 18px rgba(236,72,153,0.05);
          will-change: transform, box-shadow;
        }
        .feature-card:nth-child(2) { animation-delay: 0.1s; }
        .feature-card:nth-child(3) { animation-delay: 0.2s; }
        .feature-card:nth-child(4) { animation-delay: 0.3s; }
        .feature-card::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(236,72,153,0.1), transparent);
          opacity: 0; transition: opacity 0.35s ease;
        }
        .feature-card:hover {
          border-color: rgba(236,72,153,0.35);
          transform: none;
          box-shadow: 0 20px 42px rgba(236,72,153,0.16);
        }
        .feature-card:hover::before { opacity: 1; }
        .feature-icon {
          width: 52px; height: 52px;
          background: linear-gradient(135deg, rgba(236,72,153,0.12), rgba(244,114,182,0.08));
          border: 2px solid rgba(236,72,153,0.15);
          border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          font-size: 24px; margin-bottom: 20px;
        }
        .feature-title {
          font-family: 'DM Sans', sans-serif;
          font-size: 15px; font-weight: 600; margin-bottom: 10px;
          color: #1f2937;
        }
        .feature-desc { font-size: 13px; color: #9ca3af; line-height: 1.6; }

        /* ── DEAL OF THE DAY ── */
        .deal-section { padding: 100px 60px; background: #ffffff; }

        /* ── PRODUCTS ── */
        .products-section {
          padding: 100px 60px;
          background: linear-gradient(180deg, #ffffff 0%, #faf7ff 100%);
        }
        .products-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }
        .product-card {
          background: #ffffff;
          border: 2px solid rgba(236,72,153,0.1);
          border-radius: 16px;
          overflow: hidden;
          transition: all 0.3s;
          cursor: pointer;
          animation: fadeUp 0.6s ease both;
          box-shadow: 0 4px 12px rgba(236,72,153,0.04);
        }
        .product-card:hover {
          border-color: rgba(236,72,153,0.3);
          transform: none;
          box-shadow: 0 12px 24px rgba(236,72,153,0.15);
        }
.product-image {
  width: 100%; 
  height: 400px;
  background: linear-gradient(135deg, rgba(236,72,153,0.08), rgba(244,114,182,0.05));
  display: flex; 
  align-items: center; 
  justify-content: center;
  position: relative; 
  overflow: hidden;
}
  .product-card {
  background: #ffffff;
  border: 2px solid rgba(236,72,153,0.1);
  border-radius: 16px;
  overflow: hidden;        /* ← ei ta add koro */
  transition: all 0.3s;
  cursor: pointer;
  animation: fadeUp 0.6s ease both;
  box-shadow: 0 4px 12px rgba(236,72,153,0.04);
}
        .product-info { padding: 20px; }
        .product-name { font-size: 14px; font-weight: 600; margin-bottom: 8px; color: #1f2937; }
        .product-desc { font-size: 12px; color: #9ca3af; line-height: 1.5; margin-bottom: 16px; }
        .product-price {
          font-size: 18px; font-weight: 700;
          background: linear-gradient(135deg, #ec4899, #fb7185);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 12px;
        }
        .product-btn {
          width: 100%; padding: 10px;
          background: linear-gradient(135deg, rgba(236,72,153,0.1), rgba(244,114,182,0.05));
          color: #ec4899;
          border: 2px solid rgba(236,72,153,0.2);
          border-radius: 10px;
          font-size: 13px; font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          font-family: 'DM Sans', sans-serif;
        }
        .product-btn:hover {
          background: linear-gradient(135deg, #ec4899, #f472b6);
          color: white;
          border-color: #ec4899;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 900px) {
          .s-hero { padding: 120px 24px 60px; }
          .stats-bar { padding: 30px 24px; gap: 20px; flex-wrap: wrap; }
          .features { padding: 60px 24px; }
          .features-grid { grid-template-columns: 1fr 1fr; }
          .deal-section { padding: 60px 24px; }
          .products-section { padding: 60px 24px; }
          .products-grid { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 600px) {
          .features-grid { grid-template-columns: 1fr; }
          .products-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
          .product-image { height: auto; aspect-ratio: 3 / 4; }
          .product-info { padding: 12px; }
          .product-name { font-size: 13px; }
          .product-desc { margin-bottom: 10px; font-size: 11px; }
          .product-price { font-size: 15px; }
          .product-btn { padding: 8px 5px; font-size: 11px; }
          .s-hero { padding: 112px 16px 44px; }
          .hero-h1 { font-size: clamp(32px, 11vw, 44px); }
          .hero-sub { font-size: 14px; }
          .hero-actions { flex-direction: column; align-items: stretch; }
          .hero-actions a { width: 100%; text-align: center; }
          .stats-bar { padding: 22px 16px; }
          .deal-section,
          .products-section,
          .features { padding: 42px 16px; }
          .landing-wide-section { padding-left: 16px !important; padding-right: 16px !important; margin-left: 0 !important; margin-right: 0 !important; }
          .landing-five-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; gap: 12px !important; }
          .landing-brand-grid { grid-auto-flow: row !important; grid-template-columns: 1fr !important; }
          .landing-brand-grid img { width: 100% !important; }
          .landing-wide-section img { max-width: 100% !important; }
          .landing-brand-section { padding: 32px 16px !important; }
          .landing-brand-shell { flex-direction: column !important; align-items: stretch !important; }
          .landing-trust-row {
            width: 100% !important;
            margin-left: 0 !important;
            padding: 18px 12px !important;
            display: grid !important;
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 14px !important;
          }
          .landing-trust-row > div { border-right: none !important; }
        }
      `}</style>

      <div className="shopore-wrap">
        {/* ── HERO ── */}
        <section className="s-hero">
          <div className="orb orb-1" />
          <div className="orb orb-2" />
          <div className="orb orb-3" />

          {/* Left content */}
          <div className="hero-content">
            <h1 className="hero-h1">
              India's <span className="accent">Fashion</span><br />
              Destination
            </h1>
            <p className="hero-sub">
              Get everything you need to build, run and scale your business on one eCommerce platform. Fast, simple, and personalized for modern users.
            </p>
            <div className="hero-actions">
              <a href="/explore" className="btn-primary">Shop Now →</a>
            </div>
            <div className="hero-pills">
              <div className="pill"><span>⚡</span> Fast</div>
              <div className="pill"><span>😊</span> Simple</div>
              <div className="pill"><span>🎯</span> Personalized</div>
              <div className="pill"><span>🔒</span> Secure</div>
            </div>
          </div>

          {/* Right side — couple banner */}
          <div style={{
            position: 'absolute',
            right: '0',
            top: '0',
            height: '100%',
            width: '38%',
            zIndex: 2,
            overflow: 'hidden',
          }}>
            <img
              src="/couple.png"
              alt="Fashion Banner"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'left top',
                display: 'block',
                mixBlendMode: 'multiply',
                filter: 'contrast(1.05) brightness(0.98)',
              }}
            />
          </div>
        </section>
        {/* ── EXCLUSIVE OFFERS + DYSON BANNER ── */}
        <section style={{ padding: '40px 60px', background: '#ffffff' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '16px' }}>
            Exclusive Offers
          </h3>
          <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
            {[
              { code: 'STYLE26', title: 'Use Code- STYLE26', desc: 'Flat ₹450 On ₹5000, Flat ₹1000 On ₹10000', link: 'View All Products >' },
              { code: 'LUXE', title: 'Use Code- LUXE', desc: 'Flat ₹2500 Off On ₹20000', link: 'On selected products >' },
              { code: 'NEW10', title: 'Use Code- NEW10', desc: 'For First Time Users 10% Off on ₹3000', link: 'View All Products >' },
            ].map(offer => (
              <a
                key={offer.code}
                href="/explore"
                onMouseEnter={e => {
                  (e.currentTarget as HTMLAnchorElement).style.transform = 'none';
                  (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 16px 40px rgba(236,72,153,0.15)';
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(236,72,153,0.35)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLAnchorElement).style.transform = 'none';
                  (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)';
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = 'transparent';
                }}
                style={{
                  flex: 1,
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                  border: '2px solid transparent',
                  overflow: 'hidden',
                  color: 'inherit',
                  textDecoration: 'none',
                }}
              >
                {/* Top content */}
                <div style={{ padding: '16px 20px 12px' }}>
                  <p style={{ fontWeight: '500', fontSize: '18px', lineHeight: '22px', color: 'rgb(0,0,0)', marginBottom: '6px' }}>
                    {offer.title}
                  </p>
                  <p style={{ fontWeight: '300', fontSize: '14px', lineHeight: '19px', color: 'rgb(55,65,81)' }}>
                    {offer.desc}
                  </p>
                </div>

                {/* Bottom strip — yellow bar, white text */}
                <div style={{
                  background: '#d4a800',
                  padding: '10px 20px',
                  borderRadius: '0px',
                }}>
                  <p style={{ fontWeight: '500', fontSize: '14px', color: '#ffffff', margin: 0 }}>
                    {offer.link}
                  </p>
                </div>
              </a>
            ))}
          </div>

          {/* Dyson GIF Banner */}
          <img
            src="/Landing/Dyson-strip-web.gif"
            alt="Dyson Offer"
            style={{ width: '100%', height: 'auto', display: 'block', borderRadius: '8px' }}
          />
        </section>
        {/* ── WED BANNER ── */}
        <section className="landing-wide-section" style={{ padding: '0 60px', background: '#ffffff', marginBottom: '20px' }}>
          <img
            src="/wed.png"
            alt="Wedding Banner"
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
              borderRadius: '16px',
            }}
          />
        </section>
        {/* ── WEDDING STRIP + CAROUSEL ── */}
        <section className="landing-wide-section" style={{ padding: '0 60px', background: '#ffffff', marginBottom: '20px' }}>
          <div style={{ position: 'relative', overflow: 'hidden', background: '#fff9f9', borderRadius: '16px' }}>
            <div
              id="weddingSlider"
              style={{ display: 'flex', transition: 'transform 0.6s ease', width: '100%' }}
            >
              {[
                { img: '/Landing/Engagement-web.png', label: 'Engagement', href: '/women/indian-fusion-wear' },
                { img: '/Landing/Pre-wedding-shoot-web.png', label: 'Pre Wedding Shoot', href: '/women/indian-fusion-wear' },
                { img: '/Landing/Mehendi-web.png', label: 'Mehendi', href: '/women/indian-fusion-wear' },
                { img: '/Landing/Haldi-web.png', label: 'Haldi', href: '/women/indian-fusion-wear' },
                { img: '/Landing/Wedding-web.png', label: 'Wedding', href: '/women/indian-fusion-wear' },
                { img: '/Landing/Reception-web.png', label: 'Reception', href: '/women/indian-fusion-wear' },
                { img: '/Landing/Honeymoon-web.png', label: 'Honeymoon', href: '/women/indian-fusion-wear' },
              ].map((slide, i) => (
                <a key={i} href={slide.href} style={{ minWidth: '100%', position: 'relative', display: 'block', cursor: 'pointer' }}>
                  <img
                    src={slide.img}
                    alt={slide.label}
                    style={{ width: '100%', height: 'auto', display: 'block' }}
                  />
                </a>
              ))}
            </div>
            <AutoSlider />
            <div id="weddingDots" style={{
              display: 'flex', gap: '8px',
              justifyContent: 'center',
              marginTop: '14px',
              paddingBottom: '4px',
            }}>
              {[0, 1, 2, 3, 4, 5, 6].map(i => (
                <div
                  key={i}
                  className="wedding-dot"
                  data-index={i}
                  style={{
                    width: i === 0 ? '24px' : '8px',
                    height: '8px',
                    borderRadius: '4px',
                    background: i === 0 ? '#1f2937' : '#d1d5db',
                    transition: 'all 0.3s',
                    cursor: 'pointer',
                  }}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ── DEAL OF THE DAY ── */}
        <section className="deal-section">
          <div className="section-tag">Limited Time Offers</div>
          <h2 className="section-title">Deal Of The Day</h2>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={() => (document.getElementById('dealCarousel') as HTMLElement)?.scrollBy({ left: -250, behavior: 'smooth' })}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#ec4899'; (e.currentTarget as HTMLButtonElement).style.color = 'white'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#ffffff'; (e.currentTarget as HTMLButtonElement).style.color = '#ec4899'; }}
              style={{
                flexShrink: 0, width: '44px', height: '44px',
                borderRadius: '50%', border: '2px solid rgba(236,72,153,0.3)',
                background: '#ffffff', color: '#ec4899',
                fontSize: '18px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(236,72,153,0.15)',
                transition: 'all 0.2s',
              }}
            >←</button>

            <div
              id="dealCarousel"
              style={{
                display: 'flex', gap: '16px',
                overflowX: 'auto', scrollBehavior: 'smooth',
                paddingBottom: '8px', scrollbarWidth: 'none',
                flex: 1,
              }}
            >
              {[
                { id: 1, category: "Men's Sportswear", offer: "MIN. 50% OFF", img: "/Landing/MenSportswear.avif", href: "/men/sports-active-wear" },
                { id: 2, category: "Elegant Kurtis", offer: "MIN. 50% OFF", img: "/Landing/ElegantKurtis_DOD7thMay26upd.avif", href: "/women/kurtis-tops" },
                { id: 3, category: "Salwar Suits", offer: "MIN. 50% OFF", img: "/Landing/SalwarSuits.avif", href: "/women/indian-fusion-wear" },
                { id: 4, category: "Backpacks & Crossbody", offer: "MIN. 50% OFF", img: "/Landing/BackpacksCrossbody.avif", href: "/women/handbags-bags-wallets" },
                { id: 5, category: "Men Tees & Polos", offer: "MIN. 50% OFF", img: "/Landing/MenTeesPolos.avif", href: "/men/t-shirts" },
                { id: 6, category: "Men's Shirts", offer: "MIN. 50% OFF", img: "/Landing/MenShirts.avif", href: "/men/casual-shirts" },
                { id: 7, category: "Women's Footwear", offer: "MIN. 50% OFF", img: "/Landing/WomenFootwear.avif", href: "/women/footwear" },
                { id: 8, category: "Home Utility", offer: "MIN. 50% OFF", img: "/Landing/HomeUtility.avif", href: "/home/home-bath" },
                { id: 9, category: "Women Bottomwear", offer: "MIN. 50% OFF", img: "/Landing/WomenBottomwear.avif", href: "/women/trousers-capris" },
                { id: 10, category: "Nutritional Supplements", offer: "MIN. 50% OFF", img: "/Landing/NutritionalSupplements.avif", href: "/beauty/wellness-hygiene" },
                { id: 11, category: "Women Inner & Nightwear", offer: "MIN. 50% OFF", img: "/Landing/WomenInnerNightwea.avif", href: "/women/lingerie-sleepwear" },
                { id: 12, category: "Women Jewellery", offer: "MIN. 50% OFF", img: "/Landing/WomenJewellery.avif", href: "/women/jewellery" },
                { id: 13, category: "Table & Appliance Covers", offer: "MIN. 50% OFF", img: "/Landing/TableApplianceCovers.avif", href: "/home/kitchen-table" },
                { id: 14, category: "Makeup Must-Haves", offer: "UNDER ₹399", img: "/Landing/MakeupMustHaves.avif", href: "/beauty/makeup" },
                { id: 15, category: "Trendy Sunglasses", offer: "MIN. 50% OFF", img: "/Landing/TrendySunglasses.avif", href: "/women/sunglasses-frames" },
              ].map(deal => (
                <a
                  key={deal.id}
                  href={deal.href}
                  style={{
                    minWidth: '180px', maxWidth: '180px',
                    background: '#ffffff',
                    border: '2px solid #fecdd3',
                    borderRadius: '16px', overflow: 'hidden',
                    transition: 'all 0.3s', cursor: 'pointer',
                    flexShrink: 0,
                    color: 'inherit',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = '#ec4899';
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = '0 12px 30px rgba(236,72,153,0.2)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = '#fecdd3';
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <img
                    src={deal.img}
                    alt={deal.category}
                    style={{ width: '100%', height: '180px', objectFit: 'cover', display: 'block' }}
                  />
                  <div style={{ padding: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: '#1f2937', marginBottom: '6px' }}>
                      {deal.category}
                    </div>
                    <div style={{
                      fontSize: '12px', fontWeight: '700', color: '#ec4899',
                      background: 'rgba(236,72,153,0.08)',
                      padding: '4px 10px', borderRadius: '6px', display: 'inline-block'
                    }}>
                      {deal.offer}
                    </div>
                  </div>
                </a>
              ))}
            </div>

            <button
              onClick={() => (document.getElementById('dealCarousel') as HTMLElement)?.scrollBy({ left: 250, behavior: 'smooth' })}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#ec4899'; (e.currentTarget as HTMLButtonElement).style.color = 'white'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#ffffff'; (e.currentTarget as HTMLButtonElement).style.color = '#ec4899'; }}
              style={{
                flexShrink: 0, width: '44px', height: '44px',
                borderRadius: '50%', border: '2px solid rgba(236,72,153,0.3)',
                background: '#ffffff', color: '#ec4899',
                fontSize: '18px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(236,72,153,0.15)',
                transition: 'all 0.2s',
              }}
            >→</button>
          </div>
        </section>

        {/* ── PROMO BANNER ── */}
        <section className="landing-wide-section" style={{ margin: '0 60px', borderRadius: '28px', overflow: 'hidden', marginBottom: '60px' }}>
          <a href="/men/sneakers" style={{ display: 'block', cursor: 'pointer' }}>
            <img
              src="/Landing/campusshoes.avif"
              alt="Campus Shoes Banner"
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
          </a>
        </section>

        {/* ── NEW ARRIVALS ── */}
        <section className="products-section">
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 style={{
              fontFamily: 'DM Sans, sans-serif',
              fontSize: 'clamp(28px, 3vw, 42px)',
              fontWeight: '700', color: '#1f2937'
            }}>New Arrivals</h2>
          </div>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={() => (document.getElementById('newArrivalCarousel') as HTMLElement)?.scrollBy({ left: -250, behavior: 'smooth' })}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#ec4899'; (e.currentTarget as HTMLButtonElement).style.color = 'white'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#ffffff'; (e.currentTarget as HTMLButtonElement).style.color = '#ec4899'; }}
              style={{
                flexShrink: 0, width: '44px', height: '44px',
                borderRadius: '50%', border: '2px solid rgba(236,72,153,0.3)',
                background: '#ffffff', color: '#ec4899',
                fontSize: '18px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(236,72,153,0.15)',
                transition: 'all 0.2s',
              }}
            >←</button>

            <div
              id="newArrivalCarousel"
              style={{
                display: 'flex', gap: '16px',
                overflowX: 'auto', scrollBehavior: 'smooth',
                paddingBottom: '8px', scrollbarWidth: 'none',
                flex: 1,
              }}
            >
              {[
                { id: 1, name: 'Smart Casual Shirts', price: 'UNDER ₹499', img: '/Landing/SmartShirts.avif', href: '/men/casual-shirts' },
                { id: 2, name: 'The Watch Edit', price: 'UNDER ₹399', img: '/Landing/tissot_luxe360x450.png', href: '/men/watches' },
                { id: 3, name: 'Kurtis Under Spotlight', price: 'UNDER ₹499', img: '/Landing/Kurtis_NewInn26thMarch26.avif', href: '/women/kurtis-tops' },
                { id: 4, name: 'Trendy Shoes', price: 'UNDER ₹799', img: '/Landing/Footwear-web.png', href: '/men/sneakers' },
                { id: 5, name: 'Salwar Suits', price: 'UNDER ₹599', img: '/Landing/SalwarSuitsStories.avif', href: '/women/indian-fusion-wear' },
                { id: 6, name: 'D&G Beauty', price: 'STARTING ₹159', img: '/Landing/D&G-beauty_luxe360x450.png', href: '/beauty/makeup' },
                { id: 7, name: 'Tom Ford Perfume', price: 'UNDER ₹999', img: '/Landing/Tom-Ford_luxe360x450.png', href: '/beauty/fragrances' },
                { id: 8, name: 'Just Cavalli', price: 'UNDER ₹999', img: '/Landing/Just-Cavalli_luxe360x450.png', href: '/beauty/fragrances' },
                { id: 9, name: 'Giva Earrings', price: 'UNDER ₹499', img: '/Landing/givapalmonas web (2).png', href: '/women/jewellery' },
                { id: 10, name: 'Fresh Tops & Tunics', price: 'UNDER ₹399', img: '/Landing/WomenTopsTunics_NewInn26thMarch26.avif', href: '/women/tops' },
              ].map(product => (
                <a
                  key={product.id}
                  href={product.href}
                  style={{
                    minWidth: '180px', maxWidth: '180px',
                    background: '#ffffff',
                    border: '2px solid #fef3c7',
                    borderRadius: '16px', overflow: 'hidden',
                    transition: 'all 0.3s', cursor: 'pointer',
                    flexShrink: 0, position: 'relative',
                    color: 'inherit',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLAnchorElement).style.transform = 'none';
                    (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 12px 30px rgba(236,72,153,0.2)';
                    (e.currentTarget as HTMLAnchorElement).style.borderColor = '#ec4899';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLAnchorElement).style.transform = 'none';
                    (e.currentTarget as HTMLAnchorElement).style.boxShadow = 'none';
                    (e.currentTarget as HTMLAnchorElement).style.borderColor = '#fef3c7';
                  }}
                >
                  <div style={{
                    position: 'absolute', top: '10px', right: '10px',
                    background: '#f59e0b', color: 'white',
                    fontSize: '9px', fontWeight: '700',
                    padding: '3px 8px', borderRadius: '4px',
                    letterSpacing: '1px', zIndex: 2,
                  }}>NEW-IN</div>

                  <img
                    src={product.img}
                    alt={product.name}
                    style={{ width: '100%', height: '200px', objectFit: 'cover', display: 'block' }}
                  />

                  <div style={{ padding: '10px 12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: '#1f2937', marginBottom: '6px' }}>
                      {product.name}
                    </div>
                    <div style={{
                      fontSize: '13px', fontWeight: '700', color: '#ec4899',
                      borderTop: '2px solid #fef3c7', paddingTop: '8px'
                    }}>
                      {product.price}
                    </div>
                  </div>
                </a>
              ))}
            </div>

            <button
              onClick={() => (document.getElementById('newArrivalCarousel') as HTMLElement)?.scrollBy({ left: 250, behavior: 'smooth' })}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#ec4899'; (e.currentTarget as HTMLButtonElement).style.color = 'white'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#ffffff'; (e.currentTarget as HTMLButtonElement).style.color = '#ec4899'; }}
              style={{
                flexShrink: 0, width: '44px', height: '44px',
                borderRadius: '50%', border: '2px solid rgba(236,72,153,0.3)',
                background: '#ffffff', color: '#ec4899',
                fontSize: '18px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(236,72,153,0.15)',
                transition: 'all 0.2s',
              }}
            >→</button>
          </div>
        </section>

        {/* ── BRAND STORE SECTION ── */}
        <section className="landing-brand-section" style={{ padding: '40px 60px', background: '#ffffff', width: '100%' }}>
          <div className="landing-brand-shell" style={{ display: 'flex', alignItems: 'center', gap: '24px', width: '100%' }}>
            <div style={{ minWidth: '220px', paddingRight: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <img src="/icon.png" alt="Shopore" style={{ width: '40px', height: '40px', objectFit: 'contain', display: 'block' }} />
                <p style={{ fontFamily: 'Georgia, serif', fontSize: '28px', fontWeight: '800', letterSpacing: '4px', color: '#071225', lineHeight: 1, margin: 0 }}>SHOPORE</p>
              </div>
              <div style={{ background: '#1f2937', color: '#ffffff', display: 'inline-block', padding: '4px 16px', fontWeight: '700', fontSize: '18px', marginBottom: '12px' }}>
                STORE
              </div>
              <p style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937' }}>STARTING ₹499</p>
            </div>

            <div className="landing-brand-grid" style={{ display: 'grid', gridAutoFlow: 'column', placeContent: 'center', justifyContent: 'space-around', gap: '1.5rem', flex: 1, width: '100%' }}>
              {[
                { label: 'Women', img: '/Landing/Gift Card-women-web.png', href: '/women/western-wear' },
                { label: 'Men', img: '/Landing/Gift Card-men-web.png', href: '/men/topwear' },
                { label: 'Kids', img: '/Landing/Gift Card-kids-web.png', href: '/kids/boys-clothing' },
              ].map(({ label, img, href }) => (
                <a key={label} href={href} style={{ cursor: 'pointer', transition: 'transform 0.3s', display: 'block' }}
                  onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.transform = 'none'}
                  onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.transform = 'none'}
                >
                  <img src={img} alt={label} style={{ width: '280px', height: 'auto', display: 'block' }} />
                </a>
              ))}
            </div>
          </div>

          {/* TRUST BADGES */}
          <div className="landing-five-grid" style={{
            display: 'flex', justifyContent: 'space-around', alignItems: 'center',
            marginTop: '32px', background: '#f3f4f6', padding: '24px 60px',
            width: 'calc(100% + 120px)', marginLeft: '-60px',
          }}>
            {[
              { icon: 'https://storage.googleapis.com/images_cms_preprod_sscom/Seal_Check_3_c2b722ea0b/Seal_Check_3_c2b722ea0b.svg', label: '100% Authentic' },
              { icon: 'https://storage.googleapis.com/images_cms_preprod_sscom/Package_3_aa69851551/Package_3_aa69851551.svg', label: 'Fast Delivery' },
              { icon: 'https://storage.googleapis.com/images_cms_preprod_sscom/fi_16794062_2_44b8cdc150/fi_16794062_2_44b8cdc150.svg', label: 'Easy Return' },
              { icon: 'https://storage.googleapis.com/images_cms_preprod_sscom/Tag_e1dd8f15cb/Tag_e1dd8f15cb.svg', label: '2000+ brands' },
            ].map((badge, i) => (
              <div key={i} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                flex: 1, borderRight: i < 3 ? '1px solid #e5e7eb' : 'none',
              }}>
                <img src={badge.icon} alt={badge.label} width={32} height={32} style={{ display: 'block' }} />
                <span style={{ fontSize: '14px', color: '#374151', fontWeight: '500' }}>{badge.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── FEATURED PRODUCTS ── */}
        <section className="products-section">
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 style={{
              fontFamily: 'DM Sans, sans-serif',
              fontSize: 'clamp(28px, 3vw, 42px)',
              fontWeight: '700',
              color: '#1f2937',
            }}>Explore More On Shopore</h2>
          </div>

          {/* Row 1 */}
          <div className="landing-five-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '16px',
            marginBottom: '16px',
          }}>
            {[
              { img: '/Landing/Dresses-web.png', name: 'Dresses', href: '/women/dresses' },
              { img: '/Landing/Shirts-web.png', name: 'Shirts', href: '/men/casual-shirts' },
              { img: '/Landing/Denim-web.png', name: 'Denims', href: '/men/jeans' },
              { img: '/Landing/Kurta-web.png', name: 'Kurta & Suit Sets', href: '/women/indian-fusion-wear' },
              { img: '/Landing/Lingerie-web.png', name: 'Lingerie', href: '/women/lingerie-sleepwear' },
            ].map(item => (
              <a
                key={item.name}
                href={item.href}
                style={{ cursor: 'pointer', textAlign: 'center', transition: 'transform 0.3s', color: 'inherit', textDecoration: 'none' }}
                onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.transform = 'none'}
                onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.transform = 'none'}
              >
                <img src={item.img} alt={item.name} style={{ width: '100%', height: 'auto', display: 'block', borderRadius: '8px' }} />
                <p style={{ fontSize: '13px', color: '#1f2937', marginTop: '10px', fontWeight: '500' }}>{item.name}</p>
              </a>
            ))}
          </div>

          {/* Row 2 */}
          <div className="landing-trust-row" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '16px',
            alignItems: 'stretch',
          }}>
            {[
              { img: '/Landing/Watches-web.png', name: 'Watches', href: '/men/watches' },
              { img: '/Landing/Footwear-web.png', name: 'Footwear', href: '/men/footwear' },
              { img: '/Landing/Handbags-web.png', name: 'Handbags', href: '/women/handbags-bags-wallets' },
              { img: '/Landing/Makeup-web.png', name: 'Makeup', href: '/beauty/makeup' },
              { isExplore: true },
            ].map((item, i) => {
              if ('isExplore' in item) return (
                <a
                  key={i}
                  href="/explore"
                  style={{
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'transform 0.3s',
                    display: 'flex',
                    flexDirection: 'column',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.transform = 'none'}
                  onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.transform = 'none'}
                >
                  <img
                    src="https://storage.googleapis.com/images_cms_preprod_sscom/Explore_more_1_c0730c1191/Explore_more_1_c0730c1191.png"
                    alt="Explore More"
                    style={{ width: '100%', height: 'auto', display: 'block', borderRadius: '8px' }}
                  />
                </a>
              );

              return (
                <a
                  key={(item as any).name}
                  href={(item as any).href}
                  style={{
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'transform 0.3s',
                    display: 'flex',
                    flexDirection: 'column',
                    color: 'inherit',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.transform = 'none'}
                  onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.transform = 'none'}
                >
                  <img
                    src={(item as any).img}
                    alt={(item as any).name}
                    style={{ width: '100%', height: 'auto', display: 'block', borderRadius: '8px' }}
                  />
                  <p style={{ fontSize: '13px', color: '#1f2937', marginTop: '10px', fontWeight: '500' }}>
                    {(item as any).name}
                  </p>
                </a>
              );
            })}
          </div>
        </section>

        {/* ── MEGA MENU MODAL ── */}
        {showMenu && (
          <div
            onClick={() => setShowMenu(false)}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,0.4)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'center',
              paddingTop: '80px',
            }}
          >
            <div
              onClick={e => e.stopPropagation()}
              style={{
                background: 'linear-gradient(135deg, rgba(255, 245, 250, 0.94), rgba(255,255,255,0.98))',
                borderRadius: '20px',
                width: '84%',
                maxWidth: '900px',
                maxHeight: '80vh',
                overflowY: 'auto',
                display: 'flex',
                position: 'relative',
                border: '1px solid rgba(236,72,153,0.18)',
                backdropFilter: 'blur(24px)',
                boxShadow: '0 30px 90px rgba(236,72,153,0.18)',
              }}
            >
              {/* Left sidebar */}
              {/* <div style={{ minWidth: '150px', borderRight: '1px solid rgba(236,72,153,0.12)', padding: '16px 0' }}>
                {menuTabs.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedMenu(cat)}
                    style={{
                      width: '100%',
                      padding: '14px 20px',
                      fontSize: '15px',
                      fontWeight: selectedMenu === cat ? 700 : 600,
                      color: selectedMenu === cat ? '#ec4899' : '#1f2937',
                      cursor: 'pointer',
                      border: 'none',
                      textAlign: 'left',
                      background: selectedMenu === cat ? 'rgba(236,72,153,0.12)' : 'transparent',
                      borderLeft: selectedMenu === cat ? '4px solid #ec4899' : '4px solid transparent',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => {
                      if (selectedMenu !== cat) {
                        (e.currentTarget as HTMLButtonElement).style.background = 'rgba(236,72,153,0.08)';
                        (e.currentTarget as HTMLButtonElement).style.color = '#ec4899';
                      }
                    }}
                    onMouseLeave={e => {
                      if (selectedMenu !== cat) {
                        (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                        (e.currentTarget as HTMLButtonElement).style.color = '#1f2937';
                      }
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div> */}

              {/* Right content */}
              {/* <div style={{ padding: '16px 20px', flex: 1, display: 'grid', gridTemplateColumns: 'repeat(4, minmax(130px, 1fr))', gap: '16px' }}>
                {menuData[selectedMenu].map(group => (
                  <div key={group.title}>
                    <p style={{ fontSize: '13px', fontWeight: '700', color: '#1f2937', marginBottom: '10px' }}>{group.title}</p>
                    {group.items.map(it => (
                      <p
                        key={it}
                        style={{ fontSize: '13px', color: '#6b7280', marginBottom: '6px', cursor: 'pointer', transition: 'color 0.2s' }}
                        onMouseEnter={e => (e.currentTarget as HTMLParagraphElement).style.color = '#ec4899'}
                        onMouseLeave={e => (e.currentTarget as HTMLParagraphElement).style.color = '#6b7280'}
                      >
                        {it}
                      </p>
                    ))}
                  </div>
                ))}
              </div> */}

              {/* Close button */}
              <button
                onClick={() => setShowMenu(false)}
                style={{
                  position: 'absolute', top: '12px', right: '12px',
                  background: '#f3f4f6', border: 'none',
                  borderRadius: '50%', width: '36px', height: '36px',
                  fontSize: '18px', cursor: 'pointer', color: '#6b7280',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >×</button>
            </div>
          </div>
        )}

      </div>
    </>
  );
}
