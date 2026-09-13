import { Product } from '../types';

export const HERO_IMAGE = '/images/touza_hero_poster.jpg';
export const CATALOG_VERSION = 'v2026_09_01_29prods_live';

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

export const PRODUCTS: Product[] = [
  {
    "id": "prod-1786807489391",
    "subtitleAr": "تشكيلة توزا الكاجوال الفاخرة",
    "subtitle": "TOUZA Casual Collection",
    "showOnHome": true,
    "name": "Suit louisvitton",
    "price": 5000,
    "images": [
      "https://res.cloudinary.com/s1vv6dqw/image/upload/f_auto,q_auto/v1789069709/touza_products/qhtrxrmm6dhpfypuhuyd.jpg",
      "https://res.cloudinary.com/s1vv6dqw/image/upload/f_auto,q_auto/v1789069729/touza_products/iit68ruy0umdkupes7il.jpg"
    ],
    "categoryAr": "سيت",
    "colors": [
      {
        "hex": "#a7c6ff",
        "imageUrl": "https://res.cloudinary.com/s1vv6dqw/image/upload/f_auto,q_auto/v1789069709/touza_products/qhtrxrmm6dhpfypuhuyd.jpg",
        "name": "Default",
        "nameAr": "افتراضي"
      }
    ],
    "originalPrice": 6750,
    "isNewArrival": false,
    "isFeatured": true,
    "category": "suit",
    "nameAr": "سرت لويس فيتون",
    "descriptionAr": "",
    "description": "",
    "sizes": [
      {
        "size": "L",
        "inStock": true
      },
      {
        "inStock": true,
        "size": "XXL"
      }
    ]
  },
  {
    "id": "prod-1786808736332",
    "isNewArrival": false,
    "description": "",
    "descriptionAr": "",
    "sizes": [
      {
        "size": "s",
        "inStock": true
      },
      {
        "inStock": true,
        "size": "m"
      },
      {
        "inStock": true,
        "size": "l"
      },
      {
        "size": "xl",
        "inStock": true
      },
      {
        "inStock": true,
        "size": "xxl"
      }
    ],
    "isFeatured": true,
    "subtitle": "TOUZA Casual Collection",
    "originalPrice": 1900,
    "images": [
      "https://res.cloudinary.com/s1vv6dqw/image/upload/f_auto,q_auto/v1789033070/touza_products/zktaknhomemzxphvwsdl.jpg"
    ],
    "showOnHome": true,
    "category": "T-Shirts",
    "name": "Balmain tshirt",
    "price": 900,
    "subtitleAr": "تشكيلة توزا الكاجوال الفاخرة",
    "colors": [
      {
        "hex": "#111111",
        "nameAr": "أسود",
        "imageUrl": "https://res.cloudinary.com/s1vv6dqw/image/upload/f_auto,q_auto/v1789033070/touza_products/zktaknhomemzxphvwsdl.jpg",
        "name": "Black"
      },
      {
        "nameAr": "أبيض",
        "hex": "#ffffff",
        "imageUrl": "https://res.cloudinary.com/s1vv6dqw/image/upload/f_auto,q_auto/v1789033091/touza_products/a11pabavoqyhvpd9lspb.jpg",
        "name": "White"
      }
    ],
    "categoryAr": "تيشيرت",
    "nameAr": "تشيرت بلمان"
  },
  {
    "id": "prod-1786811765799",
    "nameAr": "تشيرت دولسي & غابانا ",
    "price": 1400,
    "category": "T-Shirts",
    "isFeatured": true,
    "colors": [
      {
        "name": "Black",
        "nameAr": "أسود",
        "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1786811748/touza_products/lafj3u1izwghqryeurym.jpg",
        "hex": "#111111"
      }
    ],
    "categoryAr": "تيشيرت",
    "originalPrice": 2000,
    "images": [
      "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1786812106/touza_products/heiasuuelelpbbncehob.jpg"
    ],
    "sizes": [
      {
        "inStock": true,
        "size": "XL"
      }
    ],
    "description": "",
    "isNewArrival": false,
    "subtitle": "TOUZA Casual Collection",
    "showOnHome": true,
    "descriptionAr": "",
    "name": "D&G Tshirt",
    "subtitleAr": "تشكيلة توزا الكاجوال الفاخرة"
  },
  {
    "id": "prod-1786812584760",
    "nameAr": "قميص دولسى & غابانا ",
    "colors": [
      {
        "nameAr": "أبيض",
        "hex": "#ffffff",
        "name": "White",
        "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1786812533/touza_products/hcjrlg9juszfqwdyxwgz.png"
      },
      {
        "name": "Black",
        "nameAr": "أسود",
        "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1786812546/touza_products/sefmhvttvpytsysantlk.jpg",
        "hex": "#000000"
      }
    ],
    "isFeatured": true,
    "price": 1900,
    "category": "Shirts",
    "isNewArrival": true,
    "categoryAr": "قميص",
    "subtitle": "TOUZA Casual Collection",
    "name": "D&g shirt",
    "images": [
      "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1786812577/touza_products/lq3h64gkjahy92h8cj18.png"
    ],
    "descriptionAr": "",
    "showOnHome": true,
    "sizes": [
      {
        "size": "M",
        "inStock": true
      },
      {
        "size": "L",
        "inStock": true
      },
      {
        "inStock": true,
        "size": "XL"
      },
      {
        "size": "XXL",
        "inStock": true
      }
    ],
    "description": "",
    "subtitleAr": "تشكيلة توزا الكاجوال الفاخرة"
  },
  {
    "id": "prod-1786828546097",
    "showOnHome": true,
    "description": "",
    "subtitleAr": "تشكيلة توزا الكاجوال الفاخرة",
    "price": 2625,
    "images": [
      "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1786828539/touza_products/lu9wvhmrqexytjkuer8i.png"
    ],
    "categoryAr": "بنطلون",
    "subtitle": "TOUZA Casual Collection",
    "colors": [
      {
        "hex": "#0042a9",
        "nameAr": "أزرق ",
        "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1786828481/touza_products/imu3afnmz4x8sd3fscg8.png",
        "name": "Jeans "
      }
    ],
    "category": "Pants",
    "isFeatured": true,
    "descriptionAr": "",
    "isNewArrival": false,
    "originalPrice": 3500,
    "name": "Balenciaga wideleg",
    "nameAr": "وايد ليج بلنسياجا ",
    "sizes": [
      {
        "size": "S",
        "inStock": true
      },
      {
        "inStock": true,
        "size": "M"
      },
      {
        "size": "L",
        "inStock": true
      },
      {
        "size": "Xl",
        "inStock": true
      },
      {
        "inStock": true,
        "size": "XXL"
      }
    ]
  },
  {
    "id": "prod-1786997865728",
    "nameAr": "تشيرت ديور ",
    "price": 1400,
    "isFeatured": true,
    "category": "T-Shirts",
    "isNewArrival": false,
    "colors": [
      {
        "hex": "#111111",
        "nameAr": "أسود",
        "name": "Black",
        "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1786997826/touza_products/sac5mz7v5u4kxyw9vnva.jpg"
      }
    ],
    "description": "",
    "showOnHome": true,
    "sizes": [
      {
        "size": "M",
        "inStock": true
      },
      {
        "inStock": true,
        "size": "L"
      },
      {
        "inStock": true,
        "size": "XL"
      }
    ],
    "images": [
      "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1786997914/touza_products/apvwbqbvmjl9hbhjmoip.jpg"
    ],
    "subtitleAr": "تشكيلة توزا الكاجوال الفاخرة",
    "descriptionAr": "",
    "subtitle": "TOUZA Casual Collection",
    "originalPrice": 2000,
    "categoryAr": "تيشيرت",
    "name": "Dior tshirt"
  },
  {
    "id": "prod-1786998444924",
    "originalPrice": 2000,
    "sizes": [
      {
        "size": "S",
        "inStock": true
      },
      {
        "size": "XL",
        "inStock": true
      },
      {
        "inStock": true,
        "size": "XXL"
      }
    ],
    "isNewArrival": false,
    "isFeatured": false,
    "category": "T-Shirts",
    "descriptionAr": "",
    "images": [
      "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1786998439/touza_products/mnunskoz4rai0hdcposq.png"
    ],
    "showOnHome": false,
    "name": "Amiri tshirt",
    "price": 1400,
    "subtitle": "TOUZA Casual Collection",
    "subtitleAr": "تشكيلة توزا الكاجوال الفاخرة",
    "colors": [
      {
        "name": "Black",
        "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1786998405/touza_products/pf1pn5hkcob6ewj49zmf.png",
        "nameAr": "أسود",
        "hex": "#111111",
        "sizes": [
          {
            "size": "S",
            "inStock": true
          },
          {
            "size": "M",
            "inStock": false
          },
          {
            "inStock": false,
            "size": "L"
          },
          {
            "inStock": true,
            "size": "XL"
          },
          {
            "size": "XXL",
            "inStock": true
          }
        ]
      },
      {
        "name": "White",
        "hex": "#ffffff",
        "nameAr": "أبيض",
        "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1786998317/touza_products/dsuipth6oaboyaoz46vk.png",
        "sizes": [
          {
            "inStock": true,
            "size": "S"
          },
          {
            "inStock": false,
            "size": "M"
          },
          {
            "inStock": false,
            "size": "L"
          },
          {
            "inStock": false,
            "size": "XL"
          },
          {
            "size": "XXL",
            "inStock": true
          }
        ]
      }
    ],
    "categoryAr": "تيشيرت",
    "nameAr": "تشيرت أميرى ",
    "description": ""
  },
  {
    "id": "prod-1787076622253",
    "nameAr": "تشيرت أميرى",
    "description": "",
    "descriptionAr": "",
    "sizes": [
      {
        "inStock": true,
        "size": "M"
      },
      {
        "size": "L",
        "inStock": true
      },
      {
        "size": "XL",
        "inStock": true
      },
      {
        "inStock": true,
        "size": "XXL"
      }
    ],
    "isFeatured": true,
    "originalPrice": 1100,
    "category": "T-Shirts",
    "colors": [
      {
        "hex": "#111111",
        "sizes": [
          {
            "size": "S",
            "inStock": true
          },
          {
            "size": "M",
            "inStock": true
          },
          {
            "inStock": true,
            "size": "XL"
          },
          {
            "size": "XXL",
            "inStock": true
          }
        ],
        "name": "Black",
        "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787076547/touza_products/p9rnldygrhqr7rftg7cg.png",
        "nameAr": "أسود"
      },
      {
        "sizes": [
          {
            "inStock": true,
            "size": "L"
          },
          {
            "size": "XL",
            "inStock": true
          },
          {
            "size": "XXL",
            "inStock": true
          }
        ],
        "nameAr": "أبيض",
        "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787076575/touza_products/k38u8dfq1p91m8afav94.png",
        "hex": "#ffffff",
        "name": "White"
      }
    ],
    "price": 850,
    "subtitle": "TOUZA Casual Collection",
    "categoryAr": "تيشيرت",
    "images": [
      "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787077932/touza_products/xymtefafcacnyyhghhlt.png"
    ],
    "isNewArrival": false,
    "name": "Amiri tshirt",
    "subtitleAr": "تشكيلة توزا الكاجوال الفاخرة",
    "showOnHome": true
  },
  {
    "id": "prod-1787077515769",
    "price": 1400,
    "category": "T-Shirts",
    "categoryAr": "تيشيرت",
    "descriptionAr": "",
    "originalPrice": 2000,
    "subtitleAr": "تشكيلة توزا الكاجوال الفاخرة",
    "description": "",
    "showOnHome": false,
    "images": [
      "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787077508/touza_products/d6qfr9satkyrl1azryis.jpg"
    ],
    "colors": [
      {
        "name": "Black",
        "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787077508/touza_products/d6qfr9satkyrl1azryis.jpg",
        "sizes": [
          {
            "inStock": false,
            "size": "S"
          },
          {
            "size": "M",
            "inStock": true
          },
          {
            "inStock": false,
            "size": "L"
          },
          {
            "inStock": true,
            "size": "XL"
          },
          {
            "inStock": false,
            "size": "XXL"
          }
        ],
        "hex": "#111111",
        "nameAr": "أسود"
      }
    ],
    "sizes": [
      {
        "inStock": true,
        "size": "M"
      },
      {
        "size": "XL",
        "inStock": true
      }
    ],
    "name": "Dsquared tshirt ",
    "nameAr": "تشيرت ديسكورد",
    "isNewArrival": false,
    "isFeatured": false,
    "subtitle": "TOUZA Casual Collection"
  },
  {
    "id": "prod-1787077904145",
    "colors": [
      {
        "nameAr": "أسود",
        "hex": "#111111",
        "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787077769/touza_products/qthuoql3evljoyuknprq.png",
        "sizes": [
          {
            "size": "S",
            "inStock": true
          },
          {
            "inStock": true,
            "size": "M"
          },
          {
            "inStock": false,
            "size": "L"
          },
          {
            "inStock": true,
            "size": "XL"
          },
          {
            "size": "XXL",
            "inStock": true
          }
        ],
        "name": "Black"
      },
      {
        "sizes": [
          {
            "inStock": true,
            "size": "S"
          },
          {
            "size": "M",
            "inStock": true
          },
          {
            "inStock": true,
            "size": "XL"
          }
        ],
        "hex": "#c2c2c2",
        "nameAr": "رومادى ",
        "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787077810/touza_products/u11mkhjz66tvlqjj8hif.jpg",
        "name": "Grey"
      },
      {
        "sizes": [
          {
            "inStock": true,
            "size": "S"
          },
          {
            "size": "XL",
            "inStock": true
          }
        ],
        "name": "White",
        "nameAr": "أبيض",
        "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787077842/touza_products/aj5p8vd4kmkatssmigox.jpg",
        "hex": "#ffffff"
      }
    ],
    "descriptionAr": "",
    "isFeatured": true,
    "category": "T-Shirts",
    "originalPrice": 2000,
    "nameAr": "تشيرت لويفي ",
    "description": "",
    "isNewArrival": false,
    "sizes": [
      {
        "size": "M",
        "inStock": true
      },
      {
        "inStock": true,
        "size": "L"
      },
      {
        "inStock": true,
        "size": "XL"
      },
      {
        "size": "S",
        "inStock": true
      },
      {
        "inStock": true,
        "size": "2XL"
      }
    ],
    "showOnHome": true,
    "subtitleAr": "تشكيلة توزا الكاجوال الفاخرة",
    "subtitle": "TOUZA Casual Collection",
    "images": [
      "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787077892/touza_products/zoj99gx8c7hkqdc76wdo.jpg"
    ],
    "price": 1400,
    "categoryAr": "تيشيرت",
    "name": "Lowe tshirt "
  },
  {
    "id": "prod-1787078405082",
    "subtitleAr": "تشكيلة توزا الكاجوال الفاخرة",
    "originalPrice": 2000,
    "showOnHome": true,
    "images": [
      "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787078362/touza_products/h5pda3dc2pdaaq35i6xq.jpg"
    ],
    "price": 1400,
    "descriptionAr": "",
    "category": "T-Shirts",
    "categoryAr": "تيشيرت",
    "subtitle": "TOUZA Casual Collection",
    "isFeatured": true,
    "isNewArrival": false,
    "colors": [
      {
        "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787078274/touza_products/ccnyzqptolszj4fo9237.jpg",
        "name": "White",
        "nameAr": "أبيض",
        "sizes": [
          {
            "size": "S",
            "inStock": false
          },
          {
            "inStock": false,
            "size": "M"
          },
          {
            "inStock": true,
            "size": "L"
          },
          {
            "inStock": true,
            "size": "XL"
          },
          {
            "size": "XXL",
            "inStock": true
          }
        ],
        "hex": "#ffffff"
      }
    ],
    "name": "D&G Tshirt",
    "sizes": [
      {
        "size": "L",
        "inStock": true
      },
      {
        "size": "XL",
        "inStock": true
      },
      {
        "inStock": true,
        "size": "XXL"
      }
    ],
    "nameAr": "تشيرت دولسى & غابانا ",
    "description": ""
  },
  {
    "id": "prod-1787078804876",
    "images": [
      "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787078586/touza_products/ykvqosnktnxqipmvheaa.png"
    ],
    "description": "",
    "isNewArrival": false,
    "isFeatured": false,
    "descriptionAr": "",
    "originalPrice": 2000,
    "name": "D&G Tshirt",
    "sizes": [
      {
        "size": "M",
        "inStock": true
      },
      {
        "inStock": true,
        "size": "XL"
      },
      {
        "size": "S",
        "inStock": true
      }
    ],
    "category": "T-Shirts",
    "subtitle": "TOUZA Casual Collection",
    "showOnHome": false,
    "nameAr": "تشيرت دولسى & غابانا ",
    "subtitleAr": "تشكيلة توزا الكاجوال الفاخرة",
    "colors": [
      {
        "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787078586/touza_products/ykvqosnktnxqipmvheaa.png",
        "name": "White",
        "sizes": [
          {
            "inStock": true,
            "size": "XL"
          }
        ],
        "hex": "#ffffff",
        "nameAr": "أبيض"
      },
      {
        "nameAr": "أسود",
        "name": "Black",
        "sizes": [
          {
            "inStock": true,
            "size": "S"
          },
          {
            "inStock": true,
            "size": "M"
          },
          {
            "size": "XL",
            "inStock": true
          }
        ],
        "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787078674/touza_products/gbtgcytqqj28onnc6edy.jpg",
        "hex": "#000000"
      }
    ],
    "categoryAr": "تيشيرت",
    "price": 1400
  },
  {
    "id": "prod-1787085131724",
    "originalPrice": 2000,
    "nameAr": "تشيرت بلمان ",
    "isNewArrival": false,
    "sizes": [
      {
        "size": "M",
        "inStock": true
      },
      {
        "size": "L",
        "inStock": true
      },
      {
        "size": "XL",
        "inStock": true
      }
    ],
    "description": "",
    "name": "balmain tshirt ",
    "subtitle": "TOUZA Casual Collection",
    "isFeatured": true,
    "colors": [
      {
        "sizes": [
          {
            "size": "M",
            "inStock": true
          },
          {
            "size": "L",
            "inStock": true
          },
          {
            "inStock": false,
            "size": "XXL"
          }
        ],
        "hex": "#111111",
        "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787089799/touza_products/crufmm4hv2qqhlgfma67.jpg",
        "name": "Black",
        "nameAr": "أسود"
      },
      {
        "name": "White",
        "nameAr": "أبيض",
        "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787089827/touza_products/zlnf6vatzc1aflqwfkv0.jpg",
        "hex": "#ffffff",
        "sizes": [
          {
            "size": "L",
            "inStock": true
          },
          {
            "inStock": true,
            "size": "XL"
          }
        ]
      }
    ],
    "descriptionAr": "",
    "price": 1400,
    "category": "Polos",
    "images": [
      "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787089854/touza_products/qbimomvpk5d2suhcq1xi.jpg"
    ],
    "categoryAr": "تشيرت بولو",
    "subtitleAr": "تشكيلة توزا الكاجوال الفاخرة",
    "showOnHome": true
  },
  {
    "id": "prod-1787152293645",
    "descriptionAr": "",
    "categoryAr": "قميص",
    "category": "Shirts",
    "images": [
      "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787152269/touza_products/thehxvnzg4jxhqpmr2u1.jpg"
    ],
    "subtitleAr": "تشكيلة توزا الكاجوال الفاخرة",
    "price": 1900,
    "description": "",
    "name": "Amiri shirt",
    "showOnHome": true,
    "colors": [
      {
        "nameAr": "أسود",
        "hex": "#111111",
        "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787152034/touza_products/tkmb9mxgrbpphxmdsnwd.png",
        "name": "Black",
        "sizes": [
          {
            "inStock": false,
            "size": "S"
          },
          {
            "inStock": true,
            "size": "M"
          },
          {
            "inStock": false,
            "size": "L"
          },
          {
            "inStock": true,
            "size": "XL"
          },
          {
            "size": "XXL",
            "inStock": true
          }
        ]
      },
      {
        "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787152110/touza_products/gq2pihrb8irzlrn66agn.jpg",
        "hex": "#ffffff",
        "name": "White",
        "nameAr": "أبيض",
        "sizes": [
          {
            "size": "M",
            "inStock": true
          }
        ]
      }
    ],
    "isNewArrival": true,
    "subtitle": "TOUZA Casual Collection",
    "isFeatured": true,
    "nameAr": "قميص أميرى",
    "sizes": [
      {
        "inStock": true,
        "size": "M"
      },
      {
        "size": "XL",
        "inStock": true
      },
      {
        "size": "XXL",
        "inStock": true
      }
    ]
  },
  {
    "id": "prod-1787152522367",
    "isNewArrival": true,
    "category": "Shirts",
    "images": [
      "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787152514/touza_products/qgndhh1xgskqcclrmjxd.png"
    ],
    "sizes": [
      {
        "size": "XL",
        "inStock": true
      },
      {
        "inStock": true,
        "size": "XXL"
      }
    ],
    "isFeatured": true,
    "description": "",
    "nameAr": "قميص ديور ",
    "price": 1900,
    "categoryAr": "قميص",
    "descriptionAr": "",
    "subtitleAr": "تشكيلة توزا الكاجوال الفاخرة",
    "subtitle": "TOUZA Casual Collection",
    "name": "Dior shirt",
    "colors": [
      {
        "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787152474/touza_products/ftqdcleqxqy7gtv2loci.png",
        "nameAr": "رومادى ",
        "sizes": [
          {
            "inStock": false,
            "size": "S"
          },
          {
            "inStock": false,
            "size": "M"
          },
          {
            "size": "L",
            "inStock": false
          },
          {
            "size": "XL",
            "inStock": true
          },
          {
            "size": "XXL",
            "inStock": true
          }
        ],
        "name": "Grey",
        "hex": "#ebebeb"
      }
    ],
    "showOnHome": true
  },
  {
    "id": "prod-1787174449423",
    "colors": [
      {
        "hex": "#111111",
        "sizes": [
          {
            "inStock": true,
            "size": "M"
          },
          {
            "size": "L",
            "inStock": true
          },
          {
            "inStock": true,
            "size": "XL"
          },
          {
            "size": "XXL",
            "inStock": true
          }
        ],
        "nameAr": "أسود",
        "name": "Black",
        "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787174328/touza_products/judcbqfu8twivvaupj9f.jpg"
      },
      {
        "name": "White",
        "sizes": [
          {
            "inStock": true,
            "size": "M"
          },
          {
            "inStock": true,
            "size": "L"
          },
          {
            "inStock": true,
            "size": "XL"
          },
          {
            "inStock": true,
            "size": "XXL"
          }
        ],
        "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787174375/touza_products/kyruoozimx1255m7etpe.png",
        "hex": "#ffffff",
        "nameAr": "أبيض "
      }
    ],
    "categoryAr": "ترنج ",
    "name": "Gucci suit ",
    "price": 1900,
    "subtitle": "TOUZA Casual Collection",
    "isNewArrival": true,
    "subtitleAr": "تشكيلة توزا الكاجوال الفاخرة",
    "nameAr": "ترنج غوتشى",
    "showOnHome": false,
    "description": "",
    "category": "Tracksuit",
    "isFeatured": false,
    "images": [
      "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787174431/touza_products/xpdgdkrw7pvc3o49ebo8.jpg"
    ],
    "descriptionAr": "",
    "sizes": [
      {
        "size": "M",
        "inStock": true
      },
      {
        "size": "L",
        "inStock": true
      },
      {
        "size": "XL",
        "inStock": true
      },
      {
        "inStock": true,
        "size": "XXL"
      }
    ]
  },
  {
    "id": "prod-1787175294850",
    "name": "Gucci suit",
    "isFeatured": false,
    "price": 1900,
    "descriptionAr": "",
    "subtitle": "TOUZA Casual Collection",
    "images": [
      "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787175242/touza_products/nvae3zopzhgsgsbknbpu.jpg"
    ],
    "subtitleAr": "تشكيلة توزا الكاجوال الفاخرة",
    "category": "Tracksuit",
    "sizes": [
      {
        "inStock": true,
        "size": "L"
      },
      {
        "inStock": true,
        "size": "XL"
      }
    ],
    "showOnHome": false,
    "colors": [
      {
        "nameAr": "أبيض",
        "name": "White",
        "sizes": [
          {
            "size": "S",
            "inStock": false
          },
          {
            "inStock": false,
            "size": "M"
          },
          {
            "inStock": true,
            "size": "L"
          },
          {
            "size": "XL",
            "inStock": true
          },
          {
            "size": "XXL",
            "inStock": false
          }
        ],
        "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787175093/touza_products/ydiln46jziiva7fj1lia.png",
        "hex": "#ffffff"
      },
      {
        "sizes": [
          {
            "size": "S",
            "inStock": false
          },
          {
            "size": "M",
            "inStock": false
          },
          {
            "size": "L",
            "inStock": false
          },
          {
            "inStock": true,
            "size": "XL"
          },
          {
            "inStock": false,
            "size": "XXL"
          }
        ],
        "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787175169/touza_products/ao9wi4sz6al4zvipzbbw.png",
        "hex": "#111111",
        "nameAr": "أسود",
        "name": "Blacl"
      }
    ],
    "nameAr": "ترنج غوتشى ",
    "description": "",
    "isNewArrival": true,
    "categoryAr": "ترنج "
  },
  {
    "id": "prod-1787177006021",
    "name": "Offwhite tshirt",
    "sizes": [
      {
        "inStock": true,
        "size": "L"
      },
      {
        "inStock": true,
        "size": "XXL"
      }
    ],
    "description": "",
    "isFeatured": false,
    "images": [
      "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787176974/touza_products/njxowcriojvvodyaalru.png",
      "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787176993/touza_products/rzbnmyuotibs27hcwpli.png"
    ],
    "subtitle": "TOUZA Casual Collection",
    "isNewArrival": false,
    "showOnHome": false,
    "descriptionAr": "",
    "nameAr": "تشيرت أوف وايت ",
    "price": 1200,
    "subtitleAr": "تشكيلة توزا الكاجوال الفاخرة",
    "category": "T-Shirts",
    "categoryAr": "تيشيرت",
    "originalPrice": 1800,
    "colors": [
      {
        "name": "Black",
        "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787176900/touza_products/qvsl6nmwood0cwragvgf.png",
        "hex": "#111111",
        "nameAr": "أسود",
        "sizes": [
          {
            "size": "S",
            "inStock": false
          },
          {
            "inStock": false,
            "size": "M"
          },
          {
            "size": "L",
            "inStock": true
          },
          {
            "size": "XL",
            "inStock": false
          },
          {
            "size": "XXL",
            "inStock": true
          }
        ]
      }
    ]
  },
  {
    "id": "prod-1787177608748",
    "description": "",
    "price": 1200,
    "originalPrice": 1800,
    "isNewArrival": false,
    "category": "T-Shirts",
    "descriptionAr": "",
    "images": [
      "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787177559/touza_products/rmczysjoc2rnuznudkdb.png",
      "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787177565/touza_products/njqflfklszb5wme6agh0.jpg",
      "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787177583/touza_products/h8bi3bulgvvrskn5rx8g.png",
      "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787177790/touza_products/sxvjedb4hwwycnewv57b.png"
    ],
    "isFeatured": false,
    "name": "Offwhite tshirt",
    "categoryAr": "تيشيرت",
    "colors": [
      {
        "name": "White",
        "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787177279/touza_products/cpvkofvhd9c91t4ntbuz.png",
        "sizes": [
          {
            "inStock": true,
            "size": "XL"
          },
          {
            "inStock": true,
            "size": "XXL"
          }
        ],
        "nameAr": "أبيض",
        "hex": "#ffffff"
      },
      {
        "sizes": [
          {
            "size": "M",
            "inStock": true
          },
          {
            "inStock": true,
            "size": "XL"
          },
          {
            "inStock": true,
            "size": "XXL"
          }
        ],
        "hex": "#000000",
        "nameAr": "أسود",
        "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787177344/touza_products/zbebrsui0fj6bw1zb51q.jpg",
        "name": "Black"
      }
    ],
    "sizes": [
      {
        "inStock": true,
        "size": "M"
      },
      {
        "inStock": true,
        "size": "XL"
      },
      {
        "size": "XXL",
        "inStock": true
      }
    ],
    "nameAr": "تشيرت اوف وايت ",
    "subtitle": "TOUZA Casual Collection",
    "showOnHome": false,
    "subtitleAr": "تشكيلة توزا الكاجوال الفاخرة"
  },
  {
    "id": "prod-1787359084543",
    "subtitle": "TOUZA Casual Collection",
    "descriptionAr": "",
    "nameAr": "ترنج غوتشى ",
    "isNewArrival": true,
    "categoryAr": "ترنج ",
    "colors": [
      {
        "sizes": [
          {
            "inStock": false,
            "size": "S"
          },
          {
            "size": "M",
            "inStock": false
          },
          {
            "inStock": false,
            "size": "L"
          },
          {
            "size": "XL",
            "inStock": true
          },
          {
            "inStock": false,
            "size": "XXL"
          }
        ],
        "name": "Green",
        "nameAr": "أخضر",
        "hex": "#38571a",
        "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787359066/touza_products/koyejasgo8hmadojqiee.png"
      },
      {
        "hex": "#ffffff",
        "sizes": [
          {
            "inStock": false,
            "size": "S"
          },
          {
            "size": "M",
            "inStock": true
          },
          {
            "size": "L",
            "inStock": true
          },
          {
            "inStock": true,
            "size": "XL"
          },
          {
            "size": "XXL",
            "inStock": false
          }
        ],
        "nameAr": "أبيض",
        "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787359145/touza_products/zbj3rej8u0dahfrcpjwm.png",
        "name": "White"
      }
    ],
    "subtitleAr": "تشكيلة توزا الكاجوال الفاخرة",
    "price": 1900,
    "showOnHome": false,
    "images": [
      "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787359286/touza_products/w3hnbszed2xyaufumxoh.png",
      "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787359207/touza_products/dvpnuorkbwpmrw09qwnc.jpg",
      "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787359307/touza_products/twzaxd0cwriqtzrz5x8m.jpg",
      "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787359325/touza_products/o6va0t0dxldvtzatb6li.jpg"
    ],
    "description": "",
    "isFeatured": false,
    "name": "Guuci suit",
    "category": "Tracksuit",
    "sizes": [
      {
        "inStock": true,
        "size": "M"
      },
      {
        "inStock": true,
        "size": "L"
      },
      {
        "inStock": true,
        "size": "XL"
      }
    ]
  },
  {
    "id": "prod-1787425680594",
    "description": "",
    "categoryAr": "تيشيرت",
    "colors": [
      {
        "name": "Black",
        "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787425669/touza_products/niy0weuclxajyta5hyqm.jpg",
        "nameAr": "أسود",
        "hex": "#111111",
        "sizes": [
          {
            "inStock": false,
            "size": "S"
          },
          {
            "size": "M",
            "inStock": false
          },
          {
            "size": "L",
            "inStock": false
          },
          {
            "inStock": true,
            "size": "XL"
          },
          {
            "size": "XXL",
            "inStock": false
          }
        ]
      }
    ],
    "showOnHome": false,
    "price": 1400,
    "subtitleAr": "تشكيلة توزا الكاجوال الفاخرة",
    "category": "T-Shirts",
    "nameAr": "تشيرت أميرى",
    "subtitle": "TOUZA Casual Collection",
    "descriptionAr": "",
    "name": "Amiri tshirt",
    "isNewArrival": false,
    "images": [
      "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787425646/touza_products/zyrjbml5dtefvdjy5csn.jpg"
    ],
    "sizes": [
      {
        "size": "XL",
        "inStock": true
      }
    ],
    "isFeatured": false,
    "originalPrice": 2000
  },
  {
    "id": "prod-1787531417896",
    "images": [
      "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787531315/touza_products/jzsglgklvdc3axjtrh3b.jpg",
      "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787531332/touza_products/yredmdk9fwqifkgc9uff.jpg",
      "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787531362/touza_products/xjxj8x8xhcen1nkko7mu.jpg",
      "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787531401/touza_products/uxa3hhpbkockygerf3nv.jpg"
    ],
    "showOnHome": true,
    "subtitleAr": "تشكيلة توزا الكاجوال الفاخرة",
    "categoryAr": "ترنج ",
    "price": 1900,
    "isNewArrival": true,
    "category": "Tracksuit",
    "originalPrice": 1900,
    "subtitle": "TOUZA Casual Collection",
    "nameAr": "ترنج كازابلانكا ",
    "isFeatured": true,
    "colors": [
      {
        "sizes": [
          {
            "inStock": false,
            "size": "S"
          },
          {
            "inStock": false,
            "size": "M"
          },
          {
            "inStock": true,
            "size": "L"
          },
          {
            "size": "XL",
            "inStock": true
          },
          {
            "inStock": true,
            "size": "XXL"
          }
        ],
        "hex": "#111111",
        "nameAr": "أسود",
        "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787531227/touza_products/uvmhptanrt5rhkb8prkk.jpg",
        "name": "Black"
      },
      {
        "nameAr": "أبيض",
        "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787531252/touza_products/mxru99vzgwsamtqbenhe.jpg",
        "hex": "#ffffff",
        "sizes": [
          {
            "size": "S",
            "inStock": false
          },
          {
            "size": "M",
            "inStock": true
          },
          {
            "size": "L",
            "inStock": false
          },
          {
            "inStock": true,
            "size": "XL"
          },
          {
            "inStock": true,
            "size": "XXL"
          }
        ],
        "name": "White"
      }
    ],
    "sizes": [
      {
        "size": "M",
        "inStock": true
      },
      {
        "size": "L",
        "inStock": true
      },
      {
        "inStock": true,
        "size": "XL"
      },
      {
        "inStock": true,
        "size": "XXL"
      }
    ],
    "description": "",
    "name": "Casablanca suit ",
    "descriptionAr": ""
  },
  {
    "id": "prod-1787592536234",
    "isNewArrival": true,
    "category": "suit",
    "price": 3800,
    "categoryAr": "سيت",
    "colors": [
      {
        "hex": "#a7c6ff",
        "sizes": [
          {
            "inStock": false,
            "size": "S"
          },
          {
            "size": "M",
            "inStock": true
          },
          {
            "size": "L",
            "inStock": true
          },
          {
            "inStock": true,
            "size": "XL"
          },
          {
            "inStock": false,
            "size": "XXL"
          }
        ],
        "name": "Blue",
        "nameAr": "أزرق ",
        "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787592093/touza_products/hvr0hnsrsdo7dcmnbs4s.png"
      },
      {
        "sizes": [
          {
            "size": "S",
            "inStock": false
          },
          {
            "size": "M",
            "inStock": true
          },
          {
            "inStock": true,
            "size": "L"
          },
          {
            "inStock": true,
            "size": "XL"
          },
          {
            "size": "XXL",
            "inStock": false
          }
        ],
        "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787592092/touza_products/gwmpceipni0jppyxb18i.png",
        "nameAr": "رومادى",
        "hex": "#c2c2c2",
        "name": "Gray"
      }
    ],
    "subtitleAr": "تشكيلة توزا الكاجوال الفاخرة",
    "nameAr": "سيت ديور ",
    "showOnHome": true,
    "description": "",
    "sizes": [
      {
        "size": "M",
        "inStock": true
      },
      {
        "inStock": true,
        "size": "L"
      },
      {
        "inStock": true,
        "size": "XL"
      }
    ],
    "name": "Dior suit ",
    "isFeatured": true,
    "descriptionAr": "",
    "subtitle": "TOUZA Casual Collection",
    "images": [
      "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787592308/touza_products/ylbiihdrwbry8w3mjkpn.jpg",
      "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787592346/touza_products/tffrwugdhrevei9o2lef.jpg",
      "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787592381/touza_products/hbf7e474hdkb2nrvhk6c.jpg",
      "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787592440/touza_products/emymamidffad9b28bkej.jpg",
      "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787592529/touza_products/lkvyj8kuluzcekupin7x.jpg"
    ]
  },
  {
    "id": "prod-1787593103515",
    "price": 3900,
    "description": "",
    "isFeatured": true,
    "descriptionAr": "",
    "isNewArrival": true,
    "images": [
      "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787593072/touza_products/qszejckhae92siir0j3v.jpg",
      "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787593097/touza_products/y2gn1xbrftcclx5myqvp.jpg"
    ],
    "subtitle": "TOUZA Casual Collection",
    "showOnHome": true,
    "category": "suit",
    "colors": [
      {
        "hex": "#583300",
        "nameAr": "بنى ",
        "name": "Brown",
        "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787592837/touza_products/wjmxnuukur7f0fz2vonj.jpg",
        "sizes": [
          {
            "inStock": true,
            "size": "S"
          },
          {
            "size": "M",
            "inStock": true
          },
          {
            "inStock": true,
            "size": "L"
          },
          {
            "inStock": false,
            "size": "XL"
          },
          {
            "inStock": false,
            "size": "XXL"
          }
        ]
      },
      {
        "name": "Gray ",
        "hex": "#5c5c5c",
        "sizes": [
          {
            "inStock": false,
            "size": "S"
          },
          {
            "size": "M",
            "inStock": false
          },
          {
            "inStock": true,
            "size": "L"
          },
          {
            "size": "XL",
            "inStock": false
          },
          {
            "inStock": true,
            "size": "XXL"
          }
        ],
        "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787593048/touza_products/pj2afau2blecnuyljf0o.png",
        "nameAr": "رومادى"
      }
    ],
    "subtitleAr": "تشكيلة توزا الكاجوال الفاخرة",
    "sizes": [
      {
        "size": "S",
        "inStock": true
      },
      {
        "size": "L",
        "inStock": true
      },
      {
        "inStock": true,
        "size": "M"
      },
      {
        "inStock": true,
        "size": "XXL"
      }
    ],
    "name": "Louisvuitton suit",
    "nameAr": "سوت تريكو لويس فيتون ",
    "categoryAr": "سيت"
  },
  {
    "id": "prod-1787709454865",
    "description": "",
    "subtitleAr": "تشكيلة توزا الكاجوال الفاخرة",
    "images": [
      "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787709329/touza_products/mmg8ovmnc42mxa5pp2gf.jpg",
      "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787709449/touza_products/syolzydudxjytkr2eys7.jpg",
      "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787709388/touza_products/h9q4ehnvu7ar0eao5zjl.jpg",
      "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787709425/touza_products/yzxvykrru3k0ijp82bme.jpg"
    ],
    "sizes": [
      {
        "size": "M",
        "inStock": true
      },
      {
        "size": "L",
        "inStock": true
      },
      {
        "inStock": true,
        "size": "XL"
      },
      {
        "size": "XXL",
        "inStock": true
      }
    ],
    "showOnHome": true,
    "category": "Tracksuit",
    "name": "Lacoste suit",
    "categoryAr": "ترنج ",
    "descriptionAr": "",
    "isFeatured": true,
    "nameAr": "ترنج لاكوست ",
    "isNewArrival": true,
    "price": 1900,
    "subtitle": "TOUZA Casual Collection",
    "colors": [
      {
        "sizes": [
          {
            "inStock": false,
            "size": "S"
          },
          {
            "size": "M",
            "inStock": true
          },
          {
            "inStock": true,
            "size": "L"
          },
          {
            "size": "XL",
            "inStock": true
          },
          {
            "size": "XXL",
            "inStock": true
          }
        ],
        "nameAr": "أبيض",
        "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787709226/touza_products/l5w2sqigt35xl8kjmk0i.png",
        "hex": "#ffffff",
        "name": "White"
      },
      {
        "sizes": [
          {
            "size": "S",
            "inStock": false
          },
          {
            "inStock": false,
            "size": "M"
          },
          {
            "size": "L",
            "inStock": false
          },
          {
            "size": "XL",
            "inStock": true
          },
          {
            "inStock": true,
            "size": "XXL"
          }
        ],
        "nameAr": "أسود",
        "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787709259/touza_products/cpymlyeuxb3wl91fzge4.png",
        "name": "Black",
        "hex": "#000000"
      }
    ]
  },
  {
    "id": "prod-1787760792575",
    "isFeatured": false,
    "images": [
      "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787760776/touza_products/htxg2wslpqmsv4uehrdd.png"
    ],
    "sizes": [
      {
        "size": "L",
        "inStock": true
      },
      {
        "size": "XL",
        "inStock": true
      }
    ],
    "subtitle": "TOUZA Casual Collection",
    "description": "",
    "isNewArrival": false,
    "price": 1200,
    "nameAr": "تشيرت بلنسياجا ",
    "subtitleAr": "تشكيلة توزا الكاجوال الفاخرة",
    "showOnHome": false,
    "originalPrice": 1800,
    "category": "T-Shirts",
    "name": "Balenciaga tshirt",
    "descriptionAr": "",
    "colors": [
      {
        "sizes": [
          {
            "inStock": false,
            "size": "S"
          },
          {
            "inStock": false,
            "size": "M"
          },
          {
            "size": "L",
            "inStock": true
          },
          {
            "inStock": true,
            "size": "XL"
          },
          {
            "inStock": false,
            "size": "XXL"
          }
        ],
        "hex": "#333333",
        "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787760718/touza_products/hyrh9z12xfmcf3gttazo.png",
        "name": "Gray",
        "nameAr": "رومادى "
      }
    ],
    "categoryAr": "تيشيرت"
  },
  {
    "id": "prod-1787761046837",
    "images": [
      "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787761037/touza_products/swdquudibfsmrnhfd5w9.png"
    ],
    "descriptionAr": "",
    "category": "T-Shirts",
    "sizes": [
      {
        "inStock": true,
        "size": "L"
      },
      {
        "inStock": true,
        "size": "XXL"
      }
    ],
    "isNewArrival": false,
    "categoryAr": "تيشيرت",
    "subtitleAr": "تشكيلة توزا الكاجوال الفاخرة",
    "originalPrice": 1800,
    "showOnHome": false,
    "nameAr": "تشيرت بلنسياجا ",
    "price": 1200,
    "description": "",
    "isFeatured": false,
    "subtitle": "TOUZA Casual Collection",
    "name": "Balenciaga tshirt ",
    "colors": [
      {
        "nameAr": "وردى فاتح",
        "hex": "#ee719e",
        "sizes": [
          {
            "size": "M",
            "inStock": false
          },
          {
            "size": "L",
            "inStock": true
          },
          {
            "size": "XL",
            "inStock": false
          },
          {
            "size": "XXL",
            "inStock": true
          }
        ],
        "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787761002/touza_products/ki3kkesswhr0gwv5ngx3.png",
        "name": "Light pink"
      }
    ]
  },
  {
    "id": "prod-1787844991527",
    "subtitle": "TOUZA Casual Collection",
    "colors": [
      {
        "sizes": [
          {
            "inStock": true,
            "size": "S"
          },
          {
            "inStock": true,
            "size": "M"
          },
          {
            "inStock": true,
            "size": "L"
          },
          {
            "inStock": true,
            "size": "XL"
          },
          {
            "inStock": false,
            "size": "XXL"
          }
        ],
        "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787844637/touza_products/ava31lf5rmmeuv5o5dq0.jpg",
        "name": "Brown",
        "hex": "#583300",
        "nameAr": "بنى "
      },
      {
        "name": "Yellow ",
        "nameAr": "أصفر",
        "sizes": [
          {
            "size": "S",
            "inStock": true
          },
          {
            "size": "M",
            "inStock": true
          },
          {
            "inStock": true,
            "size": "L"
          },
          {
            "inStock": true,
            "size": "XL"
          },
          {
            "inStock": false,
            "size": "XXL"
          }
        ],
        "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787844689/touza_products/by9e3chtzv2ek2rkmuph.jpg",
        "hex": "#fff994"
      },
      {
        "name": "Green",
        "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787844760/touza_products/teqlphztyk4hxqywbqww.jpg",
        "sizes": [
          {
            "inStock": true,
            "size": "S"
          },
          {
            "size": "M",
            "inStock": true
          },
          {
            "inStock": true,
            "size": "L"
          },
          {
            "size": "XL",
            "inStock": true
          },
          {
            "size": "XXL",
            "inStock": false
          }
        ],
        "hex": "#4e7a27",
        "nameAr": "أخضر"
      },
      {
        "name": "Orange",
        "sizes": [
          {
            "inStock": true,
            "size": "S"
          },
          {
            "inStock": true,
            "size": "M"
          },
          {
            "size": "L",
            "inStock": true
          },
          {
            "size": "XL",
            "inStock": true
          },
          {
            "size": "XXL",
            "inStock": false
          }
        ],
        "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787844848/touza_products/jldprjtbq0usw6j6npcv.png",
        "hex": "#ff6a00",
        "nameAr": "برتقالى "
      }
    ],
    "description": "",
    "isFeatured": false,
    "name": "Linen shirt",
    "nameAr": "قميص كتان ",
    "sizes": [
      {
        "size": "S",
        "inStock": true
      },
      {
        "size": "M",
        "inStock": true
      },
      {
        "size": "L",
        "inStock": true
      },
      {
        "inStock": true,
        "size": "Xl"
      }
    ],
    "showOnHome": false,
    "originalPrice": 1250,
    "subtitleAr": "تشكيلة توزا الكاجوال الفاخرة",
    "categoryAr": "قميص",
    "price": 850,
    "images": [
      "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787844896/touza_products/rvuxdbkld3qtwroagwng.jpg",
      "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787844916/touza_products/lhwiyyie2kak7i4s9nyh.jpg",
      "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787844968/touza_products/dtnlsuqlwcu1l1nwrjfn.jpg",
      "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787844985/touza_products/i2lpv7gf82ilj2sruatd.jpg"
    ],
    "isNewArrival": false,
    "descriptionAr": "",
    "category": "Shirts"
  },
  {
    "id": "prod-1787845225503",
    "name": "Louisvuttion shirt",
    "showOnHome": true,
    "nameAr": "قميص l&v ",
    "subtitle": "TOUZA Casual Collection",
    "sizes": [
      {
        "inStock": true,
        "size": "XL"
      },
      {
        "inStock": true,
        "size": "XXL"
      }
    ],
    "subtitleAr": "تشكيلة توزا الكاجوال الفاخرة",
    "isNewArrival": false,
    "categoryAr": "قميص",
    "descriptionAr": "",
    "colors": [
      {
        "sizes": [
          {
            "inStock": false,
            "size": "S"
          },
          {
            "inStock": false,
            "size": "M"
          },
          {
            "inStock": false,
            "size": "L"
          },
          {
            "inStock": true,
            "size": "XL"
          },
          {
            "size": "XXL",
            "inStock": true
          }
        ],
        "hex": "#111111",
        "nameAr": "أسو��",
        "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787845119/touza_products/dfqdykapwenurgfwmfcf.png",
        "name": "Black"
      }
    ],
    "description": "",
    "price": 2500,
    "isFeatured": true,
    "images": [
      "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787845220/touza_products/ujkyn8fa4cohtdun4gqc.jpg"
    ],
    "category": "Shirts"
  }
];
