import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  verifyPasswordResetCode,
  confirmPasswordReset,
  ActionCodeSettings,
  updateProfile,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  setLogLevel,
  collection,
  collectionGroup,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  updateDoc,
  getDocs,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { DEFAULT_REVIEWS } from './data/defaultReviews';
import { DEFAULT_CATEGORIES, CATEGORIES_VERSION } from './data/defaultCategories';
import { PRODUCTS, CATALOG_VERSION } from './data/products';
import { Category, Product, StoreSettings, PromoCode, TouzaUser } from './types';
export type { TouzaUser };

// Initialize Firebase
const resolvedFirebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || firebaseConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfig.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || firebaseConfig.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfig.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfig.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || firebaseConfig.appId,
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || firebaseConfig.firestoreDatabaseId,
};

const app = initializeApp(resolvedFirebaseConfig);

// Initialize Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Suppress verbose backend connection warnings
try {
  setLogLevel('silent');
} catch {}

// Initialize Firestore with clean real-time connection across all mobile and desktop devices
export const db = resolvedFirebaseConfig.firestoreDatabaseId
  ? getFirestore(app, resolvedFirebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Helper to timeout long-hanging Firestore requests (e.g. offline/network latency/Safari ITP)
const fetchWithTimeout = <T>(promise: Promise<T>, timeoutMs = 15000): Promise<T> => {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('Firestore operation timed out (offline fallback)'));
    }, timeoutMs);

    promise
      .then((res) => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
};

// Safe JSON stringify helper to prevent cyclic structure errors with Firestore Timestamps, FieldValues, and circular references
export function safeJsonStringify(obj: any, space?: number | string): string {
  try {
    const seen = new WeakSet();

    const clean = (val: any): any => {
      if (val === null || val === undefined) {
        return val;
      }
      const valType = typeof val;
      if (valType === 'string' || valType === 'number' || valType === 'boolean') {
        return val;
      }
      if (valType === 'bigint') {
        return val.toString();
      }
      if (valType === 'function' || valType === 'symbol') {
        return undefined;
      }

      if (valType === 'object') {
        // Handle Firestore Timestamp
        if (typeof val.toDate === 'function') {
          try {
            return val.toDate().toISOString();
          } catch {
            return new Date().toISOString();
          }
        }
        // Handle timestamp-like objects { seconds, nanoseconds }
        if (typeof val.seconds === 'number' && typeof val.nanoseconds === 'number') {
          return new Date(val.seconds * 1000).toISOString();
        }
        // Handle Date objects
        if (val instanceof Date) {
          return isNaN(val.getTime()) ? null : val.toISOString();
        }
        // Handle Firestore DocumentReference / Collections
        if (
          val.constructor &&
          (val.constructor.name === 'DocumentReference' ||
            val.constructor.name === '_DocumentReference' ||
            val.constructor.name === 'CollectionReference' ||
            val.constructor.name === '_CollectionReference' ||
            (val._key && val.firestore))
        ) {
          return val.path || val.id || '[DocumentReference]';
        }
        // Handle Firestore FieldValue
        if (val.constructor && (val.constructor.name === 'FieldValue' || (val as any)._methodName)) {
          return new Date().toISOString();
        }
        // Skip DOM nodes, window, document, and React fiber nodes
        if (
          (typeof window !== 'undefined' && (val instanceof HTMLElement || val === window || val === document)) ||
          val.$$typeof
        ) {
          return undefined;
        }

        // Cyclic structure detection
        if (seen.has(val)) {
          return undefined;
        }
        seen.add(val);

        if (Array.isArray(val)) {
          const resultArr: any[] = [];
          for (let i = 0; i < val.length; i++) {
            try {
              const item = clean(val[i]);
              resultArr.push(item !== undefined ? item : null);
            } catch {
              resultArr.push(null);
            }
          }
          return resultArr;
        }

        const resultObj: Record<string, any> = {};
        const keys = Object.keys(val);
        for (let i = 0; i < keys.length; i++) {
          const key = keys[i];
          if (
            key.startsWith('_') &&
            (key.includes('firestore') || key.includes('client') || key.includes('internal') || key.includes('auth'))
          ) {
            continue;
          }
          try {
            const propVal = clean(val[key]);
            if (propVal !== undefined) {
              resultObj[key] = propVal;
            }
          } catch {
            // Ignore property if getter throws
          }
        }
        return resultObj;
      }

      return undefined;
    };

    const sanitized = clean(obj);
    return JSON.stringify(sanitized, null, space);
  } catch (error) {
    console.warn('safeJsonStringify fallback error:', error);
    try {
      if (Array.isArray(obj)) return '[]';
      if (typeof obj === 'object' && obj !== null) return '{}';
      return JSON.stringify(String(obj));
    } catch {
      return '""';
    }
  }
}

// Recursively strips undefined fields and circular references to prevent Firestore invalid data errors
export function sanitizeForFirestore<T>(obj: T, seen = new WeakSet()): T {
  if (obj === null || obj === undefined) {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeForFirestore(item, seen)) as unknown as T;
  }
  if (typeof obj === 'object' && !(obj instanceof Date) && typeof (obj as any).toDate !== 'function') {
    if (seen.has(obj as object)) {
      return undefined as unknown as T;
    }
    seen.add(obj as object);

    const cleaned: any = {};
    const keys = Object.keys(obj);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      try {
        const val = (obj as any)[key];
        if (val !== undefined) {
          const sanitizedVal = sanitizeForFirestore(val, seen);
          if (sanitizedVal !== undefined) {
            cleaned[key] = sanitizedVal;
          }
        }
      } catch {
        // Ignore errors
      }
    }
    return cleaned as T;
  }
  return obj;
}

// Sign in with Google
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Create or update user document in Firestore under 'users/{uid}'
    if (user) {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userDocRef);

        if (!userSnap.exists()) {
          const newUserData = {
            uid: user.uid,
            name: user.displayName || 'عميل توزا',
            username: user.email ? user.email.split('@')[0] : 'user_' + user.uid.substring(0, 5),
            email: user.email || '',
            phone: user.phoneNumber || 'غير مسجل',
            createdAt: serverTimestamp(),
            provider: 'google',
            photoURL: user.photoURL || '',
            lastLoginAt: serverTimestamp(),
          };
          await setDoc(userDocRef, newUserData);
        } else {
          await setDoc(
            userDocRef,
            {
              lastLoginAt: serverTimestamp(),
              photoURL: user.photoURL || userSnap.data().photoURL || '',
            },
            { merge: true }
          );
        }
      } catch (docError) {
        console.warn('User logged in with Google, but updating user profile doc had non-fatal notice:', docError);
      }
    }
    return user;
  } catch (error) {
    console.error('Google Sign-In Error:', error);
    throw error;
  }
};

// Sign Up with Email & Password
export const signUpWithEmail = async (
  fullName: string,
  username: string,
  email: string,
  phone: string,
  password: string
) => {
  const cleanEmail = email.trim().toLowerCase();
  const result = await createUserWithEmailAndPassword(auth, cleanEmail, password);
  const user = result.user;

  if (user) {
    try {
      await updateProfile(user, { displayName: fullName.trim() });
    } catch (pErr) {
      console.warn('Update profile display name error:', pErr);
    }

    try {
      const userData = {
        uid: user.uid,
        name: fullName.trim(),
        username: username.trim(),
        email: cleanEmail,
        phone: phone.trim(),
        createdAt: serverTimestamp(),
        provider: 'email',
        photoURL: '',
        lastLoginAt: serverTimestamp(),
      };

      await setDoc(doc(db, 'users', user.uid), userData);
    } catch (docErr) {
      console.warn('Firestore user doc creation error (non-fatal):', docErr);
    }
  }

  return user;
};

// Sign In with Email & Password
export const signInWithEmail = async (email: string, password: string) => {
  const cleanEmail = email.trim().toLowerCase();
  const result = await signInWithEmailAndPassword(auth, cleanEmail, password);
  const user = result.user;

  if (user) {
    try {
      await setDoc(
        doc(db, 'users', user.uid),
        { lastLoginAt: serverTimestamp() },
        { merge: true }
      );
    } catch {}
  }

  return user;
};

// Reset Password via Firebase
export const resetPassword = async (email: string) => {
  const cleanEmail = email.trim().toLowerCase();
  
  // Determine production vs dev redirect URL
  const isProd = typeof window !== 'undefined' && window.location.hostname.includes('touza.shop');
  const redirectUrl = isProd ? 'https://touza.shop/reset-password' : `${window.location.origin}/reset-password`;

  const actionCodeSettings: ActionCodeSettings = {
    url: redirectUrl,
    handleCodeInApp: true,
  };

  console.log('[Firebase Auth] Calling sendPasswordResetEmail for:', cleanEmail, 'with redirectUrl:', redirectUrl);
  try {
    await sendPasswordResetEmail(auth, cleanEmail, actionCodeSettings);
    console.log('[Firebase Auth] sendPasswordResetEmail completed successfully for:', cleanEmail);
  } catch (error: any) {
    console.error('[Firebase Auth] sendPasswordResetEmail error:', error?.code, error?.message, error);
    throw error;
  }
};

// Verify Password Reset Code (oobCode)
export const verifyResetCode = async (oobCode: string): Promise<string> => {
  console.log('[Firebase Auth] Verifying password reset code...');
  try {
    const userEmail = await verifyPasswordResetCode(auth, oobCode);
    console.log('[Firebase Auth] Code verified successfully for email:', userEmail);
    return userEmail;
  } catch (error: any) {
    console.error('[Firebase Auth] verifyPasswordResetCode error:', error?.code, error?.message, error);
    throw error;
  }
};

// Confirm New Password with Reset Code
export const confirmNewPassword = async (oobCode: string, newPassword: string): Promise<void> => {
  console.log('[Firebase Auth] Confirming new password...');
  try {
    await confirmPasswordReset(auth, oobCode, newPassword);
    console.log('[Firebase Auth] Password reset confirmed successfully');
  } catch (error: any) {
    console.error('[Firebase Auth] confirmPasswordReset error:', error?.code, error?.message, error);
    throw error;
  }
};

// Get User Profile details from 'users' collection
export const getUserProfile = async (uid: string): Promise<TouzaUser | null> => {
  try {
    const userDocSnap = await getDoc(doc(db, 'users', uid));
    if (userDocSnap.exists()) {
      const data = userDocSnap.data();
      return {
        uid: userDocSnap.id,
        name: data.name || data.displayName || '',
        username: data.username || '',
        email: data.email || '',
        phone: data.phone || '',
        createdAt: data.createdAt,
        provider: data.provider || 'email',
        photoURL: data.photoURL || data.photo || '',
      };
    }
    return null;
  } catch (e) {
    console.error('Failed to fetch user profile:', e);
    return null;
  }
};

// Subscribe to Users list in real-time (Admin Dashboard)
export const subscribeToUsersAdmin = (
  callback: (users: TouzaUser[]) => void
): (() => void) => {
  try {
    const usersRef = collection(db, 'users');
    const unsubscribe = onSnapshot(
      usersRef,
      (snapshot) => {
        const usersList: TouzaUser[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          let createdAt = data.createdAt;
          if (createdAt && typeof createdAt.toDate === 'function') {
            try { createdAt = createdAt.toDate().toISOString(); } catch { createdAt = new Date().toISOString(); }
          } else if (createdAt && typeof createdAt.seconds === 'number') {
            createdAt = new Date(createdAt.seconds * 1000).toISOString();
          } else if (!createdAt || typeof createdAt === 'object') {
            createdAt = new Date().toISOString();
          }
          usersList.push({
            uid: docSnap.id,
            name: data.name || data.displayName || 'عميل توزا',
            username: data.username || (data.email ? data.email.split('@')[0] : 'user'),
            email: data.email || '',
            phone: data.phone || 'غير مسجل',
            createdAt,
            provider: data.provider || 'email',
            photoURL: data.photoURL || data.photo || '',
            lastLoginAt: data.lastLoginAt,
          });
        });
        usersList.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
        callback(usersList);
      },
      (error) => {
        console.warn('Realtime users listener error:', error);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.error('Could not start realtime users listener:', err);
    return () => {};
  }
};

// Real-time Orders Listener for Admin Dashboard
export const subscribeToOrdersAdmin = (
  callback: (orders: SavedOrder[]) => void
): (() => void) => {
  try {
    const ordersRef = collection(db, 'orders');
    const unsubscribe = onSnapshot(
      ordersRef,
      (snapshot) => {
        const orders: SavedOrder[] = [];
        snapshot.forEach((docSnap) => {
          orders.push(cleanOrderObject({ id: docSnap.id, ...docSnap.data() }));
        });
        orders.sort((a, b) => {
          const timeA = typeof a.createdAt === 'string' ? new Date(a.createdAt).getTime() : 0;
          const timeB = typeof b.createdAt === 'string' ? new Date(b.createdAt).getTime() : 0;
          return timeB - timeA;
        });
        localStorage.setItem('maison_orders_cache', safeJsonStringify(orders));
        callback(orders);
      },
      (error) => {
        console.warn('Realtime orders listener error:', error);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.error('Could not start realtime orders listener:', err);
    return () => {};
  }
};

// Sign out
export const logOut = async () => {
  return await signOut(auth);
};

// Listen to Auth state changes
export const subscribeToAuth = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Interfaces for Orders
export interface FirestoreOrderItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  selectedColor: string;
  selectedSize: string;
  image: string;
}

export interface FirestoreOrderData {
  orderNumber: string;
  items: FirestoreOrderItem[];
  subtotal: number;
  discountAmount: number;
  shipping: number;
  total: number;
  status: 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: {
    fullName: string;
    street: string;
    apartment?: string;
    city: string;
    state?: string;
    zipCode?: string;
    country: string;
    phone: string;
  };
  paymentMethod: string;
}

export interface SavedOrder extends FirestoreOrderData {
  id: string;
  userId: string;
  userEmail: string;
  createdAt: any;
}

// Helper to convert Firestore Timestamps / FieldValues in orders to clean serializable objects
const cleanOrderObject = (data: any): SavedOrder => {
  let createdAtStr = data?.createdAt;
  if (createdAtStr && typeof createdAtStr.toDate === 'function') {
    try {
      createdAtStr = createdAtStr.toDate().toISOString();
    } catch {
      createdAtStr = new Date().toISOString();
    }
  } else if (createdAtStr && typeof createdAtStr.seconds === 'number') {
    createdAtStr = new Date(createdAtStr.seconds * 1000).toISOString();
  } else if (typeof createdAtStr === 'string' && createdAtStr.trim()) {
    createdAtStr = createdAtStr.trim();
  } else {
    createdAtStr = new Date().toISOString();
  }

  return {
    ...data,
    id: data?.id || data?.orderNumber || 'ord-' + Math.random().toString(36).substring(2, 9),
    createdAt: createdAtStr,
  };
};

// Save Order strictly tied to logged-in User in top-level 'orders' collection
export const saveUserOrder = async (
  userId: string,
  userEmail: string,
  orderData: FirestoreOrderData
) => {
  if (!userId) throw new Error('User must be logged in to save order');
  
  // Create document directly in top-level 'orders' collection
  const orderRef = doc(collection(db, 'orders'));
  const createdAtIso = new Date().toISOString();

  const firestoreOrder = {
    id: orderRef.id,
    userId,
    userEmail: userEmail || orderData.shippingAddress?.phone || 'customer@touza.com',
    ...orderData,
    createdAt: serverTimestamp(),
  };

  const returnOrder: SavedOrder = {
    id: orderRef.id,
    userId,
    userEmail: userEmail || orderData.shippingAddress?.phone || 'customer@touza.com',
    ...orderData,
    createdAt: createdAtIso,
  };

  // Save to top-level 'orders' collection
  await setDoc(orderRef, firestoreOrder);

  // Also save to user subcollection for backward compatibility
  try {
    const userSubcollRef = doc(db, 'users', userId, 'orders', orderRef.id);
    await setDoc(userSubcollRef, firestoreOrder);
  } catch (err) {
    console.warn('Non-fatal error saving order to user subcollection:', err);
  }

  // Update admin orders cache immediately
  try {
    const cachedOrdersStr = localStorage.getItem('maison_orders_cache');
    const cachedOrders: SavedOrder[] = cachedOrdersStr ? JSON.parse(cachedOrdersStr) : [];
    if (!cachedOrders.some((o) => o.id === returnOrder.id)) {
      cachedOrders.unshift(returnOrder);
      localStorage.setItem('maison_orders_cache', safeJsonStringify(cachedOrders));
    }
  } catch {}

  return returnOrder;
};

// Get User Orders strictly for logged-in User using query with where('userId', '==', userId)
export const getUserOrders = async (userId: string): Promise<SavedOrder[]> => {
  if (!userId) return [];
  
  try {
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, where('userId', '==', userId));
    const snapshot = await fetchWithTimeout(getDocs(q));

    const orders: SavedOrder[] = [];
    snapshot.forEach((docSnap) => {
      orders.push(cleanOrderObject({ id: docSnap.id, ...docSnap.data() }));
    });

    // Merge with user subcollection if any older orders exist
    try {
      const userSubcollRef = collection(db, 'users', userId, 'orders');
      const userSubSnap = await fetchWithTimeout(getDocs(userSubcollRef));
      const existingIds = new Set(orders.map((o) => o.id));
      userSubSnap.forEach((docSnap) => {
        const item = cleanOrderObject({ id: docSnap.id, ...docSnap.data() });
        if (!existingIds.has(item.id)) {
          orders.push(item);
        }
      });
    } catch {}

    orders.sort((a, b) => {
      const timeA = typeof a.createdAt === 'string' ? new Date(a.createdAt).getTime() : 0;
      const timeB = typeof b.createdAt === 'string' ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA;
    });

    return orders;
  } catch (error) {
    console.warn('Primary query for user orders failed, trying user subcollection fallback:', error);
    try {
      const userSubcollRef = collection(db, 'users', userId, 'orders');
      const snapshot = await fetchWithTimeout(getDocs(userSubcollRef));
      const orders: SavedOrder[] = [];
      snapshot.forEach((docSnap) => {
        orders.push(cleanOrderObject({ id: docSnap.id, ...docSnap.data() }));
      });
      orders.sort((a, b) => {
        const timeA = typeof a.createdAt === 'string' ? new Date(a.createdAt).getTime() : 0;
        const timeB = typeof b.createdAt === 'string' ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      });
      return orders;
    } catch (fallbackError) {
      console.error('Failed to get user orders:', fallbackError);
      return [];
    }
  }
};

// Admin: Get All Orders across all users
export const getAllOrdersAdmin = async (): Promise<SavedOrder[]> => {
  try {
    const ordersRef = collection(db, 'orders');
    const snapshot = await fetchWithTimeout(getDocs(ordersRef));
    const orders: SavedOrder[] = [];
    snapshot.forEach((docSnap) => {
      orders.push(cleanOrderObject({ id: docSnap.id, ...docSnap.data() }));
    });

    // If top-level orders is empty, try collection group query
    if (orders.length === 0) {
      try {
        const ordersGroup = collectionGroup(db, 'orders');
        const groupSnap = await fetchWithTimeout(getDocs(ordersGroup));
        groupSnap.forEach((docSnap) => {
          orders.push(cleanOrderObject({ id: docSnap.id, ...docSnap.data() }));
        });
      } catch {}
    }

    // Sort in memory by createdAt descending
    orders.sort((a, b) => {
      const timeA = typeof a.createdAt === 'string' ? new Date(a.createdAt).getTime() : 0;
      const timeB = typeof b.createdAt === 'string' ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA;
    });
    if (orders.length > 0) {
      localStorage.setItem('maison_orders_cache', safeJsonStringify(orders));
    }
    return orders;
  } catch (error) {
    console.warn('Notice: Fetching admin orders issue, falling back to cache:', error);
    try {
      return JSON.parse(localStorage.getItem('maison_orders_cache') || '[]');
    } catch {
      return [];
    }
  }
};

// Admin: Update Order Status
export const updateOrderStatusAdmin = async (
  userId: string,
  orderId: string,
  newStatus: SavedOrder['status']
) => {
  try {
    // Update top-level orders doc
    const orderDocRef = doc(db, 'orders', orderId);
    await updateDoc(orderDocRef, { status: newStatus }).catch(() => {});

    // Also update subcollection doc if exists
    if (userId) {
      const userOrderDocRef = doc(db, 'users', userId, 'orders', orderId);
      await updateDoc(userOrderDocRef, { status: newStatus }).catch(() => {});
    }
    return true;
  } catch (error) {
    console.error('Failed to update order status:', error);
    throw error;
  }
};

// Admin: Delete Order
export const deleteOrderAdmin = async (userId: string, orderId: string) => {
  try {
    const orderDocRef = doc(db, 'orders', orderId);
    await deleteDoc(orderDocRef).catch(() => {});

    if (userId) {
      const userOrderDocRef = doc(db, 'users', userId, 'orders', orderId);
      await deleteDoc(userOrderDocRef).catch(() => {});
    }

    try {
      const cachedOrders: SavedOrder[] = JSON.parse(localStorage.getItem('maison_orders_cache') || '[]');
      const filtered = cachedOrders.filter((o) => o.id !== orderId && o.orderNumber !== orderId);
      localStorage.setItem('maison_orders_cache', safeJsonStringify(filtered));

      const deletedOrders: string[] = JSON.parse(localStorage.getItem('maison_deleted_orders') || '[]');
      if (!deletedOrders.includes(orderId)) {
        deletedOrders.push(orderId);
        localStorage.setItem('maison_deleted_orders', safeJsonStringify(deletedOrders));
      }
    } catch {}

    try {
      await setDoc(doc(db, 'deleted_orders', orderId), {
        orderId,
        deletedAt: new Date().toISOString(),
      }, { merge: true });
    } catch {}

    return true;
  } catch (error) {
    console.error('Failed to delete order:', error);
    throw error;
  }
};

// Interfaces for Reviews
export interface FirestoreReviewData {
  productId: string;
  productTitle: string;
  rating: number; // 1 to 5
  comment: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  orderNumber?: string;
}

export interface SavedReview extends FirestoreReviewData {
  id: string;
  createdAt: any;
}

// Save Product / Store Review (Requires authenticated user)
export const saveProductReview = async (reviewData: FirestoreReviewData): Promise<SavedReview> => {
  if (!reviewData.userId) {
    throw new Error('User must be signed in with Google to post a review');
  }

  const reviewsRef = collection(db, 'reviews');
  const snapshot = await getDocs(reviewsRef);
  
  // If database was empty, seed all default reviews first so none are lost
  if (snapshot.empty) {
    for (const r of DEFAULT_REVIEWS) {
      const docRef = doc(db, 'reviews', r.id);
      await setDoc(docRef, r, { merge: true });
    }
  }

  const reviewRef = doc(collection(db, 'reviews'));
  const fullReview: SavedReview = {
    id: reviewRef.id,
    ...reviewData,
    createdAt: serverTimestamp(),
  };

  await setDoc(reviewRef, fullReview);
  return fullReview;
};

// Fetch reviews for a specific product
export const getProductReviews = async (productId: string): Promise<SavedReview[]> => {
  try {
    const reviewsRef = collection(db, 'reviews');
    const snapshot = await fetchWithTimeout(getDocs(reviewsRef));
    const reviews: SavedReview[] = [];
    
    snapshot.forEach((docSnap) => {
      reviews.push(docSnap.data() as SavedReview);
    });

    // Merge missing default reviews so default reviews are never lost
    const existingIds = new Set(reviews.map((r) => r.id));
    const missingDefaults = DEFAULT_REVIEWS.filter((dr) => !existingIds.has(dr.id));
    const combined = [...reviews, ...missingDefaults];

    // Strictly filter for matching product ID
    const matched = combined.filter((r) => r.productId === productId);

    // Sort descending by createdAt
    matched.sort((a, b) => {
      const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
      const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
      return timeB - timeA;
    });

    return matched;
  } catch (error) {
    console.warn('Using offline fallback for product reviews:', error);
    return DEFAULT_REVIEWS.filter((r) => r.productId === productId);
  }
};

// Fetch all reviews for homepage or admin dashboard
export const getAllReviews = async (): Promise<SavedReview[]> => {
  const deletedRevsLocal: string[] = JSON.parse(
    localStorage.getItem('maison_deleted_reviews') || '[]'
  );
  const deletedSet = new Set(deletedRevsLocal.map((id) => id.trim()));

  try {
    const deletedSnap = await fetchWithTimeout(getDocs(collection(db, 'deleted_reviews')));
    deletedSnap.forEach((d) => {
      deletedSet.add(d.id.trim());
    });
  } catch {}

  try {
    const reviewsRef = collection(db, 'reviews');
    const snapshot = await fetchWithTimeout(getDocs(reviewsRef));
    const reviews: SavedReview[] = [];

    snapshot.forEach((docSnap) => {
      if (!deletedSet.has(docSnap.id.trim())) {
        const data = docSnap.data();
        let createdAt = data?.createdAt;
        if (createdAt && typeof createdAt.toDate === 'function') {
          try { createdAt = createdAt.toDate().toISOString(); } catch { createdAt = new Date().toISOString(); }
        } else if (createdAt && typeof createdAt.seconds === 'number') {
          createdAt = new Date(createdAt.seconds * 1000).toISOString();
        } else if (!createdAt || typeof createdAt === 'object') {
          createdAt = new Date().toISOString();
        }
        reviews.push({ ...data, createdAt, id: docSnap.id } as SavedReview);
      }
    });

    reviews.sort((a, b) => {
      const timeA = typeof a.createdAt === 'string' ? new Date(a.createdAt).getTime() : 0;
      const timeB = typeof b.createdAt === 'string' ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA;
    });

    try {
      localStorage.setItem('maison_reviews_cache', safeJsonStringify(reviews));
    } catch {}

    return reviews;
  } catch (error) {
    console.warn('Using offline fallback for all reviews:', error);
    try {
      const cached = JSON.parse(localStorage.getItem('maison_reviews_cache') || '[]');
      if (Array.isArray(cached)) {
        return cached.filter((r: SavedReview) => !deletedSet.has(r.id));
      }
      return DEFAULT_REVIEWS.filter((r) => !deletedSet.has(r.id));
    } catch {
      return DEFAULT_REVIEWS.filter((r) => !deletedSet.has(r.id));
    }
  }
};

// Delete Review (Admin)
export const deleteReviewAdmin = async (
  reviewId: string,
  allCurrentReviews?: SavedReview[]
): Promise<boolean> => {
  try {
    const reviewDocRef = doc(db, 'reviews', reviewId);
    await deleteDoc(reviewDocRef).catch(() => {});

    try {
      const cached = JSON.parse(localStorage.getItem('maison_reviews_cache') || '[]');
      const updated = cached.filter((r: SavedReview) => r.id !== reviewId);
      localStorage.setItem('maison_reviews_cache', safeJsonStringify(updated));

      const deletedRevs: string[] = JSON.parse(localStorage.getItem('maison_deleted_reviews') || '[]');
      if (!deletedRevs.includes(reviewId)) {
        deletedRevs.push(reviewId);
        localStorage.setItem('maison_deleted_reviews', safeJsonStringify(deletedRevs));
      }
    } catch {}

    try {
      await setDoc(doc(db, 'deleted_reviews', reviewId), {
        reviewId,
        deletedAt: new Date().toISOString(),
      }, { merge: true });
    } catch {}

    return true;
  } catch (error) {
    console.error('Failed to delete review:', error);
    throw error;
  }
};

// Update Review (Admin)
export const updateReviewAdmin = async (
  reviewId: string,
  updatedData: Partial<FirestoreReviewData>,
  allCurrentReviews?: SavedReview[]
): Promise<boolean> => {
  try {
    const reviewDocRef = doc(db, 'reviews', reviewId);
    await setDoc(reviewDocRef, updatedData, { merge: true });

    try {
      const cached = JSON.parse(localStorage.getItem('maison_reviews_cache') || '[]');
      const updated = cached.map((r: SavedReview) => (r.id === reviewId ? { ...r, ...updatedData } : r));
      localStorage.setItem('maison_reviews_cache', safeJsonStringify(updated));
    } catch {}

    return true;
  } catch (error) {
    console.error('Failed to update review:', error);
    throw error;
  }
};

export const addReviewAdmin = async (
  reviewData: Partial<FirestoreReviewData>,
  allCurrentReviews?: SavedReview[]
): Promise<SavedReview> => {
  const reviewRef = doc(collection(db, 'reviews'));
  const fullReview: SavedReview = {
    id: reviewRef.id,
    productId: reviewData.productId || '',
    productTitle: reviewData.productTitle || '',
    rating: reviewData.rating || 5,
    comment: reviewData.comment || '',
    userId: reviewData.userId || 'admin-added',
    userName: reviewData.userName || 'عميل توزا',
    userPhoto: reviewData.userPhoto || 'https://res.cloudinary.com/qazdrpcx/image/upload/v1786595479/touza_products/reuodzuouk8woxkq38zz.jpg',
    orderNumber: reviewData.orderNumber || 'TOUZA-VIP',
    createdAt: new Date().toISOString(),
  };

  await setDoc(reviewRef, fullReview);

  try {
    const cached = JSON.parse(localStorage.getItem('maison_reviews_cache') || '[]');
    cached.unshift(fullReview);
    localStorage.setItem('maison_reviews_cache', safeJsonStringify(cached));
  } catch {}

  return fullReview;
};

// Reset to Default Reviews (Admin)
export const resetDefaultReviewsAdmin = async (): Promise<SavedReview[]> => {
  try {
    const reviewsRef = collection(db, 'reviews');
    const snapshot = await getDocs(reviewsRef);
    const deletePromises: Promise<void>[] = [];
    snapshot.forEach((docSnap) => {
      deletePromises.push(deleteDoc(doc(db, 'reviews', docSnap.id)));
    });
    await Promise.all(deletePromises);

    // Clear deleted reviews tracking
    try {
      localStorage.removeItem('maison_deleted_reviews');
      const delSnap = await getDocs(collection(db, 'deleted_reviews'));
      delSnap.forEach((d) => deleteDoc(doc(db, 'deleted_reviews', d.id)).catch(() => {}));
    } catch {}

    // Seed default reviews
    for (const r of DEFAULT_REVIEWS) {
      await setDoc(doc(db, 'reviews', r.id), r);
    }

    try {
      localStorage.setItem('maison_reviews_cache', safeJsonStringify(DEFAULT_REVIEWS));
    } catch {}

    return DEFAULT_REVIEWS;
  } catch (error) {
    console.error('Failed to reset default reviews:', error);
    return DEFAULT_REVIEWS;
  }
};

/**
 * Real-time Reviews Listener for Homepage, Product Detail, and Admin Dashboard
 * Uses onSnapshot so any newly added, edited, or deleted reviews reflect immediately.
 */
export const subscribeToReviews = (
  callback: (reviews: SavedReview[]) => void
): (() => void) => {
  const deletedRevsLocal: string[] = JSON.parse(
    localStorage.getItem('maison_deleted_reviews') || '[]'
  );
  const deletedSet = new Set(deletedRevsLocal.map((id) => id.trim()));

  // Immediately serve cached reviews for instant rendering
  try {
    const cached = JSON.parse(localStorage.getItem('maison_reviews_cache') || '[]');
    if (Array.isArray(cached)) {
      callback(cached.filter((r: SavedReview) => !deletedSet.has(r.id)));
    }
  } catch {}

  try {
    const reviewsRef = collection(db, 'reviews');
    const unsubscribe = onSnapshot(
      reviewsRef,
      (snapshot) => {
        const reviews: SavedReview[] = [];
        snapshot.forEach((docSnap) => {
          if (!deletedSet.has(docSnap.id.trim())) {
            const data = docSnap.data();
            let createdAt = data?.createdAt;
            if (createdAt && typeof createdAt.toDate === 'function') {
              try { createdAt = createdAt.toDate().toISOString(); } catch { createdAt = new Date().toISOString(); }
            } else if (createdAt && typeof createdAt.seconds === 'number') {
              createdAt = new Date(createdAt.seconds * 1000).toISOString();
            } else if (!createdAt || typeof createdAt === 'object') {
              createdAt = new Date().toISOString();
            }
            reviews.push({ ...data, createdAt, id: docSnap.id } as SavedReview);
          }
        });

        reviews.sort((a, b) => {
          const timeA = typeof a.createdAt === 'string' ? new Date(a.createdAt).getTime() : 0;
          const timeB = typeof b.createdAt === 'string' ? new Date(b.createdAt).getTime() : 0;
          return timeB - timeA;
        });

        try {
          localStorage.setItem('maison_reviews_cache', safeJsonStringify(reviews));
        } catch {}

        callback(reviews);
      },
      (err) => {
        console.warn('Realtime reviews listener notice:', err);
      }
    );
    return unsubscribe;
  } catch (error) {
    console.warn('Could not initialize realtime reviews listener:', error);
    return () => {};
  }
};

/**
 * Real-time Product Reviews Listener for a specific product
 */
export const subscribeToProductReviews = (
  productId: string,
  callback: (reviews: SavedReview[]) => void
): (() => void) => {
  return subscribeToReviews((allReviews) => {
    const matched = allReviews.filter((r) => r.productId === productId);
    callback(matched);
  });
};

// ==========================================
// CATEGORY FIRESTORE FUNCTIONS
// ==========================================

export const getAllCategories = async (): Promise<Category[]> => {
  const deletedCatsLocal: string[] = JSON.parse(
    localStorage.getItem('maison_deleted_categories') || '[]'
  );
  const deletedSet = new Set(deletedCatsLocal.map((id) => id.trim()));

  try {
    const deletedSnap = await fetchWithTimeout(getDocs(collection(db, 'deleted_categories')));
    deletedSnap.forEach((d) => {
      deletedSet.add(d.id.trim());
    });
  } catch {}

  try {
    const catsRef = collection(db, 'categories');
    const snapshot = await fetchWithTimeout(getDocs(catsRef), 8000);
    const categories: Category[] = [];

    snapshot.forEach((docSnap) => {
      if (!deletedSet.has(docSnap.id.trim())) {
        categories.push({ id: docSnap.id, ...docSnap.data() } as Category);
      }
    });

    if (categories.length > 0) {
      try {
        localStorage.setItem('maison_categories', safeJsonStringify(categories));
      } catch {}
      return categories;
    }

    const filteredDefaults = DEFAULT_CATEGORIES.filter((c) => !deletedSet.has(c.id));
    return filteredDefaults;
  } catch (error) {
    console.warn('Using offline fallback for categories:', error);
    try {
      const saved = localStorage.getItem('maison_categories');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed.filter((c: Category) => !deletedSet.has(c.id));
      }
    } catch {}
    return DEFAULT_CATEGORIES.filter((c) => !deletedSet.has(c.id));
  }
};

export const subscribeToCategories = (
  callback: (categories: Category[]) => void
): (() => void) => {
  const deletedCatsLocal: string[] = JSON.parse(
    localStorage.getItem('maison_deleted_categories') || '[]'
  );
  const deletedSet = new Set(deletedCatsLocal.map((id) => id.trim()));

  // Instant visual hydration from local cache
  try {
    const saved = localStorage.getItem('maison_categories');
    if (saved) {
      const parsed: Category[] = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        callback(parsed.filter((c: Category) => !deletedSet.has(c.id)));
      } else {
        callback(DEFAULT_CATEGORIES.filter((c) => !deletedSet.has(c.id)));
      }
    } else {
      callback(DEFAULT_CATEGORIES.filter((c) => !deletedSet.has(c.id)));
    }
  } catch {
    callback(DEFAULT_CATEGORIES.filter((c) => !deletedSet.has(c.id)));
  }

  try {
    const catsRef = collection(db, 'categories');
    const unsubscribe = onSnapshot(
      catsRef,
      (snapshot) => {
        const firestoreCats: Category[] = [];
        snapshot.forEach((docSnap) => {
          if (!deletedSet.has(docSnap.id.trim())) {
            firestoreCats.push({ id: docSnap.id, ...docSnap.data() } as Category);
          }
        });
        try {
          localStorage.setItem('maison_categories', safeJsonStringify(firestoreCats));
        } catch {}
        callback(firestoreCats);
      },
      (err) => {
        console.warn('Realtime categories listener notice:', err);
      }
    );
    return unsubscribe;
  } catch (error) {
    console.warn('Could not initialize realtime categories listener:', error);
    return () => {};
  }
};

export const saveCategoryAdmin = async (
  categoryData: Omit<Category, 'id'>,
  currentCategories: Category[] = []
): Promise<Category[]> => {
  const newCatId = 'cat-' + (categoryData.nameEn ? categoryData.nameEn.toLowerCase().replace(/[^a-z0-9]/g, '-') : Date.now());
  const newCat: Category = {
    id: newCatId,
    ...categoryData,
  };

  // Remove from deleted tracking if re-added
  try {
    const deletedCats: string[] = JSON.parse(localStorage.getItem('maison_deleted_categories') || '[]');
    const filtered = deletedCats.filter((id) => id !== newCatId);
    localStorage.setItem('maison_deleted_categories', safeJsonStringify(filtered));
    await deleteDoc(doc(db, 'deleted_categories', newCatId)).catch(() => {});
  } catch {}

  const updatedList = [newCat, ...currentCategories.filter((c) => c.id !== newCatId)];
  try {
    localStorage.setItem('maison_categories', safeJsonStringify(updatedList));
  } catch {}

  try {
    const catsRef = collection(db, 'categories');
    const catDocRef = doc(catsRef, newCatId);
    await setDoc(catDocRef, sanitizeForFirestore(newCat), { merge: true });
  } catch (error) {
    console.error('Failed to save category in Firestore:', error);
    throw error;
  }

  return updatedList;
};

export const updateCategoryAdmin = async (
  categoryId: string,
  updatedData: Partial<Category>,
  currentCategories: Category[] = []
): Promise<Category[]> => {
  const updatedList = currentCategories.map((c) =>
    c.id === categoryId ? { ...c, ...updatedData } : c
  );
  try {
    localStorage.setItem('maison_categories', safeJsonStringify(updatedList));
  } catch {}

  try {
    const catDocRef = doc(db, 'categories', categoryId);
    await setDoc(catDocRef, sanitizeForFirestore(updatedData), { merge: true });
  } catch (error) {
    console.error('Failed to update category in Firestore:', error);
    throw error;
  }

  return updatedList;
};

export const deleteCategoryAdmin = async (
  categoryId: string,
  currentCategories: Category[] = []
): Promise<Category[]> => {
  const updatedList = currentCategories.filter((c) => c.id !== categoryId);
  try {
    localStorage.setItem('maison_categories', safeJsonStringify(updatedList));
    const deletedCats: string[] = JSON.parse(localStorage.getItem('maison_deleted_categories') || '[]');
    if (!deletedCats.includes(categoryId)) {
      deletedCats.push(categoryId);
      localStorage.setItem('maison_deleted_categories', safeJsonStringify(deletedCats));
    }
  } catch {}

  try {
    const catDocRef = doc(db, 'categories', categoryId);
    await deleteDoc(catDocRef);
    await setDoc(doc(db, 'deleted_categories', categoryId), {
      categoryId,
      deletedAt: new Date().toISOString(),
    }, { merge: true }).catch(() => {});
  } catch (error) {
    console.error('Failed to delete category from Firestore:', error);
    throw error;
  }

  return updatedList;
};

export const resetDefaultCategoriesAdmin = async (): Promise<Category[]> => {
  try {
    const catsRef = collection(db, 'categories');
    const snapshot = await getDocs(catsRef);
    const deletePromises: Promise<void>[] = [];
    snapshot.forEach((docSnap) => {
      deletePromises.push(deleteDoc(doc(db, 'categories', docSnap.id)));
    });
    await Promise.all(deletePromises);

    // Clear deleted categories tracking
    try {
      localStorage.removeItem('maison_deleted_categories');
      const delSnap = await getDocs(collection(db, 'deleted_categories'));
      delSnap.forEach((d) => deleteDoc(doc(db, 'deleted_categories', d.id)).catch(() => {}));
    } catch {}

    for (const c of DEFAULT_CATEGORIES) {
      await setDoc(doc(db, 'categories', c.id), sanitizeForFirestore(c), { merge: true });
    }
    try {
      localStorage.setItem('maison_categories', safeJsonStringify(DEFAULT_CATEGORIES));
    } catch {}
    return DEFAULT_CATEGORIES;
  } catch (error) {
    console.error('Failed to reset default categories:', error);
    try {
      localStorage.setItem('maison_categories', safeJsonStringify(DEFAULT_CATEGORIES));
    } catch {}
    return DEFAULT_CATEGORIES;
  }
};

// ==========================================
// NEWSLETTER SUBSCRIBERS & BROADCAST SERVICES
// ==========================================

export interface NewsletterSubscriber {
  id: string;
  email: string;
  subscribedAt: string;
  status: 'active' | 'unsubscribed';
  source: string;
}

export interface NewsletterCampaign {
  id: string;
  title: string;
  previewText?: string;
  content: string;
  promoCode?: string;
  recipientCount: number;
  sentAt: string;
  status: string;
}

export const addNewsletterSubscriber = async (
  email: string,
  source: string = 'الموقع الإلكتروني'
): Promise<NewsletterSubscriber> => {
  const cleanEmail = email.trim().toLowerCase();
  const docId = cleanEmail.replace(/[^a-z0-9]/g, '_');
  const subscriberDocRef = doc(db, 'subscribers', docId);
  
  const subscriberData: NewsletterSubscriber = {
    id: docId,
    email: cleanEmail,
    subscribedAt: new Date().toISOString(),
    status: 'active',
    source: source || 'الموقع الإلكتروني',
  };

  try {
    await setDoc(subscriberDocRef, subscriberData, { merge: true });
  } catch (err) {
    console.warn('Could not save subscriber to Firestore, saving locally:', err);
  }

  try {
    const existing = JSON.parse(localStorage.getItem('maison_subscribers') || '[]');
    if (!existing.some((s: any) => s.email === cleanEmail)) {
      existing.unshift(subscriberData);
      localStorage.setItem('maison_subscribers', safeJsonStringify(existing));
    }
  } catch (e) {
    console.error(e);
  }

  return subscriberData;
};

export const getNewsletterSubscribers = async (): Promise<NewsletterSubscriber[]> => {
  const isInitialized = localStorage.getItem('maison_subscribers_init');
  const localSubscribers: NewsletterSubscriber[] = JSON.parse(
    localStorage.getItem('maison_subscribers') || '[]'
  );
  const deletedEmailsLocal: string[] = JSON.parse(
    localStorage.getItem('maison_deleted_subscribers') || '[]'
  );
  const deletedSet = new Set(deletedEmailsLocal.map((e) => e.trim().toLowerCase()));

  try {
    const deletedSnap = await fetchWithTimeout(getDocs(collection(db, 'deleted_subscribers')));
    deletedSnap.forEach((d) => {
      const email = d.data()?.email || d.id;
      if (email) deletedSet.add(String(email).trim().toLowerCase());
    });
  } catch (err) {
    console.warn('Could not fetch deleted_subscribers from Firestore:', err);
  }

  try {
    const subscribersRef = collection(db, 'subscribers');
    // Simple fetch without orderBy query to avoid missing index errors
    const snapshot = await fetchWithTimeout(getDocs(subscribersRef));
    
    const firestoreList: NewsletterSubscriber[] = [];
    if (!snapshot.empty) {
      snapshot.forEach((docSnap) => {
        firestoreList.push({ id: docSnap.id, ...docSnap.data() } as NewsletterSubscriber);
      });
    }

    const emailMap = new Map<string, NewsletterSubscriber>();
    [...firestoreList, ...localSubscribers].forEach((sub) => {
      if (sub && sub.email) {
        const key = sub.email.trim().toLowerCase();
        if (!deletedSet.has(key) && !emailMap.has(key)) {
          emailMap.set(key, sub);
        }
      }
    });

    const result = Array.from(emailMap.values());
    result.sort((a, b) => (b.subscribedAt || '').localeCompare(a.subscribedAt || ''));

    // Always sync cleaned active list to local storage
    localStorage.setItem('maison_subscribers', safeJsonStringify(result));
    localStorage.setItem('maison_subscribers_init', 'true');

    return result;
  } catch (err) {
    console.warn('Failed to load subscribers from Firestore:', err);
  }

  if (!isInitialized && localSubscribers.length === 0) {
    const demoSubscribers: NewsletterSubscriber[] = [
      { id: 'sub_1', email: 'vip.client@luxuryfashion.eg', subscribedAt: new Date(Date.now() - 86400000 * 2).toISOString(), status: 'active', source: 'الموقع الإلكتروني' },
      { id: 'sub_2', email: 'yasmin.almasri@gmail.com', subscribedAt: new Date(Date.now() - 86400000 * 5).toISOString(), source: 'إعلان فيسبوك', status: 'active' },
      { id: 'sub_3', email: 'nour.hassan@yahoo.com', subscribedAt: new Date(Date.now() - 86400000 * 10).toISOString(), source: 'الموقع الإلكتروني', status: 'active' },
    ];
    const filteredDemo = demoSubscribers.filter((s) => !deletedSet.has(s.email.toLowerCase()));
    localStorage.setItem('maison_subscribers', safeJsonStringify(filteredDemo));
    localStorage.setItem('maison_subscribers_init', 'true');
    return filteredDemo;
  }

  const activeLocal = localSubscribers.filter((s) => s && s.email && !deletedSet.has(s.email.trim().toLowerCase()));
  localStorage.setItem('maison_subscribers', safeJsonStringify(activeLocal));
  return activeLocal;
};

/**
 * Real-time Newsletter Subscribers Listener for Admin Dashboard
 */
export const subscribeToNewsletterSubscribers = (
  callback: (subscribers: NewsletterSubscriber[]) => void
): (() => void) => {
  try {
    const subscribersRef = collection(db, 'subscribers');
    const unsubscribe = onSnapshot(
      subscribersRef,
      (snapshot) => {
        const firestoreList: NewsletterSubscriber[] = [];
        snapshot.forEach((docSnap) => {
          firestoreList.push({ id: docSnap.id, ...docSnap.data() } as NewsletterSubscriber);
        });
        firestoreList.sort((a, b) => (b.subscribedAt || '').localeCompare(a.subscribedAt || ''));
        localStorage.setItem('maison_subscribers', safeJsonStringify(firestoreList));
        callback(firestoreList);
      },
      (err) => {
        console.warn('Realtime subscribers listener error:', err);
      }
    );
    return unsubscribe;
  } catch (error) {
    console.warn('Could not initialize realtime subscribers listener:', error);
    return () => {};
  }
};

export const deleteNewsletterSubscriberAdmin = async (
  idOrEmail: string,
  targetEmail?: string
): Promise<boolean> => {
  const cleanEmail = (targetEmail || idOrEmail).trim().toLowerCase();
  const emailDocId = cleanEmail.replace(/[^a-z0-9]/g, '_');

  console.log(`[DELETE SUBSCRIBER] Attempting persistent deletion for email: ${cleanEmail}, id: ${idOrEmail}`);

  // 1. Mark in localStorage deleted_subscribers & prune maison_subscribers
  try {
    localStorage.setItem('maison_subscribers_init', 'true');
    const deletedList: string[] = JSON.parse(
      localStorage.getItem('maison_deleted_subscribers') || '[]'
    );
    if (!deletedList.includes(cleanEmail)) {
      deletedList.push(cleanEmail);
      localStorage.setItem('maison_deleted_subscribers', safeJsonStringify(deletedList));
    }

    const existing: NewsletterSubscriber[] = JSON.parse(
      localStorage.getItem('maison_subscribers') || '[]'
    );
    const updated = existing.filter((s) => {
      if (!s || !s.email) return false;
      const sEmail = s.email.trim().toLowerCase();
      return (
        s.id !== idOrEmail &&
        s.id !== emailDocId &&
        sEmail !== cleanEmail
      );
    });
    localStorage.setItem('maison_subscribers', safeJsonStringify(updated));
  } catch (e) {
    console.error('Error updating localStorage on delete:', e);
  }

  // 2. Mark as deleted in Firestore deleted_subscribers collection & remove from subscribers collection
  try {
    if (emailDocId) {
      await setDoc(doc(db, 'deleted_subscribers', emailDocId), {
        email: cleanEmail,
        deletedAt: new Date().toISOString(),
      });
    }

    const deleteTasks: Promise<void>[] = [];

    if (idOrEmail) {
      deleteTasks.push(deleteDoc(doc(db, 'subscribers', idOrEmail)).catch(() => {}));
    }
    if (emailDocId && emailDocId !== idOrEmail) {
      deleteTasks.push(deleteDoc(doc(db, 'subscribers', emailDocId)).catch(() => {}));
    }

    if (cleanEmail.includes('@')) {
      const q = query(collection(db, 'subscribers'), where('email', '==', cleanEmail));
      const snap = await getDocs(q);
      snap.forEach((d) => {
        deleteTasks.push(deleteDoc(d.ref).catch(() => {}));
      });
    }

    await Promise.all(deleteTasks);
    console.log(`[DELETE SUBSCRIBER SUCCESS] Email ${cleanEmail} permanently deleted.`);
  } catch (e) {
    console.warn('Could not complete Firestore deletion:', e);
  }

  return true;
};

export const saveNewsletterCampaignAdmin = async (
  title: string,
  content: string,
  recipientCount: number,
  previewText?: string,
  promoCode?: string
): Promise<NewsletterCampaign> => {
  const campaignsRef = collection(db, 'newsletterCampaigns');
  const newDocRef = doc(campaignsRef);
  
  const campaignData: NewsletterCampaign = {
    id: newDocRef.id,
    title,
    previewText: previewText || '',
    content,
    promoCode: promoCode || '',
    recipientCount,
    sentAt: new Date().toISOString(),
    status: 'تم الإرسال بنجاح',
  };

  try {
    await setDoc(newDocRef, campaignData);
  } catch (err) {
    console.warn('Could not save campaign to Firestore:', err);
  }

  try {
    const existing = JSON.parse(localStorage.getItem('maison_campaigns') || '[]');
    existing.unshift(campaignData);
    localStorage.setItem('maison_campaigns', safeJsonStringify(existing));
  } catch (e) {
    console.error(e);
  }

  return campaignData;
};

export const getNewsletterCampaignsAdmin = async (): Promise<NewsletterCampaign[]> => {
  const localCampaigns: NewsletterCampaign[] = JSON.parse(
    localStorage.getItem('maison_campaigns') || '[]'
  );

  try {
    const campaignsRef = collection(db, 'newsletterCampaigns');
    const snapshot = await fetchWithTimeout(getDocs(campaignsRef));
    if (!snapshot.empty) {
      const firestoreList: NewsletterCampaign[] = [];
      snapshot.forEach((docSnap) => {
        firestoreList.push({ id: docSnap.id, ...docSnap.data() } as NewsletterCampaign);
      });
      firestoreList.sort((a, b) => (b.sentAt || '').localeCompare(a.sentAt || ''));
      localStorage.setItem('maison_campaigns', safeJsonStringify(firestoreList));
      return firestoreList;
    }
  } catch (err) {
    console.warn('Failed to load campaigns from Firestore:', err);
  }

  return localCampaigns;
};

/**
 * Real-time Newsletter Campaigns Listener for Admin Dashboard
 */
export const subscribeToNewsletterCampaigns = (
  callback: (campaigns: NewsletterCampaign[]) => void
): (() => void) => {
  try {
    const local = localStorage.getItem('maison_campaigns');
    if (local) {
      callback(JSON.parse(local));
    }
  } catch {}

  try {
    const campaignsRef = collection(db, 'newsletterCampaigns');
    const unsubscribe = onSnapshot(
      campaignsRef,
      (snapshot) => {
        const firestoreList: NewsletterCampaign[] = [];
        snapshot.forEach((docSnap) => {
          firestoreList.push({ id: docSnap.id, ...docSnap.data() } as NewsletterCampaign);
        });
        firestoreList.sort((a, b) => (b.sentAt || '').localeCompare(a.sentAt || ''));
        localStorage.setItem('maison_campaigns', safeJsonStringify(firestoreList));
        callback(firestoreList);
      },
      (err) => {
        console.warn('Realtime campaigns listener notice:', err);
      }
    );
    return unsubscribe;
  } catch (error) {
    console.warn('Could not initialize realtime campaigns listener:', error);
    return () => {};
  }
};

// ==========================================
// PRODUCTS FIRESTORE PERSISTENCE
// ==========================================

export const BANNED_DEPRECATED_PRODUCT_IDS = new Set<string>([
  'touza-summer-striped-shirt-brown',
  'touza-summer-striped-shirt-green',
  'touza-summer-striped-shirt-orange',
  'touza-summer-striped-shirt-yellow',
]);

export const isBannedProductId = (id?: string): boolean => {
  if (!id || typeof id !== 'string') return false;
  return (
    BANNED_DEPRECATED_PRODUCT_IDS.has(id.trim()) ||
    id.toLowerCase().includes('touza-summer-striped-shirt')
  );
};

const DEFAULT_FALLBACK_PRODUCT_IMAGE =
  'https://res.cloudinary.com/qazdrpcx/image/upload/v1786807455/touza_products/ptb2bjxn9eawieshdumu.jpg';

const sanitizeProduct = (p: Product): Product => {
  if (!p) return p;
  const images = (p.images || [])
    .filter((img) => img && typeof img === 'string' && img.trim() !== '')
    .map((img) => img.trim());

  if (images.length === 0) {
    images.push(DEFAULT_FALLBACK_PRODUCT_IMAGE);
  }

  const colors = (p.colors || []).map((c) => ({
    ...c,
    imageUrl: (c.imageUrl && typeof c.imageUrl === 'string' && c.imageUrl.trim() !== '')
      ? c.imageUrl.trim()
      : images[0] || DEFAULT_FALLBACK_PRODUCT_IMAGE,
    sizes: Array.isArray(c.sizes) ? c.sizes : undefined,
  }));

  return {
    ...p,
    showOnHome: typeof p.showOnHome === 'boolean' ? p.showOnHome : (p.isFeatured ?? true),
    images,
    colors: colors.length > 0 ? colors : [{ name: 'Default', nameAr: 'افتراضي', hex: '#111111', imageUrl: images[0] || DEFAULT_FALLBACK_PRODUCT_IMAGE }],
    sizes: Array.isArray(p.sizes) ? p.sizes : [],
  };
};

export const getAllProductsAdmin = async (): Promise<Product[]> => {
  try {
    const productsRef = collection(db, 'products');
    const snapshot = await fetchWithTimeout(getDocs(productsRef), 10000);
    
    if (!snapshot.empty) {
      const firestoreProducts: Product[] = [];
      snapshot.forEach((docSnap) => {
        if (isBannedProductId(docSnap.id)) {
          // Permanently purge any banned or deprecated products from Firestore
          deleteDoc(doc(db, 'products', docSnap.id)).catch(() => {});
          return;
        }
        const data = docSnap.data();
        firestoreProducts.push(sanitizeProduct({ id: docSnap.id, ...data } as Product));
      });

      if (firestoreProducts.length > 0) {
        try {
          localStorage.setItem('maison_products', safeJsonStringify(firestoreProducts));
        } catch {}
        return firestoreProducts;
      }
    }

    // If Firestore is empty, seed initial default products (excluding any banned IDs)
    const initialProducts = PRODUCTS.filter((p) => !isBannedProductId(p.id)).map(sanitizeProduct);
    for (const prod of initialProducts) {
      setDoc(doc(db, 'products', prod.id), sanitizeForFirestore(prod), { merge: true }).catch(() => {});
    }
    try {
      localStorage.setItem('maison_products', safeJsonStringify(initialProducts));
    } catch {}
    return initialProducts;
  } catch (error) {
    console.warn('Using offline cached products fallback:', error);
    try {
      const saved = localStorage.getItem('maison_products');
      if (saved) {
        const parsed: Product[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.filter((p) => !isBannedProductId(p.id)).map(sanitizeProduct);
        }
      }
    } catch {}
    return PRODUCTS.filter((p) => !isBannedProductId(p.id)).map(sanitizeProduct);
  }
};

export const subscribeToProducts = (
  callback: (products: Product[]) => void
): (() => void) => {
  // Emit initial/cached state for instant visual feedback on cold start
  try {
    const saved = localStorage.getItem('maison_products');
    if (saved) {
      const parsed: Product[] = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const filteredCached = parsed.filter((p) => !isBannedProductId(p.id));
        callback(filteredCached.map(sanitizeProduct));
      } else {
        callback(PRODUCTS.filter((p) => !isBannedProductId(p.id)).map(sanitizeProduct));
      }
    } else {
      callback(PRODUCTS.filter((p) => !isBannedProductId(p.id)).map(sanitizeProduct));
    }
  } catch {
    callback(PRODUCTS.filter((p) => !isBannedProductId(p.id)).map(sanitizeProduct));
  }

  try {
    const productsRef = collection(db, 'products');
    const unsubscribe = onSnapshot(
      productsRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const firestoreProducts: Product[] = [];
          snapshot.forEach((docSnap) => {
            if (isBannedProductId(docSnap.id)) {
              // Automatically delete banned deprecated document if encountered
              deleteDoc(doc(db, 'products', docSnap.id)).catch(() => {});
              return;
            }
            const data = docSnap.data();
            firestoreProducts.push(sanitizeProduct({ id: docSnap.id, ...data } as Product));
          });
          
          if (firestoreProducts.length > 0) {
            try {
              localStorage.setItem('maison_products', safeJsonStringify(firestoreProducts));
            } catch {}
            callback(firestoreProducts);
          }
        } else {
          // If Firestore is completely empty (e.g. first initial setup), seed the default products
          const initialProducts = PRODUCTS.filter((p) => !isBannedProductId(p.id)).map(sanitizeProduct);
          for (const prod of initialProducts) {
            setDoc(doc(db, 'products', prod.id), sanitizeForFirestore(prod), { merge: true }).catch(() => {});
          }
          try {
            localStorage.setItem('maison_products', safeJsonStringify(initialProducts));
          } catch {}
          callback(initialProducts);
        }
      },
      (err) => {
        console.warn('Realtime products listener error:', err);
      }
    );
    return unsubscribe;
  } catch (error) {
    console.warn('Could not initialize realtime products listener:', error);
    return () => {};
  }
};

/**
 * Read-only helper to fetch raw products directly from Firestore for backup export.
 * Does not modify or delete any database records.
 */
export const exportFirestoreProductsBackup = async (): Promise<{
  exportedAt: string;
  totalProducts: number;
  products: any[];
}> => {
  const productsRef = collection(db, 'products');
  const snapshot = await fetchWithTimeout(getDocs(productsRef), 15000);
  const rawProducts: any[] = [];
  snapshot.forEach((docSnap) => {
    if (!isBannedProductId(docSnap.id)) {
      rawProducts.push({ id: docSnap.id, ...docSnap.data() });
    }
  });

  return {
    exportedAt: new Date().toISOString(),
    totalProducts: rawProducts.length,
    products: rawProducts,
  };
};

export const syncAllProductsToFirestore = async (
  productsToSync: Product[] = []
): Promise<{ success: boolean; count: number }> => {
  try {
    let listToUpload = productsToSync;
    if (!listToUpload || listToUpload.length === 0) {
      try {
        const saved = localStorage.getItem('maison_products');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            listToUpload = parsed;
          }
        }
      } catch {}
    }
    if (!listToUpload || listToUpload.length === 0) {
      listToUpload = PRODUCTS;
    }

    // Filter out banned deprecated product IDs
    listToUpload = listToUpload.filter((p) => !isBannedProductId(p.id));

    const batchPromises = listToUpload.map((prod) => {
      const sanitized = sanitizeProduct(prod);
      return setDoc(doc(db, 'products', sanitized.id), sanitizeForFirestore(sanitized), { merge: true });
    });
    await Promise.all(batchPromises);

    try {
      localStorage.setItem('maison_products', safeJsonStringify(listToUpload.map(sanitizeProduct)));
    } catch {}

    return { success: true, count: listToUpload.length };
  } catch (err) {
    console.error('Failed to sync all products to Firestore:', err);
    throw err;
  }
};

export const saveProductAdmin = async (
  productData: Product,
  currentProducts: Product[] = []
): Promise<Product[]> => {
  const sanitized = sanitizeProduct(productData);
  const payload = sanitizeForFirestore(sanitized);

  // 1. Write directly to Firestore first so it propagates in realtime to all users/devices
  try {
    await setDoc(doc(db, 'products', sanitized.id), payload, { merge: true });
  } catch (error) {
    console.error('Failed to save product in Firestore:', error);
    throw error;
  }

  // 2. Update local state list & local cache
  let list = [...currentProducts];
  const idx = list.findIndex((p) => p.id === sanitized.id);
  if (idx >= 0) {
    list[idx] = sanitized;
  } else {
    list = [sanitized, ...list];
  }

  try {
    localStorage.setItem('maison_products', safeJsonStringify(list));
  } catch {}

  return list;
};

export const deleteProductAdmin = async (
  productId: string
): Promise<boolean> => {
  try {
    await deleteDoc(doc(db, 'products', productId));

    try {
      const saved = localStorage.getItem('maison_products');
      if (saved) {
        const list: Product[] = JSON.parse(saved);
        const filtered = list.filter((p) => p.id !== productId);
        localStorage.setItem('maison_products', safeJsonStringify(filtered));
      }
    } catch {}
    return true;
  } catch (error) {
    console.error('Failed to delete product from Firestore:', error);
    throw error;
  }
};

export const resetDefaultProductsAdmin = async (): Promise<Product[]> => {
  try {
    const productsRef = collection(db, 'products');
    const snapshot = await getDocs(productsRef);
    
    const deletePromises: Promise<void>[] = [];
    snapshot.forEach((docSnap) => {
      deletePromises.push(deleteDoc(doc(db, 'products', docSnap.id)));
    });
    await Promise.all(deletePromises);

    const safeDefaults = PRODUCTS.filter((p) => !isBannedProductId(p.id));
    for (const prod of safeDefaults) {
      await setDoc(doc(db, 'products', prod.id), sanitizeForFirestore(prod), { merge: true });
    }

    try {
      localStorage.setItem('maison_products', safeJsonStringify(safeDefaults));
    } catch {}
    return safeDefaults;
  } catch (error) {
    console.error('Failed to reset default products:', error);
    const safeDefaults = PRODUCTS.filter((p) => !isBannedProductId(p.id));
    try {
      localStorage.setItem('maison_products', safeJsonStringify(safeDefaults));
    } catch {}
    return safeDefaults;
  }
};

// ==========================================
// STORE SETTINGS FIRESTORE PERSISTENCE
// ==========================================

function sanitizeSettings(settings: Partial<StoreSettings>, defaultSettings: StoreSettings): StoreSettings {
  if (!settings) return defaultSettings;
  let heroImageUrl = settings.heroImageUrl || defaultSettings.heroImageUrl;
  if (typeof heroImageUrl === 'string' && heroImageUrl.includes('pb3glshlcqx6jhuapcpq')) {
    heroImageUrl = 'https://res.cloudinary.com/qazdrpcx/video/upload/v1787597556/touza_header_videos/vz8cdlvj2jqpd9ueb9uk.mp4';
  }

  const merged: StoreSettings = {
    ...defaultSettings,
    ...settings,
    heroImageUrl,
    // Ensure boolean and numeric shipping fields are preserved properly
    shippingFree: settings.shippingFree !== undefined ? settings.shippingFree : (defaultSettings.shippingFree ?? true),
    shippingFee: settings.shippingFee !== undefined ? Number(settings.shippingFee) : (defaultSettings.shippingFee ?? 0),
    shippingLabelAr: settings.shippingLabelAr || defaultSettings.shippingLabelAr || 'الشحن داخل مصر',
    shippingLabelEn: settings.shippingLabelEn || defaultSettings.shippingLabelEn || 'Express Delivery',
    shippingNoteAr: settings.shippingNoteAr || defaultSettings.shippingNoteAr || 'شامل جميع الرسوم والتوصيل للمحافظات.',
    shippingNoteEn: settings.shippingNoteEn || defaultSettings.shippingNoteEn || 'All duties & delivery across Egypt included.',
  };
  return merged;
}

const SETTINGS_STORAGE_KEY = 'maison_settings_v4';

export const getStoreSettingsAdmin = async (
  defaultSettings: StoreSettings
): Promise<StoreSettings> => {
  try {
    const settingsDocRef = doc(db, 'settings', 'store');
    const docSnap = await fetchWithTimeout(getDoc(settingsDocRef));
    
    if (!docSnap.exists()) {
      let settingsToSeed = defaultSettings;
      try {
        const saved = localStorage.getItem(SETTINGS_STORAGE_KEY) || localStorage.getItem('maison_settings');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed) {
            settingsToSeed = sanitizeSettings({ ...defaultSettings, ...parsed }, defaultSettings);
          }
        }
      } catch {}

      await setDoc(settingsDocRef, sanitizeForFirestore(settingsToSeed), { merge: true });
      localStorage.setItem(SETTINGS_STORAGE_KEY, safeJsonStringify(settingsToSeed));
      localStorage.setItem('maison_settings', safeJsonStringify(settingsToSeed));
      return settingsToSeed;
    }

    const remoteData = sanitizeSettings({ ...defaultSettings, ...(docSnap.data() as StoreSettings) }, defaultSettings);
    localStorage.setItem(SETTINGS_STORAGE_KEY, safeJsonStringify(remoteData));
    localStorage.setItem('maison_settings', safeJsonStringify(remoteData));
    return remoteData;
  } catch (error) {
    console.warn('Using offline fallback for store settings:', error);
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY) || localStorage.getItem('maison_settings');
      return saved ? sanitizeSettings({ ...defaultSettings, ...JSON.parse(saved) }, defaultSettings) : defaultSettings;
    } catch {
      return defaultSettings;
    }
  }
};

export const subscribeToStoreSettings = (
  defaultSettings: StoreSettings,
  callback: (settings: StoreSettings) => void
): (() => void) => {
  // Immediately emit cached settings from localStorage for instant render on Safari
  try {
    const saved = localStorage.getItem(SETTINGS_STORAGE_KEY) || localStorage.getItem('maison_settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed) {
        callback(sanitizeSettings({ ...defaultSettings, ...parsed }, defaultSettings));
      }
    }
  } catch {}

  try {
    const settingsDocRef = doc(db, 'settings', 'store');
    const unsubscribe = onSnapshot(
      settingsDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const remoteData = sanitizeSettings({ ...defaultSettings, ...(docSnap.data() as StoreSettings) }, defaultSettings);
          localStorage.setItem(SETTINGS_STORAGE_KEY, safeJsonStringify(remoteData));
          localStorage.setItem('maison_settings', safeJsonStringify(remoteData));
          callback(remoteData);
        }
      },
      (err) => {
        console.warn('Realtime settings listener notice:', err);
      }
    );
    return unsubscribe;
  } catch (error) {
    console.warn('Could not initialize realtime settings listener:', error);
    return () => {};
  }
};

export const saveStoreSettingsAdmin = async (
  newSettings: StoreSettings
): Promise<StoreSettings> => {
  // 1. Immediately cache locally so UI updates synchronously
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, safeJsonStringify(newSettings));
    localStorage.setItem('maison_settings', safeJsonStringify(newSettings));
    window.dispatchEvent(new CustomEvent('touza_settings_updated', { detail: newSettings }));
  } catch {}

  // 2. Persist to Firestore
  try {
    const settingsDocRef = doc(db, 'settings', 'store');
    await setDoc(settingsDocRef, sanitizeForFirestore(newSettings), { merge: true });
    return newSettings;
  } catch (error) {
    console.warn('Failed to save store settings in Firestore, saved locally:', error);
    return newSettings;
  }
};

// ==========================================
// PROMO CODES FIRESTORE PERSISTENCE
// ==========================================

export const getAllPromoCodesAdmin = async (
  defaultPromos: PromoCode[]
): Promise<PromoCode[]> => {
  const deletedPromosLocal: string[] = JSON.parse(
    localStorage.getItem('maison_deleted_promos') || '[]'
  );
  const deletedSet = new Set(deletedPromosLocal.map((id) => id.trim()));

  try {
    const deletedSnap = await fetchWithTimeout(getDocs(collection(db, 'deleted_promos')));
    deletedSnap.forEach((d) => {
      deletedSet.add(d.id.trim());
    });
  } catch {}

  try {
    const promosRef = collection(db, 'promoCodes');
    const snapshot = await fetchWithTimeout(getDocs(promosRef));

    const firestorePromos: PromoCode[] = [];
    snapshot.forEach((docSnap) => {
      if (!deletedSet.has(docSnap.id.trim())) {
        firestorePromos.push({ id: docSnap.id, ...docSnap.data() } as PromoCode);
      }
    });

    if (firestorePromos.length > 0) {
      localStorage.setItem('maison_promos', safeJsonStringify(firestorePromos));
      return firestorePromos;
    }

    const filteredDefaults = defaultPromos.filter((p) => !deletedSet.has(p.id));
    return filteredDefaults;
  } catch (error) {
    console.warn('Using offline fallback for promo codes:', error);
    try {
      const saved = localStorage.getItem('maison_promos');
      if (saved) {
        const parsed: PromoCode[] = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed.filter((p) => !deletedSet.has(p.id));
      }
    } catch {}
    return defaultPromos.filter((p) => !deletedSet.has(p.id));
  }
};

/**
 * Real-time Promo Codes Listener
 */
export const subscribeToPromoCodes = (
  defaultPromos: PromoCode[],
  callback: (promos: PromoCode[]) => void
): (() => void) => {
  const deletedPromosLocal: string[] = JSON.parse(
    localStorage.getItem('maison_deleted_promos') || '[]'
  );
  const deletedSet = new Set(deletedPromosLocal.map((id) => id.trim()));

  // Local cache emission
  try {
    const saved = localStorage.getItem('maison_promos');
    if (saved) {
      const parsed: PromoCode[] = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        callback(parsed.filter((p) => !deletedSet.has(p.id)));
      }
    }
  } catch {}

  try {
    const promosRef = collection(db, 'promoCodes');
    const unsubscribe = onSnapshot(
      promosRef,
      (snapshot) => {
        const firestorePromos: PromoCode[] = [];
        snapshot.forEach((docSnap) => {
          if (!deletedSet.has(docSnap.id.trim())) {
            firestorePromos.push({ id: docSnap.id, ...docSnap.data() } as PromoCode);
          }
        });
        localStorage.setItem('maison_promos', safeJsonStringify(firestorePromos));
        callback(firestorePromos);
      },
      (err) => {
        console.warn('Realtime promo codes listener error:', err);
      }
    );
    return unsubscribe;
  } catch (error) {
    console.warn('Could not initialize realtime promo codes listener:', error);
    return () => {};
  }
};

export const savePromoCodeAdmin = async (
  promoData: PromoCode
): Promise<boolean> => {
  try {
    // Remove from deleted tracking if re-added
    try {
      const deletedPromos: string[] = JSON.parse(localStorage.getItem('maison_deleted_promos') || '[]');
      const filtered = deletedPromos.filter((id) => id !== promoData.id);
      localStorage.setItem('maison_deleted_promos', safeJsonStringify(filtered));
      await deleteDoc(doc(db, 'deleted_promos', promoData.id)).catch(() => {});
    } catch {}

    const promoDocRef = doc(db, 'promoCodes', promoData.id);
    await setDoc(promoDocRef, sanitizeForFirestore(promoData), { merge: true });
    return true;
  } catch (error) {
    console.error('Failed to save promo code to Firestore:', error);
    throw error;
  }
};

export const deletePromoCodeAdmin = async (
  promoId: string
): Promise<boolean> => {
  try {
    await deleteDoc(doc(db, 'promoCodes', promoId)).catch(() => {});

    try {
      const existing: PromoCode[] = JSON.parse(localStorage.getItem('maison_promos') || '[]');
      const filtered = existing.filter((p) => p.id !== promoId);
      localStorage.setItem('maison_promos', safeJsonStringify(filtered));

      const deletedPromos: string[] = JSON.parse(localStorage.getItem('maison_deleted_promos') || '[]');
      if (!deletedPromos.includes(promoId)) {
        deletedPromos.push(promoId);
        localStorage.setItem('maison_deleted_promos', safeJsonStringify(deletedPromos));
      }
    } catch {}

    try {
      await setDoc(doc(db, 'deleted_promos', promoId), {
        promoId,
        deletedAt: new Date().toISOString(),
      }, { merge: true });
    } catch {}

    return true;
  } catch (error) {
    console.error('Failed to delete promo code from Firestore:', error);
    throw error;
  }
};

export const deleteNewsletterCampaignAdmin = async (
  campaignId: string
): Promise<boolean> => {
  try {
    await deleteDoc(doc(db, 'newsletterCampaigns', campaignId)).catch(() => {});
    try {
      const existing: NewsletterCampaign[] = JSON.parse(localStorage.getItem('maison_campaigns') || '[]');
      const filtered = existing.filter((c) => c.id !== campaignId);
      localStorage.setItem('maison_campaigns', safeJsonStringify(filtered));
    } catch {}
    return true;
  } catch (error) {
    console.error('Failed to delete campaign:', error);
    throw error;
  }
};

export const incrementPromoCodeUsageAdmin = async (
  promoId: string
): Promise<number> => {
  try {
    const promoDocRef = doc(db, 'promoCodes', promoId);
    const snap = await fetchWithTimeout(getDoc(promoDocRef));
    let newCount = 1;
    if (snap.exists()) {
      const data = snap.data();
      newCount = (data.usedCount || 0) + 1;
      await setDoc(promoDocRef, { usedCount: newCount }, { merge: true });
    } else {
      await setDoc(promoDocRef, { usedCount: 1 }, { merge: true });
    }
    return newCount;
  } catch (error) {
    console.error('Failed to increment promo code usage in Firestore:', error);
    return 1;
  }
};



