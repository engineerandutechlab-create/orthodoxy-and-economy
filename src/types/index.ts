export type Language = 'am' | 'en' | 'om' | 'ti';

export type CanonicalUserRole =
  | 'JOB_SEEKER'
  | 'EMPLOYER'
  | 'FREELANCER'
  | 'BUYER'
  | 'SELLER'
  | 'IMPORTER'
  | 'DISTRIBUTOR'
  | 'SERVICE_PROVIDER'
  | 'BUSINESS'
  | 'ADMIN';

export type LegacyUserRole =
  | 'employer'
  | 'employee'
  | 'freelancer'
  | 'seller'
  | 'buyer'
  | 'importer'
  | 'distributor'
  | 'professional'
  | 'business_owner'
  | 'admin';

export type UserRole = CanonicalUserRole | LegacyUserRole;

export const ALL_CANONICAL_ROLES: {
  id: CanonicalUserRole;
  labelEn: string;
  labelAm: string;
}[] = [
  { id: 'JOB_SEEKER', labelEn: 'Job Seeker', labelAm: 'ሥራ ፈላጊ' },
  { id: 'EMPLOYER', labelEn: 'Employer', labelAm: 'አሠሪ' },
  { id: 'FREELANCER', labelEn: 'Freelancer', labelAm: 'ነፃ ባለሙያ (Freelancer)' },
  { id: 'BUYER', labelEn: 'Buyer', labelAm: 'ገዢ' },
  { id: 'SELLER', labelEn: 'Seller / Merchant', labelAm: 'ሻጭ / ነጋዴ' },
  { id: 'IMPORTER', labelEn: 'Importer', labelAm: 'አስመጪ' },
  { id: 'DISTRIBUTOR', labelEn: 'Distributor', labelAm: 'አከፋፋይ' },
  { id: 'SERVICE_PROVIDER', labelEn: 'Service Provider', labelAm: 'አገልግሎት ሰጪ' },
  { id: 'BUSINESS', labelEn: 'Business / Enterprise', labelAm: 'የንግድ ድርጅት' },
  { id: 'ADMIN', labelEn: 'Administrator', labelAm: 'አስተዳዳሪ (Admin)' },
];

export function normalizeUserRole(role?: string | null): CanonicalUserRole {
  const upper = (role || '').toUpperCase().trim();
  switch (upper) {
    case 'JOB_SEEKER':
    case 'EMPLOYEE':
      return 'JOB_SEEKER';
    case 'EMPLOYER':
      return 'EMPLOYER';
    case 'FREELANCER':
      return 'FREELANCER';
    case 'BUYER':
      return 'BUYER';
    case 'SELLER':
      return 'SELLER';
    case 'IMPORTER':
      return 'IMPORTER';
    case 'DISTRIBUTOR':
      return 'DISTRIBUTOR';
    case 'SERVICE_PROVIDER':
    case 'PROFESSIONAL':
      return 'SERVICE_PROVIDER';
    case 'BUSINESS':
    case 'BUSINESS_OWNER':
      return 'BUSINESS';
    case 'ADMIN':
      return 'ADMIN';
    default:
      return 'EMPLOYER';
  }
}

export function formatRoleLabel(role?: string | null, lang: Language = 'en'): string {
  const canonical = normalizeUserRole(role);
  const found = ALL_CANONICAL_ROLES.find((r) => r.id === canonical);
  if (!found) return canonical;
  return lang === 'am' ? `${found.labelAm} (${found.labelEn})` : found.labelEn;
}

export interface PortfolioProject {
  id?: string;
  title: string;
  description: string;
  year: string;
  link?: string;
}

export interface VaultDocument {
  id: string;
  title: string;
  docType: 'certificate' | 'license' | 'recommendation' | 'id' | 'other';
  visibility: 'PUBLIC' | 'PRIVATE';
  urlOrContent: string;
  uploadedAt: string;
}

export interface CompletedJob {
  id: string;
  userId: string;
  title: string;
  amharicTitle?: string;
  clientName: string;
  category?: string;
  completionDate: string;
  earningsAmount: number;
  rating: number;
  feedback?: string;
  description?: string;
  skillsUsed?: string[];
  createdAt: string;
}

export interface UserProfile {
  id?: string;
  userId: string;
  email: string;
  fullName: string;
  name?: string;
  username: string;
  primaryRole: UserRole;
  secondaryRoles?: string[];
  profession?: string;
  businessName?: string;
  businessCategory?: string;
  location: string;
  phone?: string;
  bio?: string;
  bioAm?: string;
  skills: string[];
  telegramHandle?: string;
  profilePhotoUrl?: string;
  parishName?: string;
  spiritualFatherContact?: string;
  verificationDocType?: string;
  verificationDocDetails?: string;
  portfolioItems?: PortfolioProject[];
  vaultDocuments?: VaultDocument[];
  cvFile?: {
    name: string;
    size: number;
    uploadedAt: string;
    textSnippet?: string;
    fileData?: string;
    builderGenerated?: boolean;
  };
  cvParsed?: {
    suggestedTitle?: string;
    extractedSkills?: string[];
    experienceYears?: number;
    summaryAm?: string;
    summaryEn?: string;
    education?: { degree: string; institution: string; year: string }[];
    experience?: { role: string; company: string; duration: string; highlights?: string }[];
    languages?: string[];
  };
  verificationStatus: 'verified' | 'pending' | 'unverified' | 'rejected';
  isSuspended?: boolean;
  verifiedAt?: string;
  verifiedBy?: string;
  certificateId?: string;
  verificationBadgeTitle?: string;
  savedItemIds?: string[];
  rating: number;
  reviewCount: number;
  completedDeals?: number;
  memberSince?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Job {
  id: string;
  employerId: string;
  employerName: string;
  employerEmail?: string;
  employerPhone?: string;
  employerTelegram?: string;
  employerVerified: boolean;
  employerAvatar?: string;
  title: string;
  amharicTitle: string;
  description: string;
  descriptionAm?: string;
  budget: number;
  budgetAmount?: number;
  budgetCurrency: 'ETB' | 'USD';
  paymentType: 'fixed' | 'monthly' | 'hourly';
  category: string;
  categoryAm?: string;
  location: string;
  skillsRequired: string[];
  projectType: 'one-time' | 'ongoing' | 'full-time' | 'contract' | 'FIXED_PRICE' | 'HOURLY' | 'GIG';
  employmentType?: string;
  experienceLevel: 'entry' | 'intermediate' | 'expert';
  deliveryDays?: number;
  isRemote: boolean;
  isActive?: boolean;
  status: 'active' | 'closed' | 'OPEN' | 'COMPLETED';
  proposalsCount: number;
  deadline?: string;
  isFlagged?: boolean;
  flagReason?: string;
  flaggedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Product {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerVerified: boolean;
  sellerPhone?: string;
  sellerTelegram?: string;
  title: string;
  amharicTitle: string;
  description: string;
  descriptionAm?: string;
  category: string;
  categoryAm?: string;
  price: number;
  currency: 'ETB' | 'USD';
  wholesalePrice?: number;
  moq?: number;
  quantity: number;
  location: string;
  condition: 'new' | 'used' | 'refurbished' | 'handcrafted';
  imageUrl: string;
  additionalImages?: string[];
  isAvailable: boolean;
  deliveryInfo?: string;
  isFeatured?: boolean;
  isFlagged?: boolean;
  flagReason?: string;
  flaggedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Service {
  id: string;
  providerId: string;
  providerName: string;
  name?: string;
  providerEmail?: string;
  providerAvatar?: string;
  isVerified: boolean;
  title: string;
  amharicTitle: string;
  category: string;
  categoryAm?: string;
  rateDescription: string;
  rateDescriptionAm?: string;
  rateAmount: number;
  currency: 'ETB' | 'USD';
  location: string;
  description: string;
  descriptionAm?: string;
  experienceYears: number;
  phone?: string;
  telegram?: string;
  rating: number;
  reviewsCount: number;
  skills: string[];
  isAvailable: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Business {
  id: string;
  ownerId: string;
  name: string;
  nameAm?: string;
  category: string;
  categoryAm?: string;
  type: 'importer' | 'distributor' | 'manufacturer' | 'retailer' | 'service_firm';
  description: string;
  descriptionAm?: string;
  location: string;
  city: string;
  address?: string;
  phone: string;
  email?: string;
  telegram?: string;
  website?: string;
  logoUrl?: string;
  bannerUrl?: string;
  isVerified: boolean;
  workingHours?: string;
  establishedYear?: number;
  activeListingsCount?: number;
  createdAt: string;
}

export interface Professional {
  id: string;
  userId: string;
  fullName: string;
  fullNameAm?: string;
  title: string;
  titleAm?: string;
  bio: string;
  bioAm?: string;
  category: string;
  location: string;
  photoUrl: string;
  skills: string[];
  experienceYears: number;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  status?: 'verified' | 'pending' | 'rejected';
  rejectionReason?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  certificateId?: string;
  parishName?: string;
  spiritualFatherContact?: string;
  email?: string;
  phone?: string;
  telegram?: string;
  hourlyRate?: number;
  portfolioItems?: PortfolioProject[];
  createdAt?: string;
}

export type ProposalStatus =
  | 'PENDING'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'SHORTLISTED'
  | 'INTERVIEW'
  | 'ACCEPTED'
  | 'COMPLETED'
  | 'REJECTED'
  | 'pending'
  | 'accepted'
  | 'declined';

export interface Proposal {
  id: string;
  jobId: string;
  jobTitle: string;
  employerId?: string;
  freelancerId: string;
  freelancerName: string;
  freelancerEmail?: string;
  freelancerPhone?: string;
  coverLetter: string;
  bidAmount: number;
  currency: 'ETB' | 'USD';
  deliveryDays: number;
  status: ProposalStatus;
  createdAt: string;
  updatedAt?: string;
}

export type OpportunityType = 'JOB' | 'SERVICE' | 'GIG' | 'GENERAL';

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  content: string;
  projectTitle?: string;
  isRead: boolean;
  createdAt: string;
}

export interface Conversation {
  id: string;
  participants: string[];
  participant1Id: string;
  participant1Name: string;
  participant1Avatar?: string;
  participant2Id: string;
  participant2Name: string;
  participant2Avatar?: string;
  projectId?: string;
  projectTitle?: string;
  opportunityType?: OpportunityType;
  budgetOrPrice?: number;
  category?: string;
  lastMessage: string;
  lastMessageSenderId: string;
  lastMessageTimestamp: string;
  unreadCount?: number;
  unreadCountUser1?: number;
  unreadCountUser2?: number;
  createdAt?: string;
  updatedAt: string;
}

export type NotificationType =
  | 'MESSAGE'
  | 'JOB_APPLICATION'
  | 'ORDER'
  | 'REVIEW'
  | 'VERIFICATION'
  | 'STATUS_CHANGE'
  | 'proposal'
  | 'message'
  | 'verification'
  | 'system'
  | 'job_match';

export interface NotificationItem {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  titleAm?: string;
  amharicTitle?: string;
  message: string;
  messageAm?: string;
  isRead: boolean;
  referenceId?: string;
  createdAt: string;
  link?: string;
}

export interface Review {
  id: string;
  targetUserId: string;
  targetId?: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  authorRole?: string;
  projectTitle?: string;
  projectRole: 'FREELANCER' | 'JOB_POSTER';
  rating: number;
  comment: string;
  verifiedBuyer?: boolean;
  tags?: string[];
  helpfulCount?: number;
  createdAt: string;
}

export interface Report {
  id: string;
  reporterId: string;
  reporterName: string;
  targetType: 'USER' | 'JOB' | 'GIG' | 'PRODUCT' | 'SERVICE' | 'MESSAGE';
  targetId: string;
  targetTitle?: string;
  reason: string;
  details?: string;
  status: 'PENDING' | 'RESOLVED' | 'DISMISSED' | 'ACTION_TAKEN';
  actionTaken?: string;
  resolvedBy?: string;
  createdAt: string;
  updatedAt?: string;
}

export type ContentFeedCategory =
  | 'all'
  | 'freelance_gigs'
  | 'marketplace'
  | 'spiritual_items'
  | 'services'
  | 'jobs'
  | 'b2b_wholesale';

export type ActiveTab =
  | 'home'
  | 'jobs'
  | 'marketplace'
  | 'services'
  | 'businesses'
  | 'professionals'
  | 'prayers'
  | 'dashboard'
  | 'messages'
  | 'about'
  | 'ai-studio'
  | 'knowledge';

export interface PrayerComment {
  id: string;
  prayerId?: string;
  authorId?: string;
  authorName: string;
  authorSpiritualName?: string;
  spiritualName?: string;
  commentText: string;
  content?: string;
  createdAt: string;
}

export interface PrayerRequest {
  id: string;
  userId?: string;
  authorId?: string;
  authorName: string;
  authorSpiritualName?: string;
  spiritualName?: string;
  isAnonymous?: boolean;
  title: string;
  titleAm: string;
  description: string;
  category:
    | 'work_business'
    | 'health_healing'
    | 'family_peace'
    | 'education_exam'
    | 'travel_pilgrimage'
    | 'thanksgiving'
    | 'general';
  categoryAm: string;
  location?: string;
  parish?: string;
  parishName?: string;
  prayersCount: number;
  amenCount?: number;
  amenedBy?: string[];
  commentsCount?: number;
  comments: PrayerComment[];
  createdAt: string;
  updatedAt?: string;
}

export type SuccessStoryCategory =
  | 'found_job'
  | 'found_partner'
  | 'hired_talent'
  | 'joint_venture'
  | 'procured_supplies';

export interface SuccessStory {
  id: string;
  userId?: string;
  authorId?: string;
  userName: string;
  userSpiritualName?: string;
  spiritualName?: string;
  userRoleAm: string;
  userRoleEn: string;
  userAvatar: string;
  isVerified: boolean;
  partnerName: string;
  partnerNames?: string;
  partnerRoleAm: string;
  partnerRoleEn: string;
  partnerAvatar?: string;
  isPartnerVerified: boolean;
  category: SuccessStoryCategory;
  categoryAm: string;
  titleAm: string;
  titleEn: string;
  storyAm: string;
  storyEn: string;
  location: string;
  parish?: string;
  parishName?: string;
  outcomeMetric?: string;
  outcomeMetricAm?: string;
  blessedCount: number;
  blessingCount?: number;
  blessedBy?: string[];
  createdAt: string;
  updatedAt?: string;
}
