import React, { useState, useMemo } from 'react';
import {
  Star,
  CheckCircle2,
  MessageSquare,
  PlusCircle,
  ShieldCheck,
  X,
  Filter,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DEFAULT_AVATAR_URL, handleImageFallback } from '../../constants/assets';
import { formatExactPostedDateTime } from '../../utils/dateTime';

export const ReviewsSection: React.FC<{
  targetTitle?: string;
  targetId?: string;
  targetUserId?: string;
  projectRole?: 'FREELANCER' | 'JOB_POSTER';
  type?: 'general' | 'product' | 'job' | 'service';
}> = ({
  targetTitle = 'ማኅበረሰባዊ ግብይት',
  targetId,
  targetUserId,
  projectRole = 'FREELANCER',
  type = 'general',
}) => {
  const { language, currentUser, reviews: liveReviews, submitReview, openModal } = useApp();
  const [filterRating, setFilterRating] = useState<number | 'all'>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // New review form states
  const [newRating, setNewRating] = useState(5);
  const [newContent, setNewContent] = useState('');
  const [selectedTag, setSelectedTag] = useState('ታማኝ ሻጭ');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedMessage, setSubmittedMessage] = useState(false);

  const scopedReviews = useMemo(() => {
    if (targetUserId && !targetUserId.startsWith('guest_') && targetUserId !== 'general') {
      const matched = liveReviews.filter(
        (r) => r.targetUserId === targetUserId || (targetId && r.targetId === targetId)
      );
      if (matched.length > 0) return matched;
    }
    if (targetId && type !== 'general') {
      return liveReviews.filter((r) => r.targetId === targetId || r.targetUserId === targetId);
    }
    return liveReviews;
  }, [liveReviews, targetUserId, targetId, type]);

  const filteredReviews = useMemo(() => {
    if (filterRating === 'all') return scopedReviews;
    return scopedReviews.filter((r) => Math.round(r.rating) === filterRating);
  }, [scopedReviews, filterRating]);

  const averageRating = useMemo(() => {
    if (scopedReviews.length === 0) return '5.0';
    const sum = scopedReviews.reduce((acc, r) => acc + Number(r.rating || 5), 0);
    return (sum / scopedReviews.length).toFixed(1);
  }, [scopedReviews]);

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;
    if (!currentUser) {
      setShowAddModal(false);
      openModal('auth');
      return;
    }

    setIsSubmitting(true);
    try {
      await submitReview({
        targetUserId: targetUserId || targetId || 'general',
        targetId: targetId || undefined,
        projectTitle: targetTitle,
        projectRole,
        rating: newRating,
        comment: newContent.trim(),
        tags: [selectedTag],
      });

      setSubmittedMessage(true);
      setTimeout(() => {
        setSubmittedMessage(false);
        setShowAddModal(false);
        setNewContent('');
      }, 1200);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Reviews Header & Score Summary */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="text-center p-4 bg-gradient-to-br from-[#08294F] to-[#123B6D] text-white rounded-2xl min-w-[100px] shadow-sm">
              <span className="text-3xl sm:text-4xl font-black block text-[#FDE047]">
                {averageRating}
              </span>
              <div className="flex items-center justify-center gap-0.5 my-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-3.5 h-3.5 ${
                      star <= Math.round(Number(averageRating))
                        ? 'fill-[#FDE047] text-[#FDE047]'
                        : 'text-slate-400'
                    }`}
                  />
                ))}
              </div>
              <span className="text-[10px] text-slate-300 font-mono block">
                {scopedReviews.length} {language === 'am' ? 'ምስክርነቶች' : 'Reviews'}
              </span>
            </div>

            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-ethiopic">
                {language === 'am'
                  ? 'የተረጋገጡ የደንበኞች ምስክርነቶች (Live Reviews)'
                  : 'Verified Community Ratings & Reviews'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-ethiopic">
                {language === 'am'
                  ? 'በቀጥታ ከማኅበረሰብ አባላት የተሰጡ የታማኝነትና የሥራ ጥራት ግምገማዎች (በ Firestore የተቀመጡ)።'
                  : 'Authentic ratings & feedback stored directly in Cloud Firestore.'}
              </p>
              <div className="flex items-center gap-2 pt-1">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>
                    {language === 'am'
                      ? '100% እውነተኛ የማኅበረሰብ ምስክርነት'
                      : '100% Real Firestore Reviews'}
                  </span>
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-[#123B6D] hover:bg-[#08294F] text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer self-start md:self-center"
          >
            <PlusCircle className="w-4 h-4 text-[#FDE047]" />
            <span>{language === 'am' ? 'ምስክርነት / ደረጃ ስጥ' : 'Write a Review'}</span>
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex-wrap">
          <span className="text-xs font-bold text-slate-500 flex items-center gap-1 mr-1">
            <Filter className="w-3 h-3 text-slate-400" />
            <span>{language === 'am' ? 'አጣራ፦' : 'Filter:'}</span>
          </span>
          <button
            type="button"
            onClick={() => setFilterRating('all')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition ${
              filterRating === 'all'
                ? 'bg-[#123B6D] text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            {language === 'am' ? 'ሁሉም (All)' : 'All'}
          </button>
          {[5, 4, 3, 2, 1].map((star) => (
            <button
              type="button"
              key={star}
              onClick={() => setFilterRating(star)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition flex items-center gap-1 ${
                filterRating === star
                  ? 'bg-amber-400 text-slate-900 font-bold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <span>{star}</span>
              <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
            </button>
          ))}
        </div>
      </div>

      {/* Review Cards Grid */}
      <div className="space-y-3.5">
        {filteredReviews.length > 0 ? (
          filteredReviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3 hover:border-slate-300 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={rev.authorAvatar || DEFAULT_AVATAR_URL}
                    alt={rev.authorName}
                    referrerPolicy="no-referrer"
                    onError={handleImageFallback(DEFAULT_AVATAR_URL)}
                    className="w-11 h-11 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                  />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white font-ethiopic">
                        {rev.authorName}
                      </h4>
                      {rev.verifiedBuyer && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/80 flex items-center gap-0.5">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>{language === 'am' ? 'የተረጋገጠ ግብይት' : 'Verified Trade'}</span>
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 font-ethiopic">
                      {rev.authorRole || 'Orthodox Member'}
                      {rev.projectTitle ? ` · ${rev.projectTitle}` : ''}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="flex items-center justify-end gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5 font-ethiopic">
                    {formatExactPostedDateTime(rev.createdAt, language)?.fullText || ''}
                  </span>
                </div>
              </div>

              {/* Review Text */}
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 font-ethiopic leading-relaxed">
                {rev.comment}
              </p>

              {/* Tags */}
              {rev.tags && rev.tags.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-slate-100 dark:border-slate-800">
                  {rev.tags.map((tg, idx) => (
                    <span
                      key={idx}
                      className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] px-2 py-0.5 rounded-md font-ethiopic"
                    >
                      #{tg}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center space-y-2">
            <Star className="w-8 h-8 text-amber-400 mx-auto opacity-70" />
            <p className="text-xs font-bold text-slate-700 dark:text-slate-200 font-ethiopic">
              {language === 'am'
                ? 'እስካሁን ለዚህ ዝርዝር የተሰጠ ምስክርነት የለም። የመጀመሪያውን ምስክርነት ይስጡ!'
                : 'No reviews recorded yet in Firestore. Be the first to share honest feedback!'}
            </p>
          </div>
        )}
      </div>

      {/* Leave Review Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#123B6D]" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white font-ethiopic">
                  {language === 'am' ? 'የምስክርነትና የአስተያየት መስጫ' : 'Share Your Verified Experience'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {submittedMessage ? (
              <div className="p-8 text-center space-y-2 bg-emerald-50 rounded-2xl border border-emerald-200">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="text-sm font-bold text-emerald-900 font-ethiopic">
                  {language === 'am'
                    ? 'ምስክርነትዎ በ Firestore ተመዝግቧል!'
                    : 'Thank you! Your review is saved to Firestore.'}
                </h4>
              </div>
            ) : (
              <form onSubmit={handleAddReview} className="space-y-3.5 font-ethiopic">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-1">
                    {language === 'am' ? 'የኮከብ ደረጃ ይስጡ (Rating)' : 'Star Rating'}
                  </label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setNewRating(star)}
                        className="p-1.5 hover:scale-125 transition cursor-pointer"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= newRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-amber-600 ml-2 font-mono">
                      {newRating} / 5 ኮከብ
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-1">
                    {language === 'am' ? 'የምስጋና ወይም የምስክርነት መለያ' : 'Primary Highlight Tag'}
                  </label>
                  <select
                    value={selectedTag}
                    onChange={(e) => setSelectedTag(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 outline-none focus:ring-1 focus:ring-[#123B6D]"
                  >
                    <option value="ታማኝ ሻጭ">ታማኝ ሻጭ (Honest Merchant)</option>
                    <option value="የላቀ ጥራት">የላቀ ጥራት (Superior Craftsmanship)</option>
                    <option value="ፈጣን አቅርቦት">ፈጣን አቅርቦት (Prompt Delivery)</option>
                    <option value="በሰዓቱ የከፈለ አሠሪ">በሰዓቱ የከፈለ አሠሪ (Prompt Paying Employer)</option>
                    <option value="የሙያ ብቃት">የሙያ ብቃት (Expert Professionalism)</option>
                    <option value="ፍትሐዊ ዋጋ">ፍትሐዊ ዋጋ (Fair Pricing)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-1">
                    {language === 'am' ? 'ዝርዝር ምስክርነትዎ' : 'Detailed Review'}
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    placeholder={
                      language === 'am'
                        ? 'ስለ ግብይቱ፣ ስለ ዕቃው ጥራት፣ ስለ ታማኝነታቸውና ስላገኙት እርካታ ያካፍሉ...'
                        : 'Share your authentic experience regarding honesty, quality, and service...'
                    }
                    className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs outline-none focus:ring-1 focus:ring-[#123B6D]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    {language === 'am' ? 'ሰርዝ' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#16845B] hover:bg-[#126b4a] text-white shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting
                      ? '...'
                      : language === 'am'
                      ? 'አስተያየቱን ለጥፍ (Post Review)'
                      : 'Publish Review'}
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
