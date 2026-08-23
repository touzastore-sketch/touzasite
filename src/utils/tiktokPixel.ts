import { Product, CartItem } from '../types';

export const TIKTOK_PIXEL_ID = 'DASHJR3C7TUES9731TTO';

declare global {
  interface Window {
    TiktokAnalyticsObject?: string;
    ttq?: any;
    __tiktok_pixel_initialized?: boolean;
  }
}

/**
 * Initialize TikTok Pixel safely and idempotently (only once).
 */
export const initTikTokPixel = (): void => {
  if (typeof window === 'undefined') return;

  if (window.__tiktok_pixel_initialized && window.ttq) {
    return;
  }

  /* TikTok Pixel Base Code */
  (function (w: any, d: any, t: string) {
    w.TiktokAnalyticsObject = t;
    const ttq = (w[t] = w[t] || []);
    ttq.methods = [
      'page',
      'track',
      'identify',
      'instances',
      'debug',
      'on',
      'off',
      'once',
      'ready',
      'alias',
      'group',
      'enableCookie',
      'disableCookie',
      'holdConsent',
      'revokeConsent',
      'grantConsent',
    ];
    ttq.setAndDefer = function (target: any, method: string) {
      target[method] = function () {
        target.push([method].concat(Array.prototype.slice.call(arguments, 0)));
      };
    };
    for (let i = 0; i < ttq.methods.length; i++) {
      ttq.setAndDefer(ttq, ttq.methods[i]);
    }
    ttq.instance = function (instanceId: string) {
      const instance = ttq._i[instanceId] || [];
      for (let n = 0; n < ttq.methods.length; n++) {
        ttq.setAndDefer(instance, ttq.methods[n]);
      }
      return instance;
    };
    ttq.load = function (pixelId: string, options?: any) {
      const scriptUrl = 'https://analytics.tiktok.com/i18n/pixel/events.js';
      ttq._i = ttq._i || {};
      ttq._i[pixelId] = [];
      ttq._i[pixelId]._u = scriptUrl;
      ttq._t = ttq._t || {};
      ttq._t[pixelId] = +new Date();
      ttq._o = ttq._o || {};
      ttq._o[pixelId] = options || {};
      
      const existingScript = d.querySelector(`script[src*="analytics.tiktok.com"]`);
      if (!existingScript) {
        const scriptElem = d.createElement('script');
        scriptElem.type = 'text/javascript';
        scriptElem.async = true;
        scriptElem.src = scriptUrl + '?sdkid=' + pixelId + '&lib=' + t;
        const firstScript = d.getElementsByTagName('script')[0];
        if (firstScript && firstScript.parentNode) {
          firstScript.parentNode.insertBefore(scriptElem, firstScript);
        } else {
          d.head.appendChild(scriptElem);
        }
      }
    };

    if (!window.__tiktok_pixel_initialized) {
      ttq.load(TIKTOK_PIXEL_ID);
      ttq.page();
      window.__tiktok_pixel_initialized = true;
    }
  })(window, document, 'ttq');
};

/**
 * Track PageView event
 */
export const trackTikTokPageView = (pageName?: string): void => {
  if (typeof window === 'undefined') return;
  try {
    if (window.ttq && typeof window.ttq.page === 'function') {
      window.ttq.page();
    }
  } catch (err) {
    console.debug('TikTok Pixel PageView error:', err);
  }
};

/**
 * Track ViewContent event when a user views a product
 */
export const trackTikTokViewContent = (
  product: Product,
  quantity = 1,
  currency = 'EGP'
): void => {
  if (typeof window === 'undefined' || !product) return;
  try {
    const pPrice = Number(product.price) || 0;
    const pName = product.nameAr || product.name || '';
    const pCategory = product.categoryAr || product.category || 'Clothing';

    if (window.ttq && typeof window.ttq.track === 'function') {
      window.ttq.track('ViewContent', {
        contents: [
          {
            content_id: String(product.id),
            content_type: 'product',
            content_name: pName,
            content_category: pCategory,
            price: pPrice,
            quantity: quantity,
          },
        ],
        value: pPrice * quantity,
        currency: currency,
      });
    }
  } catch (err) {
    console.debug('TikTok Pixel ViewContent error:', err);
  }
};

/**
 * Track AddToCart event when a user adds a product to bag
 */
export const trackTikTokAddToCart = (
  product: Product,
  quantity = 1,
  color?: string,
  size?: string,
  currency = 'EGP'
): void => {
  if (typeof window === 'undefined' || !product) return;
  try {
    const pPrice = Number(product.price) || 0;
    const pName = product.nameAr || product.name || '';
    const pCategory = product.categoryAr || product.category || 'Clothing';

    if (window.ttq && typeof window.ttq.track === 'function') {
      window.ttq.track('AddToCart', {
        contents: [
          {
            content_id: String(product.id),
            content_type: 'product',
            content_name: pName,
            content_category: pCategory,
            price: pPrice,
            quantity: quantity,
          },
        ],
        value: pPrice * quantity,
        currency: currency,
      });
    }
  } catch (err) {
    console.debug('TikTok Pixel AddToCart error:', err);
  }
};

/**
 * Track InitiateCheckout event when checkout process begins
 */
export const trackTikTokInitiateCheckout = (
  cartItems: CartItem[],
  totalValue?: number,
  currency = 'EGP'
): void => {
  if (typeof window === 'undefined' || !cartItems || cartItems.length === 0) return;
  try {
    const calculatedTotal =
      typeof totalValue === 'number'
        ? totalValue
        : cartItems.reduce((sum, item) => sum + (item.product.price || 0) * (item.quantity || 1), 0);

    const contents = cartItems.map((item) => ({
      content_id: String(item.product.id),
      content_type: 'product',
      content_name: item.product.nameAr || item.product.name || '',
      content_category: item.product.categoryAr || item.product.category || 'Clothing',
      price: Number(item.product.price) || 0,
      quantity: Number(item.quantity) || 1,
    }));

    if (window.ttq && typeof window.ttq.track === 'function') {
      window.ttq.track('InitiateCheckout', {
        contents: contents,
        value: calculatedTotal,
        currency: currency,
      });
    }
  } catch (err) {
    console.debug('TikTok Pixel InitiateCheckout error:', err);
  }
};

/**
 * Track Purchase event when an order is completed successfully
 */
export const trackTikTokPurchase = (orderData: {
  orderNumber: string;
  items: Array<{
    productId?: string;
    id?: string;
    title?: string;
    name?: string;
    price: number;
    quantity: number;
  }>;
  total: number;
  currency?: string;
}): void => {
  if (typeof window === 'undefined' || !orderData) return;
  try {
    const currency = orderData.currency || 'EGP';
    const contents = (orderData.items || []).map((item) => ({
      content_id: String(item.productId || item.id || ''),
      content_type: 'product',
      content_name: item.title || item.name || '',
      price: Number(item.price) || 0,
      quantity: Number(item.quantity) || 1,
    }));

    if (window.ttq && typeof window.ttq.track === 'function') {
      // CompletePayment is TikTok's primary standard conversion event
      window.ttq.track('CompletePayment', {
        contents: contents,
        value: Number(orderData.total) || 0,
        currency: currency,
        event_id: orderData.orderNumber,
      });

      // Also fire Purchase as requested by user / TikTok event mapping
      window.ttq.track('Purchase', {
        contents: contents,
        value: Number(orderData.total) || 0,
        currency: currency,
        event_id: orderData.orderNumber,
      });
    }
  } catch (err) {
    console.debug('TikTok Pixel Purchase error:', err);
  }
};
