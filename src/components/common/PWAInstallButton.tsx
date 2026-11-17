import React, { useState } from 'react';
import { Download, Smartphone, X, CheckCircle2, Share2, PlusSquare } from 'lucide-react';
import { usePWAInstall, useOnlineStatus } from '../../hooks/usePWAInstall';
import { useApp } from '../../context/AppContext';

export const PWAInstallButton: React.FC<{ variant?: 'header' | 'banner' | 'pill' }> = ({ variant = 'pill' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const { language } = useApp();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running standalone, hide install prompts
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = () => {
    if (isInstallable) {
      install();
    } else if (isIOS) {
      setShowIOSGuide(true);
    } else {
      // General instructions modal or manual prompt
      setShowIOSGuide(true);
    }
  };

  return (
    <>
      {variant === 'header' ? (
        <button
          onClick={handleInstallClick}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#08294F] text-xs font-bold transition-all shadow-sm cursor-pointer"
          title={language === 'am' ? 'መተግበሪያውን በስልክዎ ይጫኑ' : 'Install Mobile App'}
        >
          <Smartphone className="w-3.5 h-3.5 shrink-0" />
          <span className="hidden sm:inline">
            {language === 'am' ? 'አፕሊኬሽኑን ጫን' : 'Install App'}
          </span>
        </button>
      ) : variant === 'banner' ? (
        <div className="bg-gradient-to-r from-[#08294F] via-[#123B6D] to-[#16845B] text-white p-3.5 rounded-2xl shadow-md border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-400/20 border border-amber-400/40 text-amber-300">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white font-ethiopic">
                {language === 'am' ? 'የኦርቶዶክስና ኢኮኖሚ መተግበሪያን በስልክዎ ይጫኑ' : 'Install Orthodoxy & Economy App on your phone'}
              </h4>
              <p className="text-[11px] text-slate-300 font-ethiopic">
                {language === 'am' 
                  ? 'ለፈጣን መልእክቶች፣ ለቀጥታ ግብይት እና ከመስመር ውጭ ለመጠቀም ወደ ስክሪንዎ ያክሉት' 
                  : 'Fast 1-click access, instant offline caching, and direct connection'}
              </p>
            </div>
          </div>

          <button
            onClick={handleInstallClick}
            className="w-full sm:w-auto px-4 py-2 bg-[#D4A72C] hover:bg-[#c29623] text-[#08294F] rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{language === 'am' ? 'አሁን ጫን (Install PWA)' : 'Install Now'}</span>
          </button>
        </div>
      ) : (
        <button
          onClick={handleInstallClick}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-semibold transition-all cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-emerald-600" />
          <span>{language === 'am' ? 'አፕ ጫን' : 'Install App'}</span>
        </button>
      )}

      {/* Guided Modal for iOS Safari / Android Manual Instructions */}
      {showIOSGuide && (
        <div 
          className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in"
          onClick={() => setShowIOSGuide(false)}
        >
          <div 
            className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 text-slate-900 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-[#123B6D]" />
                <h3 className="text-sm font-bold text-slate-900 font-ethiopic">
                  {language === 'am' ? 'መተግበሪያውን በስልክ መጫኛ' : 'How to Install on Mobile'}
                </h3>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 font-ethiopic">
              <p className="font-semibold text-slate-800">
                {language === 'am'
                  ? 'የኦርቶዶክስና ኢኮኖሚ መተግበሪያን በiPhone ወይም Android ስልክዎ ላይ ለመጫን፦'
                  : 'Follow these quick steps to install on your mobile device:'}
              </p>

              <div className="space-y-2.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#123B6D] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    1
                  </span>
                  <span>
                    {language === 'am'
                      ? 'በSafari ወይም Chrome አሳሽ ላይ የShare ወይም Menu (3 ነጥብ) አዝራሩን ይጫኑ።'
                      : 'Tap the Share icon (Safari) or Menu button (Chrome).'}
                  </span>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#16845B] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    2
                  </span>
                  <span>
                    {language === 'am'
                      ? 'ወደ ታች ዝቅ ብለው "Add to Home Screen" (ወደ መነሻ ገጽ አክል) የሚለውን ይምረጡ።'
                      : 'Scroll down and tap "Add to Home Screen".'}
                  </span>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#D4A72C] text-[#08294F] flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    3
                  </span>
                  <span>
                    {language === 'am'
                      ? 'የኦርቶዶክስና ኢኮኖሚ አርማ በስልክዎ ስክሪን ላይ ልክ እንደ ተፈጥሯዊ አፕሊኬሽን ይቀመጣል!'
                      : 'The app icon is added to your home screen with zero storage overhead!'}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2.5 rounded-xl bg-[#123B6D] text-white text-xs font-bold transition hover:bg-[#08294F] cursor-pointer"
            >
              {language === 'am' ? 'ተረድቻለሁ (Done)' : 'Close'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  const { language } = useApp();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-amber-500 text-slate-950 px-3.5 py-2 text-xs font-bold shadow-xl border border-amber-300">
      <span className="h-2.5 w-2.5 rounded-full bg-slate-950" />
      <span>
        {language === 'am' 
          ? 'ከመስመር ውጭ ነዎት — የተከማቸ መረጃ ጥቅም ላይ እየዋለ ነው።' 
          : 'Offline Mode — Cached data is being used.'}
      </span>
    </div>
  );
};
