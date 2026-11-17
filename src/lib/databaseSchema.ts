/**
 * Database Schema Definition for Google Firebase Cloud Firestore
 *
 * Enforces strong category hierarchy mapping across the 54 professional service sectors
 * for 'users', 'jobs', 'services', and 'marketplaceItems' collections.
 */

import { 
  WORK_SECTORS_DATA, 
  ALL_54_WORK_SUBCATEGORIES, 
  SUBCATEGORIES_MAP,
  SuperCategory,
  SubCategory 
} from '../data/workSectors';

// ==========================================
// 1. FIRESTORE COLLECTION CONSTANTS
// ==========================================

export const COLLECTIONS = {
  USERS: 'users',
  JOBS: 'jobs',
  SERVICES: 'services',
  MARKETPLACE_ITEMS: 'marketplaceItems',
  // Historical / backward-compatible alias
  PRODUCTS: 'marketplaceItems',
  PROPOSALS: 'proposals',
  BUSINESSES: 'businesses',
} as const;

export type CollectionName = typeof COLLECTIONS[keyof typeof COLLECTIONS];

// ==========================================
// 2. ENUMERATED SECTOR TYPES & LITERALS
// ==========================================

export type SuperCategoryId =
  | 'education'
  | 'construction'
  | 'technology'
  | 'healthcare'
  | 'agriculture'
  | 'media_arts'
  | 'logistics'
  | 'sacred_arts'
  | 'business_finance';

export type WorkSubCategoryId =
  // Education & Training (6)
  | 'edu_tutoring'
  | 'edu_languages'
  | 'edu_vocational'
  | 'edu_curriculum'
  | 'edu_sunday_school'
  | 'edu_coaching'
  // Construction & Trades (7)
  | 'const_arch'
  | 'const_civil'
  | 'const_electrical'
  | 'const_plumbing'
  | 'const_masonry'
  | 'const_carpentry'
  | 'const_metalwork'
  // Technology & IT (7)
  | 'tech_mobile'
  | 'tech_web'
  | 'tech_cloud'
  | 'tech_ai'
  | 'tech_security'
  | 'tech_uiux'
  | 'tech_repair'
  // Healthcare & Wellbeing (5)
  | 'health_nursing'
  | 'health_physio'
  | 'health_maternal'
  | 'health_nutrition'
  | 'health_counseling'
  // Agriculture & Farming (5)
  | 'agri_horticulture'
  | 'agri_livestock'
  | 'agri_apiculture'
  | 'agri_irrigation'
  | 'agri_monastery'
  // Media & Creative Arts (6)
  | 'media_video'
  | 'media_photo'
  | 'media_graphic'
  | 'media_sound'
  | 'media_social'
  | 'media_animation'
  // Logistics & Transport (5)
  | 'log_freight'
  | 'log_driver'
  | 'log_pilgrimage'
  | 'log_delivery'
  | 'log_warehouse'
  // Sacred Arts & Community (7)
  | 'sacred_iconography'
  | 'sacred_vestments'
  | 'sacred_manuscripts'
  | 'sacred_carvings'
  | 'sacred_candles'
  | 'sacred_leather'
  | 'sacred_instruments'
  // Business, Finance & Law (8)
  | 'biz_audit'
  | 'biz_legal'
  | 'biz_translation'
  | 'biz_plan'
  | 'biz_hr'
  | 'biz_b2b'
  | 'biz_admin'
  | 'biz_events';

// ==========================================
// 3. STRICT CATEGORY HIERARCHY MAPPING
// ==========================================

export const SECTOR_HIERARCHY_MAP: Record<SuperCategoryId, readonly WorkSubCategoryId[]> = {
  education: [
    'edu_tutoring',
    'edu_languages',
    'edu_vocational',
    'edu_curriculum',
    'edu_sunday_school',
    'edu_coaching',
  ],
  construction: [
    'const_arch',
    'const_civil',
    'const_electrical',
    'const_plumbing',
    'const_masonry',
    'const_carpentry',
    'const_metalwork',
  ],
  technology: [
    'tech_mobile',
    'tech_web',
    'tech_cloud',
    'tech_ai',
    'tech_security',
    'tech_uiux',
    'tech_repair',
  ],
  healthcare: [
    'health_nursing',
    'health_physio',
    'health_maternal',
    'health_nutrition',
    'health_counseling',
  ],
  agriculture: [
    'agri_horticulture',
    'agri_livestock',
    'agri_apiculture',
    'agri_irrigation',
    'agri_monastery',
  ],
  media_arts: [
    'media_video',
    'media_photo',
    'media_graphic',
    'media_sound',
    'media_social',
    'media_animation',
  ],
  logistics: [
    'log_freight',
    'log_driver',
    'log_pilgrimage',
    'log_delivery',
    'log_warehouse',
  ],
  sacred_arts: [
    'sacred_iconography',
    'sacred_vestments',
    'sacred_manuscripts',
    'sacred_carvings',
    'sacred_candles',
    'sacred_leather',
    'sacred_instruments',
  ],
  business_finance: [
    'biz_audit',
    'biz_legal',
    'biz_translation',
    'biz_plan',
    'biz_hr',
    'biz_b2b',
    'biz_admin',
    'biz_events',
  ],
} as const;

// Quick reverse lookup: SubCategory ID -> SuperCategory ID
export const SUB_TO_SUPER_SECTOR_MAP: Record<WorkSubCategoryId, SuperCategoryId> = {
  edu_tutoring: 'education',
  edu_languages: 'education',
  edu_vocational: 'education',
  edu_curriculum: 'education',
  edu_sunday_school: 'education',
  edu_coaching: 'education',

  const_arch: 'construction',
  const_civil: 'construction',
  const_electrical: 'construction',
  const_plumbing: 'construction',
  const_masonry: 'construction',
  const_carpentry: 'construction',
  const_metalwork: 'construction',

  tech_mobile: 'technology',
  tech_web: 'technology',
  tech_cloud: 'technology',
  tech_ai: 'technology',
  tech_security: 'technology',
  tech_uiux: 'technology',
  tech_repair: 'technology',

  health_nursing: 'healthcare',
  health_physio: 'healthcare',
  health_maternal: 'healthcare',
  health_nutrition: 'healthcare',
  health_counseling: 'healthcare',

  agri_horticulture: 'agriculture',
  agri_livestock: 'agriculture',
  agri_apiculture: 'agriculture',
  agri_irrigation: 'agriculture',
  agri_monastery: 'agriculture',

  media_video: 'media_arts',
  media_photo: 'media_arts',
  media_graphic: 'media_arts',
  media_sound: 'media_arts',
  media_social: 'media_arts',
  media_animation: 'media_arts',

  log_freight: 'logistics',
  log_driver: 'logistics',
  log_pilgrimage: 'logistics',
  log_delivery: 'logistics',
  log_warehouse: 'logistics',

  sacred_iconography: 'sacred_arts',
  sacred_vestments: 'sacred_arts',
  sacred_manuscripts: 'sacred_arts',
  sacred_carvings: 'sacred_arts',
  sacred_candles: 'sacred_arts',
  sacred_leather: 'sacred_arts',
  sacred_instruments: 'sacred_arts',

  biz_audit: 'business_finance',
  biz_legal: 'business_finance',
  biz_translation: 'business_finance',
  biz_plan: 'business_finance',
  biz_hr: 'business_finance',
  biz_b2b: 'business_finance',
  biz_admin: 'business_finance',
  biz_events: 'business_finance',
};

// ==========================================
// 4. EMBEDDED SECTOR CLASSIFICATION OBJECT
// ==========================================

export interface SectorClassification {
  superCategoryId: SuperCategoryId;
  superCategoryNameAm: string;
  superCategoryNameEn: string;
  subCategoryId: WorkSubCategoryId;
  subCategoryNameAm: string;
  subCategoryNameEn: string;
  keywords: string[];
}

// ==========================================
// 5. FIRESTORE DOCUMENT SCHEMAS
// ==========================================

/**
 * 1. Users Collection ('users/{userId}')
 */
export interface FirestoreUser {
  userId: string;
  email: string;
  fullName: string;
  phone: string;
  telegramHandle?: string;
  profilePhotoUrl?: string;
  role: 'freelancer' | 'employer' | 'seller' | 'provider' | 'admin';
  verificationStatus: 'pending' | 'verified' | 'unverified';
  primarySector: SectorClassification;
  secondarySectors?: SectorClassification[];
  professionTitle?: string;
  professionTitleAm?: string;
  skills: string[];
  bio: string;
  bioAm?: string;
  city: string;
  cvUrl?: string;
  cvFileMetadata?: {
    fileName: string;
    fileSize: number;
    mimeType: string;
    uploadedAt: string;
  };
  cvParsedData?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

/**
 * 2. Jobs Collection ('jobs/{jobId}')
 */
export interface FirestoreJob {
  id: string;
  employerId: string;
  employerName: string;
  employerVerified: boolean;
  employerAvatar?: string;
  title: string;
  amharicTitle: string;
  description: string;
  descriptionAm: string;
  sector: SectorClassification;
  budget: number;
  budgetCurrency: 'ETB' | 'USD';
  paymentType: 'fixed' | 'hourly' | 'deliverable';
  location: string;
  isRemote: boolean;
  skillsRequired: string[];
  projectType: 'one-time' | 'ongoing' | 'contract';
  experienceLevel: 'entry' | 'intermediate' | 'expert';
  status: 'active' | 'in_progress' | 'completed' | 'cancelled';
  proposalsCount: number;
  deadline: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 3. Services Collection ('services/{serviceId}')
 */
export interface FirestoreService {
  id: string;
  providerId: string;
  providerName: string;
  providerAvatar?: string;
  isVerified: boolean;
  title: string;
  amharicTitle: string;
  sector: SectorClassification;
  rateAmount: number;
  currency: 'ETB' | 'USD';
  rateDescription: string;
  rateDescriptionAm: string;
  location: string;
  description: string;
  descriptionAm: string;
  experienceYears: number;
  phone: string;
  telegram?: string;
  rating: number;
  reviewsCount: number;
  skills: string[];
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * 4. MarketplaceItems Collection ('marketplaceItems/{itemId}')
 */
export interface FirestoreMarketplaceItem {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerPhone: string;
  sellerTelegram?: string;
  sellerVerified: boolean;
  title: string;
  amharicTitle: string;
  description: string;
  descriptionAm: string;
  sector: SectorClassification;
  price: number;
  wholesalePrice?: number;
  moq?: number; // Minimum Order Quantity for B2B wholesale
  currency: 'ETB' | 'USD';
  quantity: number;
  location: string;
  condition: 'new' | 'refurbished' | 'handcrafted' | 'custom_order';
  imageUrl: string;
  galleryImages?: string[];
  deliveryInfo: string;
  isAvailable: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// 6. VALIDATION & STRUCTURE ENFORCEMENT
// ==========================================

export class DatabaseValidationError extends Error {
  public readonly errors: string[];

  constructor(message: string, errors: string[] = []) {
    super(message);
    this.name = 'DatabaseValidationError';
    this.errors = errors;
  }
}

/**
 * Generates an immutable, fully-populated SectorClassification object
 * from any of the 54 valid SubCategoryId strings.
 */
export function buildSectorClassification(subCategoryId: WorkSubCategoryId): SectorClassification {
  const superCatId = SUB_TO_SUPER_SECTOR_MAP[subCategoryId];
  if (!superCatId) {
    throw new DatabaseValidationError(`Invalid work sector ID: '${subCategoryId}' is not among the 54 registered sectors.`);
  }

  const superCat = WORK_SECTORS_DATA.find(s => s.id === superCatId);
  const subCat = superCat?.subcategories.find(sub => sub.id === subCategoryId);

  if (!superCat || !subCat) {
    throw new DatabaseValidationError(`Sector definition for '${subCategoryId}' could not be resolved from data model.`);
  }

  return {
    superCategoryId: superCatId,
    superCategoryNameAm: superCat.nameAm,
    superCategoryNameEn: superCat.nameEn,
    subCategoryId,
    subCategoryNameAm: subCat.nameAm,
    subCategoryNameEn: subCat.nameEn,
    keywords: subCat.keywords || [],
  };
}

/**
 * Validates that a pair of superCategoryId and subCategoryId adhere strictly
 * to the hierarchical tree.
 */
export function validateSectorHierarchy(
  superCategoryId: string,
  subCategoryId: string
): { valid: boolean; error?: string } {
  const expectedSuperCat = SUB_TO_SUPER_SECTOR_MAP[subCategoryId as WorkSubCategoryId];
  if (!expectedSuperCat) {
    return {
      valid: false,
      error: `Subcategory '${subCategoryId}' is not one of the 54 valid professional service sectors.`
    };
  }

  if (expectedSuperCat !== superCategoryId) {
    return {
      valid: false,
      error: `Category mismatch: Subcategory '${subCategoryId}' belongs to SuperCategory '${expectedSuperCat}', but was submitted under '${superCategoryId}'.`
    };
  }

  return { valid: true };
}

/**
 * Validates a FirestoreUser payload before write
 */
export function validateUser(user: Partial<FirestoreUser>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!user.userId) errors.push('userId is required');
  if (!user.email || !user.email.includes('@')) errors.push('Valid email is required');
  if (!user.fullName || user.fullName.trim().length < 2) errors.push('Full name must be at least 2 characters');

  if (!user.primarySector) {
    errors.push('primarySector classification is required');
  } else {
    const check = validateSectorHierarchy(user.primarySector.superCategoryId, user.primarySector.subCategoryId);
    if (!check.valid && check.error) errors.push(check.error);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validates a FirestoreJob payload before write
 */
export function validateJob(job: Partial<FirestoreJob>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!job.employerId) errors.push('employerId is required');
  if (!job.title || job.title.trim().length < 3) errors.push('Job title must be at least 3 characters');
  if (!job.amharicTitle || job.amharicTitle.trim().length < 2) errors.push('Amharic title is required');
  if (job.budget === undefined || job.budget <= 0) errors.push('Job budget must be a positive number');

  if (!job.sector) {
    errors.push('sector classification is required');
  } else {
    const check = validateSectorHierarchy(job.sector.superCategoryId, job.sector.subCategoryId);
    if (!check.valid && check.error) errors.push(check.error);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validates a FirestoreService payload before write
 */
export function validateService(service: Partial<FirestoreService>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!service.providerId) errors.push('providerId is required');
  if (!service.title || service.title.trim().length < 3) errors.push('Service title must be at least 3 characters');
  if (!service.amharicTitle || service.amharicTitle.trim().length < 2) errors.push('Amharic title is required');
  if (service.rateAmount === undefined || service.rateAmount < 0) errors.push('Rate amount must be non-negative');

  if (!service.sector) {
    errors.push('sector classification is required');
  } else {
    const check = validateSectorHierarchy(service.sector.superCategoryId, service.sector.subCategoryId);
    if (!check.valid && check.error) errors.push(check.error);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validates a FirestoreMarketplaceItem payload before write
 */
export function validateMarketplaceItem(item: Partial<FirestoreMarketplaceItem>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!item.sellerId) errors.push('sellerId is required');
  if (!item.title || item.title.trim().length < 2) errors.push('Marketplace item title must be at least 2 characters');
  if (!item.amharicTitle || item.amharicTitle.trim().length < 2) errors.push('Amharic item title is required');
  if (item.price === undefined || item.price <= 0) errors.push('Item price must be a positive number');
  if (item.moq && item.moq < 1) errors.push('Minimum order quantity (MOQ) must be at least 1');

  if (!item.sector) {
    errors.push('sector classification is required');
  } else {
    const check = validateSectorHierarchy(item.sector.superCategoryId, item.sector.subCategoryId);
    if (!check.valid && check.error) errors.push(check.error);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// Export default schema registry
export const DatabaseSchema = {
  COLLECTIONS,
  SECTOR_HIERARCHY_MAP,
  SUB_TO_SUPER_SECTOR_MAP,
  buildSectorClassification,
  validateSectorHierarchy,
  validateUser,
  validateJob,
  validateService,
  validateMarketplaceItem,
};
