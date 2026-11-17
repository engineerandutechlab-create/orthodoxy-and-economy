import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { VerificationBadge, StatusIndicator } from '../common/Badge';
import { ReviewsSection } from '../common/ReviewsSection';
import {
  X,
  MapPin,
  Phone,
  Send,
  Bookmark,
  BookmarkCheck,
  MessageSquare,
  Truck,
  ShoppingBag,
  Flag,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { Product } from '../../types';
import { PostedDateTime } from '../common/PostedDateTime';

export const ProductDetailModal: React.FC = () => {
  const {
    modalData,
    closeModal,
    openModal,
    t,
    language,
    currentUser,
    isItemSaved,
    toggleSaveItem,
    startOrOpenConversation,
    placeProductOrder,
    submitReport,
  } = useApp();

  const product: Product | null = modalData;
  const [inquiryQuantity, setInquiryQuantity] = useState<number>(product?.moq || 1);
  const [orderNote, setOrderNote] = useState('');
  const [isOrdering, setIsOrdering] = useState(false);
  const [showOrderBox, setShowOrderBox] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState(
    'አጠራጣሪ ዋጋ ወይም የተሳሳተ መረጃ (Suspicious pricing or misleading details)'
  );
  const [reportDetails, setReportDetails] = useState('');
  const [reportSent, setReportSent] = useState(false);

  if (!product) return null;

  const saved = isItemSaved(product.id);
  const totalEstimate = Number(product.price || 0) * Math.max(1, inquiryQuantity);

  const handleContactSeller = () => {
    closeModal();
    startOrOpenConversation(
      product.sellerId,
      product.sellerName,
      product.title,
      product.imageUrl,
      {
        projectId: product.id,
        opportunityType: 'GENERAL',
        budgetOrPrice: product.price,
        category: product.category,
      }
    );
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      openModal('auth');
      return;
    }
    setIsOrdering(true);
    try {
      await placeProductOrder(product, inquiryQuantity, orderNote);
    } finally {
      setIsOrdering(false);
    }
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitReport({
      targetType: 'PRODUCT',
      targetId: product.id,
      targetTitle: product.title,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150">
        {/* Top Header */}
        <div className="sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between z-10">
          <span className="text-xs font-bold text-[#123B6D] dark:text-[#F3D77A] uppercase tracking-wider">
            {product.category}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowReportModal(true)}
              className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
              title={language === 'am' ? 'ሪፖርት አድርግ (Report Listing)' : 'Report Listing'}
            >
              <Flag className="w-4 h-4" />
            </button>
            <button
              onClick={() => toggleSaveItem(product.id)}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
              title={saved ? t.jobSaved : t.jobSave}
            >
              {saved ? (
                <BookmarkCheck className="w-5 h-5 text-[#D4A72C]" />
              ) : (
                <Bookmark className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={closeModal}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Main Grid: Gallery + Core Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* Image Gallery */}
            <div className="space-y-3">
              <div className="aspect-4/3 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 dark:border-slate-700">
                <img
                  src={product.imageUrl}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {product.moq && (
                <div className="bg-[#08294F] text-[#F3D77A] p-3 rounded-xl text-xs flex items-center gap-2">
                  <Truck className="w-4 h-4 shrink-0" />
                  <span>
                    <strong>Wholesale Import / B2B:</strong> MOQ {product.moq} units
                  </span>
                </div>
              )}
            </div>

            {/* Information & Pricing */}
            <div className="space-y-4">
              {/* Seller Row */}
              <div className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-300">
                <span className="font-bold text-slate-900 dark:text-white">
                  {product.sellerName}
                </span>
                {product.sellerVerified ? (
                  <VerificationBadge
                    type="seller"
                    status="verified"
                    label={language === 'am' ? 'የተረጋገጠ ሻጭ' : 'Verified Merchant'}
                    entityName={product.sellerName}
                    entityRole={
                      language === 'am'
                        ? 'የተረጋገጠ የገበያ ነጋዴ / አቅራቢ'
                        : 'Verified Merchant / Supplier'
                    }
                    entityAvatar={product.imageUrl}
                  />
                ) : (
                  <VerificationBadge
                    type="seller"
                    status="unverified"
                    label={language === 'am' ? 'ያልተረጋገጠ' : 'Unverified'}
                    entityName={product.sellerName}
                  />
                )}
              </div>

              {/* Title */}
              <h2 className="font-ethiopic text-xl sm:text-2xl font-black text-[#08294F] dark:text-white leading-snug">
                {language === 'am' ? product.amharicTitle || product.title : product.title}
              </h2>

              {product.isFlagged && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <span className="font-bold text-rose-700">🚩 የታገደ ልጥፍ (Flagged Post):</span>
                  <span>
                    {product.flagReason ||
                      (language === 'am' ? 'በአስተዳዳሪው ክትትል ሥር ያለ' : 'Under admin review')}
                  </span>
                </div>
              )}

              {/* Price Display */}
              <div className="bg-[#F8FAFC] dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 space-y-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-[#08294F] dark:text-[#F3D77A]">
                    {product.price.toLocaleString()} {product.currency}
                  </span>
                  {product.wholesalePrice && (
                    <span className="text-xs text-[#16845B] font-bold">
                      (Wholesale: {product.wholesalePrice.toLocaleString()} {product.currency})
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500 pt-1">
                  <span>
                    {t.productCondition}:{' '}
                    <strong className="capitalize text-slate-800 dark:text-slate-200">
                      {product.condition}
                    </strong>
                  </span>
                  <span>·</span>
                  <StatusIndicator
                    active={product.isAvailable}
                    activeText={t.inStock}
                    inactiveText={t.outOfStock}
                  />
                </div>
              </div>

              {/* Location & Delivery */}
              <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#D4A72C] shrink-0" />
                  <span>{product.location}</span>
                </div>
                {product.deliveryInfo && (
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-[#123B6D] shrink-0" />
                    <span>{product.deliveryInfo}</span>
                  </div>
                )}
                <PostedDateTime value={product.createdAt} language={language} variant="inline" className="pt-1" />
              </div>

              {/* Order Now Box (Android Parity: Order Item + Seller Notification + Chat) */}
              {!showOrderBox ? (
                <button
                  onClick={() => setShowOrderBox(true)}
                  className="w-full bg-[#D4A72C] hover:bg-[#c29623] text-[#08294F] py-3 rounded-xl text-sm font-black transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer font-ethiopic"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{language === 'am' ? 'ዕቃውን እዘዝ (Order Item Now)' : 'Order Item Now'}</span>
                </button>
              ) : (
                <form
                  onSubmit={handlePlaceOrder}
                  className="p-4 rounded-2xl bg-amber-50/70 dark:bg-slate-800 border border-amber-200 dark:border-amber-800 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-[#08294F] dark:text-[#F3D77A] font-ethiopic">
                      {language === 'am' ? 'የትዕዛዝ መጠን ይምረጡ' : 'Order Quantity & Note'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowOrderBox(false)}
                      className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min={1}
                      max={product.quantity || 999}
                      value={inquiryQuantity}
                      onChange={(e) => setInquiryQuantity(Math.max(1, Number(e.target.value)))}
                      className="w-24 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-center"
                    />
                    <div className="text-xs">
                      <span className="text-slate-500 block">
                        {language === 'am' ? 'ጠቅላላ ዋጋ፦' : 'Total Estimate:'}
                      </span>
                      <strong className="text-sm font-black text-[#08294F] dark:text-white">
                        {totalEstimate.toLocaleString()} {product.currency}
                      </strong>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={orderNote}
                    onChange={(e) => setOrderNote(e.target.value)}
                    placeholder={
                      language === 'am'
                        ? 'የማድረሻ ቦታ ወይም ማስታወሻ (አማራጭ)...'
                        : 'Delivery address or note (optional)...'
                    }
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  />
                  <button
                    type="submit"
                    disabled={isOrdering}
                    className="w-full bg-[#16845B] hover:bg-[#126b4a] text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {isOrdering
                        ? '...'
                        : language === 'am'
                        ? 'ትዕዛዝ አረጋግጥና ለሻጩ ላክ'
                        : 'Confirm Order & Message Seller'}
                    </span>
                  </button>
                </form>
              )}

              {/* Primary Direct Contact CTAs */}
              <div className="pt-1 flex flex-col gap-2.5">
                <a
                  href={`https://t.me/${(product.sellerTelegram || '@orthodoxy_economy').replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#0088cc] hover:bg-[#0077b5] text-white py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer font-ethiopic"
                >
                  <Send className="w-4 h-4 text-white" />
                  <span>
                    {language === 'am' ? 'በቴሌግራም በቀጥታ አውራ (Chat on Telegram)' : 'Direct Telegram Chat'}
                  </span>
                </a>

                {product.sellerPhone && (
                  <a
                    href={`tel:${product.sellerPhone}`}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm flex items-center justify-center gap-2 font-ethiopic"
                  >
                    <Phone className="w-4 h-4 text-white" />
                    <span>
                      {language === 'am'
                        ? `በስልክ በቀጥታ ደውል፡ ${product.sellerPhone}`
                        : `Direct Call: ${product.sellerPhone}`}
                    </span>
                  </a>
                )}

                <button
                  onClick={handleContactSeller}
                  className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-100 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer flex items-center justify-center gap-2 font-ethiopic"
                >
                  <MessageSquare className="w-4 h-4 text-[#123B6D]" />
                  <span>
                    {language === 'am' ? 'በመድረኩ ውስጥ መልእክት ላክ' : 'Send In-App Message'}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              {language === 'am' ? 'የምርቱ ዝርዝር መግለጫ' : 'Product Description'}
            </h3>
            <p className="font-ethiopic text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {language === 'am' ? product.descriptionAm || product.description : product.description}
            </p>
          </div>

          {/* Verified Customer Testimonials & Reviews */}
          <div className="pt-5 border-t border-slate-100 dark:border-slate-800">
            <ReviewsSection
              targetTitle={product.title}
              targetId={product.id}
              targetUserId={product.sellerId}
              type="product"
            />
          </div>
        </div>
      </div>

      {/* Inline Report Modal */}
      {showReportModal && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs"
          onClick={() => setShowReportModal(false)}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-rose-700 flex items-center gap-2 font-ethiopic">
                <AlertTriangle className="w-4 h-4" />
                <span>{language === 'am' ? 'ይህን ምርት ሪፖርት አድርግ' : 'Report Product Listing'}</span>
              </h4>
              <button onClick={() => setShowReportModal(false)} className="text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            {reportSent ? (
              <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold text-center">
                {language === 'am'
                  ? 'ሪፖርትዎ ለአስተዳዳሪዎች ተልኳል!'
                  : 'Report submitted to moderators!'}
              </div>
            ) : (
              <form onSubmit={handleSubmitReport} className="space-y-3 font-ethiopic">
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs bg-white dark:bg-slate-800"
                >
                  <option value="አጠራጣሪ ዋጋ ወይም የተሳሳተ መረጃ (Suspicious pricing / scam)">
                    አጠራጣሪ ዋጋ / ማጭበርበር (Scam / Misleading)
                  </option>
                  <option value="የደላላ ጣልቃ ገብነት (Broker / Middleman)">
                    የደላላ ጣልቃ ገብነት (Broker / Middleman)
                  </option>
                  <option value="አግባብ ያልሆነ ይዘት (Inappropriate content)">
                    አግባብ ያልሆነ ይዘት (Inappropriate content)
                  </option>
                </select>
                <textarea
                  rows={3}
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  placeholder={language === 'am' ? 'ተጨማሪ ዝርዝር...' : 'Additional details...'}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs bg-white dark:bg-slate-800"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  {language === 'am' ? 'ሪፖርቱን ላክ (Submit Report)' : 'Submit Report'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
