import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  Language,
  ActiveTab,
  ContentFeedCategory,
  UserProfile,
  Job,
  Product,
  Service,
  Business,
  Professional,
  Proposal,
  ProposalStatus,
  Conversation,
  ChatMessage,
  NotificationItem,
  NotificationType,
  OpportunityType,
  Review,
  Report,
  CompletedJob,
  PrayerRequest,
  PrayerComment,
  SuccessStory,
  SuccessStoryCategory,
  UserRole,
  normalizeUserRole,
} from '../types';
import { translations } from '../lib/translations';
import { db, auth } from '../lib/firebase';
import { DEFAULT_AVATAR_URL } from '../constants/assets';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut as firebaseSignOut,
  updateProfile as updateFirebaseProfile,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  collection,
  getDoc,
  getDocs,
  doc,
  updateDoc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrors';
import { getTimestampMs, parseFirestoreTimestamp } from '../utils/dateTime';

export const SUPER_ADMIN_EMAILS = [
  'andupaman3@gmail.com',
  'habtamweday1@gmail.com',
  'admin@orthodoxy.et',
];

export const isSuperAdminEmail = (email?: string | null): boolean => {
  if (!email) return false;
  const clean = email.toLowerCase().trim();
  return SUPER_ADMIN_EMAILS.some((e) => e.toLowerCase() === clean);
};

export const parseTimestamp = (
  val: any,
  fallbackId?: string,
  secondaryVal?: any
): string => parseFirestoreTimestamp(val, fallbackId, secondaryVal);

const normalizeVerificationStatus = (val: any): UserProfile['verificationStatus'] => {
  const s = String(val || '').toLowerCase();
  if (s === 'verified') return 'verified';
  if (s === 'pending') return 'pending';
  if (s === 'rejected') return 'rejected';
  return 'unverified';
};

interface SignInResult {
  success: boolean;
  error?: string;
}

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations['am'];

  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;

  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;

  contentFeedCategory: ContentFeedCategory;
  setContentFeedCategory: (cat: ContentFeedCategory) => void;
  selectContentFeedCategory: (cat: ContentFeedCategory) => void;

  currentUser: UserProfile | null;
  setCurrentUser: (user: UserProfile | null) => void;
  authReady: boolean;
  isFirebaseAuthenticated: boolean;
  isAdmin: boolean;
  adminEmails: string[];
  signIn: (email?: string, name?: string, password?: string) => Promise<SignInResult>;
  signInWithGoogle: () => Promise<SignInResult>;
  registerUser: (params: {
    fullName: string;
    email: string;
    password?: string;
    primaryRole: UserRole;
    location?: string;
    phone?: string;
    profession?: string;
    businessName?: string;
    businessCategory?: string;
    requestVerification?: boolean;
  }) => Promise<UserProfile>;
  signOut: () => Promise<void>;
  updateProfile: (updated: Partial<UserProfile>) => Promise<void>;

  // Live Firestore Data lists
  registeredUsers: UserProfile[];
  jobs: Job[];
  gigsCount: number;
  products: Product[];
  services: Service[];
  businesses: Business[];
  professionals: Professional[];
  proposals: Proposal[];
  conversations: Conversation[];
  activeConversationId: string;
  setActiveConversationId: (id: string) => void;
  messages: Record<string, ChatMessage[]>;
  notifications: NotificationItem[];
  completedJobs: CompletedJob[];
  reviews: Review[];
  reports: Report[];
  prayers: PrayerRequest[];
  prayerComments: Record<string, PrayerComment[]>;
  successStories: SuccessStory[];
  savedItemIds: string[];

  // Filters & Universal Search
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string;
  setSelectedCategory: (c: string) => void;
  selectedLocation: string;
  setSelectedLocation: (l: string) => void;
  selectedTypeFilter: string;
  setSelectedTypeFilter: (t: string) => void;

  // Actions
  toggleSaveItem: (id: string) => void;
  isItemSaved: (id: string) => boolean;
  addJob: (newJob: Partial<Job>) => Promise<void>;
  addProduct: (newProduct: Partial<Product>) => Promise<void>;
  updateProduct: (productId: string, updates: Partial<Product>) => Promise<void>;
  addService: (newService: Partial<Service>) => Promise<void>;
  updateService: (serviceId: string, updates: Partial<Service>) => Promise<void>;
  addBusiness: (newBusiness: Partial<Business>) => Promise<void>;
  fetchUserCompletedJobs: (userId: string) => Promise<CompletedJob[]>;
  addPrayerRequest: (params: {
    authorName: string;
    spiritualName?: string;
    isAnonymous?: boolean;
    title: string;
    description: string;
    category: PrayerRequest['category'];
    categoryAm: string;
    location?: string;
    parishName?: string;
  }) => Promise<void>;
  togglePrayerAmen: (prayerId: string) => Promise<void>;
  addPrayerComment: (prayerId: string, commentText: string, spiritualName?: string) => Promise<void>;
  addSuccessStory: (params: {
    userName: string;
    spiritualName?: string;
    userRole: string;
    partnerName: string;
    partnerRole?: string;
    category: SuccessStoryCategory;
    categoryAm: string;
    title: string;
    story: string;
    location: string;
    parishName?: string;
    outcomeMetric?: string;
  }) => Promise<void>;
  toggleStoryBlessing: (storyId: string) => Promise<void>;
  submitProposal: (
    jobId: string,
    jobTitle: string,
    bidAmount: number,
    deliveryDays: number,
    coverLetter: string,
    employerId?: string
  ) => Promise<void>;
  updateProposalStatus: (proposalId: string, newStatus: ProposalStatus, note?: string) => Promise<void>;
  completeProposalAndReview: (params: {
    proposal: Proposal;
    job?: Job;
    rating: number;
    comment: string;
    projectRole: 'FREELANCER' | 'JOB_POSTER';
    targetUserId: string;
  }) => Promise<void>;
  placeProductOrder: (product: Product, quantity: number, note?: string) => Promise<string>;
  sendMessage: (conversationId: string, content: string) => Promise<void>;
  startOrOpenConversation: (
    participantId: string,
    participantName: string,
    projectTitle?: string,
    participantAvatar?: string,
    extra?: {
      projectId?: string;
      opportunityType?: OpportunityType;
      budgetOrPrice?: number;
      category?: string;
    }
  ) => string;
  markConversationRead: (conversationId: string) => Promise<void>;
  createNotification: (
    targetUserId: string,
    payload: {
      title: string;
      amharicTitle?: string;
      message: string;
      messageAm?: string;
      type: NotificationType;
      referenceId?: string;
    }
  ) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  saveUserCV: (cvFile: any, parsedData?: any) => void;
  submitReview: (params: {
    targetUserId: string;
    targetId?: string;
    projectTitle?: string;
    projectRole?: 'FREELANCER' | 'JOB_POSTER';
    rating: number;
    comment: string;
    tags?: string[];
  }) => Promise<void>;
  submitReport: (params: {
    targetType: Report['targetType'];
    targetId: string;
    targetTitle?: string;
    reason: string;
    details?: string;
  }) => Promise<void>;

  // Admin Content Moderation & Verification Actions
  flagJob: (jobId: string, reason: string) => void;
  unflagJob: (jobId: string) => void;
  deleteJob: (jobId: string) => Promise<void>;
  flagProduct: (productId: string, reason: string) => void;
  unflagProduct: (productId: string) => void;
  deleteProduct: (productId: string) => Promise<void>;
  deleteService: (serviceId: string) => Promise<void>;
  resolveReport: (
    reportId: string,
    status: Report['status'],
    actionTaken?: string,
    deleteTarget?: boolean
  ) => Promise<void>;
  suspendUser: (userId: string, isSuspended: boolean) => Promise<void>;
  changeUserRole: (userId: string, newRole: UserRole) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  updateProfessionalStatus: (
    profId: string,
    status: 'verified' | 'pending' | 'rejected',
    reason?: string
  ) => Promise<void>;
  updateUserVerification: (
    userId: string,
    status: 'verified' | 'pending' | 'unverified' | 'rejected',
    reason?: string
  ) => Promise<void>;

  // Modals
  activeModal:
    | 'post'
    | 'auth'
    | 'admin'
    | 'job_detail'
    | 'product_detail'
    | 'service_detail'
    | 'profile'
    | 'notifications'
    | 'contact'
    | 'cv_upload'
    | null;
  modalData: any;
  openModal: (
    modal:
      | 'post'
      | 'auth'
      | 'admin'
      | 'job_detail'
      | 'product_detail'
      | 'service_detail'
      | 'profile'
      | 'notifications'
      | 'contact'
      | 'cv_upload',
    data?: any
  ) => void;
  closeModal: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const mapJobDoc = (id: string, data: any): Job => ({
  id,
  employerId: data.employerId || data.clientId || data.providerId || 'orthodox_employer',
  employerName: data.employerName || data.clientName || data.providerName || 'Orthodox Member',
  employerEmail: data.employerEmail || '',
  employerPhone: data.employerPhone || '',
  employerTelegram: data.employerTelegram || '',
  employerVerified: Boolean(data.employerVerified ?? data.isVerified ?? false),
  employerAvatar: data.employerAvatar || undefined,
  title: data.title || 'Untitled Opportunity',
  amharicTitle: data.amharicTitle || data.title || 'ክፍት የሥራ ቦታ',
  description: data.description || '',
  descriptionAm: data.descriptionAm || data.description || '',
  budget: Number(data.budget ?? data.budgetAmount ?? data.price ?? 0),
  budgetAmount: Number(data.budgetAmount ?? data.budget ?? data.price ?? 0),
  budgetCurrency: data.budgetCurrency === 'USD' ? 'USD' : 'ETB',
  paymentType: data.paymentType || (data.projectType === 'HOURLY' ? 'hourly' : 'fixed'),
  category: data.category || 'Technology & Engineering',
  categoryAm: data.categoryAm || data.category || 'ቴክኖሎጂና ምህንድስና',
  location: data.location || 'Addis Ababa',
  skillsRequired: Array.isArray(data.skillsRequired)
    ? data.skillsRequired
    : typeof data.skillsRequired === 'string'
    ? data.skillsRequired.split(',').map((s: string) => s.trim()).filter(Boolean)
    : Array.isArray(data.skills)
    ? data.skills
    : ['Professional Skills'],
  projectType: data.projectType || 'FIXED_PRICE',
  employmentType: data.employmentType || data.projectType || 'Contract',
  experienceLevel: data.experienceLevel || 'intermediate',
  deliveryDays: data.deliveryDays ? Number(data.deliveryDays) : undefined,
  isRemote: Boolean(data.isRemote),
  isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
  status: data.status || 'OPEN',
  isFlagged: Boolean(data.isFlagged),
  flagReason: data.flagReason || undefined,
  proposalsCount: Number(data.proposalsCount || 0),
  deadline: data.deadline || undefined,
  createdAt: parseTimestamp(data.createdAt, id, data.updatedAt),
  updatedAt: parseTimestamp(data.updatedAt || data.createdAt, id),
});

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('oe_language') as Language) || 'am';
  });

  const [theme, setThemeState] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('oe_theme');
    return saved === 'dark' ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('oe_theme', theme);
  }, [theme]);

  const setTheme = (newTheme: 'light' | 'dark') => setThemeState(newTheme);
  const toggleTheme = () => setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));

  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [contentFeedCategory, setContentFeedCategory] = useState<ContentFeedCategory>('all');

  const [fbUser, setFbUser] = useState<FirebaseUser | null>(() => auth?.currentUser ?? null);
  const [authReady, setAuthReady] = useState<boolean>(false);

  const [currentUser, setCurrentUserState] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('oe_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && isSuperAdminEmail(parsed.email)) {
          return {
            ...parsed,
            primaryRole: 'ADMIN',
            verificationStatus: 'verified',
          };
        }
        return parsed;
      } catch {
        return null;
      }
    }
    return null;
  });

  const isFirebaseAuthenticated = Boolean(fbUser?.uid);

  const isAdmin = Boolean(
    fbUser &&
      currentUser &&
      (isSuperAdminEmail(fbUser.email || currentUser.email) ||
        normalizeUserRole(currentUser.primaryRole) === 'ADMIN' ||
        (currentUser as any).role === 'admin' ||
        (currentUser as any).isAdmin === true)
  );

  // Real-time Firestore collections (zero mock arrays)
  const [jobsFromJobsCol, setJobsFromJobsCol] = useState<Record<string, Job>>({});
  const [jobsFromGigsCol, setJobsFromGigsCol] = useState<Record<string, Job>>({});
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [businessesCol, setBusinessesCol] = useState<Business[]>([]);
  const [registeredUsers, setRegisteredUsers] = useState<UserProfile[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string>('');
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({});
  const [notifsFromSubCol, setNotifsFromSubCol] = useState<Record<string, NotificationItem>>({});
  const [notifsFromRootCol, setNotifsFromRootCol] = useState<Record<string, NotificationItem>>({});
  const [completedJobs, setCompletedJobs] = useState<CompletedJob[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [prayers, setPrayers] = useState<PrayerRequest[]>([]);
  const [prayerComments, setPrayerComments] = useState<Record<string, PrayerComment[]>>({});
  const [successStories, setSuccessStories] = useState<SuccessStory[]>([]);

  const notifications = useMemo(() => {
    const merged: Record<string, NotificationItem> = {
      ...notifsFromRootCol,
      ...notifsFromSubCol,
    };
    return Object.values(merged).sort(
      (a, b) => getTimestampMs(b.createdAt) - getTimestampMs(a.createdAt)
    );
  }, [notifsFromSubCol, notifsFromRootCol]);

  const [savedItemIds, setSavedItemIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('oe_saved');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('oe_saved', JSON.stringify(savedItemIds));
    } catch {
      // ignore
    }
  }, [savedItemIds]);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('all');

  // Modal system
  const [activeModal, setActiveModal] = useState<AppContextType['activeModal']>(null);
  const [modalData, setModalData] = useState<any>(null);

  const selectContentFeedCategory = (cat: ContentFeedCategory) => {
    setContentFeedCategory(cat);
    if (cat === 'all') {
      setSelectedCategory('All');
      setSelectedTypeFilter('all');
      setActiveTab('home');
    } else if (cat === 'freelance_gigs') {
      setSelectedTypeFilter('GIG');
      setActiveTab('jobs');
    } else if (cat === 'jobs') {
      setSelectedTypeFilter('all');
      setActiveTab('jobs');
    } else if (cat === 'marketplace') {
      setSelectedCategory('All');
      setActiveTab('marketplace');
    } else if (cat === 'spiritual_items') {
      setSelectedCategory('sacred_liturgical');
      setActiveTab('marketplace');
    } else if (cat === 'services') {
      setActiveTab('services');
    } else if (cat === 'b2b_wholesale') {
      setSelectedCategory('wholesale');
      setActiveTab('marketplace');
    }
  };

  // Merge /jobs + /gigs deduplicated by ID
  const jobs = useMemo(() => {
    const merged: Record<string, Job> = { ...jobsFromGigsCol, ...jobsFromJobsCol };
    return Object.values(merged).sort(
      (a, b) => getTimestampMs(b.createdAt) - getTimestampMs(a.createdAt)
    );
  }, [jobsFromJobsCol, jobsFromGigsCol]);

  const gigsCount = useMemo(() => Object.keys(jobsFromGigsCol).length, [jobsFromGigsCol]);

  // Derive live Professionals directory from /users + /services
  const professionals: Professional[] = useMemo(() => {
    return registeredUsers
      .filter((u) => {
        const r = normalizeUserRole(u.primaryRole);
        return (
          r === 'FREELANCER' ||
          r === 'SERVICE_PROVIDER' ||
          r === 'JOB_SEEKER' ||
          r === 'ADMIN' ||
          Boolean(u.profession) ||
          (u.portfolioItems && u.portfolioItems.length > 0)
        );
      })
      .map((u) => ({
        id: u.userId,
        userId: u.userId,
        fullName: u.fullName,
        fullNameAm: u.fullName,
        title: u.profession || formatRoleFallback(u.primaryRole),
        titleAm: u.profession || formatRoleFallback(u.primaryRole),
        bio: u.bio || `${u.fullName} — Orthodox Community Member based in ${u.location}.`,
        bioAm: u.bioAm || u.bio || `${u.fullName} — በ ${u.location} የሚገኙ የማኅበረሰብ አባል።`,
        category: u.businessCategory || 'Technology & Engineering',
        location: u.location || 'Addis Ababa',
        photoUrl: u.profilePhotoUrl || DEFAULT_AVATAR_URL,
        skills: u.skills?.length ? u.skills : ['Orthodox Member'],
        experienceYears: u.cvParsed?.experienceYears || 3,
        rating: u.rating || 5.0,
        reviewCount: u.reviewCount || 0,
        isVerified: u.verificationStatus === 'verified',
        status:
          u.verificationStatus === 'verified'
            ? 'verified'
            : u.verificationStatus === 'rejected'
            ? 'rejected'
            : 'pending',
        verifiedAt: u.verifiedAt,
        verifiedBy: u.verifiedBy,
        certificateId: u.certificateId,
        parishName: u.parishName,
        spiritualFatherContact: u.spiritualFatherContact,
        email: u.email,
        phone: u.phone,
        telegram: u.telegramHandle,
        portfolioItems: u.portfolioItems,
        createdAt: u.createdAt,
      }));
  }, [registeredUsers]);

  // Combine /businesses collection with business-role users
  const businesses: Business[] = useMemo(() => {
    const map: Record<string, Business> = {};
    registeredUsers.forEach((u) => {
      const r = normalizeUserRole(u.primaryRole);
      if (r === 'BUSINESS' || r === 'IMPORTER' || r === 'DISTRIBUTOR' || r === 'SELLER' || u.businessName) {
        const bizType: Business['type'] =
          r === 'IMPORTER'
            ? 'importer'
            : r === 'DISTRIBUTOR'
            ? 'distributor'
            : r === 'SELLER'
            ? 'retailer'
            : 'service_firm';
        map[`usr_biz_${u.userId}`] = {
          id: `usr_biz_${u.userId}`,
          ownerId: u.userId,
          name: u.businessName || u.fullName,
          nameAm: u.businessName || u.fullName,
          category: u.businessCategory || 'General Trading',
          categoryAm: u.businessCategory || 'አጠቃላይ ንግድ',
          type: bizType,
          description: u.bio || `${u.businessName || u.fullName} operating in ${u.location}`,
          descriptionAm: u.bioAm || u.bio || '',
          location: u.location || 'Addis Ababa',
          city: u.location || 'Addis Ababa',
          phone: u.phone || '',
          email: u.email,
          telegram: u.telegramHandle,
          logoUrl: u.profilePhotoUrl,
          isVerified: u.verificationStatus === 'verified',
          createdAt: u.createdAt,
        };
      }
    });
    businessesCol.forEach((b) => {
      map[b.id] = b;
    });
    return Object.values(map).sort(
      (a, b) => getTimestampMs(b.createdAt) - getTimestampMs(a.createdAt)
    );
  }, [businessesCol, registeredUsers]);

  // =========================================================================
  // GLOBAL REAL-TIME FIRESTORE SUBSCRIPTIONS (Web <-> Android Shared DB)
  // =========================================================================
  useEffect(() => {
    if (!db) return;

    const unsubJobs = onSnapshot(
      collection(db, 'jobs'),
      (snapshot) => {
        const next: Record<string, Job> = {};
        snapshot.forEach((d) => {
          next[d.id] = mapJobDoc(d.id, d.data({ serverTimestamps: 'estimate' }));
        });
        setJobsFromJobsCol(next);
      },
      (err) => console.warn('Realtime /jobs notice:', err.message)
    );

    const unsubGigs = onSnapshot(
      collection(db, 'gigs'),
      (snapshot) => {
        const next: Record<string, Job> = {};
        snapshot.forEach((d) => {
          next[d.id] = mapJobDoc(d.id, { projectType: 'GIG', ...d.data({ serverTimestamps: 'estimate' }) });
        });
        setJobsFromGigsCol(next);
      },
      (err) => console.warn('Realtime /gigs notice:', err.message)
    );

    const unsubProducts = onSnapshot(
      collection(db, 'products'),
      (snapshot) => {
        const list: Product[] = [];
        snapshot.forEach((d) => {
          const data = d.data({ serverTimestamps: 'estimate' }) as any;
          list.push({
            id: d.id,
            sellerId: data.sellerId || 'orthodox_seller',
            sellerName: data.sellerName || 'Orthodox Seller',
            sellerPhone: data.sellerPhone || '',
            sellerTelegram: data.sellerTelegram || '',
            sellerVerified: Boolean(data.sellerVerified ?? false),
            title: data.title || 'Product Listing',
            amharicTitle: data.amharicTitle || data.title || 'የገበያ ምርት',
            description: data.description || '',
            descriptionAm: data.descriptionAm || data.description || '',
            category: data.category || 'Liturgical & Cultural Goods',
            categoryAm: data.categoryAm || data.category || 'ሃይማኖታዊና ባሕላዊ ቁሳቁሶች',
            price: Number(data.price || 0),
            wholesalePrice: data.wholesalePrice ? Number(data.wholesalePrice) : undefined,
            moq: data.moq ? Number(data.moq) : undefined,
            quantity: Number(data.quantity ?? 1),
            currency: data.currency === 'USD' ? 'USD' : 'ETB',
            location: data.location || 'Addis Ababa',
            condition: data.condition || 'new',
            imageUrl: data.imageUrl || '/assets/products/beeswax_candles.jpg',
            additionalImages: Array.isArray(data.additionalImages) ? data.additionalImages : undefined,
            deliveryInfo: data.deliveryInfo || undefined,
            isFeatured: Boolean(data.isFeatured),
            isAvailable: Boolean(data.isAvailable ?? true),
            isFlagged: Boolean(data.isFlagged),
            flagReason: data.flagReason || undefined,
            createdAt: parseTimestamp(data.createdAt, d.id, data.updatedAt),
            updatedAt: parseTimestamp(data.updatedAt || data.createdAt, d.id),
          });
        });
        list.sort((a, b) => getTimestampMs(b.createdAt) - getTimestampMs(a.createdAt));
        setProducts(list);
      },
      (err) => console.warn('Realtime /products notice:', err.message)
    );

    const unsubServices = onSnapshot(
      collection(db, 'services'),
      (snapshot) => {
        const list: Service[] = [];
        snapshot.forEach((d) => {
          const data = d.data({ serverTimestamps: 'estimate' }) as any;
          list.push({
            id: d.id,
            providerId: data.providerId || 'orthodox_provider',
            providerName: data.providerName || data.name || 'Orthodox Provider',
            name: data.name || data.providerName || 'Orthodox Provider',
            providerEmail: data.providerEmail || '',
            providerAvatar: data.providerAvatar || undefined,
            isVerified: Boolean(data.isVerified ?? false),
            title: data.title || 'Professional Service',
            amharicTitle: data.amharicTitle || data.title || 'የባለሙያ አገልግሎት',
            category: data.category || 'Consulting & Services',
            categoryAm: data.categoryAm || data.category || 'አማካሪነትና አገልግሎት',
            rateDescription:
              data.rateDescription ||
              (data.rateAmount ? `${Number(data.rateAmount).toLocaleString()} ETB` : 'Negotiable'),
            rateDescriptionAm: data.rateDescriptionAm || data.rateDescription || 'ተደራዳሪ ዋጋ',
            rateAmount: Number(data.rateAmount || 0),
            currency: data.currency === 'USD' ? 'USD' : 'ETB',
            location: data.location || 'Addis Ababa',
            description: data.description || '',
            descriptionAm: data.descriptionAm || data.description || '',
            experienceYears: Number(data.experienceYears || 1),
            phone: data.phone || data.providerPhone || '',
            telegram: data.telegram || data.providerTelegram || '',
            rating: Number(data.rating || 5.0),
            reviewsCount: Number(data.reviewsCount || 0),
            skills: Array.isArray(data.skills) ? data.skills : ['Orthodox Service'],
            isAvailable: Boolean(data.isAvailable ?? true),
            createdAt: parseTimestamp(data.createdAt, d.id, data.updatedAt),
            updatedAt: parseTimestamp(data.updatedAt || data.createdAt, d.id),
          });
        });
        list.sort((a, b) => getTimestampMs(b.createdAt) - getTimestampMs(a.createdAt));
        setServices(list);
      },
      (err) => console.warn('Realtime /services notice:', err.message)
    );

    const unsubBusinesses = onSnapshot(
      collection(db, 'businesses'),
      (snapshot) => {
        const list: Business[] = [];
        snapshot.forEach((d) => {
          const data = d.data({ serverTimestamps: 'estimate' }) as any;
          list.push({
            id: d.id,
            ownerId: data.ownerId || '',
            name: data.name || 'Commercial Enterprise',
            nameAm: data.nameAm || data.name || '',
            category: data.category || 'General Trading',
            categoryAm: data.categoryAm || data.category || '',
            type: data.type || 'distributor',
            description: data.description || '',
            descriptionAm: data.descriptionAm || data.description || '',
            location: data.location || 'Addis Ababa',
            city: data.city || data.location || 'Addis Ababa',
            phone: data.phone || '',
            email: data.email || '',
            telegram: data.telegram || '',
            logoUrl: data.logoUrl || undefined,
            isVerified: Boolean(data.isVerified),
            workingHours: data.workingHours || undefined,
            establishedYear: data.establishedYear ? Number(data.establishedYear) : undefined,
            createdAt: parseTimestamp(data.createdAt, d.id, data.updatedAt),
          });
        });
        setBusinessesCol(list);
      },
      (err) => console.warn('Realtime /businesses notice:', err.message)
    );

    const unsubUsers = onSnapshot(
      collection(db, 'users'),
      (snapshot) => {
        const liveUsers: UserProfile[] = [];
        snapshot.forEach((d) => {
          const data = d.data({ serverTimestamps: 'estimate' }) as any;
          const email = (data.email || '').toLowerCase().trim();
          const isSuper = isSuperAdminEmail(email);
          liveUsers.push({
            id: d.id,
            userId: d.id,
            email: data.email || '',
            fullName: data.fullName || data.name || 'Member',
            name: data.name || data.fullName || 'Member',
            username: data.username || (data.email ? data.email.split('@')[0] : 'user'),
            primaryRole: isSuper ? 'ADMIN' : data.primaryRole || data.role || 'JOB_SEEKER',
            secondaryRoles: Array.isArray(data.secondaryRoles) ? data.secondaryRoles : [],
            profession: data.profession || data.title || '',
            businessName: data.businessName || '',
            businessCategory: data.businessCategory || '',
            location: data.location || 'Addis Ababa',
            phone: data.phone || '',
            bio: data.bio || '',
            bioAm: data.bioAm || '',
            telegramHandle: data.telegramHandle || '',
            profilePhotoUrl: data.profilePhotoUrl || '',
            parishName: data.parishName || '',
            spiritualFatherContact: data.spiritualFatherContact || '',
            verificationDocType: data.verificationDocType || '',
            verificationDocDetails: data.verificationDocDetails || '',
            portfolioItems: Array.isArray(data.portfolioItems) ? data.portfolioItems : [],
            vaultDocuments: Array.isArray(data.vaultDocuments) ? data.vaultDocuments : [],
            cvFile: data.cvFile || undefined,
            cvParsed: data.cvParsed || undefined,
            skills: Array.isArray(data.skills) ? data.skills : ['Orthodox Member'],
            verificationStatus: isSuper ? 'verified' : normalizeVerificationStatus(data.verificationStatus),
            isSuspended: Boolean(data.isSuspended),
            verifiedAt: data.verifiedAt || undefined,
            verifiedBy: data.verifiedBy || undefined,
            certificateId: data.certificateId || undefined,
            savedItemIds: Array.isArray(data.savedItemIds) ? data.savedItemIds : undefined,
            rating: Number(data.rating ?? 5.0),
            reviewCount: Number(data.reviewCount ?? 0),
            createdAt: parseTimestamp(data.createdAt, d.id, data.updatedAt),
            updatedAt: parseTimestamp(data.updatedAt || data.createdAt, d.id),
          });
        });
        setRegisteredUsers(liveUsers);
      },
      (err) => console.warn('Realtime /users notice:', err.message)
    );

    const unsubProposals = onSnapshot(
      collection(db, 'proposals'),
      (snapshot) => {
        const list: Proposal[] = [];
        snapshot.forEach((d) => {
          const data = d.data({ serverTimestamps: 'estimate' }) as any;
          list.push({
            id: d.id,
            jobId: data.jobId || '',
            jobTitle: data.jobTitle || 'Project Opportunity',
            employerId: data.employerId || '',
            freelancerId: data.freelancerId || '',
            freelancerName: data.freelancerName || 'Applicant',
            freelancerEmail: data.freelancerEmail || '',
            freelancerPhone: data.freelancerPhone || '',
            coverLetter: data.coverLetter || '',
            bidAmount: Number(data.bidAmount || 0),
            currency: data.currency === 'USD' ? 'USD' : 'ETB',
            deliveryDays: Number(data.deliveryDays || 7),
            status: data.status || 'PENDING',
            createdAt: parseTimestamp(data.createdAt, d.id, data.updatedAt),
            updatedAt: parseTimestamp(data.updatedAt || data.createdAt, d.id),
          });
        });
        list.sort((a, b) => getTimestampMs(b.createdAt) - getTimestampMs(a.createdAt));
        setProposals(list);
      },
      (err) => console.warn('Realtime /proposals notice:', err.message)
    );

    const unsubReviews = onSnapshot(
      collection(db, 'reviews'),
      (snapshot) => {
        const list: Review[] = [];
        snapshot.forEach((d) => {
          const data = d.data({ serverTimestamps: 'estimate' }) as any;
          list.push({
            id: d.id,
            targetUserId: data.targetUserId || '',
            targetId: data.targetId || undefined,
            authorId: data.authorId || '',
            authorName: data.authorName || 'Community Member',
            authorAvatar: data.authorAvatar || undefined,
            authorRole: data.authorRole || undefined,
            projectTitle: data.projectTitle || undefined,
            projectRole: data.projectRole === 'JOB_POSTER' ? 'JOB_POSTER' : 'FREELANCER',
            rating: Number(data.rating || 5),
            comment: data.comment || '',
            verifiedBuyer: Boolean(data.verifiedBuyer ?? true),
            tags: Array.isArray(data.tags) ? data.tags : [],
            helpfulCount: Number(data.helpfulCount || 0),
            createdAt: parseTimestamp(data.createdAt, d.id),
          });
        });
        list.sort((a, b) => getTimestampMs(b.createdAt) - getTimestampMs(a.createdAt));
        setReviews(list);
      },
      (err) => console.warn('Realtime /reviews notice:', err.message)
    );

    const unsubPrayers = onSnapshot(
      collection(db, 'prayers'),
      (snapshot) => {
        const list: PrayerRequest[] = [];
        snapshot.forEach((d) => {
          const data = d.data({ serverTimestamps: 'estimate' }) as any;
          const countVal = Number(data.amenCount ?? data.prayersCount ?? 0);
          list.push({
            id: d.id,
            userId: data.userId || data.authorId || '',
            authorId: data.authorId || data.userId || '',
            authorName: data.authorName || 'ምዕመን',
            authorSpiritualName: data.authorSpiritualName || data.spiritualName || undefined,
            spiritualName: data.spiritualName || data.authorSpiritualName || undefined,
            isAnonymous: Boolean(data.isAnonymous),
            title: data.title || data.titleAm || 'የጸሎት ጥያቄ',
            titleAm: data.titleAm || data.title || 'የጸሎት ጥያቄ',
            description: data.description || '',
            category: data.category || 'general',
            categoryAm: data.categoryAm || 'አጠቃላይ ጸሎት',
            location: data.location || '',
            parish: data.parish || data.parishName || undefined,
            parishName: data.parishName || data.parish || undefined,
            prayersCount: countVal,
            amenCount: countVal,
            amenedBy: Array.isArray(data.amenedBy) ? data.amenedBy : [],
            commentsCount: Number(data.commentsCount || 0),
            comments: Array.isArray(data.comments) ? data.comments : [],
            createdAt: parseTimestamp(data.createdAt, d.id, data.updatedAt),
            updatedAt: parseTimestamp(data.updatedAt || data.createdAt, d.id),
          });
        });
        list.sort((a, b) => getTimestampMs(b.createdAt) - getTimestampMs(a.createdAt));
        setPrayers(list);
      },
      (err) => console.warn('Realtime /prayers notice:', err.message)
    );

    const unsubStories = onSnapshot(
      collection(db, 'success_stories'),
      (snapshot) => {
        const list: SuccessStory[] = [];
        snapshot.forEach((d) => {
          const data = d.data({ serverTimestamps: 'estimate' }) as any;
          const blessVal = Number(data.blessingCount ?? data.blessedCount ?? 0);
          list.push({
            id: d.id,
            userId: data.userId || data.authorId || '',
            authorId: data.authorId || data.userId || '',
            userName: data.userName || 'Community Member',
            userSpiritualName: data.userSpiritualName || data.spiritualName || undefined,
            spiritualName: data.spiritualName || data.userSpiritualName || undefined,
            userRoleAm: data.userRoleAm || data.userRole || 'የማኅበረሰብ አባል',
            userRoleEn: data.userRoleEn || data.userRole || 'Community Member',
            userAvatar: data.userAvatar || DEFAULT_AVATAR_URL,
            isVerified: Boolean(data.isVerified ?? true),
            partnerName: data.partnerName || data.partnerNames || 'Community Partner',
            partnerNames: data.partnerNames || data.partnerName || '',
            partnerRoleAm: data.partnerRoleAm || 'የተረጋገጠ አጋር',
            partnerRoleEn: data.partnerRoleEn || 'Verified Partner',
            partnerAvatar: data.partnerAvatar || undefined,
            isPartnerVerified: Boolean(data.isPartnerVerified ?? true),
            category: data.category || 'found_job',
            categoryAm: data.categoryAm || 'የተሳካ ትስስር',
            titleAm: data.titleAm || data.title || '',
            titleEn: data.titleEn || data.title || data.titleAm || '',
            storyAm: data.storyAm || data.story || '',
            storyEn: data.storyEn || data.story || data.storyAm || '',
            location: data.location || 'Addis Ababa',
            parish: data.parish || data.parishName || undefined,
            parishName: data.parishName || data.parish || undefined,
            outcomeMetric: data.outcomeMetric || undefined,
            outcomeMetricAm: data.outcomeMetricAm || data.outcomeMetric || undefined,
            blessedCount: blessVal,
            blessingCount: blessVal,
            blessedBy: Array.isArray(data.blessedBy) ? data.blessedBy : [],
            createdAt: parseTimestamp(data.createdAt, d.id, data.updatedAt),
            updatedAt: parseTimestamp(data.updatedAt || data.createdAt, d.id),
          });
        });
        list.sort((a, b) => getTimestampMs(b.createdAt) - getTimestampMs(a.createdAt));
        setSuccessStories(list);
      },
      (err) => console.warn('Realtime /success_stories notice:', err.message)
    );

    return () => {
      unsubJobs();
      unsubGigs();
      unsubProducts();
      unsubServices();
      unsubBusinesses();
      unsubUsers();
      unsubProposals();
      unsubReviews();
      unsubPrayers();
      unsubStories();
    };
  }, []);

  // =========================================================================
  // FIREBASE AUTH STATE SYNC (Required by Firestore Rules: request.auth != null)
  // =========================================================================
  const syncFirebaseUserProfile = async (
    firebaseUser: FirebaseUser,
    overrides?: {
      fullName?: string;
      primaryRole?: UserRole;
      location?: string;
      phone?: string;
      profession?: string;
      businessName?: string;
      businessCategory?: string;
      requestVerification?: boolean;
    }
  ): Promise<UserProfile> => {
    const uid = firebaseUser.uid;
    const cleanEmail = (firebaseUser.email || '').toLowerCase().trim();
    const isSuper = isSuperAdminEmail(cleanEmail);

    let existingData: any = null;
    if (db) {
      try {
        const directSnap = await getDoc(doc(db, 'users', uid));
        if (directSnap.exists()) {
          existingData = directSnap.data();
        } else if (cleanEmail) {
          // Carry over profile fields if user previously registered under an email-indexed doc
          const legacySnap = await getDocs(
            query(collection(db, 'users'), where('email', '==', cleanEmail))
          );
          if (!legacySnap.empty) {
            existingData = legacySnap.docs[0].data();
          }
        }
      } catch (err) {
        console.warn('Firestore user profile lookup notice:', err);
      }
    }

    if (existingData?.isSuspended && !isSuper) {
      await firebaseSignOut(auth).catch(() => {});
      setCurrentUser(null);
      throw new Error(
        language === 'am'
          ? 'ይህ መለያ በአስተዳዳሪ ታግዷል። እባክዎ አስተዳዳሪውን ያግኙ።'
          : 'This account has been suspended by an administrator.'
      );
    }

    const defaultSuperName =
      cleanEmail === 'andupaman3@gmail.com'
        ? 'Andualem (Super Admin)'
        : cleanEmail === 'habtamweday1@gmail.com'
        ? 'Habtamu Wedajo'
        : 'Platform Admin';

    const resolvedName =
      overrides?.fullName?.trim() ||
      existingData?.fullName ||
      existingData?.name ||
      firebaseUser.displayName ||
      (isSuper ? defaultSuperName : cleanEmail.split('@')[0] || 'Orthodox Member');

    const resolvedRole: UserRole = isSuper
      ? 'ADMIN'
      : normalizeUserRole(
          overrides?.primaryRole || existingData?.primaryRole || existingData?.role || 'JOB_SEEKER'
        );

    const verStatus: UserProfile['verificationStatus'] = isSuper
      ? 'verified'
      : overrides?.requestVerification
      ? 'pending'
      : normalizeVerificationStatus(existingData?.verificationStatus);

    const resolvedUser: UserProfile = {
      id: uid,
      userId: uid,
      email: cleanEmail,
      fullName: resolvedName,
      name: resolvedName,
      username: existingData?.username || cleanEmail.split('@')[0] || uid.slice(0, 8),
      primaryRole: resolvedRole,
      secondaryRoles: Array.isArray(existingData?.secondaryRoles) ? existingData.secondaryRoles : [],
      profession: overrides?.profession ?? existingData?.profession ?? existingData?.title ?? '',
      businessName: overrides?.businessName ?? existingData?.businessName ?? '',
      businessCategory: overrides?.businessCategory ?? existingData?.businessCategory ?? '',
      location: overrides?.location || existingData?.location || 'Addis Ababa',
      phone: overrides?.phone ?? existingData?.phone ?? firebaseUser.phoneNumber ?? '',
      bio: existingData?.bio || '',
      bioAm: existingData?.bioAm || '',
      telegramHandle: existingData?.telegramHandle || '',
      profilePhotoUrl: existingData?.profilePhotoUrl || firebaseUser.photoURL || '',
      parishName: existingData?.parishName || '',
      spiritualFatherContact: existingData?.spiritualFatherContact || '',
      verificationDocType: existingData?.verificationDocType || '',
      verificationDocDetails: existingData?.verificationDocDetails || '',
      portfolioItems: Array.isArray(existingData?.portfolioItems) ? existingData.portfolioItems : [],
      vaultDocuments: Array.isArray(existingData?.vaultDocuments) ? existingData.vaultDocuments : [],
      cvFile: existingData?.cvFile || undefined,
      cvParsed: existingData?.cvParsed || undefined,
      skills: Array.isArray(existingData?.skills) && existingData.skills.length > 0
        ? existingData.skills
        : ['Orthodox Community Member'],
      verificationStatus: verStatus,
      isSuspended: false,
      verifiedAt: existingData?.verifiedAt || undefined,
      verifiedBy: existingData?.verifiedBy || undefined,
      certificateId: existingData?.certificateId || undefined,
      savedItemIds: Array.isArray(existingData?.savedItemIds) ? existingData.savedItemIds : undefined,
      rating: Number(existingData?.rating ?? 5.0),
      reviewCount: Number(existingData?.reviewCount ?? 0),
      createdAt: existingData?.createdAt
        ? parseTimestamp(existingData.createdAt, uid)
        : new Date().toISOString(),
    };

    if (db) {
      await setDoc(
        doc(db, 'users', uid),
        {
          id: uid,
          userId: uid,
          fullName: resolvedUser.fullName,
          name: resolvedUser.fullName,
          email: resolvedUser.email,
          username: resolvedUser.username,
          primaryRole: resolvedRole,
          secondaryRoles: resolvedUser.secondaryRoles || [],
          profession: resolvedUser.profession || '',
          businessName: resolvedUser.businessName || '',
          businessCategory: resolvedUser.businessCategory || '',
          location: resolvedUser.location,
          phone: resolvedUser.phone || '',
          bio: resolvedUser.bio || '',
          bioAm: resolvedUser.bioAm || '',
          telegramHandle: resolvedUser.telegramHandle || '',
          profilePhotoUrl: resolvedUser.profilePhotoUrl || '',
          skills: resolvedUser.skills,
          verificationStatus: verStatus.toUpperCase(),
          isSuspended: false,
          rating: resolvedUser.rating,
          reviewCount: resolvedUser.reviewCount,
          ...(existingData?.createdAt ? {} : { createdAt: serverTimestamp() }),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      ).catch((err) => {
        console.warn('Firestore user profile sync notice:', err);
      });
    }

    setCurrentUser(resolvedUser);
    return resolvedUser;
  };

  useEffect(() => {
    if (!auth) {
      setAuthReady(true);
      return;
    }

    const unsubAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      setFbUser(firebaseUser);
      if (firebaseUser) {
        try {
          await syncFirebaseUserProfile(firebaseUser);
        } catch (err) {
          console.warn('Auth profile sync notice:', err);
        }
      } else {
        setCurrentUserState(null);
        try {
          localStorage.removeItem('oe_user');
        } catch {
          // ignore
        }
      }
      setAuthReady(true);
    });

    return () => unsubAuth();
  }, []);

  // Admin-only real-time listener for /reports (avoids PERMISSION_DENIED for public visitors)
  useEffect(() => {
    if (!db || !fbUser || !isAdmin) {
      setReports([]);
      return;
    }

    const unsubReports = onSnapshot(
      collection(db, 'reports'),
      (snapshot) => {
        const list: Report[] = [];
        snapshot.forEach((d) => {
          const data = d.data({ serverTimestamps: 'estimate' }) as any;
          list.push({
            id: d.id,
            reporterId: data.reporterId || '',
            reporterName: data.reporterName || data.reporterEmail || 'Member',
            targetType: (data.targetType || 'JOB').toUpperCase() as Report['targetType'],
            targetId: data.targetId || '',
            targetTitle: data.targetTitle || '',
            reason: data.reason || '',
            details: data.details || '',
            status: (data.status || 'PENDING').toUpperCase() as Report['status'],
            actionTaken: data.actionTaken || '',
            resolvedBy: data.resolvedBy || '',
            createdAt: parseTimestamp(data.createdAt, d.id, data.updatedAt),
            updatedAt: parseTimestamp(data.updatedAt || data.createdAt, d.id),
          });
        });
        list.sort((a, b) => getTimestampMs(b.createdAt) - getTimestampMs(a.createdAt));
        setReports(list);
      },
      (err) => console.warn('Realtime /reports notice:', err.message)
    );

    return () => unsubReports();
  }, [fbUser?.uid, isAdmin]);

  // Subscribe to real-time comments subcollection for each active prayer
  useEffect(() => {
    if (!db || prayers.length === 0) return;
    const unsubs = prayers.map((prayer) =>
      onSnapshot(
        collection(db, 'prayers', prayer.id, 'comments'),
        (snap) => {
          const list: PrayerComment[] = [];
          snap.forEach((d) => {
            const data = d.data({ serverTimestamps: 'estimate' }) as any;
            list.push({
              id: d.id,
              prayerId: data.prayerId || prayer.id,
              authorId: data.authorId || '',
              authorName: data.authorName || 'ምዕመን',
              authorSpiritualName: data.authorSpiritualName || data.spiritualName || undefined,
              spiritualName: data.spiritualName || data.authorSpiritualName || undefined,
              commentText: data.commentText || data.content || '',
              content: data.content || data.commentText || '',
              createdAt: parseTimestamp(data.createdAt, d.id),
            });
          });
          list.sort((a, b) => getTimestampMs(a.createdAt) - getTimestampMs(b.createdAt));
          setPrayerComments((prev) => ({
            ...prev,
            [prayer.id]: list,
          }));
        },
        () => {}
      )
    );
    return () => {
      unsubs.forEach((u) => u());
    };
  }, [prayers.map((p) => p.id).join(',')]);

  // =========================================================================
  // USER-SCOPED REAL-TIME SUBSCRIPTIONS (Profile, Conversations, Notifications, Completed Jobs)
  // =========================================================================
  useEffect(() => {
    if (!db || !fbUser?.uid || !currentUser?.userId) {
      setConversations([]);
      setNotifsFromSubCol({});
      setNotifsFromRootCol({});
      setCompletedJobs([]);
      return;
    }

    const uid = currentUser.userId;

    // Live sync currentUser profile doc
    const unsubMe = onSnapshot(
      doc(db, 'users', uid),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data({ serverTimestamps: 'estimate' }) as any;
          const isSuper = isSuperAdminEmail(data.email || currentUser.email);
          if (Array.isArray(data.savedItemIds)) {
            setSavedItemIds(data.savedItemIds);
          }
          const synced: UserProfile = {
            ...currentUser,
            ...data,
            userId: snap.id,
            primaryRole: isSuper ? 'ADMIN' : data.primaryRole || currentUser.primaryRole,
            verificationStatus: isSuper ? 'verified' : normalizeVerificationStatus(data.verificationStatus),
            isSuspended: Boolean(data.isSuspended),
            rating: Number(data.rating ?? currentUser.rating ?? 5.0),
            reviewCount: Number(data.reviewCount ?? currentUser.reviewCount ?? 0),
            skills: Array.isArray(data.skills) ? data.skills : currentUser.skills || [],
            secondaryRoles: Array.isArray(data.secondaryRoles) ? data.secondaryRoles : [],
            portfolioItems: Array.isArray(data.portfolioItems) ? data.portfolioItems : [],
            vaultDocuments: Array.isArray(data.vaultDocuments) ? data.vaultDocuments : [],
            createdAt: parseTimestamp(data.createdAt, snap.id, data.updatedAt),
          };
          setCurrentUserState(synced);
          try {
            localStorage.setItem('oe_user', JSON.stringify(synced));
          } catch {
            // ignore
          }
        }
      },
      () => {}
    );

    // Live conversations where user is a participant
    const convQuery = query(collection(db, 'conversations'), where('participants', 'array-contains', uid));
    const unsubConvs = onSnapshot(
      convQuery,
      (snapshot) => {
        const list: Conversation[] = [];
        snapshot.forEach((d) => {
          const data = d.data({ serverTimestamps: 'estimate' }) as any;
          const isP1 = data.participant1Id === uid;
          const unreadForMe = isP1
            ? Number(data.unreadCountUser1 ?? data.unreadCount ?? 0)
            : Number(data.unreadCountUser2 ?? data.unreadCount ?? 0);
          list.push({
            id: d.id,
            participants: Array.isArray(data.participants) ? data.participants : [data.participant1Id, data.participant2Id],
            participant1Id: data.participant1Id || '',
            participant1Name: data.participant1Name || 'Member',
            participant1Avatar: data.participant1Avatar || undefined,
            participant2Id: data.participant2Id || '',
            participant2Name: data.participant2Name || 'Partner',
            participant2Avatar: data.participant2Avatar || undefined,
            projectId: data.projectId || undefined,
            projectTitle: data.projectTitle || undefined,
            opportunityType: data.opportunityType || 'GENERAL',
            budgetOrPrice: data.budgetOrPrice ? Number(data.budgetOrPrice) : undefined,
            category: data.category || undefined,
            lastMessage: data.lastMessage || '',
            lastMessageSenderId: data.lastMessageSenderId || '',
            lastMessageTimestamp: parseTimestamp(data.lastMessageTimestamp || data.updatedAt, d.id),
            unreadCount: unreadForMe,
            unreadCountUser1: Number(data.unreadCountUser1 || 0),
            unreadCountUser2: Number(data.unreadCountUser2 || 0),
            createdAt: parseTimestamp(data.createdAt, d.id),
            updatedAt: parseTimestamp(data.updatedAt || data.lastMessageTimestamp, d.id),
          });
        });
        list.sort(
          (a, b) =>
            getTimestampMs(b.lastMessageTimestamp) - getTimestampMs(a.lastMessageTimestamp)
        );
        setConversations(list);
        if (list.length > 0 && !activeConversationId) {
          setActiveConversationId(list[0].id);
        }
      },
      (err) => console.warn('Realtime /conversations notice:', err.message)
    );

    const mapNotif = (d: any): NotificationItem => {
      const data = d.data({ serverTimestamps: 'estimate' }) as any;
      return {
        id: d.id,
        userId: data.userId || uid,
        type: (data.type || 'MESSAGE') as NotificationType,
        title: data.title || 'Notification',
        titleAm: data.amharicTitle || data.titleAm || data.title || 'ማሳወቂያ',
        amharicTitle: data.amharicTitle || data.titleAm || data.title,
        message: data.message || '',
        messageAm: data.messageAm || data.message || '',
        isRead: Boolean(data.isRead),
        referenceId: data.referenceId || undefined,
        createdAt: parseTimestamp(data.createdAt, d.id),
      };
    };

    // Live notifications subcollection /users/{userId}/notifications
    const unsubNotifs = onSnapshot(
      collection(db, 'users', uid, 'notifications'),
      (snapshot) => {
        const next: Record<string, NotificationItem> = {};
        snapshot.forEach((d) => {
          next[d.id] = mapNotif(d);
        });
        setNotifsFromSubCol(next);
      },
      (err) => console.warn('Realtime /users/.../notifications notice:', err.message)
    );

    // Live top-level notifications mirror /notifications
    const rootNotifQuery = query(collection(db, 'notifications'), where('userId', '==', uid));
    const unsubRootNotifs = onSnapshot(
      rootNotifQuery,
      (snapshot) => {
        const next: Record<string, NotificationItem> = {};
        snapshot.forEach((d) => {
          next[d.id] = mapNotif(d);
        });
        setNotifsFromRootCol(next);
      },
      (err) => console.warn('Realtime /notifications notice:', err.message)
    );

    // Live completed jobs subcollection /users/{userId}/completed_jobs
    const unsubCompleted = onSnapshot(
      collection(db, 'users', uid, 'completed_jobs'),
      (snapshot) => {
        const list: CompletedJob[] = [];
        snapshot.forEach((d) => {
          const data = d.data({ serverTimestamps: 'estimate' }) as any;
          list.push({
            id: d.id,
            userId: data.userId || uid,
            title: data.title || 'Completed Project',
            amharicTitle: data.amharicTitle || data.title || '',
            clientName: data.clientName || 'Client',
            category: data.category || '',
            completionDate: data.completionDate || parseTimestamp(data.createdAt, d.id),
            earningsAmount: Number(data.earningsAmount || 0),
            rating: Number(data.rating || 5),
            feedback: data.feedback || '',
            description: data.description || '',
            skillsUsed: Array.isArray(data.skillsUsed) ? data.skillsUsed : [],
            createdAt: parseTimestamp(data.createdAt, d.id),
          });
        });
        list.sort((a, b) => getTimestampMs(b.createdAt) - getTimestampMs(a.createdAt));
        setCompletedJobs(list);
      },
      (err) => console.warn('Realtime /completed_jobs notice:', err.message)
    );

    return () => {
      unsubMe();
      unsubConvs();
      unsubNotifs();
      unsubRootNotifs();
      unsubCompleted();
    };
  }, [fbUser?.uid, currentUser?.userId]);

  // Listen to messages inside activeConversationId
  useEffect(() => {
    if (!db || !activeConversationId) return;

    const unsubMsgs = onSnapshot(
      collection(db, 'conversations', activeConversationId, 'messages'),
      (snapshot) => {
        const list: ChatMessage[] = [];
        snapshot.forEach((d) => {
          const data = d.data({ serverTimestamps: 'estimate' }) as any;
          list.push({
            id: d.id,
            conversationId: data.conversationId || activeConversationId,
            senderId: data.senderId || '',
            senderName: data.senderName || 'Member',
            receiverId: data.receiverId || '',
            content: data.content || '',
            projectTitle: data.projectTitle || undefined,
            isRead: Boolean(data.isRead),
            createdAt: parseTimestamp(data.createdAt, d.id),
          });
        });
        list.sort((a, b) => getTimestampMs(a.createdAt) - getTimestampMs(b.createdAt));
        setMessages((prev) => ({
          ...prev,
          [activeConversationId]: list,
        }));
      },
      (err) => console.warn('Realtime /messages notice:', err.message)
    );

    return () => unsubMsgs();
  }, [activeConversationId]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('oe_language', lang);
    document.documentElement.lang = lang;
  };

  const setCurrentUser = (user: UserProfile | null) => {
    setCurrentUserState(user);
    if (user) {
      localStorage.setItem('oe_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('oe_user');
    }
  };

  const createNotification = async (
    targetUserId: string,
    payload: {
      title: string;
      amharicTitle?: string;
      message: string;
      messageAm?: string;
      type: NotificationType;
      referenceId?: string;
    }
  ) => {
    if (!db || !targetUserId || targetUserId.startsWith('guest_')) return;
    const notifId = `notif_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const notifData = {
      id: notifId,
      userId: targetUserId,
      title: payload.title,
      amharicTitle: payload.amharicTitle || payload.title,
      message: payload.message,
      messageAm: payload.messageAm || payload.message,
      type: payload.type,
      isRead: false,
      referenceId: payload.referenceId || '',
      createdAt: serverTimestamp(),
    };
    try {
      await Promise.all([
        setDoc(doc(db, 'users', targetUserId, 'notifications', notifId), notifData),
        setDoc(doc(db, 'notifications', notifId), notifData),
      ]);
    } catch (err) {
      console.warn('Notification write notice:', err);
    }
  };

  const formatFirebaseAuthError = (err: any): string => {
    const code = String(err?.code || '');
    if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
      return language === 'am'
        ? 'የ Google መግቢያ መስኮቱ ተዘግቷል። እባክዎ ደግመው ይሞክሩ።'
        : 'Google sign-in popup was closed. Please try again.';
    }
    if (code === 'auth/popup-blocked') {
      return language === 'am'
        ? 'ብቅ ባይ (Popup) በአሳሹ ታግዷል። እባክዎ popup ይፍቀዱ።'
        : 'Sign-in popup was blocked by your browser. Please allow popups for this site.';
    }
    if (code === 'auth/unauthorized-domain') {
      return language === 'am'
        ? 'ይህ ዶሜይን በ Firebase Authentication Authorized Domains ውስጥ መታከል አለበት።'
        : 'This domain must be added to Firebase Authentication Authorized Domains in Firebase Console.';
    }
    if (code === 'auth/operation-not-allowed') {
      return language === 'am'
        ? 'በኢሜይል/ይለፍ ቃል መግባት በ Firebase ገና አልነቃም። እባክዎ «በ Google ይግቡ» አዝራርን ይጠቀሙ።'
        : 'Email/password sign-in is not enabled on this project. Please use "Continue with Google" above.';
    }
    if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
      return language === 'am'
        ? 'የተሳሳተ ኢሜይል ወይም የይለፍ ቃል ነው። ወይም በ «በ Google ይግቡ» መግባት ይችላሉ።'
        : 'Invalid email or password. You can also sign in directly with Google.';
    }
    if (code === 'auth/email-already-in-use') {
      return language === 'am'
        ? 'ይህ ኢሜይል ቀድሞውኑ ተመዝግቧል። እባክዎ ወደ መግቢያ (Sign In) ይቀይሩ ወይም በ Google ይግቡ።'
        : 'An account with this email already exists. Please sign in instead or use Google.';
    }
    if (code === 'auth/weak-password') {
      return language === 'am'
        ? 'የይለፍ ቃሉ ቢያንስ 6 ፊደላት/ቁጥሮች መሆን አለበት።'
        : 'Password must be at least 6 characters long.';
    }
    return err?.message || (language === 'am' ? 'መግባት አልተቻለም። እባክዎ ደግመው ይሞክሩ።' : 'Authentication failed.');
  };

  const signInWithGoogle = async (): Promise<SignInResult> => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const cred = await signInWithPopup(auth, provider);
      await syncFirebaseUserProfile(cred.user);
      closeModal();
      return { success: true };
    } catch (err: any) {
      console.error('Google sign-in error:', err);
      return { success: false, error: formatFirebaseAuthError(err) };
    }
  };

  const signIn = async (email = '', name?: string, password?: string): Promise<SignInResult> => {
    const cleanEmail = email.toLowerCase().trim();
    if (!cleanEmail) {
      return {
        success: false,
        error: language === 'am' ? 'እባክዎ ትክክለኛ ኢሜይል ያስገቡ።' : 'Please enter a valid email address.',
      };
    }
    if (!password || !password.trim()) {
      return {
        success: false,
        error:
          language === 'am'
            ? 'እባክዎ የይለፍ ቃል ያስገቡ ወይም ከላይ ባለው «በ Google ይግቡ» ይጠቀሙ።'
            : 'Please enter your password or use "Continue with Google".',
      };
    }

    try {
      const cred = await signInWithEmailAndPassword(auth, cleanEmail, password);
      await syncFirebaseUserProfile(cred.user, name ? { fullName: name } : undefined);
      closeModal();
      return { success: true };
    } catch (err: any) {
      console.error('Firebase email sign-in error:', err);
      return { success: false, error: formatFirebaseAuthError(err) };
    }
  };

  const registerUser = async (params: {
    fullName: string;
    email: string;
    password?: string;
    primaryRole: UserRole;
    location?: string;
    phone?: string;
    profession?: string;
    businessName?: string;
    businessCategory?: string;
    requestVerification?: boolean;
  }): Promise<UserProfile> => {
    const cleanEmail = params.email.toLowerCase().trim();
    const password = params.password || '';
    if (!password || password.length < 6) {
      throw new Error(
        language === 'am'
          ? 'የይለፍ ቃል ቢያንስ 6 ፊደላት መሆን አለበት። ወይም በ Google ይመዝገቡ።'
          : 'Password must be at least 6 characters, or register using Continue with Google.'
      );
    }

    try {
      const cred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      if (params.fullName.trim()) {
        await updateFirebaseProfile(cred.user, { displayName: params.fullName.trim() }).catch(() => {});
      }
      const synced = await syncFirebaseUserProfile(cred.user, {
        fullName: params.fullName.trim(),
        primaryRole: params.primaryRole,
        location: params.location || 'Addis Ababa',
        phone: params.phone || '',
        profession: params.profession || '',
        businessName: params.businessName || '',
        businessCategory: params.businessCategory || '',
        requestVerification: params.requestVerification,
      });
      return synced;
    } catch (err: any) {
      console.error('Firestore/Firebase user registration error:', err);
      throw new Error(formatFirebaseAuthError(err));
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth).catch(() => {});
    setFbUser(null);
    setCurrentUser(null);
    setActiveConversationId('');
  };

  const updateProfile = async (updated: Partial<UserProfile>) => {
    if (!currentUser) return;
    const isSuper = isSuperAdminEmail(currentUser.email);
    const verStatusLower = isSuper
      ? 'verified'
      : updated.verificationStatus || currentUser.verificationStatus;

    const newUser: UserProfile = {
      ...currentUser,
      ...updated,
      name: updated.fullName || currentUser.fullName,
      primaryRole: isSuper ? 'ADMIN' : updated.primaryRole || currentUser.primaryRole,
      verificationStatus: verStatusLower,
      updatedAt: new Date().toISOString(),
    };
    setCurrentUser(newUser);

    if (db && newUser.userId) {
      const firestorePayload: any = {
        ...updated,
        id: newUser.userId,
        userId: newUser.userId,
        name: newUser.fullName,
        fullName: newUser.fullName,
        primaryRole: isSuper ? 'ADMIN' : normalizeUserRole(newUser.primaryRole),
        updatedAt: serverTimestamp(),
      };
      if (updated.verificationStatus) {
        firestorePayload.verificationStatus = verStatusLower.toUpperCase();
      }
      await setDoc(doc(db, 'users', newUser.userId), firestorePayload, { merge: true }).catch((err) => {
        console.warn('Profile update sync notice:', err);
      });
    }
  };

  const toggleSaveItem = (id: string) => {
    setSavedItemIds((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      if (db && currentUser?.userId && !currentUser.userId.startsWith('guest_')) {
        setDoc(
          doc(db, 'users', currentUser.userId),
          { savedItemIds: next, updatedAt: serverTimestamp() },
          { merge: true }
        ).catch(() => {});
      }
      return next;
    });
  };

  const isItemSaved = (id: string) => savedItemIds.includes(id);

  // =========================================================================
  // DUAL-WRITE JOBS & GIGS + FULL SCHEMA WRITES
  // =========================================================================
  const addJob = async (newJob: Partial<Job>) => {
    const jobId = `job_${Date.now()}`;
    const budgetVal = Number(newJob.budget ?? newJob.budgetAmount ?? 25000);
    const projectTypeVal = newJob.projectType || 'FIXED_PRICE';
    const employmentTypeVal = newJob.employmentType || projectTypeVal;
    const experienceVal = newJob.experienceLevel || 'intermediate';
    const deliveryDaysVal = Number(newJob.deliveryDays || 14);
    const skillsArr = Array.isArray(newJob.skillsRequired)
      ? newJob.skillsRequired
      : ['Professional Skills'];

    const jobPayload = {
      id: jobId,
      title: newJob.title || 'Untitled Opportunity',
      amharicTitle: newJob.amharicTitle || newJob.title || 'ክፍት የሥራ ቦታ',
      description: newJob.description || '',
      descriptionAm: newJob.descriptionAm || newJob.description || '',
      category: newJob.category || 'Technology & Engineering',
      categoryAm: newJob.categoryAm || newJob.category || 'ቴክኖሎጂና ምህንድስና',
      budget: budgetVal,
      budgetAmount: budgetVal,
      price: budgetVal,
      budgetCurrency: 'ETB' as const,
      paymentType: projectTypeVal === 'HOURLY' ? ('hourly' as const) : ('fixed' as const),
      location: newJob.location || 'Addis Ababa',
      projectType: projectTypeVal,
      employmentType: employmentTypeVal,
      experienceLevel: experienceVal,
      skillsRequired: skillsArr,
      deliveryDays: deliveryDaysVal,
      proposalsCount: 0,
      status: 'OPEN',
      isActive: true,
      isRemote: Boolean(newJob.isRemote),
      employerId: currentUser?.userId || 'guest_user',
      employerName: currentUser?.businessName || currentUser?.fullName || 'Orthodox Employer',
      employerEmail: currentUser?.email || '',
      employerPhone: currentUser?.phone || '',
      employerTelegram: currentUser?.telegramHandle || '',
      employerVerified: currentUser?.verificationStatus === 'verified',
      employerAvatar: currentUser?.profilePhotoUrl || '',
      providerId: currentUser?.userId || 'guest_user',
      providerName: currentUser?.businessName || currentUser?.fullName || 'Orthodox Employer',
      deadline: newJob.deadline || '',
    };

    if (db) {
      try {
        await Promise.all([
          setDoc(doc(db, 'jobs', jobId), {
            ...jobPayload,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          }),
          setDoc(doc(db, 'gigs', jobId), {
            ...jobPayload,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          }),
        ]);
      } catch (err) {
        console.error('Firestore dual-write job/gig error:', err);
        handleFirestoreError(err, OperationType.CREATE, `jobs/${jobId}`);
      }
    }
  };

  const addProduct = async (newProduct: Partial<Product>) => {
    const prodId = `prod_${Date.now()}`;
    const prodPayload = {
      id: prodId,
      title: newProduct.title || 'Product Listing',
      amharicTitle: newProduct.amharicTitle || newProduct.title || 'የገበያ ምርት',
      description: newProduct.description || '',
      descriptionAm: newProduct.descriptionAm || newProduct.description || '',
      category: newProduct.category || 'Liturgical & Cultural Goods',
      categoryAm: newProduct.categoryAm || newProduct.category || 'ሃይማኖታዊና ባሕላዊ ቁሳቁሶች',
      price: Number(newProduct.price) || 1000,
      currency: 'ETB',
      wholesalePrice: newProduct.wholesalePrice ? Number(newProduct.wholesalePrice) : null,
      moq: newProduct.moq ? Number(newProduct.moq) : null,
      quantity: Number(newProduct.quantity) || 10,
      condition: newProduct.condition || 'new',
      location: newProduct.location || 'Addis Ababa',
      sellerId: currentUser?.userId || 'guest_seller',
      sellerName: currentUser?.businessName || currentUser?.fullName || 'Orthodox Seller',
      sellerVerified: currentUser?.verificationStatus === 'verified',
      sellerPhone: currentUser?.phone || '',
      sellerTelegram: currentUser?.telegramHandle || '',
      imageUrl: newProduct.imageUrl || '/assets/products/beeswax_candles.jpg',
      deliveryInfo: newProduct.deliveryInfo || 'Direct pickup or Addis Ababa delivery available.',
      isFeatured: Boolean(newProduct.isFeatured),
      isAvailable: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    if (db) {
      try {
        await setDoc(doc(db, 'products', prodId), prodPayload);
      } catch (err) {
        console.error('Firestore add product error:', err);
        handleFirestoreError(err, OperationType.CREATE, `products/${prodId}`);
      }
    }
  };

  const addService = async (newService: Partial<Service>) => {
    const servId = `serv_${Date.now()}`;
    const providerNameVal = currentUser?.fullName || 'Orthodox Professional';
    const rateVal = Number(newService.rateAmount) || 500;
    const servPayload = {
      id: servId,
      title: newService.title || 'Professional Service Offering',
      amharicTitle: newService.amharicTitle || newService.title || 'የሙያ አገልግሎት',
      category: newService.category || 'Consulting & Services',
      categoryAm: newService.categoryAm || newService.category || 'አማካሪነትና አገልግሎት',
      description: newService.description || '',
      descriptionAm: newService.descriptionAm || newService.description || '',
      providerName: providerNameVal,
      name: providerNameVal,
      providerId: currentUser?.userId || 'guest_pro',
      providerEmail: currentUser?.email || '',
      providerAvatar: currentUser?.profilePhotoUrl || '',
      location: newService.location || 'Addis Ababa',
      phone: currentUser?.phone || '',
      telegram: currentUser?.telegramHandle || '',
      rateAmount: rateVal,
      rateDescription: newService.rateDescription || `${rateVal.toLocaleString()} ETB / consultation`,
      rateDescriptionAm: newService.rateDescriptionAm || `${rateVal.toLocaleString()} ብር`,
      currency: 'ETB',
      experienceYears: Number(newService.experienceYears) || 3,
      rating: 5.0,
      reviewsCount: 0,
      skills: newService.skills || ['Professional Consultation'],
      isVerified: currentUser?.verificationStatus === 'verified',
      isAvailable: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    if (db) {
      try {
        await setDoc(doc(db, 'services', servId), servPayload);
      } catch (err) {
        console.error('Firestore add service error:', err);
        handleFirestoreError(err, OperationType.CREATE, `services/${servId}`);
      }
    }
  };

  const addBusiness = async (newBusiness: Partial<Business>) => {
    const bizId = `biz_${Date.now()}`;
    const bizPayload = {
      id: bizId,
      ownerId: currentUser?.userId || 'guest_owner',
      name: newBusiness.name || 'Commercial Enterprise',
      nameAm: newBusiness.nameAm || newBusiness.name || 'የንግድ ድርጅት',
      category: newBusiness.category || 'General Trading',
      categoryAm: newBusiness.categoryAm || newBusiness.category || 'አጠቃላይ ንግድ',
      type: newBusiness.type || 'distributor',
      description: newBusiness.description || '',
      descriptionAm: newBusiness.descriptionAm || newBusiness.description || '',
      location: newBusiness.location || 'Addis Ababa',
      city: newBusiness.city || newBusiness.location || 'Addis Ababa',
      phone: newBusiness.phone || currentUser?.phone || '',
      email: newBusiness.email || currentUser?.email || '',
      telegram: newBusiness.telegram || currentUser?.telegramHandle || '',
      logoUrl: newBusiness.logoUrl || '',
      isVerified: currentUser?.verificationStatus === 'verified',
      workingHours: newBusiness.workingHours || 'Mon - Sat: 8:30 AM - 6:00 PM',
      establishedYear: newBusiness.establishedYear || 2022,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    if (db) {
      try {
        await setDoc(doc(db, 'businesses', bizId), bizPayload);
      } catch (err) {
        console.error('Firestore add business error:', err);
        handleFirestoreError(err, OperationType.CREATE, `businesses/${bizId}`);
      }
    }
  };

  const updateProduct = async (productId: string, updates: Partial<Product>) => {
    if (!db || !productId) return;
    await setDoc(
      doc(db, 'products', productId),
      {
        ...updates,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  };

  const updateService = async (serviceId: string, updates: Partial<Service>) => {
    if (!db || !serviceId) return;
    await setDoc(
      doc(db, 'services', serviceId),
      {
        ...updates,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  };

  const fetchUserCompletedJobs = async (userId: string): Promise<CompletedJob[]> => {
    if (!db || !userId) return [];
    try {
      const snap = await getDocs(collection(db, 'users', userId, 'completed_jobs'));
      const list: CompletedJob[] = [];
      snap.forEach((d) => {
        const data = d.data() as any;
        list.push({
          id: d.id,
          userId: data.userId || userId,
          title: data.title || 'Completed Project',
          amharicTitle: data.amharicTitle || data.title || '',
          clientName: data.clientName || 'Client',
          category: data.category || '',
          completionDate: data.completionDate || parseTimestamp(data.createdAt, d.id),
          earningsAmount: Number(data.earningsAmount || 0),
          rating: Number(data.rating || 5),
          feedback: data.feedback || '',
          description: data.description || '',
          skillsUsed: Array.isArray(data.skillsUsed) ? data.skillsUsed : [],
          createdAt: parseTimestamp(data.createdAt, d.id),
        });
      });
      list.sort((a, b) => getTimestampMs(b.createdAt) - getTimestampMs(a.createdAt));
      return list;
    } catch (err) {
      console.warn('Fetch completed jobs notice:', err);
      return [];
    }
  };

  const addPrayerRequest = async (params: {
    authorName: string;
    spiritualName?: string;
    isAnonymous?: boolean;
    title: string;
    description: string;
    category: PrayerRequest['category'];
    categoryAm: string;
    location?: string;
    parishName?: string;
  }) => {
    if (!db) return;
    const prayerId = `prayer_${Date.now()}`;
    const uid = currentUser?.userId || `guest_${Date.now()}`;
    const displayAuthor = params.isAnonymous
      ? 'ስሙ የማይገለጽ ምዕመን'
      : params.authorName.trim() || currentUser?.fullName || 'ምዕመን';

    await setDoc(doc(db, 'prayers', prayerId), {
      id: prayerId,
      userId: uid,
      authorId: uid,
      authorName: displayAuthor,
      authorSpiritualName: params.spiritualName || '',
      spiritualName: params.spiritualName || '',
      isAnonymous: Boolean(params.isAnonymous),
      title: params.title.trim(),
      titleAm: params.title.trim(),
      description: params.description.trim(),
      category: params.category,
      categoryAm: params.categoryAm,
      location: params.location || currentUser?.location || 'ኢትዮጵያ',
      parish: params.parishName || '',
      parishName: params.parishName || '',
      amenCount: 1,
      prayersCount: 1,
      amenedBy: currentUser?.userId ? [currentUser.userId] : [],
      commentsCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  };

  const togglePrayerAmen = async (prayerId: string) => {
    if (!db || !prayerId) return;
    const uid = currentUser?.userId || 'guest_prayer_user';
    const target = prayers.find((p) => p.id === prayerId);
    const already = Boolean(target?.amenedBy?.includes(uid));

    await setDoc(
      doc(db, 'prayers', prayerId),
      {
        amenCount: increment(already ? -1 : 1),
        prayersCount: increment(already ? -1 : 1),
        amenedBy: already ? arrayRemove(uid) : arrayUnion(uid),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  };

  const addPrayerComment = async (
    prayerId: string,
    commentText: string,
    spiritualName?: string
  ) => {
    if (!db || !prayerId || !commentText.trim()) return;
    const commentId = `c_${Date.now()}`;
    const uid = currentUser?.userId || 'guest_commenter';
    const author = currentUser?.fullName || 'ምዕመን';

    await Promise.all([
      setDoc(doc(db, 'prayers', prayerId, 'comments', commentId), {
        id: commentId,
        prayerId,
        authorId: uid,
        authorName: author,
        authorSpiritualName: spiritualName || '',
        spiritualName: spiritualName || '',
        commentText: commentText.trim(),
        content: commentText.trim(),
        createdAt: serverTimestamp(),
      }),
      setDoc(
        doc(db, 'prayers', prayerId),
        {
          commentsCount: increment(1),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      ),
    ]);
  };

  const addSuccessStory = async (params: {
    userName: string;
    spiritualName?: string;
    userRole: string;
    partnerName: string;
    partnerRole?: string;
    category: SuccessStoryCategory;
    categoryAm: string;
    title: string;
    story: string;
    location: string;
    parishName?: string;
    outcomeMetric?: string;
  }) => {
    if (!db) return;
    const storyId = `story_${Date.now()}`;
    const uid = currentUser?.userId || `guest_${Date.now()}`;

    await setDoc(doc(db, 'success_stories', storyId), {
      id: storyId,
      userId: uid,
      authorId: uid,
      userName: params.userName.trim() || currentUser?.fullName || 'ምዕመን',
      userSpiritualName: params.spiritualName || '',
      spiritualName: params.spiritualName || '',
      userRoleAm: params.userRole.trim() || 'የማኅበረሰብ አባል',
      userRoleEn: params.userRole.trim() || 'Member',
      userAvatar: currentUser?.profilePhotoUrl || DEFAULT_AVATAR_URL,
      isVerified: currentUser?.verificationStatus === 'verified',
      partnerName: params.partnerName.trim(),
      partnerNames: params.partnerName.trim(),
      partnerRoleAm: params.partnerRole?.trim() || 'የተረጋገጠ አጋር',
      partnerRoleEn: params.partnerRole?.trim() || 'Partner Organization',
      isPartnerVerified: true,
      category: params.category,
      categoryAm: params.categoryAm,
      titleAm: params.title.trim(),
      titleEn: params.title.trim(),
      storyAm: params.story.trim(),
      storyEn: params.story.trim(),
      location: params.location.trim() || 'Addis Ababa',
      parish: params.parishName || '',
      parishName: params.parishName || '',
      outcomeMetric: params.outcomeMetric?.trim() || 'Successful Match',
      outcomeMetricAm: params.outcomeMetric?.trim() || 'የተሳካ ትስስር',
      blessingCount: 1,
      blessedCount: 1,
      blessedBy: currentUser?.userId ? [currentUser.userId] : [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  };

  const toggleStoryBlessing = async (storyId: string) => {
    if (!db || !storyId) return;
    const uid = currentUser?.userId || 'guest_story_user';
    const target = successStories.find((s) => s.id === storyId);
    const already = Boolean(target?.blessedBy?.includes(uid));

    await setDoc(
      doc(db, 'success_stories', storyId),
      {
        blessingCount: increment(already ? -1 : 1),
        blessedCount: increment(already ? -1 : 1),
        blessedBy: already ? arrayRemove(uid) : arrayUnion(uid),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  };

  const submitProposal = async (
    jobId: string,
    jobTitle: string,
    bidAmount: number,
    deliveryDays: number,
    coverLetter: string,
    employerIdOverride?: string
  ) => {
    const targetJob = jobs.find((j) => j.id === jobId);
    const resolvedEmployerId = employerIdOverride || targetJob?.employerId || '';
    const proposalId = `prop_${Date.now()}`;

    const proposalDoc = {
      id: proposalId,
      jobId,
      jobTitle,
      employerId: resolvedEmployerId,
      freelancerId: currentUser?.userId || 'freelancer_guest',
      freelancerName: currentUser?.fullName || 'Orthodox Freelancer',
      freelancerEmail: currentUser?.email || '',
      freelancerPhone: currentUser?.phone || '',
      coverLetter,
      bidAmount: Number(bidAmount),
      currency: 'ETB',
      deliveryDays: Number(deliveryDays),
      status: 'PENDING',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    if (db) {
      try {
        await setDoc(doc(db, 'proposals', proposalId), proposalDoc);
        updateDoc(doc(db, 'jobs', jobId), { proposalsCount: increment(1), updatedAt: serverTimestamp() }).catch(() => {});
        updateDoc(doc(db, 'gigs', jobId), { proposalsCount: increment(1), updatedAt: serverTimestamp() }).catch(() => {});

        if (resolvedEmployerId && resolvedEmployerId !== currentUser?.userId) {
          await createNotification(resolvedEmployerId, {
            title: `New Proposal for "${jobTitle}"`,
            amharicTitle: `ለ "${jobTitle}" አዲስ የሥራ ማመልከቻ ቀርቧል`,
            message: `${currentUser?.fullName || 'A freelancer'} submitted a bid of ${bidAmount.toLocaleString()} ETB (${deliveryDays} days).`,
            messageAm: `${currentUser?.fullName || 'ባለሙያ'} በ ${bidAmount.toLocaleString()} ብር (${deliveryDays} ቀናት) ማመልከቻ ልከዋል።`,
            type: 'JOB_APPLICATION',
            referenceId: jobId,
          });
        }
      } catch (err) {
        console.error('Firestore submit proposal failed', err);
        handleFirestoreError(err, OperationType.CREATE, `proposals/${proposalId}`);
      }
    }
  };

  const updateProposalStatus = async (
    proposalId: string,
    newStatus: ProposalStatus,
    note?: string
  ) => {
    const prop = proposals.find((p) => p.id === proposalId);
    const upperStatus = String(newStatus).toUpperCase();

    if (db) {
      try {
        await setDoc(
          doc(db, 'proposals', proposalId),
          {
            status: upperStatus,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );

        if (prop?.freelancerId) {
          await createNotification(prop.freelancerId, {
            title: `Proposal ${upperStatus}: ${prop.jobTitle}`,
            amharicTitle: `የማመልከቻዎ ሁኔታ ተቀይሯል (${upperStatus})`,
            message:
              note ||
              `Your proposal for "${prop.jobTitle}" was updated to ${upperStatus}.`,
            messageAm:
              note ||
              `ለ "${prop.jobTitle}" ያቀረቡት ማመልከቻ ወደ ${upperStatus} ተቀይሯል።`,
            type: 'STATUS_CHANGE',
            referenceId: prop.jobId,
          });

          if (upperStatus === 'ACCEPTED' && prop.freelancerId !== currentUser?.userId) {
            const convId = startOrOpenConversation(
              prop.freelancerId,
              prop.freelancerName,
              prop.jobTitle,
              undefined,
              {
                projectId: prop.jobId,
                opportunityType: 'JOB',
                budgetOrPrice: prop.bidAmount,
                category: 'Proposal Accepted',
              }
            );
            const acceptGreeting =
              language === 'am'
                ? `ሰላም ${prop.freelancerName}፣ ለ "${prop.jobTitle}" ያቀረቡት ማመልከቻ (${prop.bidAmount.toLocaleString()} ${prop.currency}) ተቀባይነት አግኝቷል። ስለ ቀጣይ እርምጃዎች እዚህ እንነጋገር!`
                : `Hello ${prop.freelancerName}, your proposal for "${prop.jobTitle}" (${prop.bidAmount.toLocaleString()} ${prop.currency}) has been ACCEPTED! Let's coordinate next steps here.`;
            await sendMessage(convId, acceptGreeting);
          }
        }
      } catch (err) {
        console.error('Update proposal status error:', err);
      }
    }
  };

  const completeProposalAndReview = async (params: {
    proposal: Proposal;
    job?: Job;
    rating: number;
    comment: string;
    projectRole: 'FREELANCER' | 'JOB_POSTER';
    targetUserId: string;
  }) => {
    const { proposal, job, rating, comment, projectRole, targetUserId } = params;

    await updateProposalStatus(
      proposal.id,
      'COMPLETED',
      `Project "${proposal.jobTitle}" marked COMPLETED.`
    );

    if (db) {
      // Write /users/{freelancerId}/completed_jobs/{jobId}
      const completedId = proposal.jobId || `comp_${Date.now()}`;
      const freelancerUid = proposal.freelancerId;
      if (freelancerUid) {
        await setDoc(doc(db, 'users', freelancerUid, 'completed_jobs', completedId), {
          id: completedId,
          userId: freelancerUid,
          title: proposal.jobTitle,
          amharicTitle: job?.amharicTitle || proposal.jobTitle,
          clientName: job?.employerName || currentUser?.fullName || 'Client',
          category: job?.category || 'General',
          completionDate: new Date().toISOString().slice(0, 10),
          earningsAmount: Number(proposal.bidAmount || job?.budget || 0),
          rating,
          feedback: comment,
          description: job?.description || proposal.coverLetter,
          skillsUsed: job?.skillsRequired || [],
          createdAt: serverTimestamp(),
        }).catch(() => {});
      }

      // Mark job/gig COMPLETED
      if (proposal.jobId) {
        updateDoc(doc(db, 'jobs', proposal.jobId), {
          status: 'COMPLETED',
          isActive: false,
          updatedAt: serverTimestamp(),
        }).catch(() => {});
        updateDoc(doc(db, 'gigs', proposal.jobId), {
          status: 'COMPLETED',
          isActive: false,
          updatedAt: serverTimestamp(),
        }).catch(() => {});
      }
    }

    if (targetUserId) {
      await submitReview({
        targetUserId,
        targetId: proposal.jobId,
        projectTitle: proposal.jobTitle,
        projectRole,
        rating,
        comment,
      });
    }
  };

  const placeProductOrder = async (
    product: Product,
    quantity: number,
    note?: string
  ): Promise<string> => {
    const total = Number(product.price || 0) * Math.max(1, quantity);
    if (product.sellerId && product.sellerId !== currentUser?.userId) {
      await createNotification(product.sellerId, {
        title: `New Order: ${product.title} (x${quantity})`,
        amharicTitle: `አዲስ የምርት ትዕዛዝ፦ ${product.amharicTitle || product.title}`,
        message: `${currentUser?.fullName || 'A buyer'} ordered ${quantity} unit(s) for ${total.toLocaleString()} ${product.currency}.${note ? ` Note: ${note}` : ''}`,
        messageAm: `${currentUser?.fullName || 'ገዢ'} ${quantity} ፍሬ በ ${total.toLocaleString()} ${product.currency} አዘዋል።${note ? ` ማስታወሻ፦ ${note}` : ''}`,
        type: 'ORDER',
        referenceId: product.id,
      });
    }

    const convId = startOrOpenConversation(
      product.sellerId,
      product.sellerName,
      product.title,
      product.imageUrl,
      {
        projectId: product.id,
        opportunityType: 'GENERAL',
        budgetOrPrice: total,
        category: product.category,
      }
    );

    const orderMessage =
      language === 'am'
        ? `ሰላም ${product.sellerName}፣ "${product.amharicTitle || product.title}" ${quantity} ፍሬ (ጠቅላላ ${total.toLocaleString()} ${product.currency}) ማዘዝ እፈልጋለሁ።${note ? `\nማስታወሻ፦ ${note}` : ''}`
        : `Hello ${product.sellerName}, I would like to order ${quantity}x "${product.title}" (Total: ${total.toLocaleString()} ${product.currency}).${note ? `\nNote: ${note}` : ''}`;

    await sendMessage(convId, orderMessage);
    closeModal();
    return convId;
  };

  const startOrOpenConversation = (
    participantId: string,
    participantName: string,
    projectTitle?: string,
    participantAvatar?: string,
    extra?: {
      projectId?: string;
      opportunityType?: OpportunityType;
      budgetOrPrice?: number;
      category?: string;
    }
  ): string => {
    const existing = conversations.find(
      (c) =>
        c.participants.includes(participantId) &&
        (!projectTitle || c.projectTitle === projectTitle)
    );

    if (existing) {
      setActiveConversationId(existing.id);
      setActiveTab('messages');
      return existing.id;
    }

    const myId = currentUser?.userId || 'guest_user';
    const myName = currentUser?.fullName || 'Community Member';
    const newConvId = `conv_${Date.now()}`;

    const newConv: Conversation = {
      id: newConvId,
      participants: [myId, participantId],
      participant1Id: myId,
      participant1Name: myName,
      participant1Avatar: currentUser?.profilePhotoUrl || '',
      participant2Id: participantId,
      participant2Name: participantName,
      participant2Avatar: participantAvatar || '',
      projectId: extra?.projectId || (projectTitle ? `proj_${Date.now()}` : undefined),
      projectTitle,
      opportunityType: extra?.opportunityType || 'GENERAL',
      budgetOrPrice: extra?.budgetOrPrice,
      category: extra?.category,
      lastMessage: `Started conversation regarding ${projectTitle || 'inquiry'}`,
      lastMessageSenderId: myId,
      lastMessageTimestamp: new Date().toISOString(),
      unreadCount: 0,
      unreadCountUser1: 0,
      unreadCountUser2: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setConversations((prev) => [newConv, ...prev]);
    setActiveConversationId(newConvId);
    setActiveTab('messages');

    if (db) {
      setDoc(doc(db, 'conversations', newConvId), {
        id: newConvId,
        participants: [myId, participantId],
        participant1Id: myId,
        participant1Name: myName,
        participant1Avatar: currentUser?.profilePhotoUrl || '',
        participant2Id: participantId,
        participant2Name: participantName,
        participant2Avatar: participantAvatar || '',
        projectId: newConv.projectId || '',
        projectTitle: projectTitle || '',
        opportunityType: newConv.opportunityType || 'GENERAL',
        budgetOrPrice: extra?.budgetOrPrice ?? null,
        category: extra?.category || '',
        lastMessage: newConv.lastMessage,
        lastMessageSenderId: myId,
        lastMessageTimestamp: serverTimestamp(),
        unreadCountUser1: 0,
        unreadCountUser2: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }).catch((err) => {
        console.error('Firestore save conversation error:', err);
      });
    }

    return newConvId;
  };

  const markConversationRead = async (conversationId: string) => {
    if (!db || !currentUser?.userId || !conversationId) return;
    const conv = conversations.find((c) => c.id === conversationId);
    if (!conv) return;
    const isP1 = conv.participant1Id === currentUser.userId;
    updateDoc(doc(db, 'conversations', conversationId), {
      [isP1 ? 'unreadCountUser1' : 'unreadCountUser2']: 0,
    }).catch(() => {});
  };

  const sendMessage = async (conversationId: string, content: string) => {
    if (!content.trim() || !conversationId) return;

    const myId = currentUser?.userId || 'guest_user';
    const myName = currentUser?.fullName || 'Community Member';
    const conv = conversations.find((c) => c.id === conversationId);
    const partnerId = conv
      ? conv.participant1Id === myId
        ? conv.participant2Id
        : conv.participant1Id
      : 'partner';
    const isP1 = conv ? conv.participant1Id === myId : true;
    const msgId = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`;

    const newMsg: ChatMessage = {
      id: msgId,
      conversationId,
      senderId: myId,
      senderName: myName,
      receiverId: partnerId,
      content: content.trim(),
      projectTitle: conv?.projectTitle,
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    if (db) {
      try {
        await setDoc(doc(db, 'conversations', conversationId, 'messages', msgId), {
          ...newMsg,
          projectTitle: conv?.projectTitle || '',
          createdAt: serverTimestamp(),
        });

        await setDoc(
          doc(db, 'conversations', conversationId),
          {
            id: conversationId,
            lastMessage: content.trim(),
            lastMessageSenderId: myId,
            lastMessageTimestamp: serverTimestamp(),
            [isP1 ? 'unreadCountUser2' : 'unreadCountUser1']: increment(1),
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );

        if (partnerId && partnerId !== 'partner' && partnerId !== myId) {
          await createNotification(partnerId, {
            title: `New Message from ${myName}`,
            amharicTitle: `ከ ${myName} አዲስ መልእክት ደርሶዎታል`,
            message: content.trim().slice(0, 140),
            messageAm: content.trim().slice(0, 140),
            type: 'MESSAGE',
            referenceId: conversationId,
          });
        }
      } catch (err) {
        console.error('Firestore send message error:', err);
      }
    }
  };

  const markNotificationRead = async (id: string) => {
    setNotifsFromSubCol((prev) =>
      prev[id] ? { ...prev, [id]: { ...prev[id], isRead: true } } : prev
    );
    setNotifsFromRootCol((prev) =>
      prev[id] ? { ...prev, [id]: { ...prev[id], isRead: true } } : prev
    );
    if (db && currentUser?.userId) {
      updateDoc(doc(db, 'users', currentUser.userId, 'notifications', id), {
        isRead: true,
      }).catch(() => {});
      updateDoc(doc(db, 'notifications', id), {
        isRead: true,
      }).catch(() => {});
    }
  };

  const markAllNotificationsRead = async () => {
    setNotifsFromSubCol((prev) => {
      const next: Record<string, NotificationItem> = {};
      Object.entries(prev).forEach(([k, v]) => {
        next[k] = { ...v, isRead: true };
      });
      return next;
    });
    setNotifsFromRootCol((prev) => {
      const next: Record<string, NotificationItem> = {};
      Object.entries(prev).forEach(([k, v]) => {
        next[k] = { ...v, isRead: true };
      });
      return next;
    });
    if (db && currentUser?.userId) {
      notifications
        .filter((n) => !n.isRead)
        .forEach((n) => {
          updateDoc(doc(db, 'users', currentUser.userId, 'notifications', n.id), {
            isRead: true,
          }).catch(() => {});
          updateDoc(doc(db, 'notifications', n.id), {
            isRead: true,
          }).catch(() => {});
        });
    }
  };

  const saveUserCV = (cvFile: any, parsedData?: any) => {
    if (!currentUser) return;
    updateProfile({
      cvFile,
      cvParsed: parsedData,
      profession: parsedData?.suggestedTitle || currentUser.profession,
      skills: Array.from(
        new Set([...(currentUser.skills || []), ...(parsedData?.extractedSkills || [])])
      ),
      bio: parsedData?.summaryEn || currentUser.bio,
      bioAm: parsedData?.summaryAm || currentUser.bioAm,
    });
  };

  const submitReview = async (params: {
    targetUserId: string;
    targetId?: string;
    projectTitle?: string;
    projectRole?: 'FREELANCER' | 'JOB_POSTER';
    rating: number;
    comment: string;
    tags?: string[];
  }) => {
    if (!db) return;
    const revId = `rev_${Date.now()}`;
    const cleanRating = Math.min(5, Math.max(1, Number(params.rating) || 5));

    await setDoc(doc(db, 'reviews', revId), {
      id: revId,
      targetUserId: params.targetUserId,
      targetId: params.targetId || '',
      authorId: currentUser?.userId || 'guest_reviewer',
      authorName: currentUser?.fullName || 'Community Member',
      authorAvatar: currentUser?.profilePhotoUrl || '',
      authorRole: currentUser?.profession || 'Community Member',
      projectTitle: params.projectTitle || 'Community Transaction',
      projectRole: params.projectRole || 'FREELANCER',
      rating: cleanRating,
      comment: params.comment.trim(),
      verifiedBuyer: true,
      tags: params.tags || [],
      helpfulCount: 0,
      createdAt: serverTimestamp(),
    });

    // Recalculate rating & reviewCount for /users/{targetUserId}
    if (params.targetUserId && !params.targetUserId.startsWith('guest_') && params.targetUserId !== 'general') {
      try {
        const snap = await getDocs(
          query(collection(db, 'reviews'), where('targetUserId', '==', params.targetUserId))
        );
        let sum = 0;
        let count = 0;
        snap.forEach((d) => {
          const r = Number((d.data() as any).rating || 5);
          sum += r;
          count += 1;
        });
        const avg = count > 0 ? Number((sum / count).toFixed(2)) : cleanRating;
        await setDoc(
          doc(db, 'users', params.targetUserId),
          {
            rating: avg,
            reviewCount: count || 1,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );

        await createNotification(params.targetUserId, {
          title: `New ${cleanRating}★ Review Received`,
          amharicTitle: `አዲስ የ ${cleanRating} ኮከብ ምስክርነት ተሰጥቶዎታል`,
          message: `${currentUser?.fullName || 'A member'} rated you ${cleanRating}/5: "${params.comment.slice(0, 100)}"`,
          messageAm: `${currentUser?.fullName || 'አባል'} ${cleanRating}/5 ደረጃ ሰጥተውዎታል፦ "${params.comment.slice(0, 100)}"`,
          type: 'REVIEW',
          referenceId: revId,
        });
      } catch (err) {
        console.warn('Recalculate rating notice:', err);
      }
    }
  };

  const submitReport = async (params: {
    targetType: Report['targetType'];
    targetId: string;
    targetTitle?: string;
    reason: string;
    details?: string;
  }) => {
    if (!db) return;
    const reportId = `rep_${Date.now()}`;
    await setDoc(doc(db, 'reports', reportId), {
      id: reportId,
      reporterId: currentUser?.userId || 'guest_reporter',
      reporterName: currentUser?.fullName || currentUser?.email || 'Community Member',
      targetType: params.targetType,
      targetId: params.targetId,
      targetTitle: params.targetTitle || '',
      reason: params.reason,
      details: params.details || '',
      status: 'PENDING',
      actionTaken: '',
      resolvedBy: '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  };

  // =========================================================================
  // ADMIN MODERATION & GOVERNANCE ACTIONS
  // =========================================================================
  const flagJob = (jobId: string, reason: string) => {
    const target = jobs.find((j) => j.id === jobId);
    if (db) {
      updateDoc(doc(db, 'jobs', jobId), {
        isFlagged: true,
        flagReason: reason,
        flaggedAt: new Date().toISOString(),
      }).catch(() => {});
      updateDoc(doc(db, 'gigs', jobId), {
        isFlagged: true,
        flagReason: reason,
        flaggedAt: new Date().toISOString(),
      }).catch(() => {});
      submitReport({
        targetType: 'JOB',
        targetId: jobId,
        targetTitle: target?.title,
        reason,
      }).catch(() => {});
    }
  };

  const unflagJob = (jobId: string) => {
    if (db) {
      updateDoc(doc(db, 'jobs', jobId), { isFlagged: false, flagReason: null }).catch(() => {});
      updateDoc(doc(db, 'gigs', jobId), { isFlagged: false, flagReason: null }).catch(() => {});
    }
  };

  const deleteJob = async (jobId: string) => {
    if (db) {
      await Promise.all([
        deleteDoc(doc(db, 'jobs', jobId)).catch(() => {}),
        deleteDoc(doc(db, 'gigs', jobId)).catch(() => {}),
      ]);
    }
  };

  const flagProduct = (productId: string, reason: string) => {
    const target = products.find((p) => p.id === productId);
    if (db) {
      updateDoc(doc(db, 'products', productId), {
        isFlagged: true,
        flagReason: reason,
        flaggedAt: new Date().toISOString(),
      }).catch(() => {});
      submitReport({
        targetType: 'PRODUCT',
        targetId: productId,
        targetTitle: target?.title,
        reason,
      }).catch(() => {});
    }
  };

  const unflagProduct = (productId: string) => {
    if (db) {
      updateDoc(doc(db, 'products', productId), { isFlagged: false, flagReason: null }).catch(() => {});
    }
  };

  const deleteProduct = async (productId: string) => {
    if (db) {
      await deleteDoc(doc(db, 'products', productId)).catch(() => {});
    }
  };

  const deleteService = async (serviceId: string) => {
    if (db) {
      await deleteDoc(doc(db, 'services', serviceId)).catch(() => {});
    }
  };

  const resolveReport = async (
    reportId: string,
    status: Report['status'],
    actionTaken?: string,
    deleteTarget?: boolean
  ) => {
    if (!db) return;
    const rep = reports.find((r) => r.id === reportId);
    await setDoc(
      doc(db, 'reports', reportId),
      {
        status,
        actionTaken: actionTaken || status,
        resolvedBy: currentUser?.email || 'Admin',
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    if (deleteTarget && rep?.targetId) {
      if (rep.targetType === 'JOB' || rep.targetType === 'GIG') {
        await deleteJob(rep.targetId);
      } else if (rep.targetType === 'PRODUCT') {
        await deleteProduct(rep.targetId);
      } else if (rep.targetType === 'SERVICE') {
        await deleteService(rep.targetId);
      } else if (rep.targetType === 'USER') {
        await suspendUser(rep.targetId, true);
      }
    }
  };

  const suspendUser = async (userId: string, isSuspended: boolean) => {
    if (!db || !userId) return;
    await setDoc(
      doc(db, 'users', userId),
      {
        isSuspended,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  };

  const changeUserRole = async (userId: string, newRole: UserRole) => {
    if (!db || !userId) return;
    const canonical = normalizeUserRole(newRole);
    await setDoc(
      doc(db, 'users', userId),
      {
        primaryRole: canonical,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  };

  const deleteUser = async (userId: string) => {
    if (!db || !userId) return;
    await deleteDoc(doc(db, 'users', userId)).catch(() => {});
  };

  const updateProfessionalStatus = async (
    profId: string,
    status: 'verified' | 'pending' | 'rejected',
    reason?: string
  ) => {
    if (db && profId) {
      try {
        const certId =
          status === 'verified'
            ? `OEC-VER-${new Date().getFullYear()}-${profId.slice(-4).toUpperCase()}`
            : null;
        await setDoc(
          doc(db, 'users', profId),
          {
            verificationStatus:
              status === 'verified' ? 'VERIFIED' : status === 'rejected' ? 'REJECTED' : 'PENDING',
            isVerified: status === 'verified',
            verifiedAt: status === 'verified' ? new Date().toISOString() : null,
            verifiedBy: status === 'verified' ? currentUser?.email || 'Admin' : null,
            certificateId: certId,
            rejectionReason: reason || null,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );

        await setDoc(
          doc(db, 'services', profId),
          {
            isVerified: status === 'verified',
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        ).catch(() => {});

        await createNotification(profId, {
          title: `Verification Status: ${status.toUpperCase()}`,
          amharicTitle:
            status === 'verified'
              ? 'መለያዎ በአስተዳዳሪ ተረጋግጧል (Verified)'
              : status === 'rejected'
              ? 'የማረጋገጫ ጥያቄዎ ውድቅ ተደርጓል'
              : 'የማረጋገጫ ሁኔታዎ በግምገማ ላይ ነው',
          message:
            status === 'verified'
              ? 'Congratulations! Your profile is now officially verified.'
              : reason || `Your verification status changed to ${status}.`,
          messageAm:
            status === 'verified'
              ? 'እንኳን ደስ አለዎት! መለያዎ በይፋ ተረጋግጧል።'
              : reason || `የማረጋገጫ ሁኔታዎ ወደ ${status} ተቀይሯል።`,
          type: 'VERIFICATION',
          referenceId: profId,
        });
      } catch (err) {
        console.error('Firestore update professional status error:', err);
      }
    }
  };

  const updateUserVerification = async (
    userId: string,
    status: 'verified' | 'pending' | 'unverified' | 'rejected',
    reason?: string
  ) => {
    const certId =
      status === 'verified'
        ? `OEC-VER-${new Date().getFullYear()}-${userId.slice(-4).toUpperCase()}`
        : undefined;
    if (currentUser && currentUser.userId === userId) {
      updateProfile({
        verificationStatus: status,
        verifiedAt: status === 'verified' ? new Date().toISOString() : undefined,
        verifiedBy: status === 'verified' ? currentUser?.email || 'Admin' : undefined,
        certificateId: certId,
      });
    }

    if (db && userId) {
      try {
        await setDoc(
          doc(db, 'users', userId),
          {
            verificationStatus: status.toUpperCase(),
            isVerified: status === 'verified',
            verifiedAt: status === 'verified' ? new Date().toISOString() : null,
            verifiedBy: status === 'verified' ? currentUser?.email || 'Admin' : null,
            certificateId: certId || null,
            rejectionReason: reason || null,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );

        await createNotification(userId, {
          title: `Account Verification: ${status.toUpperCase()}`,
          amharicTitle: `የመለያ ማረጋገጫ ሁኔታ፦ ${status.toUpperCase()}`,
          message:
            status === 'verified'
              ? 'Your community verification badge has been approved!'
              : reason || `Your account verification status is now ${status}.`,
          type: 'VERIFICATION',
          referenceId: userId,
        });
      } catch (err) {
        console.error('Firestore update user verification error:', err);
      }
    }
  };

  const openModal = (modal: AppContextType['activeModal'], data: any = null) => {
    setActiveModal(modal);
    setModalData(data);
  };

  const closeModal = () => {
    setActiveModal(null);
    setModalData(null);
  };

  const t = translations[language];

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        t,
        theme,
        toggleTheme,
        setTheme,
        activeTab,
        setActiveTab,
        contentFeedCategory,
        setContentFeedCategory,
        selectContentFeedCategory,
        currentUser,
        setCurrentUser,
        authReady,
        isFirebaseAuthenticated,
        isAdmin,
        adminEmails: SUPER_ADMIN_EMAILS,
        signIn,
        signInWithGoogle,
        registerUser,
        signOut,
        updateProfile,
        saveUserCV,
        registeredUsers,
        jobs,
        gigsCount,
        products,
        services,
        businesses,
        professionals,
        proposals,
        conversations,
        activeConversationId,
        setActiveConversationId,
        messages,
        notifications,
        completedJobs,
        reviews,
        reports,
        prayers,
        prayerComments,
        successStories,
        savedItemIds,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        selectedLocation,
        setSelectedLocation,
        selectedTypeFilter,
        setSelectedTypeFilter,
        toggleSaveItem,
        isItemSaved,
        addJob,
        addProduct,
        updateProduct,
        addService,
        updateService,
        addBusiness,
        fetchUserCompletedJobs,
        addPrayerRequest,
        togglePrayerAmen,
        addPrayerComment,
        addSuccessStory,
        toggleStoryBlessing,
        submitProposal,
        updateProposalStatus,
        completeProposalAndReview,
        placeProductOrder,
        sendMessage,
        startOrOpenConversation,
        markConversationRead,
        createNotification,
        markNotificationRead,
        markAllNotificationsRead,
        submitReview,
        submitReport,
        flagJob,
        unflagJob,
        deleteJob,
        flagProduct,
        unflagProduct,
        deleteProduct,
        deleteService,
        resolveReport,
        suspendUser,
        changeUserRole,
        deleteUser,
        updateProfessionalStatus,
        updateUserVerification,
        activeModal,
        modalData,
        openModal,
        closeModal,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

function dataSkills(data: any): string[] | undefined {
  return Array.isArray(data?.skills) ? data.skills : undefined;
}

function formatRoleFallback(role?: string): string {
  const upper = (role || '').toUpperCase();
  if (upper === 'FREELANCER') return 'Freelance Specialist';
  if (upper === 'SERVICE_PROVIDER' || upper === 'PROFESSIONAL') return 'Service Provider';
  if (upper === 'ADMIN') return 'Platform Administrator';
  return 'Community Professional';
}

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
