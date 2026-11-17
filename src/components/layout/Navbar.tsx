import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Language } from '../../types';
import { 
  Briefcase, 
  ShoppingBag, 
  Wrench, 
  Building2, 
  Users, 
  PlusCircle, 
  Bell, 
  MessageSquare, 
  Globe, 
  User, 
  ShieldCheck, 
  LogOut, 
  Phone,
  Menu,
  X,
  ChevronDown,
  Check,
  Palette,
  Sun,
  Moon
} from 'lucide-react';
import { PWAInstallButton } from '../common/PWAInstallButton';
import { DEFAULT_AVATAR_URL, handleImageFallback } from '../../constants/assets';

export type HeaderTheme = 'emerald_blue' | 'purple' | 'velvet' | 'orchid';

export const Navbar: React.FC = () => {
  const { 
    language, 
    setLanguage, 
    t, 
    activeTab, 
    setActiveTab, 
    currentUser, 
    isAdmin,
    signOut, 
    openModal, 
    notifications,
    conversations,
    theme,
    toggleTheme,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);

  // Emerald Green & Royal Blue is the primary default theme
  const [headerTheme, setHeaderTheme] = useState<HeaderTheme>(() => {
    try {
      const saved = localStorage.getItem('app_header_purple_theme');
      return (saved === 'emerald_blue' || saved === 'velvet' || saved === 'orchid' || saved === 'purple') 
        ? (saved as HeaderTheme) 
        : 'emerald_blue';
    } catch {
      return 'emerald_blue';
    }
  });

  const changeTheme = (theme: HeaderTheme) => {
    setHeaderTheme(theme);
    try {
      localStorage.setItem('app_header_purple_theme', theme);
    } catch {
      // ignore
    }
  };

  const unreadNotifs = notifications.filter(n => !n.isRead).length;
  const unreadMessages = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);

  // 4 Supported Languages
  const languages: Array<{ code: Language; label: string; nativeName: string; flag: string }> = [
    { code: 'am', label: 'Amharic', nativeName: 'አማርኛ', flag: '🇪🇹' },
    { code: 'en', label: 'English', nativeName: 'English', flag: '🇬🇧' },
    { code: 'om', label: 'Oromiffa', nativeName: 'Afaan Oromoo', flag: '🌳' },
    { code: 'ti', label: 'Tigrinya', nativeName: 'ትግርኛ', flag: '⛪' },
  ];

  const currentLangObj = languages.find(l => l.code === language) || languages[0];

  const getKnowledgeLabel = () => {
    switch (language) {
      case 'om': return '📖 Beekumsa Ortodoksii';
      case 'ti': return '📖 ኦርቶዶክሳዊ ፍልጠት';
      case 'en': return '📖 Orthodox AI';
      case 'am':
      default: return '📖 ኦርቶዶክሳዊ ዕውቀት';
    }
  };

  const getPrayersLabel = () => {
    switch (language) {
      case 'om': return '🙏 Kadhaa';
      case 'ti': return '🙏 ጸሎት';
      case 'en': return '🙏 Prayers';
      case 'am':
      default: return '🙏 ጸሎትና ምልጃ';
    }
  };

  const getStudioLabel = () => {
    switch (language) {
      case 'om': return '✨ AI Istuudiyoo';
      case 'ti': return '✨ AI ስቱዲዮ';
      case 'en': return '✨ AI Studio';
      case 'am':
      default: return '✨ AI ስቱዲዮ';
    }
  };

  const navLinks = [
    { key: 'home', label: t.navHome },
    { key: 'knowledge', label: getKnowledgeLabel() },
    { key: 'prayers', label: getPrayersLabel() },
    { key: 'jobs', label: t.navJobs },
    { key: 'marketplace', label: t.navMarketplace },
    { key: 'services', label: t.navServices },
    { key: 'businesses', label: t.navBusinesses },
    { key: 'professionals', label: t.navProfessionals },
    { key: 'ai-studio', label: getStudioLabel() },
    { key: 'about', label: t.navAbout },
  ] as const;

  // Curated Aesthetics (Green & Blue primary + Purple varieties)
  const themeStyles = {
    // 1. Royal Sapphire Blue & Deep Emerald Green (User Requested Harmonious Palette)
    emerald_blue: {
      header: 'sticky top-0 z-40 bg-gradient-to-r from-[#02231D] via-[#092B45] to-[#03261F] backdrop-blur-md border-b border-emerald-400/50 shadow-xl',
      brandTitle: 'text-white tracking-tight',
      brandSub: 'text-emerald-300 font-bold',
      navInactive: 'text-emerald-100/90 hover:text-white hover:bg-white/10 font-medium',
      navActive: 'bg-gradient-to-r from-emerald-600/35 to-blue-600/35 text-white font-bold border border-emerald-400/60 shadow-xs',
      iconBtn: 'text-emerald-100 hover:text-white hover:bg-white/10',
      actionBorder: 'border-emerald-300/30 hover:border-emerald-300',
      actionBg: 'bg-emerald-950/40 hover:bg-emerald-900/60 text-white',
      postBtn: 'bg-gradient-to-r from-[#059669] via-[#0284C7] to-[#10B981] hover:brightness-110 text-white font-bold border border-emerald-300 shadow-md',
      postIcon: 'text-[#FDE047]',
      signInBtn: 'text-emerald-200 hover:text-white border-emerald-400/50 hover:border-emerald-300 bg-white/10 hover:bg-white/20',
      drawer: 'lg:hidden border-t border-emerald-400/40 bg-[#02231D] px-4 pt-3 pb-6 space-y-2',
      drawerActive: 'bg-gradient-to-r from-emerald-600/35 to-blue-600/35 text-white font-bold border border-emerald-400/60',
      drawerInactive: 'text-emerald-100 hover:bg-white/10',
      drawerLabel: 'text-emerald-200',
    },
    // 2. Imperial Royal Purple (Deep Velvet Royal Purple with Gold Highlights)
    purple: {
      header: 'sticky top-0 z-40 bg-gradient-to-r from-[#2A0845] via-[#3B1358] to-[#2A0845] backdrop-blur-md border-b border-[#F59E0B]/50 shadow-lg',
      brandTitle: 'text-white tracking-tight',
      brandSub: 'text-[#FDE047] font-bold',
      navInactive: 'text-purple-100/90 hover:text-white hover:bg-white/10 font-medium',
      navActive: 'bg-gradient-to-r from-[#F59E0B]/25 to-[#EAB308]/20 text-[#FDE047] font-bold border border-amber-400/60 shadow-xs',
      iconBtn: 'text-purple-100 hover:text-white hover:bg-white/10',
      actionBorder: 'border-white/20 hover:border-amber-400/60',
      actionBg: 'bg-white/10 hover:bg-white/20 text-white',
      postBtn: 'bg-gradient-to-r from-[#D97706] via-[#F59E0B] to-[#D97706] hover:brightness-110 text-slate-950 font-bold border border-amber-300 shadow-md',
      postIcon: 'text-slate-950',
      signInBtn: 'text-[#FDE047] hover:text-white border-amber-400/60 hover:border-[#FDE047] bg-white/10 hover:bg-white/20',
      drawer: 'lg:hidden border-t border-[#F59E0B]/50 bg-[#2A0845] px-4 pt-3 pb-6 space-y-2',
      drawerActive: 'bg-gradient-to-r from-[#F59E0B]/25 to-[#EAB308]/20 text-[#FDE047] font-bold border border-amber-400/60',
      drawerInactive: 'text-purple-100 hover:bg-white/10',
      drawerLabel: 'text-amber-200',
    },
    // 2. Velvet Midnight Violet (Deepest Midnight Violet with Silver/Lavender Accents)
    velvet: {
      header: 'sticky top-0 z-40 bg-gradient-to-r from-[#1E0836] via-[#2A0E47] to-[#1E0836] backdrop-blur-md border-b border-purple-400/30 shadow-md',
      brandTitle: 'text-white tracking-tight',
      brandSub: 'text-purple-300 font-bold',
      navInactive: 'text-purple-200/90 hover:text-white hover:bg-white/10 font-medium',
      navActive: 'bg-purple-600/30 text-purple-200 font-bold border border-purple-400/50 shadow-xs',
      iconBtn: 'text-purple-200 hover:text-white hover:bg-white/10',
      actionBorder: 'border-purple-300/30 hover:border-purple-300',
      actionBg: 'bg-purple-900/40 hover:bg-purple-900/60 text-white',
      postBtn: 'bg-gradient-to-r from-[#9333EA] to-[#7E22CE] hover:brightness-110 text-white font-bold border border-purple-300/50 shadow-md',
      postIcon: 'text-[#FDE047]',
      signInBtn: 'text-purple-200 hover:text-white border-purple-400/40 hover:border-purple-300 bg-white/10 hover:bg-white/20',
      drawer: 'lg:hidden border-t border-purple-400/30 bg-[#1E0836] px-4 pt-3 pb-6 space-y-2',
      drawerActive: 'bg-purple-600/30 text-purple-200 font-bold border border-purple-400/50',
      drawerInactive: 'text-purple-200 hover:bg-white/10',
      drawerLabel: 'text-purple-200',
    },
    // 3. Royal Vivid Orchid (Bright Liturgical Purple)
    orchid: {
      header: 'sticky top-0 z-40 bg-gradient-to-r from-[#4C1D95] via-[#5B21B6] to-[#4C1D95] backdrop-blur-md border-b border-purple-300/40 shadow-md',
      brandTitle: 'text-white tracking-tight',
      brandSub: 'text-purple-200 font-bold',
      navInactive: 'text-purple-100 hover:text-white hover:bg-white/10 font-medium',
      navActive: 'bg-white text-[#4C1D95] font-bold border border-white shadow-xs',
      iconBtn: 'text-white hover:bg-white/15',
      actionBorder: 'border-white/30 hover:border-white',
      actionBg: 'bg-white/15 hover:bg-white/25 text-white',
      postBtn: 'bg-white text-[#4C1D95] hover:bg-purple-50 font-bold border border-purple-200 shadow-md',
      postIcon: 'text-[#D97706]',
      signInBtn: 'text-white hover:text-purple-100 border-white/40 hover:border-white bg-white/15 hover:bg-white/25',
      drawer: 'lg:hidden border-t border-purple-300/40 bg-[#4C1D95] px-4 pt-3 pb-6 space-y-2',
      drawerActive: 'bg-white text-[#4C1D95] font-bold border border-white',
      drawerInactive: 'text-purple-100 hover:bg-white/10',
      drawerLabel: 'text-white',
    }
  };

  const currentTheme = themeStyles[headerTheme];

  return (
    <header className={currentTheme.header}>
      {/* TIER 1: Brand on Left, All Actions on Right (Spacious, Zero Cutoff) */}
      <div className="w-full px-3 sm:px-6 py-2 flex items-center justify-between border-b border-white/10 gap-3">
        
        {/* Logo & Brand Identity */}
        <div className="flex items-center gap-2.5 sm:gap-3 cursor-pointer select-none group shrink-0" onClick={() => setActiveTab('home')}>
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full p-0.5 bg-gradient-to-tr from-[#D4A72C] via-[#F59E0B] to-[#9333EA] shadow-md flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
            <img
              src="/assets/aistudio/image_01084dd6.png"
              alt="Orthodoxy and Economy Logo"
              className="w-full h-full object-cover rounded-full bg-white"
            />
          </div>
          <div className="flex flex-col">
            <span className={`text-sm sm:text-base xl:text-lg font-black leading-tight tracking-tight transition-colors ${currentTheme.brandTitle}`}>
              ORTHODOXY & ECONOMY
            </span>
            <span className={`text-[10px] sm:text-[11px] font-ethiopic leading-none ${currentTheme.brandSub}`}>
              {t.brandSubtitle}
            </span>
          </div>
        </div>

        {/* Actions: Theme Switcher, 4 Languages, Post CTA, Notifications, Messages, Sign In / Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          
          {/* Purple Shade Selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setThemeDropdownOpen(!themeDropdownOpen);
                setLangDropdownOpen(false);
                setUserDropdownOpen(false);
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold shadow-xs transition-colors cursor-pointer ${currentTheme.actionBg} ${currentTheme.actionBorder}`}
              title="የገጽታ ከለር / Color Theme"
            >
              <Palette className="w-3.5 h-3.5 text-[#FDE047]" />
              <span className="hidden sm:inline text-xs">
                {headerTheme === 'emerald_blue' ? '🌿 አረንጓዴና ሰማያዊ' : headerTheme === 'purple' ? 'ሮያል ሐምራዊ' : headerTheme === 'velvet' ? 'ሚድናይት' : 'ደማቅ'}
              </span>
              <ChevronDown className="w-3 h-3 opacity-70" />
            </button>

            {themeDropdownOpen && (
              <div 
                className="absolute right-0 mt-2 w-64 bg-[#021F1B]/98 backdrop-blur-md rounded-2xl shadow-2xl border border-emerald-400/40 py-2 z-50 text-xs text-white"
                onMouseLeave={() => setThemeDropdownOpen(false)}
              >
                <div className="px-3 py-1 text-[10px] uppercase font-bold text-emerald-300 border-b border-emerald-400/20">
                  የገጽታ ከለር ምርጫዎች / Color Themes
                </div>
                {[
                  { id: 'emerald_blue' as const, name: '🌿 አረንጓዴና ሰማያዊ (አዲስ)', sub: 'Emerald Green & Royal Sapphire Blue', dot: 'bg-gradient-to-r from-emerald-500 to-blue-600' },
                  { id: 'purple' as const, name: '👑 ሮያል ሐምራዊና ወርቅ', sub: 'Imperial Royal Purple & Gold', dot: 'bg-[#581C87]' },
                  { id: 'velvet' as const, name: '🌙 ሚድናይት ቫዮሌት', sub: 'Velvet Midnight Violet', dot: 'bg-[#2A0E47]' },
                  { id: 'orchid' as const, name: '🌸 ደማቅ ሐምራዊ (Orchid)', sub: 'Royal Vivid Orchid Purple', dot: 'bg-[#7C3AED]' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      changeTheme(item.id);
                      setThemeDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between transition-colors cursor-pointer ${
                      headerTheme === item.id ? 'bg-emerald-400/20 text-emerald-300 font-bold' : 'text-slate-100 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`w-3.5 h-3.5 rounded-full ${item.dot} border border-amber-300/50 shadow-xs`} />
                      <div>
                        <p className="leading-tight">{item.name}</p>
                        <p className="text-[10px] text-purple-300 leading-none mt-0.5">{item.sub}</p>
                      </div>
                    </div>
                    {headerTheme === item.id && <Check className="w-4 h-4 text-amber-300" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 4 Languages Selector Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setLangDropdownOpen(!langDropdownOpen);
                setThemeDropdownOpen(false);
                setUserDropdownOpen(false);
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold shadow-xs transition-colors cursor-pointer ${currentTheme.actionBg} ${currentTheme.actionBorder}`}
              title="Select Language / ቋንቋ ይምረጡ"
            >
              <Globe className="w-3.5 h-3.5 text-[#FDE047]" />
              <span className="hidden sm:inline">{currentLangObj.flag}</span>
              <span className="text-xs">{currentLangObj.nativeName}</span>
              <ChevronDown className="w-3 h-3 opacity-70" />
            </button>

            {langDropdownOpen && (
              <div 
                className="absolute right-0 mt-2 w-48 bg-[#1F0733]/98 backdrop-blur-md rounded-2xl shadow-2xl border border-purple-400/40 py-2 z-50 text-xs text-white"
                onMouseLeave={() => setLangDropdownOpen(false)}
              >
                <div className="px-3 py-1 text-[10px] uppercase font-bold text-amber-300 border-b border-purple-400/20">
                  Select Language / ቋንቋ (4)
                </div>
                {languages.map((l) => (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => {
                      setLanguage(l.code);
                      setLangDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 flex items-center justify-between transition-colors cursor-pointer ${
                      language === l.code ? 'bg-white/15 text-amber-300 font-bold' : 'text-purple-100 hover:bg-white/10'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>{l.flag}</span>
                      <span>{l.nativeName}</span>
                      <span className="text-[10px] text-purple-300">({l.label})</span>
                    </span>
                    {language === l.code && <Check className="w-3.5 h-3.5 text-amber-300" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Dark / Light Mode Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className={`p-1.5 sm:p-2 rounded-xl border transition-colors cursor-pointer ${currentTheme.actionBg} ${currentTheme.actionBorder}`}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Dark or Light Mode"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-[#FDE047]" />
            ) : (
              <Moon className="w-4 h-4 text-emerald-100" />
            )}
          </button>

          {/* PWA Mobile App Install Button */}
          <PWAInstallButton variant="header" />

          {/* Primary Post Button */}
          <button
            onClick={() => openModal('post')}
            className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${currentTheme.postBtn}`}
          >
            <PlusCircle className={`w-3.5 h-3.5 ${currentTheme.postIcon}`} />
            <span className="whitespace-nowrap">{t.navPostAction}</span>
          </button>

          {/* Notifications Button */}
          <button
            onClick={() => openModal('notifications')}
            className={`p-1.5 sm:p-2 rounded-xl relative cursor-pointer transition-colors ${currentTheme.iconBtn}`}
            title={t.navNotifications}
          >
            <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
            {unreadNotifs > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#EF4444] rounded-full" />
            )}
          </button>

          {/* Messages Button */}
          <button
            onClick={() => setActiveTab('messages')}
            className={`p-1.5 sm:p-2 rounded-xl relative cursor-pointer transition-colors ${
              activeTab === 'messages' 
                ? 'text-[#FDE047] bg-white/20 shadow-xs' 
                : currentTheme.iconBtn
            }`}
            title={t.navMessages}
          >
            <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
            {unreadMessages > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#F59E0B] text-slate-950 text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {unreadMessages}
              </span>
            )}
          </button>

          {/* User Profile / Auth Area */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => {
                  setUserDropdownOpen(!userDropdownOpen);
                  setLangDropdownOpen(false);
                  setThemeDropdownOpen(false);
                }}
                className="flex items-center gap-2 p-1 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
              >
                <div className="relative">
                  <img
                    src={currentUser.profilePhotoUrl || DEFAULT_AVATAR_URL}
                    alt={currentUser.fullName}
                    referrerPolicy="no-referrer"
                    onError={handleImageFallback(DEFAULT_AVATAR_URL)}
                    className={`w-8 h-8 rounded-full object-cover ring-2 ${
                      currentUser.verificationStatus === 'verified' ? 'ring-emerald-400' : 'ring-amber-400/80'
                    }`}
                  />
                  {currentUser.verificationStatus === 'verified' && (
                    <span className="absolute -bottom-0.5 -right-0.5 bg-emerald-500 text-white rounded-full p-0.5 ring-1 ring-slate-900 flex items-center justify-center">
                      <ShieldCheck className="w-2.5 h-2.5" />
                    </span>
                  )}
                </div>
                <span className={`hidden xl:inline text-xs font-semibold max-w-[110px] truncate ${currentTheme.brandTitle}`}>
                  {currentUser.fullName.split(' ')[0]}
                </span>
              </button>

              {/* Dropdown Menu */}
              {userDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-56 bg-[#1F0733]/98 backdrop-blur-md rounded-2xl shadow-2xl border border-purple-400/40 py-2 z-50 text-xs text-white"
                  onMouseLeave={() => setUserDropdownOpen(false)}
                >
                  <div className="px-3.5 py-2.5 border-b border-purple-400/20">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-white truncate">{currentUser.fullName}</p>
                      <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full flex items-center gap-1 shrink-0 ${
                        currentUser.verificationStatus === 'verified'
                          ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-400/50'
                          : 'bg-amber-500/25 text-amber-300 border border-amber-400/50'
                      }`}>
                        <ShieldCheck className="w-2.5 h-2.5" />
                        <span>{currentUser.verificationStatus === 'verified' ? 'VERIFIED' : 'PENDING'}</span>
                      </span>
                    </div>
                    <p className="text-purple-300 text-[11px] truncate">{currentUser.email}</p>
                  </div>

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      setActiveTab('dashboard');
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-white/10 text-purple-100 flex items-center gap-2 cursor-pointer"
                  >
                    <Briefcase className="w-4 h-4 text-[#FDE047]" />
                    <span>{t.navDashboard}</span>
                  </button>

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      openModal('profile');
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-white/10 text-purple-100 flex items-center gap-2 cursor-pointer"
                  >
                    <User className="w-4 h-4 text-purple-300" />
                    <span>{t.navProfile}</span>
                  </button>

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      openModal('contact');
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-white/10 text-purple-100 flex items-center gap-2 cursor-pointer"
                  >
                    <Phone className="w-4 h-4 text-[#10B981]" />
                    <span>ያግኙን (Contact Us)</span>
                  </button>

                  {isAdmin && (
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        openModal('admin');
                      }}
                      className="w-full text-left px-3.5 py-2 bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 flex items-center justify-between cursor-pointer font-bold"
                    >
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-[#FDE047]" />
                        <span>{t.navAdmin}</span>
                      </div>
                      <span className="text-[9px] bg-[#D4A72C] text-[#08294F] px-1.5 py-0.5 rounded font-black uppercase">
                        Super Admin
                      </span>
                    </button>
                  )}

                  <div className="border-t border-purple-400/20 my-1" />

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      signOut();
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-red-500/20 text-red-400 flex items-center gap-2 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{t.navSignOut}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => openModal('auth')}
              className={`text-xs sm:text-sm font-semibold px-3 sm:px-3.5 py-1.5 rounded-xl border cursor-pointer shadow-xs transition-colors ${currentTheme.signInBtn}`}
            >
              {t.navSignIn}
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`lg:hidden p-2 rounded-lg cursor-pointer transition-colors ${currentTheme.iconBtn}`}
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* TIER 2: Dedicated Desktop Navigation Row (Full Width, Zero Cutoff) */}
      <div className="hidden lg:flex w-full px-3 sm:px-6 py-1.5 items-center justify-between bg-black/20 backdrop-blur-xs overflow-x-auto scrollbar-none">
        <nav className="flex items-center gap-1 xl:gap-2">
          {navLinks.map((link) => {
            const isActive = activeTab === link.key;
            return (
              <button
                key={link.key}
                onClick={() => setActiveTab(link.key as any)}
                className={`px-3 py-1.5 rounded-xl text-xs xl:text-sm font-semibold transition-all cursor-pointer relative whitespace-nowrap ${
                  isActive 
                    ? currentTheme.navActive
                    : currentTheme.navInactive
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Direct Contact Hotline on right side of navigation bar */}
        <button
          onClick={() => openModal('contact')}
          className="hidden xl:flex items-center gap-1.5 text-xs text-amber-300 hover:text-white font-bold px-2.5 py-1 rounded-lg hover:bg-white/10 transition-colors shrink-0"
        >
          <Phone className="w-3.5 h-3.5 text-amber-300" />
          <span>+251 922 901 083 / 0981 848 698</span>
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className={currentTheme.drawer}>
          {navLinks.map((link) => (
            <button
              key={link.key}
              onClick={() => {
                setActiveTab(link.key as any);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                activeTab === link.key 
                  ? currentTheme.drawerActive
                  : currentTheme.drawerInactive
              }`}
            >
              {link.label}
            </button>
          ))}

          {/* Header Color Theme Selector in Mobile Drawer */}
          <div className="pt-2 border-t border-white/15 space-y-1.5">
            <span className={`text-xs font-bold px-1 ${currentTheme.drawerLabel}`}>የገጽታ ከለር / Header Theme:</span>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { id: 'emerald_blue' as const, label: '🌿 አረንጓዴና ሰማያዊ' },
                { id: 'purple' as const, label: '👑 ሮያል ሐምራዊ' },
                { id: 'velvet' as const, label: '🌙 ቫዮሌት' },
                { id: 'orchid' as const, label: '🌸 ደማቅ' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => changeTheme(item.id)}
                  className={`px-2 py-1.5 rounded-xl text-xs font-semibold text-center border cursor-pointer transition-all ${
                    headerTheme === item.id
                      ? 'bg-amber-400/25 text-amber-300 font-bold border-amber-400/60 shadow-xs'
                      : 'bg-white/10 text-purple-100 border-white/20 hover:bg-white/20'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={toggleTheme}
              className="w-full mt-2 px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between bg-white/10 text-white border border-white/20 cursor-pointer"
            >
              <span>{theme === 'dark' ? '☀️ ቀን / Light Mode' : '🌙 ማታ / Dark Mode'}</span>
              {theme === 'dark' ? <Sun className="w-4 h-4 text-[#FDE047]" /> : <Moon className="w-4 h-4 text-[#FDE047]" />}
            </button>
          </div>

          {/* 4 Language Selection in Mobile Menu */}
          <div className="pt-3 border-t border-purple-400/30 space-y-2">
            <span className={`text-xs font-bold px-1 ${currentTheme.drawerLabel}`}>ቋንቋ ይምረጡ / Select Language:</span>
            <div className="grid grid-cols-2 gap-1.5">
              {languages.map((l) => (
                <button
                  key={l.code}
                  onClick={() => {
                    setLanguage(l.code);
                    setMobileMenuOpen(false);
                  }}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between border cursor-pointer transition-all ${
                    language === l.code 
                      ? 'bg-white/20 text-amber-300 font-bold border-amber-400/60 shadow-xs' 
                      : 'bg-white/10 text-purple-100 border-white/20 hover:bg-white/20'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <span>{l.flag}</span>
                    <span>{l.nativeName}</span>
                  </span>
                  {language === l.code && <Check className="w-3.5 h-3.5 text-amber-300" />}
                </button>
              ))}
            </div>

            {isAdmin && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openModal('admin');
                }}
                className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#08294F] bg-[#D4A72C] hover:bg-[#e0b439] flex items-center justify-between shadow-md mt-2 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#08294F]" />
                  <span>{t.navAdmin} (Super Admin Dashboard)</span>
                </div>
                <span className="text-[10px] bg-[#08294F] text-[#D4A72C] px-1.5 py-0.5 rounded font-black">
                  OWNER
                </span>
              </button>
            )}

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                openModal('contact');
              }}
              className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold text-amber-300 bg-white/10 border border-amber-400/40 flex items-center justify-between shadow-xs mt-2 hover:bg-white/15 cursor-pointer"
            >
              <span>ያግኙን / Contact: +251 922 901 083 · 0981 848 698</span>
              <Phone className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
