import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ShieldCheck, 
  UserCheck, 
  Scale, 
  Handshake, 
  CheckCircle2, 
  ArrowRight,
  TrendingUp,
  FileCheck2
} from 'lucide-react';
import { ReviewsSection } from '../common/ReviewsSection';
import { PWAInstallButton } from '../common/PWAInstallButton';

export const TrustAndHowItWorks: React.FC = () => {
  const { t, language, openModal, setActiveTab } = useApp();

  const steps = [
    {
      num: '01',
      title: t.step1Title,
      desc: t.step1Desc,
      icon: UserCheck,
    },
    {
      num: '02',
      title: t.step2Title,
      desc: t.step2Desc,
      icon: FileCheck2,
    },
    {
      num: '03',
      title: t.step3Title,
      desc: t.step3Desc,
      icon: Handshake,
    },
  ];

  const trustPrinciples = [
    {
      title: t.trustCard1Title,
      desc: t.trustCard1Desc,
      icon: Scale,
    },
    {
      title: t.trustCard2Title,
      desc: t.trustCard2Desc,
      icon: TrendingUp,
    },
    {
      title: t.trustCard3Title,
      desc: t.trustCard3Desc,
      icon: Handshake,
    },
  ];

  return (
    <div className="space-y-24 py-16 bg-slate-50">
      
      {/* HOW IT WORKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-bold text-[#123B6D] tracking-wider uppercase">
            {language === 'am' ? 'ቀላል አሠራር' : 'Simple Workflow'}
          </span>
          <h2 className="font-ethiopic text-2xl sm:text-3xl font-extrabold text-[#08294F]">
            {t.howItWorksHeading}
          </h2>
          <p className="font-ethiopic text-xs sm:text-sm text-slate-500">
            {t.howItWorksSubheading}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="bg-white rounded-2xl p-6 sm:p-8 border border-purple-100 hover:border-purple-300 shadow-xs hover:shadow-md transition-all relative flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-900 border border-purple-200/60 flex items-center justify-center font-bold">
                      <Icon className="w-6 h-6 text-purple-700" />
                    </div>
                    <span className="text-2xl font-black text-purple-200 font-mono">
                      {step.num}
                    </span>
                  </div>

                  <h3 className="font-ethiopic text-lg font-bold text-[#172033]">
                    {step.title}
                  </h3>

                  <p className="font-ethiopic text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-purple-50 flex items-center gap-1.5 text-xs text-purple-800 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-[#16845B]" />
                  <span>{language === 'am' ? 'በቀላሉ የሚከናወን' : 'Verified Process'}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* TRUST & VERIFICATION STANDARDS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-purple-100 p-6 sm:p-12 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-5 space-y-4 text-center lg:text-left">
              <div className="inline-flex items-center gap-1.5 bg-[#D4A72C]/15 text-[#08294F] px-3 py-1 rounded-full text-xs font-bold">
                <ShieldCheck className="w-4 h-4 text-[#D4A72C]" />
                <span>{language === 'am' ? 'የታማኝነት ሥርዓት' : 'Community Trust System'}</span>
              </div>

              <h2 className="font-ethiopic text-2xl sm:text-3xl font-extrabold text-[#08294F]">
                {t.trustHeading}
              </h2>

              <p className="font-ethiopic text-xs sm:text-sm text-slate-600 leading-relaxed">
                {language === 'am' 
                  ? 'በዚህ መድረክ ላይ የሚሳተፉ አሠሪዎች፣ ሻጮች፣ ባለሙያዎችና አስመጪዎች በማኅበረሰባችን መመሪያ መሠረት ተረጋግጠው ሰማያዊ የማረጋገጫ ባጅ ይሰጣቸዋል።'
                  : 'Every employer, merchant, and professional on this platform can request formal community vetting to establish trust and credibility.'
                }
              </p>

              <div className="pt-2">
                <button
                  onClick={() => openModal('auth')}
                  className="bg-[#123B6D] hover:bg-[#08294F] text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-xs inline-flex items-center gap-2"
                >
                  <span>{language === 'am' ? 'የማረጋገጫ ባጅ ይጠይቁ' : 'Apply for Verification'}</span>
                  <ArrowRight className="w-4 h-4 text-[#D4A72C]" />
                </button>
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {trustPrinciples.map((tp, idx) => {
                const Icon = tp.icon;
                return (
                  <div key={idx} className="bg-[#F8FAFC] rounded-2xl p-5 border border-[#E2E8F0] space-y-2">
                    <div className="w-9 h-9 rounded-lg bg-white text-[#123B6D] flex items-center justify-center border border-slate-200 shadow-xs">
                      <Icon className="w-5 h-5 text-[#123B6D]" />
                    </div>
                    <h4 className="font-ethiopic text-sm font-bold text-[#172033]">
                      {tp.title}
                    </h4>
                    <p className="font-ethiopic text-xs text-slate-500 leading-relaxed">
                      {tp.desc}
                    </p>
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      </section>

      {/* VERIFIED COMMUNITY REVIEWS & TESTIMONIALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ReviewsSection />
      </section>

      {/* PWA INSTALL BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PWAInstallButton variant="banner" />
      </section>

      {/* FINAL CALL TO ACTION WITH DEACONS PHOTO BACKGROUND */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl p-8 sm:p-14 text-white text-center space-y-6 shadow-2xl relative overflow-hidden border border-sky-300/30">
          
          {/* Authentic Ethiopian Orthodox Deacons Background Photo (High Clarity) */}
          <div className="absolute inset-0 z-0">
            <img 
              src="/assets/aistudio/image_8ece76a6.png" 
              alt="Ethiopian Orthodox Deacons & Youth" 
              className="w-full h-full object-cover object-[center_28%] brightness-[0.78] contrast-110"
            />
            {/* Balanced Vignette & Overlay: Keeps faces & garments clear while guaranteeing text legibility */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#05162B]/85 via-[#082244]/75 to-[#05162B]/85" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#05162B] via-transparent to-black/40" />
          </div>

          <div className="relative z-10 max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1 rounded-full border border-white/20 text-[#FDE047] text-xs font-semibold">
              <span>†</span>
              <span>{t.brandSlogan}</span>
            </div>
            
            <h2 className="font-ethiopic text-2xl sm:text-4xl font-black text-white leading-tight drop-shadow-md">
              {language === 'am' ? 'ዛሬውኑ ይቀላቀሉን፣ አብረን እንደግ!' : 'Join Our Vibrant Economic Ecosystem Today'}
            </h2>
            <p className="font-ethiopic text-xs sm:text-sm text-sky-100 drop-shadow-sm">
              "{t.coreMessage}"
            </p>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={() => openModal('post')}
              className="w-full sm:w-auto bg-[#D4A72C] hover:bg-[#c29623] text-[#08294F] font-bold px-7 py-3.5 rounded-xl text-sm transition-all shadow-lg cursor-pointer flex items-center justify-center gap-2"
            >
              <span>{t.heroSecondaryCta}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setActiveTab('jobs')}
              className="w-full sm:w-auto bg-white/20 hover:bg-white/30 text-white border border-white/40 font-semibold px-7 py-3.5 rounded-xl text-sm transition-all cursor-pointer backdrop-blur-xs"
            >
              <span>{t.heroPrimaryCta}</span>
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
