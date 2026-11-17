import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  MessageSquare,
  Search,
  Send,
  ArrowLeft,
  Briefcase,
  Flag,
  AlertTriangle,
  X,
} from 'lucide-react';
import { Conversation } from '../../types';
import { DEFAULT_AVATAR_URL, handleImageFallback } from '../../constants/assets';

export const MessagesView: React.FC = () => {
  const {
    currentUser,
    conversations,
    activeConversationId,
    setActiveConversationId,
    markConversationRead,
    messages,
    sendMessage,
    submitReport,
    t,
    language,
  } = useApp();

  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileChatOpen, setMobileChatOpen] = useState(false);

  // Report conversation state
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('አግባብ ያልሆነ መልእክት ወይም ማጭበርበር (Abuse / Scam)');
  const [reportDetails, setReportDetails] = useState('');
  const [reportSent, setReportSent] = useState(false);

  const activeConversation =
    conversations.find((c) => c.id === activeConversationId) || conversations[0];
  const activeMessages = activeConversation ? messages[activeConversation.id] || [] : [];

  useEffect(() => {
    if (activeConversation?.id) {
      if (activeConversation.id !== activeConversationId) {
        setActiveConversationId(activeConversation.id);
      }
      if ((activeConversation.unreadCount || 0) > 0) {
        markConversationRead(activeConversation.id);
      }
    }
  }, [activeConversation?.id]);

  const filteredConversations = conversations.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    return (
      !q ||
      c.participant1Name.toLowerCase().includes(q) ||
      c.participant2Name.toLowerCase().includes(q) ||
      (c.projectTitle && c.projectTitle.toLowerCase().includes(q)) ||
      c.lastMessage.toLowerCase().includes(q)
    );
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConversation) return;

    sendMessage(activeConversation.id, inputText);
    setInputText('');
  };

  const getPartnerName = (conv: Conversation) => {
    if (conv.participant1Id === currentUser?.userId) {
      return conv.participant2Name;
    }
    return conv.participant1Name;
  };

  const getPartnerAvatar = (conv: Conversation) => {
    if (conv.participant1Id === currentUser?.userId) {
      return conv.participant2Avatar;
    }
    return conv.participant1Avatar;
  };

  const handleReportChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConversation) return;
    await submitReport({
      targetType: 'MESSAGE',
      targetId: activeConversation.id,
      targetTitle:
        activeConversation.projectTitle || getPartnerName(activeConversation),
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-[#E2E8F0] dark:border-slate-800 shadow-sm overflow-hidden flex h-[750px]">
        {/* LEFT PANE: CONVERSATION LIST */}
        <div
          className={`w-full md:w-80 lg:w-96 border-r border-slate-200 dark:border-slate-800 flex flex-col ${
            mobileChatOpen ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Header & Search */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-[#08294F] dark:text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#123B6D] dark:text-[#F3D77A]" />
                <span>{t.navMessages}</span>
              </h2>
              <span className="text-xs text-slate-400 font-semibold">
                {conversations.length} Active
              </span>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === 'am' ? 'ውይይቶችን ይፈልጉ...' : 'Search chats...'}
                className="w-full pl-8 pr-3 py-1.5 bg-[#F8FAFC] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#123B6D]"
              />
            </div>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {filteredConversations.length > 0 ? (
              filteredConversations.map((conv) => {
                const partnerName = getPartnerName(conv);
                const partnerAvatar = getPartnerAvatar(conv);
                const isSelected = activeConversation?.id === conv.id;

                return (
                  <div
                    key={conv.id}
                    onClick={() => {
                      setActiveConversationId(conv.id);
                      markConversationRead(conv.id);
                      setMobileChatOpen(true);
                    }}
                    className={`p-3.5 flex items-start gap-3 cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-[#123B6D]/5 dark:bg-amber-400/10'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <img
                      src={partnerAvatar || DEFAULT_AVATAR_URL}
                      alt={partnerName}
                      referrerPolicy="no-referrer"
                      onError={handleImageFallback(DEFAULT_AVATAR_URL)}
                      className="w-10 h-10 rounded-full object-cover shrink-0 ring-1 ring-slate-200 dark:ring-slate-700"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {partnerName}
                        </h4>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {new Date(conv.lastMessageTimestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                        {conv.opportunityType && (
                          <span className="text-[9px] font-black uppercase bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 px-1.5 py-0.2 rounded">
                            {conv.opportunityType}
                          </span>
                        )}
                        {conv.projectTitle && (
                          <p className="text-[10px] text-[#123B6D] dark:text-[#F3D77A] font-semibold truncate flex items-center gap-1">
                            <Briefcase className="w-2.5 h-2.5" />
                            <span className="truncate">{conv.projectTitle}</span>
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between gap-2 mt-0.5">
                        <p className="text-xs text-slate-500 truncate font-ethiopic">
                          {conv.lastMessage}
                        </p>
                        {(conv.unreadCount || 0) > 0 && (
                          <span className="px-1.5 py-0.2 rounded-full bg-rose-600 text-white text-[9px] font-black shrink-0">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-xs text-slate-400">
                {language === 'am' ? 'ምንም ውይይት የለም' : 'No active conversations'}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANE: ACTIVE CHAT THREAD */}
        {activeConversation ? (
          <div
            className={`flex-1 flex flex-col bg-[#F8FAFC] dark:bg-slate-950 ${
              !mobileChatOpen ? 'hidden md:flex' : 'flex'
            }`}
          >
            {/* Chat Top Bar */}
            <div className="bg-white dark:bg-slate-900 px-6 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={() => setMobileChatOpen(false)}
                  className="md:hidden p-1 text-slate-500 hover:text-slate-800"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <img
                  src={getPartnerAvatar(activeConversation) || DEFAULT_AVATAR_URL}
                  alt="Partner"
                  referrerPolicy="no-referrer"
                  onError={handleImageFallback(DEFAULT_AVATAR_URL)}
                  className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                />
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {getPartnerName(activeConversation)}
                  </h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    {activeConversation.opportunityType && (
                      <span className="text-[9px] font-black uppercase bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded">
                        {activeConversation.opportunityType}
                      </span>
                    )}
                    {activeConversation.projectTitle && (
                      <span className="text-[11px] text-[#123B6D] dark:text-[#F3D77A] font-medium truncate">
                        Ref: {activeConversation.projectTitle}
                      </span>
                    )}
                    {activeConversation.budgetOrPrice && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                        {activeConversation.budgetOrPrice.toLocaleString()} ETB
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-400 shrink-0">
                <button
                  onClick={() => setShowReportModal(true)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                  title="Report Conversation"
                >
                  <Flag className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#16845B]" />
                  <span className="hidden sm:inline">Realtime</span>
                </div>
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
              {activeMessages.map((msg) => {
                const isMe = msg.senderId === currentUser?.userId;
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm shadow-2xs font-ethiopic ${
                        isMe
                          ? 'bg-[#123B6D] text-white rounded-tr-xs'
                          : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-tl-xs'
                      }`}
                    >
                      <p className="leading-relaxed whitespace-pre-line">{msg.content}</p>
                      <span
                        className={`block text-[10px] text-right mt-1 ${
                          isMe ? 'text-slate-300' : 'text-slate-400'
                        }`}
                      >
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input Bar */}
            <form
              onSubmit={handleSend}
              className="bg-white dark:bg-slate-900 p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={language === 'am' ? 'መልእክት ይጻፉ...' : 'Type a message...'}
                className="flex-1 px-4 py-2.5 bg-[#F8FAFC] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#123B6D]/20 focus:border-[#123B6D]"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="bg-[#123B6D] hover:bg-[#08294F] text-white p-2.5 sm:px-4 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer disabled:opacity-40 flex items-center gap-1.5"
              >
                <Send className="w-4 h-4 text-[#D4A72C]" />
                <span className="hidden sm:inline">Send</span>
              </button>
            </form>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400 text-xs">
            Select a conversation to start chatting
          </div>
        )}
      </div>

      {/* Report Chat Modal */}
      {showReportModal && activeConversation && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs"
          onClick={() => setShowReportModal(false)}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-rose-700 flex items-center gap-2 font-ethiopic">
                <AlertTriangle className="w-4 h-4" />
                <span>{language === 'am' ? 'ውይይቱን ሪፖርት አድርግ' : 'Report Conversation'}</span>
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
              <form onSubmit={handleReportChat} className="space-y-3 font-ethiopic">
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs bg-white dark:bg-slate-800"
                >
                  <option value="አግባብ ያልሆነ መልእክት ወይም ማጭበርበር (Abuse / Scam)">
                    አግባብ ያልሆነ መልእክት ወይም ማጭበርበር (Abuse / Scam)
                  </option>
                  <option value="የደላላ ጥያቄ (Broker solicitation)">
                    የደላላ ጥያቄ (Broker solicitation)
                  </option>
                </select>
                <textarea
                  rows={3}
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  placeholder={language === 'am' ? 'ዝርዝር...' : 'Details...'}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs bg-white dark:bg-slate-800"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  {language === 'am' ? 'ሪፖርቱን ላክ' : 'Submit Report'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
