import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { VerificationBadge } from '../common/Badge';
import { 
  ShoppingBag, 
  MapPin, 
  Search, 
  Filter, 
  Bookmark, 
  BookmarkCheck, 
  PlusCircle, 
  Package, 
  Truck,
  CheckCircle2,
  SlidersHorizontal,
  ChevronDown,
  Sparkles,
  Send,
  Phone,
  X,
  Layers,
  Wheat,
  FileText,
  Hammer,
  Code,
  Wrench,
  RotateCcw,
  Compass,
  Tag
} from 'lucide-react';
import { Product } from '../../types';
import { Material3SectorSelector } from '../common/Material3SectorSelector';
import { SubCategory, SuperCategory, ALL_54_WORK_SUBCATEGORIES } from '../../data/workSectors';
import { PostedDateTime } from '../common/PostedDateTime';
import { getTimestampMs } from '../../utils/dateTime';

// Structured Industry & Commodity Sectors for Marketplace
export interface MarketIndustry {
  id: string;
  nameAm: string;
  nameEn: string;
  icon: React.ComponentType<{ className?: string }>;
  keywords: string[];
}

export const MARKETPLACE_INDUSTRIES: MarketIndustry[] = [
  {
    id: 'all',
    nameAm: 'ሁሉም ምርቶች',
    nameEn: 'All Commodities',
    icon: ShoppingBag,
    keywords: []
  },
  {
    id: 'sacred_liturgical',
    nameAm: 'ቅዱሳት ንዋያተ ቅድሳትና ጧፍ/ዕጣን',
    nameEn: 'Liturgical & Sacred Goods',
    icon: Sparkles,
    keywords: ['liturgical', 'candle', 'beeswax', 'cross', 'incense', 'frankincense', 'church', 'ጧፍ', 'ሰም', 'ዕጣን', 'መስቀል', 'ንዋያተ ቅድሳት', 'ቅዱሳት']
  },
  {
    id: 'traditional_textiles',
    nameAm: 'ባሕላዊ አልባሳት፣ ጥበብና ሸማ',
    nameEn: 'Traditional Textiles & Apparel',
    icon: Layers,
    keywords: ['textile', 'gabi', 'netela', 'tibeb', 'cotton', 'apparel', 'handloom', 'ነጠላ', 'ጋቢ', 'ጥበብ', 'አልባሳት', 'ሸማ']
  },
  {
    id: 'agriculture_honey',
    nameAm: 'ግብርና፣ ንጹሕ ማርና ዘይት',
    nameEn: 'Agriculture, Honey & Spices',
    icon: Wheat,
    keywords: ['honey', 'grain', 'oil', 'flaxseed', 'sesame', 'spices', 'agriculture', 'produce', 'ማር', 'ሰሊጥ', 'ተልባ', 'ዘይት', 'ግብርና', 'ቅመም']
  },
  {
    id: 'books_publishing',
    nameAm: 'መንፈሳዊ መጻሕፍትና ኅትመት',
    nameEn: 'Books & Sacred Publishing',
    icon: FileText,
    keywords: ['book', 'manuscript', 'deggwa', 'missal', 'publishing', 'parchment', 'scriptoria', 'መጽሐፍ', 'ድጓ', 'ቅዳሴ', 'ብራና', 'ኅትመት']
  },
  {
    id: 'construction_wood',
    nameAm: 'የግንባታ ዕቃዎችና ጣውላ',
    nameEn: 'Building Materials & Timber',
    icon: Hammer,
    keywords: ['timber', 'lumber', 'wood', 'construction', 'plank', 'door', 'stone', 'ጣውላ', 'እንጨት', 'ግንባታ', 'ዝግባ', 'ወይራ']
  },
  {
    id: 'electronics_solar',
    nameAm: 'ኤሌክትሮኒክስና ሶላር',
    nameEn: 'Electronics & Solar Power',
    icon: Code,
    keywords: ['solar', 'electronics', 'power', 'battery', 'inverter', 'hardware', 'clean energy', 'ሶላር', 'ኤሌክትሮኒክስ', 'መብራት', 'ኃይል']
  },
  {
    id: 'machinery_tools',
    nameAm: 'ማሽነሪዎችና የኢንዱስትሪ ዕቃዎች',
    nameEn: 'Machinery & Equipment',
    icon: Wrench,
    keywords: ['machine', 'mill', 'press', 'machinery', 'tools', 'industrial', 'ማሽን', 'መፍጫ', 'መጭመቂያ', 'ኢንዱስትሪ']
  },
];

// Specific Product Commodities for quick targeted filtering
export interface CommodityCategory {
  id: string;
  nameAm: string;
  nameEn: string;
  industryId: string;
  keywords: string[];
}

export const POPULAR_COMMODITIES: CommodityCategory[] = [
  { id: 'all', nameAm: 'ሁሉም የተለዩ ዕቃዎች (All Goods)', nameEn: 'All Specific Commodities', industryId: 'all', keywords: [] },
  { id: 'com_beeswax', nameAm: 'ንጹሕ የሰም ጧፍና ሻማ', nameEn: 'Pure Highland Beeswax Candles', industryId: 'sacred_liturgical', keywords: ['beeswax', 'candle', 'taper', 'ጧፍ', 'ሰም'] },
  { id: 'com_incense', nameAm: 'አንደኛ ደረጃ የቤተክርስቲያን ዕጣን', nameEn: 'Grade-A Natural Frankincense', industryId: 'sacred_liturgical', keywords: ['frankincense', 'incense', 'boswellia', 'ዕጣን'] },
  { id: 'com_crosses', nameAm: 'የወይራ እንጨትና የነሐስ መስቀሎች', nameEn: 'Hand-Carved Olive Wood Crosses', industryId: 'sacred_liturgical', keywords: ['cross', 'olive wood', 'carved', 'መስቀል', 'ወይራ'] },
  { id: 'com_gabi_netela', nameAm: 'ባለጥልፍ ነጠላና ባለ 4 እጥፍ ጋቢ', nameEn: 'Handloom Cotton Gabi & Netela', industryId: 'traditional_textiles', keywords: ['gabi', 'netela', 'cotton', 'tibeb', 'ነጠላ', 'ጋቢ'] },
  { id: 'com_honey', nameAm: 'ንጹሕ የሰሜን ተራራ ነጭ ማር', nameEn: 'Highland Raw White Wild Honey', industryId: 'agriculture_honey', keywords: ['honey', 'mountain', 'wild honey', 'ማር', 'ነጭ ማር'] },
  { id: 'com_oil', nameAm: 'የተልባና የሰሊጥ የተፈጥሮ ዘይት', nameEn: 'Cold-Pressed Flaxseed & Sesame Oil', industryId: 'agriculture_honey', keywords: ['flaxseed', 'sesame', 'oil', 'ዘይት', 'ተልባ', 'ሰሊጥ'] },
  { id: 'com_books', nameAm: 'የቆዳ ጥረዛ መጽሐፈ ድጓና ቅዳሴ', nameEn: 'Leather Bound Liturgical Deggwa & Missal', industryId: 'books_publishing', keywords: ['deggwa', 'missal', 'leather', 'manuscript', 'ድጓ', 'ቅዳሴ', 'መጽሐፍ'] },
  { id: 'com_solar', nameAm: 'ዘመናዊ የፀሐይ ብርሃን ሶላር ሲስተም', nameEn: 'Off-Grid Heavy Duty Solar Power Systems', industryId: 'electronics_solar', keywords: ['solar', 'inverter', 'battery', 'ሶላር', 'የፀሐይ ብርሃን'] },
  { id: 'com_timber', nameAm: 'የደረቁ የዝግባና የወይራ ጣውላዎች', nameEn: 'Seasoned Juniper & Olive Timber Planks', industryId: 'construction_wood', keywords: ['timber', 'planks', 'juniper', 'olive wood', 'ጣውላ', 'ዝግባ', 'ወይራ'] },
  { id: 'com_machinery', nameAm: 'የዱቄት መፍጫና የዘይት መጭመቂያ ማሽኖች', nameEn: 'Flour Mill & Seed Oil Expellers', industryId: 'machinery_tools', keywords: ['flour mill', 'oil press', 'machinery', 'መፍጫ', 'መጭመቂያ', 'ማሽን'] },
];

export const MarketplaceView: React.FC = () => {
  const { 
    t, 
    language, 
    products, 
    openModal, 
    isItemSaved, 
    toggleSaveItem, 
    searchQuery,
    selectedCategory
  } = useApp();

  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');
  const [selectedCommodity, setSelectedCommodity] = useState<string>('all');
  const [selectedSubSector, setSelectedSubSector] = useState<SubCategory | null>(null);
  const [selectedSuperSector, setSelectedSuperSector] = useState<SuperCategory | null>(null);
  const [showSectorSelector, setShowSectorSelector] = useState<boolean>(false);
  const [activeSegment, setActiveSegment] = useState<'all' | 'retail' | 'wholesale'>('all');
  const [selectedCondition, setSelectedCondition] = useState<string>('all');
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'price_low' | 'price_high'>('newest');

  useEffect(() => {
    if (selectedCategory === 'sacred_liturgical') {
      setSelectedIndustry('sacred_liturgical');
      setActiveSegment('all');
    } else if (selectedCategory === 'wholesale') {
      setSelectedIndustry('all');
      setActiveSegment('wholesale');
    } else if (selectedCategory === 'All') {
      setSelectedIndustry('all');
      setActiveSegment('all');
    }
  }, [selectedCategory]);

  // Compute live count of products per industry
  const industryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: products.length };
    MARKETPLACE_INDUSTRIES.forEach(ind => {
      if (ind.id === 'all') return;
      counts[ind.id] = products.filter(p => {
        const text = `${p.title} ${p.amharicTitle} ${p.category} ${p.categoryAm || ''} ${p.description} ${p.descriptionAm || ''}`.toLowerCase();
        return ind.keywords.some(k => text.includes(k.toLowerCase()));
      }).length;
    });
    return counts;
  }, [products]);

  // Dynamic list of commodities filtered by selected industry
  const availableCommodities = useMemo(() => {
    if (selectedIndustry === 'all') {
      return POPULAR_COMMODITIES;
    }
    const matching = POPULAR_COMMODITIES.filter(c => c.industryId === 'all' || c.industryId === selectedIndustry);
    return matching.length > 1 ? matching : POPULAR_COMMODITIES;
  }, [selectedIndustry]);

  // Main Filtering logic matching Industry, Commodity, Segment, Condition, Price & Location
  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      const q = localSearch.toLowerCase().trim();
      const prodText = `${prod.title} ${prod.amharicTitle} ${prod.category} ${prod.categoryAm || ''} ${prod.description} ${prod.descriptionAm || ''}`.toLowerCase();

      // 1. Text Search matching
      const matchQuery = !q || 
        prod.title.toLowerCase().includes(q) || 
        prod.amharicTitle.toLowerCase().includes(q) || 
        prod.description.toLowerCase().includes(q) ||
        prod.category.toLowerCase().includes(q);

      // 2. Industry sector matching
      let matchIndustry = true;
      if (selectedIndustry !== 'all') {
        const indObj = MARKETPLACE_INDUSTRIES.find(i => i.id === selectedIndustry);
        if (indObj) {
          matchIndustry = indObj.keywords.some(k => prodText.includes(k.toLowerCase()));
        }
      }

      // 3. Commodity / Specific item type matching
      let matchCommodity = true;
      if (selectedCommodity !== 'all') {
        const comObj = POPULAR_COMMODITIES.find(c => c.id === selectedCommodity);
        if (comObj && comObj.keywords.length > 0) {
          matchCommodity = comObj.keywords.some(k => prodText.includes(k.toLowerCase()));
        }
      }

      // 4. Material 3 Deep 54-Sector matching
      let matchSector = true;
      if (selectedSubSector) {
        const keywords = [
          selectedSubSector.nameAm.toLowerCase(),
          selectedSubSector.nameEn.toLowerCase(),
          ...(selectedSubSector.keywords || []).map(k => k.toLowerCase())
        ];
        matchSector = keywords.some(k => prodText.includes(k)) || 
          Boolean(selectedSuperSector && prod.category.toLowerCase().includes(selectedSuperSector.nameEn.toLowerCase().split(' ')[0]));
      }

      // 5. Retail vs Wholesale Segment
      const matchSegment = 
        activeSegment === 'all' ? true :
        activeSegment === 'wholesale' ? Boolean(prod.moq) :
        !prod.moq;

      // 6. Condition matching
      const matchCondition = selectedCondition === 'all' || prod.condition === selectedCondition;

      // 7. Price Range matching
      let matchPrice = true;
      if (selectedPriceRange !== 'all') {
        if (selectedPriceRange === 'under_1000') matchPrice = prod.price < 1000;
        else if (selectedPriceRange === '1000_5000') matchPrice = prod.price >= 1000 && prod.price <= 5000;
        else if (selectedPriceRange === '5000_25000') matchPrice = prod.price > 5000 && prod.price <= 25000;
        else if (selectedPriceRange === 'above_25000') matchPrice = prod.price > 25000;
      }

      // 8. Location matching
      const matchLoc = selectedLocation === 'all' || prod.location.toLowerCase().includes(selectedLocation.toLowerCase().split(' ')[0]);

      return matchQuery && matchIndustry && matchCommodity && matchSector && matchSegment && matchCondition && matchPrice && matchLoc;
    }).sort((a, b) => {
      if (sortBy === 'price_low') return a.price - b.price;
      if (sortBy === 'price_high') return b.price - a.price;
      return getTimestampMs(b.createdAt) - getTimestampMs(a.createdAt);
    });
  }, [
    products, 
    localSearch, 
    selectedIndustry, 
    selectedCommodity, 
    selectedSubSector, 
    selectedSuperSector, 
    activeSegment, 
    selectedCondition, 
    selectedPriceRange, 
    selectedLocation, 
    sortBy
  ]);

  // Check if any non-default filters are active
  const hasActiveFilters = Boolean(
    localSearch || 
    selectedIndustry !== 'all' || 
    selectedCommodity !== 'all' || 
    selectedSubSector || 
    activeSegment !== 'all' || 
    selectedCondition !== 'all' || 
    selectedPriceRange !== 'all' || 
    selectedLocation !== 'all'
  );

  const resetAllFilters = () => {
    setLocalSearch('');
    setSelectedIndustry('all');
    setSelectedCommodity('all');
    setSelectedSubSector(null);
    setSelectedSuperSector(null);
    setActiveSegment('all');
    setSelectedCondition('all');
    setSelectedPriceRange('all');
    setSelectedLocation('all');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#D4A72C] uppercase tracking-wider">
            <ShoppingBag className="w-4 h-4 text-[#123B6D]" />
            <span>{language === 'am' ? 'የገበያና የንግድ መድረክ' : 'Goods & Commodity Exchange'}</span>
          </div>
          <h1 className="font-ethiopic text-3xl font-extrabold text-[#08294F] mt-1">
            {t.marketplaceHeading}
          </h1>
          <p className="font-ethiopic text-sm text-slate-500">
            {t.marketplaceSubheading}
          </p>
        </div>

        <button
          onClick={() => openModal('post', { defaultType: 'product' })}
          className="bg-[#123B6D] hover:bg-[#08294F] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2 self-start md:self-auto font-ethiopic"
        >
          <PlusCircle className="w-4 h-4 text-[#D4A72C]" />
          <span>{language === 'am' ? 'ምርት ወይም ዕቃ ለጥፍ' : 'Post Product / Goods'}</span>
        </button>
      </div>

      {/* Quick Industry / Commodity Filter Pills Bar (Horizontal Scroll) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 font-ethiopic flex items-center gap-1.5 uppercase tracking-wide">
            <Compass className="w-3.5 h-3.5 text-[#D4A72C]" />
            <span>{language === 'am' ? 'የሸቀጥና የምርት ዘርፍ ይምረጡ' : 'Filter By Commodity Sector'}</span>
          </span>
          <span className="text-xs text-slate-500 font-medium">
            {filteredProducts.length} {language === 'am' ? 'ምርቶች ተገኝተዋል' : 'items displayed'}
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 no-scrollbar scroll-smooth">
          {MARKETPLACE_INDUSTRIES.map((ind) => {
            const Icon = ind.icon;
            const isSelected = selectedIndustry === ind.id;
            const count = industryCounts[ind.id] || 0;

            return (
              <button
                key={ind.id}
                onClick={() => {
                  setSelectedIndustry(ind.id);
                  if (ind.id !== 'all' && selectedCommodity !== 'all') {
                    const com = POPULAR_COMMODITIES.find(c => c.id === selectedCommodity);
                    if (com && com.industryId !== ind.id && com.industryId !== 'all') {
                      setSelectedCommodity('all');
                    }
                  }
                }}
                className={`px-3.5 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap flex items-center gap-2 transition-all cursor-pointer shrink-0 font-ethiopic border ${
                  isSelected
                    ? 'bg-gradient-to-r from-[#08294F] to-[#16845B] text-white border-[#08294F] shadow-md scale-[1.02]'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200/90 hover:border-slate-300 shadow-2xs'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-[#FDE047]' : 'text-slate-500'}`} />
                <span>{language === 'am' ? ind.nameAm : ind.nameEn}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                  isSelected 
                    ? 'bg-white/20 text-[#FDE047]' 
                    : 'bg-slate-100 text-slate-600'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Multi-Factor Filter & Search Dashboard */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 hover:border-slate-300 shadow-xs space-y-3.5">
        
        {/* Row 1: Search + Commodity Type Dropdown + Material 3 Sector Toggle */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          
          {/* Keyword Search Input */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder={language === 'am' ? 'ምርት፣ ንዋያተ ቅድሳት፣ ሰም፣ አልባሳት፣ ማር ይፈልጉ...' : 'Search items, candles, textiles, incense, honey...'}
              className="w-full pl-9 pr-8 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#123B6D]/20 focus:border-[#123B6D] font-ethiopic"
            />
            {localSearch && (
              <button 
                onClick={() => setLocalSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Specific Commodity / Item Type Dropdown */}
          <div className="md:col-span-4">
            <div className="relative">
              <select
                value={selectedCommodity}
                onChange={(e) => setSelectedCommodity(e.target.value)}
                aria-label="Filter by Specific Commodity"
                className="w-full px-3 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 font-bold font-ethiopic focus:outline-none focus:ring-2 focus:ring-[#123B6D]/20 focus:border-[#123B6D] cursor-pointer appearance-none pr-8"
              >
                {availableCommodities.map(com => (
                  <option key={com.id} value={com.id}>
                    {com.id === 'all' 
                      ? (language === 'am' ? '🏷️ የተለየ ዕቃ / Commodity (ሁሉም)' : '🏷️ All Specific Commodities')
                      : (language === 'am' ? `🏷️ ${com.nameAm}` : `🏷️ ${com.nameEn}`)}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* 54-Sector Explorer Button */}
          <div className="md:col-span-3">
            <button
              type="button"
              onClick={() => setShowSectorSelector(!showSectorSelector)}
              className={`w-full px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold font-ethiopic flex items-center justify-between gap-1.5 border transition-all cursor-pointer ${
                selectedSubSector
                  ? 'bg-amber-100/70 border-amber-300 text-amber-950 shadow-2xs'
                  : 'bg-[#F8FAFC] border-slate-200 text-slate-700 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-1.5 truncate">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#D4A72C] shrink-0" />
                <span className="truncate">
                  {selectedSubSector 
                    ? (language === 'am' ? selectedSubSector.nameAm : selectedSubSector.nameEn)
                    : (language === 'am' ? '54ቱ የገበያ ዘርፎች...' : '54 Market Sectors...')}
                </span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform ${showSectorSelector ? 'rotate-180' : ''}`} />
            </button>
          </div>

        </div>

        {/* Row 2: Segment Toggle, Condition, Price Range, Location, Sort */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-1">
          
          {/* Segment Filter: Retail vs Wholesale */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 block mb-1 font-ethiopic uppercase">
              {language === 'am' ? 'የግብይት ዓይነት' : 'Trade Segment'}
            </label>
            <div className="flex items-center bg-[#F8FAFC] p-1 border border-slate-200 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveSegment('all')}
                className={`flex-1 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer text-center ${
                  activeSegment === 'all' ? 'bg-white text-[#123B6D] shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {language === 'am' ? 'ሁሉም' : 'All'}
              </button>
              <button
                type="button"
                onClick={() => setActiveSegment('retail')}
                className={`flex-1 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer text-center ${
                  activeSegment === 'retail' ? 'bg-white text-[#123B6D] shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {language === 'am' ? 'ችርቻሮ' : 'Retail'}
              </button>
              <button
                type="button"
                onClick={() => setActiveSegment('wholesale')}
                className={`flex-1 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer text-center flex items-center justify-center gap-1 ${
                  activeSegment === 'wholesale' ? 'bg-white text-[#123B6D] shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Truck className="w-3 h-3 text-[#D4A72C]" />
                <span>{language === 'am' ? 'ጅምላ' : 'MOQ'}</span>
              </button>
            </div>
          </div>

          {/* Condition Filter */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 block mb-1 font-ethiopic uppercase">
              {language === 'am' ? 'የዕቃው ሁኔታ' : 'Item Condition'}
            </label>
            <select
              value={selectedCondition}
              onChange={(e) => setSelectedCondition(e.target.value)}
              className="w-full p-2 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs text-slate-700 font-semibold focus:outline-none focus:ring-1 focus:ring-[#123B6D] cursor-pointer font-ethiopic"
            >
              <option value="all">{language === 'am' ? 'ሁሉም ሁኔታ' : 'All Conditions'}</option>
              <option value="handcrafted">{language === 'am' ? '✨ በእጅ የተሠራ (Handcrafted)' : 'Handcrafted'}</option>
              <option value="new">{language === 'am' ? 'አዲስ (Brand New)' : 'Brand New'}</option>
              <option value="used">{language === 'am' ? 'ጥሩ ይዞታ (Gently Used)' : 'Gently Used'}</option>
            </select>
          </div>

          {/* Price Range */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 block mb-1 font-ethiopic uppercase">
              {language === 'am' ? 'የዋጋ ክልል' : 'Price Range'}
            </label>
            <select
              value={selectedPriceRange}
              onChange={(e) => setSelectedPriceRange(e.target.value)}
              className="w-full p-2 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs text-slate-700 font-semibold focus:outline-none focus:ring-1 focus:ring-[#123B6D] cursor-pointer font-ethiopic"
            >
              <option value="all">{language === 'am' ? 'ሁሉም ዋጋ' : 'Any Price'}</option>
              <option value="under_1000">{language === 'am' ? 'ከ 1,000 ብር በታች' : 'Under 1,000 ETB'}</option>
              <option value="1000_5000">{language === 'am' ? '1,000 - 5,000 ብር' : '1,000 - 5,000 ETB'}</option>
              <option value="5000_25000">{language === 'am' ? '5,000 - 25,000 ብር' : '5,000 - 25,000 ETB'}</option>
              <option value="above_25000">{language === 'am' ? 'ከ 25,000 ብር በላይ' : '25,000+ ETB'}</option>
            </select>
          </div>

          {/* Location */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 block mb-1 font-ethiopic uppercase">
              {language === 'am' ? 'የሻጭ አድራሻ / ከተማ' : 'Location'}
            </label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full p-2 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs text-slate-700 font-semibold focus:outline-none focus:ring-1 focus:ring-[#123B6D] cursor-pointer font-ethiopic"
            >
              <option value="all">{language === 'am' ? 'ሁሉም ከተሞች' : 'All Locations'}</option>
              <option value="Addis Ababa">አዲስ አበባ (Addis Ababa)</option>
              <option value="Gondar">ጎንደር (Gondar)</option>
              <option value="Bahir Dar">ባሕር ዳር (Bahir Dar)</option>
              <option value="Dire Dawa">ድሬ ዳዋ (Dire Dawa)</option>
              <option value="Lalibela">ላሊበላ (Lalibela)</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 block mb-1 font-ethiopic uppercase">
              {language === 'am' ? 'ቅደም ተከተል' : 'Sort By'}
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full p-2 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs text-slate-700 font-semibold focus:outline-none focus:ring-1 focus:ring-[#123B6D] cursor-pointer font-ethiopic"
            >
              <option value="newest">{language === 'am' ? 'አዲስ የተጨመሩ' : 'Newest First'}</option>
              <option value="price_low">{language === 'am' ? 'ዋጋ፡ ከዝቅተኛ ወደ ከፍተኛ' : 'Price: Low to High'}</option>
              <option value="price_high">{language === 'am' ? 'ዋጋ፡ ከከፍተኛ ወደ ዝቅተኛ' : 'Price: High to Low'}</option>
            </select>
          </div>

        </div>

        {/* Expandable Material 3 Sector Component */}
        {showSectorSelector && (
          <div className="pt-3 border-t border-slate-100 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-2 mb-2">
              <span className="text-xs font-bold text-slate-700 font-ethiopic flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#D4A72C]" />
                <span>{language === 'am' ? 'ከ 54ቱ ዝርዝር የገበያና ምርት ዘርፎች ይምረጡ' : 'Select from 54 Material 3 Marketplace Sectors'}</span>
              </span>
              <button
                type="button"
                onClick={() => setShowSectorSelector(false)}
                className="text-xs text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <Material3SectorSelector
              selectedSubCategoryId={selectedSubSector?.id}
              language={language}
              onSelect={(sub, superCat) => {
                setSelectedSubSector(sub);
                setSelectedSuperSector(superCat);
                setShowSectorSelector(false);
              }}
              onClear={() => {
                setSelectedSubSector(null);
                setSelectedSuperSector(null);
              }}
            />
          </div>
        )}

      </div>

      {/* Active Filter Badges Bar */}
      {hasActiveFilters && (
        <div className="flex items-center flex-wrap gap-2 text-xs pt-1">
          <span className="font-bold text-slate-500 font-ethiopic">
            {language === 'am' ? 'ንቁ ማጣሪያዎች፦' : 'Active Filters:'}
          </span>

          {selectedIndustry !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#08294F]/10 text-[#08294F] font-bold border border-[#08294F]/20">
              <span>{language === 'am' ? 'ዘርፍ፦' : 'Sector:'} {MARKETPLACE_INDUSTRIES.find(i => i.id === selectedIndustry)?.nameAm}</span>
              <button onClick={() => setSelectedIndustry('all')} className="hover:opacity-75 cursor-pointer">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {selectedCommodity !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 font-bold border border-amber-200">
              <span>{language === 'am' ? 'ዕቃ፦' : 'Item:'} {POPULAR_COMMODITIES.find(c => c.id === selectedCommodity)?.nameAm}</span>
              <button onClick={() => setSelectedCommodity('all')} className="hover:opacity-75 cursor-pointer">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {selectedSubSector && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-900 font-bold border border-emerald-200">
              <span>54 Sector: {selectedSubSector.nameAm}</span>
              <button onClick={() => setSelectedSubSector(null)} className="hover:opacity-75 cursor-pointer">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {activeSegment !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-semibold border border-slate-200">
              <span>Segment: {activeSegment}</span>
              <button onClick={() => setActiveSegment('all')} className="hover:opacity-75 cursor-pointer">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {selectedCondition !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-semibold border border-slate-200">
              <span>Condition: {selectedCondition}</span>
              <button onClick={() => setSelectedCondition('all')} className="hover:opacity-75 cursor-pointer">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {selectedPriceRange !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200">
              <span>Price Filter</span>
              <button onClick={() => setSelectedPriceRange('all')} className="hover:opacity-75 cursor-pointer">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {selectedLocation !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-50 text-sky-800 font-semibold border border-sky-200">
              <span>Location: {selectedLocation}</span>
              <button onClick={() => setSelectedLocation('all')} className="hover:opacity-75 cursor-pointer">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {localSearch && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-semibold border border-slate-200">
              <span>"{localSearch}"</span>
              <button onClick={() => setLocalSearch('')} className="hover:opacity-75 cursor-pointer">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          <button
            onClick={resetAllFilters}
            className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 ml-auto cursor-pointer font-ethiopic"
          >
            <RotateCcw className="w-3 h-3" />
            <span>{language === 'am' ? 'ሁሉንም ማጣሪያዎች አጽዳ' : 'Clear All Filters'}</span>
          </button>
        </div>
      )}

      {/* Product Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((prod) => {
            const saved = isItemSaved(prod.id);
            return (
              <div
                key={prod.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-[#123B6D]/50 transition-all shadow-xs hover:shadow-md flex flex-col justify-between group"
              >
                <div>
                  {/* Image with MOQ Overlay */}
                  <div 
                    onClick={() => openModal('product_detail', prod)}
                    className="relative aspect-4/3 overflow-hidden bg-slate-100 cursor-pointer"
                  >
                    <img
                      src={prod.imageUrl}
                      alt={prod.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {prod.moq && (
                      <span className="absolute top-2.5 left-2.5 bg-[#08294F] text-[#FDE047] text-[10px] font-bold px-2.5 py-0.5 rounded-md shadow-xs flex items-center gap-1">
                        <Truck className="w-3 h-3" />
                        <span>Wholesale · MOQ: {prod.moq}</span>
                      </span>
                    )}
                    {prod.condition === 'handcrafted' && (
                      <span className="absolute bottom-2.5 left-2.5 bg-white/90 backdrop-blur-xs text-[#08294F] text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow-xs border border-slate-200">
                        ✨ {language === 'am' ? 'በእጅ የተሠራ' : 'Handcrafted'}
                      </span>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSaveItem(prod.id);
                      }}
                      className={`absolute top-2.5 right-2.5 p-1.5 rounded-full backdrop-blur-xs transition-colors cursor-pointer ${
                        saved 
                          ? 'bg-white text-[#D4A72C]' 
                          : 'bg-black/30 text-white hover:bg-white hover:text-slate-800'
                      }`}
                    >
                      {saved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="truncate max-w-[130px] font-medium text-slate-700">{prod.sellerName}</span>
                      {prod.sellerVerified && (
                        <VerificationBadge 
                          type="seller" 
                          size="xs" 
                          label={language === 'am' ? 'የተረጋገጠ ሻጭ' : 'Verified'}
                          entityName={prod.sellerName}
                          entityRole={language === 'am' ? 'የተረጋገጠ የገበያ ነጋዴ' : 'Verified Merchant'}
                          entityAvatar={prod.imageUrl}
                        />
                      )}
                    </div>

                    <h3 
                      onClick={() => openModal('product_detail', prod)}
                      className="font-ethiopic text-sm font-bold text-[#172033] group-hover:text-[#123B6D] transition-colors line-clamp-2 cursor-pointer leading-snug"
                    >
                      {language === 'am' ? prod.amharicTitle || prod.title : prod.title}
                    </h3>

                    {prod.isFlagged && (
                      <div className="bg-rose-50 border border-rose-200 text-rose-800 p-1.5 rounded-lg text-[11px] font-semibold flex items-center gap-1.5">
                        <span className="font-bold text-rose-700">🚩 የታገደ (Flagged):</span>
                        <span className="truncate">{prod.flagReason || (language === 'am' ? 'በግምገማ ላይ' : 'Under Review')}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-1 text-[11px] text-slate-500">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{prod.location}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Pricing */}
                <div>
                  <div className="p-4 pt-3 border-t border-slate-100 flex items-center justify-between mt-2">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-mono">
                        {prod.wholesalePrice ? 'Wholesale Price' : 'Price'}
                      </span>
                      <span className="text-base font-extrabold text-[#08294F]">
                        {prod.price.toLocaleString()} {prod.currency}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <a
                        href={`https://t.me/${(prod.sellerTelegram || 'orthodoxy_economy').replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={language === 'am' ? 'በቴሌግራም አውራ' : 'Direct Telegram'}
                        className="p-1.5 rounded-lg bg-[#0088cc]/10 hover:bg-[#0088cc] text-[#0088cc] hover:text-white transition-all cursor-pointer flex items-center justify-center border border-[#0088cc]/30"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Send className="w-3.5 h-3.5" />
                      </a>
                      <a
                        href={`tel:${prod.sellerPhone || '+251922901083'}`}
                        title={language === 'am' ? 'በስልክ ደውል' : 'Direct Call'}
                        className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-600 text-emerald-600 hover:text-white transition-all cursor-pointer flex items-center justify-center border border-emerald-200"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                      <button
                        onClick={() => openModal('product_detail', prod)}
                        className="text-xs font-semibold text-[#123B6D] hover:text-[#08294F] bg-[#F8FAFC] border border-slate-200 hover:border-[#123B6D] px-3 py-1.5 rounded-lg transition-colors cursor-pointer font-ethiopic"
                      >
                        {language === 'am' ? 'ዝርዝር' : 'Details'}
                      </button>
                    </div>
                  </div>

                  {/* Exact Posted Date, Hour & Minute Footer */}
                  <div className="px-4 py-2.5 bg-slate-50/80 border-t border-slate-100">
                    <PostedDateTime value={prod.createdAt} language={language} />
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-2xl p-12 text-center border border-[#E2E8F0] space-y-3">
          <Package className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-ethiopic text-lg font-bold text-slate-700">
            {language === 'am' ? 'በተመረጡት ማጣሪያዎች መሠረት ምንም ዓይነት ምርት አልተገኘም' : 'No marketplace products found matching filters'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto font-ethiopic">
            {language === 'am' ? 'እባክዎ የተለየ የሸቀጥ ዘርፍ ወይም ዕቃ ይምረጡ፤ ወይም ማጣሪያዎችን ያጽዱ።' : 'Try selecting another commodity sector or clear active filters.'}
          </p>
          <button
            onClick={resetAllFilters}
            className="bg-[#123B6D] text-white px-4 py-2 rounded-xl text-xs font-semibold mt-2 cursor-pointer font-ethiopic"
          >
            {language === 'am' ? 'ማጣሪያዎችን አጽዳ' : t.clearFilters}
          </button>
        </div>
      )}

    </div>
  );
};
