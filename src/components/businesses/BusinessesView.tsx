import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { VerificationBadge } from '../common/Badge';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  PlusCircle, 
  MessageSquare,
  Sparkles,
  Handshake,
  CheckCircle2,
  Send,
  Flag,
} from 'lucide-react';
import { Business } from '../../types';
import { DEFAULT_ENTERPRISE_LOGO_URL, handleImageFallback } from '../../constants/assets';
import { PostedDateTime } from '../common/PostedDateTime';

export const BusinessesView: React.FC = () => {
  const { 
    t, 
    language, 
    businesses, 
    products,
    openModal, 
    startOrOpenConversation, 
    submitReport,
    searchQuery 
  } = useApp();

  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [b2bMatcherOpen, setB2bMatcherOpen] = useState(false);
  const [selectedB2bSourceId, setSelectedB2bSourceId] = useState<string>(businesses[0]?.id || '');
  const [reportingBiz, setReportingBiz] = useState<Business | null>(null);
  const [reportReason, setReportReason] = useState('Suspicious business or inaccurate details');
  const [reportSent, setReportSent] = useState(false);

  useEffect(() => {
    if (!selectedB2bSourceId && businesses.length > 0) {
      setSelectedB2bSourceId(businesses[0].id);
    }
  }, [businesses, selectedB2bSourceId]);

  const types = [
    { id: 'all', label: language === 'am' ? 'ሁሉም ድርጅቶች' : 'All Enterprises' },
    { id: 'importer', label: language === 'am' ? 'አስመጪዎች (Importers)' : 'Bulk Importers' },
    { id: 'manufacturer', label: language === 'am' ? 'አምራቾች (Manufacturers)' : 'Manufacturers' },
    { id: 'distributor', label: language === 'am' ? 'አከፋፋዮች (Distributors)' : 'Distributors' },
  ];

  const filteredBusinesses = useMemo(() => {
    return businesses.filter((b) => {
      const q = localSearch.toLowerCase().trim();
      const matchQuery = !q ||
        b.name.toLowerCase().includes(q) ||
        (b.nameAm && b.nameAm.toLowerCase().includes(q)) ||
        b.category.toLowerCase().includes(q) ||
        b.description.toLowerCase().includes(q);

      const matchType = selectedType === 'all' || b.type === selectedType;

      return matchQuery && matchType;
    });
  }, [businesses, localSearch, selectedType]);

  const sourceBusiness = businesses.find(b => b.id === selectedB2bSourceId) || businesses[0];
  
  const b2bMatches = useMemo(() => {
    if (!sourceBusiness) return [];
    return businesses
      .filter(b => b.id !== sourceBusiness.id)
      .map(candidate => {
        let score = 70;
        const reasons: string[] = [];
        
        if ((sourceBusiness.type === 'importer' || sourceBusiness.type === 'manufacturer') && candidate.type === 'distributor') {
          score += 15;
          reasons.push(language === 'am' ? 'የአስመጪ እና የአከፋፋይ ተመጋጋቢ የንግድ ትስስር' : 'Direct complementary supply-distribution pipeline');
        } else if (sourceBusiness.type === 'distributor' && (candidate.type === 'importer' || candidate.type === 'manufacturer')) {
          score += 15;
          reasons.push(language === 'am' ? 'ከአምራች/አስመጪ ቀጥተኛ የጅምላ አቅርቦት' : 'Bulk supply sourcing alignment');
        }

        if (sourceBusiness.category.toLowerCase().includes(candidate.category.toLowerCase()) || candidate.category.toLowerCase().includes(sourceBusiness.category.toLowerCase())) {
          score += 10;
          reasons.push(language === 'am' ? `ተመሳሳይ የዘርፍ ምድብ፦ ${candidate.category}` : `Shared sector: ${candidate.category}`);
        }

        if (sourceBusiness.location && candidate.location) {
          reasons.push(language === 'am' ? `የስርጭት አድማስ፦ ${candidate.location}` : `Logistics corridor: ${candidate.location}`);
        }

        if (candidate.isVerified) {
          score += 5;
          reasons.push(language === 'am' ? 'የተረጋገጠ ማኅበረሰባዊ ታማኝነት' : 'Verified community enterprise credibility');
        }

        return {
          candidate,
          score: Math.min(98, score),
          reasons
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }, [sourceBusiness, businesses, language]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#08294F] uppercase tracking-wider">
            <Building2 className="w-4 h-4 text-[#D4A72C]" />
            <span>{language === 'am' ? 'የንግዶችና የአስመጪዎች ማውጫ' : 'Enterprise & Importer Registry'}</span>
          </div>
          <h1 className="font-ethiopic text-3xl font-extrabold text-[#08294F] mt-1">
            {t.businessesHeading}
          </h1>
          <p className="font-ethiopic text-sm text-slate-500">
            {t.businessesSubheading}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setB2bMatcherOpen(!b2bMatcherOpen)}
            className="bg-gradient-to-r from-[#123B6D] to-[#3B1C54] hover:opacity-95 text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-[#F3D77A]" />
            <span>{language === 'am' ? 'AI አስመጪ ↔ አከፋፋይ አዛምድ' : 'AI B2B Partner Matcher'}</span>
          </button>

          <button
            onClick={() => openModal('post', { defaultType: 'business' })}
            className="bg-[#D4A72C] hover:bg-[#c29623] text-[#08294F] px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{language === 'am' ? 'ድርጅት ይመዝግቡ' : 'Register Enterprise'}</span>
          </button>
        </div>
      </div>

      {/* AI Importer ↔ Distributor Matching Panel */}
      {b2bMatcherOpen && (
        <div className="bg-gradient-to-br from-[#091B33] via-[#1E0B38] to-[#2E0854] text-white rounded-3xl p-6 sm:p-8 border border-[#D4A72C]/30 shadow-xl space-y-6 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[#D4A72C] font-black text-sm">†</span>
                <span className="text-xs font-bold uppercase tracking-wider text-[#F3D77A]">
                  AI B2B Pipeline Matching
                </span>
              </div>
              <h3 className="font-ethiopic text-lg sm:text-xl font-black text-white">
                {language === 'am' ? 'የአስመጪዎች እና የአከፋፋዮች ስማርት ትስስር' : 'Intelligent Importer ↔ Distributor Connections'}
              </h3>
              <p className="text-xs text-slate-300 font-ethiopic">
                {language === 'am'
                  ? 'የእርስዎን ድርጅት ይምረጡ፤ AI ተስማሚ የሆኑ አከፋፋዮችን፣ አምራቾችን እና አስመጪዎችን በግልጽ ምክንያት አዛምዶ ያቀርባል።'
                  : 'Select an enterprise to discover verified distribution partners with transparent match rationale.'}
              </p>
            </div>

            {/* Select Source Business */}
            <div className="w-full sm:w-auto">
              <label className="text-[11px] text-slate-300 block mb-1 font-semibold">
                {language === 'am' ? 'ዋና ድርጅት ይምረጡ' : 'Source Enterprise'}:
              </label>
              <select
                value={selectedB2bSourceId}
                onChange={(e) => setSelectedB2bSourceId(e.target.value)}
                className="w-full sm:w-64 px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-xs font-bold text-white focus:outline-none cursor-pointer"
              >
                {businesses.map((b) => (
                  <option key={b.id} value={b.id} className="bg-[#08294F] text-white">
                    [{b.type.toUpperCase()}] {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Matches Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {b2bMatches.map(({ candidate, score, reasons }) => (
              <div
                key={candidate.id}
                className="bg-white/5 border border-white/10 hover:border-[#D4A72C]/50 rounded-2xl p-5 flex flex-col justify-between space-y-4 transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-200 px-2 py-0.5 rounded">
                      {candidate.type.toUpperCase()}
                    </span>
                    <span className="bg-[#16845B]/20 text-[#6EE7B7] border border-[#16845B]/40 text-[11px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5 text-[#F3D77A]" />
                      <span>{score}% Match</span>
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-sm text-white">{candidate.name}</h4>
                    <p className="text-xs text-slate-300 font-ethiopic">{candidate.category} · {candidate.location}</p>
                  </div>

                  {/* Explainable Reasons */}
                  <div className="space-y-1.5 pt-2 border-t border-white/10 text-[11px]">
                    <span className="text-[10px] uppercase font-bold text-[#D4A72C] block">
                      {language === 'am' ? 'የተዛመደበት ምክንያት (Why Recommended):' : 'Match Rationale:'}
                    </span>
                    {reasons.map((r, i) => (
                      <div key={i} className="flex items-start gap-1.5 text-slate-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#16845B] shrink-0 mt-0.5" />
                        <span className="font-ethiopic">{r}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => startOrOpenConversation(candidate.ownerId || candidate.id, candidate.name, `B2B Partnership Inquiry for ${candidate.name}`)}
                  className="w-full bg-[#D4A72C] hover:bg-[#c29623] text-[#08294F] py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Handshake className="w-3.5 h-3.5" />
                  <span>{language === 'am' ? 'የንግድ ትስስር ጀምር (Connect)' : 'Initiate B2B Connection'}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search & Type Filter Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
          {types.map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedType === type.id
                  ? 'bg-[#08294F] text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>

        <input
          type="text"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          placeholder={language === 'am' ? 'በድርጅት ስም ወይም በዘርፍ ይፈልጉ...' : 'Filter enterprises...'}
          className="px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#123B6D]/20 sm:w-64"
        />
      </div>

      {/* Business Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredBusinesses.map((biz) => {
          const liveProductCount = products.filter((p) => p.sellerId === biz.ownerId).length;
          const displayCount = liveProductCount > 0 ? liveProductCount : (biz.activeListingsCount ?? 0);

          return (
            <div
              key={biz.id}
              className="bg-white rounded-3xl p-6 sm:p-7 border border-purple-100 hover:border-purple-300 transition-all shadow-xs flex flex-col justify-between space-y-5"
            >
              <div className="space-y-4">
                
                {/* Top Business Row */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <img
                      src={biz.logoUrl || DEFAULT_ENTERPRISE_LOGO_URL}
                      alt={biz.name}
                      referrerPolicy="no-referrer"
                      onError={handleImageFallback(DEFAULT_ENTERPRISE_LOGO_URL)}
                      className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shadow-xs"
                    />
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="text-base font-extrabold text-[#08294F]">{biz.name}</h3>
                        {biz.isVerified && (
                          <VerificationBadge 
                            type="business" 
                            size="xs" 
                            label={language === 'am' ? 'የተረጋገጠ ድርጅት' : 'Verified'}
                            entityName={biz.name}
                            entityRole={language === 'am' ? 'የተረጋገጠ የኢትዮጵያ ንግድ ድርጅት' : 'Registered Ethiopian Enterprise'}
                            entityAvatar={biz.logoUrl}
                          />
                        )}
                      </div>
                      {biz.nameAm && (
                        <p className="font-ethiopic text-xs font-semibold text-[#123B6D]">{biz.nameAm}</p>
                      )}
                      <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-[#D4A72C] bg-[#08294F]/5 px-2 py-0.5 rounded mt-0.5">
                        {biz.type} · Est. {biz.establishedYear || 2015}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0 flex items-center gap-1.5">
                    <span className="text-xs bg-[#16845B]/10 text-[#16845B] font-bold px-2.5 py-1 rounded-md">
                      {displayCount} {language === 'am' ? 'ምርቶች' : 'Listings'}
                    </span>
                    <button
                      onClick={() => setReportingBiz(biz)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title={language === 'am' ? 'ድርጅቱን ሪፖርት አድርግ' : 'Report Enterprise'}
                    >
                      <Flag className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Description */}
                <p className="font-ethiopic text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {language === 'am' ? biz.descriptionAm || biz.description : biz.description}
                </p>

                {/* Location & Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 bg-[#F8FAFC] p-3.5 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[#D4A72C] shrink-0" />
                    <span className="truncate">{biz.location}</span>
                  </div>
                  {biz.workingHours && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{biz.workingHours}</span>
                    </div>
                  )}
                  {biz.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-[#16845B] shrink-0" />
                      <span>{biz.phone}</span>
                    </div>
                  )}
                  {biz.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-[#123B6D] shrink-0" />
                      <span className="truncate">{biz.email}</span>
                    </div>
                  )}
                </div>

              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                {biz.phone ? (
                  <a
                    href={`tel:${biz.phone}`}
                    className="text-xs font-bold text-slate-700 hover:text-emerald-700 flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1.5 rounded-lg border border-emerald-200 transition-colors"
                    title={language === 'am' ? 'በስልክ ደውል' : 'Direct Call'}
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="truncate max-w-[110px] sm:max-w-none">{biz.phone}</span>
                  </a>
                ) : (
                  <span className="text-[11px] text-slate-400 font-medium">{biz.category}</span>
                )}

                <div className="flex items-center gap-1.5">
                  {biz.telegram && (
                    <a
                      href={`https://t.me/${biz.telegram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-[#0088cc]/10 hover:bg-[#0088cc] text-[#0088cc] hover:text-white transition-all cursor-pointer flex items-center justify-center border border-[#0088cc]/30"
                      title={language === 'am' ? 'በቴሌግራም አውራ' : 'Direct Telegram'}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Send className="w-3.5 h-3.5" />
                    </a>
                  )}

                  <button
                    onClick={() => startOrOpenConversation(biz.ownerId, biz.name, `Inquiry: ${biz.name}`, biz.logoUrl)}
                    className="bg-[#123B6D] hover:bg-[#08294F] text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-[#D4A72C]" />
                    <span className="hidden sm:inline">{language === 'am' ? 'ቀጥታ አግኝ' : 'Contact'}</span>
                  </button>
                </div>
              </div>

              {/* Exact Posted Date, Hour & Minute Footer */}
              <div className="pt-3 border-t border-slate-100">
                <PostedDateTime value={biz.createdAt} language={language} />
              </div>

            </div>
          );
        })}
      </div>

      {/* Report Enterprise Modal */}
      {reportingBiz && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs"
          onClick={() => setReportingBiz(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 space-y-4 font-ethiopic"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="text-sm font-bold text-rose-700">
              {language === 'am'
                ? `ድርጅቱን ሪፖርት አድርግ (${reportingBiz.name})`
                : `Report Enterprise (${reportingBiz.name})`}
            </h4>
            {reportSent ? (
              <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold text-center">
                {language === 'am' ? 'ሪፖርትዎ ተልኳል!' : 'Report submitted to Trust & Safety!'}
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
                    onClick={() => setReportingBiz(null)}
                    className="px-3 py-1.5 text-xs text-slate-500 cursor-pointer"
                  >
                    {language === 'am' ? 'ሰርዝ' : 'Cancel'}
                  </button>
                  <button
                    onClick={async () => {
                      await submitReport({
                        targetType: 'USER',
                        targetId: reportingBiz.ownerId || reportingBiz.id,
                        targetTitle: reportingBiz.name,
                        reason: reportReason,
                      });
                      setReportSent(true);
                      setTimeout(() => {
                        setReportSent(false);
                        setReportingBiz(null);
                      }, 1200);
                    }}
                    className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    {language === 'am' ? 'ሪፖርት ላክ' : 'Submit Report'}
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

