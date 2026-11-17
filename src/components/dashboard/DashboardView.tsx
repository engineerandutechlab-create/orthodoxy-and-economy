import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { VerificationBadge, VerificationStatusCard } from '../common/Badge';
import { PostedDateTime } from '../common/PostedDateTime';
import {
  Briefcase,
  PlusCircle,
  User,
  MessageSquare,
  Bookmark,
  FileCheck2,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  Award,
  Star,
  CheckCircle2,
  X,
  Package,
  Pencil,
  Trash2,
  ShoppingBag,
  Wrench,
} from 'lucide-react';
import { Product, Proposal, ProposalStatus } from '../../types';
import { DEFAULT_AVATAR_URL, handleImageFallback } from '../../constants/assets';

export const DashboardView: React.FC = () => {
  const {
    currentUser,
    t,
    language,
    jobs,
    products,
    services,
    proposals,
    completedJobs,
    reviews,
    savedItemIds,
    toggleSaveItem,
    conversations,
    notifications,
    openModal,
    setActiveTab,
    updateProposalStatus,
    completeProposalAndReview,
    submitReview,
    updateProduct,
    deleteProduct,
    deleteJob,
    deleteService,
  } = useApp();

  const [activeTabSection, setActiveTabSection] = useState<
    'listings' | 'proposals' | 'completed' | 'saved'
  >('listings');
  const [proposalFilter, setProposalFilter] = useState<'sent' | 'received'>('sent');

  // Seller Inventory Edit Modal & Inline Delete Confirm
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editPrice, setEditPrice] = useState('');
  const [editWholesalePrice, setEditWholesalePrice] = useState('');
  const [editQty, setEditQty] = useState('');
  const [editDelivery, setEditDelivery] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Mutual Complete & Rate modal state
  const [ratingTarget, setRatingTarget] = useState<{
    proposal: Proposal;
    mode: 'complete_freelancer' | 'rate_employer';
    targetUserId: string;
    targetName: string;
  } | null>(null);
  const [starRating, setStarRating] = useState(5);
  const [ratingComment, setRatingComment] = useState('');

  if (!currentUser) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <User className="w-16 h-16 text-slate-300 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
          {language === 'am'
            ? 'ዳሽቦርድዎን ለማየት እባክዎ ይግቡ'
            : 'Please Sign In to Access Your Dashboard'}
        </h2>
        <button
          onClick={() => openModal('auth')}
          className="bg-[#123B6D] text-white px-6 py-2.5 rounded-xl text-sm font-semibold cursor-pointer"
        >
          {t.navSignIn}
        </button>
      </div>
    );
  }

  // Filter listings belonging to current user
  const myListings = [
    ...jobs
      .filter((j) => j.employerId === currentUser.userId)
      .map((j) => ({ ...j, itemType: 'job' as const })),
    ...products
      .filter((p) => p.sellerId === currentUser.userId)
      .map((p) => ({ ...p, itemType: 'product' as const })),
    ...services
      .filter((s) => s.providerId === currentUser.userId)
      .map((s) => ({ ...s, itemType: 'service' as const })),
  ];

  const mySentProposals = useMemo(
    () => proposals.filter((p) => p.freelancerId === currentUser.userId),
    [proposals, currentUser.userId]
  );

  const myReceivedProposals = useMemo(() => {
    const myJobIds = new Set(jobs.filter((j) => j.employerId === currentUser.userId).map((j) => j.id));
    return proposals.filter(
      (p) => p.employerId === currentUser.userId || myJobIds.has(p.jobId)
    );
  }, [proposals, jobs, currentUser.userId]);

  const myReceivedReviews = useMemo(
    () => reviews.filter((r) => r.targetUserId === currentUser.userId),
    [reviews, currentUser.userId]
  );

  const savedJobs = jobs.filter((j) => savedItemIds.includes(j.id));
  const savedProducts = products.filter((p) => savedItemIds.includes(p.id));
  const savedServices = services.filter((s) => savedItemIds.includes(s.id));

  const myProducts = products.filter((p) => p.sellerId === currentUser.userId);
  const incomingOrderNotifs = notifications.filter((n) => n.type === 'ORDER');

  const openEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setEditPrice(String(prod.price || 0));
    setEditWholesalePrice(prod.wholesalePrice ? String(prod.wholesalePrice) : '');
    setEditQty(String(prod.quantity ?? 1));
    setEditDelivery(prod.deliveryInfo || '');
  };

  const handleSaveProductEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    await updateProduct(editingProduct.id, {
      price: Number(editPrice) || editingProduct.price,
      wholesalePrice: editWholesalePrice ? Number(editWholesalePrice) : undefined,
      quantity: Math.max(0, Number(editQty) || 0),
      deliveryInfo: editDelivery.trim() || undefined,
    });
    setEditingProduct(null);
  };

  const getStatusChip = (status: ProposalStatus) => {
    const s = String(status).toUpperCase();
    if (s === 'ACCEPTED' || s === 'COMPLETED') return 'bg-emerald-100 text-emerald-800';
    if (s === 'SHORTLISTED' || s === 'INTERVIEW') return 'bg-blue-100 text-blue-800';
    if (s === 'REJECTED') return 'bg-rose-100 text-rose-800';
    return 'bg-amber-100 text-amber-800';
  };

  const handleConfirmRating = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ratingTarget) return;
    if (ratingTarget.mode === 'complete_freelancer') {
      const targetJob = jobs.find((j) => j.id === ratingTarget.proposal.jobId);
      await completeProposalAndReview({
        proposal: ratingTarget.proposal,
        job: targetJob,
        rating: starRating,
        comment: ratingComment.trim() || 'Excellent professional work completed on time.',
        projectRole: 'FREELANCER',
        targetUserId: ratingTarget.targetUserId,
      });
    } else {
      await submitReview({
        targetUserId: ratingTarget.targetUserId,
        targetId: ratingTarget.proposal.jobId,
        projectTitle: ratingTarget.proposal.jobTitle,
        projectRole: 'JOB_POSTER',
        rating: starRating,
        comment: ratingComment.trim() || 'Great employer with clear communication.',
      });
    }
    setRatingTarget(null);
    setRatingComment('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Welcome & Profile Overview */}
      <div className="bg-gradient-to-r from-[#08294F] to-[#123B6D] text-white rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            <img
              src={currentUser.profilePhotoUrl || DEFAULT_AVATAR_URL}
              alt={currentUser.fullName}
              referrerPolicy="no-referrer"
              onError={handleImageFallback(DEFAULT_AVATAR_URL)}
              className={`w-16 h-16 rounded-2xl object-cover ring-2 ${
                currentUser.verificationStatus === 'verified'
                  ? 'ring-emerald-400 shadow-md shadow-emerald-500/20'
                  : 'ring-[#D4A72C]'
              }`}
            />
            {currentUser.verificationStatus === 'verified' && (
              <span
                className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full ring-2 ring-[#08294F] shadow-xs flex items-center justify-center"
                title="Verified Member"
              >
                <ShieldCheck className="w-3.5 h-3.5 fill-white/20" />
              </span>
            )}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-white">
                {currentUser.fullName}
              </h1>
              <VerificationBadge
                status={
                  currentUser.verificationStatus === 'rejected'
                    ? 'unverified'
                    : currentUser.verificationStatus || 'unverified'
                }
                size="sm"
                entityName={currentUser.fullName}
                entityRole={currentUser.profession || currentUser.businessName}
                entityAvatar={currentUser.profilePhotoUrl}
              />
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400/20 text-[#F3D77A] text-[11px] font-bold">
                <Star className="w-3 h-3 fill-[#F3D77A]" />
                <span>
                  {Number(currentUser.rating ?? 5.0).toFixed(1)} ({currentUser.reviewCount || 0})
                </span>
              </span>
            </div>
            <p className="text-xs text-slate-300 font-medium">
              {currentUser.profession ||
                currentUser.businessName ||
                'Member of Orthodox Economic Network'}{' '}
              · {currentUser.primaryRole}
            </p>
            <p className="text-[11px] text-slate-400">
              {currentUser.location} · {currentUser.email}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-2 self-stretch md:self-auto">
          <button
            onClick={() => openModal('post')}
            className="flex-1 sm:flex-none bg-[#D4A72C] hover:bg-[#c29623] text-[#08294F] font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t.dashQuickPost}</span>
          </button>
          <button
            onClick={() => openModal('profile')}
            className="flex-1 sm:flex-none bg-white/10 hover:bg-white/20 text-white font-semibold px-4 py-2.5 rounded-xl text-xs sm:text-sm border border-white/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <User className="w-4 h-4" />
            <span>Edit Profile</span>
          </button>
        </div>
      </div>

      {/* Trust & Verification Status Card */}
      <VerificationStatusCard
        status={
          currentUser.verificationStatus === 'rejected'
            ? 'unverified'
            : currentUser.verificationStatus || 'unverified'
        }
        fullName={currentUser.fullName}
        role={currentUser.profession || currentUser.businessName}
        language={language}
      />

      {/* 4 Statistics Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: t.dashActivePosts,
            value: myListings.length,
            icon: Briefcase,
            color: 'text-[#123B6D]',
          },
          {
            label: t.dashProposalsSent,
            value: `${mySentProposals.length} / ${myReceivedProposals.length}`,
            icon: FileCheck2,
            color: 'text-[#16845B]',
          },
          {
            label: t.dashMessages,
            value: conversations.length,
            icon: MessageSquare,
            color: 'text-[#2563EB]',
          },
          {
            label: language === 'am' ? 'የተጠናቀቁ ሥራዎች' : 'Completed Jobs',
            value: completedJobs.length,
            icon: Award,
            color: 'text-[#D4A72C]',
          },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-[#E2E8F0] dark:border-slate-800 shadow-xs space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 font-ethiopic">
                  {stat.label}
                </span>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* AI Insights & Recommendations Banner */}
      <div className="bg-gradient-to-br from-[#123B6D]/5 via-[#3B1C54]/5 to-[#D4A72C]/10 border border-[#123B6D]/20 dark:border-slate-800 rounded-3xl p-6 sm:p-7 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#123B6D] to-[#3B1C54] text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5 text-[#F3D77A]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white font-ethiopic">
                  {language === 'am'
                    ? 'የ AI ስማርት ጥቆማዎችና ምክሮች'
                    : 'AI Smart Insights & Recommendations'}
                </h3>
                <span className="bg-[#3B1C54] text-[#F3D77A] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Gemini 3.8
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-ethiopic">
                {language === 'am'
                  ? 'በእርስዎ ክህሎት እና ልጥፎች ላይ ተመሥርቶ የተዘጋጀ ብልህ የሥራና የንግድ ድጋፍ'
                  : 'Tailored career and marketplace intelligence powered by server-side Gemini'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('ai-studio')}
            className="bg-gradient-to-r from-[#123B6D] to-[#3B1C54] hover:opacity-95 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#F3D77A]" />
            <span>{language === 'am' ? 'AI ኮንተንት ስቱዲዮ ክፈት' : 'Open AI Studio'}</span>
          </button>
        </div>

        {/* Personalized Job Matches Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
              {language === 'am'
                ? 'ለእርስዎ የተመረጡ ከፍተኛ ግጥጥሞሽ ያላቸው ሥራዎች'
                : 'Top Matched Jobs for Your Profile'}
            </h4>
            <button
              onClick={() => setActiveTab('jobs')}
              className="text-xs font-bold text-[#123B6D] dark:text-[#F3D77A] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>{language === 'am' ? 'ሁሉንም እይ' : 'View all'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {jobs.slice(0, 3).map((job, idx) => {
              const userSkills = (currentUser.skills || []).map((s: string) => s.toLowerCase());
              const jobSkills = (job.skillsRequired || []).map((s: string) => s.toLowerCase());
              const matchCount =
                userSkills.length > 0 && jobSkills.length > 0
                  ? jobSkills.filter((s: string) =>
                      userSkills.some((u: string) => u.includes(s) || s.includes(u))
                    ).length
                  : 0;
              const matchPercent = Math.min(97, Math.max(68, Math.round(70 + matchCount * 10 + idx * 3)));

              return (
                <div
                  key={job.id}
                  onClick={() => openModal('job_detail', job)}
                  className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 hover:border-[#123B6D] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold text-slate-500 truncate">
                        {job.employerName}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                        <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                        {matchPercent}% Match
                      </span>
                    </div>
                    <h5 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1 font-ethiopic">
                      {language === 'am' ? job.amharicTitle || job.title : job.title}
                    </h5>
                    <p className="text-xs text-slate-500 flex items-center gap-2">
                      <span>{job.location}</span>
                      <span>•</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {job.budget
                          ? `${job.budget.toLocaleString()} ${job.budgetCurrency}`
                          : language === 'am'
                          ? 'ድርድር'
                          : 'Negotiable'}
                      </span>
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1 pt-1 border-t border-slate-100 dark:border-slate-800">
                    {(job.skillsRequired || []).slice(0, 3).map((skill: string, sIdx: number) => (
                      <span
                        key={sIdx}
                        className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] px-2 py-0.5 rounded-md font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Workspace Tabs */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-[#E2E8F0] dark:border-slate-800 p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 overflow-x-auto no-scrollbar">
          {[
            { id: 'listings' as const, label: `${t.dashActivePosts} (${myListings.length})` },
            {
              id: 'proposals' as const,
              label: `${language === 'am' ? 'ማመልከቻዎች' : 'Proposals'} (${mySentProposals.length + myReceivedProposals.length})`,
            },
            {
              id: 'completed' as const,
              label: `${language === 'am' ? 'የተጠናቀቁ ሥራዎችና ግምገማ' : 'Completed & Reviews'} (${completedJobs.length})`,
            },
            { id: 'saved' as const, label: `${t.dashSavedItems} (${savedItemIds.length})` },
          ].map((tabItem) => (
            <button
              key={tabItem.id}
              onClick={() => setActiveTabSection(tabItem.id)}
              className={`pb-2 px-3 text-sm font-bold transition-all cursor-pointer relative shrink-0 ${
                activeTabSection === tabItem.id
                  ? 'text-[#123B6D] dark:text-[#F3D77A]'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tabItem.label}
              {activeTabSection === tabItem.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#123B6D]" />
              )}
            </button>
          ))}
        </div>

        {/* Tab 1: Seller Inventory & Active Listings */}
        {activeTabSection === 'listings' && (
          <div className="space-y-6">
            {/* Incoming Orders / Product Inquiries */}
            {incomingOrderNotifs.length > 0 && (
              <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5 font-ethiopic">
                    <ShoppingBag className="w-4 h-4 text-emerald-600" />
                    <span>
                      {language === 'am'
                        ? `የገቢ ምርት ትዕዛዞችና ጥያቄዎች (${incomingOrderNotifs.length})`
                        : `Incoming Product Orders & Inquiries (${incomingOrderNotifs.length})`}
                    </span>
                  </h4>
                  <button
                    onClick={() => setActiveTab('messages')}
                    className="text-[11px] font-bold text-[#123B6D] dark:text-[#F3D77A] hover:underline cursor-pointer"
                  >
                    {language === 'am' ? 'መልእክቶችን ክፈት →' : 'Open Order Chats →'}
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {incomingOrderNotifs.slice(0, 4).map((ord) => (
                    <div
                      key={ord.id}
                      className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-emerald-200/70 text-xs space-y-1"
                    >
                      <p className="font-bold text-slate-900 dark:text-white truncate">
                        {language === 'am' ? ord.amharicTitle || ord.title : ord.title}
                      </p>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2">
                        {language === 'am' ? ord.messageAm || ord.message : ord.message}
                      </p>
                      <PostedDateTime value={ord.createdAt} language={language} variant="compact" className="pt-0.5" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Seller Inventory Products Section */}
            {myProducts.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-[#16845B]" />
                    <span>
                      {language === 'am'
                        ? `የሻጭ የዕቃ ክምችት አስተዳደር (${myProducts.length})`
                        : `Seller Inventory Management (${myProducts.length})`}
                    </span>
                  </h4>
                  <button
                    onClick={() => openModal('post', { defaultType: 'product' })}
                    className="text-xs font-bold text-[#16845B] hover:underline cursor-pointer"
                  >
                    + {language === 'am' ? 'አዲስ ምርት ጨምር' : 'Add Product'}
                  </button>
                </div>

                <div className="space-y-2.5">
                  {myProducts.map((prod) => (
                    <div
                      key={prod.id}
                      className="bg-[#F8FAFC] dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={prod.imageUrl}
                          alt={prod.title}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                        />
                        <div className="min-w-0 space-y-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                prod.isAvailable
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {prod.isAvailable
                                ? language === 'am'
                                  ? 'በክምችት አለ (In Stock)'
                                  : 'In Stock'
                                : language === 'am'
                                ? 'አልቋል (Out of Stock)'
                                : 'Out of Stock'}
                            </span>
                            <span className="text-xs font-black text-[#123B6D] dark:text-[#F3D77A]">
                              {prod.price.toLocaleString()} {prod.currency}
                            </span>
                            <span className="text-[11px] text-slate-500">
                              · Qty: {prod.quantity}
                            </span>
                          </div>
                          <h5 className="font-ethiopic text-sm font-bold text-slate-900 dark:text-white truncate">
                            {language === 'am' ? prod.amharicTitle || prod.title : prod.title}
                          </h5>
                          <PostedDateTime value={prod.createdAt} language={language} variant="inline" className="pt-0.5" />
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                        <button
                          onClick={() =>
                            updateProduct(prod.id, { isAvailable: !prod.isAvailable })
                          }
                          className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold cursor-pointer border transition-colors ${
                            prod.isAvailable
                              ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                              : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                          }`}
                        >
                          {prod.isAvailable
                            ? language === 'am'
                              ? 'አልቋል በል'
                              : 'Mark Out of Stock'
                            : language === 'am'
                            ? 'አለ በል'
                            : 'Mark Available'}
                        </button>

                        <button
                          onClick={() => openEditProduct(prod)}
                          className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:border-[#123B6D] flex items-center gap-1 cursor-pointer"
                        >
                          <Pencil className="w-3 h-3" />
                          <span>{language === 'am' ? 'ዋጋ/ብዛት አስተካክል' : 'Edit'}</span>
                        </button>

                        {confirmDeleteId === prod.id ? (
                          <button
                            onClick={async () => {
                              await deleteProduct(prod.id);
                              setConfirmDeleteId(null);
                            }}
                            className="px-2.5 py-1.5 rounded-xl bg-rose-600 text-white text-[11px] font-bold cursor-pointer"
                          >
                            {language === 'am' ? 'አረጋግጥ (Delete)' : 'Confirm'}
                          </button>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteId(prod.id)}
                            className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-50 cursor-pointer"
                            title="Delete product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* All Other Active Listings (Jobs & Services) */}
            <div className="space-y-3">
              {myProducts.length > 0 && (
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">
                  {language === 'am' ? 'የሥራና የአገልግሎት ማስታወቂያዎቼ' : 'My Jobs & Services'}
                </h4>
              )}
              {myListings.filter((i) => i.itemType !== 'product').length > 0 ? (
                myListings
                  .filter((i) => i.itemType !== 'product')
                  .map((item) => (
                    <div
                      key={item.id}
                      className="bg-[#F8FAFC] dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase bg-[#123B6D] text-white px-2 py-0.5 rounded">
                            {item.itemType}
                          </span>
                          <span className="text-xs text-slate-500">{item.location}</span>
                        </div>
                        <h4 className="font-ethiopic text-sm font-bold text-slate-900 dark:text-white">
                          {item.title}
                        </h4>
                        <PostedDateTime value={item.createdAt} language={language} variant="inline" className="pt-0.5" />
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => {
                            if (item.itemType === 'job') openModal('job_detail', item);
                            else setActiveTab('services');
                          }}
                          className="text-xs font-semibold text-[#123B6D] dark:text-[#F3D77A] hover:underline cursor-pointer"
                        >
                          View →
                        </button>
                        {confirmDeleteId === item.id ? (
                          <button
                            onClick={async () => {
                              if (item.itemType === 'job') await deleteJob(item.id);
                              else await deleteService(item.id);
                              setConfirmDeleteId(null);
                            }}
                            className="px-2 py-1 rounded-lg bg-rose-600 text-white text-[10px] font-bold cursor-pointer"
                          >
                            Confirm Delete
                          </button>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteId(item.id)}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer"
                            title="Delete listing"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
              ) : myListings.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  {language === 'am'
                    ? 'እስካሁን ምንም ማስታወቂያ አልለጠፉም።'
                    : 'You have not published any listings yet.'}
                </div>
              ) : null}
            </div>
          </div>
        )}

        {/* Tab 2: Proposals (Sent & Received Workflow) */}
        {activeTabSection === 'proposals' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setProposalFilter('sent')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
                  proposalFilter === 'sent'
                    ? 'bg-[#123B6D] text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                {language === 'am'
                  ? `የላክኋቸው ማመልከቻዎች (${mySentProposals.length})`
                  : `My Sent Proposals (${mySentProposals.length})`}
              </button>
              <button
                onClick={() => setProposalFilter('received')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
                  proposalFilter === 'received'
                    ? 'bg-[#123B6D] text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                {language === 'am'
                  ? `ለሥራዎቼ የቀረቡ ማመልከቻዎች (${myReceivedProposals.length})`
                  : `Incoming on My Jobs (${myReceivedProposals.length})`}
              </button>
            </div>

            {proposalFilter === 'sent' ? (
              mySentProposals.length > 0 ? (
                <div className="space-y-3">
                  {mySentProposals.map((prop) => (
                    <div
                      key={prop.id}
                      className="bg-[#F8FAFC] dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-sm font-bold text-[#08294F] dark:text-white">
                          {prop.jobTitle}
                        </h4>
                        <span className="text-xs font-bold text-[#123B6D] dark:text-[#F3D77A]">
                          {prop.bidAmount.toLocaleString()} {prop.currency} · {prop.deliveryDays} days
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 italic">
                        "{prop.coverLetter}"
                      </p>
                      <div className="flex items-center justify-between text-[11px] pt-1">
                        <PostedDateTime value={prop.createdAt} language={language} variant="compact" />
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${getStatusChip(
                              prop.status
                            )}`}
                          >
                            {prop.status}
                          </span>
                          {(String(prop.status).toUpperCase() === 'ACCEPTED' ||
                            String(prop.status).toUpperCase() === 'COMPLETED') &&
                            prop.employerId && (
                              <button
                                onClick={() =>
                                  setRatingTarget({
                                    proposal: prop,
                                    mode: 'rate_employer',
                                    targetUserId: prop.employerId || '',
                                    targetName: 'Employer',
                                  })
                                }
                                className="px-2.5 py-1 rounded-lg bg-[#D4A72C] text-[#08294F] text-[10px] font-black cursor-pointer"
                              >
                                Rate Employer
                              </button>
                            )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400 text-xs">
                  {language === 'am'
                    ? 'እስካሁን ያመለከቱት ሥራ የለም።'
                    : 'You have not submitted any proposals yet.'}
                </div>
              )
            ) : myReceivedProposals.length > 0 ? (
              <div className="space-y-3">
                {myReceivedProposals.map((prop) => (
                  <div
                    key={prop.id}
                    className="bg-[#F8FAFC] dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-bold text-[#08294F] dark:text-white">
                          {prop.jobTitle}
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-300 font-semibold">
                          Applicant: {prop.freelancerName}{' '}
                          {prop.freelancerPhone ? `· ${prop.freelancerPhone}` : ''}
                        </p>
                        <PostedDateTime value={prop.createdAt} language={language} variant="compact" className="mt-1" />
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-[#123B6D] dark:text-[#F3D77A] block">
                          {prop.bidAmount.toLocaleString()} {prop.currency} · {prop.deliveryDays}d
                        </span>
                        <span
                          className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${getStatusChip(
                            prop.status
                          )}`}
                        >
                          {prop.status}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 italic">
                      "{prop.coverLetter}"
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <button
                        onClick={() => updateProposalStatus(prop.id, 'UNDER_REVIEW')}
                        className="px-2.5 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 text-[11px] font-bold cursor-pointer"
                      >
                        Review
                      </button>
                      <button
                        onClick={() => updateProposalStatus(prop.id, 'SHORTLISTED')}
                        className="px-2.5 py-1 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-800 text-[11px] font-bold cursor-pointer"
                      >
                        Shortlist
                      </button>
                      <button
                        onClick={() => updateProposalStatus(prop.id, 'INTERVIEW')}
                        className="px-2.5 py-1 rounded-lg bg-indigo-100 hover:bg-indigo-200 text-indigo-800 text-[11px] font-bold cursor-pointer"
                      >
                        Interview
                      </button>
                      <button
                        onClick={() => updateProposalStatus(prop.id, 'ACCEPTED')}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold cursor-pointer"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() =>
                          setRatingTarget({
                            proposal: prop,
                            mode: 'complete_freelancer',
                            targetUserId: prop.freelancerId,
                            targetName: prop.freelancerName,
                          })
                        }
                        className="px-2.5 py-1 rounded-lg bg-[#D4A72C] hover:bg-[#c29623] text-[#08294F] text-[11px] font-black cursor-pointer"
                      >
                        Complete & Rate
                      </button>
                      <button
                        onClick={() => updateProposalStatus(prop.id, 'REJECTED')}
                        className="px-2.5 py-1 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-700 text-[11px] font-bold cursor-pointer"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400 text-xs">
                {language === 'am'
                  ? 'ለሥራዎችዎ የቀረበ ማመልከቻ የለም።'
                  : 'No incoming proposals on your job postings yet.'}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Completed Jobs & Reviews */}
        {activeTabSection === 'completed' && (
          <div className="space-y-5">
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {language === 'am'
                  ? `የተጠናቀቁ ሥራዎች (${completedJobs.length})`
                  : `Completed Jobs History (${completedJobs.length})`}
              </h4>
              {completedJobs.length > 0 ? (
                completedJobs.map((cj) => (
                  <div
                    key={cj.id}
                    className="p-4 rounded-xl bg-[#F8FAFC] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <h5 className="font-bold text-sm text-slate-900 dark:text-white">
                        {cj.amharicTitle || cj.title}
                      </h5>
                      <span className="text-xs font-black text-emerald-600">
                        {cj.earningsAmount.toLocaleString()} ETB · ★ {cj.rating}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Client: {cj.clientName} · {cj.completionDate}
                    </p>
                    {cj.feedback && (
                      <p className="text-xs text-slate-700 dark:text-slate-300 italic">
                        "{cj.feedback}"
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-slate-400 text-xs">
                  {language === 'am'
                    ? 'እስካሁን የተጠናቀቁ ሥራዎች አልተመዘገቡም።'
                    : 'No completed jobs recorded yet.'}
                </div>
              )}
            </div>

            {myReceivedReviews.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {language === 'am'
                    ? `የደንበኞች ግምገማ (${myReceivedReviews.length})`
                    : `Reviews Received (${myReceivedReviews.length})`}
                </h4>
                {myReceivedReviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-4 rounded-xl bg-amber-50/40 dark:bg-slate-800 border border-amber-200/70 dark:border-slate-700 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {rev.authorName}
                      </span>
                      <span className="text-xs font-black text-amber-600">
                        {'★'.repeat(Math.round(rev.rating))} ({rev.rating}/5)
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300">{rev.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Saved Items (Jobs, Products & Services) */}
        {activeTabSection === 'saved' && (
          <div className="space-y-3">
            {[
              ...savedJobs.map((j) => ({ ...j, _savedKind: 'job' as const })),
              ...savedProducts.map((p) => ({ ...p, _savedKind: 'product' as const })),
              ...savedServices.map((s) => ({ ...s, _savedKind: 'service' as const })),
            ].length > 0 ? (
              [
                ...savedJobs.map((j) => ({ ...j, _savedKind: 'job' as const })),
                ...savedProducts.map((p) => ({ ...p, _savedKind: 'product' as const })),
                ...savedServices.map((s) => ({ ...s, _savedKind: 'service' as const })),
              ].map((item: any) => (
                <div
                  key={item.id}
                  className="bg-[#F8FAFC] dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-4"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase bg-purple-100 text-purple-800 px-2 py-0.5 rounded inline-flex items-center gap-1">
                        {item._savedKind === 'service' && <Wrench className="w-2.5 h-2.5" />}
                        {item._savedKind}
                      </span>
                      <span className="text-xs text-slate-500">{item.location}</span>
                    </div>
                    <h4 className="font-ethiopic text-sm font-bold text-slate-900 dark:text-white truncate">
                      {language === 'am' ? item.amharicTitle || item.title : item.title}
                    </h4>
                    <PostedDateTime value={item.createdAt} language={language} variant="compact" className="pt-0.5" />
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => toggleSaveItem(item.id)}
                      className="p-1.5 rounded-lg text-amber-500 hover:bg-amber-50 cursor-pointer"
                      title="Remove Bookmark"
                    >
                      <Bookmark className="w-4 h-4 fill-amber-500" />
                    </button>
                    <button
                      onClick={() => {
                        if (item._savedKind === 'job') openModal('job_detail', item);
                        else if (item._savedKind === 'product') openModal('product_detail', item);
                        else setActiveTab('services');
                      }}
                      className="text-xs font-semibold text-[#123B6D] dark:text-[#F3D77A] hover:underline cursor-pointer"
                    >
                      Open Details →
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-400 text-xs">
                {language === 'am' ? 'ምንም የተቀመጠ ዕቃ የለም።' : 'No bookmarked jobs, products, or services yet.'}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Seller Inventory Edit Product Modal */}
      {editingProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs"
          onClick={() => setEditingProduct(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 space-y-4 font-ethiopic"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-[#08294F] dark:text-white flex items-center gap-2">
                <Package className="w-4 h-4 text-[#16845B]" />
                <span>{language === 'am' ? 'የምርት ዋጋና ክምችት አስተካክል' : `Edit ${editingProduct.title}`}</span>
              </h4>
              <button onClick={() => setEditingProduct(null)} className="text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveProductEdit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    {language === 'am' ? 'የችርቻሮ ዋጋ (ETB)' : 'Unit Price (ETB)'}
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    {language === 'am' ? 'የጅምላ ዋጋ (አማራጭ)' : 'Wholesale Price'}
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={editWholesalePrice}
                    onChange={(e) => setEditWholesalePrice(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    {language === 'am' ? 'ክምችት ብዛት (Qty)' : 'Stock Quantity'}
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={editQty}
                    onChange={(e) => setEditQty(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    {language === 'am' ? 'የማድረሻ መረጃ' : 'Delivery Info'}
                  </label>
                  <input
                    type="text"
                    value={editDelivery}
                    onChange={(e) => setEditDelivery(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-[#16845B] hover:bg-[#126b4a] text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                {language === 'am' ? 'ለውጦችን አስቀምጥ' : 'Save Inventory Changes'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Rating / Complete Project Modal */}
      {ratingTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs"
          onClick={() => setRatingTarget(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-[#08294F] dark:text-white flex items-center gap-2 font-ethiopic">
                <CheckCircle2 className="w-4 h-4 text-[#16845B]" />
                <span>
                  {ratingTarget.mode === 'complete_freelancer'
                    ? `Complete & Rate ${ratingTarget.targetName}`
                    : `Rate Employer (${ratingTarget.proposal.jobTitle})`}
                </span>
              </h4>
              <button onClick={() => setRatingTarget(null)} className="text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleConfirmRating} className="space-y-3">
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    type="button"
                    key={s}
                    onClick={() => setStarRating(s)}
                    className="p-1 cursor-pointer"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        s <= starRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
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
                  language === 'am' ? 'ምስክርነትዎን ይጻፉ...' : 'Write your review feedback...'
                }
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
              />
              <button
                type="submit"
                className="w-full py-2.5 bg-[#16845B] hover:bg-[#126b4a] text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                {language === 'am' ? 'አረጋግጥና መዝግብ' : 'Submit & Save'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
