export interface Category {
  id: string;
  nameEn: string;
  nameAr: string;
  descriptionEn?: string;
  descriptionAr?: string;
  imageUrl?: string;
  icon?: string;
}

export interface ProductColor {
  name: string;
  nameAr?: string;
  hex: string;
  imageUrl?: string;
  sizes?: ProductSize[];
}

export interface ProductSize {
  size: string;
  inStock: boolean;
}

export interface Product {
  id: string;
  name: string;
  nameAr?: string;
  subtitle?: string;
  subtitleAr?: string;
  category: string;
  categoryAr?: string;
  price: number;
  originalPrice?: number;
  description: string;
  descriptionAr?: string;
  details?: string[];
  detailsAr?: string[];
  colors: ProductColor[];
  sizes: ProductSize[];
  images: string[];
  isNewArrival?: boolean;
  isFeatured?: boolean;
  showOnHome?: boolean;
}

export interface CartItem {
  id: string; // unique cart item id (e.g. product.id + '-' + color + '-' + size)
  product: Product;
  selectedColor: string;
  selectedSize: string;
  quantity: number;
}

export type ViewMode = 'home' | 'shop' | 'product' | 'checkout' | 'admin' | 'reset-password';

export interface PromoCode {
  id: string;
  code: string;
  discountType?: 'percentage' | 'fixed'; // 'percentage' | 'fixed'
  discountPercent?: number;              // Percentage value (e.g., 10%)
  discountAmount?: number;               // Fixed EGP amount value (e.g., 100 EGP)
  maxUses?: number;                      // Max customers / usage limit (e.g. 1, 5, 50). 0 or undefined = unlimited
  usedCount?: number;                    // Times used so far
  isActive: boolean;
  expiryNote?: string;
}

export interface StoreSettings {
  storeNameAr?: string;
  storeNameEn?: string;
  taglineAr?: string;
  taglineEn?: string;
  announcementAr: string;
  announcementEn: string;
  // Marquee Customization Settings
  enableMarqueeBar?: boolean;
  marqueeSpeed?: 'slow' | 'normal' | 'fast' | string;
  marqueeBgColor?: string;
  marqueeTextColor?: string;
  marqueeSymbol?: string;
  heroTitleAr: string;
  heroTitleEn: string;
  heroSubtitleAr: string;
  heroSubtitleEn: string;
  heroBadgeAr?: string;
  heroBadgeEn?: string;
  heroImageUrl: string;
  // Newsletter Section Settings
  newsletterBadgeAr?: string;
  newsletterBadgeEn?: string;
  newsletterTitleAr?: string;
  newsletterTitleEn?: string;
  newsletterSubtitleAr?: string;
  newsletterSubtitleEn?: string;
  // Philosophy Section Settings
  philosophyBadgeAr?: string;
  philosophyBadgeEn?: string;
  philosophyTitle1Ar?: string;
  philosophyTitle1En?: string;
  philosophyTitle2Ar?: string;
  philosophyTitle2En?: string;
  philosophyParagraph1Ar?: string;
  philosophyParagraph1En?: string;
  philosophyParagraph2Ar?: string;
  philosophyParagraph2En?: string;
  philosophyImageUrl?: string;
  // Social Media Links
  socialInstagramUrl?: string;
  socialFacebookUrl?: string;
  socialTiktokUrl?: string;
  socialTwitterUrl?: string;
  socialWhatsappUrl?: string;
  socialYoutubeUrl?: string;
  socialSnapchatUrl?: string;
  // CMS Policies, Branches & Contact
  branchesAr?: string;
  branchesEn?: string;
  contactAr?: string;
  contactEn?: string;
  whatsappNumber?: string;
  phoneNumber?: string;
  privacyAr?: string;
  privacyEn?: string;
  returnsAr?: string;
  returnsEn?: string;
  shippingAr?: string;
  shippingEn?: string;
  copyrightAr?: string;
  copyrightEn?: string;
  // Collections View Header Settings
  collectionsTitleAr?: string;
  collectionsTitleEn?: string;
  collectionsSubtitleAr?: string;
  collectionsSubtitleEn?: string;
  // Site Default Language & Payment Accounts
  defaultLanguage?: 'ar' | 'en';
  // Payment Settings
  enableVodafoneCash?: boolean;
  vodafoneCashNumber?: string;
  vodafoneCashInstructionsAr?: string;
  vodafoneCashInstructionsEn?: string;
  enableOrangeCash?: boolean;
  orangeCashNumber?: string;
  orangeCashInstructionsAr?: string;
  orangeCashInstructionsEn?: string;
  enableInstaPay?: boolean;
  instaPayAccount?: string;
  instaPayAddress?: string;
  instaPayPhone?: string;
  instaPayInstructionsAr?: string;
  instaPayInstructionsEn?: string;
  enableCashOnDelivery?: boolean;
  codInstructionsAr?: string;
  codInstructionsEn?: string;
}

export interface ShippingAddress {
  fullName: string;
  street: string;
  apartment?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
}

export interface PaymentDetails {
  method: 'credit_card' | 'paypal';
  cardName: string;
  cardNumber: string;
  expDate: string;
  cvc: string;
  billingMatchesShipping: boolean;
}

export interface TouzaUser {
  uid: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  createdAt: any;
  provider: 'email' | 'google';
  photoURL?: string;
  lastLoginAt?: any;
}
