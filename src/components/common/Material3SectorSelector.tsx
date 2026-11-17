import React, { useState, useMemo } from 'react';
import { 
  WORK_SECTORS_DATA, 
  SuperCategory, 
  SubCategory, 
  ALL_54_WORK_SUBCATEGORIES 
} from '../../data/workSectors';
import { 
  Search, 
  X, 
  Check, 
  ChevronRight, 
  GraduationCap, 
  Hammer, 
  Code, 
  HeartPulse, 
  Wheat, 
  Camera, 
  Truck, 
  Sparkles, 
  Scale,
  SlidersHorizontal,
  Layers
} from 'lucide-react';

interface Material3SectorSelectorProps {
  selectedSubCategoryId?: string;
  onSelect: (subCategory: SubCategory, superCategory: SuperCategory) => void;
  language?: 'am' | 'en' | 'om' | 'ti';
  allowClear?: boolean;
  onClear?: () => void;
  compact?: boolean;
  className?: string;
  placeholder?: string;
}

export const Material3SectorSelector: React.FC<Material3SectorSelectorProps> = ({
  selectedSubCategoryId,
  onSelect,
  language = 'am',
  allowClear = true,
  onClear,
  compact = false,
  className = '',
  placeholder
}) => {
  const [activeSuperCatId, setActiveSuperCatId] = useState<string>(
    WORK_SECTORS_DATA[0].id
  );
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState<boolean>(!compact);

  // Map icon names to lucide components
  const getIcon = (name: string, classNameStr: string = 'w-4 h-4') => {
    switch (name) {
      case 'GraduationCap': return <GraduationCap className={classNameStr} />;
      case 'Hammer': return <Hammer className={classNameStr} />;
      case 'Code': return <Code className={classNameStr} />;
      case 'HeartPulse': return <HeartPulse className={classNameStr} />;
      case 'Wheat': return <Wheat className={classNameStr} />;
      case 'Camera': return <Camera className={classNameStr} />;
      case 'Truck': return <Truck className={classNameStr} />;
      case 'Sparkles': return <Sparkles className={classNameStr} />;
      case 'Scale': return <Scale className={classNameStr} />;
      default: return <Layers className={classNameStr} />;
    }
  };

  const currentSuperCat = useMemo(() => {
    return WORK_SECTORS_DATA.find(c => c.id === activeSuperCatId) || WORK_SECTORS_DATA[0];
  }, [activeSuperCatId]);

  // Selected subcategory object
  const selectedSub = useMemo(() => {
    if (!selectedSubCategoryId) return null;
    return ALL_54_WORK_SUBCATEGORIES.find(s => s.id === selectedSubCategoryId || s.nameAm === selectedSubCategoryId || s.nameEn === selectedSubCategoryId);
  }, [selectedSubCategoryId]);

  // Global search across all 54 subcategories
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase().trim();
    return ALL_54_WORK_SUBCATEGORIES.filter(s => 
      s.nameAm.toLowerCase().includes(q) ||
      s.nameEn.toLowerCase().includes(q) ||
      s.superCategoryNameAm.toLowerCase().includes(q) ||
      s.superCategoryNameEn.toLowerCase().includes(q) ||
      s.keywords.some(k => k.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  const defaultPlaceholder = language === 'am'
    ? 'ከ 54ቱ ዝርዝር የሥራና የአገልግሎት ዘርፎች ይምረጡ...'
    : 'Select from 54 detailed sectors...';

  return (
    <div className={`space-y-3 ${className}`}>
      
      {/* Header / Selected Chip (Material 3 Surface) */}
      {selectedSub && (
        <div className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 border border-purple-200/90 shadow-2xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-8 h-8 rounded-xl bg-[#123B6D] text-white flex items-center justify-center text-xs shrink-0 shadow-xs">
              <Check className="w-4 h-4 text-[#D4A72C]" />
            </span>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 block truncate font-ethiopic">
                {language === 'am' ? selectedSub.superCategoryNameAm : selectedSub.superCategoryNameEn}
              </span>
              <p className="text-xs sm:text-sm font-extrabold text-slate-900 truncate font-ethiopic">
                {language === 'am' ? selectedSub.nameAm : selectedSub.nameEn}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs font-bold text-[#123B6D] hover:underline px-2.5 py-1 bg-white rounded-lg border border-slate-200 cursor-pointer shadow-2xs font-ethiopic"
            >
              {isExpanded ? (language === 'am' ? 'አሳንስ' : 'Collapse') : (language === 'am' ? 'ቀይር' : 'Change')}
            </button>
            {allowClear && onClear && (
              <button
                type="button"
                onClick={onClear}
                className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                title="Clear selection"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Material 3 Expansion Body */}
      {(!selectedSub || isExpanded) && (
        <div className="bg-white rounded-3xl border border-purple-200/80 shadow-xs overflow-hidden transition-all duration-200">
          
          {/* Top Search Bar with M3 styling */}
          <div className="p-3 sm:p-4 bg-slate-50/70 border-b border-slate-100 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={placeholder || defaultPlaceholder}
                className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#123B6D]/20 focus:border-[#123B6D] font-ethiopic"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <span className="text-[11px] font-bold text-[#123B6D] bg-purple-100/60 px-2.5 py-1 rounded-lg font-mono shrink-0">
              54 {language === 'am' ? 'ዘርፎች' : 'Sectors'}
            </span>
          </div>

          {/* If Search is Active: Show Flat Search Results */}
          {searchResults ? (
            <div className="p-4 max-h-72 overflow-y-auto space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 pb-1 font-ethiopic">
                <span>
                  {language === 'am' ? `የተገኙ ውጤቶች፦ ${searchResults.length}` : `Search results: ${searchResults.length}`}
                </span>
                <span className="text-[10px] text-purple-700 font-medium">54 ዝርዝር ሙያዎች</span>
              </div>

              {searchResults.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500 font-ethiopic">
                  {language === 'am' 
                    ? 'ምንም የተዛመደ የሥራ ዘርፍ አልተገኘም። እባክዎ ሌላ ቃል ይፈልጉ።' 
                    : 'No matching work sectors found. Try another keyword.'}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {searchResults.map((sub) => {
                    const isSelected = selectedSubCategoryId === sub.id || selectedSubCategoryId === sub.nameAm || selectedSubCategoryId === sub.nameEn;
                    const superCat = WORK_SECTORS_DATA.find(c => c.id === sub.superCategoryId);

                    return (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => {
                          if (superCat) onSelect(sub, superCat);
                        }}
                        className={`p-3 rounded-2xl text-left border transition-all cursor-pointer flex items-start justify-between gap-2 ${
                          isSelected 
                            ? 'bg-[#123B6D] text-white border-[#123B6D] shadow-xs' 
                            : 'bg-[#F8FAFC] hover:bg-purple-50/60 border-slate-200/80 hover:border-purple-300'
                        }`}
                      >
                        <div>
                          <span className={`text-[10px] font-bold uppercase tracking-wider block font-ethiopic ${
                            isSelected ? 'text-purple-200' : 'text-[#3B1C54]'
                          }`}>
                            {language === 'am' ? sub.superCategoryNameAm : sub.superCategoryNameEn}
                          </span>
                          <p className={`text-xs sm:text-sm font-bold font-ethiopic mt-0.5 ${
                            isSelected ? 'text-white' : 'text-slate-900'
                          }`}>
                            {language === 'am' ? sub.nameAm : sub.nameEn}
                          </p>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-[#D4A72C] shrink-0 mt-1" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* Standard Material 3 Two-Tier Selector: 8 Super Categories + Subcategories */
            <div className="flex flex-col md:flex-row min-h-[300px] max-h-[420px]">
              
              {/* Left Column: 8 Super Category Rails */}
              <div className="md:w-5/12 bg-slate-50/70 border-r border-slate-100 p-2 sm:p-2.5 overflow-y-auto space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 block font-ethiopic">
                  {language === 'am' ? '8ቱ ዋና ዋና ዘርፎች (Super Categories)' : '8 Super Categories'}
                </span>

                {WORK_SECTORS_DATA.map((cat) => {
                  const isActive = activeSuperCatId === cat.id;

                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setActiveSuperCatId(cat.id)}
                      className={`w-full p-2.5 rounded-2xl text-left transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                        isActive
                          ? 'bg-gradient-to-r from-[#123B6D] to-[#3B1C54] text-white shadow-xs font-bold scale-[1.01]'
                          : 'text-slate-700 hover:bg-white hover:shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                          isActive 
                            ? 'bg-white/20 text-[#D4A72C]' 
                            : 'bg-white border border-slate-200 text-[#123B6D]'
                        }`}>
                          {getIcon(cat.iconName, 'w-4 h-4')}
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-bold truncate font-ethiopic leading-tight">
                            {language === 'am' ? cat.nameAm : cat.nameEn}
                          </p>
                          <p className={`text-[10px] truncate ${isActive ? 'text-purple-200' : 'text-slate-400'}`}>
                            {cat.badgeCount} {language === 'am' ? 'ሙያዎች' : 'trades'}
                          </p>
                        </div>
                      </div>

                      <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-amber-300' : 'text-slate-300'}`} />
                    </button>
                  );
                })}
              </div>

              {/* Right Column: Subcategories for the Active Super Category */}
              <div className="md:w-7/12 p-3 sm:p-4 overflow-y-auto bg-white flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-[#123B6D]/10 text-[#123B6D] flex items-center justify-center text-xs">
                        {getIcon(currentSuperCat.iconName, 'w-3.5 h-3.5')}
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 font-ethiopic">
                        {language === 'am' ? currentSuperCat.nameAm : currentSuperCat.nameEn}
                      </h4>
                    </div>

                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 font-mono text-slate-600 font-bold">
                      {currentSuperCat.subcategories.length} {language === 'am' ? 'ሙያዎች' : 'options'}
                    </span>
                  </div>

                  {/* Subcategories Grid */}
                  <div className="grid grid-cols-1 gap-2">
                    {currentSuperCat.subcategories.map((sub) => {
                      const isSelected = selectedSubCategoryId === sub.id || selectedSubCategoryId === sub.nameAm || selectedSubCategoryId === sub.nameEn;

                      return (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => onSelect(sub, currentSuperCat)}
                          className={`w-full p-3 rounded-2xl text-left border transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                            isSelected
                              ? 'bg-[#123B6D] text-white border-[#123B6D] shadow-xs'
                              : 'bg-[#F8FAFC] hover:bg-purple-50/70 border-slate-200/80 hover:border-purple-300 text-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className={`w-2 h-2 rounded-full shrink-0 ${
                              isSelected ? 'bg-amber-300 ring-4 ring-amber-300/20' : 'bg-[#123B6D]'
                            }`} />
                            <span className={`text-xs sm:text-sm font-bold font-ethiopic leading-snug truncate ${
                              isSelected ? 'text-white' : 'text-slate-800'
                            }`}>
                              {language === 'am' ? sub.nameAm : sub.nameEn}
                            </span>
                          </div>

                          {isSelected ? (
                            <Check className="w-4 h-4 text-[#D4A72C] shrink-0" />
                          ) : (
                            <span className="text-[10px] text-slate-400 group-hover:text-purple-700 font-medium font-ethiopic">
                              {language === 'am' ? 'ምረጥ' : 'Select'}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 font-ethiopic flex items-center justify-between">
                  <span>
                    {language === 'am' ? '💡 ማንኛውንም ዘርፍ በመጫን ወዲያውኑ ማጣራት ይችላሉ' : 'Click any sector to apply filter'}
                  </span>
                </div>
              </div>

            </div>
          )}

        </div>
      )}

    </div>
  );
};
