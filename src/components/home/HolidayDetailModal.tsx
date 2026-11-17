import React from 'react';
import { OrthodoxHolidayEvent } from '../../data/orthodoxHolidays';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  Calendar, 
  BookOpen, 
  Scroll, 
  HeartHandshake, 
  Sparkles, 
  Clock, 
  Utensils, 
  ExternalLink,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

interface HolidayDetailModalProps {
  event: OrthodoxHolidayEvent;
  onClose: () => void;
}

export const HolidayDetailModal: React.FC<HolidayDetailModalProps> = ({ event, onClose }) => {
  const { language, setActiveTab } = useApp();

  const getTitle = () => {
    if (language === 'om' && event.titleOm) return event.titleOm;
    if (language === 'ti' && event.titleTi) return event.titleTi;
    if (language === 'en') return event.title;
    return event.titleAm;
  };

  const isFast = event.type === 'fast';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="relative bg-white rounded-3xl shadow-2xl border border-purple-200/80 max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Orthodox Church Aesthetic */}
        <div className={`p-5 sm:p-6 text-white relative overflow-hidden ${
          isFast 
            ? 'bg-gradient-to-r from-[#1E112A] via-[#3B1C54] to-[#123B6D]' 
            : 'bg-gradient-to-r from-[#0E284D] via-[#123B6D] to-[#3B1C54]'
        }`}>
          {/* Subtle decorative background pattern */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#D4A72C_1px,transparent_1px)] [background-size:16px_16px]" />

          <div className="relative z-10 flex items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide uppercase border ${
                  isFast 
                    ? 'bg-purple-900/60 border-purple-300/40 text-purple-200' 
                    : 'bg-[#D4A72C]/20 border-[#D4A72C]/40 text-[#D4A72C]'
                }`}>
                  {isFast 
                    ? (language === 'am' ? 'የአዋጅ ጾም' : 'Canonical Fast') 
                    : (language === 'am' ? 'የተከበረ በዓል' : 'Holy Feast')}
                </span>
                <span className="text-xs text-purple-200/90 font-ethiopic bg-white/10 px-2.5 py-0.5 rounded-full">
                  {event.classification}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black font-ethiopic tracking-tight text-white mb-1">
                {getTitle()}
              </h2>
              <p className="text-xs sm:text-sm text-purple-200 font-ethiopic flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#D4A72C]" />
                <span className="font-bold">{event.ethiopianDateAm}</span>
                <span className="opacity-60">·</span>
                <span className="text-slate-300">{event.gregorianDateString}</span>
                <span className="opacity-60">·</span>
                <span className="italic text-purple-300">{event.seasonAm}</span>
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-2xl bg-white/10 hover:bg-white/20 text-purple-100 hover:text-white transition-all cursor-pointer shrink-0"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 bg-[#FBFBFE]">

          {/* Quick Summary Banner */}
          <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-100/90 text-xs sm:text-sm text-slate-800 leading-relaxed font-ethiopic">
            <p className="font-medium">
              {language === 'am' ? event.summaryAm : event.summaryEn}
            </p>
          </div>

          {/* Fasting Rules (If it's a Fast) */}
          {event.fastingDiscipline && (
            <div className="rounded-2xl border border-amber-200/80 bg-amber-50/40 p-4 space-y-3">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs sm:text-sm font-ethiopic">
                <Utensils className="w-4 h-4 text-amber-700" />
                <span>{language === 'am' ? 'የቀኖና ጾም ሥርዓት እና መመሪያ' : 'Canonical Fasting Discipline'}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-white border border-amber-100 shadow-2xs">
                  <span className="text-slate-500 font-medium block mb-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    {language === 'am' ? 'የመከልከያ ሰዓት' : 'Hours of Fasting'}
                  </span>
                  <p className="font-semibold text-slate-800 font-ethiopic">
                    {event.fastingDiscipline.hoursOfAbstinence}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-white border border-amber-100 shadow-2xs">
                  <span className="text-slate-500 font-medium block mb-1 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    {language === 'am' ? 'ቀኖናዊ ምንጭ' : 'Canon Authority'}
                  </span>
                  <p className="font-semibold text-slate-800 font-ethiopic">
                    {event.fastingDiscipline.canonicalCitation}
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-ethiopic bg-white/70 p-3 rounded-xl border border-amber-100/60">
                <strong className="text-amber-900">{language === 'am' ? 'የምግብ ሕግ፦ ' : 'Food Rules: '}</strong>
                {language === 'am' ? event.fastingDiscipline.foodRulesAm : event.fastingDiscipline.foodRulesEn}
              </p>
            </div>
          )}

          {/* Spiritual Meaning */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 font-ethiopic flex items-center gap-2">
              <Scroll className="w-4 h-4 text-[#123B6D]" />
              <span>{language === 'am' ? 'መንፈሳዊ ትርጉም እና ታሪክ' : 'Spiritual & Theological Significance'}</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 font-ethiopic leading-relaxed">
              {language === 'am' ? event.spiritualMeaningAm : event.spiritualMeaningEn}
            </p>
          </div>

          {/* Liturgical Hymn (ያሬዳዊ ዜማ) */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#123B6D]/5 to-[#3B1C54]/5 border border-purple-200/70 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#3B1C54] font-ethiopic flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#D4A72C]" />
                {language === 'am' ? 'የቅዱስ ያሬድ ማኅሌታዊ ምስጋና (ግዕዝ)' : 'Liturgical Deggwa Hymn (Ge\'ez)'}
              </span>
            </div>
            <p className="text-xs sm:text-sm font-bold text-[#123B6D] font-ethiopic italic leading-relaxed bg-white/80 p-3 rounded-xl border border-purple-100">
              {event.liturgicalHymnGeEz}
            </p>
            <p className="text-[11px] text-slate-600 font-ethiopic">
              <span className="font-semibold">{language === 'am' ? 'ትርጉም፦ ' : 'Translation: '}</span>
              {event.liturgicalHymnTranslation}
            </p>
          </div>

          {/* Scripture Readings */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 font-ethiopic flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#16845B]" />
              <span>{language === 'am' ? 'የዕለቱ የመጽሐፍ ቅዱስ ምንባባት' : 'Scripture Readings'}</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {event.scriptureReferences.map((ref, idx) => (
                <span 
                  key={idx}
                  className="px-3 py-1 rounded-xl bg-slate-100 text-slate-800 text-xs font-ethiopic font-medium border border-slate-200"
                >
                  📖 {ref}
                </span>
              ))}
            </div>
          </div>

          {/* Economic, Marketplace & Charitable Duties */}
          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-2">
            <h3 className="text-xs sm:text-sm font-bold text-emerald-950 font-ethiopic flex items-center gap-2">
              <HeartHandshake className="w-4 h-4 text-emerald-700" />
              <span>{event.charitableAndEconomicDuties.titleAm}</span>
            </h3>
            <p className="text-xs text-emerald-900 leading-relaxed font-ethiopic">
              {language === 'am' 
                ? event.charitableAndEconomicDuties.descriptionAm 
                : event.charitableAndEconomicDuties.descriptionEn}
            </p>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => {
              onClose();
              setActiveTab('knowledge');
            }}
            className="text-xs text-[#3B1C54] hover:text-[#123B6D] font-bold font-ethiopic flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>{language === 'am' ? 'በቀኖናዊ RAG ቤተ-መጻሕፍት ውስጥ የበለጠ አንብብ' : 'Explore more in Canonical Knowledge Hub'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#123B6D] to-[#3B1C54] text-white text-xs font-bold font-ethiopic hover:opacity-95 transition-all cursor-pointer shadow-xs"
          >
            {language === 'am' ? 'ዝጋ' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
