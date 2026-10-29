import { Product } from '../types';

export const HERO_IMAGE = '/images/touza_hero_poster.jpg';
export const CATALOG_VERSION = 'v2026_10_clean_empty_catalog';

export const getLocalizedProductName = (product?: Product | null, language: string = 'ar'): string => {
  if (!product) return '';
  if (language === 'ar') {
    return product.nameAr || product.name || '';
  }
  return product.name || product.nameAr || '';
};

export const getLocalizedProductSubtitle = (product?: Product | null, language: string = 'ar'): string => {
  if (!product) return '';
  if (language === 'ar') {
    return product.subtitleAr || product.subtitle || '';
  }
  return product.subtitle || product.subtitleAr || '';
};

export const getLocalizedProductCategory = (product?: Product | null, language: string = 'ar'): string => {
  if (!product) return '';
  if (language === 'ar') {
    return product.categoryAr || product.category || '';
  }
  return product.category || product.categoryAr || '';
};

export const getLocalizedProductDescription = (product?: Product | null, language: string = 'ar'): string => {
  if (!product) return '';
  if (language === 'ar') {
    return product.descriptionAr || product.description || '';
  }
  return product.description || product.descriptionAr || '';
};

export const getLocalizedProductDetails = (product?: Product | null, language: string = 'ar'): string[] => {
  if (!product) return [];
  if (language === 'ar') {
    return product.detailsAr && product.detailsAr.length > 0
      ? product.detailsAr
      : product.details || [];
  }
  return product.details && product.details.length > 0
    ? product.details
    : product.detailsAr || [];
};

// Store has no products initially until added by store manager
export const PRODUCTS: Product[] = [];
