import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { VerificationBadge } from '../common/Badge';
import { ReviewsSection } from '../common/ReviewsSection';
import {
  X,
  MapPin,
  MessageSquare,
  Send,
  CheckCircle2,
  Sparkles,
  Check,
  FileText,
  Phone,
  Bookmark,
  BookmarkCheck,
  Flag,
  AlertTriangle,
  Star,
  Users,
} from 'lucide-react';
import { Job, Proposal, ProposalStatus } from '../../types';
import { aiService, AIMatchResult } from '../../services/aiService';
import { DEFAULT_AVATAR_URL, handleImageFallback } from '../../constants/assets';
import { PostedDateTime } from '../common/PostedDateTime';

export const JobDetailModal: React.FC = () => {
  const {
    modalData,
    closeModal,
    openModal,
    t,
    language,
    isItemSaved,
    toggleSaveItem,
    submitProposal,
    updateProposalStatus,
    completeProposalAndReview,
    submitReport,
    startOrOpenConversation,
    proposals,
    currentUser,
    isAdmin,
  } = useApp();

  const job: Job | null = modalData;

  const [bidAmount, setBidAmount] = useState<number>(job?.budget || 25000);
  const [deliveryDays, setDeliveryDays] = useState<number>(job?.deliveryDays || 14);
  const [coverLetter, setCoverLetter] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [activeTab, setActiveModalTab] = useState<'details' | 'apply' | 'proposals'>('details');
  const [matchResult, setMatchResult] = useState<AIMatchResult | null>(null);

  // Report state
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('አግባብ ያልሆነ ይዘት ወይም የደላላ ጥርጣሬ');
  const [reportDetails, setReportDetails] = useState('');
  const [reportSent, setReportSent] = useState(false);

  // Complete & Rate freelancer modal state
  const [completingProp, setCompletingProp] = useState<Proposal | null>(null);
  const [ratingVal, setRatingVal] = useState(5);
  const [ratingComment, setRatingComment] = useState('');

  React.useEffect(() => {
    if (job && currentUser) {
      aiService.calculateMatch(job, currentUser).then(setMatchResult).catch(console.warn);
    }
  }, [job, currentUser]);

  const jobProposals = useMemo(() => {
    if (!job) return [];
    return proposals.filter((p) => p.jobId === job.id);
  }, [proposals, job]);

  if (!job) return null;

  const saved = isItemSaved(job.id);
  const isOwnerOrAdmin = Boolean(
    currentUser && (currentUser.userId === job.employerId || isAdmin)
  );

  const handleSubmitBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coverLetter.trim()) return;

    setIsSubmitting(true);
    await submitProposal(
      job.id,
      job.title,
      bidAmount,
      deliveryDays,
      coverLetter,
      job.employerId
    );
    setIsSubmitting(false);
    setSubmitted(true);
  };

  const handleMessageEmployer = () => {
    closeModal();
    startOrOpenConversation(job.employerId, job.employerName, job.title, job.employerAvatar, {
      projectId: job.id,
      opportunityType: job.projectType === 'GIG' ? 'GIG' : 'JOB',
      budgetOrPrice: job.budget,
      category: job.category,
    });
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitReport({
      targetType: job.projectType === 'GIG' ? 'GIG' : 'JOB',
      targetId: job.id,
      targetTitle: job.title,
      reason: reportReason,
      details: reportDetails,
    });
    setReportSent(true);
    setTimeout(() => {
      setReportSent(false);
      setShowReportModal(false);
      setReportDetails('');
    }, 1500);
  };

  const handleCompleteProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!completingProp) return;
    await completeProposalAndReview({
      proposal: completingProp,
      job,
      rating: ratingVal,
      comment: ratingComment.trim() || 'Excellent and reliable work completed!',
      projectRole: 'FREELANCER',
      targetUserId: completingProp.freelancerId,
    });
    setCompletingProp(null);
    setRatingComment('');
  };

  const getStatusBadgeColor = (status: ProposalStatus) => {
    const s = String(status).toUpperCase();
    if (s === 'ACCEPTED' || s === 'COMPLETED') return 'bg-emerald-100 text-emerald-800';
    if (s === 'SHORTLISTED' || s === 'INTERVIEW') return 'bg-blue-100 text-blue-800';
    if (s === 'REJECTED') return 'bg-rose-100 text-rose-800';
    return 'bg-amber-100 text-amber-800';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Top Bar */}
        <div className="sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#123B6D] dark:text-[#F3D77A] uppercase tracking-wider">
              {job.category}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowReportModal(true)}
              className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
              title={language === 'am' ? 'ሪፖርት አድርግ (Report)' : 'Report Opportunity'}
            >
              <Flag className="w-4 h-4" />
            </button>
            <button
              onClick={() => toggleSaveItem(job.id)}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
              title={saved ? t.jobSaved : t.jobSave}
            >
              {saved ? (
                <BookmarkCheck className="w-5 h-5 text-[#D4A72C]" />
              ) : (
                <Bookmark className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={closeModal}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Header Area */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <img
                src={job.employerAvatar || DEFAULT_AVATAR_URL}
                alt={job.employerName}
                referrerPolicy="no-referrer"
                onError={handleImageFallback(DEFAULT_AVATAR_URL)}
                className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-xs"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {job.employerName}
                  </h3>
                  {job.employerVerified ? (
                    <VerificationBadge
                      type="employer"
                      status="verified"
                      label={language === 'am' ? 'የተረጋገጠ አሠሪ' : 'Verified Employer'}
                      entityName={job.employerName}
                      entityRole={
                        language === 'am' ? 'የተረጋገጠ የማኅበረሰብ አሠሪ' : 'Vetted Community Employer'
                      }
                      entityAvatar={job.employerAvatar}
                    />
                  ) : (
                    <VerificationBadge
                      type="employer"
                      status="unverified"
                      label={language === 'am' ? 'ያልተረጋገጠ' : 'Unverified'}
                      entityName={job.employerName}
                    />
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{job.location}</span>
                  {job.isRemote && (
                    <>
                      <span>·</span>
                      <span className="text-[#16845B] font-medium">Remote Allowed</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <h2 className="font-ethiopic text-xl sm:text-2xl font-black text-[#08294F] dark:text-white pt-2">
              {language === 'am' ? job.amharicTitle || job.title : job.title}
            </h2>

            <PostedDateTime value={job.createdAt} language={language} variant="inline" />

            {job.isFlagged && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs font-semibold flex items-center gap-2">
                <span className="font-bold text-rose-700">🚩 የታገደ ልጥፍ (Flagged Post):</span>
                <span>
                  {job.flagReason ||
                    (language === 'am' ? 'በአስተዳዳሪው ክትትል ሥር ያለ' : 'Under admin review')}
                </span>
              </div>
            )}
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#F8FAFC] dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 text-xs">
            <div>
              <span className="text-slate-400 block">{t.jobBudget}</span>
              <span className="text-sm font-bold text-[#08294F] dark:text-[#F3D77A]">
                {job.budget.toLocaleString()} {job.budgetCurrency}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">{t.jobType}</span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-100 capitalize">
                {job.projectType}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">
                {language === 'am' ? 'ተሞክሮ' : 'Experience'}
              </span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-100 capitalize">
                {job.experienceLevel}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">{t.jobProposals}</span>
              <span className="text-sm font-bold text-[#123B6D] dark:text-sky-300">
                {Math.max(job.proposalsCount, jobProposals.length)} applicants
              </span>
            </div>
          </div>

          {/* AI Explainable Match Card */}
          {matchResult && (
            <div className="bg-purple-50/70 border border-purple-200 rounded-2xl p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-700 text-white flex items-center justify-center font-bold text-xs">
                    {matchResult.score}%
                  </div>
                  <div>
                    <span className="text-xs font-bold text-purple-950 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#D4A72C]" />
                      <span>{matchResult.matchGrade}</span>
                    </span>
                    <span className="text-[10px] text-purple-700 block">
                      AI Explainable Match Score
                    </span>
                  </div>
                </div>

                <span className="text-[10px] bg-white border border-purple-200 text-purple-800 px-2 py-0.5 rounded-md font-medium">
                  AI-Assisted
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {matchResult.matchedSkills.map((skill) => (
                  <span
                    key={skill}
                    className="bg-white border border-purple-200 text-purple-900 text-xs px-2.5 py-0.5 rounded-md flex items-center gap-1"
                  >
                    <Check className="w-3 h-3 text-[#16845B]" />
                    <span>{skill}</span>
                  </span>
                ))}
                {matchResult.missingSkills.slice(0, 2).map((skill) => (
                  <span
                    key={skill}
                    className="bg-slate-100 text-slate-500 text-xs px-2.5 py-0.5 rounded-md"
                  >
                    Missing: {skill}
                  </span>
                ))}
              </div>

              <p className="text-[11px] text-purple-900/80 italic font-ethiopic">
                "{matchResult.explanation}"
              </p>
            </div>
          )}

          {/* Tab Navigation */}
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-2 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveModalTab('details')}
              className={`pb-2 px-3 text-sm font-bold transition-colors cursor-pointer relative shrink-0 ${
                activeTab === 'details'
                  ? 'text-[#123B6D] dark:text-[#F3D77A]'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {language === 'am' ? 'የሥራው ዝርዝር መረጃ' : 'Job Description'}
              {activeTab === 'details' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#123B6D]" />
              )}
            </button>
            <button
              onClick={() => setActiveModalTab('apply')}
              className={`pb-2 px-3 text-sm font-bold transition-colors cursor-pointer relative shrink-0 ${
                activeTab === 'apply'
                  ? 'text-[#123B6D] dark:text-[#F3D77A]'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {language === 'am' ? 'አመልክት / ዋጋ አቅርብ' : 'Submit Proposal'}
              {activeTab === 'apply' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#123B6D]" />
              )}
            </button>
            {isOwnerOrAdmin && (
              <button
                onClick={() => setActiveModalTab('proposals')}
                className={`pb-2 px-3 text-sm font-bold transition-colors cursor-pointer relative shrink-0 flex items-center gap-1.5 ${
                  activeTab === 'proposals'
                    ? 'text-[#123B6D] dark:text-[#F3D77A]'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>
                  {language === 'am'
                    ? `የቀረቡ ማመልከቻዎች (${jobProposals.length})`
                    : `Received Proposals (${jobProposals.length})`}
                </span>
                {activeTab === 'proposals' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#123B6D]" />
                )}
              </button>
            )}
          </div>

          {/* TAB 1: DETAILS */}
          {activeTab === 'details' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  {language === 'am' ? 'ስለ ሥራው' : 'About the Role'}
                </h4>
                <p className="font-ethiopic text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {language === 'am' ? job.descriptionAm || job.description : job.description}
                </p>
              </div>

              {/* Required Skills */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  {t.jobSkills}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {job.skillsRequired.map((skill) => (
                    <span
                      key={skill}
                      className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs px-3 py-1 rounded-lg font-mono"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <div className="flex flex-col sm:flex-row items-center gap-2.5">
                  <a
                    href={`https://t.me/${(job.employerTelegram || 'orthodoxy_economy').replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:flex-1 bg-[#0088cc] hover:bg-[#0077b5] text-white py-3 px-4 rounded-xl text-sm font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer font-ethiopic"
                  >
                    <Send className="w-4 h-4 text-white" />
                    <span>{language === 'am' ? 'በቴሌግራም በቀጥታ አውራ' : 'Direct Telegram'}</span>
                  </a>

                  <a
                    href={`tel:${job.employerPhone || '+251922901083'}`}
                    className="w-full sm:flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-4 rounded-xl text-sm font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer font-ethiopic"
                  >
                    <Phone className="w-4 h-4 text-white" />
                    <span>{language === 'am' ? 'በስልክ በቀጥታ ደውል' : 'Direct Call'}</span>
                  </a>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <button
                    onClick={() => setActiveModalTab('apply')}
                    className="w-full sm:flex-1 bg-[#123B6D] hover:bg-[#08294F] text-white py-3 rounded-xl text-sm font-bold transition-all cursor-pointer shadow-xs"
                  >
                    {t.jobApply}
                  </button>

                  <button
                    onClick={handleMessageEmployer}
                    className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4 text-[#123B6D]" />
                    <span>
                      {language === 'am' ? 'ለአሠሪው መልእክት ላክ' : 'Message Employer'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Employer & Work Verification Reviews */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <ReviewsSection
                  targetTitle={job.title}
                  targetId={job.id}
                  targetUserId={job.employerId}
                  projectRole="JOB_POSTER"
                  type="job"
                />
              </div>
            </div>
          )}

          {/* TAB 2: PROPOSAL FORM */}
          {activeTab === 'apply' && (
            <div>
              {submitted ? (
                <div className="p-8 text-center space-y-3 bg-[#16845B]/10 rounded-2xl border border-[#16845B]/20">
                  <CheckCircle2 className="w-12 h-12 text-[#16845B] mx-auto" />
                  <h3 className="font-ethiopic text-lg font-bold text-slate-900 dark:text-white">
                    {t.jobProposalSuccess}
                  </h3>
                  <p className="font-ethiopic text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto">
                    {language === 'am'
                      ? 'ማመልከቻዎ ለአሠሪው ተላልፏል። አሠሪው ሲያየው በማሳወቂያና በመልእክት ይደርስዎታል።'
                      : 'The employer has been notified of your bid. You will receive updates in Messages and Notifications.'}
                  </p>
                  <button
                    onClick={closeModal}
                    className="bg-[#123B6D] text-white px-5 py-2 rounded-xl text-xs font-semibold mt-2 cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmitBid} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                        {t.jobBidAmount}
                      </label>
                      <input
                        type="number"
                        value={bidAmount}
                        onChange={(e) => setBidAmount(Number(e.target.value))}
                        required
                        className="w-full px-3 py-2.5 bg-[#F8FAFC] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#123B6D]/20"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                        {t.jobDeliveryDays}
                      </label>
                      <input
                        type="number"
                        value={deliveryDays}
                        onChange={(e) => setDeliveryDays(Number(e.target.value))}
                        required
                        min="1"
                        className="w-full px-3 py-2.5 bg-[#F8FAFC] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#123B6D]/20"
                      />
                    </div>
                  </div>

                  {/* Attached CV Profile Status */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#123B6D]/10 text-[#123B6D] flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        {currentUser?.cvFile ? (
                          <>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-slate-800 dark:text-white font-mono">
                                {currentUser.cvFile.name}
                              </span>
                              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded-full font-ethiopic">
                                {language === 'am' ? 'የተያያዘ CV' : 'Attached CV'}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-500 font-ethiopic block">
                              {language === 'am'
                                ? 'ይህ CV በቀጥታ ከማመልከቻዎ ጋር ለአሠሪው ይደርሳል።'
                                : 'Automatically attached with your application.'}
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-200 font-ethiopic block">
                              {language === 'am'
                                ? 'CV አልተያያዘም (No CV Attached)'
                                : 'No CV Attached'}
                            </span>
                            <span className="text-[10px] text-slate-500 font-ethiopic block">
                              {language === 'am'
                                ? 'CV ዎን በመጫን የመመረጥ ዕድልዎን ያሳድጉ!'
                                : 'Attach your CV to boost your hiring chances!'}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => openModal('cv_upload')}
                      className="px-3 py-1.5 rounded-xl bg-white hover:bg-purple-50 text-[#123B6D] border border-slate-200 text-xs font-bold font-ethiopic shrink-0 cursor-pointer transition-all shadow-2xs"
                    >
                      {currentUser?.cvFile
                        ? language === 'am'
                          ? 'ቀይር / አድስ'
                          : 'Change'
                        : language === 'am'
                        ? '+ CV ጫን'
                        : '+ Attach CV'}
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1 font-ethiopic">
                      {t.jobCoverLetter}
                    </label>
                    <textarea
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      required
                      rows={5}
                      placeholder={
                        language === 'am'
                          ? 'የሥራ ልምድዎን፣ ክህሎትዎንና ይህን ሥራ እንዴት በጥራት ማጠናቀቅ እንደሚችሉ በአጭሩ ያብራሩ...'
                          : 'Introduce yourself, describe relevant experience, and outline your approach...'
                      }
                      className="w-full px-3 py-2.5 bg-[#F8FAFC] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#123B6D]/20"
                    />
                  </div>

                  <div className="pt-3 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveModalTab('details')}
                      className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
                    >
                      Back to details
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-[#123B6D] hover:bg-[#08294F] text-white px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? 'Submitting...' : t.jobSubmitProposal}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 3: PROPOSALS RECEIVED (Employer / Admin Workflow) */}
          {activeTab === 'proposals' && isOwnerOrAdmin && (
            <div className="space-y-3">
              {jobProposals.length > 0 ? (
                jobProposals.map((prop) => (
                  <div
                    key={prop.id}
                    className="p-4 rounded-2xl bg-[#F8FAFC] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          {prop.freelancerName}
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          {prop.freelancerEmail} · {prop.freelancerPhone}
                        </p>
                        <PostedDateTime value={prop.createdAt} language={language} variant="compact" className="mt-1" />
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black text-[#123B6D] dark:text-[#F3D77A] block">
                          {prop.bidAmount.toLocaleString()} {prop.currency} · {prop.deliveryDays}d
                        </span>
                        <span
                          className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${getStatusBadgeColor(
                            prop.status
                          )}`}
                        >
                          {prop.status}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 dark:text-slate-300 font-ethiopic leading-relaxed bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                      "{prop.coverLetter}"
                    </p>

                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => updateProposalStatus(prop.id, 'UNDER_REVIEW')}
                        className="px-2.5 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 text-[11px] font-bold cursor-pointer"
                      >
                        Under Review
                      </button>
                      <button
                        type="button"
                        onClick={() => updateProposalStatus(prop.id, 'SHORTLISTED')}
                        className="px-2.5 py-1 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-800 text-[11px] font-bold cursor-pointer"
                      >
                        Shortlist
                      </button>
                      <button
                        type="button"
                        onClick={() => updateProposalStatus(prop.id, 'INTERVIEW')}
                        className="px-2.5 py-1 rounded-lg bg-indigo-100 hover:bg-indigo-200 text-indigo-800 text-[11px] font-bold cursor-pointer"
                      >
                        Interview
                      </button>
                      <button
                        type="button"
                        onClick={() => updateProposalStatus(prop.id, 'ACCEPTED')}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold cursor-pointer"
                      >
                        Accept
                      </button>
                      <button
                        type="button"
                        onClick={() => setCompletingProp(prop)}
                        className="px-2.5 py-1 rounded-lg bg-[#D4A72C] hover:bg-[#c29623] text-[#08294F] text-[11px] font-black cursor-pointer"
                      >
                        Complete & Rate
                      </button>
                      <button
                        type="button"
                        onClick={() => updateProposalStatus(prop.id, 'REJECTED')}
                        className="px-2.5 py-1 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-700 text-[11px] font-bold cursor-pointer"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-slate-400">
                  {language === 'am'
                    ? 'እስካሁን ለዚህ ሥራ ማመልከቻ አልቀረበም።'
                    : 'No proposals received for this listing yet.'}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs"
          onClick={() => setShowReportModal(false)}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-rose-700 flex items-center gap-2 font-ethiopic">
                <AlertTriangle className="w-4 h-4" />
                <span>{language === 'am' ? 'ይህን ሥራ ሪፖርት አድርግ' : 'Report Job / Gig'}</span>
              </h4>
              <button onClick={() => setShowReportModal(false)} className="text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            {reportSent ? (
              <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold text-center">
                {language === 'am' ? 'ሪፖርትዎ ተልኳል!' : 'Report submitted!'}
              </div>
            ) : (
              <form onSubmit={handleReportSubmit} className="space-y-3 font-ethiopic">
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white dark:bg-slate-800"
                >
                  <option value="አግባብ ያልሆነ ይዘት ወይም የደላላ ጥርጣሬ">
                    የደላላ ጣልቃ ገብነት / አግባብ ያልሆነ ይዘት (Broker / Spam)
                  </option>
                  <option value="የዋጋ ማጭበርበር ጥርጣሬ (Scam / Fraud)">
                    የዋጋ ማጭበርበር (Fraud / Scam)
                  </option>
                  <option value="የተሳሳተ መረጃ (Incorrect Information)">
                    የተሳሳተ መረጃ (Misleading)
                  </option>
                </select>
                <textarea
                  rows={3}
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  placeholder={language === 'am' ? 'ዝርዝር ማብራሪያ...' : 'Details...'}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white dark:bg-slate-800"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  {language === 'am' ? 'ሪፖርቱን ላክ (Submit)' : 'Submit Report'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Complete & Rate Modal */}
      {completingProp && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs"
          onClick={() => setCompletingProp(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="text-sm font-bold text-[#08294F] dark:text-white font-ethiopic">
              {language === 'am'
                ? `ሥራውን አጠናቅቅና ${completingProp.freelancerName}ን ደረጃ ስጥ`
                : `Complete Project & Rate ${completingProp.freelancerName}`}
            </h4>
            <form onSubmit={handleCompleteProposal} className="space-y-3">
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    type="button"
                    key={s}
                    onClick={() => setRatingVal(s)}
                    className="p-1 cursor-pointer"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        s <= ratingVal ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <textarea
                rows={3}
                required
                value={ratingComment}
                onChange={(e) => setRatingComment(e.target.value)}
                placeholder={
                  language === 'am'
                    ? 'ስለ ባለሙያው አፈጻጸም አስተያየት ይጻፉ...'
                    : 'Describe work quality & communication...'
                }
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white dark:bg-slate-800"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCompletingProp(null)}
                  className="px-3 py-1.5 text-xs text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#16845B] text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  {language === 'am' ? 'አጠናቅቅና መዝግብ' : 'Complete & Save Rating'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
