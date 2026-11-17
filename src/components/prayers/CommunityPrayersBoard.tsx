import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Sparkles, 
  MessageCircle, 
  Send, 
  PlusCircle, 
  Filter, 
  MapPin, 
  Clock, 
  Share2, 
  Copy, 
  Check, 
  X, 
  Church, 
  ShieldCheck, 
  Search,
  Flame,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PrayerRequest } from '../../types';
import { formatExactPostedDateTime } from '../../utils/dateTime';

export const CommunityPrayersBoard: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const {
    language,
    currentUser,
    setActiveTab,
    prayers,
    prayerComments,
    addPrayerRequest,
    togglePrayerAmen,
    addPrayerComment,
    openModal,
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [expandedCommentsId, setExpandedCommentsId] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState<{ [id: string]: string }>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form states for new prayer request
  const [authorName, setAuthorName] = useState(currentUser?.fullName || '');
  const [authorSpiritualName, setAuthorSpiritualName] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [titleAm, setTitleAm] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<PrayerRequest['category']>('work_business');
  const [location, setLocation] = useState(currentUser?.location || 'አዲስ አበባ');
  const [parish, setParish] = useState(currentUser?.parishName || '');
  const [formSuccess, setFormSuccess] = useState(false);

  const currentUid = currentUser?.userId || 'guest_prayer_user';

  const handlePray = async (id: string) => {
    if (!currentUser) {
      openModal('auth');
      return;
    }
    try {
      await togglePrayerAmen(id);
    } catch (err) {
      console.warn('Prayer toggle notice:', err);
    }
  };

  const handleAddComment = async (prayerId: string) => {
    const text = commentInput[prayerId]?.trim();
    if (!text) return;
    if (!currentUser) {
      openModal('auth');
      return;
    }

    setCommentInput((prev) => ({ ...prev, [prayerId]: '' }));
    try {
      await addPrayerComment(prayerId, text, authorSpiritualName || undefined);
    } catch (err) {
      console.warn('Prayer comment notice:', err);
    }
  };

  const handleCreatePrayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      openModal('auth');
      return;
    }
    if (!titleAm.trim() || !description.trim()) return;

    const categoryMap: Record<PrayerRequest['category'], string> = {
      work_business: 'ሥራና ንግድ',
      health_healing: 'ጤናና ፈውስ',
      family_peace: 'ቤተሰብና ትዳር',
      education_exam: 'ትምህርትና ሥራ ፍለጋ',
      travel_pilgrimage: 'መንገድና ንግሥ',
      thanksgiving: 'ምስጋና',
      general: 'አጠቃላይ ጸሎት',
    };

    await addPrayerRequest({
      authorName: authorName || currentUser?.fullName || 'ምዕመን',
      spiritualName: authorSpiritualName.trim() || undefined,
      isAnonymous,
      title: titleAm.trim(),
      description: description.trim(),
      category,
      categoryAm: categoryMap[category],
      location: location.trim() || 'ኢትዮጵያ',
      parishName: parish.trim() || undefined,
    });

    setFormSuccess(true);
    setTimeout(() => {
      setFormSuccess(false);
      setShowCreateModal(false);
      setTitleAm('');
      setDescription('');
      setParish('');
    }, 1200);
  };

  const handleCopy = (prayer: PrayerRequest) => {
    const text = `† የጸሎት ጥያቄ፦ "${prayer.titleAm}"\n\n${prayer.description}\n\nአቅራቢ፦ ${prayer.authorName}${prayer.parish ? ` (${prayer.parish})` : ''}\n\n"እርስ በርሳችሁ በጸሎት ተረዳዱ" — https://orthodoxyandeconomy.et`;
    try {
      navigator.clipboard?.writeText(text);
    } catch {
      // Clipboard fallback ignored in restricted contexts
    }
    setCopiedId(prayer.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getTelegramShareUrl = (prayer: PrayerRequest) => {
    const text = encodeURIComponent(
      `† **የማኅበረሰብ የጸሎት ጥያቄ** †\n\n📌 **${prayer.titleAm}**\n\n"${prayer.description}"\n\n🙏 አቅራቢ፦ ${prayer.authorName}\n⛪ አጥቢያ፦ ${prayer.parish || 'የኦርቶዶክስ ተዋሕዶ ቤተክርስቲያን'}\n\n✝️ የኦርቶዶክሳውያን የሥራና የንግድ ትስስር መድረክ`
    );
    return `https://t.me/share/url?url=https://orthodoxyandeconomy.et&text=${text}`;
  };

  const categories = [
    { id: 'all', labelAm: 'ሁሉም ጸሎቶች', labelEn: 'All Prayers' },
    { id: 'work_business', labelAm: 'ሥራና ንግድ', labelEn: 'Work & Business' },
    { id: 'health_healing', labelAm: 'ጤናና ፈውስ', labelEn: 'Health & Healing' },
    { id: 'family_peace', labelAm: 'ቤተሰብና ትዳር', labelEn: 'Family & Marriage' },
    { id: 'education_exam', labelAm: 'ትምህርትና ሥራ ፍለጋ', labelEn: 'Education & Career' },
    { id: 'thanksgiving', labelAm: 'ምስጋና', labelEn: 'Thanksgiving' },
  ];

  const filteredPrayers = prayers.filter(p => {
    const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesSearch = !searchQuery.trim() || 
      p.titleAm.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.authorName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const displayList = compact ? filteredPrayers.slice(0, 3) : filteredPrayers;

  return (
    <div className="space-y-6">
      
      {/* Liturgical Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#06182B] via-[#08294F] to-[#032B25] text-white p-6 sm:p-8 shadow-xl border border-[#D4A72C]/30">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 rounded-full bg-[#D4A72C]/10 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#FDE047] text-xs font-semibold">
              <span>†</span>
              <span>{language === 'am' ? 'የማኅበረሰብ ጸሎትና ምልጃ' : 'Community Prayer & Intercession'}</span>
            </div>

            <h2 className="font-ethiopic text-xl sm:text-2xl lg:text-3xl font-extrabold text-white leading-tight">
              {language === 'am' ? 'የማኅበረሰቡ የጸሎትና የምልጃ ማዕከል' : 'Orthodox Community Prayer Requests Board'}
            </h2>

            <p className="font-ethiopic text-xs sm:text-sm text-sky-100/90 leading-relaxed">
              «እርስ በርሳችሁ በጸሎት ተረዳዱ፤ እርስ በርሳችሁም ተጸላለዩ፤ የጻድቅ ሰው ጸሎት በሥራዋ እጅግ ኃይል ታደርጋለች።» (ያዕቆብ ፭፥፲፮)
            </p>
          </div>

          <button
            onClick={() => {
              if (!currentUser) {
                openModal('auth');
                return;
              }
              setShowCreateModal(true);
            }}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#D4A72C] to-[#e6b93b] hover:from-[#c29623] hover:to-[#d4a72c] text-[#08294F] font-bold text-xs sm:text-sm shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all shrink-0 font-ethiopic"
          >
            <PlusCircle className="w-4 h-4 text-[#08294F]" />
            <span>{language === 'am' ? 'የጸሎት ጥያቄ አቅርብ' : 'Post Prayer Request'}</span>
          </button>
        </div>

        {/* Filter and Search Bar */}
        {!compact && (
          <div className="relative z-10 mt-6 pt-5 border-t border-white/10 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            {/* Category tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {categories.map(c => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer font-ethiopic ${
                    selectedCategory === c.id
                      ? 'bg-[#FDE047] text-[#08294F] font-bold shadow-xs'
                      : 'bg-white/10 text-slate-200 hover:bg-white/20'
                  }`}
                >
                  {language === 'am' ? c.labelAm : c.labelEn}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative min-w-[220px]">
              <Search className="w-3.5 h-3.5 text-slate-300 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={language === 'am' ? 'በስም ወይም በርእስ ፈልግ...' : 'Search prayer requests...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white/10 border border-white/15 text-xs text-white placeholder:text-slate-300 outline-none focus:bg-white/20 font-ethiopic"
              />
            </div>
          </div>
        )}
      </div>

      {/* Prayers List */}
      <div className="space-y-4">
        {displayList.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 space-y-3">
            <Church className="w-12 h-12 text-slate-300 mx-auto" />
            <h4 className="font-bold text-slate-700 text-sm font-ethiopic">
              {language === 'am' ? 'ምንም ዓይነት የጸሎት ጥያቄ አልተገኘም' : 'No prayer requests found'}
            </h4>
            <p className="text-xs text-slate-500 font-ethiopic">
              {language === 'am' ? 'የመጀመሪያውን የጸሎት ጥያቄ በማቅረብ ማኅበረሰቡ እንዲጸልይልዎት ያድርጉ።' : 'Be the first to submit a prayer request for community intercession.'}
            </p>
          </div>
        ) : (
          displayList.map((prayer) => {
            const hasPrayed = Boolean(prayer.amenedBy?.includes(currentUid));
            const liveComments = prayerComments[prayer.id] || prayer.comments || [];
            const isCommentsOpen = expandedCommentsId === prayer.id;

            return (
              <div 
                key={prayer.id}
                className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all space-y-4 group"
              >
                {/* Prayer Card Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#08294F] to-[#16845B] text-[#FDE047] flex items-center justify-center font-bold text-sm shadow-xs shrink-0 font-serif">
                      †
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 font-ethiopic">
                          {prayer.authorName}
                        </h4>
                        {prayer.authorSpiritualName && (
                          <span className="text-[11px] font-semibold text-[#123B6D] bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-full font-ethiopic">
                            የክርስትና ስም፦ {prayer.authorSpiritualName}
                          </span>
                        )}
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 font-ethiopic">
                          {prayer.categoryAm}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5 font-ethiopic">
                        {prayer.parish && (
                          <>
                            <Church className="w-3 h-3 text-slate-400" />
                            <span>{prayer.parish}</span>
                            <span>·</span>
                          </>
                        )}
                        {prayer.location && (
                          <>
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span>{prayer.location}</span>
                            <span>·</span>
                          </>
                        )}
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{formatExactPostedDateTime(prayer.createdAt, language)?.fullText || ''}</span>
                      </div>
                    </div>
                  </div>

                  {/* Prayer Counter Pill */}
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold font-ethiopic transition-all ${
                      hasPrayed 
                        ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-xs' 
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      <Flame className={`w-3.5 h-3.5 ${hasPrayed ? 'text-amber-500 fill-amber-500' : 'text-slate-400'}`} />
                      <span>{prayer.prayersCount} {language === 'am' ? 'ጸሎቶች ተደርገዋል' : 'Prayers Offered'}</span>
                    </span>
                  </div>
                </div>

                {/* Prayer Title & Description */}
                <div className="space-y-2">
                  <h3 className="font-ethiopic text-sm sm:text-base font-extrabold text-[#08294F] leading-snug">
                    {prayer.titleAm}
                  </h3>
                  <p className="font-ethiopic text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                    {prayer.description}
                  </p>
                </div>

                {/* Action Bar: Pray Button, Comments Toggle, Share */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs">
                  
                  <div className="flex items-center gap-2">
                    {/* Primary Pray Action Button */}
                    <button
                      onClick={() => handlePray(prayer.id)}
                      className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 cursor-pointer font-ethiopic ${
                        hasPrayed
                          ? 'bg-amber-400 hover:bg-amber-500 text-slate-950 shadow-sm'
                          : 'bg-gradient-to-r from-[#08294F] to-[#123B6D] hover:from-[#06182B] hover:to-[#08294F] text-white shadow-xs'
                      }`}
                    >
                      <Flame className={`w-4 h-4 ${hasPrayed ? 'fill-slate-950 text-slate-950' : 'text-[#FDE047]'}`} />
                      <span>{hasPrayed ? (language === 'am' ? 'አብሬ ጸልያለሁ ✓' : 'Prayed ✓') : (language === 'am' ? 'አብሬ እጸልያለሁ (Pray)' : 'I am Praying')}</span>
                    </button>

                    {/* Toggle Encouragement Comments */}
                    <button
                      onClick={() => setExpandedCommentsId(isCommentsOpen ? null : prayer.id)}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors flex items-center gap-1.5 cursor-pointer font-ethiopic"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-[#123B6D]" />
                      <span>
                        {language === 'am' ? 'የድጋፍ ቃል' : 'Encouragement'} ({liveComments.length || prayer.commentsCount || 0})
                      </span>
                      {isCommentsOpen ? <ChevronUp className="w-3 h-3 ml-0.5" /> : <ChevronDown className="w-3 h-3 ml-0.5" />}
                    </button>
                  </div>

                  {/* Share & Copy */}
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <button
                      onClick={() => handleCopy(prayer)}
                      className="p-2 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                      title={language === 'am' ? 'ጥያቄውን ቅዳ' : 'Copy'}
                    >
                      {copiedId === prayer.id ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>

                    <a
                      href={getTelegramShareUrl(prayer)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-[#0088cc]/10 hover:bg-[#0088cc] text-[#0088cc] hover:text-white transition inline-flex items-center justify-center"
                      title={language === 'am' ? 'በቴሌግራም አጋራ' : 'Share to Telegram'}
                    >
                      <Send className="w-4 h-4" />
                    </a>
                  </div>

                </div>

                {/* Collapsible Spiritual Encouragement Comments */}
                {isCommentsOpen && (
                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-3 animate-in fade-in">
                    
                    {/* List of comments */}
                    {liveComments.length > 0 && (
                      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                        {liveComments.map((c) => (
                          <div key={c.id} className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-bold text-[#123B6D] font-ethiopic">
                                {c.authorName} {c.authorSpiritualName && `(${c.authorSpiritualName})`}
                              </span>
                              <span className="text-slate-400 font-ethiopic">
                                {formatExactPostedDateTime(c.createdAt, language)?.fullText || ''}
                              </span>
                            </div>
                            <p className="text-xs text-slate-700 font-ethiopic leading-relaxed">
                              {c.commentText}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add comment input */}
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder={language === 'am' ? 'የማጽናኛ ወይም የጸሎት ቃል ይጻፉ (ለምሳሌ፦ አሜን! እግዚአብሔር ይርዳችሁ)...' : 'Write a word of prayerful encouragement...'}
                        value={commentInput[prayer.id] || ''}
                        onChange={(e) => setCommentInput({ ...commentInput, [prayer.id]: e.target.value })}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleAddComment(prayer.id); }}
                        className="flex-1 p-2.5 rounded-xl border border-slate-300 text-xs outline-none focus:ring-1 focus:ring-[#123B6D] font-ethiopic bg-white"
                      />
                      <button
                        onClick={() => handleAddComment(prayer.id)}
                        className="px-4 py-2.5 bg-[#123B6D] hover:bg-[#08294F] text-white rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 shrink-0 font-ethiopic"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{language === 'am' ? 'ላክ' : 'Send'}</span>
                      </button>
                    </div>

                  </div>
                )}

              </div>
            );
          })
        )}
      </div>

      {compact && (
        <div className="text-center pt-2">
          <button
            onClick={() => setActiveTab('prayers')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-[#08294F] to-[#16845B] hover:brightness-110 text-white font-bold text-xs sm:text-sm font-ethiopic shadow-md hover:shadow-lg transition cursor-pointer"
          >
            <span>{language === 'am' ? 'ሁሉንም የጸሎት ጥያቄዎች ይመልከቱ' : 'View All Community Prayer Requests'} ({filteredPrayers.length})</span>
            <ChevronRight className="w-4 h-4 text-[#FDE047]" />
          </button>
        </div>
      )}

      {/* CREATE PRAYER REQUEST MODAL */}
      {showCreateModal && (
        <div 
          className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in"
          onClick={() => setShowCreateModal(false)}
        >
          <div 
            className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#08294F] to-[#16845B] text-[#FDE047] flex items-center justify-center font-bold font-serif text-sm">
                  †
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 font-ethiopic">
                    {language === 'am' ? 'የጸሎት ጥያቄ ማቅረቢያ' : 'Submit Prayer Request'}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-ethiopic">
                    {language === 'am' ? 'ማኅበረሰቡ በጸሎትና በምልጃ አብሯችሁ እንዲቆም' : 'Share your spiritual request with the faithful community'}
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formSuccess ? (
              <div className="p-8 text-center space-y-2 bg-emerald-50 rounded-2xl border border-emerald-200 animate-in zoom-in-95">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="text-sm font-bold text-emerald-900 font-ethiopic">
                  {language === 'am' ? 'የጸሎት ጥያቄዎ በማኅበረሰቡ ሰሌዳ ላይ ተለጥፏል!' : 'Your prayer request has been posted!'}
                </h4>
                <p className="text-xs text-emerald-700 font-ethiopic">
                  {language === 'am' ? 'እግዚአብሔር ጸሎታችሁን ይቀበል፤ ምዕመናን አብረዋችሁ ይጸልያሉ።' : 'May the Lord hear our prayers. The faithful are praying with you.'}
                </p>
              </div>
            ) : (
              <form onSubmit={handleCreatePrayer} className="space-y-3.5 font-ethiopic">
                
                {/* Name & Spiritual Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      {language === 'am' ? 'የመጠሪያ ስም' : 'Your Name'}
                    </label>
                    <input
                      type="text"
                      disabled={isAnonymous}
                      required={!isAnonymous}
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      placeholder="e.g. ዮናስ ታደለ"
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs outline-none focus:ring-1 focus:ring-[#123B6D] disabled:bg-slate-100"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      {language === 'am' ? 'የክርስትና ስም (አማራጭ)' : 'Baptismal / Christian Name'}
                    </label>
                    <input
                      type="text"
                      value={authorSpiritualName}
                      onChange={(e) => setAuthorSpiritualName(e.target.value)}
                      placeholder="e.g. ወልደ ጊዮርጊስ / ወለተ ማርያም"
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs outline-none focus:ring-1 focus:ring-[#123B6D]"
                    />
                  </div>
                </div>

                {/* Anonymous Toggle */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="anon"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="rounded text-[#123B6D] focus:ring-0 cursor-pointer"
                  />
                  <label htmlFor="anon" className="text-xs text-slate-600 cursor-pointer">
                    {language === 'am' ? 'ስሜ እንዳይገለጽ (የማይገለጽ ስም ሆኖ ይለጠፍ)' : 'Post anonymously (hide my name)'}
                  </label>
                </div>

                {/* Category Selection */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {language === 'am' ? 'የጸሎቱ ዘርፍ' : 'Prayer Category'}
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs outline-none focus:ring-1 focus:ring-[#123B6D] bg-white"
                  >
                    <option value="work_business">💼 ሥራና ንግድ (Work, Enterprise & Projects)</option>
                    <option value="health_healing">🩺 ጤናና ፈውስ (Health & Healing)</option>
                    <option value="family_peace">👨‍👩‍👧 ቤተሰብና ትዳር (Family & Marriage Peace)</option>
                    <option value="education_exam">🎓 ትምህርትና ሥራ ፍለጋ (Education & Job Search)</option>
                    <option value="travel_pilgrimage">✈️ መንገድና ንግሥ (Safe Travel & Pilgrimage)</option>
                    <option value="thanksgiving">🙏 ምስጋና (Thanksgiving for Blessing)</option>
                    <option value="general">✝️ አጠቃላይ ጸሎት (General Community Prayer)</option>
                  </select>
                </div>

                {/* Title */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {language === 'am' ? 'የጸሎቱ አርእስት' : 'Prayer Subject / Title'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={language === 'am' ? 'ለምሳሌ፦ ለአዲሱ የንግድ ሥራችን በረከትን እንሻለን...' : 'e.g. Seeking blessings on our new agricultural venture...'}
                    value={titleAm}
                    onChange={(e) => setTitleAm(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs outline-none focus:ring-1 focus:ring-[#123B6D]"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {language === 'am' ? 'ዝርዝር የጸሎት ሐሳብ' : 'Detailed Prayer Need'}
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder={language === 'am' ? 'የገጠመዎትን ሁኔታ፣ የሚሹትን ፈውስ ወይም በረከት በቅንነት ያካፍሉ...' : 'Share what is on your heart for community prayer...'}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs outline-none focus:ring-1 focus:ring-[#123B6D]"
                  />
                </div>

                {/* Parish & Location */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      {language === 'am' ? 'አጥቢያ ቤተክርስቲያን (አማራጭ)' : 'Parish Church (Optional)'}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. ቦሌ መድኃኔዓለም / ደብረ ሲና"
                      value={parish}
                      onChange={(e) => setParish(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs outline-none focus:ring-1 focus:ring-[#123B6D]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      {language === 'am' ? 'ከተማ / አካባቢ' : 'City / Location'}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. አዲስ አበባ"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs outline-none focus:ring-1 focus:ring-[#123B6D]"
                    />
                  </div>
                </div>

                {/* Submit button */}
                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    {language === 'am' ? 'ሰርዝ' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl text-xs font-bold bg-[#16845B] hover:bg-[#126b4a] text-white shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <Flame className="w-4 h-4 text-[#FDE047]" />
                    <span>{language === 'am' ? 'የጸሎት ጥያቄውን ለጥፍ' : 'Post Request'}</span>
                  </button>
                </div>

              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
