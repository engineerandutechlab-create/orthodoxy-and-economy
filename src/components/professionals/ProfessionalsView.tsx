import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { VerificationBadge } from '../common/Badge';
import { ReviewsSection } from '../common/ReviewsSection';
import { 
  Users, 
  MapPin, 
  Star, 
  MessageSquare, 
  Search, 
  Award, 
  Phone,
  Send,
  Flag,
  X,
  Briefcase,
  ShieldCheck,
  Church,
  ExternalLink,
  Eye,
} from 'lucide-react';
import { Professional, CompletedJob } from '../../types';
import { DEFAULT_AVATAR_URL, handleImageFallback } from '../../constants/assets';

export const ProfessionalsView: React.FC = () => {
  const { 
    t, 
    language, 
    currentUser,
    professionals, 
    startOrOpenConversation, 
    openModal, 
    fetchUserCompletedJobs,
    submitReport,
    searchQuery 
  } = useApp();

  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedProf, setSelectedProf] = useState<Professional | null>(null);
  const [profCompletedJobs, setProfCompletedJobs] = useState<CompletedJob[]>([]);
  const [loadingCompleted, setLoadingCompleted] = useState(false);

  const [reportingProf, setReportingProf] = useState<Professional | null>(null);
  const [reportReason, setReportReason] = useState('Suspicious profile or misleading credentials');
  const [reportSent, setReportSent] = useState(false);

  const categories = [
    'All',
    'Technology & Engineering',
    'Healthcare & Medicine',
    'Finance & Legal',
    'Theology & Translation',
  ];

  useEffect(() => {
    if (!selectedProf) {
      setProfCompletedJobs([]);
      return;
    }
    let cancelled = false;
    setLoadingCompleted(true);
    fetchUserCompletedJobs(selectedProf.userId)
      .then((jobs) => {
        if (!cancelled) {
          setProfCompletedJobs(jobs);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingCompleted(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [selectedProf, fetchUserCompletedJobs]);

  const filteredProfessionals = useMemo(() => {
    return professionals.filter((p) => {
      const q = localSearch.toLowerCase().trim();
      const matchQuery = !q ||
        p.fullName.toLowerCase().includes(q) ||
        (p.fullNameAm && p.fullNameAm.toLowerCase().includes(q)) ||
        p.title.toLowerCase().includes(q) ||
        p.skills.some(s => s.toLowerCase().includes(q));

      const matchCat = selectedCategory === 'All' || p.category === selectedCategory;

      return matchQuery && matchCat;
    });
  }, [professionals, localSearch, selectedCategory]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#D98B16] uppercase tracking-wider">
            <Users className="w-4 h-4 text-[#123B6D]" />
            <span>{language === 'am' ? 'የባለሙያዎች ማውጫ' : 'Verified Professional Roster'}</span>
          </div>
          <h1 className="font-ethiopic text-3xl font-extrabold text-[#08294F] mt-1">
            {t.professionalsHeading}
          </h1>
          <p className="font-ethiopic text-sm text-slate-500">
            {t.professionalsSubheading}
          </p>
        </div>

        <button
          onClick={() => openModal(currentUser ? 'profile' : 'auth')}
          className="bg-[#123B6D] hover:bg-[#08294F] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2 self-start md:self-auto"
        >
          <Award className="w-4 h-4 text-[#D4A72C]" />
          <span>
            {currentUser
              ? (language === 'am' ? 'የባለሙያ መገለጫዎን ያዘምኑ' : 'Update Professional Profile')
              : (language === 'am' ? 'የባለሙያ መገለጫ ይፍጠሩ' : 'Join as Professional')}
          </span>
        </button>
      </div>

      {/* Filter Row */}
      <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder={language === 'am' ? 'በስም ወይም በክህሎት ይፈልጉ...' : 'Search specialists by name or skillset...'}
            className="w-full pl-9 pr-3 py-2 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#123B6D]/20 focus:border-[#123B6D]"
          />
        </div>

        <div className="sm:w-64">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            aria-label="Category Selection"
            className="w-full px-3 py-2 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#123B6D]/20 cursor-pointer"
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c === 'All' ? 'All Disciplines' : c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Professionals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredProfessionals.map((prof) => (
          <div
            key={prof.id}
            className="bg-white rounded-3xl p-6 sm:p-7 border border-purple-100 hover:border-purple-300 transition-all shadow-xs flex flex-col justify-between space-y-5"
          >
            <div className="space-y-4">
              
              {/* Header: Photo + Info */}
              <div className="flex items-start justify-between gap-3">
                <div
                  className="flex items-start gap-4 cursor-pointer group"
                  onClick={() => setSelectedProf(prof)}
                >
                  <img
                    src={prof.photoUrl || DEFAULT_AVATAR_URL}
                    alt={prof.fullName}
                    referrerPolicy="no-referrer"
                    onError={handleImageFallback(DEFAULT_AVATAR_URL)}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-[#D4A72C]/40 shadow-xs shrink-0"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="text-base font-extrabold text-[#08294F] group-hover:text-[#123B6D] group-hover:underline">
                        {prof.fullName}
                      </h3>
                      {prof.isVerified && (
                        <VerificationBadge 
                          type="professional" 
                          size="xs"
                          label={language === 'am' ? 'የተረጋገጠ ባለሙያ' : 'Verified'} 
                          entityName={prof.fullName}
                          entityRole={language === 'am' ? prof.titleAm || prof.title : prof.title}
                          entityAvatar={prof.photoUrl}
                          certificateId={prof.certificateId}
                        />
                      )}
                    </div>
                    {prof.fullNameAm && (
                      <p className="font-ethiopic text-xs font-semibold text-[#123B6D]">{prof.fullNameAm}</p>
                    )}
                    <p className="text-xs font-semibold text-slate-700">
                      {language === 'am' ? prof.titleAm || prof.title : prof.title}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{prof.location}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1 text-[#D4A72C] font-bold">
                        <Star className="w-3 h-3 fill-[#D4A72C]" />
                        <span>{prof.rating}</span>
                        <span className="text-slate-400 font-normal">({prof.reviewCount})</span>
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setReportingProf(prof)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
                  title={language === 'am' ? 'መለያውን ሪፖርት አድርግ' : 'Report User'}
                >
                  <Flag className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Bio */}
              <p className="font-ethiopic text-xs sm:text-sm text-slate-600 leading-relaxed">
                {language === 'am' ? prof.bioAm || prof.bio : prof.bio}
              </p>

              {/* Skills */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {prof.skills.map((skill) => (
                  <span key={skill} className="text-xs font-mono bg-[#F8FAFC] border border-slate-200 text-slate-600 px-2.5 py-0.5 rounded-md">
                    {skill}
                  </span>
                ))}
              </div>

              {/* Portfolios if existing */}
              {prof.portfolioItems && prof.portfolioItems.length > 0 && (
                <div className="bg-[#F8FAFC] p-3 rounded-xl border border-slate-100 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    {language === 'am' ? 'የሥራ ናሙናዎች' : 'Featured Portfolio Work'}
                  </span>
                  {prof.portfolioItems.map((item, idx) => (
                    <div key={idx} className="text-xs flex items-center justify-between text-slate-700">
                      <span className="font-medium truncate">{item.title}</span>
                      <span className="text-slate-400 font-mono text-[11px] ml-2">{item.year}</span>
                    </div>
                  ))}
                </div>
              )}

            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
              <div>
                {prof.hourlyRate ? (
                  <span className="text-xs font-bold text-[#08294F]">
                    {prof.hourlyRate.toLocaleString()} ETB / hr
                  </span>
                ) : (
                  <button
                    onClick={() => setSelectedProf(prof)}
                    className="text-xs font-bold text-[#123B6D] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{language === 'am' ? 'መገለጫና ታሪክ ይመልከቱ' : 'View Profile & History'}</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setSelectedProf(prof)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                  title={language === 'am' ? 'የተጠናቀቁ ሥራዎችና ግምገማዎች' : 'Profile & Completed Work'}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{language === 'am' ? 'ታሪክ' : 'Profile'}</span>
                </button>

                {prof.telegram && (
                  <a
                    href={`https://t.me/${prof.telegram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg bg-[#0088cc]/10 hover:bg-[#0088cc] text-[#0088cc] hover:text-white transition-all cursor-pointer flex items-center justify-center border border-[#0088cc]/30"
                    title={language === 'am' ? 'በቴሌግራም አውራ' : 'Direct Telegram'}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Send className="w-3.5 h-3.5" />
                  </a>
                )}

                {prof.phone && (
                  <a
                    href={`tel:${prof.phone}`}
                    className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-600 text-emerald-600 hover:text-white transition-all cursor-pointer flex items-center justify-center border border-emerald-200"
                    title={language === 'am' ? `በስልክ ደውል፡ ${prof.phone}` : `Call: ${prof.phone}`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </a>
                )}

                <button
                  onClick={() => startOrOpenConversation(prof.userId, prof.fullName, `Consultation with ${prof.fullName}`, prof.photoUrl)}
                  className="bg-[#123B6D] hover:bg-[#08294F] text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-[#D4A72C]" />
                  <span>{t.professionalConnect}</span>
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Full Professional Profile & Completed Jobs Modal */}
      {selectedProf && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto"
          onClick={() => setSelectedProf(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 font-ethiopic"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-[#08294F] to-[#123B6D] text-white px-6 py-5 flex items-start justify-between gap-4 z-10">
              <div className="flex items-center gap-4">
                <img
                  src={selectedProf.photoUrl || DEFAULT_AVATAR_URL}
                  alt={selectedProf.fullName}
                  referrerPolicy="no-referrer"
                  onError={handleImageFallback(DEFAULT_AVATAR_URL)}
                  className="w-16 h-16 rounded-2xl object-cover ring-2 ring-[#D4A72C]"
                />
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-extrabold">{selectedProf.fullName}</h3>
                    {selectedProf.isVerified && (
                      <span className="inline-flex items-center gap-1 bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-[11px] font-bold px-2 py-0.5 rounded-full">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                        <span>{language === 'am' ? 'የተረጋገጠ ባለሙያ' : 'Verified'}</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-200">
                    {language === 'am' ? selectedProf.titleAm || selectedProf.title : selectedProf.title}
                  </p>
                  <div className="flex items-center gap-3 text-[11px] text-slate-300 mt-1 flex-wrap">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#D4A72C]" />
                      {selectedProf.location}
                    </span>
                    {selectedProf.parishName && (
                      <span className="flex items-center gap-1">
                        <Church className="w-3 h-3 text-[#D4A72C]" />
                        {selectedProf.parishName}
                      </span>
                    )}
                    {selectedProf.certificateId && (
                      <span className="font-mono text-[#F3D77A]">
                        ID: {selectedProf.certificateId}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedProf(null)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Bio & Quick Contact */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {language === 'am' ? selectedProf.bioAm || selectedProf.bio : selectedProf.bio}
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200/80">
                  <button
                    onClick={() => {
                      const p = selectedProf;
                      setSelectedProf(null);
                      startOrOpenConversation(p.userId, p.fullName, `Consultation with ${p.fullName}`, p.photoUrl);
                    }}
                    className="bg-[#123B6D] hover:bg-[#08294F] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-[#D4A72C]" />
                    <span>{t.professionalConnect}</span>
                  </button>
                  {selectedProf.phone && (
                    <a
                      href={`tel:${selectedProf.phone}`}
                      className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>{selectedProf.phone}</span>
                    </a>
                  )}
                  {selectedProf.telegram && (
                    <a
                      href={`https://t.me/${selectedProf.telegram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-[#0088cc]/10 hover:bg-[#0088cc]/20 text-[#0088cc] border border-[#0088cc]/30 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>@{selectedProf.telegram.replace('@', '')}</span>
                    </a>
                  )}
                  <button
                    onClick={() => setReportingProf(selectedProf)}
                    className="ml-auto px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 flex items-center gap-1 cursor-pointer"
                  >
                    <Flag className="w-3.5 h-3.5" />
                    <span>{language === 'am' ? 'ሪፖርት' : 'Report'}</span>
                  </button>
                </div>
              </div>

              {/* Portfolio Projects */}
              {selectedProf.portfolioItems && selectedProf.portfolioItems.length > 0 && (
                <div className="space-y-2.5">
                  <h4 className="text-sm font-bold text-[#08294F] flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-[#D4A72C]" />
                    <span>{language === 'am' ? 'የሥራ ናሙናዎች (Portfolio)' : 'Portfolio Projects'}</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedProf.portfolioItems.map((item, idx) => (
                      <div key={item.id || idx} className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-slate-900">{item.title}</span>
                          <span className="text-[10px] font-mono bg-slate-100 px-1.5 py-0.5 rounded">{item.year}</span>
                        </div>
                        {item.description && (
                          <p className="text-xs text-slate-600">{item.description}</p>
                        )}
                        {item.link && (
                          <a
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-[#123B6D] underline"
                          >
                            <span>View Project</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Completed Jobs History from /users/{userId}/completed_jobs */}
              <div className="space-y-3 pt-2 border-t border-slate-200">
                <h4 className="text-sm font-bold text-[#08294F] flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-600" />
                  <span>
                    {language === 'am'
                      ? `የተጠናቀቁ ሥራዎች ታሪክ (${profCompletedJobs.length})`
                      : `Completed Service & Job History (${profCompletedJobs.length})`}
                  </span>
                </h4>

                {loadingCompleted ? (
                  <p className="text-xs text-slate-400">
                    {language === 'am' ? 'ከ Firestore በመጫን ላይ...' : 'Loading completed history from Firestore...'}
                  </p>
                ) : profCompletedJobs.length > 0 ? (
                  <div className="space-y-2.5">
                    {profCompletedJobs.map((cj) => (
                      <div
                        key={cj.id}
                        className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 space-y-1.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <h5 className="text-xs font-bold text-slate-900">
                            {language === 'am' ? cj.amharicTitle || cj.title : cj.title}
                          </h5>
                          <span className="text-xs font-black text-emerald-700">
                            {cj.earningsAmount.toLocaleString()} ETB
                          </span>
                        </div>
                        <div className="flex items-center gap-2.5 text-[11px] text-slate-500 flex-wrap">
                          <span>Client: {cj.clientName}</span>
                          <span>·</span>
                          <span>{cj.completionDate}</span>
                          <span>·</span>
                          <span className="flex items-center gap-0.5 text-amber-600 font-bold">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                            {cj.rating}/5
                          </span>
                        </div>
                        {cj.feedback && (
                          <p className="text-xs text-slate-600 italic">&ldquo;{cj.feedback}&rdquo;</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">
                    {language === 'am'
                      ? 'ለዚህ ባለሙያ የተመዘገበ የተጠናቀቀ ሥራ ታሪክ ገና የለም።'
                      : 'No completed jobs recorded for this specialist yet.'}
                  </p>
                )}
              </div>

              {/* Embedded Live Reviews Section */}
              <div className="pt-4 border-t border-slate-200">
                <ReviewsSection
                  targetUserId={selectedProf.userId}
                  targetTitle={selectedProf.title}
                  type="service"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report Professional Modal */}
      {reportingProf && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs"
          onClick={() => setReportingProf(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 space-y-4 font-ethiopic"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="text-sm font-bold text-rose-700">
              {language === 'am'
                ? `ተጠቃሚውን ሪፖርት አድርግ (${reportingProf.fullName})`
                : `Report User (${reportingProf.fullName})`}
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
                    onClick={() => setReportingProf(null)}
                    className="px-3 py-1.5 text-xs text-slate-500 cursor-pointer"
                  >
                    {language === 'am' ? 'ሰርዝ' : 'Cancel'}
                  </button>
                  <button
                    onClick={async () => {
                      await submitReport({
                        targetType: 'USER',
                        targetId: reportingProf.userId,
                        targetTitle: reportingProf.fullName,
                        reason: reportReason,
                      });
                      setReportSent(true);
                      setTimeout(() => {
                        setReportSent(false);
                        setReportingProf(null);
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

