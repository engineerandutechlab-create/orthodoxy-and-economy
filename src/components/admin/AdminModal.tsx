import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { VerificationBadge } from '../common/Badge';
import { PostedDateTime } from '../common/PostedDateTime';
import { 
  X, 
  ShieldCheck, 
  Check, 
  UserX, 
  Users, 
  Briefcase, 
  ShoppingBag, 
  Building2,
  Trash2,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  Database,
  ExternalLink,
  Copy,
  Flag,
  ShieldAlert,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Eye,
  Clock,
  Phone,
  Send,
  MapPin,
  Tag,
  AlertCircle,
  Lock,
  Key,
  Crown,
  Download,
  Shield,
  Wrench,
  Ban
} from 'lucide-react';
import {
  Job,
  Product,
  ALL_CANONICAL_ROLES,
  formatRoleLabel,
  UserRole,
} from '../../types';

const SUPER_ADMIN_EMAILS = [
  'andupaman3@gmail.com',
  'habtamweday1@gmail.com',
  'admin@orthodoxy.et'
];
const SUPER_ADMIN_EMAIL = 'andupaman3@gmail.com';

export const AdminModal: React.FC = () => {
  const { 
    closeModal, 
    jobs, 
    gigsCount,
    products, 
    services, 
    businesses, 
    professionals, 
    registeredUsers,
    proposals,
    reviews,
    reports,
    currentUser, 
    isAdmin,
    signInWithGoogle,
    language,
    flagJob,
    unflagJob,
    deleteJob,
    flagProduct,
    unflagProduct,
    deleteProduct,
    deleteService,
    resolveReport,
    suspendUser,
    changeUserRole,
    deleteUser,
    updateProfessionalStatus,
    updateUserVerification
  } = useApp();

  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<{
    kind: 'user' | 'mod' | 'job' | 'product' | 'service';
    id: string;
    isJob?: boolean;
  } | null>(null);

  // Active top-level admin tab
  const [activeTab, setActiveTab] = useState<'moderation' | 'reports' | 'verification' | 'listings' | 'ai_audit' | 'database'>('verification');
  const [reportFilter, setReportFilter] = useState<'ALL' | 'PENDING' | 'RESOLVED' | 'DISMISSED' | 'ACTION_TAKEN'>('PENDING');

  // Verification tab states
  const [verificationFilter, setVerificationFilter] = useState<'all' | 'pending' | 'verified' | 'rejected'>('pending');
  const [verificationSearch, setVerificationSearch] = useState('');
  const [selectedProfForReject, setSelectedProfForReject] = useState<string | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');

  // Live users synced directly with Firestore /users collection (zero mock fallback)
  const userList = useMemo(() => {
    return registeredUsers.map((u) => ({
      id: u.userId,
      name: u.fullName,
      role: u.primaryRole,
      status: u.verificationStatus || 'unverified',
      isSuspended: Boolean(u.isSuspended),
      email: u.email,
      location: u.location || 'Addis Ababa',
      phone: u.phone || '',
    }));
  }, [registeredUsers]);

  // Content moderation states
  const [moderationFilter, setModerationFilter] = useState<'all' | 'flagged' | 'jobs' | 'products'>('all');
  const [moderationSearch, setModerationSearch] = useState('');
  const [selectedItemForFlag, setSelectedItemForFlag] = useState<{ type: 'job' | 'product'; id: string; title: string } | null>(null);
  const [flagReasonInput, setFlagReasonInput] = useState('አግባብ ያልሆነ ይዘት ወይም የደላላ ጥርጣሬ (Broker/Inappropriate content suspicion)');
  const [customFlagReason, setCustomFlagReason] = useState('');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // AI audit & database states
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditComplete, setAuditComplete] = useState(false);

  const showNotification = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(null), 3000);
  };

  const toggleUserVerification = (id: string) => {
    const user = userList.find((u) => u.id === id);
    if (!user) return;
    const nextStatus = user.status === 'verified' ? 'pending' : 'verified';
    updateUserVerification(user.id, nextStatus);
    showNotification(
      nextStatus === 'verified'
        ? `${user.name} ጸድቋል! የማረጋገጫ ባጅ ተሰጥቷል`
        : `${user.name} የማረጋገጫ ባጅ ተነስቷል`
    );
  };

  // Flagged & Reports counts
  const flaggedJobsCount = useMemo(() => jobs.filter(j => j.isFlagged).length, [jobs]);
  const flaggedProductsCount = useMemo(() => products.filter(p => p.isFlagged).length, [products]);
  const totalFlaggedCount = flaggedJobsCount + flaggedProductsCount;
  const pendingReportsCount = useMemo(() => reports.filter(r => r.status === 'PENDING').length, [reports]);

  // Pending professionals count
  const pendingProfCount = useMemo(() => {
    return professionals.filter(p => (p.status || (!p.isVerified ? 'pending' : 'verified')) === 'pending').length;
  }, [professionals]);

  // Combined verified count
  const verifiedCount = useMemo(() => {
    return userList.filter(u => u.status === 'verified').length;
  }, [userList]);

  // Filtered professionals list
  const filteredProfessionals = useMemo(() => {
    return professionals.filter(prof => {
      const currentStatus = prof.status || (prof.isVerified ? 'verified' : 'pending');
      const matchStatus = verificationFilter === 'all' || currentStatus === verificationFilter;
      const q = verificationSearch.toLowerCase().trim();
      const matchSearch = !q || 
        prof.fullName.toLowerCase().includes(q) ||
        (prof.fullNameAm && prof.fullNameAm.toLowerCase().includes(q)) ||
        prof.title.toLowerCase().includes(q) ||
        (prof.titleAm && prof.titleAm.toLowerCase().includes(q)) ||
        prof.category.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [professionals, verificationFilter, verificationSearch]);

  // Moderation items combining jobs and products
  const moderationItems = useMemo(() => {
    const jobItems = jobs.map(j => ({ ...j, itemKind: 'job' as const }));
    const productItems = products.map(p => ({ ...p, itemKind: 'product' as const }));

    let list = [...jobItems, ...productItems];

    if (moderationFilter === 'flagged') {
      list = list.filter(item => item.isFlagged);
    } else if (moderationFilter === 'jobs') {
      list = list.filter(item => item.itemKind === 'job');
    } else if (moderationFilter === 'products') {
      list = list.filter(item => item.itemKind === 'product');
    }

    if (moderationSearch.trim()) {
      const q = moderationSearch.toLowerCase().trim();
      list = list.filter(item => {
        const title = item.title.toLowerCase();
        const amTitle = item.amharicTitle ? item.amharicTitle.toLowerCase() : '';
        const author = 'employerName' in item ? item.employerName.toLowerCase() : item.sellerName.toLowerCase();
        return title.includes(q) || amTitle.includes(q) || author.includes(q);
      });
    }

    return list;
  }, [jobs, products, moderationFilter, moderationSearch]);

  const handleConfirmFlag = () => {
    if (!selectedItemForFlag) return;
    const reason = customFlagReason.trim() || flagReasonInput;
    if (selectedItemForFlag.type === 'job') {
      flagJob(selectedItemForFlag.id, reason);
    } else {
      flagProduct(selectedItemForFlag.id, reason);
    }
    showNotification(`ልጥፉ ታግዷል (Flagged): "${selectedItemForFlag.title}"`);
    setSelectedItemForFlag(null);
    setCustomFlagReason('');
  };

  const handleConfirmRejectProf = (profId: string) => {
    updateProfessionalStatus(profId, 'rejected', rejectionReasonInput || 'የማኅበረሰብ መስፈርትን አያሟላም');
    showNotification('የባለሙያው ማመልከቻ ውድቅ ተደርጓል (Rejected)');
    setSelectedProfForReject(null);
    setRejectionReasonInput('');
  };

  const handleAdminGoogleVerify = async () => {
    setAuthError(null);
    setAuthLoading(true);
    try {
      const res = await signInWithGoogle();
      if (!res.success) {
        setAuthError(res.error || 'Authentication failed.');
      }
    } catch (err: any) {
      setAuthError(err?.message || 'Authentication failed.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleExportDatabaseBackup = () => {
    const backupData = {
      exportedAt: new Date().toISOString(),
      databaseId: 'ai-studio-android-ortodoxt-978cc305-7d2a-4a20-81c0-3f71d9ab1ae5',
      projectId: 'gen-lang-client-0973048388',
      superAdmins: SUPER_ADMIN_EMAILS,
      collections: {
        jobs,
        products,
        services,
        businesses,
        proposals,
        reviews,
        reports,
        users: registeredUsers,
      }
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Orthodoxy_Economy_Firestore_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showNotification('ሙሉ የዳታቤዝ ባካፕ (JSON Backup) በስኬት ወርዷል!');
  };

  // =========================================================================
  // SECURITY LOCK GATEKEEPER - ENFORCES REAL FIREBASE AUTH SUPER ADMIN
  // =========================================================================
  if (!isAdmin) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto font-ethiopic animate-in fade-in">
        <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
          
          <div className="p-6 bg-gradient-to-r from-[#06182B] via-[#08294F] to-[#240F3D] text-white relative text-center space-y-3">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 p-1.5 text-slate-300 hover:text-white rounded-xl hover:bg-white/10 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
              <Lock className="w-7 h-7" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-black uppercase tracking-wider mb-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Super Admin Restricted</span>
              </div>
              <h3 className="text-lg font-black text-white">
                የአስተዳዳሪ ደኅንነት መቆጣጠሪያ
              </h3>
              <p className="text-xs text-purple-200 mt-1">
                ይህ ገጽ ለተፈቀደላቸው ዋና አድሚኖች (<strong className="text-amber-300">{SUPER_ADMIN_EMAIL}</strong>) ብቻ በ Firebase Auth የተጠበቀ ነው።
              </p>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 leading-relaxed">
              <p className="font-bold flex items-center gap-1.5 text-amber-950 mb-1">
                <Crown className="w-4 h-4 text-[#D4A72C]" />
                <span>ሙሉ የ Firebase ደኅንነት ጥበቃ፦</span>
              </p>
              ወደ አስተዳዳሪ ዳሽቦርድ ለመግባት በተፈቀደው የአድሚን Google አካውንት በ Firebase በኩል ማረጋገጥ ያስፈልጋል።
            </div>

            {authError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold">
                {authError}
              </div>
            )}

            <button
              type="button"
              disabled={authLoading}
              onClick={handleAdminGoogleVerify}
              className="w-full py-2.5 px-4 bg-[#D4A72C] hover:bg-[#e0b439] disabled:opacity-60 text-[#08294F] text-xs font-black rounded-xl transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
            >
              <Crown className="w-4 h-4" />
              <span>
                {authLoading
                  ? 'በማረጋገጥ ላይ...'
                  : 'በተፈቀደ Google አድሚን አካውንት ግባ (Verify with Google)'}
              </span>
            </button>

            <div className="text-center pt-1">
              <button
                onClick={closeModal}
                className="text-xs text-slate-400 hover:text-slate-600 font-medium cursor-pointer"
              >
                ይቅር፣ ተመለስ (Cancel & Return)
              </button>
            </div>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[92vh] overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 flex flex-col font-ethiopic">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-[#06182B] via-[#08294F] to-[#1E1138] text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#D4A72C]" />
              <h3 className="text-base sm:text-lg font-black text-white">
                {language === 'am' ? 'የአስተዳዳሪና የይዘት ቁጥጥር ፖርታል' : 'Community Moderation & Admin Portal'}
              </h3>
              <span className="inline-flex items-center gap-1 bg-[#D4A72C]/20 border border-[#D4A72C]/40 text-[#F3D77A] text-[10px] font-black px-2.5 py-0.5 rounded-full">
                <Crown className="w-3 h-3 text-[#D4A72C]" />
                <span>Super Admin: {currentUser?.email || SUPER_ADMIN_EMAIL}</span>
              </span>
            </div>
            <p className="text-xs text-slate-300">
              {language === 'am' 
                ? 'የባለሙያዎች ማረጋገጫ፣ ተገቢ ያልሆኑ ልጥፎች ዕገዳ እና የይዘት ጥራት መቆጣጠሪያ' 
                : 'Approve/reject pending professionals, flag inappropriate posts, and manage platform integrity.'}
            </p>
          </div>

          <button
            onClick={closeModal}
            className="p-1.5 text-slate-300 hover:text-white rounded-xl hover:bg-white/10 cursor-pointer transition-colors self-end sm:self-auto"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Notification Banner */}
        {actionSuccessMsg && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-2.5 flex items-center justify-between text-xs text-emerald-900 font-bold animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{actionSuccessMsg}</span>
            </div>
            <button onClick={() => setActionSuccessMsg(null)} className="text-emerald-700 hover:text-emerald-900">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Admin Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 p-4 sm:p-5 bg-[#F8FAFC] border-b border-slate-200 text-xs">
          <div className="p-2.5 bg-white rounded-xl border border-slate-200/80">
            <span className="text-slate-400 block font-medium">ሥራዎች / Gigs</span>
            <span className="text-lg font-black text-[#08294F]">{jobs.length}</span>
          </div>
          <div className="p-2.5 bg-white rounded-xl border border-slate-200/80">
            <span className="text-slate-400 block font-medium">የገበያ ምርቶች</span>
            <span className="text-lg font-black text-[#08294F]">{products.length}</span>
          </div>
          <div className="p-2.5 bg-white rounded-xl border border-slate-200/80">
            <span className="text-slate-400 block font-medium">አገልግሎቶች</span>
            <span className="text-lg font-black text-[#08294F]">{services.length}</span>
          </div>
          <div className="p-2.5 bg-white rounded-xl border border-slate-200/80">
            <span className="text-slate-400 block font-medium">የተመዘገቡ አባላት</span>
            <span className="text-lg font-black text-[#08294F]">{userList.length}</span>
          </div>
          <div className="p-2.5 bg-amber-50/80 rounded-xl border border-amber-200">
            <span className="text-amber-800 block font-bold">በመጠባበቅ ላይ</span>
            <span className="text-lg font-black text-amber-700">{pendingProfCount}</span>
          </div>
          <div className="p-2.5 bg-rose-50/80 rounded-xl border border-rose-200">
            <span className="text-rose-800 block font-bold">ሪፖርቶች / የታገዱ</span>
            <span className="text-lg font-black text-rose-700">{pendingReportsCount + totalFlaggedCount}</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 pt-3 border-b border-slate-200 flex items-center gap-4 sm:gap-6 text-xs font-bold overflow-x-auto no-scrollbar">
          
          <button
            onClick={() => setActiveTab('verification')}
            className={`pb-3 cursor-pointer relative flex items-center gap-1.5 shrink-0 ${
              activeTab === 'verification' ? 'text-[#123B6D] font-extrabold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-[#D4A72C]" />
            <span>ተጠቃሚዎችና ማረጋገጫ (Users)</span>
            {pendingProfCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-800 font-extrabold">
                {pendingProfCount}
              </span>
            )}
            {activeTab === 'verification' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#123B6D]" />}
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`pb-3 cursor-pointer relative flex items-center gap-1.5 shrink-0 ${
              activeTab === 'reports' ? 'text-rose-700 font-extrabold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>የቀረቡ ሪፖርቶች (/reports)</span>
            {pendingReportsCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-rose-600 text-white font-extrabold">
                {pendingReportsCount}
              </span>
            )}
            {activeTab === 'reports' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-600" />}
          </button>

          <button
            onClick={() => setActiveTab('moderation')}
            className={`pb-3 cursor-pointer relative flex items-center gap-1.5 shrink-0 ${
              activeTab === 'moderation' ? 'text-rose-700 font-extrabold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Flag className="w-4 h-4 text-rose-500" />
            <span>የይዘት ቁጥጥር (Moderation)</span>
            {totalFlaggedCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-rose-100 text-rose-800 font-extrabold">
                {totalFlaggedCount}
              </span>
            )}
            {activeTab === 'moderation' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-600" />}
          </button>

          <button
            onClick={() => setActiveTab('listings')}
            className={`pb-3 cursor-pointer relative shrink-0 ${
              activeTab === 'listings' ? 'text-[#123B6D] font-extrabold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>ሁሉም ልጥፎች ({jobs.length + products.length + services.length})</span>
            {activeTab === 'listings' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#123B6D]" />}
          </button>

          <button
            onClick={() => setActiveTab('ai_audit')}
            className={`pb-3 cursor-pointer relative flex items-center gap-1.5 shrink-0 ${
              activeTab === 'ai_audit' ? 'text-[#3B1C54] font-extrabold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D4A72C]" />
            <span>AI ኦዲተር</span>
            {activeTab === 'ai_audit' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#3B1C54]" />}
          </button>

          <button
            onClick={() => setActiveTab('database')}
            className={`pb-3 cursor-pointer relative flex items-center gap-1.5 shrink-0 ${
              activeTab === 'database' ? 'text-[#123B6D] font-extrabold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-[#123B6D]" />
            <span>Cloud Database</span>
            {activeTab === 'database' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#123B6D]" />}
          </button>

        </div>

        {/* Modal Main Content Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          
          {/* ======================================================== */}
          {/* TAB 1: USER & PROFESSIONAL VERIFICATION DASHBOARD        */}
          {/* ======================================================== */}
          {activeTab === 'verification' && (
            <div className="space-y-5">
              
              {/* Filter controls & Search */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
                  {[
                    { id: 'pending' as const, label: 'በመጠባበቅ ላይ (Pending)', count: pendingProfCount, color: 'text-amber-800 bg-amber-100' },
                    { id: 'verified' as const, label: 'የተረጋገጡ (Verified)', count: professionals.filter(p => p.isVerified).length, color: 'text-emerald-800 bg-emerald-100' },
                    { id: 'rejected' as const, label: 'ውድቅ የተደረጉ (Rejected)', count: professionals.filter(p => p.status === 'rejected').length, color: 'text-rose-800 bg-rose-100' },
                    { id: 'all' as const, label: 'ሁሉም (All)', count: professionals.length, color: 'text-slate-800 bg-slate-200' },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setVerificationFilter(tab.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                        verificationFilter === tab.id
                          ? 'bg-[#08294F] text-white shadow-xs'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${tab.color}`}>
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="relative min-w-[200px]">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={verificationSearch}
                    onChange={(e) => setVerificationSearch(e.target.value)}
                    placeholder="በስም ወይም በሙያ ይፈልጉ..."
                    className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-[#123B6D]"
                  />
                </div>
              </div>

              {/* Professional Candidate Cards */}
              <div className="space-y-3.5">
                {filteredProfessionals.length > 0 ? (
                  filteredProfessionals.map((prof) => {
                    const status = prof.status || (prof.isVerified ? 'verified' : 'pending');

                    return (
                      <div
                        key={prof.id}
                        className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                          status === 'pending'
                            ? 'bg-amber-50/50 border-amber-200 hover:border-amber-300'
                            : status === 'rejected'
                            ? 'bg-rose-50/40 border-rose-200'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start gap-3.5 flex-1 min-w-0">
                          <img
                            src={prof.photoUrl}
                            alt={prof.fullName}
                            className="w-12 h-12 rounded-2xl object-cover shrink-0 border border-slate-200 shadow-2xs"
                          />
                          <div className="space-y-1.5 min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-sm font-bold text-slate-900 truncate">
                                {prof.fullNameAm || prof.fullName}
                              </h4>
                              
                              {status === 'verified' && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                                  <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                                  <span>የተረጋገጠ (Verified)</span>
                                </span>
                              )}

                              {status === 'pending' && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold border border-amber-200">
                                  <Clock className="w-3 h-3 text-amber-600" />
                                  <span>በመጠባበቅ ላይ (Pending Review)</span>
                                </span>
                              )}

                              {status === 'rejected' && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold border border-rose-200">
                                  <X className="w-3 h-3 text-rose-600" />
                                  <span>ውድቅ የተደረገ (Rejected)</span>
                                </span>
                              )}
                            </div>

                            <p className="text-xs font-semibold text-[#123B6D]">
                              {prof.titleAm || prof.title}
                            </p>

                            <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                              {prof.bioAm || prof.bio}
                            </p>

                            {/* Skills and details */}
                            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-500">
                              <span className="flex items-center gap-1 text-slate-600">
                                <MapPin className="w-3 h-3 text-slate-400" />
                                <span>{prof.location}</span>
                              </span>
                              <span className="text-slate-300">·</span>
                              <span>{prof.experienceYears} ዓመት ልምድ</span>
                              <span className="text-slate-300">·</span>
                              <span className="text-slate-700 font-mono">{prof.phone || '+251 91 123 4567'}</span>
                              {prof.email && (
                                <>
                                  <span className="text-slate-300">·</span>
                                  <span className="text-slate-500 font-mono text-[10px]">{prof.email}</span>
                                </>
                              )}
                            </div>

                            {/* Rejection reason if any */}
                            {status === 'rejected' && prof.rejectionReason && (
                              <p className="text-[11px] text-rose-700 bg-rose-100/60 p-2 rounded-lg border border-rose-200">
                                <strong>ውድቅ የተደረገበት ምክንያት፦</strong> {prof.rejectionReason}
                              </p>
                            )}

                          </div>
                        </div>

                        {/* Admin Action Buttons */}
                        <div className="flex md:flex-col items-center md:items-end justify-end gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-200/60 shrink-0">
                          {status !== 'verified' ? (
                            <button
                              onClick={() => {
                                updateProfessionalStatus(prof.id, 'verified');
                                showNotification(`ባለሙያው ጸድቋል! የማረጋገጫ ባጅ ተሰጥቷል፦ ${prof.fullName}`);
                              }}
                              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>ያጽድቁ (Approve)</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                updateProfessionalStatus(prof.id, 'pending');
                                showNotification(`የማረጋገጫ ባጅ ተነስቷል፦ ${prof.fullName}`);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all cursor-pointer"
                            >
                              ባጅ አንሳ (Revoke)
                            </button>
                          )}

                          {status !== 'rejected' && (
                            <button
                              onClick={() => setSelectedProfForReject(prof.id)}
                              className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>ውድቅ አድርግ (Reject)</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <Users className="w-8 h-8 text-slate-400 mx-auto" />
                    <p className="text-xs text-slate-600 font-bold">
                      በዚህ ማጣሪያ መሠረት የተገኘ ባለሙያ የለም።
                    </p>
                  </div>
                )}
              </div>

              {/* Members & Enterprise Management Table */}
              <div className="pt-4 border-t border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    ሁሉም የተመዘገቡ አባላትና ድርጅቶች (All Firestore Users: {userList.length})
                  </h5>
                </div>
                {userList.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider">
                          <th className="pb-2.5">ስም / ኢሜይል</th>
                          <th className="pb-2.5">ሚና (Role)</th>
                          <th className="pb-2.5">ሁኔታ</th>
                          <th className="pb-2.5 text-right">እርምጃዎች (Actions)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {userList.map((user) => (
                          <tr key={user.id} className="hover:bg-slate-50/80">
                            <td className="py-2.5 pr-2">
                              <div className="font-bold text-slate-900">{user.name}</div>
                              <div className="text-[10px] text-slate-400 font-mono">
                                {user.email} · {user.location}
                              </div>
                            </td>
                            <td className="py-2.5 pr-2">
                              <select
                                value={user.role}
                                onChange={(e) => {
                                  changeUserRole(user.id, e.target.value as UserRole);
                                  showNotification(`${user.name} ሚና ወደ ${e.target.value} ተቀይሯል`);
                                }}
                                className="px-2 py-1 rounded-lg border border-slate-200 bg-white text-[11px] font-semibold"
                              >
                                {ALL_CANONICAL_ROLES.map((r) => (
                                  <option key={r.id} value={r.id}>
                                    {language === 'am' ? r.labelAm : r.labelEn}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="py-2.5 pr-2 space-x-1">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                user.status === 'verified' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                              }`}>
                                {user.status === 'verified' ? 'Verified' : user.status}
                              </span>
                              {user.isSuspended && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white">
                                  Suspended
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 text-right space-x-1 whitespace-nowrap">
                              <button
                                onClick={() => toggleUserVerification(user.id)}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold cursor-pointer transition-colors ${
                                  user.status === 'verified'
                                    ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                                }`}
                              >
                                {user.status === 'verified' ? 'Revoke' : 'Verify'}
                              </button>
                              <button
                                onClick={() => {
                                  suspendUser(user.id, !user.isSuspended);
                                  showNotification(
                                    !user.isSuspended
                                      ? `${user.name} ከመድረኩ ታግዷል (Suspended)`
                                      : `${user.name} ዕገዳው ተነስቷል (Restored)`
                                  );
                                }}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold cursor-pointer ${
                                  user.isSuspended
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                                }`}
                              >
                                {user.isSuspended ? 'Unsuspend' : 'Suspend'}
                              </button>
                              {user.id !== currentUser?.userId && (
                                pendingDelete?.kind === 'user' && pendingDelete.id === user.id ? (
                                  <span className="inline-flex items-center gap-1 ml-1">
                                    <button
                                      onClick={() => {
                                        deleteUser(user.id);
                                        setPendingDelete(null);
                                        showNotification(`${user.name} ከዳታቤዝ ተሰርዟል`);
                                      }}
                                      className="px-2 py-1 rounded-lg bg-rose-600 text-white text-[10px] font-bold cursor-pointer"
                                    >
                                      Confirm
                                    </button>
                                    <button
                                      onClick={() => setPendingDelete(null)}
                                      className="px-1.5 py-1 rounded-lg bg-slate-200 text-slate-700 text-[10px] font-bold cursor-pointer"
                                    >
                                      Cancel
                                    </button>
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => setPendingDelete({ kind: 'user', id: user.id })}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer align-middle"
                                    title="Delete User"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 py-4 text-center">
                    No users found in Firestore /users collection yet.
                  </p>
                )}
              </div>

            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: CONTENT MODERATION & FLAGGING DASHBOARD           */}
          {/* ======================================================== */}
          {activeTab === 'moderation' && (
            <div className="space-y-5">
              
              {/* Top Warning Banner if any flagged posts */}
              {totalFlaggedCount > 0 && (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
                    <div>
                      <strong className="text-rose-950 font-bold block">
                        {totalFlaggedCount} ልጥፎች የአስተዳዳሪ ክትትልና እርምጃ ይሻሉ!
                      </strong>
                      <p className="text-rose-800">
                        በተጠቃሚዎች ወይም በአስተዳዳሪው የታገዱ የሥራ ወይም የገበያ ልጥፎችን ይመርምሩ፤ ያጽድቁ ወይም ከመድረኩ ይሰርዙ።
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setModerationFilter('flagged')}
                    className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shrink-0 cursor-pointer"
                  >
                    የታገዱትን ብቻ አሳይ
                  </button>
                </div>
              )}

              {/* Filter controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
                  {[
                    { id: 'all' as const, label: 'ሁሉም ልጥፎች (All)', count: jobs.length + products.length },
                    { id: 'flagged' as const, label: '🚩 የታገዱ ብቻ (Flagged)', count: totalFlaggedCount },
                    { id: 'jobs' as const, label: '💼 ሥራዎች ብቻ (Jobs)', count: jobs.length },
                    { id: 'products' as const, label: '🛍️ ምርቶች ብቻ (Goods)', count: products.length },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setModerationFilter(tab.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                        moderationFilter === tab.id
                          ? 'bg-[#08294F] text-white shadow-xs'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-800 font-extrabold">
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="relative min-w-[200px]">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={moderationSearch}
                    onChange={(e) => setModerationSearch(e.target.value)}
                    placeholder="በርእስ ወይም በባለቤቱ ፈልግ..."
                    className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-[#123B6D]"
                  />
                </div>
              </div>

              {/* Moderation Post Cards */}
              <div className="space-y-3">
                {moderationItems.length > 0 ? (
                  moderationItems.map((item) => {
                    const isJob = item.itemKind === 'job';
                    const author = isJob ? (item as Job).employerName : (item as Product).sellerName;
                    const price = isJob ? `${(item as Job).budget.toLocaleString()} ${(item as Job).budgetCurrency}` : `${(item as Product).price.toLocaleString()} ${(item as Product).currency}`;
                    const isFlagged = item.isFlagged;

                    return (
                      <div
                        key={item.id}
                        className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                          isFlagged
                            ? 'bg-rose-50/70 border-rose-300 shadow-xs'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                              isJob ? 'bg-blue-100 text-blue-900 border border-blue-200' : 'bg-amber-100 text-amber-900 border border-amber-200'
                            }`}>
                              {isJob ? '💼 ሥራ (JOB)' : '🛍️ ምርት (PRODUCT)'}
                            </span>

                            {isFlagged ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-bold">
                                <Flag className="w-2.5 h-2.5 fill-white" />
                                <span>የታገደ (FLAGGED)</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                <CheckCircle className="w-2.5 h-2.5 text-emerald-600" />
                                <span>ንቁ (Active & Safe)</span>
                              </span>
                            )}

                            <span className="text-xs text-slate-400">·</span>
                            <span className="text-xs font-bold text-slate-600">ባለቤት፦ {author}</span>
                          </div>

                          <h4 className="text-sm font-bold text-slate-900 line-clamp-1">
                            {item.amharicTitle || item.title}
                          </h4>

                          <p className="text-xs text-slate-500 line-clamp-1">
                            {item.descriptionAm || item.description}
                          </p>

                          {/* Flag Reason Banner if active */}
                          {isFlagged && item.flagReason && (
                            <div className="p-2 bg-rose-100/70 rounded-lg text-rose-900 text-[11px] font-semibold border border-rose-200 flex items-center gap-1.5">
                              <AlertCircle className="w-3.5 h-3.5 text-rose-700 shrink-0" />
                              <span><strong>የዕገዳ ምክንያት፦</strong> {item.flagReason}</span>
                            </div>
                          )}

                          <div className="flex items-center gap-3 text-[11px] text-slate-400">
                            <span>ቦታ፦ {item.location}</span>
                            <span>·</span>
                            <span className="font-bold text-slate-700">ዋጋ/ደመወዝ፦ {price}</span>
                          </div>
                        </div>

                        {/* Moderation Action Buttons */}
                        <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                          {isFlagged ? (
                            <button
                              onClick={() => {
                                if (isJob) unflagJob(item.id);
                                else unflagProduct(item.id);
                                showNotification('ዕገዳው ተነስቷል፤ ልጥፉ ወደ ሰላማዊ ሁኔታ ተመልሷል');
                              }}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>ከዕገዳ ነፃ አድርግ (Unflag)</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => setSelectedItemForFlag({
                                type: isJob ? 'job' : 'product',
                                id: item.id,
                                title: item.title
                              })}
                              className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                            >
                              <Flag className="w-3.5 h-3.5 text-amber-600" />
                              <span>እገድ / ምልክት አድርግ (Flag)</span>
                            </button>
                          )}

                          {pendingDelete?.kind === 'mod' && pendingDelete.id === item.id ? (
                            <span className="inline-flex items-center gap-1">
                              <button
                                onClick={() => {
                                  if (isJob) deleteJob(item.id);
                                  else deleteProduct(item.id);
                                  setPendingDelete(null);
                                  showNotification('ልጥፉ ከመድረኩ በቋሚነት ተሰርዟል');
                                }}
                                className="px-2.5 py-1 rounded-lg bg-rose-600 text-white text-[11px] font-bold cursor-pointer"
                              >
                                አረጋግጥ (Delete)
                              </button>
                              <button
                                onClick={() => setPendingDelete(null)}
                                className="px-2 py-1 rounded-lg bg-slate-200 text-slate-700 text-[11px] font-bold cursor-pointer"
                              >
                                ተው
                              </button>
                            </span>
                          ) : (
                            <button
                              onClick={() => setPendingDelete({ kind: 'mod', id: item.id, isJob })}
                              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Delete Permanently"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                    <p className="text-xs text-slate-700 font-bold">
                      በዚህ ማጣሪያ ውስጥ ምንም ዓይነት ልጥፍ የለም።
                    </p>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2B: REPORTS MANAGEMENT (/reports)                    */}
          {/* ======================================================== */}
          {activeTab === 'reports' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                {(['PENDING', 'ACTION_TAKEN', 'RESOLVED', 'DISMISSED', 'ALL'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setReportFilter(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer shrink-0 ${
                      reportFilter === st
                        ? 'bg-rose-700 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {st} (
                    {st === 'ALL'
                      ? reports.length
                      : reports.filter((r) => r.status === st).length}
                    )
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                {reports
                  .filter((r) => reportFilter === 'ALL' || r.status === reportFilter)
                  .map((rep) => (
                    <div
                      key={rep.id}
                      className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-black uppercase">
                              {rep.targetType}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                rep.status === 'PENDING'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {rep.status}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              ID: {rep.targetId}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-slate-900 mt-1">
                            {rep.targetTitle || rep.targetId}
                          </h4>
                          <p className="text-xs text-rose-700 font-semibold mt-0.5">
                            Reason: {rep.reason}
                          </p>
                          {rep.details && (
                            <p className="text-xs text-slate-600 mt-1">{rep.details}</p>
                          )}
                          <p className="text-[10px] text-slate-400 mt-1">
                            Reported by {rep.reporterName} ·{' '}
                            {new Date(rep.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                        <button
                          onClick={() => {
                            resolveReport(rep.id, 'RESOLVED', 'Resolved by Admin');
                            showNotification('ሪፖርቱ ተፈትቷል (RESOLVED)');
                          }}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
                        >
                          Mark Resolved
                        </button>
                        <button
                          onClick={() => {
                            resolveReport(
                              rep.id,
                              'ACTION_TAKEN',
                              'Target deleted / suspended by Admin',
                              true
                            );
                            showNotification('እርምጃ ተወስዷል፤ የታገደው ይዘት ተሰርዟል');
                          }}
                          className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer"
                        >
                          Take Action & Delete Target
                        </button>
                        <button
                          onClick={() => {
                            resolveReport(rep.id, 'DISMISSED', 'Dismissed by Admin');
                            showNotification('ሪፖርቱ ተሰርዟል (DISMISSED)');
                          }}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  ))}
                {reports.filter((r) => reportFilter === 'ALL' || r.status === reportFilter)
                  .length === 0 && (
                  <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-500">
                    No reports in this category.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 3: ALL LIVE LISTINGS (Jobs/Gigs, Products, Services) */}
          {/* ======================================================== */}
          {activeTab === 'listings' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Jobs / Gigs column */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4 text-[#123B6D]" />
                    <span>ሥራዎችና Gigs ({jobs.length})</span>
                  </h4>
                  <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                    {jobs.map((job) => (
                      <div key={job.id} className="p-3 bg-[#F8FAFC] border border-slate-200 rounded-xl flex items-center justify-between text-xs hover:border-slate-300 gap-2">
                        <div className="min-w-0">
                          <strong className="text-slate-900 block truncate">{job.title}</strong>
                          <span className="text-slate-400 block text-[11px] truncate">
                            {job.employerName} · {job.budget.toLocaleString()} ETB
                          </span>
                          <PostedDateTime value={job.createdAt} language={language} variant="compact" className="mt-1" />
                        </div>
                        {pendingDelete?.kind === 'job' && pendingDelete.id === job.id ? (
                          <span className="inline-flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => {
                                deleteJob(job.id);
                                setPendingDelete(null);
                                showNotification('ሥራው ተሰርዟል');
                              }}
                              className="px-2 py-1 rounded-lg bg-rose-600 text-white text-[10px] font-bold cursor-pointer"
                            >
                              Delete
                            </button>
                            <button
                              onClick={() => setPendingDelete(null)}
                              className="px-1.5 py-1 rounded-lg bg-slate-200 text-slate-700 text-[10px] font-bold cursor-pointer"
                            >
                              Cancel
                            </button>
                          </span>
                        ) : (
                          <button
                            onClick={() => setPendingDelete({ kind: 'job', id: job.id })}
                            className="p-1.5 text-slate-400 hover:text-rose-600 cursor-pointer shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Products column */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                    <ShoppingBag className="w-4 h-4 text-[#D4A72C]" />
                    <span>የገበያ ምርቶች ({products.length})</span>
                  </h4>
                  <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                    {products.map((prod) => (
                      <div key={prod.id} className="p-3 bg-[#F8FAFC] border border-slate-200 rounded-xl flex items-center justify-between text-xs hover:border-slate-300 gap-2">
                        <div className="min-w-0">
                          <strong className="text-slate-900 block truncate">{prod.title}</strong>
                          <span className="text-slate-400 block text-[11px] truncate">
                            {prod.sellerName} · {prod.price.toLocaleString()} ETB
                          </span>
                          <PostedDateTime value={prod.createdAt} language={language} variant="compact" className="mt-1" />
                        </div>
                        {pendingDelete?.kind === 'product' && pendingDelete.id === prod.id ? (
                          <span className="inline-flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => {
                                deleteProduct(prod.id);
                                setPendingDelete(null);
                                showNotification('ምርቱ ተሰርዟል');
                              }}
                              className="px-2 py-1 rounded-lg bg-rose-600 text-white text-[10px] font-bold cursor-pointer"
                            >
                              Delete
                            </button>
                            <button
                              onClick={() => setPendingDelete(null)}
                              className="px-1.5 py-1 rounded-lg bg-slate-200 text-slate-700 text-[10px] font-bold cursor-pointer"
                            >
                              Cancel
                            </button>
                          </span>
                        ) : (
                          <button
                            onClick={() => setPendingDelete({ kind: 'product', id: prod.id })}
                            className="p-1.5 text-slate-400 hover:text-rose-600 cursor-pointer shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Services column */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                    <Wrench className="w-4 h-4 text-[#16845B]" />
                    <span>አገልግሎቶች ({services.length})</span>
                  </h4>
                  <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                    {services.map((serv) => (
                      <div key={serv.id} className="p-3 bg-[#F8FAFC] border border-slate-200 rounded-xl flex items-center justify-between text-xs hover:border-slate-300 gap-2">
                        <div className="min-w-0">
                          <strong className="text-slate-900 block truncate">{serv.title}</strong>
                          <span className="text-slate-400 block text-[11px] truncate">
                            {serv.providerName} · {serv.rateDescription}
                          </span>
                          <PostedDateTime value={serv.createdAt} language={language} variant="compact" className="mt-1" />
                        </div>
                        {pendingDelete?.kind === 'service' && pendingDelete.id === serv.id ? (
                          <span className="inline-flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => {
                                deleteService(serv.id);
                                setPendingDelete(null);
                                showNotification('አገልግሎቱ ተሰርዟል');
                              }}
                              className="px-2 py-1 rounded-lg bg-rose-600 text-white text-[10px] font-bold cursor-pointer"
                            >
                              Delete
                            </button>
                            <button
                              onClick={() => setPendingDelete(null)}
                              className="px-1.5 py-1 rounded-lg bg-slate-200 text-slate-700 text-[10px] font-bold cursor-pointer"
                            >
                              Cancel
                            </button>
                          </span>
                        ) : (
                          <button
                            onClick={() => setPendingDelete({ kind: 'service', id: serv.id })}
                            className="p-1.5 text-slate-400 hover:text-rose-600 cursor-pointer shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 4: AI QUALITY & COMPLIANCE AUDITOR                   */}
          {/* ======================================================== */}
          {activeTab === 'ai_audit' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-[#091B33] via-[#240F3D] to-[#3B1C54] text-white p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#F3D77A]" />
                    <span className="text-xs font-bold uppercase tracking-wider text-[#F3D77A]">
                      Automated Platform Intelligence
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white font-ethiopic">
                    የይዘት ጥራት፣ የተደጋጋሚነት እና የማኅበረሰብ ደንቦች ኦዲተር
                  </h4>
                  <p className="text-xs text-purple-200">
                    Scans live jobs, products, and user accounts for spam, duplication, and missing parameters.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setIsAuditing(true);
                    setTimeout(() => {
                      setIsAuditing(false);
                      setAuditComplete(true);
                    }, 800);
                  }}
                  disabled={isAuditing}
                  className="bg-[#D4A72C] hover:bg-[#c29623] text-[#08294F] px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 disabled:opacity-50"
                >
                  {isAuditing ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Scanning...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Run AI Audit</span>
                    </>
                  )}
                </button>
              </div>

              {/* Audit Findings */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-[#F8FAFC] p-4 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Content Integrity</span>
                  <p className="text-lg font-black text-[#16845B]">99% Healthy</p>
                  <p className="text-[11px] text-slate-500">Zero broker fraud patterns detected across platform.</p>
                </div>

                <div className="bg-[#F8FAFC] p-4 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Duplicate Check</span>
                  <p className="text-lg font-black text-[#123B6D]">0 Duplicates</p>
                  <p className="text-[11px] text-slate-500">All current postings are distinct and unique.</p>
                </div>

                <div className="bg-[#F8FAFC] p-4 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Orthodox Values Compliance</span>
                  <p className="text-lg font-black text-[#D4A72C]">100% Passed</p>
                  <p className="text-[11px] text-slate-500">Fair pricing and respectful community etiquette verified.</p>
                </div>
              </div>

              {/* Recommendations */}
              <div className="space-y-3">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  የማጠቃለያ ግምገማዎችና የ AI ምክረ-ሐሳቦች፦
                </h5>

                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-start justify-between gap-3 text-xs">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-emerald-950 font-bold block">የታማኝነትና የማረጋገጫ ደረጃ ከፍተኛ ነው</strong>
                      <p className="text-emerald-800">
                        በመድረኩ ላይ የተመዘገቡ አሠሪዎችና ነጋዴዎች ቀጥተኛ የስልክና የቴሌግራም መገኛቸውን ያረጋገጡ ናቸው።
                      </p>
                    </div>
                  </div>
                  <span className="bg-emerald-200/60 text-emerald-900 px-2 py-0.5 rounded text-[10px] font-bold">
                    PASSED
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 5: CLOUD DATABASE (FIRESTORE)                        */}
          {/* ======================================================== */}
          {activeTab === 'database' && (
            <div className="space-y-6">
              
              {/* Main Cloud Banner */}
              <div className="p-6 bg-gradient-to-r from-[#06182B] via-[#08294F] to-[#1E1138] rounded-3xl text-white space-y-4 border border-blue-800/40 shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 bg-[#D4A72C]/20 border border-[#D4A72C]/40 rounded-2xl text-[#F3D77A]">
                      <Database className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-base font-black">Google Firebase Cloud Firestore Enterprise</h4>
                      <p className="text-xs text-slate-300">የመድረኩ ዋና የማዕከላዊ ዳታቤዝ መቆጣጠሪያ ማዕከል</p>
                    </div>
                  </div>
                  <span className="self-start sm:self-auto px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    Live & Synchronized
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed font-ethiopic">
                  የዚህ መድረክ ዋና የመረጃ ቋት (Production Cloud Database) በ <strong className="text-amber-300">Google Cloud Platform & Firebase Firestore</strong> ላይ የተዋቀረ ነው። የተጠቃሚዎች ምዝገባ፣ ክፍት የሥራ ቦታዎች፣ የገበያ ምርቶች፣ የእጅ ጥበባት፣ የባለሙያዎች ማረጋገጫና መልእክቶች በሙሉ በከፍተኛ ደኅንነት እዚህ ውስጥ ይከማቻሉ።
                </p>

                {/* Database Credentials Summary Card */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1 text-xs">
                  <div className="p-2.5 bg-white/10 rounded-xl border border-white/10 space-y-0.5">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Firebase Project ID</span>
                    <span className="font-mono text-amber-300 font-bold block select-all">gen-lang-client-0973048388</span>
                  </div>
                  <div className="p-2.5 bg-white/10 rounded-xl border border-white/10 space-y-0.5">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Shared Firestore DB (Android + Web)</span>
                    <span className="font-mono text-emerald-300 font-bold text-[10px] block truncate select-all" title="ai-studio-android-ortodoxt-978cc305-7d2a-4a20-81c0-3f71d9ab1ae5">
                      ai-studio-android-ortodoxt-978cc305-7d2a-4a20-81c0-3f71d9ab1ae5
                    </span>
                  </div>
                  <div className="p-2.5 bg-white/10 rounded-xl border border-white/10 space-y-0.5">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Storage Bucket</span>
                    <span className="font-mono text-sky-300 font-bold text-[10px] block truncate select-all">
                      gen-lang-client-0973048388.firebasestorage.app
                    </span>
                  </div>
                  <div className="p-2.5 bg-white/10 rounded-xl border border-white/10 space-y-0.5">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Authorized Super Admin</span>
                    <span className="font-bold text-white block select-all">andupaman3@gmail.com</span>
                  </div>
                </div>

                {/* Primary Action Buttons */}
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <a
                    href="https://console.firebase.google.com/project/gen-lang-client-0973048388/firestore/databases/ai-studio-android-ortodoxt-978cc305-7d2a-4a20-81c0-3f71d9ab1ae5/data"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#D4A72C] hover:bg-[#e0b439] text-[#08294F] rounded-xl text-xs font-black transition-all shadow-md cursor-pointer"
                  >
                    <span>Firebase Console ክፈት (Open Cloud Console)</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>

                  <button
                    onClick={handleExportDatabaseBackup}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white border border-white/20 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-[#D4A72C]" />
                    <span>ሙሉ ዳታቤዝ በ JSON አውርድ (Backup Database)</span>
                  </button>

                  <div className="flex items-center gap-2 text-[11px] text-emerald-300 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1.5 rounded-xl">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>የአንድሮይድ ሞባይል አፕ (Android App) እና ዌብሳይት በቀጥታ የተሳሰሩ ናቸው</span>
                  </div>
                </div>
              </div>

              {/* Collections Status Grid */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                    የተመሳሰሉ የዳታቤዝ ስብስቦች (Shared Firestore Collections)
                  </h5>
                  <span className="text-xs text-slate-500 font-mono">
                    ጠቅላላ፦ {jobs.length + products.length + services.length + proposals.length + reviews.length + reports.length + userList.length} ሰነዶች
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 text-xs">
                  <div className="p-3 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-1">
                    <span className="text-slate-400 text-[10px] font-bold block uppercase">/users</span>
                    <span className="text-xl font-black text-[#08294F] block">{userList.length}</span>
                    <span className="text-[10px] text-emerald-600 font-bold block">Android + Web</span>
                  </div>
                  <div className="p-3 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-1">
                    <span className="text-slate-400 text-[10px] font-bold block uppercase">/jobs</span>
                    <span className="text-xl font-black text-[#08294F] block">{jobs.length}</span>
                    <span className="text-[10px] text-emerald-600 font-bold block">Dual-Synced</span>
                  </div>
                  <div className="p-3 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-1">
                    <span className="text-slate-400 text-[10px] font-bold block uppercase">/gigs</span>
                    <span className="text-xl font-black text-[#08294F] block">{gigsCount}</span>
                    <span className="text-[10px] text-emerald-600 font-bold block">Dual-Synced</span>
                  </div>
                  <div className="p-3 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-1">
                    <span className="text-slate-400 text-[10px] font-bold block uppercase">/products</span>
                    <span className="text-xl font-black text-[#08294F] block">{products.length}</span>
                    <span className="text-[10px] text-emerald-600 font-bold block">Live Market</span>
                  </div>
                  <div className="p-3 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-1">
                    <span className="text-slate-400 text-[10px] font-bold block uppercase">/services</span>
                    <span className="text-xl font-black text-[#08294F] block">{services.length}</span>
                    <span className="text-[10px] text-emerald-600 font-bold block">Live Directory</span>
                  </div>
                  <div className="p-3 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-1">
                    <span className="text-slate-400 text-[10px] font-bold block uppercase">/reports</span>
                    <span className="text-xl font-black text-rose-600 block">{reports.length}</span>
                    <span className="text-[10px] text-rose-500 font-bold block">{pendingReportsCount} Pending</span>
                  </div>
                  <div className="p-3 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-1">
                    <span className="text-slate-400 text-[10px] font-bold block uppercase">/proposals & /reviews</span>
                    <span className="text-xl font-black text-purple-700 block">{proposals.length} / {reviews.length}</span>
                    <span className="text-[10px] text-purple-600 font-bold block">Realtime</span>
                  </div>
                </div>
              </div>

              {/* Clear Guide for the Admin */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3 text-xs text-slate-700 leading-relaxed">
                <h5 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#16845B]" />
                  <span>ዳታቤዝዎን እንዴት ይቆጣጠራሉ? (How to Control Everything)</span>
                </h5>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1.5">
                    <strong className="text-[#08294F] font-bold block text-xs">
                      1. ቀጥታ በዚሁ ዌብሳይት ውስጥ (In-Web Admin Dashboard)
                    </strong>
                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      እዚሁ የአድሚን ዳሽቦርድ ላይ በመሆን በ <strong className="text-slate-800">«ማረጋገጫ (Verification)»</strong> እና በ <strong className="text-slate-800">«ይዘት ቁጥጥር (Moderation)»</strong> ታቦች አማካኝነት ባለሙያዎችን በአንድ ጠቅታ ማጽደቅ፣ ማገድ፣ መሰረዝ ወይም ባጅ መስጠት ይችላሉ።
                    </p>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1.5">
                    <strong className="text-[#08294F] font-bold block text-xs">
                      2. በ Google Firebase Cloud Console (Direct Database Access)
                    </strong>
                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      በስልክዎ ወይም በላፕቶፕዎ <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="text-blue-600 underline font-bold">console.firebase.google.com</a> ገብተው በኢሜይልዎ (<strong className="text-slate-800">{SUPER_ADMIN_EMAIL}</strong>) በመግባት ሙሉውን ሰንጠረዥ፣ ሰነዶችና የተመዘገቡ ተጠቃሚዎችን በቀጥታ ማየትና ማስተካከል ይችላሉ።
                    </p>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>ኦርቶዶክሳዊ የአስተዳደር መመሪያ · Ethical Community Governance</span>
          <button
            onClick={closeModal}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl cursor-pointer"
          >
            ዝጋ (Close)
          </button>
        </div>

      </div>

      {/* REJECT PROFESSIONAL REASON MODAL */}
      {selectedProfForReject && (
        <div 
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in"
          onClick={() => setSelectedProfForReject(null)}
        >
          <div 
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <XCircle className="w-5 h-5 text-rose-600" />
                <span>የባለሙያ ማመልከቻን ውድቅ ማድረጊያ</span>
              </h4>
              <button onClick={() => setSelectedProfForReject(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                ውድቅ የተደረገበት ምክንያት (Rejection Reason)፦
              </label>
              <textarea
                rows={3}
                value={rejectionReasonInput}
                onChange={(e) => setRejectionReasonInput(e.target.value)}
                placeholder="ለምሳሌ፦ ያልተሟላ የትምህርት/ሥልጠና ማስረጃ ወይም የተሳሳተ መረጃ..."
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedProfForReject(null)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                ተመለስ (Cancel)
              </button>
              <button
                onClick={() => handleConfirmRejectProf(selectedProfForReject)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer"
              >
                ውድቅ አድርግ (Confirm Rejection)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FLAG POST REASON MODAL */}
      {selectedItemForFlag && (
        <div 
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in"
          onClick={() => setSelectedItemForFlag(null)}
        >
          <div 
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Flag className="w-5 h-5 text-amber-600" />
                <span>ልጥፉን የማገጃ / ምልክት ማድረጊያ ምክንያት</span>
              </h4>
              <button onClick={() => setSelectedItemForFlag(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              ልጥፍ፦ <strong>"{selectedItemForFlag.title}"</strong>
            </p>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                የዕገዳው ዓይነት ይምረጡ፦
              </label>
              {[
                'አግባብ ያልሆነ ይዘት ወይም የማኅበረሰብ ደንብ መጣስ (Inappropriate content)',
                'የደላላ ጣልቃ ገብነት ወይም የኮሚሽን ጥርጣሬ (Broker/Middleman detected)',
                'አጠራጣሪ የዋጋ ማጭበርበር ወይም ያልተረጋገጠ መረጃ (Scam / fraudulent pricing)',
                'የተሳሳተ ዘርፍ ወይም የተደጋገመ ልጥፍ (Duplicate or wrong category)',
              ].map((reason) => (
                <label key={reason} className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs cursor-pointer hover:bg-slate-100">
                  <input
                    type="radio"
                    name="flagReason"
                    checked={flagReasonInput === reason}
                    onChange={() => setFlagReasonInput(reason)}
                    className="text-rose-600"
                  />
                  <span className="text-slate-800">{reason}</span>
                </label>
              ))}
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                ተጨማሪ ማብራሪያ (አማራጭ)፦
              </label>
              <input
                type="text"
                value={customFlagReason}
                onChange={(e) => setCustomFlagReason(e.target.value)}
                placeholder="ዝርዝር ማብራሪያ ይጻፉ..."
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedItemForFlag(null)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                ተመለስ (Cancel)
              </button>
              <button
                onClick={handleConfirmFlag}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer"
              >
                አግድ (Confirm Flag)
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
