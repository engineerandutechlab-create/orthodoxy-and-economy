import React, { useState } from 'react';
import { useApp, isSuperAdminEmail } from '../../context/AppContext';
import { TrustVerificationModal, VerificationEntityInfo } from '../common/TrustVerificationModal';
import {
  ALL_CANONICAL_ROLES,
  PortfolioProject,
  VaultDocument,
  UserRole,
  normalizeUserRole,
} from '../../types';
import {
  X,
  MapPin,
  Briefcase,
  Save,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  Award,
  Clock,
  AlertCircle,
  Camera,
  Plus,
  Trash2,
  FolderLock,
  Globe,
  Star,
  Church,
} from 'lucide-react';
import { aiService } from '../../services/aiService';
import { DEFAULT_AVATAR_URL, handleImageFallback } from '../../constants/assets';

export const ProfileModal: React.FC = () => {
  const {
    currentUser,
    closeModal,
    updateProfile,
    completedJobs,
    language,
    t,
  } = useApp();

  const [sectionTab, setSectionTab] = useState<'profile' | 'portfolio' | 'vault'>('profile');

  const [fullName, setFullName] = useState(currentUser?.fullName || '');
  const [profilePhotoUrl, setProfilePhotoUrl] = useState(currentUser?.profilePhotoUrl || '');
  const [primaryRole, setPrimaryRole] = useState<UserRole>(
    normalizeUserRole(currentUser?.primaryRole)
  );
  const [secondaryRoles, setSecondaryRoles] = useState<string[]>(currentUser?.secondaryRoles || []);
  const [profession, setProfession] = useState(currentUser?.profession || '');
  const [businessName, setBusinessName] = useState(currentUser?.businessName || '');
  const [businessCategory, setBusinessCategory] = useState(currentUser?.businessCategory || '');
  const [location, setLocation] = useState(currentUser?.location || 'Addis Ababa');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [telegram, setTelegram] = useState(currentUser?.telegramHandle || '');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [bioAm, setBioAm] = useState(currentUser?.bioAm || '');
  const [skills, setSkills] = useState(currentUser?.skills?.join(', ') || '');

  // Verification Request fields
  const [parishName, setParishName] = useState(currentUser?.parishName || '');
  const [spiritualFatherContact, setSpiritualFatherContact] = useState(
    currentUser?.spiritualFatherContact || ''
  );
  const [verificationDocType, setVerificationDocType] = useState(
    currentUser?.verificationDocType || 'National ID / Kebele ID'
  );
  const [verificationDocDetails, setVerificationDocDetails] = useState(
    currentUser?.verificationDocDetails || ''
  );

  // Portfolio Items
  const [portfolioItems, setPortfolioItems] = useState<PortfolioProject[]>(
    currentUser?.portfolioItems || []
  );
  const [newProjTitle, setNewProjTitle] = useState('');
  const [newProjYear, setNewProjYear] = useState(new Date().getFullYear().toString());
  const [newProjDesc, setNewProjDesc] = useState('');
  const [newProjLink, setNewProjLink] = useState('');

  // Document Vault Items
  const [vaultDocuments, setVaultDocuments] = useState<VaultDocument[]>(
    currentUser?.vaultDocuments || []
  );
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocType, setNewDocType] = useState<VaultDocument['docType']>('certificate');
  const [newDocVisibility, setNewDocVisibility] = useState<'PUBLIC' | 'PRIVATE'>('PUBLIC');
  const [newDocRef, setNewDocRef] = useState('');

  const [isSaved, setIsSaved] = useState(false);
  const [verificationSubmitted, setVerificationSubmitted] = useState(false);
  const [showCvInput, setShowCvInput] = useState(false);
  const [cvText, setCvText] = useState('');
  const [isParsingCv, setIsParsingCv] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);

  if (!currentUser) return null;

  const isSuper = isSuperAdminEmail(currentUser.email);
  const isVerified = currentUser.verificationStatus === 'verified';
  const isPending = currentUser.verificationStatus === 'pending';

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setProfilePhotoUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const toggleSecondaryRole = (roleId: string) => {
    setSecondaryRoles((prev) =>
      prev.includes(roleId) ? prev.filter((r) => r !== roleId) : [...prev, roleId]
    );
  };

  const handleAddPortfolio = () => {
    if (!newProjTitle.trim()) return;
    const updated: PortfolioProject[] = [
      {
        id: `port_${Date.now()}`,
        title: newProjTitle.trim(),
        description: newProjDesc.trim(),
        year: newProjYear.trim() || '2026',
        link: newProjLink.trim() || undefined,
      },
      ...portfolioItems,
    ];
    setPortfolioItems(updated);
    setNewProjTitle('');
    setNewProjDesc('');
    setNewProjLink('');
    updateProfile({ portfolioItems: updated });
  };

  const handleRemovePortfolio = (idx: number) => {
    const updated = portfolioItems.filter((_, i) => i !== idx);
    setPortfolioItems(updated);
    updateProfile({ portfolioItems: updated });
  };

  const handleAddVaultDoc = () => {
    if (!newDocTitle.trim()) return;
    const docItem: VaultDocument = {
      id: `doc_${Date.now()}`,
      title: newDocTitle.trim(),
      docType: newDocType,
      visibility: newDocVisibility,
      urlOrContent: newDocRef.trim() || 'Uploaded Certificate Record',
      uploadedAt: new Date().toISOString(),
    };
    const updated = [docItem, ...vaultDocuments];
    setVaultDocuments(updated);
    setNewDocTitle('');
    setNewDocRef('');
    updateProfile({ vaultDocuments: updated });
  };

  const handleToggleDocVisibility = (docId: string) => {
    const updated = vaultDocuments.map((d) =>
      d.id === docId
        ? { ...d, visibility: d.visibility === 'PUBLIC' ? ('PRIVATE' as const) : ('PUBLIC' as const) }
        : d
    );
    setVaultDocuments(updated);
    updateProfile({ vaultDocuments: updated });
  };

  const handleRemoveVaultDoc = (docId: string) => {
    const updated = vaultDocuments.filter((d) => d.id !== docId);
    setVaultDocuments(updated);
    updateProfile({ vaultDocuments: updated });
  };

  const handleSubmitVerificationRequest = () => {
    updateProfile({
      parishName,
      spiritualFatherContact,
      verificationDocType,
      verificationDocDetails,
      verificationStatus: isSuper ? 'verified' : 'pending',
    });
    setVerificationSubmitted(true);
    setTimeout(() => setVerificationSubmitted(false), 3000);
  };

  const handleParseCv = async () => {
    if (!cvText.trim()) return;
    setIsParsingCv(true);
    try {
      const parsed = await aiService.parseCV(cvText);
      if (parsed.extractedSkills && parsed.extractedSkills.length > 0) {
        setSkills(parsed.extractedSkills.join(', '));
      }
      if (parsed.suggestedTitle) setProfession(parsed.suggestedTitle);
      if (parsed.suggestedBio) setBio(parsed.suggestedBio);
      if (parsed.suggestedBioAm) setBioAm(parsed.suggestedBioAm);
      setShowCvInput(false);
      setCvText('');
    } catch (e) {
      console.warn('AI CV parse error:', e);
    } finally {
      setIsParsingCv(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({
      fullName,
      profilePhotoUrl,
      primaryRole: isSuper ? 'ADMIN' : primaryRole,
      secondaryRoles,
      profession,
      businessName,
      businessCategory,
      location,
      phone,
      telegramHandle: telegram,
      bio,
      bioAm,
      parishName,
      spiritualFatherContact,
      verificationDocType,
      verificationDocDetails,
      portfolioItems,
      vaultDocuments,
      skills: skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const auditEntityData: VerificationEntityInfo = {
    name: currentUser.fullName,
    role: currentUser.profession || currentUser.businessName || 'Platform Member',
    type: 'user',
    status: currentUser.verificationStatus === 'rejected' ? 'unverified' : currentUser.verificationStatus || 'verified',
    avatarUrl: profilePhotoUrl || currentUser.profilePhotoUrl,
    certificateId:
      currentUser.certificateId ||
      (isVerified
        ? `OEC-VER-${new Date().getFullYear()}-${currentUser.userId.slice(-4).toUpperCase()}`
        : undefined),
    verifiedSince: currentUser.verifiedAt
      ? new Date(currentUser.verifiedAt).toLocaleDateString()
      : '2026',
    location: currentUser.location,
    isCurrentUser: true,
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
        <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-150 font-ethiopic">
          {/* Top Header */}
          <div className="sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between z-10">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h3 className="text-base sm:text-lg font-black text-[#08294F] dark:text-white">
                {t.navProfile}
              </h3>
              {isVerified ? (
                <span
                  onClick={() => setShowAuditModal(true)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold hover:bg-emerald-100 transition-colors cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{language === 'am' ? 'የተረጋገጠ መለያ' : 'Verified Profile'}</span>
                </span>
              ) : isPending ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300 text-xs font-semibold">
                  <Clock className="w-3 h-3 text-amber-600" />
                  <span>{language === 'am' ? 'በግምገማ ላይ' : 'Under Review'}</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs">
                  <span>{language === 'am' ? 'ያልተረጋገጠ' : 'Unverified'}</span>
                </span>
              )}
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold">
                <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                <span>{(currentUser.rating ?? 5.0).toFixed(1)}</span>
                <span className="text-[10px] opacity-80">({currentUser.reviewCount ?? 0})</span>
              </span>
            </div>
            <button
              onClick={closeModal}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Section Sub-tabs */}
          <div className="px-6 pt-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-4 overflow-x-auto no-scrollbar bg-slate-50/70 dark:bg-slate-800/40 text-xs font-bold">
            <button
              type="button"
              onClick={() => setSectionTab('profile')}
              className={`pb-2.5 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                sectionTab === 'profile'
                  ? 'border-[#123B6D] text-[#123B6D] dark:text-[#D4A72C] dark:border-[#D4A72C]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {language === 'am' ? '👤 መሠረታዊ መረጃና ሚና' : 'Profile & Multi-Role'}
            </button>
            <button
              type="button"
              onClick={() => setSectionTab('portfolio')}
              className={`pb-2.5 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                sectionTab === 'portfolio'
                  ? 'border-[#123B6D] text-[#123B6D] dark:text-[#D4A72C] dark:border-[#D4A72C]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {language === 'am'
                ? `💼 ፖርትፎሊዮና የተጠናቀቁ ሥራዎች (${completedJobs.length})`
                : `Portfolio & Completed Jobs (${completedJobs.length})`}
            </button>
            <button
              type="button"
              onClick={() => setSectionTab('vault')}
              className={`pb-2.5 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                sectionTab === 'vault'
                  ? 'border-[#123B6D] text-[#123B6D] dark:text-[#D4A72C] dark:border-[#D4A72C]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {language === 'am'
                ? `🛡️ ማረጋገጫና የሰነድ ካዝና (${vaultDocuments.length})`
                : `Verification & Document Vault (${vaultDocuments.length})`}
            </button>
          </div>

          <form onSubmit={handleSave} className="p-6 space-y-5">
            {/* TAB 1: PROFILE & MULTI-ROLE */}
            {sectionTab === 'profile' && (
              <>
                {/* User Identity & Photo URL */}
                <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="relative shrink-0 self-start">
                      <img
                        src={profilePhotoUrl || DEFAULT_AVATAR_URL}
                        alt={currentUser.fullName}
                        referrerPolicy="no-referrer"
                        onError={handleImageFallback(DEFAULT_AVATAR_URL)}
                        className={`w-20 h-20 rounded-2xl object-cover ring-3 ${
                          isVerified
                            ? 'ring-emerald-500'
                            : isPending
                            ? 'ring-amber-400'
                            : 'ring-slate-300'
                        }`}
                      />
                      <label
                        htmlFor="profile-photo-upload"
                        className="absolute -bottom-1.5 -right-1.5 bg-[#123B6D] text-white p-1.5 rounded-full ring-2 ring-white cursor-pointer hover:scale-110 transition-transform"
                        title="Upload Photo"
                      >
                        <Camera className="w-3.5 h-3.5" />
                      </label>
                      <input
                        id="profile-photo-upload"
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </div>

                    <div className="flex-1 space-y-2 min-w-0">
                      <div>
                        <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white truncate">
                          {currentUser.fullName}
                        </h4>
                        <p className="text-xs text-slate-500 font-mono truncate">
                          {currentUser.email} · {currentUser.primaryRole}
                        </p>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                          Profile Photo URL / የፎቶ ሊንክ
                        </label>
                        <input
                          type="text"
                          value={profilePhotoUrl}
                          onChange={(e) => setProfilePhotoUrl(e.target.value)}
                          placeholder="https://... (or click camera icon to upload)"
                          className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI CV / Resume Auto-fill Assistant */}
                <div className="bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-800/40 rounded-2xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-950 dark:text-purple-200 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-[#D4A72C]" />
                      <span>✨ AI Resume / Bio Enhancer</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowCvInput(!showCvInput)}
                      className="text-xs text-purple-700 dark:text-purple-300 font-bold hover:underline cursor-pointer"
                    >
                      {showCvInput ? 'Cancel' : 'Paste CV / Bio →'}
                    </button>
                  </div>

                  {showCvInput && (
                    <div className="space-y-2 pt-1">
                      <textarea
                        rows={3}
                        value={cvText}
                        onChange={(e) => setCvText(e.target.value)}
                        placeholder="Paste your resume or bio notes to extract skills automatically..."
                        className="w-full p-2.5 bg-white dark:bg-slate-900 border border-purple-200 rounded-xl text-xs"
                      />
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={handleParseCv}
                          disabled={isParsingCv || !cvText.trim()}
                          className="bg-[#123B6D] text-white px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
                        >
                          {isParsingCv ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Sparkles className="w-3.5 h-3.5 text-[#D4A72C]" />
                          )}
                          <span>{isParsingCv ? 'Parsing...' : 'Extract Skills & Enhance Bio'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Core Editable Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Full Name / ሙሉ ስም
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-[#F8FAFC] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Primary Role / ዋና ሚና
                    </label>
                    <select
                      value={isSuper ? 'ADMIN' : primaryRole}
                      disabled={isSuper}
                      onChange={(e) => setPrimaryRole(e.target.value as UserRole)}
                      className="w-full px-3 py-2 bg-[#F8FAFC] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-medium disabled:opacity-70"
                    >
                      {ALL_CANONICAL_ROLES.map((r) => (
                        <option key={r.id} value={r.id}>
                          {language === 'am' ? `${r.labelAm} (${r.labelEn})` : r.labelEn}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Secondary Roles Chips */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Secondary Roles (ተጨማሪ ሚናዎች)
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {ALL_CANONICAL_ROLES.filter((r) => r.id !== 'ADMIN').map((role) => {
                      const active = secondaryRoles.includes(role.id);
                      return (
                        <button
                          key={role.id}
                          type="button"
                          onClick={() => toggleSecondaryRole(role.id)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${
                            active
                              ? 'bg-[#123B6D] text-white border-[#123B6D]'
                              : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {language === 'am' ? role.labelAm : role.labelEn}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Profession / Title
                    </label>
                    <input
                      type="text"
                      value={profession}
                      onChange={(e) => setProfession(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F8FAFC] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Location / ከተማ
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F8FAFC] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Business / Company Name
                    </label>
                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F8FAFC] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Business Category / የንግድ ዘርፍ
                    </label>
                    <input
                      type="text"
                      value={businessCategory}
                      onChange={(e) => setBusinessCategory(e.target.value)}
                      placeholder="e.g. Liturgical Goods, Tech, Agriculture"
                      className="w-full px-3 py-2 bg-[#F8FAFC] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F8FAFC] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Telegram Handle
                    </label>
                    <input
                      type="text"
                      value={telegram}
                      onChange={(e) => setTelegram(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F8FAFC] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Skills (Comma Separated)
                  </label>
                  <input
                    type="text"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8FAFC] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Bio (ስለ እርስዎ)
                  </label>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8FAFC] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm"
                  />
                </div>
              </>
            )}

            {/* TAB 2: PORTFOLIO PROJECTS & COMPLETED JOBS HISTORY */}
            {sectionTab === 'portfolio' && (
              <div className="space-y-6">
                {/* Portfolio Manager */}
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-[#08294F] dark:text-white flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-[#D4A72C]" />
                    <span>{language === 'am' ? 'የሥራ ናሙናዎች (Portfolio Projects)' : 'Portfolio Projects'}</span>
                  </h4>

                  <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2.5">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={newProjTitle}
                        onChange={(e) => setNewProjTitle(e.target.value)}
                        placeholder={language === 'am' ? 'የፕሮጀክት ርእስ' : 'Project Title'}
                        className="sm:col-span-2 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                      />
                      <input
                        type="text"
                        value={newProjYear}
                        onChange={(e) => setNewProjYear(e.target.value)}
                        placeholder="Year (2026)"
                        className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono"
                      />
                    </div>
                    <input
                      type="text"
                      value={newProjLink}
                      onChange={(e) => setNewProjLink(e.target.value)}
                      placeholder="Link / URL (optional)"
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono"
                    />
                    <textarea
                      rows={2}
                      value={newProjDesc}
                      onChange={(e) => setNewProjDesc(e.target.value)}
                      placeholder={language === 'am' ? 'የፕሮጀክቱ አጭር መግለጫ...' : 'Short description of your work...'}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleAddPortfolio}
                      disabled={!newProjTitle.trim()}
                      className="px-4 py-1.5 rounded-xl bg-[#123B6D] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{language === 'am' ? 'ፕሮጀክት ጨምር' : 'Add Portfolio Project'}</span>
                    </button>
                  </div>

                  {portfolioItems.length > 0 ? (
                    <div className="space-y-2">
                      {portfolioItems.map((proj, idx) => (
                        <div
                          key={proj.id || idx}
                          className="p-3.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-start justify-between gap-3"
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-900 dark:text-white">
                                {proj.title}
                              </span>
                              <span className="text-[10px] font-mono bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                                {proj.year}
                              </span>
                            </div>
                            {proj.description && (
                              <p className="text-xs text-slate-600 dark:text-slate-300">
                                {proj.description}
                              </p>
                            )}
                            {proj.link && (
                              <a
                                href={proj.link}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[11px] text-[#123B6D] dark:text-[#D4A72C] underline"
                              >
                                {proj.link}
                              </a>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemovePortfolio(idx)}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">
                      {language === 'am' ? 'እስካሁን የሥራ ናሙና አልተጨመረም።' : 'No portfolio projects added yet.'}
                    </p>
                  )}
                </div>

                {/* Completed Jobs History (/users/{userId}/completed_jobs) */}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-700 space-y-3">
                  <h4 className="text-sm font-bold text-[#08294F] dark:text-white flex items-center gap-2">
                    <Award className="w-4 h-4 text-emerald-600" />
                    <span>
                      {language === 'am'
                        ? `የተጠናቀቁ ሥራዎች ታሪክ (Completed Jobs: ${completedJobs.length})`
                        : `Completed Jobs History (${completedJobs.length})`}
                    </span>
                  </h4>

                  {completedJobs.length > 0 ? (
                    <div className="space-y-2.5">
                      {completedJobs.map((cj) => (
                        <div
                          key={cj.id}
                          className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/40 space-y-1.5"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                              {language === 'am' ? cj.amharicTitle || cj.title : cj.title}
                            </h5>
                            <span className="text-xs font-black text-emerald-700 dark:text-emerald-300">
                              {cj.earningsAmount.toLocaleString()} ETB
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-[11px] text-slate-500">
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
                            <p className="text-xs text-slate-600 dark:text-slate-300 italic">
                              &ldquo;{cj.feedback}&rdquo;
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">
                      {language === 'am'
                        ? 'የተጠናቀቁ ሥራዎች ሲኖሩ እዚህ ይታያሉ።'
                        : 'Completed jobs and client ratings will appear here automatically.'}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: VERIFICATION REQUEST & DOCUMENT VAULT */}
            {sectionTab === 'vault' && (
              <div className="space-y-6">
                {/* Verification Request Panel with Church/Parish Name */}
                <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h4 className="text-sm font-bold text-[#08294F] dark:text-white flex items-center gap-2">
                      <Church className="w-4 h-4 text-[#D4A72C]" />
                      <span>
                        {language === 'am'
                          ? 'የማኅበረሰብና የሰበካ ጉባኤ ማረጋገጫ ጥያቄ'
                          : 'Community & Parish Verification Request'}
                      </span>
                    </h4>
                    {isVerified && (
                      <button
                        type="button"
                        onClick={() => setShowAuditModal(true)}
                        className="text-xs font-bold text-emerald-700 dark:text-emerald-300 underline cursor-pointer"
                      >
                        View Certificate →
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Church / Parish Name (የሰበካ ደብር ስም)
                      </label>
                      <input
                        type="text"
                        value={parishName}
                        onChange={(e) => setParishName(e.target.value)}
                        placeholder="e.g. Bole Medhanialem Cathedral"
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Spiritual Father / Reference Contact (optional)
                      </label>
                      <input
                        type="text"
                        value={spiritualFatherContact}
                        onChange={(e) => setSpiritualFatherContact(e.target.value)}
                        placeholder="Optional contact or parish secretary"
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Document Type (የማስረጃ ሰነድ ዓይነት)
                      </label>
                      <select
                        value={verificationDocType}
                        onChange={(e) => setVerificationDocType(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                      >
                        <option value="National ID / Kebele ID">National ID / Kebele ID</option>
                        <option value="Parish Membership Letter">Parish Membership Letter (የሰበካ ጉባኤ ደብዳቤ)</option>
                        <option value="Business Trade License">Business Trade License (የንግድ ፈቃድ)</option>
                        <option value="Professional Certificate">Professional Certificate / Degree</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Document Reference / ID Number
                      </label>
                      <input
                        type="text"
                        value={verificationDocDetails}
                        onChange={(e) => setVerificationDocDetails(e.target.value)}
                        placeholder="License # or Parish ref details"
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    {verificationSubmitted ? (
                      <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Verification request submitted to Admin Board!</span>
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-500">
                        Status: <strong className="uppercase">{currentUser.verificationStatus}</strong>
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={handleSubmitVerificationRequest}
                      className="px-4 py-2 rounded-xl bg-[#123B6D] hover:bg-[#08294F] text-white text-xs font-bold cursor-pointer"
                    >
                      {isVerified
                        ? 'Update Verification Info'
                        : language === 'am'
                        ? 'ለማረጋገጫ ያመልክቱ (Submit Verification)'
                        : 'Submit Verification Request'}
                    </button>
                  </div>
                </div>

                {/* Document Vault (Public / Private Certificates) */}
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-[#08294F] dark:text-white flex items-center gap-2">
                    <FolderLock className="w-4 h-4 text-[#D4A72C]" />
                    <span>
                      {language === 'am'
                        ? 'የሰነድ ካዝና (Public / Private Certificates Vault)'
                        : 'Document Vault (Public / Private Certificates)'}
                    </span>
                  </h4>

                  <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2.5">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={newDocTitle}
                        onChange={(e) => setNewDocTitle(e.target.value)}
                        placeholder={language === 'am' ? 'የሰነድ ስም (ለምሳሌ BSc Degree)' : 'Document Title'}
                        className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                      />
                      <select
                        value={newDocType}
                        onChange={(e) => setNewDocType(e.target.value as VaultDocument['docType'])}
                        className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                      >
                        <option value="certificate">Certificate</option>
                        <option value="license">Trade / Prof License</option>
                        <option value="recommendation">Parish Letter</option>
                        <option value="id">ID Document</option>
                        <option value="other">Other</option>
                      </select>
                      <select
                        value={newDocVisibility}
                        onChange={(e) => setNewDocVisibility(e.target.value as 'PUBLIC' | 'PRIVATE')}
                        className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
                      >
                        <option value="PUBLIC">🌐 PUBLIC (Visible on profile)</option>
                        <option value="PRIVATE">🔒 PRIVATE (Admin/Self only)</option>
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newDocRef}
                        onChange={(e) => setNewDocRef(e.target.value)}
                        placeholder="Certificate URL, License #, or short verification note"
                        className="flex-1 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                      />
                      <button
                        type="button"
                        onClick={handleAddVaultDoc}
                        disabled={!newDocTitle.trim()}
                        className="px-4 py-2 rounded-xl bg-[#16845B] text-white text-xs font-bold cursor-pointer disabled:opacity-40 shrink-0"
                      >
                        + Add Document
                      </button>
                    </div>
                  </div>

                  {vaultDocuments.length > 0 ? (
                    <div className="space-y-2">
                      {vaultDocuments.map((d) => (
                        <div
                          key={d.id}
                          className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                {d.title}
                              </span>
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                                  d.visibility === 'PUBLIC'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-slate-200 text-slate-800'
                                }`}
                              >
                                {d.visibility === 'PUBLIC' ? (
                                  <Globe className="w-2.5 h-2.5" />
                                ) : (
                                  <FolderLock className="w-2.5 h-2.5" />
                                )}
                                {d.visibility}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 truncate">{d.urlOrContent}</p>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleToggleDocVisibility(d.id)}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-[11px] font-bold cursor-pointer"
                            >
                              Make {d.visibility === 'PUBLIC' ? 'Private' : 'Public'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveVaultDoc(d.id)}
                              className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">
                      {language === 'am'
                        ? 'እስካሁን የተቀመጠ ሰነድ የለም።'
                        : 'No certificates or documents saved in your vault yet.'}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="pt-3 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
              {isSaved ? (
                <span className="text-xs text-[#16845B] font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Profile saved to Cloud Firestore!</span>
                </span>
              ) : (
                <div />
              )}

              <button
                type="submit"
                className="bg-[#123B6D] hover:bg-[#08294F] text-white px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Save className="w-4 h-4 text-[#D4A72C]" />
                <span>{language === 'am' ? 'ለውጦችን አስቀምጥ (Save Changes)' : 'Save Changes'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <TrustVerificationModal
        isOpen={showAuditModal}
        onClose={() => setShowAuditModal(false)}
        entity={auditEntityData}
      />
    </>
  );
};
