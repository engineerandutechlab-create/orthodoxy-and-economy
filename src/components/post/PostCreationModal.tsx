import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { aiService } from '../../services/aiService';
import { 
  X, 
  Briefcase, 
  ShoppingBag, 
  Wrench, 
  Building2, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Upload, 
  MapPin, 
  DollarSign, 
  Sparkles,
  Phone,
  Send,
  RefreshCw,
  Camera,
  Image as ImageIcon,
  Trash2,
  SlidersHorizontal,
  AlertTriangle
} from 'lucide-react';
import { Material3SectorSelector } from '../common/Material3SectorSelector';
import { SubCategory, SuperCategory } from '../../data/workSectors';

export const PostCreationModal: React.FC = () => {
  const { 
    closeModal, 
    openModal,
    modalData, 
    t, 
    language, 
    addJob, 
    addProduct, 
    addService, 
    addBusiness, 
    currentUser,
    isFirebaseAuthenticated 
  } = useApp();

  type PostType = 'job' | 'product' | 'service' | 'business';
  const initialType: PostType = modalData?.defaultType || 'job';

  const [step, setStep] = useState<number>(1);
  const [postType, setPostType] = useState<PostType>(initialType);

  // Form State
  const [title, setTitle] = useState('');
  const [amharicTitle, setAmharicTitle] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [wholesalePrice, setWholesalePrice] = useState<number | ''>('');
  const [moq, setMoq] = useState<number | ''>('');
  const [quantity, setQuantity] = useState<number | ''>(10);
  const [projectType, setProjectType] = useState<'FIXED_PRICE' | 'HOURLY' | 'GIG' | 'full-time' | 'contract'>('FIXED_PRICE');
  const [experienceLevel, setExperienceLevel] = useState<'entry' | 'intermediate' | 'expert'>('intermediate');
  const [deliveryDays, setDeliveryDays] = useState<number | ''>(14);
  const [description, setDescription] = useState('');
  const [descriptionAm, setDescriptionAm] = useState('');
  const [location, setLocation] = useState(currentUser?.location || 'Addis Ababa');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [telegram, setTelegram] = useState(currentUser?.telegramHandle || '');
  const [imageUrl, setImageUrl] = useState('/assets/products/beeswax_candles.jpg');
  const [isRemote, setIsRemote] = useState(false);
  const [skills, setSkills] = useState('React, TypeScript, Cloud');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [isImprovingWithAi, setIsImprovingWithAi] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setImageUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImproveWithAi = async () => {
    const draft = description || title || amharicTitle;
    if (!draft.trim()) return;

    setIsImprovingWithAi(true);
    try {
      if (postType === 'job') {
        const result = await aiService.improveJob(draft, language);
        if (result.title) setTitle(result.title);
        if (result.amharicTitle) setAmharicTitle(result.amharicTitle);
        if (result.category) setCategory(result.category);
        if (result.description) setDescription(result.description);
        if (result.descriptionAm) setDescriptionAm(result.descriptionAm);
        if (result.skills && result.skills.length > 0) setSkills(result.skills.join(', '));
      } else if (postType === 'product') {
        const result = await aiService.improveProduct(draft);
        if (result.title) setTitle(result.title);
        if (result.amharicTitle) setAmharicTitle(result.amharicTitle);
        if (result.category) setCategory(result.category);
        if (result.description) setDescription(result.description);
        if (result.descriptionAm) setDescriptionAm(result.descriptionAm);
      }
    } catch (e) {
      console.warn('AI improvement error:', e);
    } finally {
      setIsImprovingWithAi(false);
    }
  };

  const presetImages = [
    { label: 'ንጹሕ የሰም ጧፍ (Beeswax Candles)', url: '/assets/products/beeswax_candles.jpg' },
    { label: 'የሸማ ጋቢና ነጠላ (Tibeb Gabi & Netela)', url: '/assets/products/tibeb_gabi_netela.jpg' },
    { label: 'የተመረጠ ዕጣን (Natural Frankincense)', url: '/assets/products/natural_frankincense.jpg' },
    { label: 'የወይራ እንጨት መስቀል (Carved Cross)', url: '/assets/products/carved_cross.jpg' },
  ];

  const handlePublish = async () => {
    setPublishError(null);
    if (!currentUser || !isFirebaseAuthenticated) {
      setPublishError(
        language === 'am'
          ? 'ማስታወቂያ ለመለጠፍ እባክዎ መጀመሪያ ይግቡ (Sign In)።'
          : 'Please sign in first to publish your listing to the platform.'
      );
      return;
    }

    const effectiveTitle = title.trim() || amharicTitle.trim();
    const effectiveAmTitle = amharicTitle.trim() || title.trim();

    setIsSubmitting(true);
    try {
      if (postType === 'job') {
        await addJob({
          title: effectiveTitle,
          amharicTitle: effectiveAmTitle,
          category: category || 'Technology & Engineering',
          budget: Number(price) || 30000,
          projectType,
          employmentType: projectType,
          experienceLevel,
          deliveryDays: Number(deliveryDays) || 14,
          description,
          descriptionAm: descriptionAm || description,
          location,
          isRemote,
          skillsRequired: skills.split(',').map(s => s.trim()).filter(Boolean),
        });
      } else if (postType === 'product') {
        await addProduct({
          title: effectiveTitle,
          amharicTitle: effectiveAmTitle,
          category: category || 'Liturgical & Cultural Goods',
          price: Number(price) || 500,
          wholesalePrice: wholesalePrice ? Number(wholesalePrice) : undefined,
          moq: moq ? Number(moq) : undefined,
          quantity: Number(quantity) || 10,
          description,
          descriptionAm: descriptionAm || description,
          location,
          imageUrl,
        });
      } else if (postType === 'service') {
        await addService({
          title: effectiveTitle,
          amharicTitle: effectiveAmTitle,
          category: category || 'Consulting & Services',
          rateAmount: Number(price) || 800,
          rateDescription: price ? `${Number(price).toLocaleString()} ETB / consultation` : 'Negotiable',
          description,
          descriptionAm: descriptionAm || description,
          location,
          skills: skills.split(',').map(s => s.trim()).filter(Boolean),
        });
      } else if (postType === 'business') {
        await addBusiness({
          name: effectiveTitle,
          nameAm: effectiveAmTitle,
          category: category || 'Trading & Distribution',
          description,
          descriptionAm: descriptionAm || description,
          location,
          city: location,
          phone,
          telegram,
          logoUrl: imageUrl,
        });
      }
      setPublishSuccess(true);
    } catch (e: any) {
      console.error(e);
      setPublishError(
        language === 'am'
          ? 'ማስታወቂያውን ማስቀመጥ አልተቻለም። እባክዎ መግባትዎን (Sign In) ያረጋግጡና ደግመው ይሞክሩ።'
          : e?.message || 'Failed to publish listing. Please check your connection and try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Top Header & Progress */}
        <div className="sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between z-10">
          <div>
            <h3 className="text-base font-extrabold text-[#08294F] dark:text-white">{t.postTitle}</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Step {step} of 5</p>
          </div>
          <button
            onClick={closeModal}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-1">
          <div 
            className="bg-[#123B6D] h-1 transition-all duration-300"
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>

        <div className="p-6 sm:p-8">
          {publishSuccess ? (
            <div className="text-center py-12 space-y-4">
              <CheckCircle2 className="w-16 h-16 text-[#16845B] mx-auto animate-bounce" />
              <h3 className="font-ethiopic text-2xl font-black text-slate-900">
                {t.formPublishSuccess}
              </h3>
              <p className="font-ethiopic text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
                {language === 'am' 
                  ? 'ማስታወቂያዎ በማኅበረሰብ መድረካችን ላይ ይፋ ሆኗል። መልእክቶች ሲደርሱዎት በዳሽቦርድዎ ላይ ማግኘት ይችላሉ።'
                  : 'Your listing is now live across the platform. You can monitor inquiries and proposals from your dashboard.'
                }
              </p>
              <button
                onClick={closeModal}
                className="bg-[#123B6D] text-white px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-xs cursor-pointer mt-2"
              >
                {language === 'am' ? 'ጨርስ / ዝጋ' : 'Close and View'}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* STEP 1: CHOOSE TYPE */}
              {step === 1 && (
                <div className="space-y-4">
                  <div className="text-center sm:text-left space-y-1">
                    <h4 className="text-lg font-bold text-slate-900">{t.postStep1}</h4>
                    <p className="text-xs text-slate-500">{t.postSubtitle}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    {[
                      { id: 'job', title: t.postTypeJob, icon: Briefcase, desc: 'Full-time, gig, contract vacancies', color: 'text-[#123B6D]' },
                      { id: 'product', title: t.postTypeProduct, icon: ShoppingBag, desc: 'Retail goods, wholesale B2B', color: 'text-[#2563EB]' },
                      { id: 'service', title: t.postTypeService, icon: Wrench, desc: 'Professional & technical services', color: 'text-[#16845B]' },
                      { id: 'business', title: t.postTypeBusiness, icon: Building2, desc: 'Enterprise & importer directory', color: 'text-[#D4A72C]' },
                    ].map((item) => {
                      const Icon = item.icon;
                      const isSelected = postType === item.id;
                      return (
                        <div
                          key={item.id}
                          onClick={() => setPostType(item.id as PostType)}
                          className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                            isSelected 
                              ? 'border-[#123B6D] bg-[#123B6D]/5 shadow-xs' 
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          <div className="w-10 h-10 rounded-xl bg-white shadow-xs border border-slate-100 flex items-center justify-center">
                            <Icon className={`w-5 h-5 ${item.color}`} />
                          </div>
                          <div>
                            <h5 className="font-ethiopic font-bold text-sm text-slate-900">{item.title}</h5>
                            <p className="text-[11px] text-slate-500 mt-0.5">{item.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 2: DETAILS */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-bold text-slate-900">{t.postStep2}</h4>
                    <button
                      type="button"
                      onClick={handleImproveWithAi}
                      disabled={isImprovingWithAi || (!description.trim() && !title.trim() && !amharicTitle.trim())}
                      className="bg-purple-50 text-[#3B1C54] hover:bg-purple-100 border border-purple-200 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-40"
                    >
                      {isImprovingWithAi ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5 text-[#D4A72C]" />
                      )}
                      <span>✨ {isImprovingWithAi ? 'AI Improving...' : 'Improve with AI (በ AI አሻሽል)'}</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {t.formTitleAm}
                      </label>
                      <input
                        type="text"
                        value={amharicTitle}
                        onChange={(e) => setAmharicTitle(e.target.value)}
                        placeholder="ምሳሌ፡ ሲኒየር ሪአክት ሶፍትዌር አበልጻጊ ወይም ንጹሕ የሰም ጧፍ"
                        className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#123B6D]/20"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {t.formTitleEn}
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        placeholder="e.g. Senior React Developer or Pure Beeswax Candles"
                        className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#123B6D]/20"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          {t.formBudget}
                        </label>
                        <input
                          type="number"
                          value={price}
                          onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : '')}
                          placeholder="e.g. 50000"
                          className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#123B6D]/20"
                        />
                      </div>

                      {postType === 'job' && (
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            {language === 'am' ? 'የሥራ ዓይነት (Project / Gig Type)' : 'Project / Gig Type'}
                          </label>
                          <select
                            value={projectType}
                            onChange={(e) => setProjectType(e.target.value as any)}
                            className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#123B6D]/20"
                          >
                            <option value="FIXED_PRICE">Fixed Price (ቋሚ ዋጋ)</option>
                            <option value="GIG">Freelance Gig (የግል / አጭር ሥራ)</option>
                            <option value="HOURLY">Hourly (በሰዓት)</option>
                            <option value="full-time">Full-Time (ሙሉ ጊዜ)</option>
                            <option value="contract">Contract (ኮንትራት)</option>
                          </select>
                        </div>
                      )}

                      {postType === 'product' && (
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            {t.formMoq}
                          </label>
                          <input
                            type="number"
                            value={moq}
                            onChange={(e) => setMoq(e.target.value ? Number(e.target.value) : '')}
                            placeholder="e.g. 50 (Optional)"
                            className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#123B6D]/20"
                          />
                        </div>
                      )}
                    </div>

                    {postType === 'job' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            {language === 'am' ? 'የልምድ ደረጃ (Experience Level)' : 'Experience Level'}
                          </label>
                          <select
                            value={experienceLevel}
                            onChange={(e) => setExperienceLevel(e.target.value as any)}
                            className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#123B6D]/20"
                          >
                            <option value="entry">Entry (ጀማሪ)</option>
                            <option value="intermediate">Intermediate (መካከለኛ)</option>
                            <option value="expert">Expert (ከፍተኛ ባለሙያ)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            {language === 'am' ? 'የማጠናቀቂያ ቀናት (Delivery Days)' : 'Delivery Days'}
                          </label>
                          <input
                            type="number"
                            min={1}
                            value={deliveryDays}
                            onChange={(e) => setDeliveryDays(e.target.value ? Number(e.target.value) : '')}
                            placeholder="e.g. 14"
                            className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#123B6D]/20"
                          />
                        </div>
                      </div>
                    )}

                    {postType === 'product' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            {language === 'am' ? 'የጅምላ ዋጋ (Wholesale Price - Optional)' : 'Wholesale Price (ETB)'}
                          </label>
                          <input
                            type="number"
                            value={wholesalePrice}
                            onChange={(e) => setWholesalePrice(e.target.value ? Number(e.target.value) : '')}
                            placeholder="Optional wholesale price"
                            className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#123B6D]/20"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            {language === 'am' ? 'ያለው ብዛት (Quantity in Stock)' : 'Quantity in Stock'}
                          </label>
                          <input
                            type="number"
                            min={1}
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value ? Number(e.target.value) : '')}
                            placeholder="10"
                            className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#123B6D]/20"
                          />
                        </div>
                      </div>
                    )}

                    {/* 54 Work Sectors Material 3 Component */}
                    <div className="space-y-1.5 pt-1">
                      <label className="block text-xs font-bold text-slate-700 font-ethiopic flex items-center gap-1.5">
                        <SlidersHorizontal className="w-3.5 h-3.5 text-[#123B6D]" />
                        <span>{language === 'am' ? 'የሥራ ወይም የአገልግሎት ዘርፍ (ከ 54ቱ ዝርዝር ሙያዎች ይምረጡ)፦' : 'Sector Classification (Choose from 54 Sectors):'}</span>
                      </label>
                      <Material3SectorSelector
                        selectedSubCategoryId={category}
                        language={language}
                        placeholder={language === 'am' ? 'የዚህን ማስታወቂያ ትክክለኛ የሥራ/ምርት ዘርፍ ይምረጡ...' : 'Select specific sector...'}
                        onSelect={(sub, superCat) => {
                          setCategory(sub.nameEn);
                          if (!skills.trim() && sub.keywords) {
                            setSkills(sub.keywords.slice(0, 4).join(', '));
                          }
                        }}
                        onClear={() => setCategory('')}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {t.formDescription}
                      </label>
                      <textarea
                        rows={4}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Detailed specifications, responsibilities, or product description..."
                        className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#123B6D]/20"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: IMAGES */}
              {step === 3 && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-bold text-slate-900 font-ethiopic">
                      {language === 'am' ? 'የምርት ወይም የአገልግሎት ምስል ማስገቢያ' : t.postStep3}
                    </h4>
                    <p className="text-xs text-slate-500 font-ethiopic mt-0.5">
                      {language === 'am' 
                        ? 'የምርትዎን ትክክለኛ ፎቶ ከስልክዎ/ኮምፒውተርዎ ይጫኑ ወይም ከቀረቡት የተረጋገጡ ምስሎች አንዱን ይምረጡ' 
                        : 'Upload your authentic item photo from your phone/computer or choose a preset.'}
                    </p>
                  </div>

                  {/* Current Image Preview Box */}
                  {imageUrl && (
                    <div className="relative rounded-2xl overflow-hidden border-2 border-purple-200 bg-slate-900 aspect-16/9 sm:aspect-21/9 max-h-52 shadow-xs group">
                      <img 
                        src={imageUrl} 
                        alt="Product Preview" 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 flex items-end justify-between p-3">
                        <span className="text-[11px] font-bold text-white bg-black/40 backdrop-blur-xs px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-ethiopic">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{language === 'am' ? 'የተመረጠ ምስል' : 'Active Image Preview'}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setImageUrl('')}
                          className="px-2.5 py-1 rounded-lg bg-red-600/80 hover:bg-red-600 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                          title="Remove Image"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>{language === 'am' ? 'አስወግድ' : 'Remove'}</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Direct File Upload Dropzone */}
                  <div className="p-4 rounded-2xl border-2 border-dashed border-purple-200 hover:border-[#123B6D] bg-purple-50/30 hover:bg-purple-50/60 transition-all text-center">
                    <input
                      type="file"
                      id="product-image-file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <label 
                      htmlFor="product-image-file"
                      className="cursor-pointer flex flex-col items-center justify-center space-y-2"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#123B6D] to-[#3B1C54] text-white flex items-center justify-center shadow-xs">
                        <Camera className="w-5 h-5 text-[#D4A72C]" />
                      </div>
                      <div className="font-ethiopic">
                        <span className="text-xs font-bold text-[#123B6D] hover:underline block">
                          {language === 'am' ? '📷 ከስልክዎ ወይም ከኮምፒውተርዎ ፎቶ ይምረጡ' : 'Upload photo from your phone or device'}
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          PNG, JPG, WEBP (Max 5MB)
                        </span>
                      </div>
                    </label>
                  </div>

                  {/* URL Input Option */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 font-ethiopic">
                      {language === 'am' ? 'ወይም የምስል ሊንክ (Image URL) እዚህ ያስገቡ፦' : 'Or paste direct image URL:'}
                    </label>
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://example.com/my-product.jpg"
                      className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#123B6D]/20 font-mono text-slate-800"
                    />
                  </div>

                  {/* Authentic Verified Presets */}
                  <div className="space-y-2 pt-1">
                    <span className="text-xs font-bold text-slate-700 block font-ethiopic">
                      {language === 'am' ? 'የተረጋገጡ የኦርቶዶክሳዊ ምርቶች ናሙናዎች፦' : 'Verified Orthodox Product Presets:'}
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {presetImages.map((preset) => (
                        <div
                          key={preset.url}
                          onClick={() => setImageUrl(preset.url)}
                          className={`rounded-xl border overflow-hidden cursor-pointer transition-all ${
                            imageUrl === preset.url ? 'ring-2 ring-[#123B6D] border-transparent scale-102' : 'border-slate-200 opacity-80 hover:opacity-100'
                          }`}
                        >
                          <img src={preset.url} alt={preset.label} className="w-full h-16 object-cover" />
                          <p className="text-[10px] font-bold text-center p-1 bg-white truncate font-ethiopic text-slate-800">
                            {preset.label}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: LOCATION & CONTACT */}
              {step === 4 && (
                <div className="space-y-4">
                  <h4 className="text-lg font-bold text-slate-900">{t.postStep4}</h4>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {t.formLocation}
                      </label>
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g. Addis Ababa (Bole Medhanialem) or Bahir Dar"
                        className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#123B6D]/20"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          {t.formPhone}
                        </label>
                        <input
                          type="text"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+251 91 123 4567"
                          className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#123B6D]/20"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          {t.formTelegram}
                        </label>
                        <input
                          type="text"
                          value={telegram}
                          onChange={(e) => setTelegram(e.target.value)}
                          placeholder="@username"
                          className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#123B6D]/20"
                        />
                      </div>
                    </div>

                    {postType === 'job' && (
                      <div className="pt-2">
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isRemote}
                            onChange={(e) => setIsRemote(e.target.checked)}
                            className="w-4 h-4 text-[#123B6D] rounded"
                          />
                          <span>Allow Remote Work (የርቀት ሥራ ይቻላል)</span>
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 5: PREVIEW */}
              {step === 5 && (
                <div className="space-y-4">
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white">{t.postStep5}</h4>
                  
                  <div className="bg-[#F8FAFC] dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-[#123B6D] text-white px-2 py-0.5 rounded">
                        {postType.toUpperCase()}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">{location}</span>
                    </div>

                    <h3 className="text-base font-extrabold text-[#08294F] dark:text-white">
                      {title || amharicTitle || 'Untitled Listing'}
                    </h3>
                    {amharicTitle && title && (
                      <p className="font-ethiopic text-xs font-semibold text-[#123B6D] dark:text-[#D4A72C]">{amharicTitle}</p>
                    )}

                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3">
                      {description || 'No description provided.'}
                    </p>

                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                      <span className="font-bold text-[#08294F] dark:text-[#D4A72C]">
                        {price ? `${Number(price).toLocaleString()} ETB` : 'Flexible / Negotiable'}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400">{phone || 'Contact via platform chat'}</span>
                    </div>
                  </div>

                  {(!currentUser || !isFirebaseAuthenticated) && (
                    <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>
                          {language === 'am'
                            ? 'ለመለጠፍ እባክዎ መጀመሪያ ወደ አካውንትዎ ይግቡ።'
                            : 'Sign in required to publish directly to the live board.'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => openModal('auth')}
                        className="px-3 py-1.5 rounded-xl bg-[#123B6D] text-white font-bold shrink-0 cursor-pointer"
                      >
                        {t.navSignIn}
                      </button>
                    </div>
                  )}

                  {publishError && (
                    <div className="p-3.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-2xl flex items-center gap-2 text-xs text-rose-700 dark:text-rose-300 font-semibold">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>{publishError}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Navigation Footer */}
              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={() => {
                      setPublishError(null);
                      setStep(step - 1);
                    }}
                    className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 px-3 py-2 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                ) : (
                  <div />
                )}

                {step < 5 ? (
                  <button
                    type="button"
                    onClick={() => setStep(step + 1)}
                    disabled={step === 2 && !title.trim() && !amharicTitle.trim()}
                    className="bg-[#123B6D] hover:bg-[#08294F] text-white px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <span>Next</span>
                    <ArrowRight className="w-4 h-4 text-[#D4A72C]" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handlePublish}
                    disabled={isSubmitting}
                    className="bg-[#D4A72C] hover:bg-[#c29623] text-[#08294F] px-8 py-2.5 rounded-xl text-xs sm:text-sm font-black shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <span>{isSubmitting ? 'Publishing...' : t.formPublish}</span>
                  </button>
                )}
              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  );
};
