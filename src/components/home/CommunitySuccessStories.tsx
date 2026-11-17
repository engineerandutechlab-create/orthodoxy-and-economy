import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Handshake, 
  Briefcase, 
  Building2, 
  Users, 
  MapPin, 
  PlusCircle, 
  Heart, 
  Share2, 
  Copy, 
  Check, 
  X, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight,
  Send,
  MessageSquare,
  Award,
  Church,
  Search,
  Filter
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SuccessStory, SuccessStoryCategory } from '../../types';
import { VerificationBadge } from '../common/Badge';
import { DEFAULT_AVATAR_URL, handleImageFallback } from '../../constants/assets';

export const CommunitySuccessStories: React.FC = () => {
  const {
    language,
    currentUser,
    successStories: stories,
    addSuccessStory,
    toggleStoryBlessing,
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form states for submitting new success story
  const [authorName, setAuthorName] = useState(currentUser?.fullName || '');
  const [authorSpiritualName, setAuthorSpiritualName] = useState('');
  const [authorRole, setAuthorRole] = useState(currentUser?.profession || '');
  const [partnerName, setPartnerName] = useState('');
  const [partnerRole, setPartnerRole] = useState('');
  const [category, setCategory] = useState<SuccessStoryCategory>('found_job');
  const [storyTitle, setStoryTitle] = useState('');
  const [storyDetails, setStoryDetails] = useState('');
  const [location, setLocation] = useState(currentUser?.location || 'አዲስ አበባ');
  const [parish, setParish] = useState(currentUser?.parishName || '');
  const [outcomeMetric, setOutcomeMetric] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);

  const currentUid = currentUser?.userId || 'guest_story_user';

  const handleBlessedToggle = async (storyId: string) => {
    await toggleStoryBlessing(storyId);
  };

  const getTelegramShareUrl = (story: SuccessStory) => {
    const text = encodeURIComponent(
      `† **የኦርቶዶክሳውያን የስኬት ምስክርነት** †\n\n📌 **${story.titleAm}**\n\n"${story.storyAm}"\n\n👤 አቅራቢ፦ ${story.userName} (${story.userRoleAm})\n🤝 አጋር/ቀጣሪ፦ ${story.partnerName}\n📍 ቦታ፦ ${story.location}\n\n✝️ የኦርቶዶክሳውያን የሥራና የንግድ ትስስር መድረክ`
    );
    return `https://t.me/share/url?url=https://orthodoxyandeconomy.et&text=${text}`;
  };

  const handleCopy = (story: SuccessStory) => {
    const text = `† የስኬት ምስክርነት፦ "${story.titleAm}"\n\n${story.storyAm}\n\nአቅራቢ፦ ${story.userName} ↔ ${story.partnerName}\n\nየኦርቶዶክሳውያን የሥራና የንግድ ትስስር መድረክ — https://orthodoxyandeconomy.et`;
    try {
      navigator.clipboard?.writeText(text);
    } catch {
      // Clipboard fallback blocked in iframe
    }
    setCopiedId(story.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storyTitle.trim() || !storyDetails.trim() || !partnerName.trim()) return;

    const categoryNames: Record<SuccessStoryCategory, string> = {
      found_job: 'ሥራ አገኘሁ (Found a Job)',
      found_partner: 'የንግድ አጋር አገኘሁ (Found Business Partner)',
      hired_talent: 'ባለሙያ ቀጠርን (Hired Talent)',
      joint_venture: 'የጋራ ትስስር (Joint Venture)',
      procured_supplies: 'ምርት አቀረብን/ገዛን (Supplies Procured)',
    };

    await addSuccessStory({
      userName: authorName.trim() || (language === 'am' ? 'ምዕመን' : 'Community Member'),
      spiritualName: authorSpiritualName.trim() || undefined,
      userRole: authorRole.trim() || (language === 'am' ? 'የማኅበረሰብ አባል' : 'Member'),
      partnerName: partnerName.trim(),
      partnerRole: partnerRole.trim() || undefined,
      category,
      categoryAm: categoryNames[category],
      title: storyTitle.trim(),
      story: storyDetails.trim(),
      location: location.trim() || 'አዲስ አበባ',
      parishName: parish.trim() || undefined,
      outcomeMetric: outcomeMetric.trim() || undefined,
    });

    setFormSuccess(true);
    setTimeout(() => {
      setFormSuccess(false);
      setShowShareModal(false);
      setStoryTitle('');
      setStoryDetails('');
      setPartnerName('');
      setPartnerRole('');
      setOutcomeMetric('');
    }, 1200);
  };

  const categories = [
    { id: 'all', labelAm: 'ሁሉም ታሪኮች', labelEn: 'All Stories', icon: Sparkles },
    { id: 'found_job', labelAm: '💼 ሥራ ያገኙ', labelEn: 'Found Jobs', icon: Briefcase },
    { id: 'found_partner', labelAm: '🤝 የንግድ አጋር ያገኙ', labelEn: 'Found Partners', icon: Handshake },
    { id: 'hired_talent', labelAm: '👥 ባለሙያ የቀጠሩ', labelEn: 'Hired Talent', icon: Users },
    { id: 'joint_venture', labelAm: '🏢 የጋራ ፕሮጀክት', labelEn: 'Joint Ventures', icon: Building2 },
    { id: 'procured_supplies', labelAm: '📦 ምርት ያቀረቡ/የገዙ', labelEn: 'Procured Goods', icon: Award },
  ];

  const filteredStories = stories.filter(s => {
    const matchCat = selectedCategory === 'all' || s.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchSearch = !q || 
      s.titleAm.toLowerCase().includes(q) || 
      s.storyAm.toLowerCase().includes(q) || 
      s.userName.toLowerCase().includes(q) || 
      s.partnerName.toLowerCase().includes(q) ||
      (s.location && s.location.toLowerCase().includes(q));
    return matchCat && matchSearch;
  });

  return (
    <section className="py-14 bg-gradient-to-b from-white via-slate-50 to-white border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Liturgical Modern Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#03201B] via-[#08294F] to-[#1E1138] text-white p-6 sm:p-10 shadow-xl border border-amber-300/30">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 rounded-full bg-[#D4A72C]/15 blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#FDE047] text-xs font-bold">
                <span>†</span>
                <span>{language === 'am' ? 'የማኅበረሰብ ምስክርነቶችና አጋርነቶች' : 'Community Testimonials & Partnerships'}</span>
              </div>

              <h2 className="font-ethiopic text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight">
                {language === 'am' 
                  ? 'በእምነትና በታማኝነት የተሳኩ የሥራና የንግድ አጋርነቶች' 
                  : 'Real Stories: Jobs Found & Trusted Business Partnerships Formed'}
              </h2>

              <p className="font-ethiopic text-xs sm:text-sm text-sky-100/90 leading-relaxed">
                «ማንም ለራሱ ብቻ አይፈልግ፥ ነገር ግን ለእያንዳንዱ ሰው የሚበጀውን ደግሞ ይፈልግ።» (፩ ቆሮ ፲፥፳፬) — ምዕመናን በመድረኩ አማካኝነት ያገኟቸውን እውነተኛ የሥራ ዕድሎች፣ ታማኝ የንግድ አጋሮች እና የጋራ ፕሮጀክቶች ያንብቡ።
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <button
                onClick={() => setShowShareModal(true)}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#D4A72C] to-[#e6b93b] hover:from-[#c29623] hover:to-[#d4a72c] text-[#08294F] font-extrabold text-xs sm:text-sm shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all font-ethiopic"
              >
                <PlusCircle className="w-4 h-4 text-[#08294F]" />
                <span>{language === 'am' ? 'የስኬት ታሪክዎን ያጋሩ' : 'Share Your Story'}</span>
              </button>
            </div>
          </div>

          {/* Quick Filter Bar */}
          <div className="relative z-10 mt-8 pt-6 border-t border-white/10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            
            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {categories.map(c => {
                const Icon = c.icon;
                const isSelected = selectedCategory === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCategory(c.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer font-ethiopic flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#FDE047] text-[#08294F] shadow-xs'
                        : 'bg-white/10 text-slate-200 hover:bg-white/20'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-[#08294F]' : 'text-amber-300'}`} />
                    <span>{language === 'am' ? c.labelAm : c.labelEn}</span>
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="relative min-w-[220px]">
              <Search className="w-3.5 h-3.5 text-slate-300 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={language === 'am' ? 'በስም ወይም በርእስ ፈልግ...' : 'Search stories...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white/10 border border-white/20 text-xs text-white placeholder-slate-300 outline-none focus:ring-1 focus:ring-[#FDE047] font-ethiopic"
              />
            </div>

          </div>
        </div>

        {/* Stories Grid */}
        {filteredStories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStories.map((story) => {
              const isBlessed = Boolean(story.blessedBy?.includes(currentUid));

              return (
                <div
                  key={story.id}
                  className="bg-white rounded-3xl p-6 border border-slate-200 hover:border-[#123B6D]/40 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group space-y-4 relative overflow-hidden"
                >
                  {/* Top accent badge */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold font-ethiopic border border-slate-200">
                      <span>{story.categoryAm}</span>
                    </span>

                    {story.outcomeMetricAm && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-extrabold font-ethiopic border border-emerald-200">
                        <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                        <span>{story.outcomeMetricAm}</span>
                      </span>
                    )}
                  </div>

                  {/* Dual Verified Profile Header: User <-> Partner */}
                  <div className="bg-gradient-to-r from-slate-50 to-purple-50/40 p-3.5 rounded-2xl border border-slate-200/80 space-y-2.5">
                    
                    {/* User Info */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="relative shrink-0">
                          <img
                            src={story.userAvatar || DEFAULT_AVATAR_URL}
                            alt={story.userName}
                            referrerPolicy="no-referrer"
                            onError={handleImageFallback(DEFAULT_AVATAR_URL)}
                            className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-xs"
                          />
                          {story.isVerified && (
                            <span 
                              title="የተረጋገጠ ተጠቃሚ (Verified Community Member)"
                              className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#123B6D] text-white flex items-center justify-center border-2 border-white shadow-xs"
                            >
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-extrabold text-slate-900 truncate font-ethiopic">
                              {story.userName}
                            </span>
                            {story.isVerified && (
                              <VerificationBadge 
                                type="user" 
                                size="xs" 
                                label={language === 'am' ? 'የተረጋገጠ' : 'Verified'}
                                entityName={story.userName}
                                entityAvatar={story.userAvatar}
                              />
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 truncate font-ethiopic">
                            {story.userRoleAm}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Connecting Link */}
                    <div className="flex items-center gap-2 px-1 text-[10px] text-[#123B6D] font-bold font-ethiopic">
                      <Handshake className="w-3.5 h-3.5 text-[#D4A72C] shrink-0" />
                      <span className="text-slate-400">ከ... ጋር የተሳሰረ</span>
                      <span className="truncate text-slate-800">{story.partnerName}</span>
                      {story.isPartnerVerified && (
                        <span 
                          title="የተረጋገጠ አጋር (Verified Partner)"
                          className="w-3.5 h-3.5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0"
                        >
                          <Check className="w-2 h-2 stroke-[3]" />
                        </span>
                      )}
                    </div>

                  </div>

                  {/* Story Title & Content */}
                  <div className="space-y-2 flex-1">
                    <h3 className="font-ethiopic text-sm sm:text-base font-bold text-slate-900 group-hover:text-[#123B6D] transition-colors leading-snug">
                      "{language === 'am' ? story.titleAm : story.titleEn}"
                    </h3>

                    <p className="font-ethiopic text-xs text-slate-600 line-clamp-4 leading-relaxed">
                      {language === 'am' ? story.storyAm : story.storyEn}
                    </p>
                  </div>

                  {/* Location & Parish */}
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100 font-ethiopic">
                    <div className="flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{story.location}</span>
                      {story.parish && (
                        <>
                          <span className="text-slate-300">·</span>
                          <span className="truncate text-slate-600">{story.parish}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Card Bottom: Praise Button + Share + Copy */}
                  <div className="flex items-center justify-between pt-1">
                    
                    {/* Praise / Blessed Button */}
                    <button
                      onClick={() => handleBlessedToggle(story.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold font-ethiopic flex items-center gap-1.5 transition-all cursor-pointer border ${
                        isBlessed
                          ? 'bg-amber-50 text-amber-900 border-amber-300 shadow-2xs'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      <Sparkles className={`w-3.5 h-3.5 ${isBlessed ? 'text-amber-500 fill-amber-500' : 'text-slate-400'}`} />
                      <span>{language === 'am' ? 'እግዚአብሔር ይመስገን' : 'Praise God'}</span>
                      <span className="font-mono text-[11px] font-extrabold ml-0.5">({story.blessedCount})</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      {/* Copy Quote */}
                      <button
                        onClick={() => handleCopy(story)}
                        title={language === 'am' ? 'ቅጂ ውሰድ' : 'Copy Story'}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-colors cursor-pointer"
                      >
                        {copiedId === story.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {/* Telegram Share */}
                      <a
                        href={getTelegramShareUrl(story)}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={language === 'am' ? 'በቴሌግራም አጋራ' : 'Share on Telegram'}
                        className="p-1.5 rounded-lg text-[#0088cc] hover:bg-[#0088cc]/10 border border-[#0088cc]/20 transition-colors inline-flex items-center justify-center"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </a>
                    </div>

                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
            <Handshake className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="font-ethiopic text-lg font-bold text-slate-700">
              {language === 'am' ? 'ምንም ዓይነት የስኬት ታሪክ አልተገኘም' : 'No success stories found'}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto font-ethiopic">
              {language === 'am' ? 'እባክዎ የተለየ ዘርፍ ይምረጡ ወይም የመጀመሪያውን የስኬት ታሪክ እርስዎ ያጋሩ!' : 'Try selecting another category or be the first to share your experience!'}
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="bg-[#123B6D] text-white px-4 py-2 rounded-xl text-xs font-semibold mt-2 cursor-pointer font-ethiopic"
            >
              {language === 'am' ? 'ሁሉንም አሳይ' : 'Show All Stories'}
            </button>
          </div>
        )}

      </div>

      {/* SHARE YOUR SUCCESS STORY MODAL */}
      {showShareModal && (
        <div 
          className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in"
          onClick={() => setShowShareModal(false)}
        >
          <div 
            className="w-full max-w-xl rounded-3xl bg-white p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-4 max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#08294F] to-[#16845B] text-[#FDE047] flex items-center justify-center font-bold text-lg shadow-xs">
                  🤝
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-ethiopic">
                    {language === 'am' ? 'የስኬት ታሪክዎንና ምስክርነትዎን ያጋሩ' : 'Share Your Success Story'}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-ethiopic">
                    {language === 'am' ? 'በዚህ መድረክ ያገኙትን ሥራ ወይም ታማኝ የንግድ አጋር ለማኅበረሰቡ ያጋሩ' : 'Inspire others with your real job or business match on the platform'}
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setShowShareModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formSuccess ? (
              <div className="p-8 text-center space-y-2 bg-emerald-50 rounded-2xl border border-emerald-200 animate-in zoom-in-95">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="text-base font-bold text-emerald-900 font-ethiopic">
                  {language === 'am' ? 'የስኬት ታሪክዎ በክብር ተመዝግቧል!' : 'Your success story has been published!'}
                </h4>
                <p className="text-xs text-emerald-700 font-ethiopic">
                  {language === 'am' ? 'እግዚአብሔር ሥራችሁን ይባርክ፤ ምስክርነታችሁ ለሌሎች ምዕመናን ብርታት ይሆናል።' : 'May the Lord bless your endeavors. Your story inspires our community.'}
                </p>
              </div>
            ) : (
              <form onSubmit={handleCreateStory} className="space-y-3.5 font-ethiopic">
                
                {/* Author Name & Spiritual Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      {language === 'am' ? 'የእርስዎ ሙሉ ስም' : 'Your Full Name'} *
                    </label>
                    <input
                      type="text"
                      required
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      placeholder="e.g. ዳዊት መንግሥቱ"
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs outline-none focus:ring-1 focus:ring-[#123B6D]"
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
                      placeholder="e.g. ወልደ ሰማዕት / ወለተ ማርያም"
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs outline-none focus:ring-1 focus:ring-[#123B6D]"
                    />
                  </div>
                </div>

                {/* Author Role */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {language === 'am' ? 'የእርስዎ ሙያ / ኃላፊነት' : 'Your Profession / Role'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={authorRole}
                    onChange={(e) => setAuthorRole(e.target.value)}
                    placeholder="e.g. የሶፍትዌር መሃንዲስ / የንግድ ሥራ አስኪያጅ"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs outline-none focus:ring-1 focus:ring-[#123B6D]"
                  />
                </div>

                {/* Partner Details */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <span className="text-xs font-extrabold text-[#08294F] block">
                    {language === 'am' ? 'ያገኙት አጋር ወይም ቀጣሪ ድርጅት መረጃ' : 'Matched Partner or Employer Details'}
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        {language === 'am' ? 'የአጋሩ / የቀጣሪው ስም' : 'Partner / Employer Name'} *
                      </label>
                      <input
                        type="text"
                        required
                        value={partnerName}
                        onChange={(e) => setPartnerName(e.target.value)}
                        placeholder="e.g. Zion Digital Technologies / Selam Timber"
                        className="w-full p-2.5 rounded-xl border border-slate-300 text-xs outline-none focus:ring-1 focus:ring-[#123B6D] bg-white"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        {language === 'am' ? 'የአጋሩ ዘርፍ' : 'Partner Role / Type'}
                      </label>
                      <input
                        type="text"
                        value={partnerRole}
                        onChange={(e) => setPartnerRole(e.target.value)}
                        placeholder="e.g. ቀጣሪ ድርጅት / የጅምላ አቅራቢ"
                        className="w-full p-2.5 rounded-xl border border-slate-300 text-xs outline-none focus:ring-1 focus:ring-[#123B6D] bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Category & Outcome Highlight */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      {language === 'am' ? 'የስኬቱ ዓይነት' : 'Success Category'} *
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as any)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs outline-none focus:ring-1 focus:ring-[#123B6D] bg-white font-semibold"
                    >
                      <option value="found_job">💼 ሥራ አገኘሁ (Found a Job)</option>
                      <option value="found_partner">🤝 የንግድ አጋር አገኘሁ (Found Business Partner)</option>
                      <option value="hired_talent">👥 ባለሙያ ቀጠርን (Hired Top Talent)</option>
                      <option value="joint_venture">🏢 የጋራ ፕሮጀክት (Joint Venture & Project)</option>
                      <option value="procured_supplies">📦 ምርት አቀረብን/ገዛን (Supplies Procured)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      {language === 'am' ? 'ዋና ውጤት (ባጅ)' : 'Key Metric / Outcome Highlight'}
                    </label>
                    <input
                      type="text"
                      value={outcomeMetric}
                      onChange={(e) => setOutcomeMetric(e.target.value)}
                      placeholder="e.g. በ 3 ቀናት ውስጥ ቅጥር ተፈጸመ"
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs outline-none focus:ring-1 focus:ring-[#123B6D]"
                    />
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {language === 'am' ? 'የስኬት ታሪኩ አርእስት' : 'Story Title'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={storyTitle}
                    onChange={(e) => setStoryTitle(e.target.value)}
                    placeholder={language === 'am' ? 'ለምሳሌ፦ በ 3 ቀናት ውስጥ የሲኒየር ሪአክት ዲቨሎፐርነት ሥራ አገኘሁ...' : 'e.g. Landed a dream role with an ethical firm in 3 days...'}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs outline-none focus:ring-1 focus:ring-[#123B6D]"
                  />
                </div>

                {/* Detailed Story */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {language === 'am' ? 'ዝርዝር ምስክርነት' : 'Your Story & Testimony'} *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={storyDetails}
                    onChange={(e) => setStoryDetails(e.target.value)}
                    placeholder={language === 'am' ? 'እንዴት እንደተገናኛችሁ፣ ያለ ደላላ የታማኝነት ግንኙነት እንዴት እንደተፈጠረ እና የተገኘውን ውጤት ያብራሩ...' : 'Describe how you connected, the trust built without brokers, and your ongoing collaboration...'}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs outline-none focus:ring-1 focus:ring-[#123B6D] resize-none"
                  />
                </div>

                {/* Location & Parish */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      {language === 'am' ? 'አካባቢ / ከተማ' : 'City / Location'}
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. አዲስ አበባ (ቦሌ) / ባሕር ዳር"
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs outline-none focus:ring-1 focus:ring-[#123B6D]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      {language === 'am' ? 'አጥቢያ ቤተክርስቲያን (አማራጭ)' : 'Parish Church'}
                    </label>
                    <input
                      type="text"
                      value={parish}
                      onChange={(e) => setParish(e.target.value)}
                      placeholder="e.g. ቦሌ መድኃኔዓለም / ደብረ ሰላም ቅዱስ እስጢፋኖስ"
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs outline-none focus:ring-1 focus:ring-[#123B6D]"
                    />
                  </div>
                </div>

                {/* Submit button */}
                <div className="pt-2 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowShareModal(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    {language === 'am' ? 'ተመለስ' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#08294F] to-[#16845B] hover:brightness-110 text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#FDE047]" />
                    <span>{language === 'am' ? 'ምስክርነቴን አትም' : 'Publish My Story'}</span>
                  </button>
                </div>

              </form>
            )}

          </div>
        </div>
      )}

    </section>
  );
};
