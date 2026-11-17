import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  UPCOMING_ORTHODOX_EVENTS, 
  MONTHLY_ORTHODOX_MEMORIALS, 
  OrthodoxHolidayEvent 
} from '../../data/orthodoxHolidays';
import { HolidayDetailModal } from './HolidayDetailModal';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  BookOpen, 
  Sparkles, 
  ChevronRight, 
  Utensils, 
  CheckCircle2, 
  Layers,
  Info
} from 'lucide-react';

export const OrthodoxCalendarWidget: React.FC = () => {
  const { language, setActiveTab } = useApp();
  const [filter, setFilter] = useState<'all' | 'fast' | 'major_feast' | 'monthly'>('all');
  const [selectedEvent, setSelectedEvent] = useState<OrthodoxHolidayEvent | null>(null);

  const filteredEvents = UPCOMING_ORTHODOX_EVENTS.filter(event => {
    if (filter === 'all') return true;
    if (filter === 'fast') return event.type === 'fast';
    if (filter === 'major_feast') return event.type === 'major_feast' || event.type === 'feast';
    return true;
  });

  const getEventTitle = (event: OrthodoxHolidayEvent) => {
    if (language === 'om' && event.titleOm) return event.titleOm;
    if (language === 'ti' && event.titleTi) return event.titleTi;
    if (language === 'en') return event.title;
    return event.titleAm;
  };

  return (
    <section className="py-10 bg-gradient-to-b from-white via-purple-50/20 to-slate-50 border-y border-purple-100/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100/70 text-[#3B1C54] text-xs font-bold font-ethiopic border border-purple-200 mb-2">
              <CalendarIcon className="w-3.5 h-3.5 text-[#D4A72C]" />
              <span>{language === 'am' ? 'ባሕረ ሐሳብ እና የቀን መቁጠሪያ' : 'Ethiopian Orthodox Computus & Calendar'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black font-ethiopic tracking-tight text-slate-900">
              {language === 'am' 
                ? 'ቀጣይ የቤተክርስቲያን በዓላትና አጽዋማት' 
                : 'Upcoming Orthodox Church Holidays & Fasts'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-ethiopic mt-1 max-w-2xl">
              {language === 'am'
                ? 'የቀኖና አጽዋማት፣ ዐበይት የጌታ በዓላት፣ የቀን መቁጠሪያ ሕጎች እና በዓላትን በማስመልከት የሚጠበቁ ማኅበራዊና ኢኮኖሚያዊ ድጋፎች።'
                : 'Track canonical fasts, major feasts of our Lord, liturgical readings, and ethical communal stewardship.'}
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold font-ethiopic whitespace-nowrap transition-all cursor-pointer ${
                filter === 'all'
                  ? 'bg-[#123B6D] text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {language === 'am' ? 'ሁሉም (All)' : 'All Events'}
            </button>
            <button
              onClick={() => setFilter('fast')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold font-ethiopic whitespace-nowrap transition-all cursor-pointer ${
                filter === 'fast'
                  ? 'bg-[#3B1C54] text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-purple-50 border border-slate-200'
              }`}
            >
              {language === 'am' ? 'አጽዋማት (Fasts)' : 'Canonical Fasts'}
            </button>
            <button
              onClick={() => setFilter('major_feast')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold font-ethiopic whitespace-nowrap transition-all cursor-pointer ${
                filter === 'major_feast'
                  ? 'bg-[#123B6D] text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {language === 'am' ? 'ዐበይት በዓላት (Feasts)' : 'Feasts of the Lord'}
            </button>
            <button
              onClick={() => setFilter('monthly')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold font-ethiopic whitespace-nowrap transition-all cursor-pointer ${
                filter === 'monthly'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-amber-50 border border-slate-200'
              }`}
            >
              {language === 'am' ? 'ወርሃዊ በዓላት (Monthly)' : 'Monthly Memorials'}
            </button>
          </div>
        </div>

        {/* View mode: Monthly Memorials Strip */}
        {filter === 'monthly' ? (
          <div className="bg-white rounded-3xl p-6 border border-purple-200/80 shadow-xs space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 font-ethiopic flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#D4A72C]" />
                <span>{language === 'am' ? 'በየወሩ የሚከበሩ የታወቁ የቅዱሳን መታሰቢያ በዓላት' : 'Monthly Orthodox Memorial Days'}</span>
              </h3>
              <span className="text-xs text-slate-500 font-ethiopic">
                {language === 'am' ? 'በኢትዮጵያ ዘመን አቆጣጠር' : 'Ethiopian Calendar'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {MONTHLY_ORTHODOX_MEMORIALS.map((m, idx) => (
                <div 
                  key={idx}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-purple-300 hover:bg-purple-50/40 transition-all group"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="w-7 h-7 rounded-lg bg-[#123B6D] text-white flex items-center justify-center text-xs font-bold font-mono">
                      {m.day}
                    </span>
                    <span className="text-[10px] text-[#3B1C54] font-medium font-ethiopic">
                      {language === 'am' ? `በየወሩ ${m.day}` : `Day ${m.day}`}
                    </span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 font-ethiopic group-hover:text-[#123B6D]">
                    {language === 'am' ? m.nameAm : m.nameEn}
                  </h4>
                </div>
              ))}
            </div>

            <div className="mt-4 p-3.5 rounded-2xl bg-purple-50/60 border border-purple-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-700 font-ethiopic">
              <span>
                {language === 'am' 
                  ? 'ስለ ባሕረ ሐሳብ የቀን አቆጣጠርና ቀመር ተጨማሪ ለማወቅ የቀኖና ቤተ-መጻሕፍትን ይጎብኙ።' 
                  : 'For complete details on Ethiopian Church Computus and liturgical cycles, visit the Knowledge hub.'}
              </span>
              <button
                onClick={() => setActiveTab('knowledge')}
                className="text-[#3B1C54] hover:text-[#123B6D] font-bold flex items-center gap-1 cursor-pointer whitespace-nowrap"
              >
                <span>{language === 'am' ? 'ወደ ዕውቀት ማዕከል' : 'Go to Knowledge Hub'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          /* Cards Grid for Holidays & Fasts */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredEvents.map((event) => {
              const isFast = event.type === 'fast';

              return (
                <div
                  key={event.id}
                  className="bg-white rounded-3xl border border-purple-200/70 hover:border-[#123B6D]/40 shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col overflow-hidden group"
                >
                  {/* Top Color Banner */}
                  <div className={`p-4 ${
                    isFast 
                      ? 'bg-gradient-to-r from-[#240F3D] to-[#3B1C54] text-white' 
                      : 'bg-gradient-to-r from-[#0E284D] to-[#123B6D] text-white'
                  }`}>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        isFast 
                          ? 'bg-purple-900/60 border-purple-400/40 text-purple-200' 
                          : 'bg-[#D4A72C]/20 border-[#D4A72C]/50 text-[#D4A72C]'
                      }`}>
                        {isFast 
                          ? (language === 'am' ? 'የአዋጅ ጾም' : 'Canonical Fast') 
                          : (language === 'am' ? 'ዐቢይ በዓል' : 'Holy Feast')}
                      </span>

                      {event.durationDays && (
                        <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full font-mono font-medium">
                          {event.durationDays} {language === 'am' ? 'ቀናት' : 'days'}
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold font-ethiopic text-white group-hover:text-[#D4A72C] transition-colors leading-snug line-clamp-1">
                      {getEventTitle(event)}
                    </h3>

                    {/* Date Row */}
                    <div className="flex items-center gap-2 mt-2 text-xs font-ethiopic text-purple-200">
                      <CalendarIcon className="w-3.5 h-3.5 text-[#D4A72C] shrink-0" />
                      <span className="font-bold text-white">{event.ethiopianDateAm}</span>
                      <span className="opacity-50">·</span>
                      <span className="text-slate-300 text-[11px]">{event.gregorianDateString}</span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
                    <p className="text-xs text-slate-600 font-ethiopic leading-relaxed line-clamp-3">
                      {language === 'am' ? event.summaryAm : event.summaryEn}
                    </p>

                    {/* Quick Fasting or Scripture Pill */}
                    {isFast && event.fastingDiscipline ? (
                      <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/60 text-[11px] text-amber-900 font-ethiopic flex items-center gap-2">
                        <Utensils className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                        <span className="line-clamp-1 font-medium">{event.fastingDiscipline.hoursOfAbstinence}</span>
                      </div>
                    ) : (
                      <div className="p-2.5 rounded-xl bg-purple-50/70 border border-purple-100 text-[11px] text-purple-900 font-ethiopic flex items-center gap-2">
                        <BookOpen className="w-3.5 h-3.5 text-purple-700 shrink-0" />
                        <span className="line-clamp-1 font-medium">{event.scriptureReferences[0]}</span>
                      </div>
                    )}

                    {/* Action Bar with 'View Details' link */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500 font-ethiopic italic line-clamp-1">
                        {event.seasonAm}
                      </span>

                      <button
                        onClick={() => setSelectedEvent(event)}
                        className="px-3.5 py-1.5 rounded-xl bg-purple-50 hover:bg-[#123B6D] text-[#123B6D] hover:text-white border border-purple-200/80 hover:border-[#123B6D] text-xs font-bold font-ethiopic flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs group-hover:scale-102"
                      >
                        <span>{language === 'am' ? 'ዝርዝሩን ተመልከት' : 'View Details'}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Holiday Details Modal */}
      {selectedEvent && (
        <HolidayDetailModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </section>
  );
};
