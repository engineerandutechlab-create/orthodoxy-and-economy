import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { aiService, AISemanticSearch } from '../../services/aiService';
import { 
  Search, 
  MapPin, 
  Filter, 
  X, 
  SlidersHorizontal, 
  ArrowRight, 
  Sparkles,
  RefreshCw 
} from 'lucide-react';

interface UniversalSearchProps {
  onSearchSubmit?: () => void;
}

export const UniversalSearch: React.FC<UniversalSearchProps> = ({ onSearchSubmit }) => {
  const { 
    t, 
    language,
    searchQuery, 
    setSearchQuery, 
    selectedCategory, 
    setSelectedCategory, 
    selectedLocation, 
    setSelectedLocation,
    selectedTypeFilter,
    setSelectedTypeFilter,
    setActiveTab,
  } = useApp();

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<AISemanticSearch | null>(null);

  const categoryTabs = [
    { id: 'All', label: t.searchAll },
    { id: 'jobs', label: t.searchJobs },
    { id: 'products', label: t.searchProducts },
    { id: 'services', label: t.searchServices },
    { id: 'businesses', label: t.searchBusinesses },
    { id: 'professionals', label: t.searchProfessionals },
  ];

  const locations = [
    'All',
    'Addis Ababa (አዲስ አበባ)',
    'Bole (ቦሌ)',
    'Merkato (መርካቶ)',
    'Bahir Dar (ባሕር ዳር)',
    'Gondar (ጎንደር)',
    'Hawassa (ሐዋሳ)',
    'Dire Dawa (ድሬዳዋ)',
    'Mekelle (መቐለ)',
    'Adama (አዳማ)',
    'Diaspora / International (ዲያስፖራ)',
  ];

  const handleTabClick = (catId: string) => {
    setSelectedCategory(catId);
    if (catId !== 'All') {
      setActiveTab(catId as any);
    }
  };

  const handleClear = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedLocation('All');
    setSelectedTypeFilter('all');
    setAiAnalysisResult(null);
  };

  const handleAiSmartSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsAiSearching(true);
    try {
      const parsed = await aiService.semanticSearch(searchQuery);
      setAiAnalysisResult(parsed);

      if (parsed.extractedLocation) {
        setSelectedLocation(parsed.extractedLocation);
      }
      if (parsed.isRemote) {
        setSelectedTypeFilter('remote');
      } else if (parsed.isWholesale) {
        setSelectedTypeFilter('wholesale');
      }

      // Switch tab based on intent
      if (parsed.intent === 'find_job') {
        setSelectedCategory('jobs');
        setActiveTab('jobs');
      } else if (parsed.intent === 'find_product') {
        setSelectedCategory('products');
        setActiveTab('marketplace');
      } else if (parsed.intent === 'find_service') {
        setSelectedCategory('services');
        setActiveTab('services');
      } else if (parsed.intent === 'find_business') {
        setSelectedCategory('businesses');
        setActiveTab('businesses');
      } else if (parsed.intent === 'find_professional') {
        setSelectedCategory('professionals');
        setActiveTab('professionals');
      }
    } catch (e) {
      console.warn('AI search error:', e);
    } finally {
      setIsAiSearching(false);
    }
  };

  return (
    <div className="w-full bg-white rounded-3xl shadow-[0_12px_40px_-5px_rgba(5,150,105,0.12)] border border-emerald-200/70 p-4 sm:p-6 -mt-10 relative z-20">
      
      {/* Category Segmented Control Tabs */}
      <div className="flex items-center justify-between overflow-x-auto pb-3 mb-4 scrollbar-none border-b border-slate-100 gap-2">
        <div className="flex items-center gap-1.5">
          {categoryTabs.map((tab) => {
            const isSelected = selectedCategory === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-[#0284C7] via-[#059669] to-[#047857] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* AI Semantic Search Trigger Badge */}
        <button
          onClick={handleAiSmartSearch}
          disabled={isAiSearching || !searchQuery.trim()}
          className="shrink-0 hidden md:flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-900 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-40"
        >
          {isAiSearching ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-[#059669]" />}
          <span>✨ AI Semantic Search</span>
        </button>
      </div>

      {/* Main Search Input & Quick Controls */}
      <div className="flex flex-col md:flex-row items-stretch gap-3">
        
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                if (searchQuery.length > 15) {
                  handleAiSmartSearch();
                } else if (onSearchSubmit) {
                  onSearchSubmit();
                }
              }
            }}
            placeholder={language === 'am' ? 'ሥራ፣ ምርት፣ አገልግሎት ወይም ንግድ በነፃ ቋንቋ ይፈልጉ...' : 'Search jobs, products, or services in natural language...'}
            className="w-full pl-11 pr-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm text-[#172033] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#059669]/25 focus:border-[#059669] transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Location Dropdown */}
        <div className="relative min-w-[200px]">
          <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            aria-label={t.searchFilterLocation}
            className="w-full pl-10 pr-8 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs sm:text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#059669]/25 focus:border-[#059669] cursor-pointer appearance-none"
          >
            {locations.map((loc) => (
              <option key={loc} value={loc === 'All' ? 'All' : loc}>
                {loc === 'All' ? t.searchFilterLocation + ': ' + t.searchAll : loc}
              </option>
            ))}
          </select>
        </div>

        {/* Filters Toggle Button */}
        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          className={`px-4 py-3 rounded-xl border text-xs sm:text-sm font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer ${
            filtersOpen || selectedTypeFilter !== 'all'
              ? 'border-[#059669] text-[#047857] bg-emerald-50'
              : 'border-[#E2E8F0] text-slate-700 hover:bg-slate-50'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span className="hidden sm:inline">Filters</span>
        </button>

        {/* Search Submit Action */}
        <button
          onClick={() => {
            if (searchQuery.length > 15) {
              handleAiSmartSearch();
            } else {
              if (onSearchSubmit) onSearchSubmit();
              if (selectedCategory !== 'All') {
                setActiveTab(selectedCategory as any);
              } else if (searchQuery.trim()) {
                setActiveTab('jobs');
              }
            }
          }}
          className="bg-gradient-to-r from-[#0284C7] via-[#059669] to-[#047857] hover:opacity-95 text-white px-7 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
        >
          <span>{isAiSearching ? 'AI Analyzing...' : t.searchButton}</span>
          <ArrowRight className="w-4 h-4 text-[#FDE047]" />
        </button>
      </div>

      {/* 54 Sectors Quick Suggestion Tags */}
      <div className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] scrollbar-none font-ethiopic">
        <span className="text-slate-600 font-semibold shrink-0 text-[10px] uppercase tracking-wider">
          {language === 'am' ? 'ተወዳጅ ዘርፎች:' : 'Hot Sectors:'}
        </span>
        {[
          { label: 'የሞባይል መተግበሪያ', tab: 'jobs' },
          { label: 'የአካዳሚክና ሳይንስ', tab: 'jobs' },
          { label: 'ቅዱሳት ሥዕላት', tab: 'marketplace' },
          { label: 'የኤሌክትሪክ ዝርጋታ', tab: 'services' },
          { label: 'ንጹሕ ማር ማምረት', tab: 'marketplace' },
          { label: 'የካህናት አልባሳት', tab: 'marketplace' },
          { label: 'የቤት ውስጥ ነርሲንግ', tab: 'services' },
          { label: 'የሒሳብ አያያዝ ኦዲት', tab: 'services' },
        ].map((tag) => (
          <button
            key={tag.label}
            onClick={() => {
              setSearchQuery(tag.label);
              setActiveTab(tag.tab as any);
            }}
            className="shrink-0 px-2.5 py-1 bg-slate-100 hover:bg-purple-100/70 hover:text-purple-900 text-slate-600 rounded-lg transition-colors cursor-pointer"
          >
            {tag.label}
          </button>
        ))}
      </div>

      {/* AI Semantic Search Feedback Strip */}
      {aiAnalysisResult && (
        <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-900 flex flex-wrap items-center justify-between gap-2 animate-in fade-in">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#D4A72C] shrink-0" />
            <span>
              <strong>AI Identified Intent:</strong> {aiAnalysisResult.intent.replace('find_', '').toUpperCase()}
              {aiAnalysisResult.extractedLocation && ` in ${aiAnalysisResult.extractedLocation}`}
              {aiAnalysisResult.maxBudget && ` (Budget ≤ ${aiAnalysisResult.maxBudget.toLocaleString()} ETB)`}
            </span>
          </div>
          <button
            onClick={() => setAiAnalysisResult(null)}
            className="text-purple-600 hover:underline font-bold"
          >
            Clear AI Tag
          </button>
        </div>
      )}

      {/* Expandable Advanced Filters */}
      {filtersOpen && (
        <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block text-slate-500 font-medium mb-1.5">
              Listing Modality / ዓይነት
            </label>
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'all', label: 'All Listings' },
                { id: 'remote', label: 'Remote / የርቀት' },
                { id: 'wholesale', label: 'Wholesale / B2B' },
                { id: 'verified_only', label: 'Verified Only' },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setSelectedTypeFilter(item.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs transition-colors cursor-pointer ${
                    selectedTypeFilter === item.id 
                      ? 'bg-[#3B1C54] text-white font-medium' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-slate-500 font-medium mb-1.5">
              Quick Reset
            </label>
            <button
              onClick={handleClear}
              className="text-slate-600 hover:text-[#C0392B] underline cursor-pointer py-1"
            >
              {t.clearFilters}
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
