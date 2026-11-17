import React from 'react';
import { useApp } from '../../context/AppContext';
import { VerificationBadge, StatusIndicator } from '../common/Badge';
import { 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Bookmark, 
  BookmarkCheck, 
  ArrowRight, 
  Package, 
  Clock, 
  CheckCircle2, 
  ChevronRight,
  Star
} from 'lucide-react';
import { Job, Product } from '../../types';
import { PostedDateTime } from '../common/PostedDateTime';

export const FeaturedSections: React.FC = () => {
  const { 
    t, 
    language, 
    jobs, 
    products, 
    businesses, 
    services, 
    setActiveTab, 
    openModal, 
    isItemSaved, 
    toggleSaveItem 
  } = useApp();

  const featuredJobs = jobs.slice(0, 3);
  const featuredProducts = products.slice(0, 4);

  return (
    <div className="space-y-20 py-8 bg-slate-50">
      
      {/* 1. FEATURED JOBS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3 border-b border-purple-100/60 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#123B6D] tracking-wider uppercase">
              <Briefcase className="w-4 h-4 text-purple-700" />
              <span>{language === 'am' ? 'የሥራ ገበያ' : 'Job Marketplace'}</span>
            </div>
            <h2 className="font-ethiopic text-2xl font-extrabold text-[#08294F] mt-1">
              {t.jobsHeading}
            </h2>
            <p className="font-ethiopic text-xs sm:text-sm text-slate-500">
              {t.jobsSubheading}
            </p>
          </div>
          <button
            onClick={() => setActiveTab('jobs')}
            className="text-xs sm:text-sm font-semibold text-purple-800 hover:text-purple-950 flex items-center gap-1 cursor-pointer self-start sm:self-auto"
          >
            <span>{language === 'am' ? 'ሁሉንም ሥራዎች ተመልከት' : 'View all vacancies'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Job Cards */}
        <div className="space-y-4">
          {featuredJobs.map((job) => {
            const saved = isItemSaved(job.id);
            return (
              <div
                key={job.id}
                className="bg-white hover:bg-purple-50/20 rounded-2xl p-5 sm:p-6 border border-purple-100 hover:border-purple-300 transition-all shadow-xs flex flex-col gap-4 group"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                  <div className="space-y-3 flex-1">
                    
                    {/* Employer Header with Verification */}
                    <div className="flex items-center gap-2.5 text-xs text-slate-600">
                      <span className="font-semibold text-slate-800">{job.employerName}</span>
                      {job.employerVerified && (
                        <VerificationBadge 
                          type="employer" 
                          size="xs"
                          label={language === 'am' ? 'የተረጋገጠ አሠሪ' : 'Verified'} 
                          entityName={job.employerName}
                          entityAvatar={job.employerAvatar}
                        />
                      )}
                      <span className="text-slate-300">·</span>
                      <span className="flex items-center gap-1 text-slate-500">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{job.location}</span>
                      </span>
                      {job.isRemote && (
                        <>
                          <span className="text-slate-300">·</span>
                          <span className="text-[#16845B] font-medium">Remote OK</span>
                        </>
                      )}
                    </div>

                    {/* Job Title */}
                    <h3 
                      onClick={() => openModal('job_detail', job)}
                      className="font-ethiopic text-base sm:text-lg font-bold text-[#172033] group-hover:text-[#123B6D] transition-colors cursor-pointer"
                    >
                      {language === 'am' ? job.amharicTitle || job.title : job.title}
                    </h3>

                    {/* Description Snippet */}
                    <p className="font-ethiopic text-xs sm:text-sm text-slate-600 line-clamp-2 max-w-3xl leading-relaxed">
                      {language === 'am' ? job.descriptionAm || job.description : job.description}
                    </p>

                    {/* Skills tags as quiet unboxed text or minimal chips */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {job.skillsRequired.map((skill) => (
                        <span key={skill} className="text-xs text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded-md font-mono">
                          {skill}
                        </span>
                      ))}
                    </div>

                  </div>

                  {/* Right Column: Budget & Actions */}
                  <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-200 shrink-0">
                    <div className="text-left md:text-right">
                      <span className="text-xs text-slate-500 block">{t.jobBudget}</span>
                      <span className="text-base sm:text-lg font-bold text-[#08294F]">
                        {job.budget.toLocaleString()} {job.budgetCurrency}
                      </span>
                      <span className="text-[11px] text-slate-400 block">
                        {job.paymentType === 'monthly' ? (language === 'am' ? 'በወር' : 'per month') : (language === 'am' ? 'ቋሚ ክፍያ' : 'fixed budget')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleSaveItem(job.id)}
                        className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                          saved 
                            ? 'border-[#D4A72C] text-[#D4A72C] bg-[#D4A72C]/10' 
                            : 'border-slate-200 text-slate-400 hover:text-slate-700'
                        }`}
                        title={saved ? t.jobSaved : t.jobSave}
                      >
                        {saved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                      </button>

                      <button
                        onClick={() => openModal('job_detail', job)}
                        className="bg-[#123B6D] hover:bg-[#08294F] text-white px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-xs"
                      >
                        {t.jobApply}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Exact Posted Date, Hour & Minute Footer */}
                <div className="pt-3 border-t border-slate-100">
                  <PostedDateTime value={job.createdAt} language={language} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 2. FEATURED MARKETPLACE PRODUCTS (RETAIL & WHOLESALE) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#D4A72C] tracking-wider uppercase">
              <Package className="w-4 h-4" />
              <span>{language === 'am' ? 'ገበያና አስመጪዎች' : 'Marketplace & Wholesale'}</span>
            </div>
            <h2 className="font-ethiopic text-2xl font-extrabold text-[#08294F] mt-1">
              {t.marketplaceHeading}
            </h2>
            <p className="font-ethiopic text-xs sm:text-sm text-slate-500">
              {t.marketplaceSubheading}
            </p>
          </div>

          <button
            onClick={() => setActiveTab('marketplace')}
            className="text-xs sm:text-sm font-semibold text-[#123B6D] hover:text-[#08294F] flex items-center gap-1 cursor-pointer self-start sm:self-auto"
          >
            <span>{language === 'am' ? 'ሁሉንም ምርቶች ተመልከት' : 'Browse Marketplace'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((prod) => {
            const saved = isItemSaved(prod.id);
            return (
              <div
                key={prod.id}
                className="bg-white rounded-2xl border border-purple-100 overflow-hidden hover:border-purple-300 transition-all shadow-xs flex flex-col justify-between group"
              >
                <div>
                  {/* Product Image */}
                  <div 
                    onClick={() => openModal('product_detail', prod)}
                    className="relative aspect-4/3 overflow-hidden bg-slate-200 cursor-pointer"
                  >
                    <img
                      src={prod.imageUrl}
                      alt={prod.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {prod.moq && (
                      <span className="absolute top-2.5 left-2.5 bg-[#08294F] text-[#F3D77A] text-[10px] font-bold px-2 py-0.5 rounded-md">
                        B2B Wholesale · MOQ: {prod.moq}
                      </span>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSaveItem(prod.id);
                      }}
                      className={`absolute top-2.5 right-2.5 p-1.5 rounded-full backdrop-blur-xs transition-colors cursor-pointer ${
                        saved 
                          ? 'bg-white text-[#D4A72C]' 
                          : 'bg-black/30 text-white hover:bg-white hover:text-slate-800'
                      }`}
                    >
                      {saved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Content */}
                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="truncate max-w-[140px] font-medium text-slate-700">{prod.sellerName}</span>
                      {prod.sellerVerified && (
                        <VerificationBadge 
                          type="seller" 
                          size="xs" 
                          label={language === 'am' ? 'የተረጋገጠ ሻጭ' : 'Verified'}
                          entityName={prod.sellerName}
                          entityRole={language === 'am' ? 'የተረጋገጠ የገበያ ነጋዴ' : 'Verified Merchant'}
                          entityAvatar={prod.imageUrl}
                        />
                      )}
                    </div>

                    <h3 
                      onClick={() => openModal('product_detail', prod)}
                      className="font-ethiopic text-sm font-bold text-[#172033] group-hover:text-[#123B6D] transition-colors line-clamp-2 cursor-pointer leading-snug"
                    >
                      {language === 'am' ? prod.amharicTitle || prod.title : prod.title}
                    </h3>

                    <div className="flex items-center gap-1 text-[11px] text-slate-500">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span className="truncate">{prod.location}</span>
                    </div>
                  </div>
                </div>

                {/* Price and Action */}
                <div>
                  <div className="p-4 pt-3 border-t border-slate-100 flex items-center justify-between mt-2">
                    <div>
                      <span className="text-[10px] text-slate-400 block">{prod.wholesalePrice ? 'Wholesale/Retail' : 'Price'}</span>
                      <span className="text-base font-extrabold text-[#08294F]">
                        {prod.price.toLocaleString()} {prod.currency}
                      </span>
                    </div>

                    <button
                      onClick={() => openModal('product_detail', prod)}
                      className="text-xs font-semibold text-[#123B6D] hover:text-[#08294F] bg-white border border-slate-200 hover:border-[#123B6D] px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                    >
                      {language === 'am' ? 'ዝርዝር' : 'Details'}
                    </button>
                  </div>

                  {/* Exact Posted Date, Hour & Minute Footer */}
                  <div className="px-4 py-2.5 bg-slate-50/80 border-t border-slate-100">
                    <PostedDateTime value={prod.createdAt} language={language} />
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </section>

      {/* 3. VERIFIED BUSINESSES & IMPORTERS SPOTLIGHT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#08294F] text-white rounded-3xl p-6 sm:p-10 relative overflow-hidden">
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-3 text-center lg:text-left max-w-xl">
              <span className="text-[#D4A72C] text-xs font-bold uppercase tracking-wider">
                {language === 'am' ? 'የንግዶችና የአስመጪዎች ማውጫ' : 'Verified Business Ecosystem'}
              </span>
              <h2 className="font-ethiopic text-2xl sm:text-3xl font-extrabold text-white">
                {language === 'am' ? 'የኦርቶዶክሳውያን የንግድ ድርጅቶችና ፋብሪካዎች' : 'Orthodox Commercial Enterprises & Importers'}
              </h2>
              <p className="font-ethiopic text-xs sm:text-sm text-slate-300 leading-relaxed">
                {language === 'am' 
                  ? 'ከአስመጪዎች፣ ከአምራቾችና ከአከፋፋዮች ጋር በቀጥታ የሚተሳሰሩበት እና የታማኝ አጋሮችን ምርቶች የሚገበዩበት ማውጫ።'
                  : 'Connect directly with certified manufacturers, bulk importers, and wholesale distributors in Ethiopia.'
                }
              </p>
              <div className="pt-2">
                <button
                  onClick={() => setActiveTab('businesses')}
                  className="bg-[#D4A72C] hover:bg-[#c29623] text-[#08294F] font-bold px-6 py-3 rounded-xl text-xs sm:text-sm transition-all cursor-pointer shadow-md inline-flex items-center gap-2"
                >
                  <span>{language === 'am' ? 'ሁሉንም ንግዶች ያስሱ' : 'Explore All Enterprises'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick stats mini cards */}
            <div className="grid grid-cols-2 gap-3 w-full lg:w-auto">
              {businesses.slice(0, 4).map(biz => (
                <div 
                  key={biz.id}
                  onClick={() => setActiveTab('businesses')}
                  className="bg-white/10 backdrop-blur-xs p-3.5 rounded-xl border border-white/10 hover:bg-white/15 transition-colors cursor-pointer text-left"
                >
                  <p className="font-semibold text-xs sm:text-sm text-white truncate max-w-[160px]">{biz.name}</p>
                  <p className="text-[11px] text-slate-300 truncate max-w-[160px]">{biz.category}</p>
                  <span className="text-[10px] text-[#D4A72C] mt-1 block">✓ Verified {biz.type}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
