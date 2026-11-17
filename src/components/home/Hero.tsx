import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Briefcase, 
  ShoppingBag, 
  Building2, 
  Users, 
  ArrowRight, 
  ShieldCheck, 
  TrendingUp, 
  Sparkles,
  CheckCircle2,
  Image as ImageIcon
} from 'lucide-react';

export const Hero: React.FC = () => {
  const { t, language, setActiveTab, openModal, jobs, products, businesses, professionals } = useApp();
  const [heroBg, setHeroBg] = useState<'cathedral' | 'deacons'>('cathedral');

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#021A15] via-[#052136] to-[#041626] text-white pt-10 pb-20 md:pt-14 md:pb-24 border-b border-emerald-400/30">
      
      {/* Real Authentic Orthodox Heritage Background Photos with High Clarity */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img
          src={heroBg === 'cathedral' ? '/assets/aistudio/image_6776db67.png' : '/assets/aistudio/image_8ece76a6.png'}
          alt={heroBg === 'cathedral' ? 'Medhane Alem Cathedral' : 'Ethiopian Orthodox Deacons'}
          className={`w-full h-full object-cover transition-all duration-700 ease-out ${
            heroBg === 'cathedral' 
              ? 'object-[center_28%] brightness-[0.84] contrast-110 scale-100' 
              : 'object-[center_22%] brightness-[0.87] contrast-105 scale-100'
          }`}
        />
        
        {/* Soft, Calibrated Dual Gradient Overlay: Deep Sapphire Blue + Rich Emerald Green */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#021814]/94 via-[#062438]/78 to-[#052d47]/45" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#021511] via-transparent to-black/30 pointer-events-none" />
      </div>

      {/* Luminous Emerald & Sapphire Blue Atmospheric Glows */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-gradient-to-br from-emerald-500/15 via-blue-600/20 to-teal-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-[450px] h-[450px] bg-gradient-to-tr from-blue-700/20 via-emerald-600/15 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Subtle Ethiopian Geometric Ribbon / Star backdrop motif */}
      <div className="absolute inset-0 opacity-10 pointer-events-none z-1">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
          <defs>
            <pattern id="ethio-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 40 M 0 0 L 40 40" fill="none" stroke="#34D399" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#ethio-grid)" />
        </svg>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Interactive Photo Switcher */}
        <div className="flex items-center justify-between mb-6 pb-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-xs text-emerald-300 font-ethiopic font-semibold">
              {language === 'am' ? '† የኦርቶዶክሳውያን ታሪካዊ መድረክ' : '† Authentic Orthodox Heritage'}
            </span>
          </div>

          {/* Quick Photo Switcher */}
          <div className="inline-flex items-center gap-1.5 p-1 bg-black/60 backdrop-blur-md rounded-2xl border border-emerald-400/30 text-xs shadow-lg">
            <button
              type="button"
              onClick={() => setHeroBg('cathedral')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl font-medium transition-all cursor-pointer ${
                heroBg === 'cathedral' 
                  ? 'bg-gradient-to-r from-[#059669] to-[#0284C7] text-white shadow-sm font-bold border border-emerald-300/40' 
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
              title="መድኃኔዓለም ካቴድራል"
            >
              <img src="/assets/aistudio/image_6776db67.png" className="w-4 h-4 rounded-full object-cover" alt="" />
              <span>{language === 'am' ? '🏛️ መድኃኔዓለም ካቴድራል' : '🏛️ Cathedral'}</span>
            </button>
            <button
              type="button"
              onClick={() => setHeroBg('deacons')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl font-medium transition-all cursor-pointer ${
                heroBg === 'deacons' 
                  ? 'bg-gradient-to-r from-[#059669] to-[#0284C7] text-white shadow-sm font-bold border border-emerald-300/40' 
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
              title="የሰንበት ት/ቤት ዲያቆናት"
            >
              <img src="/assets/aistudio/image_8ece76a6.png" className="w-4 h-4 rounded-full object-cover" alt="" />
              <span>{language === 'am' ? '🕊️ የሰንበት ት/ቤት ዲያቆናት' : '🕊️ Deacons'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Vision, Headline, Slogan, and CTAs */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            {/* Brand Logo & Slogan Pill Tag with Green & Blue Ring */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full p-1 bg-gradient-to-tr from-[#059669] via-[#0284C7] to-[#D4A72C] shadow-xl shrink-0">
                <img
                  src="/assets/aistudio/image_01084dd6.png"
                  alt="Orthodoxy and Economy Logo"
                  className="w-full h-full object-cover rounded-full bg-white ring-2 ring-emerald-400/40"
                />
              </div>
              <div className="inline-flex items-center gap-2 bg-emerald-950/60 backdrop-blur-xs border border-emerald-400/40 px-3.5 py-1.5 rounded-full text-xs font-ethiopic text-emerald-200 shadow-xs">
                <span className="font-serif text-[#FDE047] font-bold">†</span>
                <span>{t.brandSlogan}</span>
              </div>
            </div>

            {/* Main Headline */}
            <h1 className="font-ethiopic text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight text-balance">
              {t.heroHeadline}
            </h1>

            {/* Description */}
            <p className="font-ethiopic text-base sm:text-lg text-slate-200 max-w-2xl leading-relaxed mx-auto lg:mx-0">
              {t.heroDescription}
            </p>

            {/* Supporting Core Message */}
            <div className="bg-white/5 border border-emerald-400/25 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-200 font-ethiopic italic max-w-xl mx-auto lg:mx-0 text-left">
              &ldquo;{t.supportingMessage}&rdquo;
            </div>

            {/* Primary & Secondary Action Buttons with Green & Blue Radiance */}
            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4">
              <button
                onClick={() => setActiveTab('jobs')}
                className="w-full sm:w-auto bg-gradient-to-r from-[#059669] via-[#0284C7] to-[#047857] hover:brightness-110 text-white font-extrabold px-7 py-3.5 rounded-xl text-sm sm:text-base transition-all shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 cursor-pointer border border-emerald-300/40"
              >
                <span>{t.heroPrimaryCta}</span>
                <ArrowRight className="w-4 h-4 text-[#FDE047]" />
              </button>

              <button
                onClick={() => setActiveTab('knowledge')}
                className="w-full sm:w-auto bg-gradient-to-r from-blue-900/80 via-[#063327]/80 to-blue-900/80 hover:brightness-110 text-white border border-emerald-400/50 font-bold px-5 py-3.5 rounded-xl text-sm sm:text-base transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <Sparkles className="w-4 h-4 text-[#FDE047]" />
                <span>{language === 'am' ? '📖 ኦርቶዶክሳዊ ዕውቀት (AI)' : '📖 Orthodox AI'}</span>
              </button>

              <button
                onClick={() => openModal('contact')}
                className="w-full sm:w-auto bg-emerald-950/60 hover:bg-emerald-900/70 text-emerald-200 border border-emerald-400/40 font-semibold px-4 py-3.5 rounded-xl text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>ያግኙን (Contact)</span>
              </button>
            </div>

            {/* Key Ecosystem Stakeholders Bar */}
            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs text-slate-300 font-ethiopic">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                {language === 'am' ? 'አሠሪና ሠራተኛ' : 'Employer & Employee'}
              </span>
              <span className="text-slate-500">·</span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
                {language === 'am' ? 'ገዢና ሻጭ' : 'Buyer & Seller'}
              </span>
              <span className="text-slate-500">·</span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                {language === 'am' ? 'አስመጪና አከፋፋይ' : 'Importer & Distributor'}
              </span>
            </div>

          </div>

          {/* Right Column: Visual Ecosystem Card & Real-time Platform Proof */}
          <div className="lg:col-span-5">
            <div className="bg-gradient-to-b from-[#021F19]/90 via-[#07253D]/90 to-[#031B15]/90 backdrop-blur-md rounded-2xl p-6 border border-emerald-400/40 shadow-2xl relative shadow-emerald-950/40">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-emerald-400/20">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-emerald-200">
                    {language === 'am' ? 'የተረጋገጠ የጋራ ገበያ' : 'Verified Trade Network'}
                  </span>
                </div>
                <span className="text-xs text-emerald-300 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>100% Verified</span>
                </span>
              </div>

              {/* Stakeholder Connection Map */}
              <div className="space-y-3 font-ethiopic">
                
                {/* 1. Employer ↔ Employee */}
                <div 
                  onClick={() => setActiveTab('jobs')}
                  className="bg-white/5 hover:bg-emerald-900/30 border border-emerald-500/20 hover:border-emerald-400/50 rounded-xl p-3 flex items-center justify-between transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-600/25 text-blue-300 flex items-center justify-center border border-blue-400/30">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-semibold text-white group-hover:text-emerald-300 transition-colors">
                        {language === 'am' ? 'አሠሪ ↔ ሠራተኛ (የሥራ ገበያ)' : 'Employers ↔ Job Seekers'}
                      </p>
                      <p className="text-[11px] text-slate-300">
                        {jobs.length} {language === 'am' ? 'ክፍት የሥራ ቦታዎች' : 'Active Openings'}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-300 transition-colors" />
                </div>

                {/* 2. Buyer ↔ Seller */}
                <div 
                  onClick={() => setActiveTab('marketplace')}
                  className="bg-white/5 hover:bg-blue-900/30 border border-blue-500/20 hover:border-blue-400/50 rounded-xl p-3 flex items-center justify-between transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-600/25 text-emerald-300 flex items-center justify-center border border-emerald-400/30">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-semibold text-white group-hover:text-blue-300 transition-colors">
                        {language === 'am' ? 'ገዢ ↔ ሻጭ (ችርቻሮና ጅምላ)' : 'Buyers ↔ Sellers'}
                      </p>
                      <p className="text-[11px] text-slate-300">
                        {products.length} {language === 'am' ? 'የተዘረዘሩ ጥራት ያላቸው ምርቶች' : 'Products & Bulk Goods'}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-300 transition-colors" />
                </div>

                {/* 3. Importer ↔ Distributor */}
                <div 
                  onClick={() => setActiveTab('businesses')}
                  className="bg-white/5 hover:bg-emerald-900/30 border border-emerald-500/20 hover:border-emerald-400/50 rounded-xl p-3 flex items-center justify-between transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-teal-600/25 text-teal-300 flex items-center justify-center border border-teal-400/30">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-semibold text-white group-hover:text-teal-300 transition-colors">
                        {language === 'am' ? 'አስመጪ ↔ አከፋፋይ (B2B)' : 'Importers ↔ Distributors'}
                      </p>
                      <p className="text-[11px] text-slate-300">
                        {businesses.length} {language === 'am' ? 'የተመዘገቡ ንግዶችና አስመጪዎች' : 'Registered Commercial Firms'}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-300 transition-colors" />
                </div>

                {/* 4. Professional ↔ Customer */}
                <div 
                  onClick={() => setActiveTab('professionals')}
                  className="bg-white/5 hover:bg-sky-900/30 border border-sky-500/20 hover:border-sky-400/50 rounded-xl p-3 flex items-center justify-between transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-sky-600/25 text-sky-300 flex items-center justify-center border border-sky-400/30">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-semibold text-white group-hover:text-sky-300 transition-colors">
                        {language === 'am' ? 'ባለሙያ ↔ ተገልጋይ (አማካሪዎች)' : 'Professionals ↔ Clients'}
                      </p>
                      <p className="text-[11px] text-slate-300">
                        {professionals.length} {language === 'am' ? 'የተመሰከረላቸው ባለሙያዎች' : 'Verified Specialists'}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-sky-300 transition-colors" />
                </div>

              </div>

              {/* Bottom Quick Quote */}
              <div className="mt-4 pt-3 border-t border-emerald-400/20 flex items-center justify-between text-[11px] text-slate-300">
                <span>Addis Ababa · Regional Capitals · Diaspora</span>
                <span className="text-emerald-300 font-semibold">Direct & Free</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
