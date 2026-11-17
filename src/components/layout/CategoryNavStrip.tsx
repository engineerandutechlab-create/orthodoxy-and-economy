import React from 'react';
import { useApp } from '../../context/AppContext';
import { ContentFeedCategory } from '../../types';
import {
  LayoutGrid,
  Sparkles,
  ShoppingBag,
  Flame,
  Wrench,
  Briefcase,
  Truck,
} from 'lucide-react';

export const CategoryNavStrip: React.FC = () => {
  const { contentFeedCategory, selectContentFeedCategory, language } = useApp();

  const items: {
    id: ContentFeedCategory;
    labelEn: string;
    labelAm: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { id: 'all', labelEn: 'All', labelAm: 'ሁሉም (All)', icon: LayoutGrid },
    {
      id: 'freelance_gigs',
      labelEn: 'Freelance & Gigs',
      labelAm: 'ፍሪላንስና ጊግስ (Gigs)',
      icon: Sparkles,
    },
    {
      id: 'marketplace',
      labelEn: 'Marketplace',
      labelAm: 'የገበያ መድረክ',
      icon: ShoppingBag,
    },
    {
      id: 'spiritual_items',
      labelEn: 'Spiritual Items',
      labelAm: 'መንፈሳዊ ንዋያተ ቅድሳት',
      icon: Flame,
    },
    {
      id: 'services',
      labelEn: 'Services',
      labelAm: 'ሙያዊ አገልግሎቶች',
      icon: Wrench,
    },
    {
      id: 'jobs',
      labelEn: 'Jobs',
      labelAm: 'ክፍት የሥራ ቦታዎች',
      icon: Briefcase,
    },
    {
      id: 'b2b_wholesale',
      labelEn: 'B2B Wholesale',
      labelAm: 'የጅምላ ንግድ (B2B)',
      icon: Truck,
    },
  ];

  return (
    <div className="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-2xs transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = contentFeedCategory === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => selectContentFeedCategory(item.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer shrink-0 font-ethiopic border ${
                  isActive
                    ? 'bg-[#123B6D] text-white border-[#123B6D] shadow-xs dark:bg-[#D4A72C] dark:text-[#08294F] dark:border-[#D4A72C]'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-[#123B6D]/50 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 shrink-0 ${
                    isActive
                      ? 'text-[#FDE047] dark:text-[#08294F]'
                      : 'text-[#123B6D] dark:text-[#D4A72C]'
                  }`}
                />
                <span>{language === 'am' ? item.labelAm : item.labelEn}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
