/**
 * Service layer for Google Firebase Cloud Firestore CRUD Operations
 *
 * Provides typed helper functions for jobs, services, marketplace items, and users,
 * strictly enforcing the 54 professional service sector schema categories.
 */

import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  DocumentData,
  QueryConstraint
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { 
  COLLECTIONS, 
  FirestoreJob, 
  FirestoreService, 
  FirestoreMarketplaceItem, 
  FirestoreUser, 
  SectorClassification, 
  WorkSubCategoryId, 
  SuperCategoryId, 
  buildSectorClassification, 
  validateJob, 
  validateService, 
  validateMarketplaceItem, 
  validateUser, 
  validateSectorHierarchy,
  DatabaseValidationError,
  SUB_TO_SUPER_SECTOR_MAP 
} from './databaseSchema';

// ==========================================
// 1. STANDARDIZED FIRESTORE ERROR HANDLING
// ==========================================

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

/**
 * Standardized error handler according to Firebase Integration guidelines.
 * Formats permission and Firestore failures with structured debugging context.
 */
export function handleFirestoreError(
  error: unknown, 
  operationType: OperationType, 
  path: string | null
): never {
  const currentUser = auth.currentUser;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentUser?.uid,
      email: currentUser?.email,
      emailVerified: currentUser?.emailVerified,
      isAnonymous: currentUser?.isAnonymous,
      tenantId: currentUser?.tenantId,
      providerInfo: currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };

  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// ==========================================
// 2. INPUT TYPES & SECTOR RESOLVERS
// ==========================================

export type CreateJobInput = Omit<FirestoreJob, 'id' | 'createdAt' | 'updatedAt' | 'sector'> & {
  id?: string;
  sector?: SectorClassification;
  subCategoryId?: WorkSubCategoryId;
};

export type CreateProductInput = Omit<FirestoreMarketplaceItem, 'id' | 'createdAt' | 'updatedAt' | 'sector'> & {
  id?: string;
  sector?: SectorClassification;
  subCategoryId?: WorkSubCategoryId;
};

export type CreateServiceInput = Omit<FirestoreService, 'id' | 'createdAt' | 'updatedAt' | 'sector'> & {
  id?: string;
  sector?: SectorClassification;
  subCategoryId?: WorkSubCategoryId;
};

export interface QueryFilters {
  superCategory?: SuperCategoryId | string;
  subCategory?: WorkSubCategoryId | string;
  location?: string;
  limitCount?: number;
}

export interface JobQueryFilters extends QueryFilters {
  isRemote?: boolean;
  status?: FirestoreJob['status'];
}

export interface ProductQueryFilters extends QueryFilters {
  wholesaleOnly?: boolean;
  condition?: FirestoreMarketplaceItem['condition'];
}

/**
 * Helper to ensure a SectorClassification object is fully resolved and validated
 */
function resolveSector(
  explicitSector?: SectorClassification, 
  subCategoryId?: WorkSubCategoryId
): SectorClassification {
  if (explicitSector) {
    const hierarchyCheck = validateSectorHierarchy(
      explicitSector.superCategoryId, 
      explicitSector.subCategoryId
    );
    if (!hierarchyCheck.valid) {
      throw new DatabaseValidationError(hierarchyCheck.error || 'Invalid sector hierarchy');
    }
    return explicitSector;
  }

  if (subCategoryId) {
    return buildSectorClassification(subCategoryId);
  }

  throw new DatabaseValidationError(
    'A valid professional sector is required. Please specify either a valid subCategoryId (from the 54 registered sectors) or a complete SectorClassification object.'
  );
}

// ==========================================
// 3. JOB CRUD OPERATIONS
// ==========================================

/**
 * Adds a new Job opportunity to Firestore with strict sector validation.
 */
export async function addJob(jobInput: CreateJobInput): Promise<FirestoreJob> {
  const collectionPath = COLLECTIONS.JOBS;
  const now = new Date().toISOString();
  const sector = resolveSector(jobInput.sector, jobInput.subCategoryId);

  const fullJob: FirestoreJob = {
    id: jobInput.id || `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    employerId: jobInput.employerId || auth.currentUser?.uid || 'anonymous_employer',
    employerName: jobInput.employerName || auth.currentUser?.displayName || 'Employer',
    employerVerified: Boolean(jobInput.employerVerified),
    employerAvatar: jobInput.employerAvatar,
    title: jobInput.title,
    amharicTitle: jobInput.amharicTitle || jobInput.title,
    description: jobInput.description || '',
    descriptionAm: jobInput.descriptionAm || jobInput.description || '',
    sector,
    budget: Number(jobInput.budget) || 1000,
    budgetCurrency: jobInput.budgetCurrency || 'ETB',
    paymentType: jobInput.paymentType || 'fixed',
    location: jobInput.location || 'Addis Ababa',
    isRemote: Boolean(jobInput.isRemote),
    skillsRequired: jobInput.skillsRequired && jobInput.skillsRequired.length > 0
      ? jobInput.skillsRequired
      : sector.keywords.slice(0, 3),
    projectType: jobInput.projectType || 'one-time',
    experienceLevel: jobInput.experienceLevel || 'intermediate',
    status: jobInput.status || 'active',
    proposalsCount: jobInput.proposalsCount || 0,
    deadline: jobInput.deadline || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    createdAt: now,
    updatedAt: now,
  };

  // Schema Validation
  const validation = validateJob(fullJob);
  if (!validation.valid) {
    throw new DatabaseValidationError(
      `Job validation failed: ${validation.errors.join(', ')}`, 
      validation.errors
    );
  }

  try {
    const docRef = doc(db, collectionPath, fullJob.id);
    await setDoc(docRef, fullJob);
    return fullJob;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, collectionPath);
  }
}

/**
 * Retrieves Job opportunities with optional filters for Super Category, Sub Category, and remote modality.
 */
export async function getJobs(filters?: JobQueryFilters): Promise<FirestoreJob[]> {
  const collectionPath = COLLECTIONS.JOBS;

  try {
    const colRef = collection(db, collectionPath);
    const constraints: QueryConstraint[] = [];

    if (filters?.status) {
      constraints.push(where('status', '==', filters.status));
    }
    if (filters?.superCategory && filters.superCategory !== 'All' && filters.superCategory !== 'all') {
      constraints.push(where('sector.superCategoryId', '==', filters.superCategory));
    }
    if (filters?.subCategory && filters.subCategory !== 'All' && filters.subCategory !== 'all') {
      constraints.push(where('sector.subCategoryId', '==', filters.subCategory));
    }
    if (filters?.isRemote !== undefined) {
      constraints.push(where('isRemote', '==', filters.isRemote));
    }

    // Constraints & limit
    if (filters?.limitCount) {
      constraints.push(limit(filters.limitCount));
    }

    const q = constraints.length > 0 ? query(colRef, ...constraints) : colRef;
    const snapshot = await getDocs(q);

    return snapshot.docs.map(docSnap => docSnap.data() as FirestoreJob);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, collectionPath);
  }
}

/**
 * Fetch a single Job by ID
 */
export async function getJobById(jobId: string): Promise<FirestoreJob | null> {
  const docPath = `${COLLECTIONS.JOBS}/${jobId}`;
  try {
    const docRef = doc(db, COLLECTIONS.JOBS, jobId);
    const snap = await getDoc(docRef);
    return snap.exists() ? (snap.data() as FirestoreJob) : null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, docPath);
  }
}

/**
 * Update an existing Job
 */
export async function updateJob(jobId: string, updates: Partial<FirestoreJob>): Promise<void> {
  const docPath = `${COLLECTIONS.JOBS}/${jobId}`;
  try {
    const docRef = doc(db, COLLECTIONS.JOBS, jobId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, docPath);
  }
}

/**
 * Delete a Job by ID
 */
export async function deleteJob(jobId: string): Promise<void> {
  const docPath = `${COLLECTIONS.JOBS}/${jobId}`;
  try {
    const docRef = doc(db, COLLECTIONS.JOBS, jobId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
  }
}

// ==========================================
// 4. SERVICE CRUD OPERATIONS
// ==========================================

/**
 * Retrieves professional services with optional category filters.
 */
export async function getServices(filters?: QueryFilters): Promise<FirestoreService[]> {
  const collectionPath = COLLECTIONS.SERVICES;

  try {
    const colRef = collection(db, collectionPath);
    const constraints: QueryConstraint[] = [];

    if (filters?.superCategory && filters.superCategory !== 'All' && filters.superCategory !== 'all') {
      constraints.push(where('sector.superCategoryId', '==', filters.superCategory));
    }
    if (filters?.subCategory && filters.subCategory !== 'All' && filters.subCategory !== 'all') {
      constraints.push(where('sector.subCategoryId', '==', filters.subCategory));
    }
    if (filters?.limitCount) {
      constraints.push(limit(filters.limitCount));
    }

    const q = constraints.length > 0 ? query(colRef, ...constraints) : colRef;
    const snapshot = await getDocs(q);

    return snapshot.docs.map(docSnap => docSnap.data() as FirestoreService);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, collectionPath);
  }
}

/**
 * Adds a new Service offering with strict category validation.
 */
export async function addService(serviceInput: CreateServiceInput): Promise<FirestoreService> {
  const collectionPath = COLLECTIONS.SERVICES;
  const now = new Date().toISOString();
  const sector = resolveSector(serviceInput.sector, serviceInput.subCategoryId);

  const fullService: FirestoreService = {
    id: serviceInput.id || `serv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    providerId: serviceInput.providerId || auth.currentUser?.uid || 'anonymous_provider',
    providerName: serviceInput.providerName || auth.currentUser?.displayName || 'Service Provider',
    providerAvatar: serviceInput.providerAvatar,
    isVerified: Boolean(serviceInput.isVerified),
    title: serviceInput.title,
    amharicTitle: serviceInput.amharicTitle || serviceInput.title,
    sector,
    rateAmount: Number(serviceInput.rateAmount) || 500,
    currency: serviceInput.currency || 'ETB',
    rateDescription: serviceInput.rateDescription || 'Competitive Rate',
    rateDescriptionAm: serviceInput.rateDescriptionAm || 'ተመጣጣኝ ዋጋ',
    location: serviceInput.location || 'Addis Ababa',
    description: serviceInput.description || '',
    descriptionAm: serviceInput.descriptionAm || serviceInput.description || '',
    experienceYears: Number(serviceInput.experienceYears) || 3,
    phone: serviceInput.phone || '+251 91 123 4567',
    telegram: serviceInput.telegram,
    rating: serviceInput.rating || 5.0,
    reviewsCount: serviceInput.reviewsCount || 0,
    skills: serviceInput.skills || sector.keywords.slice(0, 3),
    isAvailable: serviceInput.isAvailable !== false,
    createdAt: now,
    updatedAt: now,
  };

  const validation = validateService(fullService);
  if (!validation.valid) {
    throw new DatabaseValidationError(
      `Service validation failed: ${validation.errors.join(', ')}`, 
      validation.errors
    );
  }

  try {
    const docRef = doc(db, collectionPath, fullService.id);
    await setDoc(docRef, fullService);
    return fullService;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, collectionPath);
  }
}

/**
 * Fetch a single Service by ID
 */
export async function getServiceById(serviceId: string): Promise<FirestoreService | null> {
  const docPath = `${COLLECTIONS.SERVICES}/${serviceId}`;
  try {
    const docRef = doc(db, COLLECTIONS.SERVICES, serviceId);
    const snap = await getDoc(docRef);
    return snap.exists() ? (snap.data() as FirestoreService) : null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, docPath);
  }
}

// ==========================================
// 5. MARKETPLACE / PRODUCT CRUD OPERATIONS
// ==========================================

/**
 * Adds a new Product / Marketplace item to Firestore with strict category validation.
 */
export async function addProduct(productInput: CreateProductInput): Promise<FirestoreMarketplaceItem> {
  const collectionPath = COLLECTIONS.MARKETPLACE_ITEMS;
  const now = new Date().toISOString();
  const sector = resolveSector(productInput.sector, productInput.subCategoryId);

  const fullProduct: FirestoreMarketplaceItem = {
    id: productInput.id || `prod_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    sellerId: productInput.sellerId || auth.currentUser?.uid || 'anonymous_seller',
    sellerName: productInput.sellerName || auth.currentUser?.displayName || 'Seller',
    sellerPhone: productInput.sellerPhone || '+251 91 123 4567',
    sellerTelegram: productInput.sellerTelegram,
    sellerVerified: Boolean(productInput.sellerVerified),
    title: productInput.title,
    amharicTitle: productInput.amharicTitle || productInput.title,
    description: productInput.description || '',
    descriptionAm: productInput.descriptionAm || productInput.description || '',
    sector,
    price: Number(productInput.price) || 500,
    wholesalePrice: productInput.wholesalePrice ? Number(productInput.wholesalePrice) : undefined,
    moq: productInput.moq ? Number(productInput.moq) : undefined,
    currency: productInput.currency || 'ETB',
    quantity: Number(productInput.quantity) || 1,
    location: productInput.location || 'Addis Ababa',
    condition: productInput.condition || 'new',
    imageUrl: productInput.imageUrl || '/assets/products/beeswax_candles.jpg',
    galleryImages: productInput.galleryImages,
    deliveryInfo: productInput.deliveryInfo || 'Delivery or direct pickup available in Addis Ababa.',
    isAvailable: productInput.isAvailable !== false,
    isFeatured: Boolean(productInput.isFeatured),
    createdAt: now,
    updatedAt: now,
  };

  const validation = validateMarketplaceItem(fullProduct);
  if (!validation.valid) {
    throw new DatabaseValidationError(
      `Marketplace item validation failed: ${validation.errors.join(', ')}`, 
      validation.errors
    );
  }

  try {
    const docRef = doc(db, collectionPath, fullProduct.id);
    await setDoc(docRef, fullProduct);
    return fullProduct;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, collectionPath);
  }
}

/**
 * Retrieves marketplace items with optional category and wholesale filters.
 */
export async function getProducts(filters?: ProductQueryFilters): Promise<FirestoreMarketplaceItem[]> {
  const collectionPath = COLLECTIONS.MARKETPLACE_ITEMS;

  try {
    const colRef = collection(db, collectionPath);
    const constraints: QueryConstraint[] = [];

    if (filters?.superCategory && filters.superCategory !== 'All' && filters.superCategory !== 'all') {
      constraints.push(where('sector.superCategoryId', '==', filters.superCategory));
    }
    if (filters?.subCategory && filters.subCategory !== 'All' && filters.subCategory !== 'all') {
      constraints.push(where('sector.subCategoryId', '==', filters.subCategory));
    }
    if (filters?.condition) {
      constraints.push(where('condition', '==', filters.condition));
    }
    if (filters?.limitCount) {
      constraints.push(limit(filters.limitCount));
    }

    const q = constraints.length > 0 ? query(colRef, ...constraints) : colRef;
    const snapshot = await getDocs(q);

    let items = snapshot.docs.map(docSnap => docSnap.data() as FirestoreMarketplaceItem);

    if (filters?.wholesaleOnly) {
      items = items.filter(item => Boolean(item.moq && item.moq > 1));
    }

    return items;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, collectionPath);
  }
}

/**
 * Alias for getProducts
 */
export const getMarketplaceItems = getProducts;

/**
 * Fetch a single Product / Marketplace item by ID
 */
export async function getProductById(productId: string): Promise<FirestoreMarketplaceItem | null> {
  const docPath = `${COLLECTIONS.MARKETPLACE_ITEMS}/${productId}`;
  try {
    const docRef = doc(db, COLLECTIONS.MARKETPLACE_ITEMS, productId);
    const snap = await getDoc(docRef);
    return snap.exists() ? (snap.data() as FirestoreMarketplaceItem) : null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, docPath);
  }
}

/**
 * Delete a Product / Marketplace item by ID
 */
export async function deleteProduct(productId: string): Promise<void> {
  const docPath = `${COLLECTIONS.MARKETPLACE_ITEMS}/${productId}`;
  try {
    const docRef = doc(db, COLLECTIONS.MARKETPLACE_ITEMS, productId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
  }
}

// Export comprehensive operations object
export const DbOperations = {
  addJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
  getServices,
  addService,
  getServiceById,
  addProduct,
  getProducts,
  getMarketplaceItems,
  getProductById,
  deleteProduct,
  handleFirestoreError,
};
