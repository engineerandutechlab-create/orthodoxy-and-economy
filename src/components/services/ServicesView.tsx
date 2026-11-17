import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { VerificationBadge } from '../common/Badge';
import { 
  Wrench, 
  MapPin, 
  Search, 
  Star, 
  MessageSquare, 
  Phone, 
  PlusCircle, 
  Clock, 
  CheckCircle2,
  Calendar,
  SlidersHorizontal,
  ChevronDown,
  Sparkles,
  Send,
  X,
  Bookmark,
  BookmarkCheck
} from 'lucide-react';
import { Service } from '../../types';
import { Material3SectorSelector } from '../common/Material3SectorSelector';
import { SubCategory, SuperCategory } from '../../data/workSectors';
import { DEFAULT_AVATAR_URL, handleImageFallback } from '../../constants/assets';
import { PostedDateTime } from '../common/PostedDateTime';

export const ServicesView: React.FC = () => {
  const {
    t,
    language,
    services,
    openModal,
    startOrOpenConversation,
    submitReport,
    isItemSaved,
    toggleSaveItem,
    searchQuery,
  } = useApp();

  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [selectedSubSector, setSelectedSubSector] = useState<SubCategory | null>(null);
  const [selectedSuperSector, setSelectedSuperSector] = useState<SuperCategory | null>(null);
  const [showSectorSelector, setShowSectorSelector] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [reportingService, setReportingService] = useState<Service | null>(null);
  const [reportReason, setReportReason] = useState('አጠራጣሪ ወይም የተሳሳተ መረጃ (Misleading Service)');
  const [reportSent, setReportSent] = useState(false);

  const filteredServices = useMemo(() => {
    return services.filter((serv) => {
      const q = localSearch.toLowerCase().trim();
      const matchQuery = !q ||
        serv.title.toLowerCase().includes(q) ||
        serv.amharicTitle.toLowerCase().includes(q) ||
        serv.providerName.toLowerCase().includes(q) ||
        serv.description.toLowerCase().includes(q);

      let matchCategory = true;
      if (selectedSubSector) {
        const keywords = [
          selectedSubSector.nameAm.toLowerCase(),
          selectedSubSector.nameEn.toLowerCase(),
          ...(selectedSubSector.keywords || []).map(k => k.toLowerCase())
        ];
        const servText = `${serv.title} ${serv.amharicTitle} ${serv.category} ${serv.description} ${(serv.skills || []).join(' ')}`.toLowerCase();
        matchCategory = keywords.some(k => servText.includes(k)) || 
          Boolean(selectedSuperSector && serv.category.toLowerCase().includes(selectedSuperSector.nameEn.toLowerCase().split(' ')[0]));
      } else if (selectedCategory !== 'All') {
        matchCategory = serv.category.toLowerCase().includes(selectedCategory.toLowerCase());
      }

      return matchQuery && matchCategory;
    });
  }, [services, localSearch, selectedSubSector, selectedSuperSector, selectedCategory]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#16845B] uppercase tracking-wider">
            <Wrench className="w-4 h-4 text-[#123B6D]" />
            <span>{language === 'am' ? 'የአገልግሎት ማውጫ' : 'Professional Services Catalog'}</span>
          </div>
          <h1 className="font-ethiopic text-3xl font-extrabold text-[#08294F] mt-1">
            {t.servicesHeading}
          </h1>
          <p className="font-ethiopic text-sm text-slate-500">
            {t.servicesSubheading}
          </p>
        </div>

        <button
          onClick={() => openModal('post', { defaultType: 'service' })}
          className="bg-[#123B6D] hover:bg-[#08294F] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2 self-start md:self-auto"
        >
          <PlusCircle className="w-4 h-4 text-[#D4A72C]" />
          <span>{language === 'am' ? 'የአገልግሎት ማስታወቂያ ለጥፍ' : 'Offer a Service'}</span>
        </button>
      </div>

      {/* Filter Row */}
      <div className="bg-white p-4 rounded-2xl border border-purple-100 hover:border-purple-200/80 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder={language === 'am' ? 'አርክቴክቸር፣ ሕግ፣ ኦዲት፣ ቪዲዮ፣ ሶላር...' : 'Search services by title or keyword...'}
              className="w-full pl-9 pr-3 py-2 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#123B6D]/20 focus:border-[#123B6D]"
            />
          </div>

          <div className="sm:w-72">
            <button
              type="button"
              onClick={() => setShowSectorSelector(!showSectorSelector)}
              className={`w-full px-3 py-2 rounded-xl text-xs sm:text-sm font-bold font-ethiopic flex items-center justify-between gap-1.5 border transition-all cursor-pointer ${
                selectedSubSector
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950 shadow-2xs'
                  : 'bg-[#F8FAFC] border-slate-200 text-slate-700 hover:border-purple-300'
              }`}
            >
              <div className="flex items-center gap-1.5 truncate">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#16845B] shrink-0" />
                <span className="truncate">
                  {selectedSubSector 
                    ? (language === 'am' ? selectedSubSector.nameAm : selectedSubSector.nameEn)
                    : (language === 'am' ? '54ቱ የአገልግሎት ዘርፎች...' : '54 Service Sectors...')}
                </span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform ${showSectorSelector ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* Expandable Material 3 Sector Component */}
        {showSectorSelector && (
          <div className="pt-2 border-t border-slate-100 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-2 mb-2">
              <span className="text-xs font-bold text-slate-700 font-ethiopic flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#D4A72C]" />
                <span>{language === 'am' ? 'ከ 54ቱ ዝርዝር የአገልግሎት ዘርፎች ይምረጡ' : 'Select from 54 Material 3 Service Sectors'}</span>
              </span>
              <button
                type="button"
                onClick={() => setShowSectorSelector(false)}
                className="text-xs text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <Material3SectorSelector
              selectedSubCategoryId={selectedSubSector?.id}
              language={language}
              onSelect={(sub, superCat) => {
                setSelectedSubSector(sub);
                setSelectedSuperSector(superCat);
                setShowSectorSelector(false);
              }}
              onClear={() => {
                setSelectedSubSector(null);
                setSelectedSuperSector(null);
              }}
            />
          </div>
        )}
      </div>

      {/* Service Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredServices.map((serv) => (
          <div
            key={serv.id}
            className="bg-white rounded-2xl p-6 border border-purple-100 hover:border-purple-300 transition-all shadow-xs flex flex-col justify-between space-y-4"
          >
            <div className="space-y-4">
              
              {/* Provider Info */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={serv.providerAvatar || DEFAULT_AVATAR_URL}
                    alt={serv.providerName}
                    referrerPolicy="no-referrer"
                    onError={handleImageFallback(DEFAULT_AVATAR_URL)}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-xs"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-sm font-bold text-slate-900">{serv.providerName}</h4>
                      {serv.isVerified && (
                        <VerificationBadge 
                          type="professional"
                          size="xs"
                          label={language === 'am' ? 'የተረጋገጠ' : 'Verified'}
                          entityName={serv.providerName}
                          entityRole={language === 'am' ? serv.categoryAm || serv.category : serv.category}
                          entityAvatar={serv.providerAvatar}
                        />
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{serv.location}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1 text-[#D4A72C] font-semibold">
                        <Star className="w-3.5 h-3.5 fill-[#D4A72C]" />
                        <span>{serv.rating}</span>
                        <span className="text-slate-400 font-normal">({serv.reviewsCount})</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-slate-400 block">{t.serviceExperience}</span>
                  <span className="text-xs font-bold text-slate-800">
                    {serv.experienceYears} {language === 'am' ? 'ዓመታት' : 'Years'}
                  </span>
                </div>
              </div>

              {/* Service Title */}
              <div>
                <h3 className="font-ethiopic text-base sm:text-lg font-bold text-[#08294F]">
                  {language === 'am' ? serv.amharicTitle || serv.title : serv.title}
                </h3>
                <p className="font-ethiopic text-xs sm:text-sm text-slate-600 mt-1 line-clamp-3 leading-relaxed">
                  {language === 'am' ? serv.descriptionAm || serv.description : serv.description}
                </p>
              </div>

              {/* Skills */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {serv.skills.map((skill) => (
                  <span key={skill} className="text-xs bg-[#F8FAFC] border border-slate-200 text-slate-600 px-2.5 py-0.5 rounded-md">
                    {skill}
                  </span>
                ))}
              </div>

            </div>

            {/* Bottom Bar: Rates & Action */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 block">{t.serviceRate}</span>
                <span className="text-xs sm:text-sm font-extrabold text-[#123B6D]">
                  {language === 'am' ? serv.rateDescriptionAm || serv.rateDescription : serv.rateDescription}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <a
                  href={`https://t.me/${(serv.telegram || 'orthodoxy_economy').replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-[#0088cc]/10 hover:bg-[#0088cc] text-[#0088cc] hover:text-white transition-all cursor-pointer flex items-center justify-center border border-[#0088cc]/30"
                  title={language === 'am' ? 'በቴሌግራም አውራ' : 'Direct Telegram'}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Send className="w-3.5 h-3.5" />
                </a>

                <a
                  href={`tel:${serv.phone || '+251922901083'}`}
                  className="p-2 rounded-lg bg-emerald-50 hover:bg-emerald-600 text-emerald-600 hover:text-white transition-all cursor-pointer flex items-center justify-center border border-emerald-200"
                  title={language === 'am' ? `በስልክ ደውል፡ ${serv.phone || '+251922901083'}` : `Call: ${serv.phone || '+251922901083'}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Phone className="w-3.5 h-3.5" />
                </a>

                <button
                  onClick={() => toggleSaveItem(serv.id)}
                  className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                    isItemSaved(serv.id)
                      ? 'bg-amber-50 border-amber-300 text-amber-600'
                      : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-amber-600'
                  }`}
                  title={language === 'am' ? 'አስቀምጥ (Bookmark)' : 'Bookmark Service'}
                >
                  {isItemSaved(serv.id) ? (
                    <BookmarkCheck className="w-3.5 h-3.5" />
                  ) : (
                    <Bookmark className="w-3.5 h-3.5" />
                  )}
                </button>

                <button
                  onClick={() => setReportingService(serv)}
                  className="p-2 rounded-lg bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 cursor-pointer text-[11px] font-bold"
                  title="Report Service"
                >
                  🚩
                </button>

                <button
                  onClick={() =>
                    startOrOpenConversation(serv.providerId, serv.providerName, serv.title, serv.providerAvatar, {
                      projectId: serv.id,
                      opportunityType: 'SERVICE',
                      budgetOrPrice: serv.rateAmount,
                      category: serv.category,
                    })
                  }
                  className="bg-[#123B6D] hover:bg-[#08294F] text-white px-3.5 py-2 rounded-lg text-xs font-semibold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-[#D4A72C]" />
                  <span>{t.serviceBook}</span>
                </button>
              </div>
            </div>

            {/* Exact Posted Date, Hour & Minute Footer */}
            <div className="pt-3 border-t border-slate-100">
              <PostedDateTime value={serv.createdAt} language={language} />
            </div>

          </div>
        ))}
      </div>

      {reportingService && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs"
          onClick={() => setReportingService(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 space-y-4 font-ethiopic"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="text-sm font-bold text-rose-700">
              {language === 'am' ? `አገልግሎቱን ሪፖርት አድርግ (${reportingService.title})` : `Report ${reportingService.title}`}
            </h4>
            {reportSent ? (
              <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold text-center">
                {language === 'am' ? 'ሪፖርትዎ ተልኳል!' : 'Report submitted!'}
              </div>
            ) : (
              <div className="space-y-3">
                <input
                  type="text"
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setReportingService(null)}
                    className="px-3 py-1.5 text-xs text-slate-500"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      await submitReport({
                        targetType: 'SERVICE',
                        targetId: reportingService.id,
                        targetTitle: reportingService.title,
                        reason: reportReason,
                      });
                      setReportSent(true);
                      setTimeout(() => {
                        setReportSent(false);
                        setReportingService(null);
                      }, 1200);
                    }}
                    className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Submit Report
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
