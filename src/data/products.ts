import { Product } from '../types';

export const HERO_IMAGE = '/images/touza_hero_poster.jpg';

export const getLocalizedProductName = (product: Product, lang: 'ar' | 'en'): string => {
  if (lang === 'ar' && product.nameAr) return product.nameAr;
  return product.name;
};

export const getLocalizedProductSubtitle = (product: Product, lang: 'ar' | 'en'): string => {
  if (lang === 'ar' && product.subtitleAr) return product.subtitleAr;
  return product.subtitle || '';
};

export const getLocalizedProductCategory = (product: Product, lang: 'ar' | 'en'): string => {
  if (lang === 'ar' && product.categoryAr) return product.categoryAr;
  return product.category;
};

export const getLocalizedProductDescription = (product: Product, lang: 'ar' | 'en'): string => {
  if (lang === 'ar' && product.descriptionAr) return product.descriptionAr;
  return product.description || '';
};

export const getLocalizedProductDetails = (product: Product, lang: 'ar' | 'en'): string[] => {
  if (lang === 'ar' && product.detailsAr && product.detailsAr.length > 0) return product.detailsAr;
  return product.details || [];
};

export const PRODUCTS: Product[] = [
  {
    id: 'prod-1786807489391',
    name: 'Suit louisvitton',
    nameAr: 'سرت لويس فيتون',
    subtitle: 'TOUZA Casual Collection',
    subtitleAr: 'تشكيلة توزا الكاجوال الفاخرة',
    category: 'suit',
    categoryAr: 'سيت',
    price: 5000,
    originalPrice: 6750,
    description: '',
    descriptionAr: '',
    colors: [
      {
        name: 'Default',
        nameAr: 'افتراضي',
        hex: '#a7c6ff',
        imageUrl: 'https://res.cloudinary.com/qazdrpcx/image/upload/v1786807455/touza_products/ptb2bjxn9eawieshdumu.jpg',
      },
    ],
    sizes: [
      {
        size: 'L',
        inStock: true,
      },
      {
        size: 'XXL',
        inStock: true,
      },
    ],
    images: [
      'https://res.cloudinary.com/qazdrpcx/image/upload/v1786807455/touza_products/ptb2bjxn9eawieshdumu.jpg',
      'https://res.cloudinary.com/qazdrpcx/image/upload/v1786807466/touza_products/aq8tezmxfgx5g5lksn0y.jpg',
      'https://res.cloudinary.com/qazdrpcx/image/upload/v1786807480/touza_products/gbbqszuri6nj36jd3hum.jpg',
    ],
    isNewArrival: true,
    isFeatured: true,
    showOnHome: true,
  },
  {
    id: 'prod-1786808736332',
    name: 'Balmain tshirt',
    nameAr: 'تشيرت بلمان',
    subtitle: 'TOUZA Casual Collection',
    subtitleAr: 'تشكيلة توزا الكاجوال الفاخرة',
    category: 'T-Shirts',
    categoryAr: 'تيشيرت',
    price: 900,
    originalPrice: 1900,
    description: '',
    descriptionAr: '',
    colors: [
      {
        name: 'Black',
        nameAr: 'أسود',
        hex: '#111111',
        imageUrl: 'https://res.cloudinary.com/qazdrpcx/image/upload/v1786808714/touza_products/wjybbowlh99dgw3gpqfi.png',
      },
      {
        name: 'White',
        nameAr: 'أبيض',
        hex: '#ffffff',
        imageUrl: 'https://res.cloudinary.com/qazdrpcx/image/upload/v1786808728/touza_products/n90sjnrydbe1idlqgmsl.png',
      },
    ],
    sizes: [
      {
        size: 's',
        inStock: true,
      },
      {
        size: 'm',
        inStock: true,
      },
      {
        size: 'l',
        inStock: true,
      },
      {
        size: 'xl',
        inStock: true,
      },
      {
        size: 'xxl',
        inStock: true,
      },
    ],
    images: [
      'https://res.cloudinary.com/qazdrpcx/image/upload/v1786809185/touza_products/et2olhe9fa5ndwtgz4fl.png',
    ],
    isNewArrival: false,
    isFeatured: true,
    showOnHome: true,
  },
  {
    id: 'prod-1786811765799',
    name: 'D&G Tshirt',
    nameAr: 'تشيرت دولسي & غابانا ',
    subtitle: 'TOUZA Casual Collection',
    subtitleAr: 'تشكيلة توزا الكاجوال الفاخرة',
    category: 'T-Shirts',
    categoryAr: 'تيشيرت',
    price: 1400,
    originalPrice: 2000,
    description: '',
    descriptionAr: '',
    colors: [
      {
        name: 'Black',
        nameAr: 'أسود',
        hex: '#111111',
        imageUrl: 'https://res.cloudinary.com/qazdrpcx/image/upload/v1786811748/touza_products/lafj3u1izwghqryeurym.jpg',
      },
    ],
    sizes: [
      {
        size: 'XL',
        inStock: true,
      },
    ],
    images: [
      'https://res.cloudinary.com/qazdrpcx/image/upload/v1786812106/touza_products/heiasuuelelpbbncehob.jpg',
    ],
    isNewArrival: false,
    isFeatured: true,
    showOnHome: true,
  },
  {
    id: 'prod-1786812584760',
    name: 'D&g shirt',
    nameAr: 'قميص دولسى & غابانا ',
    subtitle: 'TOUZA Casual Collection',
    subtitleAr: 'تشكيلة توزا الكاجوال الفاخرة',
    category: 'Shirts',
    categoryAr: 'قميص',
    price: 1900,
    description: '',
    descriptionAr: '',
    colors: [
      {
        name: 'White',
        nameAr: 'أبيض',
        hex: '#ffffff',
        imageUrl: 'https://res.cloudinary.com/qazdrpcx/image/upload/v1786812533/touza_products/hcjrlg9juszfqwdyxwgz.png',
      },
      {
        name: 'Black',
        nameAr: 'أسود',
        hex: '#000000',
        imageUrl: 'https://res.cloudinary.com/qazdrpcx/image/upload/v1786812546/touza_products/sefmhvttvpytsysantlk.jpg',
      },
    ],
    sizes: [
      {
        size: 'M',
        inStock: true,
      },
      {
        size: 'L',
        inStock: true,
      },
      {
        size: 'XL',
        inStock: true,
      },
      {
        size: 'XXL',
        inStock: true,
      },
    ],
    images: [
      'https://res.cloudinary.com/qazdrpcx/image/upload/v1786812577/touza_products/lq3h64gkjahy92h8cj18.png',
    ],
    isNewArrival: true,
    isFeatured: true,
    showOnHome: true,
  },
  {
    id: 'prod-1786828546097',
    name: 'Balenciaga wideleg',
    nameAr: 'وايد ليج بلنسياجا ',
    subtitle: 'TOUZA Casual Collection',
    subtitleAr: 'تشكيلة توزا الكاجوال الفاخرة',
    category: 'Pants',
    categoryAr: 'بنطلون',
    price: 2625,
    originalPrice: 3500,
    description: '',
    descriptionAr: '',
    colors: [
      {
        name: 'Jeans ',
        nameAr: 'أزرق ',
        hex: '#0042a9',
        imageUrl: 'https://res.cloudinary.com/qazdrpcx/image/upload/v1786828481/touza_products/imu3afnmz4x8sd3fscg8.png',
      },
    ],
    sizes: [
      {
        size: 'S',
        inStock: true,
      },
      {
        size: 'M',
        inStock: true,
      },
      {
        size: 'L',
        inStock: true,
      },
      {
        size: 'Xl',
        inStock: true,
      },
      {
        size: 'XXL',
        inStock: true,
      },
    ],
    images: [
      'https://res.cloudinary.com/qazdrpcx/image/upload/v1786828539/touza_products/lu9wvhmrqexytjkuer8i.png',
    ],
    isNewArrival: false,
    isFeatured: true,
    showOnHome: true,
  },
  {
    id: 'touza-summer-striped-shirt-brown',
    name: 'TOUZA Summer Striped Shirt — Brown',
    nameAr: 'قميص TOUZA الصيفي المخطط – بني',
    subtitle: 'TOUZA — SHIRT / BROWN STRIPE',
    subtitleAr: 'توزا — قميص صيفي مخطط بني',
    category: 'Shirts',
    categoryAr: 'قميص',
    price: 850,
    originalPrice: 1100,
    description: 'An oversized casual shirt in soft waffle-knit cotton, featuring fine brown and black stripes on a warm beige base. Finished with a classic collar and mother-of-pearl buttons. A timeless, earthy-toned piece that works beautifully for both day and evening casual styling.',
    descriptionAr: 'قميص كاجوال بقصة أوفرايز مريحة، من قماش الوافل القطني الناعم، بلاحظ خيط رفيعة بني وأسود على خلفية بيج هادية تديله إحساس ترابي دافئ. بياقة كلاسيكية وأزرار صدف أنيقة. اختيار مثالي لمحبي الألوان الهادئة والإطلالة الكاجوال الراقية اللي تناسب النهار والمساء على حد سواء.',
    details: [
      '100% Soft Waffle-Knit Cotton',
      'Oversized Comfortable Cut',
      'Fine Brown & Black Stripes on Beige Base',
      'Classic Collar & Mother-of-Pearl Buttons',
      'Made in Egypt — TOUZA Signature',
    ],
    detailsAr: [
      '100% قماش الوافل القطني الناعم',
      'قصة أوفرايز كاجوال مريحة',
      'خطوط رفيعة باللون البني والأسود على خلفية بيج دافئة',
      'ياقة كلاسيكية بأزرار صدف أنيقة',
      'صنع في مصر - توزا',
    ],
    colors: [
      {
        name: 'Brown Stripe',
        nameAr: 'بني مخطط',
        hex: '#6e473b',
        imageUrl: '/images/touza_brown_shirt.jpg',
      },
    ],
    sizes: [
      {
        size: 'M',
        inStock: true,
      },
      {
        size: 'L',
        inStock: true,
      },
      {
        size: 'XL',
        inStock: true,
      },
      {
        size: 'XXL',
        inStock: true,
      },
    ],
    images: [
      '/images/touza_brown_shirt.jpg',
    ],
    isNewArrival: true,
    isFeatured: true,
    showOnHome: true,
  },
  {
    id: 'touza-summer-striped-shirt-green',
    name: 'TOUZA Summer Striped Shirt — Green',
    nameAr: 'قميص TOUZA الصيفي المخطط – أخضر',
    subtitle: 'TOUZA — SHIRT / GREEN STRIPE',
    subtitleAr: 'توزا — قميص صيفي مخطط أخضر',
    category: 'Shirts',
    categoryAr: 'قميص',
    price: 850,
    originalPrice: 1100,
    description: 'A relaxed-fit casual shirt crafted from breathable waffle-textured cotton, perfect for warm days. Featuring vertical green and black stripes on a soft beige base, a classic collar, and mother-of-pearl buttons. An easy, everyday piece that brings effortless style to any casual look.',
    descriptionAr: 'قميص كاجوال بقصة واسعة ومريحة، بخامة قطنية منسوجة بنسيج الوافل المموج تديله ملمس صيفي خفيف وتهوية ممتازة. خطوط رأسية باللون الأخضر والأسود على أرضية بيج فاتحة، بياقة كلاسيكية وأزرار من الصدف. القميص من التصاميم اللي تلبسها يومياً بإحساس أنيق من غير تكلف، مناسب للخروجات الصيفية والإطلالة الكاجوال الرايقة.',
    details: [
      '100% Breathable Waffle-Textured Cotton',
      'Relaxed Casual Fit',
      'Vertical Green & Black Stripe Design',
      'Classic Collar & Mother-of-Pearl Buttons',
      'Made in Egypt — TOUZA Signature',
    ],
    detailsAr: [
      '100% قطن نسيج الوافل المموج عالي الجودة',
      'قصة كاجوال واسعة ومريحة',
      'خطوط رأسية باللون الأخضر والأسود على أرضية بيج فاتحة',
      'ياقة كلاسيكية بأزرار صدف طبيعية',
      'صنع في مصر - توزا',
    ],
    colors: [
      {
        name: 'Green Stripe',
        nameAr: 'أخضر مخطط',
        hex: '#2e5a44',
        imageUrl: '/images/touza_green_shirt.jpg',
      },
    ],
    sizes: [
      {
        size: 'M',
        inStock: true,
      },
      {
        size: 'L',
        inStock: true,
      },
      {
        size: 'XL',
        inStock: true,
      },
      {
        size: 'XXL',
        inStock: true,
      },
    ],
    images: [
      '/images/touza_green_shirt.jpg',
    ],
    isNewArrival: true,
    isFeatured: true,
    showOnHome: true,
  },
  {
    id: 'touza-summer-striped-shirt-orange',
    name: 'TOUZA Summer Striped Shirt — Orange',
    nameAr: 'قميص TOUZA الصيفي المخطط – برتقالي',
    subtitle: 'TOUZA — SHIRT / ORANGE STRIPE',
    subtitleAr: 'توزا — قميص صيفي مخطط برتقالي',
    category: 'Shirts',
    categoryAr: 'قميص',
    price: 850,
    originalPrice: 1100,
    description: 'A modern, relaxed-fit shirt in lightweight waffle cotton, featuring coral-orange and black stripes on a soft beige base. Classic collar with mother-of-pearl buttons. A standout color choice for an effortlessly stylish, casual summer look.',
    descriptionAr: 'قميص كاجوال بقصة واسعة عصرية، من خامة الوافل القطنية اللي بتدي إحساس صيفي خفيف. خطوط برتقالي مرجاني وأسود على أرضية بيج فاتحة، بياقة كلاسيكية وأزرار صدف. لمسة لون مميزة تكسر الروتين وتديك إطلالة كاجوال شيك بدون مجهود، مثالية لأيام الصيف والخروجات النهارية.',
    details: [
      'Lightweight Waffle Cotton Fabric',
      'Modern Relaxed Summer Fit',
      'Vibrant Coral-Orange & Black Stripes',
      'Classic Collar & Mother-of-Pearl Buttons',
      'Made in Egypt — TOUZA Signature',
    ],
    detailsAr: [
      'خامة الوافل القطنية خفيفة الوزن',
      'قصة واسعة عصرية ومناسبة للصيف',
      'خطوط برتقالي مرجاني وأسود مميزة',
      'ياقة كلاسيكية بأزرار صدف فاخرة',
      'صنع في مصر - توزا',
    ],
    colors: [
      {
        name: 'Orange Stripe',
        nameAr: 'برتقالي مخطط',
        hex: '#d95a2b',
        imageUrl: '/images/touza_orange_shirt.jpg',
      },
    ],
    sizes: [
      {
        size: 'M',
        inStock: true,
      },
      {
        size: 'L',
        inStock: true,
      },
      {
        size: 'XL',
        inStock: true,
      },
      {
        size: 'XXL',
        inStock: true,
      },
    ],
    images: [
      '/images/touza_orange_shirt.jpg',
    ],
    isNewArrival: true,
    isFeatured: true,
    showOnHome: true,
  },
  {
    id: 'touza-summer-striped-shirt-yellow',
    name: 'TOUZA Summer Striped Shirt — Yellow',
    nameAr: 'قميص TOUZA الصيفي المخطط – أصفر',
    subtitle: 'TOUZA — SHIRT / YELLOW STRIPE',
    subtitleAr: 'توزا — قميص صيفي مخطط أصفر',
    category: 'Shirts',
    categoryAr: 'قميص',
    price: 850,
    originalPrice: 1100,
    description: 'A relaxed-fit casual shirt in lightweight waffle cotton, featuring fine yellow and black stripes on a beige base for a bright summer energy. Classic collar and mother-of-pearl buttons complete the look. Perfect for those who love bold, warm tones in an easygoing casual style.',
    descriptionAr: 'قميص كاجوال بقصة واسعة مريحة، من قماش الوافل القطني الخفيف. خطوط رفيعة صفراء وسوداء على خلفية بيج فاتحة تديله طاقة صيفية مشرقة. بياقة كلاسيكية وأزرار صدف أنيقة. اختيار مثالي لمحي الألوان الدافئة الجريئة والإطلالة الكاجوال المفعمة بالحيوية.',
    details: [
      'Lightweight Waffle Cotton Fabric',
      'Relaxed Fit with Summer Energy',
      'Fine Yellow & Black Stripes on Beige Base',
      'Classic Collar & Mother-of-Pearl Buttons',
      'Made in Egypt — TOUZA Signature',
    ],
    detailsAr: [
      'قماش الوافل القطني الخفيف والبارد',
      'قصة واسعة مريحة تمنح طاقة صيفية',
      'خطوط رفيعة صفراء وسوداء على بيج فاتح',
      'ياقة كلاسيكية وأزرار صدف متقنة',
      'صنع في مصر - توزا'
    ],
    colors: [
      {
        name: 'Yellow Stripe',
        nameAr: 'أصفر مخطط',
        hex: '#d4a32a',
        imageUrl: '/images/touza_yellow_shirt.jpg',
      },
    ],
    sizes: [
      {
        size: 'M',
        inStock: true,
      },
      {
        size: 'L',
        inStock: true,
      },
      {
        size: 'XL',
        inStock: true,
      },
      {
        size: 'XXL',
        inStock: true,
      },
    ],
    images: [
      '/images/touza_yellow_shirt.jpg',
    ],
    isNewArrival: true,
    isFeatured: true,
    showOnHome: true,
  },
];
