import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { VerificationBadge } from '../common/Badge';
import { 
  Briefcase, 
  MapPin, 
  Search, 
  Filter, 
  Bookmark, 
  BookmarkCheck, 
  Clock, 
  DollarSign, 
  PlusCircle, 
  CheckCircle2, 
  ChevronDown, 
  Sparkles, 
  FileText, 
  SlidersHorizontal, 
  Send, 
  Phone, 
  X,
  Code,
  Hammer,
  Scale,
  HeartPulse,
  GraduationCap,
  Wheat,
  Camera,
  Truck,
  RotateCcw,
  Building2,
  UserCheck,
  Compass
} from 'lucide-react';
import { Job } from '../../types';
import { Material3SectorSelector } from '../common/Material3SectorSelector';
import { SubCategory, SuperCategory, ALL_54_WORK_SUBCATEGORIES } from '../../data/workSectors';
import { PostedDateTime } from '../common/PostedDateTime';
import { getTimestampMs } from '../../utils/dateTime';

// Structured Industry Sectors for Jobs with Icons & Keywords
export interface JobIndustry {
  id: string;
  nameAm: string;
  nameEn: string;
  icon: React.ComponentType<{ className?: string }>;
  keywords: string[];
}

export const JOB_INDUSTRIES: JobIndustry[] = [
  { 
    id: 'all', 
    nameAm: 'ሁሉም የሥራ ዘርፎች', 
    nameEn: 'All Industries', 
    icon: Briefcase, 
    keywords: [] 
  },
  { 
    id: 'technology', 
    nameAm: 'ቴክኖሎጂና ሶፍትዌር', 
    nameEn: 'Technology & IT', 
    icon: Code, 
    keywords: ['tech', 'software', 'developer', 'react', 'node', 'app', 'code', 'ui/ux', 'ክላውድ', 'ሶፍትዌር', 'ቴክኖሎጂ'] 
  },
  { 
    id: 'construction', 
    nameAm: 'ግንባታና እደ-ጥበብ', 
    nameEn: 'Construction & Trades', 
    icon: Hammer, 
    keywords: ['construction', 'carpentry', 'wood', 'timber', 'architect', 'civil', 'electric', 'joinery', 'ግንባታ', 'አናጢ', 'እንጨት', 'ሥነ-ሕንፃ'] 
  },
  { 
    id: 'business_finance', 
    nameAm: 'ፋይናንስ፣ ንግድና ሕግ', 
    nameEn: 'Finance & Business', 
    icon: Scale, 
    keywords: ['finance', 'accounting', 'auditor', 'tax', 'cpa', 'business', 'law', 'legal', 'ሒሳብ', 'ታክስ', 'ኦዲት', 'ፋይናንስ'] 
  },
  { 
    id: 'healthcare', 
    nameAm: 'ጤናና ክብካቤ', 
    nameEn: 'Healthcare & Wellbeing', 
    icon: HeartPulse, 
    keywords: ['health', 'pharmacist', 'clinic', 'nursing', 'medical', 'therapy', 'ጤና', 'ፋርማሲ', 'ነርሲንግ', 'ሕክምና'] 
  },
  { 
    id: 'education', 
    nameAm: 'ትምህርትና አብነት', 
    nameEn: 'Education & Sunday School', 
    icon: GraduationCap, 
    keywords: ['education', 'teacher', 'physics', 'math', 'tutor', 'academic', 'stem', 'sunday school', 'ትምህርት', 'መምህር', 'ሰንበት'] 
  },
  { 
    id: 'sacred_arts', 
    nameAm: 'ቅዱሳት ጥበባትና ቅርስ', 
    nameEn: 'Sacred Arts & Iconography', 
    icon: Sparkles, 
    keywords: ['sacred', 'iconography', 'fresco', "ge'ez", 'manuscript', 'church art', 'liturgical', 'ቅዱሳት', 'ሥዕላት', 'ግዕዝ', 'ብራና'] 
  },
  { 
    id: 'agriculture', 
    nameAm: 'ግብርናና አግሮ-ቢዝነስ', 
    nameEn: 'Agriculture & Farming', 
    icon: Wheat, 
    keywords: ['agriculture', 'agro', 'horticulture', 'farm', 'honey', 'greenhouse', 'irrigation', 'ግብርና', 'እርሻ', 'አትክልት', 'መስኖ'] 
  },
  { 
    id: 'media_arts', 
    nameAm: 'ሚዲያ፣ ማርኬቲንግና ዲዛይን', 
    nameEn: 'Media & Marketing', 
    icon: Camera, 
    keywords: ['marketing', 'media', 'social media', 'graphic', 'video', 'content', 'ማርኬቲንግ', 'ሽያጭ', 'ሚዲያ', 'ቪዲዮ'] 
  },
  { 
    id: 'logistics', 
    nameAm: 'ትራንስፖርትና ሎጅስቲክስ', 
    nameEn: 'Logistics & Transport', 
    icon: Truck, 
    keywords: ['logistics', 'transport', 'freight', 'truck', 'driver', 'dispatch', 'fleet', 'ትራንስፖርት', 'ሎጅስቲክስ', 'ጭነት', 'ሾፌር'] 
  },
];

// Curated Specific Professions/Roles for instant precision filtering
export interface ProfessionRole {
  id: string;
  nameAm: string;
  nameEn: string;
  industryId: string;
  keywords: string[];
}

export const POPULAR_PROFESSIONS: ProfessionRole[] = [
  { id: 'all', nameAm: 'ሁሉም ሙያዎች / Roles', nameEn: 'All Professions / Roles', industryId: 'all', keywords: [] },
  // Tech
  { id: 'swe_frontend', nameAm: 'የሶፍትዌርና ሪአክት አበልጻጊ', nameEn: 'React / Full-Stack Engineer', industryId: 'technology', keywords: ['react', 'developer', 'software', 'typescript', 'frontend', 'አበልጻጊ'] },
  { id: 'tech_mobile', nameAm: 'የሞባይል አፕሊኬሽን አበልጻጊ', nameEn: 'Mobile App Developer', industryId: 'technology', keywords: ['mobile', 'android', 'flutter', 'ios', 'ሞባይል'] },
  // Finance
  { id: 'fin_accountant', nameAm: 'የሒሳብ ሹም እና የታክስ ኦዲተር', nameEn: 'Chartered Accountant / Tax Auditor', industryId: 'business_finance', keywords: ['accountant', 'tax', 'auditor', 'cpa', 'erca', 'peachtree', 'ሒሳብ', 'ኦዲተር'] },
  // Construction & Trades
  { id: 'const_carpenter', nameAm: 'የእንጨት ቅርጻና አናጢነት', nameEn: 'Master Wood Carver & Joiner', industryId: 'construction', keywords: ['carpenter', 'wood carving', 'joinery', 'millwork', 'አናጢ', 'እንጨት'] },
  { id: 'const_architect', nameAm: 'ሥነ-ሕንፃና መዋቅራዊ ምህንድስና', nameEn: 'Architect & Structural Engineer', industryId: 'construction', keywords: ['architect', 'civil', 'bim', 'cad', 'ሥነ-ሕንፃ', 'ምህንድስና'] },
  // Healthcare
  { id: 'health_pharmacist', nameAm: 'ክሊኒካል ፋርማሲስትና የጤና ባለሙያ', nameEn: 'Clinical Pharmacist & Health Specialist', industryId: 'healthcare', keywords: ['pharmacist', 'clinic', 'pharmacy', 'health', 'ፋርማሲ', 'ጤና'] },
  // Education
  { id: 'edu_stem_teacher', nameAm: 'የሳይንስ/ማቲማቲክስ መምህር', nameEn: 'STEM & Secondary School Teacher', industryId: 'education', keywords: ['physics', 'mathematics', 'teacher', 'science', 'መምህር', 'ሳይንስ'] },
  // Sacred Arts
  { id: 'art_iconographer', nameAm: 'የቤተክርስቲያን ቅዱሳት ሥዕላት ሠዓሊ', nameEn: 'Orthodox Church Mural Iconographer', industryId: 'sacred_arts', keywords: ['iconographer', 'mural', 'fresco', 'egg tempera', 'ቅዱሳት ሥዕላት', 'ሠዓሊ'] },
  { id: 'art_geez_translator', nameAm: 'የግዕዝ ብራናና ሥነ-ጽሑፍ ተርጓሚ', nameEn: "Ge'ez Liturgical Translator & Scholar", industryId: 'sacred_arts', keywords: ["ge'ez", 'manuscript', 'theological', 'translation', 'ግዕዝ', 'ብራና', 'ተርጓሚ'] },
  // Agriculture
  { id: 'agri_horticulture', nameAm: 'የግሪንሃውስና የመስኖ ግብርና ባለሙያ', nameEn: 'Horticulturist & Irrigation Specialist', industryId: 'agriculture', keywords: ['greenhouse', 'irrigation', 'agronomy', 'horticulture', 'ግብርና', 'መስኖ'] },
  // Marketing & Media
  { id: 'media_marketer', nameAm: 'የዲጂታል ማርኬቲንግና ሚዲያ አስተዳዳሪ', nameEn: 'Digital Marketing & Social Specialist', industryId: 'media_arts', keywords: ['marketing', 'social media', 'telegram', 'ማርኬቲንግ', 'ማኅበራዊ ሚዲያ'] },
  // Logistics
  { id: 'log_dispatcher', nameAm: 'የከባድ ጭነትና የጉዞ አስተባባሪ', nameEn: 'Freight Dispatcher & Logistics Coordinator', industryId: 'logistics', keywords: ['freight', 'dispatcher', 'fleet', 'truck', 'ጭነት', 'ሎጅስቲክስ'] },
];

export const JobsView: React.FC = () => {
  const { 
    t, 
    language, 
    jobs, 
    openModal, 
    currentUser, 
    isItemSaved, 
    toggleSaveItem,
    searchQuery,
    setSearchQuery,
    selectedLocation,
    setSelectedLocation,
    selectedTypeFilter
  } = useApp();

  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');
  const [selectedProfession, setSelectedProfession] = useState<string>('all');
  const [selectedSubSector, setSelectedSubSector] = useState<SubCategory | null>(null);
  const [selectedSuperSector, setSelectedSuperSector] = useState<SuperCategory | null>(null);
  const [showSectorSelector, setShowSectorSelector] = useState<boolean>(false);
  const [selectedEmploymentType, setSelectedEmploymentType] = useState<string>('all');
  const [selectedExperienceLevel, setSelectedExperienceLevel] = useState<string>('all');
  const [selectedBudgetRange, setSelectedBudgetRange] = useState<string>('all');
  const [remoteOnly, setRemoteOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'newest' | 'budget_high' | 'proposals'>('newest');

  useEffect(() => {
    if (selectedTypeFilter === 'GIG') {
      setSelectedEmploymentType('GIG');
    } else if (selectedTypeFilter === 'all') {
      setSelectedEmploymentType('all');
    }
  }, [selectedTypeFilter]);

  // Compute live count of jobs per industry for interactive badge badges
  const industryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: jobs.length };
    JOB_INDUSTRIES.forEach(ind => {
      if (ind.id === 'all') return;
      counts[ind.id] = jobs.filter(j => {
        const text = `${j.title} ${j.amharicTitle} ${j.category} ${j.description} ${(j.skillsRequired || []).join(' ')}`.toLowerCase();
        return ind.keywords.some(k => text.includes(k.toLowerCase()));
      }).length;
    });
    return counts;
  }, [jobs]);

  // Dynamic list of professions filtered by selected industry (if chosen)
  const availableProfessions = useMemo(() => {
    if (selectedIndustry === 'all') {
      return POPULAR_PROFESSIONS;
    }
    const matching = POPULAR_PROFESSIONS.filter(p => p.industryId === 'all' || p.industryId === selectedIndustry);
    return matching.length > 1 ? matching : POPULAR_PROFESSIONS;
  }, [selectedIndustry]);

  // Main Filtering logic matching Industry, Profession, Type, Budget, Location & Keywords
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const q = localSearch.toLowerCase().trim();
      const jobCombinedText = `${job.title} ${job.amharicTitle} ${job.category} ${job.categoryAm || ''} ${job.description} ${job.descriptionAm || ''} ${(job.skillsRequired || []).join(' ')}`.toLowerCase();

      // 1. Text Search matching
      const matchQuery = !q || 
        job.title.toLowerCase().includes(q) || 
        job.amharicTitle.toLowerCase().includes(q) || 
        job.description.toLowerCase().includes(q) ||
        job.skillsRequired.some(s => s.toLowerCase().includes(q));

      // 2. Industry matching
      let matchIndustry = true;
      if (selectedIndustry !== 'all') {
        const indObj = JOB_INDUSTRIES.find(i => i.id === selectedIndustry);
        if (indObj) {
          matchIndustry = indObj.keywords.some(k => jobCombinedText.includes(k.toLowerCase()));
        }
      }

      // 3. Profession / Specific Role matching
      let matchProfession = true;
      if (selectedProfession !== 'all') {
        const profObj = POPULAR_PROFESSIONS.find(p => p.id === selectedProfession);
        if (profObj && profObj.keywords.length > 0) {
          matchProfession = profObj.keywords.some(k => jobCombinedText.includes(k.toLowerCase()));
        }
      }

      // 4. Material 3 Deep 54-Sector matching (if selected)
      let matchSector = true;
      if (selectedSubSector) {
        const keywords = [
          selectedSubSector.nameAm.toLowerCase(),
          selectedSubSector.nameEn.toLowerCase(),
          ...(selectedSubSector.keywords || []).map(k => k.toLowerCase())
        ];
        matchSector = keywords.some(k => jobCombinedText.includes(k)) || 
          Boolean(selectedSuperSector && job.category.toLowerCase().includes(selectedSuperSector.nameEn.toLowerCase().split(' ')[0]));
      }

      // 5. Employment / Project Type
      const matchType =
        selectedEmploymentType === 'all' ||
        job.projectType?.toLowerCase() === selectedEmploymentType.toLowerCase() ||
        (selectedEmploymentType === 'GIG' &&
          (job.projectType === 'GIG' || job.projectType === 'one-time' || job.projectType === 'FIXED_PRICE'));

      // 6. Experience Level
      const matchExperience = selectedExperienceLevel === 'all' || job.experienceLevel === selectedExperienceLevel;

      // 7. Budget / Salary Range
      let matchBudget = true;
      if (selectedBudgetRange !== 'all') {
        if (selectedBudgetRange === 'under_30k') matchBudget = job.budget < 30000;
        else if (selectedBudgetRange === '30k_50k') matchBudget = job.budget >= 30000 && job.budget <= 50000;
        else if (selectedBudgetRange === '50k_80k') matchBudget = job.budget > 50000 && job.budget <= 80000;
        else if (selectedBudgetRange === 'above_80k') matchBudget = job.budget > 80000;
      }

      // 8. Location & Remote
      const matchLoc = selectedLocation === 'All' || job.location.toLowerCase().includes(selectedLocation.toLowerCase().split(' ')[0]);
      const matchRemote = !remoteOnly || job.isRemote;

      return matchQuery && matchIndustry && matchProfession && matchSector && matchType && matchExperience && matchBudget && matchLoc && matchRemote;
    }).sort((a, b) => {
      if (sortBy === 'budget_high') return b.budget - a.budget;
      if (sortBy === 'proposals') return b.proposalsCount - a.proposalsCount;
      return getTimestampMs(b.createdAt) - getTimestampMs(a.createdAt);
    });
  }, [
    jobs, 
    localSearch, 
    selectedIndustry, 
    selectedProfession, 
    selectedSubSector, 
    selectedSuperSector, 
    selectedEmploymentType, 
    selectedExperienceLevel, 
    selectedBudgetRange, 
    selectedLocation, 
    remoteOnly, 
    sortBy
  ]);

  // Check if any non-default filters are active
  const hasActiveFilters = Boolean(
    localSearch || 
    selectedIndustry !== 'all' || 
    selectedProfession !== 'all' || 
    selectedSubSector || 
    selectedEmploymentType !== 'all' || 
    selectedExperienceLevel !== 'all' || 
    selectedBudgetRange !== 'all' || 
    selectedLocation !== 'All' || 
    remoteOnly
  );

  const resetAllFilters = () => {
    setLocalSearch('');
    setSelectedIndustry('all');
    setSelectedProfession('all');
    setSelectedSubSector(null);
    setSelectedSuperSector(null);
    setSelectedEmploymentType('all');
    setSelectedExperienceLevel('all');
    setSelectedBudgetRange('all');
    setSelectedLocation('All');
    setRemoteOnly(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#123B6D] uppercase tracking-wider">
            <Briefcase className="w-4 h-4" />
            <span>{language === 'am' ? 'የሥራና የቅጥር ገበያ' : 'Employment Marketplace'}</span>
          </div>
          <h1 className="font-ethiopic text-3xl font-extrabold text-[#08294F] mt-1">
            {t.jobsHeading}
          </h1>
          <p className="font-ethiopic text-sm text-slate-500">
            {t.jobsSubheading}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
          <button
            onClick={() => openModal('cv_upload')}
            className="bg-white hover:bg-purple-50 text-[#3B1C54] border border-purple-200 hover:border-purple-300 px-4 py-2.5 rounded-xl text-sm font-bold font-ethiopic transition-all shadow-2xs cursor-pointer flex items-center justify-center gap-2"
          >
            <FileText className="w-4 h-4 text-[#3B1C54]" />
            <span>{language === 'am' ? '📄 CV አስገባ / ጫን' : 'Upload CV / Resume'}</span>
            {currentUser?.cvFile && (
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            )}
          </button>

          <button
            onClick={() => openModal('post', { defaultType: 'job' })}
            className="bg-[#123B6D] hover:bg-[#08294F] text-white px-5 py-2.5 rounded-xl text-sm font-semibold font-ethiopic transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
          >
            <PlusCircle className="w-4 h-4 text-[#D4A72C]" />
            <span>{language === 'am' ? 'ክፍት የሥራ ቦታ ለጥፍ' : 'Post a Job Vacancy'}</span>
          </button>
        </div>
      </div>

      {/* Quick Industry Filter Pills Bar (Horizontal Scroll) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 font-ethiopic flex items-center gap-1.5 uppercase tracking-wide">
            <Compass className="w-3.5 h-3.5 text-[#123B6D]" />
            <span>{language === 'am' ? 'የሥራ ዘርፍ / ኢንዱስትሪ ይምረጡ' : 'Filter By Industry Sector'}</span>
          </span>
          <span className="text-xs text-slate-500 font-medium">
            {filteredJobs.length} {language === 'am' ? 'ክፍት የሥራ ቦታዎች' : 'vacancies'}
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 no-scrollbar scroll-smooth">
          {JOB_INDUSTRIES.map((ind) => {
            const Icon = ind.icon;
            const isSelected = selectedIndustry === ind.id;
            const count = industryCounts[ind.id] || 0;

            return (
              <button
                key={ind.id}
                onClick={() => {
                  setSelectedIndustry(ind.id);
                  // Reset specific profession if it doesn't match new industry
                  if (ind.id !== 'all' && selectedProfession !== 'all') {
                    const prof = POPULAR_PROFESSIONS.find(p => p.id === selectedProfession);
                    if (prof && prof.industryId !== ind.id && prof.industryId !== 'all') {
                      setSelectedProfession('all');
                    }
                  }
                }}
                className={`px-3.5 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap flex items-center gap-2 transition-all cursor-pointer shrink-0 font-ethiopic border ${
                  isSelected
                    ? 'bg-[#123B6D] text-white border-[#123B6D] shadow-md shadow-[#123B6D]/15 scale-[1.02]'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200/90 hover:border-slate-300 shadow-2xs'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-[#FDE047]' : 'text-slate-500'}`} />
                <span>{language === 'am' ? ind.nameAm : ind.nameEn}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                  isSelected 
                    ? 'bg-white/20 text-white' 
                    : 'bg-slate-100 text-slate-600'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Multi-Factor Filter & Search Dashboard */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 hover:border-slate-300 shadow-xs space-y-3.5">
        
        {/* Row 1: Search + Profession Selector + Material 3 Selector Toggle */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          
          {/* Keyword Search Input */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder={language === 'am' ? 'በሥራ መደብ፣ በሙያ፣ በድርጅት ወይም በክህሎት ይፈልጉ...' : 'Search jobs by title, skills, employer...'}
              className="w-full pl-9 pr-8 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#123B6D]/20 focus:border-[#123B6D] font-ethiopic"
            />
            {localSearch && (
              <button 
                onClick={() => setLocalSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Specific Profession / Role Dropdown */}
          <div className="md:col-span-4">
            <div className="relative">
              <select
                value={selectedProfession}
                onChange={(e) => setSelectedProfession(e.target.value)}
                aria-label="Filter by Specific Profession"
                className="w-full px-3 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 font-bold font-ethiopic focus:outline-none focus:ring-2 focus:ring-[#123B6D]/20 focus:border-[#123B6D] cursor-pointer appearance-none pr-8"
              >
                {availableProfessions.map(prof => (
                  <option key={prof.id} value={prof.id}>
                    {prof.id === 'all' 
                      ? (language === 'am' ? '🎯 የተለየ ሙያ / Specific Role (ሁሉም)' : '🎯 All Specific Roles')
                      : (language === 'am' ? `🎯 ${prof.nameAm}` : `🎯 ${prof.nameEn}`)}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* 54-Sector Explorer Button */}
          <div className="md:col-span-3">
            <button
              type="button"
              onClick={() => setShowSectorSelector(!showSectorSelector)}
              className={`w-full px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold font-ethiopic flex items-center justify-between gap-1.5 border transition-all cursor-pointer ${
                selectedSubSector
                  ? 'bg-amber-100/70 border-amber-300 text-amber-950 shadow-2xs'
                  : 'bg-[#F8FAFC] border-slate-200 text-slate-700 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-1.5 truncate">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#123B6D] shrink-0" />
                <span className="truncate">
                  {selectedSubSector 
                    ? (language === 'am' ? selectedSubSector.nameAm : selectedSubSector.nameEn)
                    : (language === 'am' ? '54ቱ ዝርዝር ዘርፎች...' : '54 Sectors...')}
                </span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform ${showSectorSelector ? 'rotate-180' : ''}`} />
            </button>
          </div>

        </div>

        {/* Row 2: Employment Type, Experience Level, Salary Range, Location, Sort */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-1">
          
          {/* Employment Type */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 block mb-1 font-ethiopic uppercase">
              {language === 'am' ? 'የሥራ ዓይነት' : 'Job Type'}
            </label>
            <select
              value={selectedEmploymentType}
              onChange={(e) => setSelectedEmploymentType(e.target.value)}
              className="w-full p-2 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs text-slate-700 font-semibold focus:outline-none focus:ring-1 focus:ring-[#123B6D] cursor-pointer font-ethiopic"
            >
              <option value="all">{language === 'am' ? 'ሁሉም ዓይነቶች' : 'All Types'}</option>
              <option value="GIG">{language === 'am' ? 'ፍሪላንስ / ጊግ (Gig)' : 'Freelance / Gig'}</option>
              <option value="FIXED_PRICE">{language === 'am' ? 'ቁርጥ ዋጋ (Fixed Price)' : 'Fixed Price'}</option>
              <option value="HOURLY">{language === 'am' ? 'በሰዓት (Hourly)' : 'Hourly'}</option>
              <option value="full-time">{language === 'am' ? 'ሙሉ ጊዜ (Full-time)' : 'Full-time'}</option>
              <option value="contract">{language === 'am' ? 'ኮንትራት (Contract)' : 'Contract'}</option>
            </select>
          </div>

          {/* Experience Level */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 block mb-1 font-ethiopic uppercase">
              {language === 'am' ? 'የልምድ ደረጃ' : 'Experience'}
            </label>
            <select
              value={selectedExperienceLevel}
              onChange={(e) => setSelectedExperienceLevel(e.target.value)}
              className="w-full p-2 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs text-slate-700 font-semibold focus:outline-none focus:ring-1 focus:ring-[#123B6D] cursor-pointer font-ethiopic"
            >
              <option value="all">{language === 'am' ? 'ሁሉም ደረጃ' : 'All Levels'}</option>
              <option value="entry">{language === 'am' ? 'ጀማሪ (Entry Level)' : 'Entry Level'}</option>
              <option value="intermediate">{language === 'am' ? 'መካከለኛ (Mid-Level)' : 'Intermediate'}</option>
              <option value="expert">{language === 'am' ? 'ሲኒየር / ሊቅ (Expert)' : 'Expert / Senior'}</option>
            </select>
          </div>

          {/* Budget / Salary Range */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 block mb-1 font-ethiopic uppercase">
              {language === 'am' ? 'ደመወዝ / በጀት' : 'Salary / Budget'}
            </label>
            <select
              value={selectedBudgetRange}
              onChange={(e) => setSelectedBudgetRange(e.target.value)}
              className="w-full p-2 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs text-slate-700 font-semibold focus:outline-none focus:ring-1 focus:ring-[#123B6D] cursor-pointer font-ethiopic"
            >
              <option value="all">{language === 'am' ? 'ሁሉም በጀት' : 'Any Budget'}</option>
              <option value="under_30k">{language === 'am' ? 'ከ 30,000 ብር በታች' : 'Under 30,000 ETB'}</option>
              <option value="30k_50k">{language === 'am' ? '30,000 - 50,000 ብር' : '30k - 50k ETB'}</option>
              <option value="50k_80k">{language === 'am' ? '50,000 - 80,000 ብር' : '50k - 80k ETB'}</option>
              <option value="above_80k">{language === 'am' ? 'ከ 80,000 ብር በላይ' : '80,000+ ETB'}</option>
            </select>
          </div>

          {/* Location Dropdown */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 block mb-1 font-ethiopic uppercase">
              {language === 'am' ? 'አካባቢ / ከተማ' : 'City / Location'}
            </label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full p-2 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs text-slate-700 font-semibold focus:outline-none focus:ring-1 focus:ring-[#123B6D] cursor-pointer font-ethiopic"
            >
              <option value="All">{language === 'am' ? 'ሁሉም ከተሞች' : 'All Cities'}</option>
              <option value="Addis Ababa">አዲስ አበባ (Addis Ababa)</option>
              <option value="Bahir Dar">ባሕር ዳር (Bahir Dar)</option>
              <option value="Gondar">ጎንደር (Gondar)</option>
              <option value="Hawassa">ሐዋሳ (Hawassa)</option>
              <option value="Debre Zeit">ደብረ ዘይት (Bishoftu)</option>
            </select>
          </div>

          {/* Sort Order */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 block mb-1 font-ethiopic uppercase">
              {language === 'am' ? 'ቅደም ተከተል' : 'Sort By'}
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full p-2 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs text-slate-700 font-semibold focus:outline-none focus:ring-1 focus:ring-[#123B6D] cursor-pointer font-ethiopic"
            >
              <option value="newest">{language === 'am' ? 'አዲስ የተለጠፉ' : 'Newest'}</option>
              <option value="budget_high">{language === 'am' ? 'ከፍተኛ ደመወዝ' : 'Highest Budget'}</option>
              <option value="proposals">{language === 'am' ? 'ተፈላጊ / ማመልከቻ' : 'Most Popular'}</option>
            </select>
          </div>

          {/* Remote Only Toggle */}
          <div className="flex items-end pb-1">
            <label className="w-full flex items-center gap-2 p-2 rounded-xl bg-[#F8FAFC] border border-slate-200 text-xs font-semibold text-slate-700 cursor-pointer select-none hover:bg-slate-100 transition-colors">
              <input
                type="checkbox"
                checked={remoteOnly}
                onChange={(e) => setRemoteOnly(e.target.checked)}
                className="w-3.5 h-3.5 text-[#123B6D] rounded border-slate-300 focus:ring-[#123B6D]"
              />
              <span className="truncate">{language === 'am' ? 'የርቀት (Remote)' : 'Remote Only'}</span>
            </label>
          </div>

        </div>

        {/* Expandable Material 3 Sector Component */}
        {showSectorSelector && (
          <div className="pt-3 border-t border-slate-100 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-2 mb-2">
              <span className="text-xs font-bold text-slate-700 font-ethiopic flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#D4A72C]" />
                <span>{language === 'am' ? 'ከ 54ቱ ዝርዝር የሥራና የአገልግሎት ዘርፎች ይምረጡ' : 'Select from 54 Material 3 Job & Trade Sectors'}</span>
              </span>
              <button
                type="button"
                onClick={() => setShowSectorSelector(false)}
                className="text-xs text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <Material3SectorSelector
              selectedSubCategoryId={selectedSubSector?.id}
              language={language}
              onSelect={(sub, superCat) => {
                setSelectedSubSector(sub);
                setSelectedSuperSector(superCat);
                setShowSectorSelector(false);
              }}
              onClear={() => {
                setSelectedSubSector(null);
                setSelectedSuperSector(null);
              }}
            />
          </div>
        )}

      </div>

      {/* Active Filter Badges Bar */}
      {hasActiveFilters && (
        <div className="flex items-center flex-wrap gap-2 text-xs pt-1">
          <span className="font-bold text-slate-500 font-ethiopic">
            {language === 'am' ? 'ንቁ ማጣሪያዎች፦' : 'Active Filters:'}
          </span>

          {selectedIndustry !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#123B6D]/10 text-[#123B6D] font-bold border border-[#123B6D]/20">
              <span>{language === 'am' ? 'ዘርፍ፦' : 'Industry:'} {JOB_INDUSTRIES.find(i => i.id === selectedIndustry)?.nameAm}</span>
              <button onClick={() => setSelectedIndustry('all')} className="hover:opacity-75 cursor-pointer">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {selectedProfession !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-50 text-purple-900 font-bold border border-purple-200">
              <span>{language === 'am' ? 'ሙያ፦' : 'Role:'} {POPULAR_PROFESSIONS.find(p => p.id === selectedProfession)?.nameAm}</span>
              <button onClick={() => setSelectedProfession('all')} className="hover:opacity-75 cursor-pointer">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {selectedSubSector && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 font-bold border border-amber-200">
              <span>54 Sector: {selectedSubSector.nameAm}</span>
              <button onClick={() => setSelectedSubSector(null)} className="hover:opacity-75 cursor-pointer">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {selectedEmploymentType !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-semibold border border-slate-200">
              <span>Type: {selectedEmploymentType}</span>
              <button onClick={() => setSelectedEmploymentType('all')} className="hover:opacity-75 cursor-pointer">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {selectedExperienceLevel !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-semibold border border-slate-200">
              <span>Level: {selectedExperienceLevel}</span>
              <button onClick={() => setSelectedExperienceLevel('all')} className="hover:opacity-75 cursor-pointer">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {selectedBudgetRange !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200">
              <span>Budget Filter</span>
              <button onClick={() => setSelectedBudgetRange('all')} className="hover:opacity-75 cursor-pointer">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {selectedLocation !== 'All' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-50 text-sky-800 font-semibold border border-sky-200">
              <span>Location: {selectedLocation}</span>
              <button onClick={() => setSelectedLocation('All')} className="hover:opacity-75 cursor-pointer">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {remoteOnly && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200">
              <span>Remote Only</span>
              <button onClick={() => setRemoteOnly(false)} className="hover:opacity-75 cursor-pointer">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {localSearch && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-semibold border border-slate-200">
              <span>"{localSearch}"</span>
              <button onClick={() => setLocalSearch('')} className="hover:opacity-75 cursor-pointer">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          <button
            onClick={resetAllFilters}
            className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 ml-auto cursor-pointer font-ethiopic"
          >
            <RotateCcw className="w-3 h-3" />
            <span>{language === 'am' ? 'ሁሉንም ማጣሪያዎች አጽዳ' : 'Clear All Filters'}</span>
          </button>
        </div>
      )}

      {/* Jobs List */}
      {filteredJobs.length > 0 ? (
        <div className="space-y-4">
          {filteredJobs.map((job) => {
            const saved = isItemSaved(job.id);
            return (
              <div
                key={job.id}
                className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 hover:border-[#123B6D]/50 transition-all shadow-xs hover:shadow-md flex flex-col gap-4 group"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                  <div className="space-y-3 flex-1">
                    
                    {/* Employer Header */}
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                      <span className="font-semibold text-slate-900">{job.employerName}</span>
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
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{job.location}</span>
                      </span>
                      {job.isRemote && (
                        <>
                          <span className="text-slate-300">·</span>
                          <span className="text-[#16845B] font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 text-[10px]">Remote</span>
                        </>
                      )}
                      <span className="text-slate-300">·</span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 capitalize font-mono">
                        {job.projectType}
                      </span>
                      <span className="text-slate-300">·</span>
                      <span className="bg-purple-50 text-purple-900 border border-purple-200/80 px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 shrink-0">
                        <Sparkles className="w-2.5 h-2.5 text-[#D4A72C]" />
                        <span>{Math.min(96, Math.max(55, Math.round((job.skillsRequired.filter(s => (currentUser?.skills || []).some(us => us.toLowerCase().includes(s.toLowerCase()))).length / (job.skillsRequired.length || 1)) * 50 + 45)))}% Match</span>
                      </span>
                    </div>

                    {/* Title */}
                    <h3
                      onClick={() => openModal('job_detail', job)}
                      className="font-ethiopic text-base sm:text-lg font-bold text-[#172033] group-hover:text-[#123B6D] transition-colors cursor-pointer"
                    >
                      {language === 'am' ? job.amharicTitle || job.title : job.title}
                    </h3>

                    {job.isFlagged && (
                      <div className="bg-rose-50 border border-rose-200 text-rose-800 p-2 rounded-xl text-xs font-semibold flex items-center gap-2">
                        <span className="font-bold text-rose-700">🚩 የታገደ ልጥፍ (Flagged Post):</span>
                        <span>{job.flagReason || 'በአስተዳዳሪው ክትትል ስር ያለ'}</span>
                      </div>
                    )}

                    {/* Description */}
                    <p className="font-ethiopic text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed max-w-3xl">
                      {language === 'am' ? job.descriptionAm || job.description : job.description}
                    </p>

                    {/* Skills tags */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {job.skillsRequired.map((skill) => (
                        <span key={skill} className="text-xs text-slate-600 bg-[#F8FAFC] border border-slate-200 px-2.5 py-0.5 rounded-md font-mono">
                          {skill}
                        </span>
                      ))}
                      <span className="text-slate-300 mx-1">·</span>
                      <span className="text-xs text-slate-500 font-ethiopic">
                        {job.proposalsCount} {language === 'am' ? 'ማመልከቻዎች' : 'proposals'}
                      </span>
                    </div>

                  </div>

                  {/* Right: Budget & CTA */}
                  <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 shrink-0">
                    <div className="text-left md:text-right">
                      <span className="text-xs text-slate-400 block">{t.jobBudget}</span>
                      <span className="text-base sm:text-lg font-bold text-[#08294F]">
                        {job.budget.toLocaleString()} {job.budgetCurrency}
                      </span>
                      <span className="text-[11px] text-slate-400 block capitalize">
                        {job.paymentType}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <a
                        href={`https://t.me/${(job.employerTelegram || 'orthodoxy_economy').replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={language === 'am' ? 'በቴሌግራም አውራ' : 'Direct Telegram'}
                        className="p-2 rounded-lg bg-[#0088cc]/10 hover:bg-[#0088cc] text-[#0088cc] hover:text-white transition-all cursor-pointer flex items-center justify-center border border-[#0088cc]/30"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Send className="w-4 h-4" />
                      </a>

                      <a
                        href={`tel:${job.employerPhone || '+251922901083'}`}
                        title={language === 'am' ? 'በስልክ ደውል' : 'Direct Call'}
                        className="p-2 rounded-lg bg-emerald-50 hover:bg-emerald-600 text-emerald-600 hover:text-white transition-all cursor-pointer flex items-center justify-center border border-emerald-200"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Phone className="w-4 h-4" />
                      </a>

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
                        className="bg-[#123B6D] hover:bg-[#08294F] text-white px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-xs font-ethiopic"
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
      ) : (
        /* Empty State */
        <div className="bg-white rounded-2xl p-12 text-center border border-[#E2E8F0] space-y-3">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-ethiopic text-lg font-bold text-slate-700">
            {language === 'am' ? 'በተመረጡት ማጣሪያዎች መሠረት ምንም ክፍት የሥራ ቦታ አልተገኘም' : 'No job vacancies found matching active filters'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto font-ethiopic">
            {language === 'am' ? 'እባክዎ የተለየ የሥራ ዘርፍ ወይም ሙያ ይምረጡ፤ ወይም ማጣሪያዎችን ያጽዱ።' : 'Try selecting another industry or profession, or clear active filters.'}
          </p>
          <button
            onClick={resetAllFilters}
            className="bg-[#123B6D] text-white px-4 py-2 rounded-xl text-xs font-semibold mt-2 cursor-pointer font-ethiopic"
          >
            {language === 'am' ? 'ማጣሪያዎችን አጽዳ' : t.clearFilters}
          </button>
        </div>
      )}

    </div>
  );
};
