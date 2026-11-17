import React, { useState, useEffect, useMemo } from 'react';
import {
  TrendingUp,
  MapPin,
  Clock,
  X,
  Pause,
  Play,
  Briefcase,
  Package,
  Wrench,
  Building2,
  Sparkles,
  Heart,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export interface ActivityItem {
  id: string;
  type: 'job' | 'product' | 'service' | 'business' | 'story' | 'prayer';
  titleAm: string;
  titleEn: string;
  partyName: string;
  location: string;
  value?: string;
  createdAtMs: number;
  targetTab: 'jobs' | 'marketplace' | 'services' | 'businesses' | 'home' | 'prayers';
}

function formatRelativeTime(ms: number, lang: string): string {
  const diffSec = Math.max(0, Math.floor((Date.now() - ms) / 1000));
  if (diffSec < 60) return lang === 'am' ? 'አሁን' : 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return lang === 'am' ? `ከ${diffMin} ደቂቃ በፊት` : `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return lang === 'am' ? `ከ${diffHr} ሰዓት በፊት` : `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  return lang === 'am' ? `ከ${diffDay} ቀን በፊት` : `${diffDay}d ago`;
}

export const LiveActivityTicker: React.FC = () => {
  const {
    language,
    jobs,
    products,
    services,
    businesses,
    successStories,
    prayers,
    setActiveTab,
  } = useApp();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const activities = useMemo<ActivityItem[]>(() => {
    const items: ActivityItem[] = [];

    jobs.slice(0, 4).forEach((j) => {
      items.push({
        id: `act_job_${j.id}`,
        type: 'job',
        partyName: j.employerName || 'Employer',
        titleAm: `አዲስ የሥራ ማስታወቂያ ለጠፉ፦ ${j.amharicTitle || j.title}`,
        titleEn: `posted a job opportunity: ${j.title}`,
        location: j.location || 'Addis Ababa',
        value: j.budget ? `${Number(j.budget).toLocaleString()} ${j.budgetCurrency || 'ETB'}` : undefined,
        createdAtMs: Date.parse(j.createdAt || '') || 0,
        targetTab: 'jobs',
      });
    });

    products.slice(0, 4).forEach((p) => {
      items.push({
        id: `act_prod_${p.id}`,
        type: 'product',
        partyName: p.sellerName || 'Seller',
        titleAm: `በገበያ አቀረቡ፦ ${p.amharicTitle || p.title}`,
        titleEn: `listed in marketplace: ${p.title}`,
        location: p.location || 'Addis Ababa',
        value: p.price ? `${Number(p.price).toLocaleString()} ${p.currency || 'ETB'}` : undefined,
        createdAtMs: Date.parse(p.createdAt || '') || 0,
        targetTab: 'marketplace',
      });
    });

    services.slice(0, 3).forEach((s) => {
      items.push({
        id: `act_serv_${s.id}`,
        type: 'service',
        partyName: s.providerName || 'Specialist',
        titleAm: `አገልግሎት ይሰጣሉ፦ ${s.amharicTitle || s.title}`,
        titleEn: `offers service: ${s.title}`,
        location: s.location || 'Addis Ababa',
        value: s.rateAmount ? `${Number(s.rateAmount).toLocaleString()} ${s.currency || 'ETB'}` : undefined,
        createdAtMs: Date.parse(s.createdAt || '') || 0,
        targetTab: 'services',
      });
    });

    businesses.slice(0, 2).forEach((b) => {
      items.push({
        id: `act_biz_${b.id}`,
        type: 'business',
        partyName: b.nameAm || b.name,
        titleAm: `የተረጋገጠ ድርጅት (${b.category})`,
        titleEn: `registered enterprise (${b.category})`,
        location: b.location || 'Addis Ababa',
        createdAtMs: Date.parse(b.createdAt || '') || 0,
        targetTab: 'businesses',
      });
    });

    successStories.slice(0, 2).forEach((st) => {
      items.push({
        id: `act_story_${st.id}`,
        type: 'story',
        partyName: st.userName,
        titleAm: `የስኬት ምስክርነት አካፈሉ፦ ${st.titleAm}`,
        titleEn: `shared a community testimony: ${st.titleEn || st.titleAm}`,
        location: st.location || 'Addis Ababa',
        createdAtMs: Date.parse(st.createdAt || '') || 0,
        targetTab: 'home',
      });
    });

    prayers.slice(0, 2).forEach((pr) => {
      items.push({
        id: `act_prayer_${pr.id}`,
        type: 'prayer',
        partyName: pr.authorName,
        titleAm: `የጸሎት ጥያቄ አቀረቡ፦ ${pr.titleAm || pr.title}`,
        titleEn: `shared a prayer request: ${pr.title || pr.titleAm}`,
        location: pr.parish || 'Orthodox Community',
        createdAtMs: Date.parse(pr.createdAt || '') || 0,
        targetTab: 'prayers',
      });
    });

    return items.sort((a, b) => b.createdAtMs - a.createdAtMs);
  }, [jobs, products, services, businesses, successStories, prayers]);

  useEffect(() => {
    if (isPaused || !isVisible || activities.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activities.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused, isVisible, activities.length]);

  useEffect(() => {
    if (currentIndex >= activities.length && activities.length > 0) {
      setCurrentIndex(0);
    }
  }, [activities.length, currentIndex]);

  if (!isVisible || activities.length === 0) return null;

  const current = activities[currentIndex % activities.length];

  const getTypeIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'job':
        return Briefcase;
      case 'product':
        return Package;
      case 'service':
        return Wrench;
      case 'business':
        return Building2;
      case 'story':
        return Sparkles;
      case 'prayer':
        return Heart;
      default:
        return TrendingUp;
    }
  };

  const IconComp = getTypeIcon(current.type);

  return (
    <div
      className="bg-gradient-to-r from-[#031527] via-[#08294F] to-[#04201C] text-white border-y border-emerald-500/25 px-4 sm:px-6 py-2 shadow-sm text-xs select-none transition-all"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Left Label */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="font-extrabold uppercase tracking-wider text-[#FDE047] text-[10px] sm:text-xs font-ethiopic">
            {language === 'am' ? 'የማኅበረሰብ እንቅስቃሴ' : 'COMMUNITY UPDATES'}
          </span>
          <span className="hidden md:inline text-white/30">|</span>
        </div>

        {/* Center: Live Firestore Record */}
        <button
          type="button"
          onClick={() => setActiveTab(current.targetTab)}
          className="flex-1 min-w-0 flex items-center gap-2 overflow-hidden text-left cursor-pointer hover:opacity-90 transition-opacity"
        >
          <div className="p-1 rounded-md bg-white/10 text-[#FDE047] shrink-0">
            <IconComp className="w-3.5 h-3.5" />
          </div>

          <p className="truncate text-slate-100 font-ethiopic text-xs">
            <span className="font-bold text-[#FDE047]">{current.partyName}</span>{' '}
            <span className="text-slate-200">
              {language === 'am' ? current.titleAm : current.titleEn}
            </span>
          </p>

          {current.value && (
            <span className="hidden lg:inline-block text-emerald-300 font-mono tabular-nums text-[11px] font-bold shrink-0">
              · {current.value}
            </span>
          )}

          <div className="hidden sm:flex items-center gap-1 text-[11px] text-slate-400 shrink-0 font-ethiopic">
            <MapPin className="w-3 h-3 text-slate-400" />
            <span className="max-w-[140px] truncate">{current.location}</span>
            {current.createdAtMs > 0 && (
              <>
                <span className="text-white/30">·</span>
                <Clock className="w-3 h-3 text-slate-400" />
                <span>{formatRelativeTime(current.createdAtMs, language)}</span>
              </>
            )}
          </div>
        </button>

        {/* Right Controls */}
        <div className="flex items-center gap-1.5 shrink-0 text-slate-400">
          <button
            type="button"
            onClick={() => setIsPaused(!isPaused)}
            title={isPaused ? 'Play' : 'Pause'}
            aria-label={isPaused ? 'Resume updates' : 'Pause updates'}
            className="p-1 hover:text-white rounded hover:bg-white/10 transition cursor-pointer"
          >
            {isPaused ? <Play className="w-3 h-3 text-emerald-400" /> : <Pause className="w-3 h-3" />}
          </button>

          <button
            type="button"
            onClick={() => setIsVisible(false)}
            title="Dismiss"
            aria-label="Dismiss community updates bar"
            className="p-1 hover:text-white rounded hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
