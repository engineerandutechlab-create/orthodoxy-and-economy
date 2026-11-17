import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Bell,
  CheckCheck,
  FileCheck2,
  MessageSquare,
  ShieldCheck,
  Info,
  ShoppingBag,
  Star,
  RefreshCw,
} from 'lucide-react';
import { NotificationItem } from '../../types';
import { formatExactPostedDateTime } from '../../utils/dateTime';

export const NotificationsModal: React.FC = () => {
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    closeModal,
    setActiveTab,
    openModal,
    setActiveConversationId,
    language,
    t,
  } = useApp();

  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filteredNotifs = notifications.filter((n) => {
    if (filter === 'unread') return !n.isRead;
    return true;
  });

  const getIcon = (type: NotificationItem['type']) => {
    const upper = String(type).toUpperCase();
    switch (upper) {
      case 'JOB_APPLICATION':
      case 'PROPOSAL':
        return <FileCheck2 className="w-4 h-4 text-[#123B6D]" />;
      case 'MESSAGE':
        return <MessageSquare className="w-4 h-4 text-[#2563EB]" />;
      case 'ORDER':
        return <ShoppingBag className="w-4 h-4 text-[#16845B]" />;
      case 'REVIEW':
        return <Star className="w-4 h-4 text-[#D4A72C]" />;
      case 'VERIFICATION':
        return <ShieldCheck className="w-4 h-4 text-emerald-600" />;
      case 'STATUS_CHANGE':
        return <RefreshCw className="w-4 h-4 text-indigo-600" />;
      default:
        return <Info className="w-4 h-4 text-[#16845B]" />;
    }
  };

  const handleNotificationClick = (notif: NotificationItem) => {
    markNotificationRead(notif.id);
    const upper = String(notif.type).toUpperCase();
    closeModal();
    if (upper === 'MESSAGE' || upper === 'ORDER') {
      if (notif.referenceId && notif.referenceId.startsWith('conv_')) {
        setActiveConversationId(notif.referenceId);
      }
      setActiveTab('messages');
    } else if (upper === 'JOB_APPLICATION' || upper === 'PROPOSAL' || upper === 'STATUS_CHANGE') {
      setActiveTab('dashboard');
    } else if (upper === 'VERIFICATION' || upper === 'REVIEW') {
      openModal('profile');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full max-h-[85vh] overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150 flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#123B6D] dark:text-[#F3D77A]" />
            <h3 className="text-base font-extrabold text-[#08294F] dark:text-white">
              {t.navNotifications}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={markAllNotificationsRead}
              className="text-xs font-semibold text-[#123B6D] dark:text-[#F3D77A] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark all read</span>
            </button>
            <button
              onClick={closeModal}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="px-5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 text-xs">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
              filter === 'all'
                ? 'bg-[#123B6D] text-white'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
              filter === 'unread'
                ? 'bg-[#123B6D] text-white'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            Unread ({notifications.filter((n) => !n.isRead).length})
          </button>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 p-2">
          {filteredNotifs.length > 0 ? (
            filteredNotifs.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`p-3.5 rounded-xl transition-colors cursor-pointer flex items-start gap-3 ${
                  !notif.isRead
                    ? 'bg-[#123B6D]/5 dark:bg-amber-400/10 hover:bg-[#123B6D]/10'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs flex items-center justify-center shrink-0 mt-0.5">
                  {getIcon(notif.type)}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {language === 'am'
                        ? notif.amharicTitle || notif.titleAm || notif.title
                        : notif.title}
                    </h4>
                    <span className="text-[10px] text-slate-400 shrink-0 tabular-nums">
                      {formatExactPostedDateTime(notif.createdAt, language)?.fullText || ''}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-snug font-ethiopic">
                    {language === 'am' ? notif.messageAm || notif.message : notif.message}
                  </p>
                  <span className="inline-block text-[9px] font-mono uppercase tracking-wider text-slate-400">
                    {notif.type}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs">
              {language === 'am' ? 'ምንም ማሳወቂያ የለም' : 'No notifications at this time'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
