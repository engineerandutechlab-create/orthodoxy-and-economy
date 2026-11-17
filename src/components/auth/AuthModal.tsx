import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Mail,
  Lock,
  User,
  ArrowRight,
  CheckCircle2,
  Phone,
  MapPin,
  Loader2,
  AlertTriangle,
  Briefcase,
} from 'lucide-react';
import { ALL_CANONICAL_ROLES, UserRole } from '../../types';

export const AuthModal: React.FC = () => {
  const { closeModal, signIn, signInWithGoogle, registerUser, t, language } = useApp();

  const [mode, setMode] = useState<'signin' | 'register'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [userLocation, setUserLocation] = useState('Addis Ababa');
  const [selectedRole, setSelectedRole] = useState<UserRole>('JOB_SEEKER');
  const [businessCategory, setBusinessCategory] = useState('');
  const [verificationRequested, setVerificationRequested] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleGoogleAuth = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);
    try {
      const res = await signInWithGoogle();
      if (!res.success && res.error) {
        setErrorMsg(res.error);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Google sign-in failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      if (mode === 'register') {
        await registerUser({
          fullName: fullName.trim() || email.split('@')[0],
          email,
          password,
          primaryRole: selectedRole,
          location: userLocation || 'Addis Ababa',
          phone: phone || '',
          businessCategory: businessCategory.trim() || undefined,
          requestVerification: verificationRequested,
        });

        setSuccessMsg(
          language === 'am'
            ? 'ምዝገባዎ በቀጥታ በ Cloud Firestore ዳታቤዝ ውስጥ ተመዝግቧል!'
            : 'Registration saved directly to Cloud Firestore!'
        );

        setTimeout(() => {
          closeModal();
        }, 900);
      } else {
        const res = await signIn(email, fullName.trim() || undefined, password);
        if (!res.success && res.error) {
          setErrorMsg(res.error);
        }
      }
    } catch (err: any) {
      console.error('Registration/Sign-in error:', err);
      setErrorMsg(err?.message || 'Error occurred while authenticating.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-150 my-4">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-[#08294F] to-[#123B6D] text-white relative">
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 p-1.5 text-white/70 hover:text-white rounded-lg hover:bg-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#D4A72C]">
              Orthodox Community Platform · Cloud Synchronized
            </span>
            <h3 className="font-ethiopic text-xl font-bold text-white">
              {mode === 'signin' ? t.navSignIn : 'አዲስ አካውንት ይፍጠሩ'}
            </h3>
            <p className="text-xs text-slate-300 font-ethiopic">{t.brandSlogan}</p>
          </div>
        </div>

        {/* Android Mobile Sync Notice */}
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border-b border-emerald-100 dark:border-emerald-800/40 px-6 py-2.5 flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="leading-tight">
            በ <strong>Android Mobile App</strong> የተመዘገቡ ተጠቃሚዎች በተመሳሳይ አካውንት በቀጥታ መግባት ይችላሉ።
          </span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-3.5 max-h-[75vh] overflow-y-auto">
          {/* Primary Firebase Google Sign-In */}
          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={isLoading}
            className="w-full py-2.5 px-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-white border border-slate-300 dark:border-slate-600 rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2.5 disabled:opacity-60"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96z"
              />
            </svg>
            <span className="font-ethiopic">
              {language === 'am' ? 'በ Google ይግቡ / ይመዝገቡ' : 'Continue with Google'}
            </span>
          </button>

          <div className="relative flex items-center justify-center py-1">
            <div className="border-t border-slate-200 dark:border-slate-700 w-full" />
            <span className="bg-white dark:bg-slate-900 px-2.5 text-[10px] font-bold uppercase text-slate-400">
              {language === 'am' ? 'ወይም በኢሜይል' : 'Or with email'}
            </span>
          </div>

          {mode === 'register' && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name / ሙሉ ስም
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    placeholder="Abebe Kebede"
                    className="w-full pl-9 pr-3 py-2 bg-[#F8FAFC] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#123B6D]/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Primary Role in Community / የማኅበረሰብ ሚና (10 Roles)
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 bg-[#F8FAFC] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#123B6D]/20 font-ethiopic"
                >
                  {ALL_CANONICAL_ROLES.filter((r) => r.id !== 'ADMIN').map((role) => (
                    <option key={role.id} value={role.id}>
                      {language === 'am'
                        ? `${role.labelAm} (${role.labelEn})`
                        : `${role.labelEn} (${role.labelAm})`}
                    </option>
                  ))}
                </select>
              </div>

              {(selectedRole === 'BUSINESS' ||
                selectedRole === 'IMPORTER' ||
                selectedRole === 'DISTRIBUTOR' ||
                selectedRole === 'SELLER') && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Business Category / የንግድ ዘርፍ
                  </label>
                  <div className="relative">
                    <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={businessCategory}
                      onChange={(e) => setBusinessCategory(e.target.value)}
                      placeholder="e.g. Liturgical Goods, Agriculture, Construction"
                      className="w-full pl-9 pr-3 py-2 bg-[#F8FAFC] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#123B6D]/20"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Phone Number / ስልክ ቁጥር
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    placeholder="+251 91 123 4567"
                    className="w-full pl-9 pr-3 py-2 bg-[#F8FAFC] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#123B6D]/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Location / ከተማና አድራሻ
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={userLocation}
                    onChange={(e) => setUserLocation(e.target.value)}
                    required
                    placeholder="Addis Ababa (Bole)"
                    className="w-full pl-9 pr-3 py-2 bg-[#F8FAFC] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#123B6D]/20"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Email Address / ኢሜይል
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                className="w-full pl-9 pr-3 py-2 bg-[#F8FAFC] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#123B6D]/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Password / የይለፍ ቃል
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={mode === 'register' ? 6 : undefined}
                placeholder="••••••"
                required
                className="w-full pl-9 pr-3 py-2 bg-[#F8FAFC] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#123B6D]/20"
              />
            </div>
          </div>

          {mode === 'register' && (
            <div className="bg-[#123B6D]/5 dark:bg-slate-800 p-3 rounded-xl border border-[#123B6D]/10 dark:border-slate-700">
              <label className="flex items-start gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer font-ethiopic">
                <input
                  type="checkbox"
                  checked={verificationRequested}
                  onChange={(e) => setVerificationRequested(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-[#123B6D] rounded"
                />
                <span>
                  Request community verification badge for this profile (በማኅበረሰብ የታማኝነት ማረጋገጫ ይሁንልኝ)
                </span>
              </label>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#123B6D] hover:bg-[#08294F] disabled:opacity-60 text-white py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#D4A72C]" />
                <span>{mode === 'register' ? 'ወደ ዳታቤዝ እየተመዘገበ ነው...' : 'በመግባት ላይ...'}</span>
              </>
            ) : (
              <>
                <span>
                  {mode === 'signin'
                    ? t.navSignIn
                    : 'በ Cloud Firestore ተመዝገብ (Register to Cloud DB)'}
                </span>
                <ArrowRight className="w-4 h-4 text-[#D4A72C]" />
              </>
            )}
          </button>

          <div className="pt-2 text-center text-xs text-slate-500">
            {mode === 'signin' ? (
              <span>
                Don&apos;t have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg(null);
                    setMode('register');
                  }}
                  className="text-[#123B6D] dark:text-[#D4A72C] font-bold hover:underline cursor-pointer"
                >
                  Register here
                </button>
              </span>
            ) : (
              <span>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg(null);
                    setMode('signin');
                  }}
                  className="text-[#123B6D] dark:text-[#D4A72C] font-bold hover:underline cursor-pointer"
                >
                  Sign in here
                </button>
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
