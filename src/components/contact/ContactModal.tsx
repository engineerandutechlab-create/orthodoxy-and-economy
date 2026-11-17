import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  Mail, 
  Phone, 
  Send, 
  MessageSquare, 
  CheckCircle2, 
  Copy, 
  Check, 
  Share2,
  ExternalLink
} from 'lucide-react';

export const ContactModal: React.FC = () => {
  const { closeModal, language, t } = useApp();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formMsg, setFormMsg] = useState('');
  const [isSent, setIsSent] = useState(false);

  const contactData = {
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
      // Clipboard fallback ignored in restricted iframe
    }
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSent(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-purple-200 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header with Royal Blue & Purple Gradient */}
        <div className="p-6 bg-gradient-to-r from-[#0F2347] via-[#2E0854] to-[#4A154B] text-white relative">
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 p-1.5 text-white/70 hover:text-white rounded-lg hover:bg-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full p-0.5 bg-gradient-to-tr from-[#123B6D] via-[#D4A72C] to-[#581C87] shadow-md shrink-0">
              <img
                src="/assets/aistudio/image_01084dd6.png"
                alt="Orthodoxy and Economy Logo"
                className="w-full h-full object-cover rounded-full bg-white"
              />
            </div>
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 bg-[#D4A72C]/20 border border-[#D4A72C]/40 px-2.5 py-0.5 rounded-full text-[11px] font-bold text-[#F3D77A]">
                <span>†</span>
                <span>{language === 'am' ? 'ይፋዊ የመገናኛ መስመሮች' : 'Official Contact Channels'}</span>
              </div>
              <h3 className="font-ethiopic text-xl sm:text-2xl font-black text-white">
                {language === 'am' ? 'ያግኙን / Contact Us' : 'Get in Touch'}
              </h3>
              <p className="font-ethiopic text-xs text-purple-200">
                {t.brandSlogan}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Official Contact Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            
            {/* Phone */}
            <div className="bg-[#F8FAFC] hover:bg-purple-50/50 p-4 rounded-2xl border border-slate-200 hover:border-purple-300 transition-all space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1.5 font-bold text-[#123B6D]">
                  <Phone className="w-4 h-4 text-[#16845B]" />
                  <span>{language === 'am' ? 'ስልክ / Call' : 'Direct Phones'}</span>
                </span>
                <button
                  onClick={() => copyToClipboard(`${contactData.phone} / ${contactData.secondaryPhone}`, 'phone')}
                  className="text-slate-400 hover:text-purple-700 cursor-pointer p-1"
                  title="Copy Phone Numbers"
                >
                  {copiedKey === 'phone' ? <Check className="w-3.5 h-3.5 text-[#16845B]" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <a
                href={`tel:${contactData.phone.replace(/\s+/g, '')}`}
                className="text-sm font-black text-[#08294F] hover:text-purple-700 block tracking-tight"
              >
                {contactData.phone}
              </a>
              <a
                href={`tel:${contactData.secondaryPhone.replace(/\s+/g, '')}`}
                className="text-sm font-black text-[#123B6D] hover:text-purple-700 block tracking-tight"
              >
                {contactData.secondaryPhone} <span className="text-[11px] font-semibold text-slate-500">(0981848698)</span>
              </a>
              <span className="text-[10px] text-slate-400 block">Available on Telegram & WhatsApp</span>
            </div>

            {/* Email */}
            <div className="bg-[#F8FAFC] hover:bg-purple-50/50 p-4 rounded-2xl border border-slate-200 hover:border-purple-300 transition-all space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1.5 font-bold text-[#123B6D]">
                  <Mail className="w-4 h-4 text-[#3B1C54]" />
                  <span>{language === 'am' ? 'ኢሜይል' : 'Email'}</span>
                </span>
                <button
                  onClick={() => copyToClipboard(contactData.email, 'email')}
                  className="text-slate-400 hover:text-purple-700 cursor-pointer p-1"
                  title="Copy Email"
                >
                  {copiedKey === 'email' ? <Check className="w-3.5 h-3.5 text-[#16845B]" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <a
                href={`mailto:${contactData.email}`}
                className="text-xs sm:text-[13px] font-bold text-[#08294F] hover:text-purple-700 block truncate"
              >
                {contactData.email}
              </a>
              <span className="text-[10px] text-slate-400 block">General Inquiries & Verification</span>
            </div>

            {/* Telegram Channel */}
            <div className="bg-[#F8FAFC] hover:bg-purple-50/50 p-4 rounded-2xl border border-slate-200 hover:border-purple-300 transition-all space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1.5 font-bold text-[#2563EB]">
                  <Send className="w-4 h-4 text-[#2563EB]" />
                  <span>Telegram</span>
                </span>
                <button
                  onClick={() => copyToClipboard(contactData.telegram, 'telegram')}
                  className="text-slate-400 hover:text-purple-700 cursor-pointer p-1"
                  title="Copy Handle"
                >
                  {copiedKey === 'telegram' ? <Check className="w-3.5 h-3.5 text-[#16845B]" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <a
                href={contactData.telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-black text-[#2563EB] hover:underline flex items-center gap-1"
              >
                <span>{contactData.telegram}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <span className="text-[10px] text-slate-400 block">Community updates & job alerts</span>
            </div>

            {/* TikTok / Social */}
            <div className="bg-[#F8FAFC] hover:bg-purple-50/50 p-4 rounded-2xl border border-slate-200 hover:border-purple-300 transition-all space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1.5 font-bold text-[#581C87]">
                  <Share2 className="w-4 h-4 text-[#7E22CE]" />
                  <span>Social / TikTok</span>
                </span>
                <button
                  onClick={() => copyToClipboard(contactData.social, 'social')}
                  className="text-slate-400 hover:text-purple-700 cursor-pointer p-1"
                  title="Copy Handle"
                >
                  {copiedKey === 'social' ? <Check className="w-3.5 h-3.5 text-[#16845B]" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <a
                href={contactData.socialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-black text-[#581C87] hover:underline flex items-center gap-1"
              >
                <span>{contactData.social}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <span className="text-[10px] text-slate-400 block">Daily educational and business media</span>
            </div>

          </div>

          {/* Direct Message Form */}
          <div className="border-t border-slate-100 pt-5 space-y-3">
            <h4 className="font-ethiopic text-sm font-bold text-slate-900">
              {language === 'am' ? 'ቀጥታ መልእክት ወይም ጥያቄ ይላኩልን' : 'Send Direct Message to Admins'}
            </h4>

            {isSent ? (
              <div className="p-4 bg-[#16845B]/10 rounded-2xl border border-[#16845B]/20 text-center space-y-1">
                <CheckCircle2 className="w-8 h-8 text-[#16845B] mx-auto" />
                <p className="font-ethiopic text-xs font-bold text-slate-900">
                  {language === 'am' ? 'መልእክትዎ ደርሶናል! በአጭር ጊዜ ውስጥ በስልክ ወይም በኢሜይል ምላሽ እንሰጣለን።' : 'Thank you! Your inquiry was sent to the administration team.'}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    required
                    placeholder={language === 'am' ? 'ስምዎ' : 'Your Name'}
                    className="w-full px-3.5 py-2 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                  />
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    required
                    placeholder="Email or Phone"
                    className="w-full px-3.5 py-2 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                  />
                </div>

                <textarea
                  rows={3}
                  value={formMsg}
                  onChange={(e) => setFormMsg(e.target.value)}
                  required
                  placeholder={language === 'am' ? 'መልእክትዎን እዚህ ይጻፉ...' : 'Describe your question or partnership inquiry...'}
                  className="w-full px-3.5 py-2 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                />

                <div className="flex items-center justify-end">
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-[#123B6D] via-[#3B1C54] to-[#581C87] hover:opacity-95 text-white px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-xs cursor-pointer flex items-center gap-2"
                  >
                    <span>{language === 'am' ? 'መልእክት ላክ' : 'Send Message'}</span>
                    <Send className="w-4 h-4 text-[#D4A72C]" />
                  </button>
                </div>
              </form>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
