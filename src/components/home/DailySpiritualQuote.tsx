import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Quote, 
  RefreshCw, 
  Share2, 
  Copy, 
  Check, 
  BookOpen, 
  Send,
  Calendar,
  Heart
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SPIRITUAL_QUOTES, getDailySpiritualQuote, SpiritualQuote } from '../../data/spiritualQuotes';

export const DailySpiritualQuote: React.FC = () => {
  const { language } = useApp();
  const [currentQuote, setCurrentQuote] = useState<SpiritualQuote>(() => getDailySpiritualQuote());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isCopied, setIsCopied] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [likesCount, setLikesCount] = useState(48);
  const [hasLiked, setHasLiked] = useState(false);

  // Initialize index
  useEffect(() => {
    const idx = SPIRITUAL_QUOTES.findIndex(q => q.id === currentQuote.id);
    if (idx !== -1) setCurrentIndex(idx);
  }, [currentQuote]);

  const handleNextQuote = () => {
    setIsAnimating(true);
    setTimeout(() => {
      const nextIdx = (currentIndex + 1) % SPIRITUAL_QUOTES.length;
      setCurrentIndex(nextIdx);
      setCurrentQuote(SPIRITUAL_QUOTES[nextIdx]);
      setIsAnimating(false);
    }, 200);
  };

  const handleCopy = () => {
    const textToCopy = `† ${currentQuote.quoteAm}\n— ${currentQuote.authorAm} (${currentQuote.sourceAm})\n\n"ንቁ፣ ብቁና ታታሪ ኦርቶዶክስ ዘመኑን ለዋጀ አገልግሎት!"\nhttps://orthodoxyandeconomy.et`;
    try {
      navigator.clipboard?.writeText(textToCopy);
    } catch {
      // ignore if restricted
    }
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const telegramShareUrl = `https://t.me/share/url?url=https://orthodoxyandeconomy.et&text=${encodeURIComponent(
    `† **የዕለቱ መንፈሳዊ ቃል** †\n\n"${currentQuote.quoteAm}"\n\n📖 **${currentQuote.authorAm}**\n📌 ${currentQuote.sourceAm}\n\n✝️ የኦርቶዶክሳውያን የሥራና የንግድ ትስስር መድረክ`
  )}`;

  const handleLike = () => {
    if (!hasLiked) {
      setLikesCount(prev => prev + 1);
      setHasLiked(true);
    } else {
      setLikesCount(prev => prev - 1);
      setHasLiked(false);
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#051A30] via-[#08294F] to-[#03241F] text-white p-6 sm:p-9 shadow-xl border border-[#D4A72C]/30 group">
        
        {/* Subtle Orthodox Watermark Pattern & Glow */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 rounded-full bg-gradient-to-br from-[#D4A72C]/10 to-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 rounded-full bg-[#123B6D]/30 blur-2xl pointer-events-none" />

        {/* Top Bar with Tag and Daily Pill */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#D4A72C] to-[#b3861b] text-[#051A30] flex items-center justify-center font-serif text-sm font-black shadow-sm shrink-0">
              †
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-black text-[#FDE047] font-ethiopic tracking-wide flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#FDE047]" />
                  <span>{language === 'am' ? 'የዕለቱ መንፈሳዊ ቃል' : 'Daily Spiritual Wisdom'}</span>
                </span>
                <span className="hidden sm:inline-block text-[10px] uppercase font-bold font-mono px-2 py-0.5 rounded-full bg-white/10 text-emerald-300 border border-emerald-400/20">
                  {currentQuote.themeAm}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-ethiopic">
                {language === 'am' ? 'ከሊቃውንተ ቤተክርስቲያንና ከቅዱሳት መጻሕፍት የተወሰደ የዕለት ስንቅ' : 'Patristic and Biblical guidance for daily life and honorable work'}
              </p>
            </div>
          </div>

          {/* Quick Refresh & Shuffle Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleNextQuote}
              title={language === 'am' ? 'ቀጣይ ቃል አንብብ' : 'Next Quote'}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white text-xs font-semibold transition-all border border-white/10 flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isAnimating ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{language === 'am' ? 'ቀጣይ ቃል' : 'Next Quote'}</span>
            </button>
          </div>
        </div>

        {/* Quote Content Section */}
        <div className={`relative z-10 py-6 transition-all duration-200 ${isAnimating ? 'opacity-0 scale-98' : 'opacity-100 scale-100'}`}>
          <div className="flex items-start gap-3 sm:gap-4">
            <Quote className="w-7 h-7 sm:w-10 sm:h-10 text-[#D4A72C] shrink-0 rotate-180 opacity-70 mt-1" />
            
            <div className="space-y-3 flex-1 min-w-0">
              {/* Amharic Text */}
              <p className="font-ethiopic text-base sm:text-xl lg:text-2xl font-bold text-white leading-relaxed tracking-wide text-balance">
                "{currentQuote.quoteAm}"
              </p>

              {/* English Translation */}
              <p className="text-xs sm:text-sm text-sky-100/80 font-normal italic leading-relaxed text-balance">
                "{currentQuote.quoteEn}"
              </p>
            </div>
          </div>
        </div>

        {/* Footer Citation & Action Buttons */}
        <div className="relative z-10 pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          {/* Author & Citation */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#123B6D] to-[#16845B] border border-white/20 flex items-center justify-center text-[#FDE047] shadow-sm shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-extrabold text-[#FDE047] font-ethiopic leading-snug">
                {currentQuote.authorAm}
              </h4>
              <p className="text-[11px] text-slate-300 font-ethiopic">
                {currentQuote.sourceAm} <span className="opacity-60 font-sans">({currentQuote.sourceEn})</span>
              </p>
            </div>
          </div>

          {/* Social Share & Copy Actions */}
          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            <button
              onClick={handleLike}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                hasLiked 
                  ? 'bg-rose-500/25 border-rose-400/50 text-rose-300' 
                  : 'bg-white/10 hover:bg-white/15 border-white/10 text-slate-200'
              }`}
              title="ተባረኩበት / Amen"
            >
              <Heart className={`w-3.5 h-3.5 ${hasLiked ? 'fill-rose-400 text-rose-400' : ''}`} />
              <span>{likesCount}</span>
            </button>

            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-slate-100 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
              title={language === 'am' ? 'ቃሉን ቅዳ' : 'Copy Quote'}
            >
              {isCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">{language === 'am' ? 'ተቀድቷል!' : 'Copied!'}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#FDE047]" />
                  <span>{language === 'am' ? 'ቅዳ' : 'Copy'}</span>
                </>
              )}
            </button>

            <a
              href={telegramShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 rounded-xl bg-[#0088cc] hover:bg-[#0077b5] text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
              title={language === 'am' ? 'በቴሌግራም አጋራ' : 'Share on Telegram'}
            >
              <Send className="w-3.5 h-3.5" />
              <span>{language === 'am' ? 'በቴሌግራም አጋራ' : 'Telegram'}</span>
            </a>
          </div>

        </div>

      </div>
    </section>
  );
};
