import React, { useState } from 'react';
import { 
  CheckCircle2, 
  ShieldCheck, 
  Award, 
  Clock, 
  AlertCircle, 
  Sparkles, 
  Check, 
  ChevronRight,
  Lock,
  Building2,
  FileCheck
} from 'lucide-react';
import { TrustVerificationModal, VerificationEntityInfo } from './TrustVerificationModal';

export interface VerificationBadgeProps {
  type?: 'user' | 'employer' | 'seller' | 'business' | 'professional' | 'artisan' | 'monastery';
  status?: 'verified' | 'pending' | 'unverified';
  label?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  variant?: 'pill' | 'subtle' | 'icon' | 'badge' | 'tier';
  interactive?: boolean;
  entityName?: string;
  entityRole?: string;
  entityAvatar?: string;
  certificateId?: string;
  onClick?: () => void;
}

export const VerificationBadge: React.FC<VerificationBadgeProps> = ({ 
  type = 'user',
  status = 'verified',
  label,
  size = 'sm',
  variant = 'pill',
  interactive = true,
  entityName,
  entityRole,
  entityAvatar,
  certificateId,
  onClick
}) => {
  const [modalOpen, setModalOpen] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClick) {
      onClick();
    } else if (interactive) {
      setModalOpen(true);
    }
  };

  const isVerified = status === 'verified';
  const isPending = status === 'pending';
  const isUnverified = status === 'unverified';

  // Default labels based on type and status
  const defaultLabel = (() => {
    if (label) return label;
    if (isPending) return 'Pending Audit';
    if (isUnverified) return 'Unverified';
    switch (type) {
      case 'employer': return 'Verified Employer';
      case 'seller': return 'Verified Merchant';
      case 'business': return 'Verified Enterprise';
      case 'professional': return 'Certified Specialist';
      case 'artisan': return 'Master Church Artisan';
      case 'monastery': return 'Monastic Guild';
      default: return 'Verified Member';
    }
  })();

  const entityData: VerificationEntityInfo = {
    name: entityName || defaultLabel,
    role: entityRole || (type ? `${type.charAt(0).toUpperCase() + type.slice(1)} Profile` : 'Verified Profile'),
    type,
    status,
    avatarUrl: entityAvatar,
    certificateId: certificateId || (isVerified ? 'OEC-VER-89421' : undefined),
    isCurrentUser: false
  };

  if (variant === 'icon') {
    return (
      <>
        <button
          type="button"
          onClick={handleClick}
          title={isVerified ? "Verified Orthodox & Economy Partner - Click to inspect credentials" : "Unverified"}
          className={`inline-flex items-center justify-center transition-transform hover:scale-110 cursor-pointer ${
            isVerified 
              ? 'text-emerald-600 hover:text-emerald-700' 
              : isPending 
                ? 'text-amber-500 hover:text-amber-600' 
                : 'text-slate-400'
          }`}
        >
          {isVerified ? (
            <ShieldCheck className={`${size === 'xs' ? 'w-3 h-3' : size === 'sm' ? 'w-3.5 h-3.5' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5'} fill-emerald-100 text-emerald-600 shrink-0`} />
          ) : isPending ? (
            <Clock className={`${size === 'xs' ? 'w-3 h-3' : size === 'sm' ? 'w-3.5 h-3.5' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5'} text-amber-500 shrink-0`} />
          ) : (
            <AlertCircle className={`${size === 'xs' ? 'w-3 h-3' : size === 'sm' ? 'w-3.5 h-3.5' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5'} text-slate-400 shrink-0`} />
          )}
        </button>

        <TrustVerificationModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          entity={entityData}
        />
      </>
    );
  }

  // Pill or Badge style
  const sizeClasses = {
    xs: 'text-[10px] px-1.5 py-0.5 gap-1',
    sm: 'text-xs px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-semibold',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-bold'
  }[size];

  const iconSizes = {
    xs: 'w-2.5 h-2.5',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-4.5 h-4.5'
  }[size];

  const colorClasses = isVerified
    ? 'bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-800 border-emerald-300/80 hover:border-emerald-500 hover:shadow-xs'
    : isPending
      ? 'bg-amber-50 text-amber-800 border-amber-300 hover:border-amber-500'
      : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300';

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        title="Click to view verified credentials & trust record"
        className={`inline-flex items-center rounded-full border transition-all cursor-pointer font-medium select-none ${sizeClasses} ${colorClasses}`}
      >
        {isVerified ? (
          <ShieldCheck className={`${iconSizes} text-emerald-600 fill-emerald-100 shrink-0`} />
        ) : isPending ? (
          <Clock className={`${iconSizes} text-amber-600 shrink-0`} />
        ) : (
          <AlertCircle className={`${iconSizes} text-slate-400 shrink-0`} />
        )}
        <span className="tracking-tight truncate">{defaultLabel}</span>
      </button>

      <TrustVerificationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        entity={entityData}
      />
    </>
  );
};

export const VerifiedShield: React.FC<{ tooltip?: string; size?: number; onClick?: () => void }> = ({ 
  tooltip, 
  size = 16,
  onClick 
}) => {
  return (
    <span 
      title={tooltip || "Verified Orthodox Profile"} 
      onClick={onClick}
      className={`inline-flex items-center text-[#D4A72C] ${onClick ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
    >
      <ShieldCheck style={{ width: size, height: size }} className="fill-[#D4A72C]/15" />
    </span>
  );
};

export const StatusIndicator: React.FC<{ active: boolean; activeText: string; inactiveText: string }> = ({
  active,
  activeText,
  inactiveText
}) => {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium">
      <span className={`w-2 h-2 rounded-full ${active ? 'bg-[#16845B]' : 'bg-[#64748B]'}`} />
      <span className={active ? 'text-[#16845B]' : 'text-[#64748B]'}>
        {active ? activeText : inactiveText}
      </span>
    </span>
  );
};

/**
 * Visual verification status card to display on user profiles, dashboards, or listing sidebars
 */
interface VerificationStatusCardProps {
  status: 'verified' | 'pending' | 'unverified';
  fullName: string;
  role?: string;
  onApplyOrInspect?: () => void;
  language?: string;
}

export const VerificationStatusCard: React.FC<VerificationStatusCardProps> = ({
  status,
  fullName,
  role = 'Platform Member',
  onApplyOrInspect,
  language = 'am'
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const isVerified = status === 'verified';
  const isPending = status === 'pending';

  const handleOpen = () => {
    if (onApplyOrInspect) {
      onApplyOrInspect();
    } else {
      setModalOpen(true);
    }
  };

  return (
    <>
      <div className={`p-4 rounded-2xl border transition-all ${
        isVerified
          ? 'bg-gradient-to-br from-emerald-50/90 via-white to-teal-50/60 border-emerald-200 shadow-xs'
          : isPending
            ? 'bg-gradient-to-br from-amber-50/90 via-white to-yellow-50/60 border-amber-200'
            : 'bg-gradient-to-br from-slate-50 via-white to-slate-100/70 border-slate-200'
      }`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${
              isVerified 
                ? 'bg-emerald-600 text-white shadow-xs' 
                : isPending 
                  ? 'bg-amber-500 text-white' 
                  : 'bg-slate-200 text-slate-600'
            }`}>
              <ShieldCheck className="w-5 h-5" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-slate-900">
                  {language === 'am' ? 'የማረጋገጫ ደረጃ (Trust Status)' : 'Community Trust Status'}
                </h4>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                  isVerified
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : isPending
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : 'bg-slate-200 text-slate-700'
                }`}>
                  {isVerified ? (language === 'am' ? 'የተረጋገጠ ✓' : 'VERIFIED ✓') : isPending ? (language === 'am' ? 'በማጣራት ላይ' : 'PENDING') : (language === 'am' ? 'ያልተረጋገጠ' : 'UNVERIFIED')}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 font-ethiopic">
                {isVerified
                  ? (language === 'am' ? 'መታወቂያ፣ የንግድ ፈቃድና የሥነ-ምግባር ቃልኪዳን ተረጋግጧል' : 'National ID, Business License & Ethics Charter Verified')
                  : isPending
                    ? (language === 'am' ? 'ሰነዶችዎ በኦዲት ቦርድ እየተገመገሙ ነው' : 'Documents currently under audit by council')
                    : (language === 'am' ? 'እምነት ለማትረፍና ፈጣን ምላሽ ለማግኘት ያረጋግጡ' : 'Get verified to build buyer trust and unlock priority listings')}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleOpen}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1 ${
              isVerified
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                : 'bg-[#123B6D] hover:bg-[#08294F] text-white shadow-xs'
            }`}
          >
            <span>{isVerified ? (language === 'am' ? 'ምስክርነት እይ' : 'View Audit') : (language === 'am' ? 'አሁን አረጋግጥ' : 'Verify Now')}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <TrustVerificationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        entity={{
          name: fullName,
          role,
          status,
          isCurrentUser: true,
          certificateId: isVerified ? 'OEC-VER-89421' : undefined
        }}
      />
    </>
  );
};
