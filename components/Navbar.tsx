'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Bell, Menu, Search, ShoppingCart, User, X } from 'lucide-react';
import { toast } from 'sonner';
import { apiFetch, getUser, logout } from '@/lib/api';
import { CartItem, getCartCount, getCartEventName, readCart } from '@/lib/cart';
import AuthModal from '@/components/AuthModal';
import {
  getNotifications,
  markNotificationsRead,
  NOTIFICATIONS_EVENT,
  ShoporeNotification,
} from '@/lib/notifications';

const dropdownLinkStyle: React.CSSProperties = {
  display: 'block',
  padding: '6px 0',
  color: '#374151',
  fontSize: '13px',
  textDecoration: 'none',
  transition: 'color 0.15s',
};

const profileMenuItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '12px 18px',
  color: '#334155',
  textDecoration: 'none',
  fontFamily: 'Inter, DM Sans, sans-serif',
  fontSize: '14px',
  fontWeight: 600,
  letterSpacing: '0.01em',
  lineHeight: 1,
  transition: 'background 0.16s ease, color 0.16s ease, transform 0.16s ease',
};

const profileMenuIconStyle: React.CSSProperties = {
  width: '20px',
  height: '20px',
  objectFit: 'contain',
  flexShrink: 0,
};

const MEN_MENU = [
  { category: 'Topwear', items: ['T-Shirts', 'Casual Shirts', 'Formal Shirts', 'Jackets', 'Blazers & Coats',] },
  { category: 'Indian & Festive Wear', items: ['Kurtas & Kurta Sets', 'Sherwanis', 'Nehru Jackets',] },
  { category: 'Bottomwear', items: ['Jeans', 'Formal Trousers', 'Shorts', 'Track Pants & Joggers'] },
  { category: 'Innerwear & Sleepwear', items: ['Briefs & Trunks', 'Boxers', 'Vests', 'Thermals'] },
  { category: 'Plus Size', items: [], isLink: true },
  { category: 'Footwear', items: ['Casual Shoes', 'Formal Shoes', 'Sneakers', 'Socks'] },
  { category: 'Personal Care & Grooming', items: [], isLink: true },
  { category: 'Sunglasses & Frames', items: [], isLink: true },
  { category: 'Watches', items: [], isLink: true },
  { category: 'Sports & Active Wear', items: ['Sports Shoes', 'Active T-Shirts', 'Sports Accessories', 'Swimwear'] },
  { category: 'Fashion Accessories', items: ['Wallets', 'Belts', 'Perfumes & Body Mists'] },
];

const WOMEN_MENU = [
  { category: 'Indian & Fusion Wear', items: ['Kurtas & Suits', 'Kurtis & Tops', 'Sarees', 'Ethnic Wear', 'Leggings,', 'Skirts & Palazzos', 'Dupattas', 'Jackets'] },
  { category: 'Belts, Scarves ', items: [], isLink: true },
  { category: 'Watches & Wearables', items: [], isLink: true },
  { category: 'Western Wear', items: ['Dresses', 'Tops', 'Tshirts', 'Jeans', 'Trousers & Capris', 'Sweaters & Sweatshirts', 'Jackets & Coats', 'Blazers & Waistcoats'] },
  { category: 'Plus Size', items: [], isLink: true },
  { category: 'Sunglasses & Frames', items: [], isLink: true },
  { category: 'Sports & Active Wear', items: ['Footwear', 'Sports Accessories', 'Sports Equipment'] },
  { category: 'Lingerie & Sleepwear', items: ['Bra', 'Shapewear', 'Sleepwear & Loungewear',] },
  { category: 'Beauty & Personal Care', items: ['Makeup', 'Skincare', 'Premium Beauty', 'Lipsticks',] },
  { category: 'Jewellery', items: ['Fashion Jewellery', 'Fine Jewellery'] },
  { category: 'Handbags, Bags & Wallets', items: [], isLink: true },
];

const KIDS_MENU = [
  { category: 'Boys Clothing', items: ['T-Shirts', 'Shirts', 'Clothing Sets', 'Ethnic Wear'] },
  { category: 'Girls Clothing', items: ['Dresses', 'Tops', 'Tshirts', 'Ethnic Wear'] },
  { category: 'Footwear', items: ['Casual Shoes', 'Flipflops', 'Sports Shoes', 'Flats',] },
  { category: 'Toys & Games', items: ['Learning & Development', 'Activity Toys', 'Soft Toys',] },
  { category: 'Infants', items: ['Bodysuits', 'Rompers & Sleepsuits', 'Clothing Sets', 'Dresses',] },
  { category: 'Home & Bath', items: [], isLink: true },
  { category: 'Personal Care', items: [], isLink: true },
];

const HOME_MENU = [
  { category: 'Bed Linen & Furnishing', items: ['Bed Sheets', 'Mattress Protectors', 'Blankets, Quilts & Dohars', 'Pillows & Pillow Covers', 'Bed Covers', 'Diwan Sets', 'Chair Pads & Covers', 'Sofa Covers'] },
  { category: 'Flooring', items: ['Floor Runners', 'Carpets', 'Floor Mats & Dhurries', 'Door Mats'] },
  { category: 'Bath', items: ['Bath Towels', 'Hand & Face Towels', 'Beach Towels', 'Towels Set','Shower Curtains'] },
  { category: 'Lamps & Lighting', items: ['Floor Lamps', 'Ceiling Lamps', 'Table Lamps', 'Wall Lamps',] },
  { category: 'Home Décor', items: ['Clocks', 'Mirrors', 'Pooja Essentials', 'Wall Shelves', 'Fountains', 'Showpieces & Vases', 'Ottoman'] },
  { category: 'Cushions & Cushion Covers', items: [], isLink: true },
  { category: 'Home Gift Sets', items: [], isLink: true },
  { category: 'Kitchen & Table', items: ['Dinnerware & Serveware', 'Cups and Mugs',  'Bar & Drinkware', 'Table Covers & Furnishings'] },
  { category: 'Storage', items: ['Bins', 'Hangers', 'Organisers', ] },
];

const BEAUTY_MENU = [
  { category: 'Makeup', items: ['Lipstick', 'Lip Gloss', 'Lip Liner', 'Mascara', 'Eyeliner', 'Kajal'] },
  { category: 'Skincare, Bath & Body', items: ['Face Moisturiser', 'Cleanser', 'Masks & Peel'] },
  { category: 'Baby Care', items: [], isLink: true },
  { category: 'Masks', items: [], isLink: true },
  { category: 'Haircare', items: ['Shampoo', 'Conditioner', 'Hair Cream', 'Hair Oil', 'Hair Gel', 'Hair Color', 'Hair Serum', 'Hair Accessory'] },
  { category: 'Fragrances', items: ['Perfume', 'Deodorant', 'Body Mist'] },
  { category: 'Appliances', items: ['Hair Straightener', 'Hair Dryer', 'Epilator'] },
  { category: "Men's Grooming", items: ['Trimmers', 'Beard Oil', 'Hair Wax'] },
  { category: 'Beauty Gift & Makeup Set', items: ['Beauty Gift', 'Makeup Kit'] },
];

const GENZ_MENU = [
  { category: "Women's Western Wear", items: ['Dresses Under ', 'Tops Under ', 'Jeans Under ', 'Trousers Under ', 'T-shirts Under '] },
  { category: 'Lingerie & Loungewear', items: ['Bras Under ', 'Night suits Under ', 'Nightdresses Under '] },
  { category: "Men's Casual Wear", items: ['T-shirts Under ', 'Shirts Under', 'Jeans Under '] },
  { category: "Men's Occassion Wear", items: ['Kurtas Under ', 'Kurta Sets Under '] },
  { category: "Women's Footwear", items: ['Heels Under ', 'Flats Under ', 'Casual shoes Under ', 'Sports shoes Under ', 'Flip flops Under ', 'Boots Under ', 'Ballerinas Under '] },
  { category: "Men's Footwear", items: ['Casual shoes Under ', 'Sports shoes Under ', 'Formal shoes Under ', 'Sandals Under ', 'Flip flops Under ', 'Boots Under '] },
  { category: 'Beauty & Grooming', items: ['Skincare Under ', 'Haircare Under ', 'Bath & Body Under ', 'MakeUp Under ', 'Fragrances Under ', 'Appliances Under '] },
  { category: 'Accessories', items: ['Jewellery Under ', 'Handbags Under ', 'Clutches Under ', 'Backpacks Under ', 'Wallets Under ', 'Sunglasses Under ', 'Belts Under ', 'Caps Under '] },
];

type MenuName = 'men' | 'women' | 'kids' | 'home' | 'beauty' | 'genz';
type NavUser = { id?: string; fullName?: string; name?: string; email?: string; phone?: string };
type ChatMessage = { role: 'bot' | 'user'; text: string };
const AUTH_TOAST_KEY = 'shopore_pending_auth_toast';

const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  {
    role: 'bot',
    text: 'Hi! I can help with shopping, orders, returns, payment, delivery, login, wishlist, and bag questions.',
  },
];

const CHAT_SUGGESTIONS = ['Track my order', 'Cancel order', 'Refund time', 'Size return'];

const userScopedKey = (baseKey: string, user?: NavUser | null) => {
  const userKey = user?.id || user?.email;
  return userKey ? `${baseKey}:${userKey}` : baseKey;
};

const MENU_COLORS: Record<MenuName, string> = {
  men: '#ec4899',
  women: '#ec4899',
  kids: '#f97316',
  home: '#eab308',
  beauty: '#14b8a6',
  genz: '#14b8a6',
};

const slugifyMenuLabel = (value: string) =>
  value
    .toLowerCase()
    .replace(/₹|â‚¹/g, 'rs ')
    .replace(/\s+&\s+/g, '-')
    .replace(/[\s,]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [activeMenu, setActiveMenu] = useState<MenuName | null>(null);
  const [pendingMenu, setPendingMenu] = useState<MenuName | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [bagOpen, setBagOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<ShoporeNotification[]>([]);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState('');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const closeTimer = useRef<number | null>(null);
  const chatMessagesRef = useRef<HTMLDivElement | null>(null);
  const lastPathnameRef = useRef(pathname);
  const [currentUser, setCurrentUser] = useState<NavUser | null>(null);
  const [profileAvatar, setProfileAvatar] = useState<string | null>(null);

  useEffect(() => {
    if (lastPathnameRef.current === pathname) return;

    lastPathnameRef.current = pathname;
    setPendingMenu(null);
    setChatOpen(false);
    setChatError('');
    setChatInput('');
  }, [pathname]);

  useEffect(() => {
    if (!chatOpen || !chatMessagesRef.current) return;

    const scrollFrame = window.requestAnimationFrame(() => {
      const messageList = chatMessagesRef.current;
      if (messageList) {
        messageList.scrollTop = messageList.scrollHeight;
      }
    });

    return () => window.cancelAnimationFrame(scrollFrame);
  }, [chatMessages, chatLoading, chatOpen]);

  useEffect(() => {
    const loadUserProfile = () => {
      const user = getUser();
      setCurrentUser(user);
      setProfileAvatar(user ? localStorage.getItem(userScopedKey('shopore_avatar', user)) : null);
      setNotifications(getNotifications(user?.id));
    };

    loadUserProfile();
    const pendingToast = localStorage.getItem(AUTH_TOAST_KEY);
    if (pendingToast) {
      localStorage.removeItem(AUTH_TOAST_KEY);
      toast.success(pendingToast);
    }

    const updateUserProfile = () => {
      loadUserProfile();
    };

    window.addEventListener('storage', updateUserProfile);
    window.addEventListener('shopore-avatar-updated', updateUserProfile);
    window.addEventListener(NOTIFICATIONS_EVENT, updateUserProfile);

    return () => {
      window.removeEventListener('storage', updateUserProfile);
      window.removeEventListener('shopore-avatar-updated', updateUserProfile);
      window.removeEventListener(NOTIFICATIONS_EVENT, updateUserProfile);
    };
  }, []);

  const handleLogout = () => {
    localStorage.setItem(AUTH_TOAST_KEY, 'Logout successfully');
    logout();
    window.location.reload();
  };

  useEffect(() => {
    const updateCartCount = () => {
      setCartCount(getCartCount());
      setCartItems(readCart());
    };

    updateCartCount();
    window.addEventListener(getCartEventName(), updateCartCount);
    window.addEventListener('storage', updateCartCount);

    return () => {
      window.removeEventListener(getCartEventName(), updateCartCount);
      window.removeEventListener('storage', updateCartCount);
    };
  }, []);

  const userFirstName = currentUser?.fullName?.split(' ')[0] || currentUser?.email?.split('@')[0] || 'there';
  const bagSubtotal = cartItems.reduce((total, item) => total + item.product.price * item.quantity, 0);
  const unreadNotifications = notifications.filter((notification) => !notification.read).length;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMenuEnter = (menuName: MenuName) => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
    }
    setActiveMenu(menuName);
  };

  const handleMenuLeave = () => {
    closeTimer.current = window.setTimeout(() => setActiveMenu(null), 120);
  };

  const openProfileMenu = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
    }
    setProfileOpen(true);
  };

  const closeProfileMenu = () => {
    closeTimer.current = window.setTimeout(() => setProfileOpen(false), 180);
  };

  const handleNotificationsClick = () => {
    if (!currentUser?.id) {
      setAuthModalOpen(true);
      return;
    }

    setActiveMenu(null);
    setProfileOpen(false);
    setChatOpen(false);
    setBagOpen(false);

    const nextOpen = !notificationsOpen;
    setNotificationsOpen(nextOpen);

    if (nextOpen) {
      markNotificationsRead(currentUser.id);
      setNotifications(getNotifications(currentUser.id));
    }
  };

  const navItems: Array<{ label: string; href: string; hasMega?: boolean; menuName?: MenuName }> = [
    { label: 'Men', href: '/men/topwear', hasMega: true, menuName: 'men' },
    { label: 'Women', href: '/women', hasMega: true, menuName: 'women' },
    { label: 'Kids', href: '/kids/boys-clothing', hasMega: true, menuName: 'kids' },
    { label: 'Home', href: '/home', hasMega: true, menuName: 'home' },
    { label: 'Beauty', href: '/beauty/makeup', hasMega: true, menuName: 'beauty' },
    { label: 'GenZ', href: '/genz/fashion', hasMega: true, menuName: 'genz' },
  ];

  const isDepartmentSelected = (menuName?: MenuName) =>
    Boolean(menuName && (pendingMenu === menuName || pathname === `/${menuName}` || pathname.startsWith(`/${menuName}/`)));

  const menCols = [MEN_MENU.slice(0, 2), MEN_MENU.slice(2, 5), MEN_MENU.slice(5, 9), MEN_MENU.slice(9, 11), MEN_MENU.slice(11, 14)];
  const womenCols = [WOMEN_MENU.slice(0, 3), WOMEN_MENU.slice(3, 6), WOMEN_MENU.slice(6, 9), WOMEN_MENU.slice(9, 12)];
  const kidsCols = [KIDS_MENU.slice(0, 2), KIDS_MENU.slice(2, 4), KIDS_MENU.slice(4, 7), KIDS_MENU.slice(7, 9)];
  const homeCols = [HOME_MENU.slice(0, 2), HOME_MENU.slice(2, 4), HOME_MENU.slice(4, 7), HOME_MENU.slice(7, 9), HOME_MENU.slice(9, 11)];
  const beautyCols = [BEAUTY_MENU.slice(0, 4), BEAUTY_MENU.slice(4, 6), BEAUTY_MENU.slice(6, 9), BEAUTY_MENU.slice(9, 12)];
  const genzCols = [GENZ_MENU.slice(0, 3), GENZ_MENU.slice(3, 5), GENZ_MENU.slice(5, 7), GENZ_MENU.slice(7, 9)];

  const getMenuCols = (menu: MenuName) => {
    switch (menu) {
      case 'men': return { cols: menCols, count: 5 };
      case 'women': return { cols: womenCols, count: 4 };
      case 'kids': return { cols: kidsCols, count: 4 };
      case 'home': return { cols: homeCols, count: 5 };
      case 'beauty': return { cols: beautyCols, count: 4 };
      case 'genz': return { cols: genzCols, count: 4 };
    }
  };

  const getMegaHref = (menu: MenuName, category: string, item?: string) => {
    const slug = slugifyMenuLabel(item || category);
    const categorySlug = slugifyMenuLabel(category);

    if (menu === 'genz' && item) {
      if (categorySlug === "women's-western-wear") {
        if (slug.startsWith('dresses-under')) return '/genz/dresses';
        if (slug.startsWith('tops-under')) return '/genz/tops';
        if (slug.startsWith('jeans-under')) return '/genz/women-jeans';
        if (slug.startsWith('trousers-under')) return '/genz/trousers';
        if (slug.startsWith('t-shirts-under')) return '/genz/women-t-shirts';
      }

      if (categorySlug === 'lingerie-loungewear') {
        if (slug.startsWith('bras-under')) return '/genz/bras';
        if (slug.startsWith('night-suits-under')) return '/genz/night-suits';
        if (slug.startsWith('nightdresses-under')) return '/genz/nightdresses';
      }

      if (categorySlug === "men's-casual-wear") {
        if (slug.startsWith('t-shirts-under')) return '/genz/men-t-shirts';
        if (slug.startsWith('shirts-under')) return '/genz/shirts';
        if (slug.startsWith('jeans-under')) return '/genz/men-jeans';
      }

      if (categorySlug === "men's-occassion-wear") {
        if (slug.startsWith('kurtas-under')) return '/genz/kurtas';
        if (slug.startsWith('kurta-sets-under')) return '/genz/kurta-sets';
      }

      if (categorySlug === "women's-footwear") {
        return '/genz/women-footwear';
      }

      if (categorySlug === "men's-footwear") {
        if (slug.startsWith('casual-shoes-under')) return '/genz/men-casual-shoes';
        if (slug.startsWith('sports-shoes-under')) return '/genz/men-sports-shoes';
        if (slug.startsWith('formal-shoes-under')) return '/genz/men-formal-shoes';
        return '/genz/men-casual-shoes';
      }

      if (categorySlug === 'beauty-grooming') {
        if (slug.startsWith('skincare-under')) return '/genz/skincare';
        if (slug.startsWith('haircare-under')) return '/genz/haircare';
        if (slug.startsWith('bath-body-under')) return '/genz/bath-body';
        if (slug.startsWith('makeup-under')) return '/genz/makeup';
        if (slug.startsWith('fragrances-under')) return '/genz/fragrances';
        if (slug.startsWith('appliances-under')) return '/genz/appliances';
      }

      if (categorySlug === 'accessories') {
        if (slug.startsWith('jewellery-under')) return '/genz/jewellery';
        if (slug.startsWith('handbags-under')) return '/genz/handbags';
        if (slug.startsWith('clutches-under')) return '/genz/clutches';
        if (slug.startsWith('backpacks-under')) return '/genz/backpacks';
        if (slug.startsWith('wallets-under')) return '/genz/wallets';
        if (slug.startsWith('sunglasses-under')) return '/genz/sunglasses';
        if (slug.startsWith('belts-under')) return '/genz/belts';
        if (slug.startsWith('caps-under')) return '/genz/caps';
      }
    }

    return `/${menu}/${slug}`;
  };

  const handleSearchSubmit = (event?: React.FormEvent) => {
    event?.preventDefault();
    const query = searchQuery.trim().toLowerCase();
    if (!query) return;

    const normalizeSearchText = (value: string) =>
      value
        .toLowerCase()
        .replace(/['’]/g, '')
        .replace(/[^a-z0-9]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    const normalizedQuery = normalizeSearchText(query);
    const compactQuery = normalizedQuery.replace(/\s+/g, '');

    const sectionMatches: Array<[string, string[]]> = [
      ['/', ['home page', 'homepage', 'main page']],
      ['/men/topwear', ['men', 'man', 'mens', 'male', 'clothes', 'clothing']],
      ['/women', ['women', 'woman', 'womens', 'female', 'womn', 'ladies']],
      ['/kids/boys-clothing', ['kids', 'kid', 'children', 'child']],
      ['/home/bed-linen-furnishing', ['home', 'decor', 'furniture', 'bed sheet', 'bedsheet']],
      ['/home/hangers', ['hanger', 'hangers', 'cloth hanger', 'clothes hanger']],
      ['/home/storage', ['storage', 'organiser', 'organizer', 'bin', 'bins']],
      ['/beauty/makeup', ['beauty', 'makeup', 'foundation', 'kajal']],
      ['/beauty/lipstick', ['lipstick', 'lip stick']],
      ['/beauty/mascara', ['mascara']],
      ['/beauty/eyeliner', ['eyeliner', 'eye liner']],
      ['/beauty/skincare-bath-body', ['skin care', 'skincare', 'cleanser', 'moisturiser', 'moisturizer']],
      ['/beauty/hair-dryer', ['hair dryer', 'hairdryer', 'hair drier', 'hairdry', 'dryer']],
      ['/beauty/haircare', ['haircare', 'hair care', 'shampoo', 'conditioner', 'hair oil', 'hair serum']],
      ['/beauty/fragrances', ['perfume', 'body mist', 'fragrance', 'deodorant', 'deo']],
      ['/beauty/baby-care', ['baby care']],
      ['/beauty/masks', ['mask', 'masks']],
      ['/women/western-wear', ['women dress', 'dress', 'top', 'women top', 'western wear']],
      ['/women/tshirts', ['women tshirt', 'women t shirt', 'women tee']],
      ['/women/indian-fusion-wear', ['saree', 'kurta', 'kurti', 'ethnic', 'dupatta', 'palazzo']],
      ['/women/footwear', ['heels', 'flats', 'women shoe', 'women shoes', 'women footwear', 'sandals']],
      ['/women/lingerie-sleepwear', ['bra', 'sleepwear', 'lingerie', 'shapewear']],
      ['/women/jewellery', ['jewellery', 'jewelry']],
      ['/women/handbags-bags-wallets', ['handbag', 'bags', 'purse']],
      ['/kids/boys-clothing', ['boys', 'boy shirt', 'boy t-shirt']],
      ['/kids/girls-clothing', ['girls', 'girl dress', 'kids dress']],
      ['/kids/footwear', ['kids shoes', 'kids footwear', 'school shoes']],
      ['/kids/toys-games', ['toy', 'toys', 'soft toy', 'activity toy']],
      ['/genz/women\'s-western-wear', ['genz', 'gen z', 'urbanic']],
      ['/men/t-shirts', ['tshirt', 't shirt', 't-shirt', 'tee', 'polo']],
      ['/men/topwear', ['cloth', 'clothes', 'clothing']],
      ['/men/casual-shirts', ['casual shirt', 'shirt casual']],
      ['/men/formal-shirts', ['formal shirt', 'office shirt']],
      ['/men/jackets', ['jacket']],
      ['/men/blazers-coats', ['blazer', 'coat', 'suit']],
      ['/men/jeans', ['men jeans', 'denim']],
      ['/men/formal-trousers', ['trouser', 'formal pant']],
      ['/men/shorts', ['shorts']],
      ['/men/track-pants-joggers', ['track', 'jogger']],
      ['/men/kurtas-kurta-sets', ['men kurta']],
      ['/men/sherwanis', ['sherwani']],
      ['/men/casual-shoes', ['shoe', 'shoes', 'casual shoe', 'casual shoes', 'footwear']],
      ['/men/formal-shoes', ['formal shoe', 'formal shoes']],
      ['/men/sneakers', ['sneaker', 'sneakers', 'sports shoe', 'sports shoes']],
      ['/men/watches', ['watch']],
      ['/men/perfumes-body-mists', ['men perfume', 'men fragrance']],
      ['/men/sunglasses-frames', ['sunglass', 'frame']],
      ['/men/wallets', ['wallet']],
      ['/men/belts', ['belt']],
      ['/men/personal-care-grooming', ['grooming', 'face wash', 'trimmer']],
    ];

    const match = sectionMatches
      .map(([href, keywords]) => {
        const score = keywords.reduce((bestScore, keyword) => {
        const normalizedKeyword = normalizeSearchText(keyword);
        const compactKeyword = normalizedKeyword.replace(/\s+/g, '');
          const matched =
          normalizedQuery.includes(normalizedKeyword) ||
            compactQuery.includes(compactKeyword);

          return matched ? Math.max(bestScore, compactKeyword.length) : bestScore;
        }, 0);

        return { href, score };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)[0];

    router.push(match ? match.href : '/');
    setSearchQuery('');
    setIsOpen(false);
  };

  const sendChatMessage = async (message: string) => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || chatLoading) return;

    setChatMessages(previousMessages => [
      ...previousMessages,
      { role: 'user', text: trimmedMessage },
    ]);
    setChatInput('');
    setChatError('');
    setChatLoading(true);

    try {
      const response = await apiFetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmedMessage,
          user_id: currentUser?.id,
          user_email: currentUser?.email,
          user_phone: currentUser?.phone,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Chat request failed.');
      }

      setChatMessages(previousMessages => [
        ...previousMessages,
        { role: 'bot', text: data.answer || 'I could not find an answer for that.' },
      ]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sorry, chat is not available right now.';
      setChatError(errorMessage);
      setChatMessages(previousMessages => [
        ...previousMessages,
        { role: 'bot', text: 'Sorry, I could not answer right now. Please try again or contact support.' },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleChatSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    sendChatMessage(chatInput);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        .shopore-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          padding: 18px 60px; display: flex; align-items: center;
          justify-content: space-between;
          background: rgba(255,255,255,0.7);
          backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
          border-bottom: 2px solid rgba(236,72,153,0.08);
          transition: padding 0.3s ease, background 0.3s ease;
          font-family: 'DM Sans', 'Inter', sans-serif;
        }
        .shopore-nav.scrolled { padding: 6px 60px; background: rgba(255,255,255,0.95); }
        .nav-logo {
          display: flex; align-items: center; gap: 8px;
          font-family: 'Georgia', serif; font-size: 28px; font-weight: 800;
          color: #071225; text-decoration: none; letter-spacing: 4px;
          text-transform: uppercase; transition: opacity 0.2s;
        }
        .logo-img { width: 44px; height: 44px; flex-shrink: 0; object-fit: contain; display: block; }
        .nav-center { display: flex; align-items: center; gap: 36px; flex: 1; justify-content: center; }
        .nav-links { display: flex; gap: 32px; list-style: none; margin: 0; padding: 0; align-items: center; }
        .nav-links li { position: relative; }
        .nav-links a { color: #6b7280; text-decoration: none; font-size: 14px; font-weight: 500; transition: color 0.2s; }
        .nav-links a:hover { color: #ec4899; }
        .nav-links a.active { color: var(--menu-accent, #ec4899); font-weight: 600; }
        .nav-links a.active::after {
          content: ''; position: absolute; bottom: -6px; left: 0; right: 0;
          height: 2px; background: var(--menu-accent, #ec4899); border-radius: 2px;
        }
        .mega-menu {
          position: fixed; top: 64px; left: 50%; transform: translateX(-50%);
          background: #fff; border-top: 3px solid var(--mega-accent, #ec4899);
          box-shadow: 0 20px 60px rgba(0,0,0,0.1); z-index: 99;
          padding: 32px 48px 36px; display: grid; gap: 0 24px;
          animation: megaFadeIn 0.18s ease; width: clamp(720px, 65%, 960px);
        }
        @keyframes megaFadeIn {
          from { opacity: 0; transform: translateX(-50%) translateY(-8px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        .mega-col { display: flex; flex-direction: column; gap: 24px; }
        .mega-category {
          color: var(--mega-accent, #ec4899); font-size: 13px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px;
          text-decoration: none; display: block; cursor: pointer;
        }
        .mega-category:hover { opacity: 0.8; }
        .mega-divider { height: 1px; background: rgba(0,0,0,0.07); margin: 4px 0 14px; }
        .mega-item {
          display: block; color: #374151; font-size: 13px; font-weight: 400;
          line-height: 2; text-decoration: none; transition: color 0.15s, padding-left 0.15s; cursor: pointer;
        }
        .mega-item:hover { color: var(--mega-accent, #ec4899); padding-left: 4px; }
        .nav-search { position: relative; width: clamp(240px, 32vw, 420px); }
        .nav-search input {
          width: 100%; padding: 10px 18px 10px 40px;
          background: rgba(255,255,255,0.95);
          border: 2px solid rgba(236,72,153,0.18); border-radius: 999px;
          color: #1f2937; font-size: 14px; outline: none;
          transition: border-color 0.2s, box-shadow 0.2s; font-family: inherit;
          box-shadow: 0 6px 20px rgba(236,72,153,0.08);
        }
        .nav-search input::placeholder { color: transparent; font-size: 13px; }
        .nav-search input:focus::placeholder { color: #6b7280; }
        .nav-search input:focus { border-color: #ec4899; background: #fff; box-shadow: 0 0 0 3px rgba(236,72,153,0.12); }
        .nav-search-placeholder {
          position: absolute; left: 40px; top: 50%; transform: translateY(-50%);
          color: #6b7280; font-size: 13px; line-height: 1; pointer-events: none;
        }
        .nav-search-placeholder strong { color: #1f2937; font-weight: 800; }
        .nav-search input:focus + .nav-search-placeholder,
        .nav-search input:not(:placeholder-shown) + .nav-search-placeholder { display: none; }
        .nav-search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #111827; display: flex; align-items: center; border: none; background: transparent; padding: 0; cursor: pointer; }
        .nav-right { display: flex; align-items: center; gap: 4px; }
        .nav-icon-btn {
          background: transparent; border: none; color: #6b7280; padding: 8px;
          border-radius: 10px; cursor: pointer; display: flex; align-items: center;
          justify-content: center; transition: color 0.2s, background 0.2s; text-decoration: none;
        }
        .nav-icon-btn:hover { color: #ec4899; background: rgba(236,72,153,0.1); }
        .agent-icon-btn {
          width: 48px; height: 48px; padding: 6px; border-radius: 50%;
        }
        .agent-icon-btn:hover {
          background: transparent;
        }
        .agent-icon-btn img {
          width: 36px; height: 36px; display: block; object-fit: contain;
        }
        .chat-panel {
          position: fixed; top: 76px; right: 96px; z-index: 240;
          width: min(390px, calc(100vw - 28px)); overflow: hidden;
          border: 1px solid rgba(236,72,153,0.22); border-radius: 20px; background: #fff;
          box-shadow: 0 28px 90px rgba(15, 23, 42, 0.24);
          font-family: 'DM Sans', Inter, sans-serif;
        }
        .chat-panel::before {
          content: ""; position: absolute; inset: 0 0 auto 0; height: 5px;
          background: linear-gradient(90deg, #ec4899, #8b5cf6, #06b6d4);
        }
        .chat-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 18px 16px 14px; background: linear-gradient(135deg, #fff7fb 0%, #eef7ff 100%);
          border-bottom: 1px solid rgba(236,72,153,0.16);
        }
        .chat-title { display: flex; align-items: center; gap: 10px; min-width: 0; }
        .chat-title img {
          width: 42px; height: 42px; object-fit: contain; flex: 0 0 auto;
          border-radius: 999px; box-shadow: 0 10px 22px rgba(99,102,241,0.22);
        }
        .chat-title strong { display: block; color: #071225; font-size: 16px; line-height: 1.1; }
        .chat-title span { display: block; color: #64748b; font-size: 12px; margin-top: 4px; }
        .chat-close {
          width: 32px; height: 32px; border: 1px solid rgba(15,23,42,0.08); border-radius: 999px;
          background: rgba(255,255,255,0.75); color: #475569; cursor: pointer;
          display: inline-flex; align-items: center; justify-content: center; padding: 0;
        }
        .chat-messages {
          display: flex; flex-direction: column; gap: 12px;
          height: 330px; overflow-y: auto; padding: 16px;
          background:
            radial-gradient(circle at top left, rgba(236,72,153,0.07), transparent 34%),
            linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
        }
        .chat-bubble {
          max-width: 86%; padding: 11px 13px; border-radius: 16px;
          font-size: 13px; line-height: 1.48; color: #0f172a; white-space: pre-line;
          box-shadow: 0 10px 24px rgba(15,23,42,0.07);
        }
        .chat-bubble.bot { align-self: flex-start; background: #fff; border: 1px solid #e8eef6; border-top-left-radius: 5px; }
        .chat-bubble.user {
          align-self: flex-end; background: linear-gradient(135deg, #ec4899, #8b5cf6);
          color: #fff; border-top-right-radius: 5px;
        }
        .chat-loading {
          align-self: flex-start; display: inline-flex; align-items: center; gap: 5px;
          background: #fff; border: 1px solid #e8eef6; border-radius: 16px; border-top-left-radius: 5px;
          padding: 11px 13px; box-shadow: 0 10px 24px rgba(15,23,42,0.07);
        }
        .chat-loading span {
          width: 6px; height: 6px; border-radius: 999px; background: #94a3b8;
          animation: chatDot 1s infinite ease-in-out;
        }
        .chat-loading span:nth-child(2) { animation-delay: 0.15s; }
        .chat-loading span:nth-child(3) { animation-delay: 0.3s; }
        @keyframes chatDot {
          0%, 80%, 100% { opacity: 0.35; transform: translateY(0); }
          40% { opacity: 1; transform: translateY(-3px); }
        }
        .chat-error {
          margin: 0 14px 10px; color: #b91c1c; background: #fff1f2;
          border: 1px solid #fecdd3; border-radius: 10px; padding: 8px 10px; font-size: 12px;
        }
        .chat-suggestions {
          align-self: flex-start; max-width: 92%;
          display: flex; flex-wrap: wrap; gap: 8px; overflow: visible; padding: 0;
          border: 0; background: transparent; box-shadow: none;
        }
        .chat-suggestions button {
          flex: 0 0 auto; border: 1px solid rgba(236,72,153,0.22); background: rgba(255,255,255,0.78); color: #be185d;
          border-radius: 999px; padding: 8px 11px; font-size: 12px; font-weight: 700; cursor: pointer;
          transition: transform 0.16s, background 0.16s;
        }
        .chat-suggestions button:hover { background: rgba(253,242,248,0.95); transform: translateY(-1px); }
        .chat-messages::-webkit-scrollbar { width: 6px; }
        .chat-messages::-webkit-scrollbar-thumb {
          background: #dbe1ea; border-radius: 999px;
        }
        .chat-suggestions button:disabled,
        .chat-form button:disabled {
          cursor: not-allowed; opacity: 0.6;
        }
        .chat-form {
          display: flex; gap: 10px; padding: 12px 14px 14px; border-top: 1px solid #eef2f7; background: #fff;
        }
        .chat-form input {
          min-width: 0; flex: 1; height: 44px; border: 1px solid #dbe1ea;
          border-radius: 999px; padding: 0 15px; font-size: 14px; outline: none; background: #f8fafc;
        }
        .chat-form input:focus { border-color: #ec4899; box-shadow: 0 0 0 3px rgba(236,72,153,0.12); }
        .chat-form button {
          height: 44px; min-width: 74px; border: 0; border-radius: 999px;
          background: linear-gradient(135deg, #071225, #334155);
          color: #fff; padding: 0 16px; font-size: 13px; font-weight: 800; cursor: pointer;
          box-shadow: 0 10px 20px rgba(15,23,42,0.18);
        }
        .cart-wrapper { position: relative; }
        .cart-badge {
          position: absolute; top: -4px; right: -4px;
          background: #ef4444; color: white; font-size: 10px; font-weight: 700;
          width: 18px; height: 18px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
        }
        .notification-wrapper { position: relative; }
        .notification-badge {
          position: absolute; top: -4px; right: -4px;
          min-width: 18px; height: 18px; padding: 0 4px; border-radius: 999px;
          background: #ef4444; color: #fff; font-size: 10px; font-weight: 800;
          display: flex; align-items: center; justify-content: center;
        }
        .notifications-panel {
          position: fixed; top: 78px; right: 86px; z-index: 220;
          width: min(380px, calc(100vw - 28px)); overflow: hidden;
          border: 1px solid #eef2f7; border-radius: 12px; background: #fff;
          box-shadow: 0 24px 70px rgba(15, 23, 42, 0.18);
          font-family: 'DM Sans', Inter, sans-serif;
        }
        .shopore-nav.scrolled ~ .notifications-panel { top: 58px; }
        .notifications-header {
          display: flex; align-items: flex-start; justify-content: space-between; gap: 12px;
          padding: 16px 16px 14px; border-bottom: 1px solid #eef2f7; background: #fbfcfd;
        }
        .notifications-header h2 { margin: 0; color: #071225; font-size: 18px; font-weight: 800; }
        .notifications-header p { margin: 4px 0 0; color: #64748b; font-size: 12px; line-height: 1.35; }
        .notifications-header button {
          display: flex; align-items: center; justify-content: center; width: 30px; height: 30px;
          border: 0; border-radius: 999px; background: #fff; color: #334155; cursor: pointer;
        }
        .notifications-list { max-height: min(430px, calc(100vh - 170px)); overflow-y: auto; padding: 8px; }
        .notification-item {
          display: flex; gap: 11px; padding: 12px 10px; border-radius: 9px;
          color: inherit; text-decoration: none; transition: background 0.16s;
        }
        .notification-item:hover { background: #f8fafc; }
        .notification-dot {
          flex: 0 0 auto; width: 9px; height: 9px; margin-top: 5px; border-radius: 999px; background: #64748b;
        }
        .notification-dot.order { background: #16a34a; }
        .notification-dot.cancel { background: #ef4444; }
        .notification-dot.refund { background: #f59e0b; }
        .notification-dot.delivery { background: #2563eb; }
        .notification-copy { min-width: 0; display: grid; gap: 4px; }
        .notification-copy strong { color: #071225; font-size: 13px; line-height: 1.2; }
        .notification-copy span { color: #475569; font-size: 12px; line-height: 1.45; }
        .notification-copy small { color: #94a3b8; font-size: 11px; }
        .notifications-empty { display: grid; gap: 6px; padding: 34px 18px; text-align: center; }
        .notifications-empty strong { color: #071225; font-size: 15px; }
        .notifications-empty span { color: #64748b; font-size: 13px; }
        .mobile-toggle { display: none; background: transparent; border: none; color: #8b8aaa; cursor: pointer; padding: 6px; }
        .mobile-menu {
          max-height: calc(100vh - 64px); overflow-y: auto;
          background: #ffffff; border-bottom: 1px solid #f3d7e5;
          padding: 16px 24px 20px;
          box-shadow: 0 22px 55px rgba(15,23,42,0.18);
        }
        .mobile-search { position: relative; margin-bottom: 12px; }
        .mobile-search input {
          width: 100%; padding: 10px 16px 10px 38px;
          background: rgba(236,72,153,0.05); border: 2px solid rgba(236,72,153,0.1);
          border-radius: 50px; color: #1f2937; font-size: 14px; outline: none; font-family: inherit;
        }
        .mobile-search input::placeholder { color: #6b7280; }
        .mobile-search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #111827; border: none; background: transparent; padding: 0; cursor: pointer; }
        .mobile-nav-link {
          display: block; padding: 10px 4px; color: #6b7280; text-decoration: none; font-size: 15px;
          border-bottom: 1px solid rgba(236,72,153,0.05); transition: color 0.2s;
        }
        .mobile-nav-link:hover { color: #ec4899; }
        .mobile-account-card {
          display: flex; align-items: center; gap: 11px;
          margin: 12px 0 8px; padding: 13px;
          border: 1px solid #f3d7e5; border-radius: 14px; background: #fff7fb;
        }
        .mobile-account-avatar {
          width: 40px; height: 40px; flex: 0 0 auto; overflow: hidden;
          display: flex; align-items: center; justify-content: center;
          border-radius: 999px; background: #fce7f3; color: #be185d;
          font-size: 16px; font-weight: 800;
        }
        .mobile-account-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .mobile-account-copy { min-width: 0; }
        .mobile-account-copy strong { display: block; color: #111827; font-size: 13px; }
        .mobile-account-copy span { display: block; margin-top: 2px; overflow: hidden; color: #64748b; font-size: 11px; text-overflow: ellipsis; white-space: nowrap; }
        .mobile-account-links { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; padding: 7px 0 3px; }
        .mobile-account-action {
          display: flex; align-items: center; min-height: 40px; padding: 0 12px;
          border: 1px solid #eef2f7; border-radius: 10px; background: #fff;
          color: #334155; font-size: 12px; font-weight: 700; text-decoration: none;
        }
        .mobile-account-action:hover { border-color: #f9a8d4; background: #fff7fb; color: #be185d; }
        .mobile-logout {
          width: 100%; margin-top: 8px; padding: 10px 12px; border: 0;
          border-radius: 10px; background: #fff1f2; color: #dc2626;
          cursor: pointer; font-family: inherit; font-size: 12px; font-weight: 700; text-align: left;
        }
        .profile-dropdown-link {
          display: block; padding: 6px 0; color: #374151; font-size: 13px;
          text-decoration: none; transition: color 0.15s; background: none;
          border: none; cursor: pointer; font-family: inherit; text-align: left; width: 100%;
        }
        .profile-dropdown-link:hover { color: #ec4899; }

        @media (max-width: 900px) {
          .shopore-nav { padding: 10px 20px; }
          .shopore-nav.scrolled { padding: 12px 20px; }
          .nav-center { display: none; }
          .mobile-toggle { display: flex; align-items: center; }
          .mega-menu { display: none; }
        }
        @media (max-width: 640px) {
          .shopore-nav {
            padding: 8px 12px;
            gap: 8px;
            flex-wrap: wrap;
          }
          .shopore-nav.scrolled { padding: 8px 12px; }
          .nav-logo {
            font-size: 20px;
            letter-spacing: 1px;
            min-width: 0;
          }
          .logo-img {
            width: 36px;
            height: 36px;
          }
          .nav-search {
            order: 3;
            width: 100%;
            flex-basis: 100%;
          }
          .nav-search input {
            padding-top: 8px;
            padding-bottom: 8px;
            font-size: 13px;
          }
          .nav-icon-btn {
            padding: 7px;
          }
          .agent-icon-btn {
            width: 40px;
            height: 40px;
            padding: 4px;
          }
          .agent-icon-btn img {
            width: 32px;
            height: 32px;
          }
          .nav-icon-btn span {
            display: none;
          }
          .chat-panel {
            top: 64px;
            right: 12px;
          }
          .notifications-panel {
            top: 98px;
            right: 12px;
          }
          .chat-messages {
            height: 260px;
          }
          .mobile-menu {
            padding: 12px 16px 16px;
          }
        }
      `}</style>

      <nav className={`shopore-nav${scrolled ? ' scrolled' : ''}`}>
        {/* Logo */}
        <Link href="/" className="nav-logo">
          <img src="/icon.png" alt="Shopore" className="logo-img" />
          SHOPORE
        </Link>

        {/* Center */}
        <div className="nav-center">
          <ul className="nav-links">
            {navItems.map(item => (
              <li key={item.href}>
                {item.hasMega && item.menuName ? (
                  <Link
                    href={item.href}
                    className={activeMenu === item.menuName || isDepartmentSelected(item.menuName) ? 'active' : ''}
                    style={{
                      '--menu-accent': MENU_COLORS[item.menuName],
                      color: activeMenu === item.menuName || isDepartmentSelected(item.menuName) ? MENU_COLORS[item.menuName] : '#6b7280',
                      fontSize: '14px',
                      fontWeight: isDepartmentSelected(item.menuName) ? '700' : '500',
                    } as React.CSSProperties}
                    onMouseEnter={() => handleMenuEnter(item.menuName!)}
                    onMouseLeave={handleMenuLeave}
                    onClick={() => {
                      if (!isDepartmentSelected(item.menuName)) setPendingMenu(item.menuName!);
                      setActiveMenu(null);
                    }}
                    aria-current={pathname === `/${item.menuName}` || pathname.startsWith(`/${item.menuName}/`) ? 'page' : undefined}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <Link href={item.href}>{item.label}</Link>
                )}
              </li>
            ))}
          </ul>

          <form className="nav-search" onSubmit={handleSearchSubmit}>
            <input
              type="text"
              placeholder="Brands & Products"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <span className="nav-search-placeholder">
              Search for <strong>Brands &amp; Products</strong>
            </span>
            <button type="submit" className="nav-search-icon" aria-label="Search products"><Search size={14} /></button>
          </form>
        </div>

        {/* Right */}
        <div className="nav-right">
          <button
            type="button"
            className="nav-icon-btn agent-icon-btn"
            aria-label="Chat bot"
            onClick={() => {
              setActiveMenu(null);
            setProfileOpen(false);
              setNotificationsOpen(false);
              setChatOpen(open => !open);
            }}
          >
            <img src="/agent_icon.gif" alt="" />
          </button>

          <div
            style={{ position: 'relative', paddingBottom: '14px', marginBottom: '-14px' }}
            onMouseEnter={openProfileMenu}
            onMouseLeave={closeProfileMenu}
          >
            <button
              className="nav-icon-btn"
              aria-label="Profile"
              onClick={() => {
                if (currentUser) {
                  router.push('/profile');
                } else {
                  setAuthModalOpen(true);
                }
              }}
              style={{ flexDirection: 'column', gap: '2px', padding: '6px 10px' }}
            >
              <User size={18} />
              <span style={{ fontSize: '11px', fontWeight: 600, color: profileOpen ? '#ec4899' : '#374151' }}>Profile</span>
            </button>

            {profileOpen && (
              <div style={{
                position: 'absolute', top: '100%', right: 0,
                background: '#fff', borderRadius: '10px',
                boxShadow: '0 18px 45px rgba(15,23,42,0.16)',
                width: '260px',
                zIndex: 200,
                border: '1px solid #f1d7e4',
                fontFamily: 'DM Sans, sans-serif',
                padding: '0',
                overflow: 'hidden',
              }}>
                {currentUser ? (
                  <div style={{ padding: '14px 16px' }}>
                    <div style={{ padding: '14px 16px', borderBottom: '1px solid #f3f4f6' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {profileAvatar ? (
                          <img
                            src={profileAvatar}
                            alt="Profile"
                            style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                          />
                        ) : (
                          <div style={{
                            width: '36px', height: '36px', borderRadius: '50%',
                            background: '#fce7f3', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', fontSize: '15px', fontWeight: '700',
                            color: '#be185d', flexShrink: 0,
                          }}>
                            {userFirstName[0].toUpperCase()}
                          </div>
                        )}
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <p style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: '#111827', whiteSpace: 'nowrap' }}>
                            Hi, {userFirstName}😊
                          </p>
                        </div>
                      </div>
                    </div>

                    <div style={{ padding: '8px 0' }}>
                      <a href="/profile" style={profileMenuItemStyle}
                        onMouseOver={e => {
                          e.currentTarget.style.background = '#fff1f7';
                          e.currentTarget.style.color = '#be185d';
                          e.currentTarget.style.transform = 'translateX(2px)';
                        }}
                        onMouseOut={e => {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.color = '#334155';
                          e.currentTarget.style.transform = 'translateX(0)';
                        }}>
                        <img src="/user.png" alt="" style={profileMenuIconStyle} />
                        My Profile
                      </a>

                      <a href="/profile?section=orders" style={profileMenuItemStyle}
                        onMouseOver={e => {
                          e.currentTarget.style.background = '#fff1f7';
                          e.currentTarget.style.color = '#be185d';
                          e.currentTarget.style.transform = 'translateX(2px)';
                        }}
                        onMouseOut={e => {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.color = '#334155';
                          e.currentTarget.style.transform = 'translateX(0)';
                        }}>
                        <img src="/tracking.png" alt="" style={profileMenuIconStyle} />
                        My Orders
                      </a>

                      <a href="/wishlist" style={profileMenuItemStyle}
                        onMouseOver={e => {
                          e.currentTarget.style.background = '#fff1f7';
                          e.currentTarget.style.color = '#be185d';
                          e.currentTarget.style.transform = 'translateX(2px)';
                        }}
                        onMouseOut={e => {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.color = '#334155';
                          e.currentTarget.style.transform = 'translateX(0)';
                        }}>
                        <img src="/shopping-cart.png" alt="" style={profileMenuIconStyle} />
                        Wishlist
                      </a>

                      <a href="/profile?section=support" style={profileMenuItemStyle}
                        onMouseOver={e => {
                          e.currentTarget.style.background = '#fff1f7';
                          e.currentTarget.style.color = '#be185d';
                          e.currentTarget.style.transform = 'translateX(2px)';
                        }}
                        onMouseOut={e => {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.color = '#334155';
                          e.currentTarget.style.transform = 'translateX(0)';
                        }}>
                        <img src="/support.png" alt="" style={profileMenuIconStyle} />
                        Help & Support
                      </a>

                      <hr style={{ border: 'none', borderTop: '1px solid #f3f4f6', margin: '6px 0' }} />

                      <button
                        onClick={() => {
                          setProfileOpen(false);
                          setLogoutConfirmOpen(true);
                        }}
                        style={{ ...profileMenuItemStyle, width: '100%', border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer' }}
                        onMouseOver={e => {
                          e.currentTarget.style.background = '#fff5f5';
                          e.currentTarget.style.color = '#dc2626';
                          e.currentTarget.style.transform = 'translateX(2px)';
                        }}
                        onMouseOut={e => {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.color = '#ef4444';
                          e.currentTarget.style.transform = 'translateX(0)';
                        }}>
                        <img src="/logout.png" alt="" style={profileMenuIconStyle} />
                        Logout
                      </button>
                    </div>
                  </div>

                ) : (
                  // ── NOT LOGGED IN ──
                  <div style={{ padding: '18px' }}>
                    <div style={{ fontSize: '16px', fontWeight: '800', color: '#111827', marginBottom: '6px' }}>Welcome</div>
                    <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '16px', lineHeight: 1.4 }}>
                      To access account and manage orders
                    </div>
                    <button
                      onClick={() => { setProfileOpen(false); setAuthModalOpen(true); }}
                      style={{
                        width: '100%', padding: '11px',
                        border: '1px solid #ec4899', color: '#fff',
                        borderRadius: '6px', background: '#ec4899',
                        fontWeight: '700', fontSize: '13px',
                        cursor: 'pointer', fontFamily: 'inherit',
                      }}
                    >
                      LOGIN / SIGNUP
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div style={{ position: 'relative' }}>
            <button
              type="button"
              className="nav-icon-btn notification-wrapper"
              aria-label="Notifications"
              onClick={handleNotificationsClick}
              style={{ flexDirection: 'column', gap: '2px', padding: '6px 10px' }}
            >
              <Bell size={18} />
              <span style={{ fontSize: '11px', fontWeight: 600, color: notificationsOpen ? '#ec4899' : '#374151' }}>Updates</span>
              {unreadNotifications > 0 && <span className="notification-badge">{unreadNotifications > 9 ? '9+' : unreadNotifications}</span>}
            </button>
          </div>

          {/* Cart / Bag */}
          <button
            type="button"
            onClick={() => {
              setActiveMenu(null);
              setProfileOpen(false);
              setNotificationsOpen(false);
              router.push('/cart');
            }}
            className="nav-icon-btn cart-wrapper"
            aria-label="Cart"
            style={{ flexDirection: 'column', gap: '2px', padding: '6px 10px' }}
          >
            <ShoppingCart size={18} />
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#374151' }}>Bag</span>
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>

          {/* Mobile toggle */}
          <button className="mobile-toggle" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu">
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {notificationsOpen && currentUser?.id && (
        <>
          <button
            type="button"
            aria-label="Close notifications"
            onClick={() => setNotificationsOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 180,
              background: 'transparent',
              border: 0,
              cursor: 'default',
            }}
          />
          <aside className="notifications-panel">
            <div className="notifications-header">
              <div>
                <h2>Updates</h2>
                <p>Order, payment, cancellation and refund messages</p>
              </div>
              <button type="button" aria-label="Close updates" onClick={() => setNotificationsOpen(false)}>
                <X size={17} />
              </button>
            </div>

            {notifications.length === 0 ? (
              <div className="notifications-empty">
                <strong>No updates yet</strong>
                <span>Your order messages will appear here.</span>
              </div>
            ) : (
              <div className="notifications-list">
                {notifications.slice(0, 8).map((notification) => (
                  <Link
                    key={notification.id}
                    href={notification.href || '/profile?section=orders'}
                    onClick={() => setNotificationsOpen(false)}
                    className="notification-item"
                  >
                    <span className={`notification-dot ${notification.type}`} />
                    <span className="notification-copy">
                      <strong>{notification.title}</strong>
                      <span>{notification.message}</span>
                      <small>
                        {new Intl.DateTimeFormat('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          hour: 'numeric',
                          minute: '2-digit',
                        }).format(new Date(notification.createdAt))}
                      </small>
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </aside>
        </>
      )}

      {chatOpen && (
        <section className="chat-panel" aria-label="Shopping help chat">
          <div className="chat-header">
            <div className="chat-title">
              <img src="/agent_icon.gif" alt="" />
              <div>
                <strong>Shopping Assistant</strong>
                <span>Ask about orders, payment, delivery</span>
              </div>
            </div>
            <button type="button" className="chat-close" aria-label="Close chat" onClick={() => setChatOpen(false)}>
              <X size={18} />
            </button>
          </div>

          <div className="chat-messages" ref={chatMessagesRef}>
            {chatMessages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={`chat-bubble ${message.role}`}>
                {message.text}
              </div>
            ))}
            <div className="chat-suggestions" aria-label="Suggested questions">
              {CHAT_SUGGESTIONS.map(suggestion => (
                <button key={suggestion} type="button" disabled={chatLoading} onClick={() => sendChatMessage(suggestion)}>
                  {suggestion}
                </button>
              ))}
            </div>
            {chatLoading && (
              <div className="chat-loading" aria-label="Assistant is typing">
                <span />
                <span />
                <span />
              </div>
            )}
          </div>

          {chatError && <p className="chat-error">{chatError}</p>}

          <form className="chat-form" onSubmit={handleChatSubmit}>
            <input
              type="text"
              value={chatInput}
              onChange={event => setChatInput(event.target.value)}
              placeholder="Type your question..."
              aria-label="Chat message"
              disabled={chatLoading}
            />
            <button type="submit" disabled={chatLoading || !chatInput.trim()}>
              Send
            </button>
          </form>
        </section>
      )}

      {bagOpen && (
        <>
          <button
            type="button"
            aria-label="Close bag preview"
            onClick={() => setBagOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 180,
              background: 'transparent',
              border: 'none',
              cursor: 'default',
            }}
          />
          <aside
            style={{
              position: 'fixed',
              top: scrolled ? '58px' : '78px',
              right: '28px',
              width: 'min(380px, calc(100vw - 32px))',
              maxHeight: 'calc(100vh - 96px)',
              overflowY: 'auto',
              background: '#fff',
              zIndex: 220,
              boxShadow: '0 22px 70px rgba(15, 23, 42, 0.18)',
              borderTop: '3px solid #ec4899',
              fontFamily: 'DM Sans, Inter, sans-serif',
            }}
          >
            <div style={{ padding: '18px 18px 14px', borderBottom: '1px solid #eef2f7' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h2 style={{ margin: 0, color: '#071225', fontSize: '18px', fontWeight: 800 }}>My Bag</h2>
                  <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '13px' }}>
                    {cartCount} {cartCount === 1 ? 'item' : 'items'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setBagOpen(false)}
                  style={{
                    border: 'none',
                    background: '#f8fafc',
                    color: '#071225',
                    width: '32px',
                    height: '32px',
                    cursor: 'pointer',
                    fontSize: '20px',
                    lineHeight: 1,
                  }}
                >
                  ×
                </button>
              </div>
            </div>

            {cartItems.length === 0 ? (
              <div style={{ padding: '30px 18px', textAlign: 'center' }}>
                <p style={{ margin: 0, color: '#071225', fontSize: '15px', fontWeight: 700 }}>Your bag is empty</p>
                <p style={{ margin: '8px 0 18px', color: '#64748b', fontSize: '13px' }}>Add something you love.</p>
                <Link
                  href="/men/topwear"
                  onClick={() => setBagOpen(false)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center', 
                    justifyContent: 'center',
                    height: '42px',
                    padding: '0 22px',
                    background: '#071225',
                    color: '#fff',
                    textDecoration: 'none',
                    fontSize: '13px',
                    fontWeight: 800,
                  }}
                >
                  Continue Shopping
                </Link>
              </div>
            ) : (
              <>
                <div style={{ padding: '12px 18px', display: 'grid', gap: '12px' }}>
                  {cartItems.slice(0, 3).map((item) => (
                    <div key={item.key} style={{ display: 'flex', gap: '12px' }}>
                      <div style={{ position: 'relative', width: '64px', height: '84px', background: '#f1f5f9', overflow: 'hidden', flexShrink: 0 }}>
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        />
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <p style={{ margin: 0, color: '#071225', fontSize: '13px', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.product.brand}
                        </p>
                        <p style={{ margin: '3px 0 0', color: '#64748b', fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.product.name}
                        </p>
                        <p style={{ margin: '8px 0 0', color: '#071225', fontSize: '13px', fontWeight: 800 }}>
                          ₹{(item.product.price * item.quantity).toLocaleString('en-IN')} · Qty {item.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                  {cartItems.length > 3 && (
                    <p style={{ margin: 0, color: '#64748b', fontSize: '12px' }}>
                      +{cartItems.length - 3} more in your bag
                    </p>
                  )}
                </div>

                <div style={{ padding: '16px 18px 18px', borderTop: '1px solid #eef2f7' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px', color: '#071225', fontSize: '15px', fontWeight: 800 }}>
                    <span>Subtotal</span>
                    <span>₹{bagSubtotal.toLocaleString('en-IN')}.00</span>
                  </div>
                  <Link
                    href="/cart"
                    onClick={() => setBagOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '44px',
                      width: '100%',
                      background: '#071225',
                      color: '#fff',
                      textDecoration: 'none',
                      fontSize: '15px',
                      fontWeight: 800,
                    }}
                  >
                    Go To Bag
                  </Link>
                </div>
              </>
            )}
          </aside>
        </>
      )}

      {/* Mega Menu */}
      {activeMenu && (() => {
        const { cols, count } = getMenuCols(activeMenu);
        const accent = MENU_COLORS[activeMenu as MenuName];
        return (
          <div
            className="mega-menu"
            style={{
              top: scrolled ? '50px' : '76px',
              gridTemplateColumns: `repeat(${count}, 1fr)`,
              '--mega-accent': accent,
            } as React.CSSProperties}
            onMouseEnter={() => handleMenuEnter(activeMenu)}
            onMouseLeave={handleMenuLeave}
          >
            {cols.map((colSections, ci) => (
              <div className="mega-col" key={ci}>
                {colSections.map(sec => (
                  <div className="mega-section" key={sec.category}>
                    <a className="mega-category" href={getMegaHref(activeMenu, sec.category)}>{sec.category}</a>
                    {sec.items.length > 0 && <div className="mega-divider" />}
                    {sec.items.map(item => (
                      <a className="mega-item" key={item} href={getMegaHref(activeMenu, sec.category, item)}>
                        {item}
                      </a>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        );
      })()}

      {/* Mobile Menu */}
      {isOpen && (
        <div className="mobile-menu" style={{ position: 'fixed', top: scrolled ? '57px' : '73px', left: 0, right: 0, zIndex: 99 }}>
          <form className="mobile-search" onSubmit={handleSearchSubmit}>
            <input
              type="text"
              placeholder="Search for Brands & Products"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="mobile-search-icon" aria-label="Search products"><Search size={14} /></button>
          </form>
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="mobile-nav-link"
              onClick={() => {
                if (!isDepartmentSelected(item.menuName)) setPendingMenu(item.menuName || null);
                setIsOpen(false);
              }}
              style={isDepartmentSelected(item.menuName) ? { color: item.menuName ? MENU_COLORS[item.menuName] : '#ec4899', fontWeight: 700 } : undefined}
            >
              {item.label}
            </Link>
          ))}
          {currentUser ? (
            <div>
              <div className="mobile-account-card">
                <span className="mobile-account-avatar">
                  {profileAvatar ? <img src={profileAvatar} alt="Profile" /> : userFirstName[0].toUpperCase()}
                </span>
                <span className="mobile-account-copy">
                  <strong>Hi, {userFirstName}</strong>
                  <span>{currentUser.email}</span>
                </span>
              </div>
              <div className="mobile-account-links">
                <Link href="/profile" className="mobile-account-action" onClick={() => setIsOpen(false)}>My Profile</Link>
                <Link href="/profile?section=orders" className="mobile-account-action" onClick={() => setIsOpen(false)}>My Orders</Link>
                <Link href="/wishlist" className="mobile-account-action" onClick={() => setIsOpen(false)}>Wishlist</Link>
                <Link href="/profile?section=support" className="mobile-account-action" onClick={() => setIsOpen(false)}>Help & Support</Link>
              </div>
              <button
                type="button"
                className="mobile-logout"
                onClick={() => {
                  setIsOpen(false);
                  setLogoutConfirmOpen(true);
                }}
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              className="mobile-nav-link"
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', width: '100%', textAlign: 'left', color: '#ec4899', fontWeight: 700, padding: '12px 4px', fontSize: '14px' }}
              onClick={() => { setIsOpen(false); setAuthModalOpen(true); }}
            >
              Login / Signup
            </button>
          )}
        </div>
      )}

      {logoutConfirmOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="logout-confirm-title"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(15, 23, 42, 0.58)',
            backdropFilter: 'blur(3px)',
            padding: '20px',
            fontFamily: 'DM Sans, Inter, sans-serif',
          }}
        >
          <div
            style={{
              position: 'relative',
              width: 'min(420px, 100%)',
              borderRadius: '6px',
              background: '#fff',
              padding: '48px 18px 18px',
              textAlign: 'center',
              boxShadow: '0 24px 70px rgba(15, 23, 42, 0.28)',
            }}
          >
            <button
              type="button"
              aria-label="Close logout confirmation"
              onClick={() => setLogoutConfirmOpen(false)}
              style={{
                position: 'absolute',
                right: '14px',
                top: '14px',
                border: 0,
                background: 'transparent',
                color: '#374151',
                cursor: 'pointer',
              }}
            >
              <X size={22} />
            </button>
            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: '-30px',
                display: 'flex',
                height: '58px',
                width: '58px',
                transform: 'translateX(-50%)',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                border: '5px solid #fff',
                background: '#d97706',
                color: '#fff',
                fontSize: '34px',
                fontWeight: 900,
                lineHeight: 1,
              }}
            >
              !
            </div>
            <h2 id="logout-confirm-title" style={{ margin: 0, color: '#071225', fontSize: '16px', fontWeight: 800 }}>
              Are You Sure You Want To Log Out?
            </h2>
            <p style={{ margin: '8px auto 24px', maxWidth: '330px', color: '#64748b', fontSize: '12px', lineHeight: 1.45 }}>
              Logged out prohibits access to your wish-list, purchase history and other feature until you sign in again
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setLogoutConfirmOpen(false)}
                style={{
                  height: '38px',
                  border: '1px solid #dbe1ea',
                  background: '#fff',
                  color: '#071225',
                  cursor: 'pointer',
                  fontWeight: 700,
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLogout}
                style={{
                  height: '38px',
                  border: '1px solid #071225',
                  background: '#071225',
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: 800,
                }}
              >
                Yes, Log Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
}
