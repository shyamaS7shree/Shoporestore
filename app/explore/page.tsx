'use client';

import { useEffect, useState } from 'react';

const carouselSlides = [
    { src: '/Fratini_Hero-Carousal-web.png', alt: 'Fratini', href: '/women/western-wear' },
    { src: '/Stop_Hero-Carousal-web.png', alt: 'Stop', href: '/men/topwear' },
    { src: '/Kashish_Hero-Carousal-web.png', alt: 'Kashish', href: '/women/indian-fusion-wear' },
];

const limitedSlides = [
    { src: '/globaldesi web.png', alt: 'Global Desi', href: '/women/indian-fusion-wear' },
    { src: '/span web.png', alt: 'Span', href: '/women/western-wear' },
    { src: '/autumnlane web.png', alt: 'Autumn Lane', href: '/women/kurtis-tops' },
    { src: '/juniper web.png', alt: 'Juniper', href: '/women/western-wear' },
];

export default function ExplorePage() {
    const [current, setCurrent] = useState(0);
    const [limitedCurrent, setLimitedCurrent] = useState(0);

    // Hero carousel auto-slide
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrent(prev => (prev + 1) % carouselSlides.length);
        }, 10000);
        return () => clearInterval(timer);
    }, []);

    // Limited Time carousel auto-slide
    useEffect(() => {
        const timer = setInterval(() => {
            setLimitedCurrent(prev => (prev + 1) % limitedSlides.length);
        }, 10000);
        return () => clearInterval(timer);
    }, []);

    const goTo = (index: number) => setCurrent(index);
    const prev = () => setCurrent(p => (p - 1 + carouselSlides.length) % carouselSlides.length);
    const next = () => setCurrent(p => (p + 1) % carouselSlides.length);

    return (
        <main style={{ minHeight: '100vh', background: '#ffffff', paddingTop: '38px', margin: 0 }}>

            <style>{`
        @keyframes progress {
          from { width: 0%; }
          to   { width: 100%; }
        }
        .carousel-img {
          width: 100%;
          height: auto;
          display: block;
          object-fit: cover;
          vertical-align: middle;
        }
        #stealCarousel::-webkit-scrollbar { display: none; }
        #limitedCarousel::-webkit-scrollbar { display: none; }
        .explore-container { width: 85%; margin: 0 auto; }
        .discount-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 12px; }
        .deal-row { display: flex; gap: 12px; width: 100%; }
        @media (max-width: 768px) {
          .explore-container { width: calc(100% - 32px); }
          .discount-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .deal-row { overflow-x: auto; padding-bottom: 8px; scroll-snap-type: x mandatory; }
          .deal-row > a { min-width: 72%; scroll-snap-align: start; }
          .carousel-img { min-height: 90px; object-fit: cover; }
        }
      `}</style>

            {/* ── BANNER ── */}
            <section style={{ width: '100%', background: '#fff', margin: 0, padding: 0, lineHeight: 0 }}>
                <div className="explore-container">
                    <a href="/explore" style={{ display: 'block', cursor: 'pointer' }}>
                        <img
                            src="/banner.png"
                            alt="Blockbuster Bargains"
                            className="carousel-img"
                        />
                    </a>
                </div>
            </section>

            {/* ── HERO CAROUSEL ── */}
            <section style={{ width: '100%', background: '#fff', padding: '16px 0 0' }}>
                <div className="explore-container">

                    <div style={{ position: 'relative', overflow: 'hidden' }}>
                        {/* Slides track */}
                        <div style={{
                            display: 'flex',
                            transition: 'transform 0.7s cubic-bezier(0.77,0,0.18,1)',
                            transform: `translateX(-${current * 100}%)`,
                        }}>
                            {carouselSlides.map((slide, i) => (
                                <a key={i} href={slide.href} style={{ minWidth: '100%', lineHeight: 0, display: 'block', cursor: 'pointer' }}>
                                    <img src={slide.src} alt={slide.alt} className="carousel-img" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Dots */}
                    <div style={{
                        display: 'flex', justifyContent: 'center',
                        alignItems: 'center', gap: '6px',
                        padding: '12px 0 24px',
                    }}>
                        {carouselSlides.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => goTo(i)}
                                aria-label={`Slide ${i + 1}`}
                                style={{
                                    width: i === current ? '24px' : '7px',
                                    height: '3px', borderRadius: '2px',
                                    background: i === current ? '#1f2937' : '#d1d5db',
                                    border: 'none', cursor: 'pointer',
                                    transition: 'all 0.35s ease', padding: 0,
                                }}
                            />
                        ))}
                    </div>

                </div>
            </section>

            {/* ── FLAT DISCOUNT ── */}
            <section style={{ width: '100%', background: '#f3f4f6', padding: '40px 0', marginTop: '8px' }}>
                <div className="explore-container">
                    <h2 style={{
                        textAlign: 'center', fontSize: '22px', fontWeight: '700',
                        color: '#111827', marginBottom: '24px',
                        fontFamily: 'DM Sans, sans-serif',
                    }}>Everything On Flat Discount</h2>

                    <div className="discount-grid">
                        {['70', '60', '50', '40', '30', '20'].map(val => (
                            <a
                                key={val}
                                href="/explore"
                                style={{
                                    background: '#ffffff', borderRadius: '12px',
                                    padding: '22px 26px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    cursor: 'pointer',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                                    transition: 'box-shadow 0.2s',
                                }}
                                onMouseEnter={e => {
                                    (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 8px 20px rgba(0,0,0,0.12)';
                                }}
                                onMouseLeave={e => {
                                    (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
                                }}
                            >
                                <img
                                    src={`/${val}_brand-cards.png`}
                                    alt={`${val}% OFF`}
                                    loading="lazy"
                                    style={{ width: '100%', height: 'auto', display: 'block' }}
                                />
                            </a>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── BIGGEST STEAL DEAL ── */}
            <section style={{ width: '100%', background: '#ffffff', padding: '40px 0' }}>
                <div className="explore-container">

                    {/* Heading */}
                    <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '6px' }}>
                            <div style={{ height: '1px', width: '60px', background: '#c0392b' }} />
                            <h2 style={{
                                fontSize: '40px', fontWeight: '800',
                                color: '#c0392b', margin: 0,
                                fontFamily: 'DM Sans, sans-serif', letterSpacing: '1px',
                            }}>BIGGEST</h2>
                            <div style={{ height: '1px', width: '60px', background: '#c0392b' }} />
                        </div>
                        <p style={{
                            fontSize: '20px', fontWeight: '600',
                            color: '#c0392b', letterSpacing: '3px',
                            textTransform: 'uppercase', margin: 0,
                            fontFamily: 'DM Sans, sans-serif',
                        }}>STEAL DEAL</p>
                    </div>

                    {/* Cards — full width, no scroll */}
                    <div className="deal-row" style={{
                        display: 'flex',
                        gap: '12px',
                        width: '100%',
                    }}>
                        {[
                            { src: '/Bandeya-web.png', alt: 'Bandeya', href: '/men/topwear' },
                            { src: '/Hautecurry-web.png', alt: 'Hautecurry', href: '/women/jewellery' },
                            { src: '/Homestop_Biggest-Steal-Deal-web.png', alt: 'HomeStop', href: '/home/home-bath' },
                            { src: '/Altlife-web.png', alt: 'Altlife', href: '/men/sports-active-wear' },
                            { src: '/insense web.png', alt: 'Insense', href: '/beauty/fragrances' },
                        ].map((card, i) => (
                            <a
                                key={i}
                                href={card.href}
                                style={{
                                    flex: 1,
                                    borderRadius: '12px', overflow: 'hidden',
                                    border: '1px solid #f3f4f6',
                                    cursor: 'pointer',
                                    transition: 'box-shadow 0.2s',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                                }}
                                onMouseEnter={e => {
                                    (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 10px 24px rgba(0,0,0,0.12)';
                                }}
                                onMouseLeave={e => {
                                    (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
                                }}
                            >
                                <img
                                    src={card.src} alt={card.alt} loading="lazy"
                                    style={{ width: '100%', height: 'auto', display: 'block' }}
                                />
                            </a>
                        ))}
                    </div>

                </div>
            </section>

            {/* ── LIMITED TIME UNLIMITED STYLE ── */}
            <section style={{ width: '100%', background: '#ffffff', padding: '40px 0' }}>
                <div className="explore-container">

                    {/* Heading */}
                    <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '6px' }}>
                            <div style={{ height: '1px', width: '60px', background: '#000000' }} />
                            <h2 style={{
                                fontSize: '40px', fontWeight: '800',
                                color: '#000000', margin: 0,
                                fontFamily: 'DM Sans, sans-serif', letterSpacing: '1px',
                            }}>LIMITED TIME</h2>
                            <div style={{ height: '1px', width: '60px', background: '#000000' }} />
                        </div>
                        <p style={{
                            fontSize: '20px', fontWeight: '600',
                            color: '#000000', letterSpacing: '3px',
                            textTransform: 'uppercase', margin: 0,
                            fontFamily: 'DM Sans, sans-serif',
                        }}>UNLIMITED STYLE</p>
                    </div>

                    {/* Auto Slider */}
                    <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '12px', border: '1px solid #f3e0e0' }}>

                        {/* Slides track */}
                        <div style={{
                            display: 'flex',
                            transition: 'transform 0.7s cubic-bezier(0.77,0,0.18,1)',
                            transform: `translateX(-${limitedCurrent * 100}%)`,
                        }}>
                            {limitedSlides.map((slide, i) => (
                                <a key={i} href={slide.href} style={{ minWidth: '100%', lineHeight: 0, display: 'block', cursor: 'pointer' }}>
                                    <img
                                        src={slide.src} alt={slide.alt} loading="lazy"
                                        style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover' }}
                                    />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Dots */}
                    <div style={{
                        display: 'flex', justifyContent: 'center',
                        alignItems: 'center', gap: '6px',
                        padding: '12px 0 0',
                    }}>
                        {limitedSlides.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setLimitedCurrent(i)}
                                aria-label={`Slide ${i + 1}`}
                                style={{
                                    width: i === limitedCurrent ? '24px' : '7px',
                                    height: '3px', borderRadius: '2px',
                                    background: i === limitedCurrent ? '#1f2937' : '#d1d5db',
                                    border: 'none', cursor: 'pointer',
                                    transition: 'all 0.35s ease', padding: 0,
                                }}
                            />
                        ))}
                    </div>

                </div>
            </section>
            {/* ── GLAM TREATS FOR YOU ── */}
            <section style={{ width: '100%', background: '#ffffff', padding: '40px 0' }}>
                <div className="explore-container">

                    {/* Heading */}
                    <h2 style={{
                        textAlign: 'center', fontSize: '33px', fontWeight: '700',
                        color: '#111827', marginBottom: '24px',
                        fontFamily: 'DM Sans, sans-serif',
                    }}>Glam Treats For You</h2>

                    {/* Carousel */}
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '12px' }}>

                        {/* Left Arrow */}
                        <button
                            onClick={() => (document.getElementById('glamCarousel') as HTMLElement)?.scrollBy({ left: -250, behavior: 'smooth' })}
                            style={{
                                flexShrink: 0, width: '36px', height: '36px',
                                borderRadius: '50%', border: '1px solid #d1d5db',
                                background: '#fff', color: '#374151',
                                fontSize: '18px', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                transition: 'all 0.2s', alignSelf: 'center',
                            }}
                            onMouseEnter={e => {
                                (e.currentTarget as HTMLButtonElement).style.background = '#ec4899';
                                (e.currentTarget as HTMLButtonElement).style.color = '#fff';
                                (e.currentTarget as HTMLButtonElement).style.borderColor = '#ec4899';
                            }}
                            onMouseLeave={e => {
                                (e.currentTarget as HTMLButtonElement).style.background = '#fff';
                                (e.currentTarget as HTMLButtonElement).style.color = '#374151';
                                (e.currentTarget as HTMLButtonElement).style.borderColor = '#d1d5db';
                            }}
                        >‹</button>

                        {/* Cards */}
                        <div
                            id="glamCarousel"
                            style={{
                                display: 'flex', gap: '12px',
                                overflowX: 'auto', scrollBehavior: 'smooth',
                                scrollbarWidth: 'none', flex: 1, width: 0,
                            }}
                        >
                            {[
                                { src: '/maybelline web.png', alt: 'Maybelline', href: '/beauty/makeup' },
                                { src: '/loreal web.png', alt: "L'Oreal", href: '/beauty/makeup' },
                                { src: '/sugar web.png', alt: 'Sugar', href: '/beauty/makeup' },
                                { src: '/colorbar web.png', alt: 'Colorbar', href: '/beauty/makeup' },
                                { src: '/revlon web.png', alt: 'Revlon', href: '/beauty/makeup' },
                                { src: '/chambor web.png', alt: 'Chambor', href: '/beauty/makeup' },
                            ].map((card, i) => (
                                <a
                                    key={i}
                                    href={card.href}
                                    style={{
                                        minWidth: '200px', maxWidth: '200px',
                                        borderRadius: '12px', overflow: 'hidden',
                                        border: '1px solid #f3f4f6',
                                        cursor: 'pointer', flexShrink: 0,
                                        transition: 'box-shadow 0.2s',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                                    }}
                                    onMouseEnter={e => {
                                        (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 10px 24px rgba(0,0,0,0.12)';
                                    }}
                                    onMouseLeave={e => {
                                        (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
                                    }}
                                >
                                    <img
                                        src={card.src} alt={card.alt} loading="lazy"
                                        style={{ width: '100%', height: 'auto', display: 'block' }}
                                    />
                                </a>
                            ))}
                        </div>

                        {/* Right Arrow */}
                        <button
                            onClick={() => (document.getElementById('glamCarousel') as HTMLElement)?.scrollBy({ left: 250, behavior: 'smooth' })}
                            style={{
                                flexShrink: 0, width: '36px', height: '36px',
                                borderRadius: '50%', border: '1px solid #d1d5db',
                                background: '#fff', color: '#374151',
                                fontSize: '18px', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                transition: 'all 0.2s', alignSelf: 'center',
                            }}
                            onMouseEnter={e => {
                                (e.currentTarget as HTMLButtonElement).style.background = '#ec4899';
                                (e.currentTarget as HTMLButtonElement).style.color = '#fff';
                                (e.currentTarget as HTMLButtonElement).style.borderColor = '#ec4899';
                            }}
                            onMouseLeave={e => {
                                (e.currentTarget as HTMLButtonElement).style.background = '#fff';
                                (e.currentTarget as HTMLButtonElement).style.color = '#374151';
                                (e.currentTarget as HTMLButtonElement).style.borderColor = '#d1d5db';
                            }}
                        >›</button>

                    </div>
                </div>
            </section>
            {/* ── GRAB THE BEST BARGAINS ── */}
            <section style={{ width: '100%', background: '#ffffff', padding: '40px 0' }}>
                <div className="explore-container">

                    <h2 style={{
                        textAlign: 'center', fontSize: '33px', fontWeight: '700',
                        color: '#111827', marginBottom: '24px',
                        fontFamily: 'DM Sans, sans-serif',
                    }}>Grab the Best Bargains</h2>

                    <div className="deal-row" style={{
                        display: 'flex',
                        gap: '12px',
                        width: '100%',
                    }}>
                        {[
                            { src: '/Bedsheets-web.png', alt: 'Bedsheets', href: '/home/home-bath' },
                            { src: '/Cookware-web.png', alt: 'Cookware', href: '/home/kitchen-table' },
                            { src: '/Decor-web.png', alt: 'Decor', href: '/home/home-decor' },
                            { src: '/Cusion-&-Curtains-web.png', alt: 'Cushions & Curtains', href: '/home/furnishing' },
                            { src: '/Dining-web.png', alt: 'Dining', href: '/home/kitchen-table' },
                        ].map((card, i) => (
                            <a
                                key={i}
                                href={card.href}
                                style={{
                                    flex: 1,
                                    borderRadius: '12px', overflow: 'hidden',
                                    border: '1px solid #f3f4f6',
                                    cursor: 'pointer',
                                    transition: 'box-shadow 0.2s',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                                }}
                                onMouseEnter={e => {
                                    (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 10px 24px rgba(0,0,0,0.12)';
                                }}
                                onMouseLeave={e => {
                                    (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
                                }}
                            >
                                <img
                                    src={card.src} alt={card.alt} loading="lazy"
                                    style={{ width: '100%', height: 'auto', display: 'block' }}
                                />
                            </a>
                        ))}
                    </div>

                </div>
            </section>
            <section style={{ width: '100%', background: '#ffffff', padding: '0 0 40px' }}>
                <div style={{
                    background: '#f3f4f6',
                    padding: '28px 60px',
                    width: 'min(85%, calc(100% - 32px))',
                    marginLeft: 'auto',
                    marginRight: 'auto',
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                        {[
                            { icon: 'https://storage.googleapis.com/images_cms_preprod_sscom/Seal_Check_3_c2b722ea0b/Seal_Check_3_c2b722ea0b.svg', label: '100% Authentic' },
                            { icon: 'https://storage.googleapis.com/images_cms_preprod_sscom/fi_16794062_2_44b8cdc150/fi_16794062_2_44b8cdc150.svg', label: 'Easy Return' },
                            { icon: 'https://storage.googleapis.com/images_cms_preprod_sscom/Package_3_aa69851551/Package_3_aa69851551.svg', label: 'Fast Delivery' },
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
                </div>
            </section>


        </main>
    );
}
