import React from 'react';
import { Calendar, Clock } from 'lucide-react';
import { Language } from '../../types';
import { formatExactPostedDateTime } from '../../utils/dateTime';

interface PostedDateTimeProps {
  value?: unknown;
  language: Language;
  variant?: 'footer' | 'inline' | 'compact';
  className?: string;
}

const LABEL_MAP: Record<Language, string> = {
  am: 'የተለጠፈበት፦',
  en: 'Posted:',
  om: 'Kan maxxanfame:',
  ti: 'ዝተለጠፈሉ፦',
};

const MISSING_MAP: Record<Language, string> = {
  am: 'ቀንና ሰዓት አልተመዘገበም',
  en: 'Date not recorded',
  om: 'Guyyaan hin galmoofne',
  ti: 'ዕለትን ሰዓትን ኣይተመዝገበን',
};

export const PostedDateTime: React.FC<PostedDateTimeProps> = ({
  value,
  language,
  variant = 'footer',
  className = '',
}) => {
  const formatted = formatExactPostedDateTime(value, language);

  if (!formatted) {
    if (variant === 'inline' || variant === 'compact') return null;
    return (
      <div
        className={`flex items-center gap-1.5 text-[11px] text-slate-400 font-ethiopic ${className}`}
      >
        <Clock className="w-3 h-3 shrink-0" />
        <span>{MISSING_MAP[language] || MISSING_MAP.am}</span>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <span
        title={formatted.isoText}
        className={`inline-flex items-center gap-1 text-[11px] text-slate-500 font-ethiopic ${className}`}
      >
        <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
        <span>{formatted.dateText}</span>
        <span className="text-slate-300">·</span>
        <Clock className="w-3 h-3 text-[#123B6D]/70 shrink-0" />
        <span className="font-semibold text-slate-700 tabular-nums">{formatted.timeText}</span>
      </span>
    );
  }

  if (variant === 'inline') {
    return (
      <span
        title={formatted.isoText}
        className={`inline-flex flex-wrap items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-ethiopic ${className}`}
      >
        <Calendar className="w-3.5 h-3.5 text-[#D4A72C] shrink-0" />
        <span>{LABEL_MAP[language] || LABEL_MAP.am}</span>
        <span className="font-semibold text-slate-700 dark:text-slate-200">{formatted.dateText}</span>
        <span className="text-slate-300 dark:text-slate-600">·</span>
        <Clock className="w-3.5 h-3.5 text-[#123B6D] dark:text-[#F3D77A] shrink-0" />
        <span className="font-bold text-[#08294F] dark:text-[#F3D77A] tabular-nums">
          {formatted.timeText}
        </span>
      </span>
    );
  }

  return (
    <div
      title={formatted.isoText}
      className={`flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-ethiopic ${className}`}
    >
      <div className="flex items-center gap-1.5">
        <Calendar className="w-3.5 h-3.5 text-[#D4A72C] shrink-0" />
        <span className="text-slate-400 dark:text-slate-500">{LABEL_MAP[language] || LABEL_MAP.am}</span>
        <span className="font-semibold text-slate-700 dark:text-slate-200">{formatted.dateText}</span>
      </div>
      <div className="flex items-center gap-1 bg-slate-100/90 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200/80 dark:border-slate-700">
        <Clock className="w-3 h-3 text-[#123B6D] dark:text-[#F3D77A] shrink-0" />
        <span className="font-bold text-[#08294F] dark:text-[#F3D77A] tabular-nums">
          {formatted.timeText}
        </span>
      </div>
    </div>
  );
};
