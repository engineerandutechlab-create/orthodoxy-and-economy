import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Briefcase, 
  ShoppingBag, 
  Wrench, 
  Building2, 
  Users, 
  Truck, 
  ArrowUpRight,
  GraduationCap,
  Hammer,
  Code,
  HeartPulse,
  Wheat,
  Camera,
  Sparkles,
  Scale,
  Search,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { WORK_SECTORS_DATA, SuperCategory, SubCategory } from '../../data/workSectors';

export const CategoryGrid: React.FC = () => {
  const { t, language, setActiveTab, setSearchQuery, jobs, products, services, businesses, professionals } = useApp();
  const [selectedSuperCatId, setSelectedSuperCatId] = useState<string>('all');

  const categories = [
    {
      id: 'jobs',
      icon: Briefcase,
      title: t.catJobsTitle,
      description: t.catJobsDesc,
      count: jobs.length,
      countSuffix: language === 'am' ? 'ክፍት የሥራ ቦታዎች' : 'open positions',
      color: 'from-[#123B6D]/10 to-[#123B6D]/5',
      iconBg: 'bg-[#123B6D] text-white',
      accentColor: '#123B6D',
    },
    {
      id: 'marketplace',
      icon: ShoppingBag,
      title: t.catMarketplaceTitle,
      description: t.catMarketplaceDesc,
      count: products.length,
      countSuffix: language === 'am' ? 'የተዘረዘሩ ምርቶች' : 'listed items',
      color: 'from-[#2563EB]/10 to-[#2563EB]/5',
      iconBg: 'bg-[#2563EB] text-white',
      accentColor: '#2563EB',
    },
    {
      id: 'services',
      icon: Wrench,
      title: t.catServicesTitle,
      description: t.catServicesDesc,
      count: services.length,
      countSuffix: language === 'am' ? 'የሙያ አገልግሎቶች' : 'active offerings',
      color: 'from-[#16845B]/10 to-[#16845B]/5',
      iconBg: 'bg-[#16845B] text-white',
      accentColor: '#16845B',
    },
    {
      id: 'businesses',
      icon: Building2,
      title: t.catBusinessesTitle,
      description: t.catBusinessesDesc,
      count: businesses.length,
      countSuffix: language === 'am' ? 'የተመዘገቡ ድርጅቶች' : 'registered enterprises',
      color: 'from-[#08294F]/10 to-[#08294F]/5',
      iconBg: 'bg-[#08294F] text-white',
      accentColor: '#08294F',
    },
    {
      id: 'professionals',
      icon: Users,
      title: t.catProfessionalsTitle,
      description: t.catProfessionalsDesc,
      count: professionals.length,
      countSuffix: language === 'am' ? 'የተመሰከረላቸው ባለሙያዎች' : 'verified experts',
      color: 'from-[#D98B16]/10 to-[#D98B16]/5',
      iconBg: 'bg-[#D98B16] text-white',
      accentColor: '#D98B16',
    },
    {
      id: 'businesses_importers',
      icon: Truck,
      title: t.catImportersTitle,
      description: t.catImportersDesc,
      count: businesses.filter(b => b.type === 'importer').length || 4,
      countSuffix: language === 'am' ? 'አስመጪዎችና ጅምላ ሻጮች' : 'importers & wholesale hubs',
      color: 'from-[#D4A72C]/15 to-[#D4A72C]/5',
      iconBg: 'bg-[#D4A72C] text-[#08294F]',
      accentColor: '#D4A72C',
      targetTab: 'businesses',
    },
  ];

  const getSuperIcon = (iconName: string) => {
    switch (iconName) {
      case 'GraduationCap': return GraduationCap;
      case 'Hammer': return Hammer;
      case 'Code': return Code;
      case 'HeartPulse': return HeartPulse;
      case 'Wheat': return Wheat;
      case 'Camera': return Camera;
      case 'Truck': return Truck;
      case 'Sparkles': return Sparkles;
      case 'Scale': return Scale;
      default: return Briefcase;
    }
  };

  const handleSubsectorClick = (sub: SubCategory, target: 'jobs' | 'services' | 'marketplace') => {
    setSearchQuery(sub.nameAm);
    setActiveTab(target);
  };

  const displayedSectors = selectedSuperCatId === 'all'
    ? WORK_SECTORS_DATA
    : WORK_SECTORS_DATA.filter(s => s.id === selectedSuperCatId);

  return (
    <section className="py-16 bg-slate-50 space-y-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold text-[#123B6D] tracking-wider uppercase">
              {language === 'am' ? 'የዘርፍ ማውጫ' : 'Ecosystem Sectors'}
            </span>
            <h2 className="font-ethiopic text-2xl sm:text-3xl font-extrabold text-[#08294F]">
              {t.categoriesTitle}
            </h2>
            <p className="font-ethiopic text-sm text-slate-500">
              {t.categoriesSubtitle}
            </p>
          </div>
        </div>

        {/* 6 Core Category Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.id}
                onClick={() => setActiveTab((cat.targetTab || cat.id) as any)}
                className="group bg-white rounded-2xl p-6 border border-emerald-100/80 hover:border-emerald-300 shadow-xs hover:shadow-[0_8px_30px_rgba(5,150,105,0.08)] transition-all duration-200 cursor-pointer flex flex-col justify-between relative overflow-hidden"
              >
                <div 
                  className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl opacity-0 group-hover:opacity-100 transition-opacity rounded-bl-full pointer-events-none"
                  style={{ backgroundImage: `linear-gradient(to bottom left, ${cat.accentColor}15, transparent)` }}
                />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-xs ${cat.iconBg}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <ArrowUpRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-700 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  </div>

                  <div>
                    <h3 className="font-ethiopic text-lg font-bold text-[#172033] group-hover:text-emerald-950 transition-colors">
                      {cat.title}
                    </h3>
                    <p className="font-ethiopic text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                      {cat.description}
                    </p>
                  </div>
                </div>

                <div className="pt-6 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium font-ethiopic">
                  <span>
                    <strong className="text-slate-800 font-bold mr-1">{cat.count}</strong>
                    {cat.countSuffix}
                  </span>
                  <span className="text-[#059669] font-bold group-hover:underline">
                    {language === 'am' ? 'ተመልከት →' : 'Explore →'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* 54 Detailed Work Sectors Showcase (Material 3 Two-Tier Architecture) */}
        <div className="mt-16 bg-white rounded-3xl p-6 sm:p-8 border border-emerald-100 shadow-[0_10px_35px_-5px_rgba(5,150,105,0.06)]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-200/80 text-xs font-bold font-ethiopic mb-2">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Material 3 • 8 ዋና ዘርፎች • 54 የተሟሉ ሙያዎች</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-[#08294F] font-ethiopic">
                {language === 'am' ? '54ቱ የተሟሉ የሥራና የአገልግሎት ዘርፎች' : '54 Specialized Work & Service Sectors'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 font-ethiopic mt-1">
                {language === 'am'
                  ? 'ከታች ካሉት ዘርፎች አንዱን በመምረጥ በፍሪላንስ፣ በአገልግሎት ወይም በገበያ ላይ ያሉትን ሥራዎች በቀጥታ ያስሱ'
                  : 'Select any sector to explore matching jobs, professional services, or specialized market offerings'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setActiveTab('jobs');
                }}
                className="px-4 py-2 bg-gradient-to-r from-[#0284C7] via-[#059669] to-[#047857] text-white rounded-xl text-xs font-bold hover:opacity-90 transition-all shadow-sm flex items-center gap-1.5 cursor-pointer font-ethiopic"
              >
                <Briefcase className="w-3.5 h-3.5 text-[#FDE047]" />
                <span>{language === 'am' ? 'በሥራ ገበያ ፈልግ' : 'Search Jobs'}</span>
              </button>
            </div>
          </div>

          {/* Super Category Rail / Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
            <button
              onClick={() => setSelectedSuperCatId('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer font-ethiopic flex items-center gap-2 ${
                selectedSuperCatId === 'all'
                  ? 'bg-gradient-to-r from-[#0284C7] to-[#059669] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>{language === 'am' ? 'ሁሉንም 54 ዘርፎች' : 'All 54 Sectors'}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                selectedSuperCatId === 'all' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}>54</span>
            </button>

            {WORK_SECTORS_DATA.map((sc) => {
              const SuperIcon = getSuperIcon(sc.iconName);
              const isSelected = selectedSuperCatId === sc.id;
              return (
                <button
                  key={sc.id}
                  onClick={() => setSelectedSuperCatId(sc.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer font-ethiopic flex items-center gap-2 ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#123B6D] to-[#3B1C54] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <SuperIcon className="w-3.5 h-3.5" />
                  <span>{language === 'am' ? sc.nameAm : sc.nameEn}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {sc.subcategories.length}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Sectors Grid */}
          <div className="space-y-6">
            {displayedSectors.map((superCat) => {
              const SuperIcon = getSuperIcon(superCat.iconName);
              return (
                <div key={superCat.id} className="border border-slate-100 rounded-2xl p-4 sm:p-5 bg-slate-50/50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 shadow-2xs flex items-center justify-center text-[#123B6D]">
                        <SuperIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-ethiopic text-sm sm:text-base font-bold text-slate-900">
                          {language === 'am' ? superCat.nameAm : superCat.nameEn}
                        </h4>
                        <p className="text-[11px] text-slate-500 font-ethiopic line-clamp-1">
                          {language === 'am' ? superCat.descriptionAm : superCat.descriptionEn}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-600 font-mono">
                      {superCat.subcategories.length} ዘርፎች
                    </span>
                  </div>

                  {/* Subcategories Pills / Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 pt-2">
                    {superCat.subcategories.map((sub) => (
                      <div
                        key={sub.id}
                        className="bg-white hover:bg-purple-50/40 p-3 rounded-xl border border-slate-200/80 hover:border-purple-300 transition-all shadow-2xs group flex flex-col justify-between"
                      >
                        <div>
                          <div className="text-xs font-bold text-slate-800 font-ethiopic group-hover:text-purple-900 leading-tight">
                            {sub.nameAm}
                          </div>
                          <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                            {sub.nameEn}
                          </div>
                        </div>

                        {/* Quick filter actions */}
                        <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-slate-100 text-[10px] text-slate-500 font-ethiopic">
                          <button
                            onClick={() => handleSubsectorClick(sub, 'jobs')}
                            className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 hover:bg-blue-100 transition-colors font-medium cursor-pointer"
                            title="በሥራዎች ውስጥ ፈልግ"
                          >
                            ሥራ
                          </button>
                          <button
                            onClick={() => handleSubsectorClick(sub, 'services')}
                            className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition-colors font-medium cursor-pointer"
                            title="በአገልግሎቶች ውስጥ ፈልግ"
                          >
                            አገልግሎት
                          </button>
                          <button
                            onClick={() => handleSubsectorClick(sub, 'marketplace')}
                            className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 hover:bg-amber-100 transition-colors font-medium cursor-pointer"
                            title="በገበያ ውስጥ ፈልግ"
                          >
                            ገበያ
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
};

