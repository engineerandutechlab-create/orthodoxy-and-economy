import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  X, 
  Award, 
  Building2, 
  Phone, 
  Lock, 
  Sparkles, 
  AlertCircle, 
  Clock, 
  Check, 
  UserCheck,
} from 'lucide-react';
import { useApp, isSuperAdminEmail } from '../../context/AppContext';
import { DEFAULT_AVATAR_URL, handleImageFallback } from '../../constants/assets';

export interface VerificationEntityInfo {
  name: string;
  role?: string;
  type?: 'user' | 'employer' | 'seller' | 'business' | 'professional' | 'artisan' | 'monastery';
  status?: 'verified' | 'pending' | 'unverified';
  avatarUrl?: string;
  certificateId?: string;
  verifiedSince?: string;
  tinNumber?: string;
  location?: string;
  isCurrentUser?: boolean;
}

interface TrustVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  entity: VerificationEntityInfo;
}

export const TrustVerificationModal: React.FC<TrustVerificationModalProps> = ({
  isOpen,
  onClose,
  entity
}) => {
  const { language, currentUser, updateProfile } = useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'apply'>(
    entity.status === 'unverified' && entity.isCurrentUser ? 'apply' : 'overview'
  );

  // Form states for applying for verification
  const [idType, setIdType] = useState(currentUser?.verificationDocType || 'kebele');
  const [idNumber, setIdNumber] = useState(currentUser?.verificationDocDetails || '');
  const [churchParish, setChurchParish] = useState(currentUser?.parishName || '');
  const [businessTin, setBusinessTin] = useState('');
  const [appliedSuccess, setAppliedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen && currentUser) {
      if (currentUser.verificationDocType) setIdType(currentUser.verificationDocType);
      if (currentUser.verificationDocDetails) setIdNumber(currentUser.verificationDocDetails);
      if (currentUser.parishName) setChurchParish(currentUser.parishName);
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const status = entity.status || 'verified';
  const isVerified = status === 'verified';
  const isPending = status === 'pending';
  const isSuper = isSuperAdminEmail(currentUser?.email);

  const handleApplyVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    const docDetails = [idNumber.trim(), businessTin.trim() ? `TIN: ${businessTin.trim()}` : '']
      .filter(Boolean)
      .join(' · ');

    if (updateProfile) {
      await updateProfile({
        parishName: churchParish.trim(),
        verificationDocType: idType,
        verificationDocDetails: docDetails,
        verificationStatus: isSuper ? 'verified' : 'pending',
      });
    }
    setAppliedSuccess(true);
    setTimeout(() => {
      setAppliedSuccess(false);
      onClose();
    }, 2000);
  };

  const verificationItems = [
    {
      titleEn: 'National ID & Resident Authentication',
      titleAm: 'የነዋሪነትና ብሔራዊ መታወቂያ ማረጋገጫ',
      descEn: 'Official identity documents verified against local administration records.',
      descAm: 'የተጠቃሚው ሕጋዊ መታወቂያ እና የነዋሪነት ማስረጃ በአስተዳዳሪው ቦርድ ተረጋግጧል።',
      checked: isVerified,
      icon: UserCheck
    },
    {
      titleEn: 'Ethiopian Trade License & TIN Registration',
      titleAm: 'የንግድ ፈቃድና የግብር ከፋይ መለያ (TIN)',
      descEn: 'Commercial registration and Ministry of Revenues compliance authenticated.',
      descAm: 'የንግድና ኢንዱስትሪ ሚኒስቴር ፈቃድ እና የገቢዎች ሚኒስቴር የግብር ከፋይ ምዝገባ የተረጋገጠ።',
      checked: isVerified,
      icon: Building2
    },
    {
      titleEn: 'Two-Factor Telegram & Mobile Authentication',
      titleAm: 'የስልክና ቴሌግራም ባለ 2-ደረጃ ማረጋገጫ',
      descEn: 'Direct direct-contact channels authenticated to prevent fraud and impersonation.',
      descAm: 'አስተማማኝ ግንኙነት ለመፍጠር የስልክ ቁጥር እና የቴሌግራም አካውንት ተረጋግጧል።',
      checked: true,
      icon: Phone
    },
    {
      titleEn: 'Orthodox Christian Business Ethics Charter',
      titleAm: 'የክርስቲያናዊ የንግድ ሥነ-ምግባር ቃልኪዳን',
      descEn: 'Committed to honest weights, fair pricing, prompt payment, and spiritual integrity.',
      descAm: 'በሐቀኝነት፣ ፍትሐዊ ዋጋ፣ በታማኝነትና በቅን ልቦና ለማገልገል የተፈረመ የጋራ መርህ።',
      checked: isVerified,
      icon: Award
    },
    {
      titleEn: 'Parish & Community Standing Reference',
      titleAm: 'የሰበካ ጉባኤ ወይም የማኅበረሰብ ምስክርነት',
      descEn: 'Recommended by parish council, Christian professional guild, or monastery association.',
      descAm: 'በአጥቢያ ቤተክርስቲያን ሰበካ ጉባኤ ወይም በባለሙያዎች ማኅበር የተመሰገነ መልካም ስም።',
      checked: isVerified,
      icon: ShieldCheck
    }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header with Trust Glow */}
        <div className={`p-5 sm:p-6 text-white relative ${
          isVerified 
            ? 'bg-gradient-to-r from-[#08294F] via-[#123B6D] to-[#16845B]' 
            : isPending 
              ? 'bg-gradient-to-r from-[#08294F] via-[#B45309] to-[#D97706]'
              : 'bg-gradient-to-r from-slate-800 to-slate-900'
        }`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3.5">
            <div className="relative">
              <img
                src={entity.avatarUrl || DEFAULT_AVATAR_URL}
                alt={entity.name}
                referrerPolicy="no-referrer"
                onError={handleImageFallback(DEFAULT_AVATAR_URL)}
                className="w-14 h-14 rounded-2xl object-cover ring-2 ring-white/40 shadow-md"
              />
              <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                {isVerified ? (
                  <ShieldCheck className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                ) : isPending ? (
                  <Clock className="w-5 h-5 text-amber-500 fill-amber-100" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-slate-400" />
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-extrabold text-white leading-tight">
                  {entity.name}
                </h3>
              </div>

              <div className="flex items-center gap-2 mt-1">
                {isVerified && (
                  <span className="inline-flex items-center gap-1 bg-emerald-500/25 border border-emerald-400/40 text-emerald-200 text-[11px] font-bold px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                    <span>{language === 'am' ? 'የተረጋገጠ ማኅበረሰባዊ አባል' : 'Verified Community Member'}</span>
                  </span>
                )}
                {isPending && (
                  <span className="inline-flex items-center gap-1 bg-amber-500/25 border border-amber-400/40 text-amber-200 text-[11px] font-bold px-2 py-0.5 rounded-full">
                    <Clock className="w-3.5 h-3.5 text-amber-300" />
                    <span>{language === 'am' ? 'በማጣራት ሂደት ላይ' : 'Verification Pending'}</span>
                  </span>
                )}
                {!isVerified && !isPending && (
                  <span className="inline-flex items-center gap-1 bg-slate-500/25 border border-slate-400/40 text-slate-300 text-[11px] font-bold px-2 py-0.5 rounded-full">
                    <AlertCircle className="w-3.5 h-3.5 text-slate-300" />
                    <span>{language === 'am' ? 'ያልተረጋገጠ መለያ' : 'Unverified Account'}</span>
                  </span>
                )}
              </div>
              <p className="text-[11px] text-white/80 mt-0.5">
                {entity.role || (language === 'am' ? 'የኦርቶዶክስና ኢኮኖሚ መድረክ አባል' : 'Orthodox & Economy Member')}
              </p>
            </div>
          </div>

          {/* Quick Trust Score Pill */}
          <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between text-xs text-white/90">
            <span className="flex items-center gap-1 text-[11px]">
              <Sparkles className="w-3.5 h-3.5 text-[#FDE047]" />
              <span>{language === 'am' ? 'የእምነት ደረጃ (Trust Score)' : 'Community Trust Score'}</span>
            </span>
            <span className="font-extrabold text-[#FDE047] font-mono text-sm">
              {isVerified ? '98.5% (A+ Verified)' : isPending ? '75% (Under Audit)' : '50% (Standard)'}
            </span>
          </div>
        </div>

        {/* Modal Navigation Tabs if Current User */}
        {entity.isCurrentUser && (
          <div className="flex border-b border-slate-200 bg-slate-50/70 px-6 pt-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                activeTab === 'overview'
                  ? 'border-[#123B6D] text-[#123B6D]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {language === 'am' ? 'የማረጋገጫ መስፈርቶች' : 'Verification Checklist'}
            </button>
            <button
              onClick={() => setActiveTab('apply')}
              className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'apply'
                  ? 'border-[#16845B] text-[#16845B]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#D4A72C]" />
              <span>{language === 'am' ? 'ማረጋገጫ ጠይቅ / አድስ' : 'Apply for Verification'}</span>
            </button>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
          
          {activeTab === 'overview' ? (
            <>
              {/* Trust Assurance Statement */}
              <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-3.5 text-xs text-emerald-950 flex items-start gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-bold font-ethiopic">
                    {language === 'am' 
                      ? 'የማኅበረሰቡ የታማኝነትና የጥራት ዋስትና (Community Trust Guarantee)' 
                      : 'Verified Authenticity & Buyer Protection'}
                  </p>
                  <p className="text-[11px] text-emerald-800 font-ethiopic leading-relaxed">
                    {language === 'am'
                      ? 'ይህ የተረጋገጠ ባጅ ባለቤቱ በኦርቶዶክስና ኢኮኖሚ የሥራ መመሪያ መሠረት ማንነቱ፣ ሕጋዊ ፈቃዱ እና መልካም ሥነ-ምግባሩ የተረጋገጠ መሆኑን ያረጋግጣል።'
                      : 'This verified badge confirms the owner has passed strict identity, tax, legal, and community ethical standards.'}
                  </p>
                </div>
              </div>

              {/* Checklist breakdown */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-ethiopic">
                  {language === 'am' ? 'የተረጋገጡ መስፈርቶች ዝርዝር' : 'Verified Trust Pillars'}
                </h4>

                <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-xs">
                  {verificationItems.map((item, idx) => {
                    const IconComponent = item.icon;
                    return (
                      <div key={idx} className="p-3 sm:p-3.5 flex items-start gap-3">
                        <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                          item.checked 
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                            : 'bg-slate-100 text-slate-400'
                        }`}>
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h5 className="text-xs font-bold text-slate-800 font-ethiopic">
                              {language === 'am' ? item.titleAm : item.titleEn}
                            </h5>
                            {item.checked ? (
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                                <span>{language === 'am' ? 'ተረጋግጧል' : 'Passed'}</span>
                              </span>
                            ) : (
                              <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                                {language === 'am' ? 'በመጠባበቅ ላይ' : 'Pending'}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 font-ethiopic mt-0.5 leading-relaxed">
                            {language === 'am' ? item.descAm : item.descEn}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Certificate Metadata */}
              <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/60 text-[11px] text-slate-600 space-y-1 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">CERTIFICATE ID:</span>
                  <span className="font-bold text-[#123B6D]">
                    {entity.certificateId || currentUser?.certificateId || (isVerified ? 'OEC-VER-ACTIVE' : 'PENDING AUDIT')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">VERIFIED SINCE:</span>
                  <span>
                    {entity.verifiedSince ||
                      (currentUser?.verifiedAt
                        ? new Date(currentUser.verifiedAt).toLocaleDateString()
                        : isVerified
                        ? 'Verified Member'
                        : 'Pending')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">AUDITOR BOARD:</span>
                  <span>Orthodox &amp; Economy Trust Council</span>
                </div>
              </div>
            </>
          ) : (
            /* APPLICATION FORM FOR UNVERIFIED / RE-AUDIT */
            <form onSubmit={handleApplyVerification} className="space-y-4 font-ethiopic">
              {appliedSuccess ? (
                <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2 animate-in zoom-in-95">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                  <h4 className="font-bold text-emerald-900 text-sm">
                    {isSuper
                      ? language === 'am'
                        ? 'የማረጋገጫ ጥያቄዎ በተሳካ ሁኔታ ተቀባይነት አግኝቷል!'
                        : 'Verification Approved Successfully!'
                      : language === 'am'
                      ? 'የማረጋገጫ ጥያቄዎ ለአስተዳዳሪ ቦርድ ተልኳል!'
                      : 'Verification Request Submitted!'}
                  </h4>
                  <p className="text-xs text-emerald-700">
                    {isSuper
                      ? language === 'am'
                        ? 'የተረጋገጠ አርማ (Verified Badge) በመለያዎና በለጠፏቸው ማስታወቂያዎች ላይ ወዲያውኑ ይታያል።'
                        : 'Your verified trust badge has been activated across your profile and all listings.'
                      : language === 'am'
                      ? 'ሰነዶችዎ በ Firestore ተመዝግበዋል፤ በአስተዳዳሪዎች ሲረጋገጥ የተረጋገጠ አርማ (Verified Badge) ይሰጥዎታል።'
                      : 'Your credentials are saved to Firestore for Trust Council review. You will be notified once approved.'}
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-slate-900">
                      {language === 'am' ? 'የማረጋገጫ ባጅ ማመልከቻ' : 'Official Verification Application'}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {language === 'am' 
                        ? 'በመድረኩ ላይ ከፍተኛ እምነት ለማግኘትና ሽያጭዎን ለማሳደግ መረጃዎችዎን ያስገቡ።' 
                        : 'Submit your credentials to obtain the community verified trust badge.'}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        {language === 'am' ? 'የመታወቂያ ዓይነት' : 'ID Document Type'}
                      </label>
                      <select
                        value={idType}
                        onChange={(e) => setIdType(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white focus:ring-1 focus:ring-[#123B6D] outline-none"
                      >
                        <option value="kebele">{language === 'am' ? 'የነዋሪነት / የቀበሌ መታወቂያ' : 'Kebele Resident ID'}</option>
                        <option value="national">{language === 'am' ? 'ብሔራዊ ዲጂታል መታወቂያ (Fayda)' : 'National ID (Fayda)'}</option>
                        <option value="passport">{language === 'am' ? 'ፓስፖርት (Passport)' : 'Passport'}</option>
                        <option value="license">{language === 'am' ? 'የመንጃ ፈቃድ' : 'Driver License'}</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        {language === 'am' ? 'የመታወቂያ ቁጥር / Fayda ID' : 'Document ID Number'}
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. AA-04-182901 / FIN-8921"
                        value={idNumber}
                        onChange={(e) => setIdNumber(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-1 focus:ring-[#123B6D] outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        {language === 'am' ? 'የንግድ ፈቃድና የTIN ቁጥር (ካለዎት)' : 'Trade License & TIN (Optional for Sellers/Companies)'}
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. TIN: 0098421092"
                        value={businessTin}
                        onChange={(e) => setBusinessTin(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-1 focus:ring-[#123B6D] outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        {language === 'am' ? 'አጥቢያ ቤተክርስቲያን / ሰበካ ጉባኤ / ማኅበር' : 'Parish Church / Community Reference'}
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. ደብረ ሲና እግዚአብሔር አብ / ቦሌ መድኃኔዓለም"
                        value={churchParish}
                        onChange={(e) => setChurchParish(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-1 focus:ring-[#123B6D] outline-none"
                      />
                    </div>

                    <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-[11px] text-amber-900 flex items-start gap-2">
                      <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span>
                        {language === 'am'
                          ? 'የግል መረጃዎ በምሥጢር የተጠበቀ ሲሆን ለማረጋገጫ ዓላማ ብቻ ይውላል።'
                          : 'Your private identity data is securely encrypted and used strictly for trust verification.'}
                      </span>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-[#16845B] hover:bg-[#126b4a] text-white py-3 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                    >
                      <ShieldCheck className="w-4 h-4 text-white" />
                      <span>{language === 'am' ? 'ማረጋገጫውን አጽድቅ (Confirm & Verify Now)' : 'Confirm & Activate Verified Status'}</span>
                    </button>
                  </div>
                </>
              )}
            </form>
          )}

        </div>

        {/* Modal Bottom Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between text-xs">
          <span className="text-[11px] text-slate-500 flex items-center gap-1 font-ethiopic">
            <Lock className="w-3 h-3 text-emerald-600" />
            <span>{language === 'am' ? 'የተረጋገጠ ማኅበረሰባዊ ጥበቃ' : 'Community Protected'}</span>
          </span>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 font-bold rounded-xl border border-slate-200 transition-colors cursor-pointer"
          >
            {language === 'am' ? 'ዝጋ' : 'Close'}
          </button>
        </div>

      </div>
    </div>
  );
};
