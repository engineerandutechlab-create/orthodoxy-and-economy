import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ShieldCheck, 
  Globe, 
  Mail, 
  Phone, 
  Send, 
  Share2, 
  MapPin, 
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';

export const Footer: React.FC = () => {
  const { t, language, setLanguage, setActiveTab, openModal } = useApp();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const contacts = {
    email: 'fikremariamfikadu2012@gmail.com',
    phone: '+251 922 901 083',
    secondaryPhone: '+251 981 848 698',
    telegram: '@orthodoxy_economy',
    telegramUrl: 'https://t.me/orthodoxy_economy',
    social: '@orthodoxy.and.eco7',
    socialUrl: 'https://www.tiktok.com/@orthodoxy.and.eco7',
  };

  const copyToClipboard = (text: string, key: string) => {
    try {
      navigator.clipboard?.writeText(text);
    } catch {
      // Clipboard API fallback ignored if restricted
    }
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <footer className="bg-gradient-to-b from-[#021814] via-[#052136] to-[#011410] text-slate-300 border-t-2 border-emerald-400/40 pt-16 pb-24 lg:pb-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Core Slogan Banner with Royal Blue & Emerald Styling */}
        <div className="bg-gradient-to-r from-[#032B25]/90 via-[#0A3150]/90 to-[#043329]/90 rounded-3xl p-6 sm:p-8 mb-8 border border-emerald-400/40 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-emerald-950/20">
          <div className="space-y-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 text-emerald-300">
              <span className="font-serif font-bold text-lg text-[#FDE047]">†</span>
              <span className="font-semibold text-xs tracking-wider uppercase text-emerald-300">Orthodox Community Commitment</span>
            </div>
            <p className="font-ethiopic text-sm md:text-base text-white font-medium">
              "{t.coreMessage}"
            </p>
            <p className="font-ethiopic text-xs md:text-sm text-emerald-200">
              "{t.supportingMessage}"
            </p>
          </div>

          <div className="shrink-0 text-center md:text-right space-y-2">
            <span className="inline-block text-[#FDE047] font-ethiopic font-bold text-xs sm:text-sm bg-emerald-950/80 px-4 py-1.5 rounded-xl border border-emerald-400/40 shadow-xs">
              {t.brandSlogan}
            </span>
            <div className="flex items-center justify-center md:justify-end gap-2 pt-1">
              <button
                onClick={() => openModal('contact')}
                className="bg-gradient-to-r from-[#059669] to-[#0284C7] hover:brightness-110 text-white font-bold px-5 py-2.5 rounded-xl text-xs cursor-pointer shadow-md transition-all flex items-center gap-1.5 border border-emerald-300/40"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>ያግኙን (Contact Us)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Highlighted Direct Contact Grid Banner */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-6 mb-12 backdrop-blur-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider font-ethiopic">
                {language === 'am' ? 'ይፋዊ የመገናኛ አድራሻዎቻችን (Official Contacts)' : 'Official Contact Channels'}
              </h3>
            </div>
            <span className="text-[11px] text-[#D4A72C] font-medium hidden sm:inline">
              ቀጥታ ግንኙነት · ክፍት መስመር
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Phone Card */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 hover:border-[#16845B]/60 transition-all flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#16845B]/20 text-[#16845B] flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-400 block font-medium">ስልክ / Phone</span>
                  <a
                    href={`tel:${contacts.phone.replace(/\s+/g, '')}`}
                    className="font-bold text-white text-xs hover:text-[#D4A72C] transition-colors block"
                  >
                    {contacts.phone}
                  </a>
                  <a
                    href={`tel:${contacts.secondaryPhone.replace(/\s+/g, '')}`}
                    className="font-bold text-emerald-200 text-xs hover:text-[#D4A72C] transition-colors block"
                  >
                    {contacts.secondaryPhone}
                  </a>
                </div>
              </div>
              <button
                onClick={() => copyToClipboard(`${contacts.phone} / ${contacts.secondaryPhone}`, 'phone')}
                title="Copy phone numbers"
                className="text-slate-400 hover:text-white p-1.5 rounded-md hover:bg-white/10 cursor-pointer transition-all"
              >
                {copiedKey === 'phone' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            {/* Email Card */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 hover:border-[#2563EB]/60 transition-all flex items-center justify-between group">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-[#2563EB]/20 text-[#60A5FA] flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-400 block font-medium">ኢሜይል / Email</span>
                  <a
                    href={`mailto:${contacts.email}`}
                    className="font-semibold text-slate-200 text-xs hover:text-white transition-colors truncate block"
                  >
                    {contacts.email}
                  </a>
                </div>
              </div>
              <button
                onClick={() => copyToClipboard(contacts.email, 'email')}
                title="Copy email"
                className="text-slate-400 hover:text-white p-1.5 rounded-md hover:bg-white/10 cursor-pointer transition-all shrink-0"
              >
                {copiedKey === 'email' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            {/* Telegram Card */}
            <a
              href={contacts.telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/5 border border-white/10 rounded-xl p-3.5 hover:border-[#38BDF8]/60 transition-all flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#0284C7]/20 text-[#38BDF8] flex items-center justify-center shrink-0">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">ቴሌግራም / Telegram</span>
                  <span className="font-bold text-white text-xs group-hover:text-[#38BDF8] transition-colors">
                    {contacts.telegram}
                  </span>
                </div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors" />
            </a>

            {/* TikTok / Social Media Card */}
            <a
              href={contacts.socialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/5 border border-white/10 rounded-xl p-3.5 hover:border-purple-400/60 transition-all flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0">
                  <Share2 className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">ሶሻል ሚዲያ / TikTok</span>
                  <span className="font-bold text-white text-xs group-hover:text-purple-300 transition-colors">
                    {contacts.social}
                  </span>
                </div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors" />
            </a>
          </div>
        </div>

        {/* Multi-column Navigation with Detailed Column Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 mb-12 text-xs">
          
          {/* Col 1: About & Identity */}
          <div className="col-span-2 md:col-span-4 lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full p-0.5 bg-gradient-to-tr from-[#123B6D] via-[#D4A72C] to-[#581C87] shadow-sm flex items-center justify-center shrink-0">
                <img
                  src="/assets/aistudio/image_01084dd6.png"
                  alt="Orthodoxy and Economy Logo"
                  className="w-full h-full object-cover rounded-full bg-white"
                />
              </div>
              <span className="font-bold text-white tracking-wide text-sm">
                ORTHODOXY & ECONOMY
              </span>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed font-ethiopic">
              {t.footerAboutText}
            </p>
            <div className="pt-1">
              <span className="text-[11px] text-[#D4A72C] font-semibold block font-ethiopic">
                ንቁ፣ ብቁና ታታሪ ኦርቶዶክስ ዘመኑን ለዋጀ አገልግሎት!
              </span>
            </div>
          </div>

          {/* Col 2: Official Contacts List */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px] text-[#D4A72C]">
              ያግኙን (Contact Details)
            </h4>
            <div className="space-y-2.5 text-slate-300 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 block font-medium">ስልክ (Phone)</span>
                <a 
                  href={`tel:${contacts.phone.replace(/\s+/g, '')}`}
                  className="font-bold text-white hover:text-[#D4A72C] transition-colors flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5 text-[#16845B]" />
                  <span>{contacts.phone}</span>
                </a>
                <a 
                  href={`tel:${contacts.secondaryPhone.replace(/\s+/g, '')}`}
                  className="font-bold text-slate-200 hover:text-[#D4A72C] transition-colors flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5 text-[#16845B]" />
                  <span>{contacts.secondaryPhone}</span>
                </a>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 block font-medium">ኢሜይል (Email)</span>
                <a 
                  href={`mailto:${contacts.email}`}
                  className="font-semibold text-slate-200 hover:text-white transition-colors flex items-center gap-1.5 break-all"
                >
                  <Mail className="w-3.5 h-3.5 text-[#93C5FD]" />
                  <span>{contacts.email}</span>
                </a>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 block font-medium">ቴሌግራም (Telegram)</span>
                <a 
                  href={contacts.telegramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-[#93C5FD] hover:underline flex items-center gap-1"
                >
                  <Send className="w-3 h-3" />
                  <span>{contacts.telegram}</span>
                </a>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 block font-medium">ሶሻል ሚዲያ (TikTok)</span>
                <a 
                  href={contacts.socialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-purple-300 hover:underline flex items-center gap-1"
                >
                  <Share2 className="w-3 h-3" />
                  <span>{contacts.social}</span>
                </a>
              </div>
            </div>
          </div>

          {/* Col 3: Jobs & Careers */}
          <div className="space-y-3">
            <h4 className="font-semibold text-white uppercase tracking-wider text-[11px]">
              {t.navJobs}
            </h4>
            <ul className="space-y-2 text-slate-300">
              <li>
                <button onClick={() => setActiveTab('jobs')} className="hover:text-white transition-colors cursor-pointer">
                  {language === 'am' ? 'የቅርብ ጊዜ ክፍት የሥራ ቦታዎች' : 'Latest Job Vacancies'}
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('jobs')} className="hover:text-white transition-colors cursor-pointer">
                  {language === 'am' ? 'የርቀትና የፍሪላንስ ሥራዎች' : 'Remote & Gig Contracts'}
                </button>
              </li>
              <li>
                <button onClick={() => openModal('post', { defaultType: 'job' })} className="text-[#D4A72C] hover:underline cursor-pointer">
                  {language === 'am' ? '+ አዲስ የሥራ ማስታወቂያ ለጥፍ' : '+ Post a Vacancy'}
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Marketplace & Wholesale */}
          <div className="space-y-3">
            <h4 className="font-semibold text-white uppercase tracking-wider text-[11px]">
              {t.navMarketplace}
            </h4>
            <ul className="space-y-2 text-slate-300">
              <li>
                <button onClick={() => setActiveTab('marketplace')} className="hover:text-white transition-colors cursor-pointer">
                  {language === 'am' ? 'የችርቻሮ ምርቶች' : 'Retail Products'}
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('marketplace')} className="hover:text-white transition-colors cursor-pointer">
                  {language === 'am' ? 'የጅምላና የአስመጪዎች ገበያ (B2B)' : 'Wholesale & B2B Imports'}
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('businesses')} className="hover:text-white transition-colors cursor-pointer">
                  {t.navBusinesses}
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('professionals')} className="hover:text-white transition-colors cursor-pointer">
                  {t.navProfessionals}
                </button>
              </li>
            </ul>
          </div>

          {/* Col 5: Trust & Safety */}
          <div className="space-y-3">
            <h4 className="font-semibold text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#D4A72C]" />
              <span>{t.footerLegal}</span>
            </h4>
            <ul className="space-y-2 text-slate-300">
              <li>
                <button onClick={() => setActiveTab('about')} className="hover:text-white transition-colors cursor-pointer">
                  {t.footerVerification}
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('about')} className="hover:text-white transition-colors cursor-pointer">
                  {t.footerGuidelines}
                </button>
              </li>
              <li>
                <button onClick={() => openModal('contact')} className="hover:text-white transition-colors cursor-pointer">
                  {t.footerContactUs}
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-purple-900/40 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p className="font-ethiopic text-center sm:text-left">
            © {new Date().getFullYear()} ORTHODOXY & ECONOMY. {t.footerRights}
          </p>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => openModal('contact')}
              className="text-[#D4A72C] hover:underline cursor-pointer font-bold"
            >
              ያግኙን: +251 922 901 083 / +251 981 848 698
            </button>
            <span>·</span>
            <button 
              onClick={() => setLanguage(language === 'am' ? 'en' : 'am')}
              className="flex items-center gap-1.5 text-slate-300 hover:text-white cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-[#D4A72C]" />
              <span>{language === 'am' ? 'English Language' : 'የአማርኛ ቋንቋ'}</span>
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
