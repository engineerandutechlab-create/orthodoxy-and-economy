import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ShieldCheck, 
  Heart, 
  Handshake, 
  Scale, 
  TrendingUp, 
  Users, 
  MapPin, 
  Mail, 
  Phone,
  CheckCircle2,
  Award
} from 'lucide-react';

export const AboutView: React.FC = () => {
  const { t, language, currentUser, openModal } = useApp();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      
      {/* Hero Banner */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-[#D4A72C]/15 text-[#08294F] px-4 py-1.5 rounded-full text-xs font-bold font-ethiopic">
          <span>†</span>
          <span>{t.brandSlogan}</span>
        </div>
        <h1 className="font-ethiopic text-3xl sm:text-5xl font-black text-[#08294F] leading-tight">
          {language === 'am' ? 'የኦርቶዶክሳውያን የጋራ ኢኮኖሚና የሥራ ትስስር ራእይ' : 'The Vision of Orthodox Christian Economic Solidarity'}
        </h1>
        <p className="font-ethiopic text-sm sm:text-base text-slate-600 leading-relaxed">
          "{t.coreMessage}"
        </p>
      </div>

      {/* Official Declarations */}
      <div className="bg-gradient-to-r from-[#08294F] to-[#123B6D] text-white rounded-3xl p-8 sm:p-12 shadow-md space-y-6">
        <div className="border border-[#D4A72C]/35 bg-white/5 rounded-2xl p-6 space-y-2">
          <h2 className="font-ethiopic text-xl sm:text-2xl font-black text-white">
            {language === 'am' ? 'መሠረታዊ የማኅበረሰብ ቃል ኪዳን' : 'Core Community Charter'}
          </h2>
          <p className="font-ethiopic text-sm sm:text-base text-slate-200 leading-relaxed">
            "{t.supportingMessage}"
          </p>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-ethiopic">
          {language === 'am'
            ? 'ይህ መድረክ የተቋቋመው ኦርቶዶክሳውያን ባለሙያዎች፣ ነጋዴዎች፣ አምራቾች፣ አሠሪዎችና የሥራ ፈላጊዎች ያለምንም ማነቆ በነፃነት የሚገናኙበት፣ ፍትሐዊ የሥራ ውልና ንግድ የሚመሰርቱበት፣ እንዲሁም አንዱ ሌላውን በማብቃት የጋራ ኢኮኖሚያዊ ጥንካሬ የምንፈጥርበት ዘመናዊ ዲጂታል ሥነ-ምኅዳር እንዲሆን ነው።'
            : 'Orthodoxy & Economy exists to dismantle barriers between employers and workers, buyers and sellers, importers and distributors—fostering transparent commercial ties grounded in Christian integrity and mutual advancement.'
          }
        </p>
      </div>

      {/* 3 Core Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            title: language === 'am' ? 'ፍትሐዊነትና ታማኝነት' : 'Integrity & Fair Trade',
            desc: language === 'am' 
              ? 'በክርስቲያናዊ ሥነ-ምግባር የሚመራ እውነተኛ ዋጋ፣ ጥራት ያላቸው ዕቃዎችና ለሠራተኛ ተገቢውን ክፍያ የሚሰጥ አሠራር።'
              : 'Honest pricing, premium craftsmanship, and fair wages honoring the dignity of labor.',
            icon: Scale,
          },
          {
            title: language === 'am' ? 'ቀጥተኛ ግንኙነት' : 'Direct Intermediation',
            desc: language === 'am' 
              ? 'ያለ ደላሎችና አላስፈላጊ ወጪዎች አሠሪ ከሠራተኛ፣ አስመጪ ከአከፋፋይ ጋር በቀጥታ እንዲገናኝ ያስችላል።'
              : 'Zero unnecessary middlemen, direct conversations, transparent bids, and zero hidden platform cuts.',
            icon: Handshake,
          },
          {
            title: language === 'am' ? 'የጋራ ብልጽግና' : 'Mutual Growth & Support',
            desc: language === 'am' 
              ? 'ለወጣቶች የሥራ ዕድል መፍጠር፣ የአገር ውስጥ አምራቾችን ማበረታታትና የዲያስፖራውን ትስስር ማጠናከር።'
              : 'Empowering youth employment, patronizing local producers, and bridging global diaspora connections.',
            icon: TrendingUp,
          },
        ].map((pillar, i) => {
          const Icon = pillar.icon;
          return (
            <div key={i} className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#123B6D]/10 text-[#123B6D] flex items-center justify-center font-bold">
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="font-ethiopic text-base font-bold text-[#08294F]">{pillar.title}</h3>
              <p className="font-ethiopic text-xs sm:text-sm text-slate-600 leading-relaxed">{pillar.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Verification & Trust Requirements */}
      <div className="bg-white rounded-3xl border border-[#E2E8F0] p-8 sm:p-10 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#D4A72C]/15 text-[#D4A72C] flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-ethiopic text-xl font-bold text-[#08294F]">
              {language === 'am' ? 'የማኅበረሰብ ማረጋገጫ (Blue Badge) እንዴት ይሰጣል?' : 'How Verification Badges are Awarded'}
            </h2>
            <p className="text-xs text-slate-500">
              Preserving trust, authenticity, and accountability
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm text-slate-700 font-ethiopic">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#16845B] shrink-0 mt-0.5" />
            <span><strong>ለአሠሪዎችና ድርጅቶች፦</strong> ሕጋዊ የታደሰ የንግድ ፈቃድና የቲን (TIN) ቁጥር ማረጋገጫ።</span>
          </div>
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#16845B] shrink-0 mt-0.5" />
            <span><strong>ለባለሙያዎች፦</strong> የሙያ ማረጋገጫ ምስክር ወረቀትና የቀደምት ሥራዎች ማጣቀሻ።</span>
          </div>
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#16845B] shrink-0 mt-0.5" />
            <span><strong>ለአስመጪዎችና ጅምላ ሻጮች፦</strong> የጉምሩክ ክሊራንስና የጥራት ደረጃ ሰርተፊኬት።</span>
          </div>
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#16845B] shrink-0 mt-0.5" />
            <span><strong>ለአባላት፦</strong> የተረጋገጠ የስልክና የቴሌግራም መለያ ከማኅበረሰብ አስተዳደር ጋር።</span>
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={() => openModal(currentUser ? 'profile' : 'auth')}
            className="bg-gradient-to-r from-[#123B6D] to-[#4A154B] hover:opacity-95 text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-xs inline-flex items-center gap-2"
          >
            <span>{language === 'am' ? 'የማረጋገጫ ባጅ ጥያቄ ያቅርቡ' : 'Submit Verification Credentials'}</span>
          </button>
        </div>
      </div>

      {/* Official Contacts Banner (ያግኙን) */}
      <div className="bg-gradient-to-r from-[#0F2347] via-[#2A104A] to-[#4A154B] text-white rounded-3xl p-8 sm:p-10 shadow-lg border border-[#D4A72C]/30 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-purple-800/40 pb-4">
          <div className="space-y-1">
            <span className="text-[#D4A72C] text-xs font-bold uppercase tracking-wider">
              {language === 'am' ? 'ይፋዊ የመገናኛ አድራሻዎች' : 'Direct Communications'}
            </span>
            <h2 className="font-ethiopic text-2xl font-black text-white">
              {language === 'am' ? 'ያግኙን / Contact Us' : 'Connect with the Administration'}
            </h2>
          </div>

          <button
            onClick={() => openModal('contact')}
            className="bg-[#D4A72C] hover:bg-[#c29623] text-[#08294F] font-bold px-5 py-2.5 rounded-xl text-xs sm:text-sm transition-all shadow-xs cursor-pointer self-start sm:self-auto"
          >
            {language === 'am' ? 'መልእክት ይላኩልን' : 'Send Message'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="bg-white/10 backdrop-blur-xs p-4 rounded-2xl border border-white/10 space-y-1">
            <span className="text-slate-400 block text-[10px]">ስልክ / Direct Phone</span>
            <a href="tel:+251922901083" className="font-bold text-white text-sm hover:text-[#D4A72C] block">
              +251 922 901 083
            </a>
            <a href="tel:+251981848698" className="font-bold text-emerald-200 text-sm hover:text-[#D4A72C] block">
              +251 981 848 698
            </a>
          </div>

          <div className="bg-white/10 backdrop-blur-xs p-4 rounded-2xl border border-white/10 space-y-1">
            <span className="text-slate-400 block text-[10px]">ኢሜይል / Official Email</span>
            <a href="mailto:fikremariamfikadu2012@gmail.com" className="font-bold text-white text-xs hover:text-[#D4A72C] block truncate">
              fikremariamfikadu2012@gmail.com
            </a>
          </div>

          <div className="bg-white/10 backdrop-blur-xs p-4 rounded-2xl border border-white/10 space-y-1">
            <span className="text-slate-400 block text-[10px]">ቴሌግራም / Telegram</span>
            <a href="https://t.me/orthodoxy_economy" target="_blank" rel="noopener noreferrer" className="font-bold text-[#93C5FD] text-sm hover:underline block">
              @orthodoxy_economy
            </a>
          </div>

          <div className="bg-white/10 backdrop-blur-xs p-4 rounded-2xl border border-white/10 space-y-1">
            <span className="text-slate-400 block text-[10px]">ሶሻል ሚዲያ / TikTok</span>
            <a href="https://www.tiktok.com/@orthodoxy.and.eco7" target="_blank" rel="noopener noreferrer" className="font-bold text-purple-300 text-sm hover:underline block">
              @orthodoxy.and.eco7
            </a>
          </div>
        </div>
      </div>

    </div>
  );
};
