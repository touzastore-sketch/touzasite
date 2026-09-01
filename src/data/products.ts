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
    "id": "prod-1786811765799",
    "nameAr": "تشيرت دولسي & غابانا ",
    "originalPrice": 2000,
    "subtitleAr": "تشكيلة توزا الكاجوال الفاخرة",
    "categoryAr": "تيشيرت",
    "description": "",
    "descriptionAr": "",
    "sizes": [
      {
        "size": "XL",
        "inStock": true
      }
    ],
    "price": 1400,
    "subtitle": "TOUZA Casual Collection",
    "name": "D&G Tshirt",
    "isNewArrival": false,
    "category": "T-Shirts",
    "showOnHome": true,
    "isFeatured": true,
    "images": [
      "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1786812106/touza_products/heiasuuelelpbbncehob.jpg"
    ],
    "colors": [
      {
        "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1786811748/touza_products/lafj3u1izwghqryeurym.jpg",
        "nameAr": "أسود",
        "hex": "#111111",
        "name": "Black"
      }
    ]
  },
  {
    "id": "prod-1787760792575",
    "images": [
      "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787760776/touza_products/htxg2wslpqmsv4uehrdd.png"
    ],
    "nameAr": "تشيرت بلنسياجا ",
    "originalPrice": 1800,
    "subtitleAr": "تشكيلة توزا الكاجوال الفاخرة",
    "categoryAr": "تيشيرت",
    "description": "",
    "descriptionAr": "",
    "showOnHome": false,
    "colors": [
      {
        "name": "Gray",
        "nameAr": "رومادى ",
        "hex": "#333333",
        "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787760718/touza_products/hyrh9z12xfmcf3gttazo.png",
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
        ]
      }
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
    "price": 1200,
    "subtitle": "TOUZA Casual Collection",
    "name": "Balenciaga tshirt",
    "isNewArrival": false,
    "category": "T-Shirts",
    "isFeatured": false
  },
  {
    "id": "prod-1787709454865",
    "images": [
      "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787709329/touza_products/mmg8ovmnc42mxa5pp2gf.jpg",
      "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787709449/touza_products/syolzydudxjytkr2eys7.jpg",
      "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787709388/touza_products/h9q4ehnvu7ar0eao5zjl.jpg",
      "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787709425/touza_products/yzxvykrru3k0ijp82bme.jpg"
    ],
    "nameAr": "ترنج لاكوست ",
    "subtitleAr": "تشكيلة توزا الكاجوال الفاخرة",
    "categoryAr": "ترنج ",
    "description": "",
    "descriptionAr": "",
    "showOnHome": true,
    "colors": [
      {
        "name": "White",
        "nameAr": "أبيض",
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
            "inStock": true
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
        "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787709226/touza_products/l5w2sqigt35xl8kjmk0i.png"
      },
      {
        "name": "Black",
        "nameAr": "أسود",
        "hex": "#000000",
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
            "size": "XL",
            "inStock": true
          },
          {
            "size": "XXL",
            "inStock": true
          }
        ],
        "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787709259/touza_products/cpymlyeuxb3wl91fzge4.png"
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
        "size": "XL",
        "inStock": true
      },
      {
        "size": "XXL",
        "inStock": true
      }
    ],
    "price": 1900,
    "subtitle": "TOUZA Casual Collection",
    "name": "Lacoste suit",
    "isNewArrival": true,
    "category": "Tracksuit",
    "isFeatured": true
  },
  {
    "id": "prod-1787077904145",
    "nameAr": "تشيرت لويفي ",
    "originalPrice": 2000,
    "subtitleAr": "تشكيلة توزا الكاجوال الفاخرة",
    "categoryAr": "تيشيرت",
    "description": "",
    "descriptionAr": "",
    "price": 1400,
    "subtitle": "TOUZA Casual Collection",
    "name": "Lowe tshirt ",
    "isNewArrival": false,
    "category": "T-Shirts",
    "showOnHome": true,
    "isFeatured": true,
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
        "size": "S"
      },
      {
        "size": "2XL",
        "inStock": true
      }
    ],
    "images": [
      "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787077892/touza_products/zoj99gx8c7hkqdc76wdo.jpg"
    ],
    "colors": [
      {
        "name": "Black",
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
        "hex": "#111111",
        "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787077769/touza_products/qthuoql3evljoyuknprq.png",
        "nameAr": "أسود"
      },
      {
        "nameAr": "رومادى ",
        "hex": "#c2c2c2",
        "name": "Grey",
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
        "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787077810/touza_products/u11mkhjz66tvlqjj8hif.jpg"
      },
      {
        "nameAr": "أبيض",
        "hex": "#ffffff",
        "sizes": [
          {
            "size": "S",
            "inStock": true
          },
          {
            "inStock": true,
            "size": "XL"
          }
        ],
        "name": "White",
        "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787077842/touza_products/aj5p8vd4kmkatssmigox.jpg"
      }
    ]
  },
  {
    "id": "prod-1787425680594",
    "nameAr": "تشيرت أميرى",
    "originalPrice": 2000,
    "subtitleAr": "تشكيلة توزا الكاجوال الفاخرة",
    "categoryAr": "تيشيرت",
    "description": "",
    "descriptionAr": "",
    "showOnHome": false,
    "sizes": [
      {
        "size": "XL",
        "inStock": true
      }
    ],
    "price": 1400,
    "subtitle": "TOUZA Casual Collection",
    "name": "Amiri tshirt",
    "isNewArrival": false,
    "category": "T-Shirts",
    "isFeatured": false,
    "images": [
      "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787425646/touza_products/zyrjbml5dtefvdjy5csn.jpg"
    ],
    "colors": [
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
        "name": "Black",
        "nameAr": "أسود",
        "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787425669/touza_products/niy0weuclxajyta5hyqm.jpg",
        "hex": "#111111"
      }
    ]
  },
  {
    "id": "prod-1787761046837",
    "images": [
      "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787761037/touza_products/swdquudibfsmrnhfd5w9.png"
    ],
    "nameAr": "تشيرت بلنسياجا ",
    "originalPrice": 1800,
    "subtitleAr": "تشكيلة توزا الكاجوال الفاخرة",
    "categoryAr": "تيشيرت",
    "description": "",
    "descriptionAr": "",
    "showOnHome": false,
    "colors": [
      {
        "name": "Light pink",
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
        "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787761002/touza_products/ki3kkesswhr0gwv5ngx3.png"
      }
    ],
    "sizes": [
      {
        "size": "L",
        "inStock": true
      },
      {
        "size": "XXL",
        "inStock": true
      }
    ],
    "price": 1200,
    "subtitle": "TOUZA Casual Collection",
    "name": "Balenciaga tshirt ",
    "isNewArrival": false,
    "category": "T-Shirts",
    "isFeatured": false
  },
  {
    "id": "prod-1787531417896",
    "nameAr": "ترنج كازابلانكا ",
    "subtitleAr": "تشكيلة توزا الكاجوال الفاخرة",
    "categoryAr": "ترنج ",
    "description": "",
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
        "size": "XL",
        "inStock": true
      },
      {
        "size": "XXL",
        "inStock": true
      }
    ],
    "price": 1900,
    "subtitle": "TOUZA Casual Collection",
    "name": "Casablanca suit ",
    "isNewArrival": true,
    "category": "Tracksuit",
    "isFeatured": true,
    "originalPrice": 1900,
    "images": [
      "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787531315/touza_products/jzsglgklvdc3axjtrh3b.jpg",
      "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787531332/touza_products/yredmdk9fwqifkgc9uff.jpg",
      "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787531362/touza_products/xjxj8x8xhcen1nkko7mu.jpg",
      "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787531401/touza_products/uxa3hhpbkockygerf3nv.jpg"
    ],
    "colors": [
      {
        "name": "Black",
        "hex": "#111111",
        "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787531227/touza_products/uvmhptanrt5rhkb8prkk.jpg",
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
            "size": "XL",
            "inStock": true
          },
          {
            "inStock": true,
            "size": "XXL"
          }
        ],
        "nameAr": "أسود"
      },
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
        "nameAr": "أبيض",
        "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787531252/touza_products/mxru99vzgwsamtqbenhe.jpg",
        "name": "White",
        "hex": "#ffffff"
      }
    ]
  },
  {
    "id": "prod-1787174449423",
    "subtitleAr": "تشكيلة توزا الكاجوال الفاخرة",
    "categoryAr": "ترنج ",
    "description": "",
    "descriptionAr": "",
    "showOnHome": false,
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
        "size": "XXL",
        "inStock": true
      }
    ],
    "price": 1900,
    "subtitle": "TOUZA Casual Collection",
    "name": "Gucci suit ",
    "isNewArrival": true,
    "category": "Tracksuit",
    "isFeatured": false,
    "nameAr": "ترنج غوتشى",
    "images": [
      "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787174431/touza_products/xpdgdkrw7pvc3o49ebo8.jpg"
    ],
    "colors": [
      {
        "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787174328/touza_products/judcbqfu8twivvaupj9f.jpg",
        "name": "Black",
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
        "hex": "#111111",
        "nameAr": "أسود"
      },
      {
        "hex": "#ffffff",
        "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787174375/touza_products/kyruoozimx1255m7etpe.png",
        "nameAr": "أبيض ",
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
        "name": "White"
      }
    ]
  },
  {
    "id": "prod-1786812584760",
    "nameAr": "قميص دولسى & غابانا ",
    "subtitleAr": "تشكيلة توزا الكاجوال الفاخرة",
    "categoryAr": "قميص",
    "description": "",
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
        "size": "XL",
        "inStock": true
      },
      {
        "size": "XXL",
        "inStock": true
      }
    ],
    "price": 1900,
    "subtitle": "TOUZA Casual Collection",
    "name": "D&g shirt",
    "isNewArrival": true,
    "category": "Shirts",
    "isFeatured": true,
    "images": [
      "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1786812577/touza_products/lq3h64gkjahy92h8cj18.png"
    ],
    "colors": [
      {
        "hex": "#ffffff",
        "nameAr": "أبيض",
        "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1786812533/touza_products/hcjrlg9juszfqwdyxwgz.png",
        "name": "White"
      },
      {
        "hex": "#000000",
        "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1786812546/touza_products/sefmhvttvpytsysantlk.jpg",
        "name": "Black",
        "nameAr": "أسود"
      }
    ]
  },
  {
    "id": "prod-1787078405082",
    "nameAr": "تشيرت دولسى & غابانا ",
    "originalPrice": 2000,
    "subtitleAr": "تشكيلة توزا الكاجوال الفاخرة",
    "categoryAr": "تيشيرت",
    "description": "",
    "descriptionAr": "",
    "showOnHome": true,
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
        "size": "XXL",
        "inStock": true
      }
    ],
    "price": 1400,
    "subtitle": "TOUZA Casual Collection",
    "name": "D&G Tshirt",
    "isNewArrival": false,
    "category": "T-Shirts",
    "isFeatured": true,
    "images": [
      "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787078362/touza_products/h5pda3dc2pdaaq35i6xq.jpg"
    ],
    "colors": [
      {
        "hex": "#ffffff",
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
            "size": "XL",
            "inStock": true
          },
          {
            "inStock": true,
            "size": "XXL"
          }
        ],
        "nameAr": "أبيض",
        "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787078274/touza_products/ccnyzqptolszj4fo9237.jpg",
        "name": "White"
      }
    ]
  },
  {
    "id": "prod-1786998444924",
    "nameAr": "تشيرت أميرى ",
    "originalPrice": 2000,
    "subtitleAr": "تشكيلة توزا الكاجوال الفاخرة",
    "categoryAr": "تيشيرت",
    "description": "",
    "descriptionAr": "",
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
        "size": "XXL",
        "inStock": true
      }
    ],
    "price": 1400,
    "subtitle": "TOUZA Casual Collection",
    "name": "Amiri tshirt",
    "isNewArrival": false,
    "category": "T-Shirts",
    "showOnHome": false,
    "isFeatured": false,
    "images": [
      "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1786998439/touza_products/mnunskoz4rai0hdcposq.png"
    ],
    "colors": [
      {
        "hex": "#111111",
        "name": "Black",
        "nameAr": "أسود",
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
            "size": "XL",
            "inStock": true
          },
          {
            "inStock": true,
            "size": "XXL"
          }
        ],
        "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1786998405/touza_products/pf1pn5hkcob6ewj49zmf.png"
      },
      {
        "name": "White",
        "nameAr": "أبيض",
        "sizes": [
          {
            "inStock": true,
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
            "inStock": false,
            "size": "XL"
          },
          {
            "inStock": true,
            "size": "XXL"
          }
        ],
        "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1786998317/touza_products/dsuipth6oaboyaoz46vk.png",
        "hex": "#ffffff"
      }
    ]
  },
  {
    "id": "prod-1787177006021",
    "nameAr": "تشيرت أوف وايت ",
    "originalPrice": 1800,
    "subtitleAr": "تشكيلة توزا الكاجوال الفاخرة",
    "categoryAr": "تيشيرت",
    "description": "",
    "descriptionAr": "",
    "showOnHome": false,
    "sizes": [
      {
        "size": "L",
        "inStock": true
      },
      {
        "size": "XXL",
        "inStock": true
      }
    ],
    "price": 1200,
    "subtitle": "TOUZA Casual Collection",
    "name": "Offwhite tshirt",
    "isNewArrival": false,
    "category": "T-Shirts",
    "isFeatured": false,
    "images": [
      "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787176974/touza_products/njxowcriojvvodyaalru.png",
      "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787176993/touza_products/rzbnmyuotibs27hcwpli.png"
    ],
    "colors": [
      {
        "hex": "#111111",
        "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787176900/touza_products/qvsl6nmwood0cwragvgf.png",
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
            "inStock": false,
            "size": "XL"
          },
          {
            "size": "XXL",
            "inStock": true
          }
        ],
        "name": "Black",
        "nameAr": "أسود"
      }
    ]
  },
  {
    "id": "prod-1787077515769",
    "nameAr": "تشيرت ديسكورد",
    "originalPrice": 2000,
    "subtitleAr": "تشكيلة توزا الكاجوال الفاخرة",
    "categoryAr": "تيشيرت",
    "description": "",
    "descriptionAr": "",
    "sizes": [
      {
        "size": "M",
        "inStock": true
      },
      {
        "size": "XL",
        "inStock": true
      }
    ],
    "price": 1400,
    "subtitle": "TOUZA Casual Collection",
    "name": "Dsquared tshirt ",
    "isNewArrival": false,
    "category": "T-Shirts",
    "showOnHome": false,
    "isFeatured": false,
    "images": [
      "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787077508/touza_products/d6qfr9satkyrl1azryis.jpg"
    ],
    "colors": [
      {
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
            "size": "XXL",
            "inStock": false
          }
        ],
        "name": "Black",
        "hex": "#111111",
        "nameAr": "أسود"
      }
    ]
  },
  {
    "id": "prod-1787359084543",
    "nameAr": "ترنج غوتشى ",
    "subtitleAr": "تشكيلة توزا الكاجوال الفاخرة",
    "categoryAr": "ترنج ",
    "description": "",
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
        "size": "XXL",
        "inStock": true
      }
    ],
    "price": 1900,
    "subtitle": "TOUZA Casual Collection",
    "name": "Guuci suit",
    "isNewArrival": true,
    "category": "Tracksuit",
    "showOnHome": false,
    "isFeatured": false,
    "images": [
      "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787359286/touza_products/w3hnbszed2xyaufumxoh.png",
      "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787359207/touza_products/dvpnuorkbwpmrw09qwnc.jpg",
      "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787359307/touza_products/twzaxd0cwriqtzrz5x8m.jpg",
      "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787359325/touza_products/o6va0t0dxldvtzatb6li.jpg"
    ],
    "colors": [
      {
        "name": "Green",
        "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787359066/touza_products/koyejasgo8hmadojqiee.png",
        "nameAr": "أخضر",
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
            "inStock": true
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
        "hex": "#38571a"
      },
      {
        "hex": "#ffffff",
        "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787359145/touza_products/zbj3rej8u0dahfrcpjwm.png",
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
            "size": "XL",
            "inStock": true
          },
          {
            "size": "XXL",
            "inStock": false
          }
        ],
        "nameAr": "أبيض",
        "name": "White"
      }
    ]
  },
  {
    "id": "prod-1787177608748",
    "nameAr": "تشيرت اوف وايت ",
    "originalPrice": 1800,
    "subtitleAr": "تشكيلة توزا الكاجوال الفاخرة",
    "categoryAr": "تيشيرت",
    "description": "",
    "descriptionAr": "",
    "showOnHome": false,
    "sizes": [
      {
        "size": "M",
        "inStock": true
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
    "price": 1200,
    "subtitle": "TOUZA Casual Collection",
    "name": "Offwhite tshirt",
    "isNewArrival": false,
    "category": "T-Shirts",
    "isFeatured": false,
    "images": [
      "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787177559/touza_products/rmczysjoc2rnuznudkdb.png",
      "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787177565/touza_products/njqflfklszb5wme6agh0.jpg",
      "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787177583/touza_products/h8bi3bulgvvrskn5rx8g.png",
      "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787177790/touza_products/sxvjedb4hwwycnewv57b.png"
    ],
    "colors": [
      {
        "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787177279/touza_products/cpvkofvhd9c91t4ntbuz.png",
        "hex": "#ffffff",
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
        "nameAr": "أبيض",
        "name": "White"
      },
      {
        "nameAr": "أسود",
        "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787177344/touza_products/zbebrsui0fj6bw1zb51q.jpg",
        "sizes": [
          {
            "size": "M",
            "inStock": true
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
        "name": "Black",
        "hex": "#000000"
      }
    ]
  },
  {
    "id": "prod-1787152522367",
    "nameAr": "قميص ديور ",
    "subtitleAr": "تشكيلة توزا الكاجوال الفاخرة",
    "categoryAr": "قميص",
    "description": "",
    "descriptionAr": "",
    "showOnHome": true,
    "sizes": [
      {
        "size": "XL",
        "inStock": true
      },
      {
        "size": "XXL",
        "inStock": true
      }
    ],
    "price": 1900,
    "subtitle": "TOUZA Casual Collection",
    "name": "Dior shirt",
    "isNewArrival": true,
    "category": "Shirts",
    "isFeatured": true,
    "images": [
      "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787152514/touza_products/qgndhh1xgskqcclrmjxd.png"
    ],
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
            "size": "XXL",
            "inStock": true
          }
        ],
        "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787152474/touza_products/ftqdcleqxqy7gtv2loci.png",
        "nameAr": "رومادى ",
        "name": "Grey",
        "hex": "#ebebeb"
      }
    ]
  },
  {
    "id": "prod-1787085131724",
    "nameAr": "تشيرت بلمان ",
    "originalPrice": 2000,
    "subtitleAr": "تشكيلة توزا الكاجوال الفاخرة",
    "categoryAr": "تشيرت بولو",
    "description": "",
    "descriptionAr": "",
    "showOnHome": true,
    "price": 1400,
    "subtitle": "TOUZA Casual Collection",
    "name": "balmain tshirt ",
    "isNewArrival": false,
    "category": "Polos",
    "isFeatured": true,
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
    ],
    "images": [
      "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787089854/touza_products/qbimomvpk5d2suhcq1xi.jpg"
    ],
    "colors": [
      {
        "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787089799/touza_products/crufmm4hv2qqhlgfma67.jpg",
        "name": "Black",
        "nameAr": "أسود",
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
            "size": "XXL",
            "inStock": false
          }
        ],
        "hex": "#111111"
      },
      {
        "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787089827/touza_products/zlnf6vatzc1aflqwfkv0.jpg",
        "hex": "#ffffff",
        "name": "White",
        "nameAr": "أبيض",
        "sizes": [
          {
            "size": "L",
            "inStock": true
          },
          {
            "size": "XL",
            "inStock": true
          }
        ]
      }
    ]
  },
  {
    "id": "prod-1787152293645",
    "nameAr": "قميص أميرى",
    "subtitleAr": "تشكيلة توزا الكاجوال الفاخرة",
    "categoryAr": "قميص",
    "description": "",
    "descriptionAr": "",
    "showOnHome": true,
    "sizes": [
      {
        "size": "M",
        "inStock": true
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
    "price": 1900,
    "subtitle": "TOUZA Casual Collection",
    "name": "Amiri shirt",
    "isNewArrival": true,
    "category": "Shirts",
    "isFeatured": true,
    "images": [
      "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787152269/touza_products/thehxvnzg4jxhqpmr2u1.jpg"
    ],
    "colors": [
      {
        "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787152034/touza_products/tkmb9mxgrbpphxmdsnwd.png",
        "name": "Black",
        "sizes": [
          {
            "size": "S",
            "inStock": false
          },
          {
            "inStock": true,
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
        "hex": "#111111",
        "nameAr": "أسود"
      },
      {
        "sizes": [
          {
            "size": "M",
            "inStock": true
          }
        ],
        "name": "White",
        "nameAr": "أبيض",
        "hex": "#ffffff",
        "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787152110/touza_products/gq2pihrb8irzlrn66agn.jpg"
      }
    ]
  },
  {
    "id": "prod-1787076622253",
    "originalPrice": 1100,
    "subtitleAr": "تشكيلة توزا الكاجوال الفاخرة",
    "categoryAr": "تيشيرت",
    "description": "",
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
        "size": "XL",
        "inStock": true
      },
      {
        "size": "XXL",
        "inStock": true
      }
    ],
    "price": 850,
    "subtitle": "TOUZA Casual Collection",
    "isNewArrival": false,
    "category": "T-Shirts",
    "isFeatured": true,
    "nameAr": "تشيرت أميرى",
    "name": "Amiri tshirt",
    "images": [
      "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787077932/touza_products/xymtefafcacnyyhghhlt.png"
    ],
    "colors": [
      {
        "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787076547/touza_products/p9rnldygrhqr7rftg7cg.png",
        "name": "Black",
        "hex": "#111111",
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
            "size": "XL",
            "inStock": true
          },
          {
            "size": "XXL",
            "inStock": true
          }
        ],
        "nameAr": "أسود"
      },
      {
        "nameAr": "أبيض",
        "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787076575/touza_products/k38u8dfq1p91m8afav94.png",
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
        "hex": "#ffffff",
        "name": "White"
      }
    ]
  },
  {
    "id": "prod-1787078804876",
    "nameAr": "تشيرت دولسى & غابانا ",
    "originalPrice": 2000,
    "subtitleAr": "تشكيلة توزا الكاجوال الفاخرة",
    "categoryAr": "تيشيرت",
    "description": "",
    "descriptionAr": "",
    "price": 1400,
    "subtitle": "TOUZA Casual Collection",
    "name": "D&G Tshirt",
    "isNewArrival": false,
    "category": "T-Shirts",
    "showOnHome": false,
    "isFeatured": false,
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
        "size": "S",
        "inStock": true
      }
    ],
    "colors": [
      {
        "hex": "#ffffff",
        "nameAr": "أبيض",
        "name": "White",
        "sizes": [
          {
            "inStock": true,
            "size": "XL"
          }
        ],
        "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787078586/touza_products/ykvqosnktnxqipmvheaa.png"
      },
      {
        "hex": "#000000",
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
            "inStock": true,
            "size": "XL"
          }
        ],
        "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787078674/touza_products/gbtgcytqqj28onnc6edy.jpg",
        "nameAr": "أسود",
        "name": "Black"
      }
    ],
    "images": [
      "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787078586/touza_products/ykvqosnktnxqipmvheaa.png"
    ]
  },
  {
    "id": "prod-1787845225503",
    "images": [
      "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787845220/touza_products/ujkyn8fa4cohtdun4gqc.jpg"
    ],
    "nameAr": "قميص l&v ",
    "subtitleAr": "تشكيلة توزا الكاجوال الفاخرة",
    "categoryAr": "قميص",
    "description": "",
    "descriptionAr": "",
    "showOnHome": true,
    "colors": [
      {
        "name": "Black",
        "nameAr": "أسو��",
        "hex": "#111111",
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
            "size": "XL",
            "inStock": true
          },
          {
            "size": "XXL",
            "inStock": true
          }
        ],
        "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787845119/touza_products/dfqdykapwenurgfwmfcf.png"
      }
    ],
    "sizes": [
      {
        "size": "XL",
        "inStock": true
      },
      {
        "size": "XXL",
        "inStock": true
      }
    ],
    "price": 2500,
    "subtitle": "TOUZA Casual Collection",
    "name": "Louisvuttion shirt",
    "isNewArrival": false,
    "category": "Shirts",
    "isFeatured": true
  },
  {
    "id": "prod-1787175294850",
    "nameAr": "ترنج غوتشى ",
    "subtitleAr": "تشكيلة توزا الكاجوال الفاخرة",
    "categoryAr": "ترنج ",
    "description": "",
    "descriptionAr": "",
    "showOnHome": false,
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
        "size": "XXL",
        "inStock": true
      }
    ],
    "price": 1900,
    "subtitle": "TOUZA Casual Collection",
    "name": "Gucci suit",
    "isNewArrival": true,
    "category": "Tracksuit",
    "isFeatured": false,
    "images": [
      "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787175242/touza_products/nvae3zopzhgsgsbknbpu.jpg"
    ],
    "colors": [
      {
        "name": "White",
        "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787175093/touza_products/ydiln46jziiva7fj1lia.png",
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
        "hex": "#ffffff",
        "nameAr": "أبيض"
      },
      {
        "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787175169/touza_products/ao9wi4sz6al4zvipzbbw.png",
        "name": "Blacl",
        "hex": "#111111",
        "nameAr": "أسود"
      }
    ]
  },
  {
    "id": "prod-1787844991527",
    "images": [
      "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787844896/touza_products/rvuxdbkld3qtwroagwng.jpg",
      "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787844916/touza_products/lhwiyyie2kak7i4s9nyh.jpg",
      "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787844968/touza_products/dtnlsuqlwcu1l1nwrjfn.jpg",
      "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787844985/touza_products/i2lpv7gf82ilj2sruatd.jpg"
    ],
    "nameAr": "قميص كتان ",
    "originalPrice": 1250,
    "subtitleAr": "تشكيلة توزا الكاجوال الفاخرة",
    "categoryAr": "قميص",
    "description": "",
    "descriptionAr": "",
    "showOnHome": false,
    "colors": [
      {
        "name": "Brown",
        "nameAr": "بنى ",
        "hex": "#583300",
        "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787844637/touza_products/ava31lf5rmmeuv5o5dq0.jpg",
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
            "size": "XL",
            "inStock": true
          },
          {
            "size": "XXL",
            "inStock": false
          }
        ]
      },
      {
        "name": "Yellow ",
        "nameAr": "أصفر",
        "hex": "#fff994",
        "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787844689/touza_products/by9e3chtzv2ek2rkmuph.jpg",
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
            "size": "XL",
            "inStock": true
          },
          {
            "size": "XXL",
            "inStock": false
          }
        ]
      },
      {
        "name": "Green",
        "nameAr": "أخضر",
        "hex": "#4e7a27",
        "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787844760/touza_products/teqlphztyk4hxqywbqww.jpg",
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
            "size": "XL",
            "inStock": true
          },
          {
            "size": "XXL",
            "inStock": false
          }
        ]
      },
      {
        "name": "Orange",
        "nameAr": "برتقالى ",
        "hex": "#ff6a00",
        "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787844848/touza_products/jldprjtbq0usw6j6npcv.png",
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
            "size": "XL",
            "inStock": true
          },
          {
            "size": "XXL",
            "inStock": false
          }
        ]
      }
    ],
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
        "size": "Xl",
        "inStock": true
      }
    ],
    "price": 850,
    "subtitle": "TOUZA Casual Collection",
    "name": "Linen shirt",
    "isNewArrival": false,
    "category": "Shirts",
    "isFeatured": false
  },
  {
    "id": "prod-1786997865728",
    "nameAr": "تشيرت ديور ",
    "originalPrice": 2000,
    "subtitleAr": "تشكيلة توزا الكاجوال الفاخرة",
    "categoryAr": "تيشيرت",
    "description": "",
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
        "size": "XL",
        "inStock": true
      }
    ],
    "price": 1400,
    "subtitle": "TOUZA Casual Collection",
    "name": "Dior tshirt",
    "isNewArrival": false,
    "category": "T-Shirts",
    "isFeatured": true,
    "images": [
      "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1786997914/touza_products/apvwbqbvmjl9hbhjmoip.jpg"
    ],
    "colors": [
      {
        "hex": "#111111",
        "name": "Black",
        "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1786997826/touza_products/sac5mz7v5u4kxyw9vnva.jpg",
        "nameAr": "أسود"
      }
    ]
  },
  {
    "id": "prod-1786807489391",
    "originalPrice": 6750,
    "subtitleAr": "تشكيلة توزا الكاجوال الفاخرة",
    "categoryAr": "سيت",
    "description": "",
    "descriptionAr": "",
    "showOnHome": true,
    "sizes": [
      {
        "size": "L",
        "inStock": true
      },
      {
        "size": "XXL",
        "inStock": true
      }
    ],
    "price": 5000,
    "subtitle": "TOUZA Casual Collection",
    "isNewArrival": true,
    "category": "suit",
    "isFeatured": true,
    "nameAr": "سرت لويس فيتون",
    "name": "Suit louisvitton",
    "images": [
      "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1786807455/touza_products/ptb2bjxn9eawieshdumu.jpg",
      "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1786807466/touza_products/aq8tezmxfgx5g5lksn0y.jpg",
      "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1786807480/touza_products/gbbqszuri6nj36jd3hum.jpg"
    ],
    "colors": [
      {
        "nameAr": "افتراضي",
        "name": "Default",
        "hex": "#a7c6ff",
        "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1786807455/touza_products/ptb2bjxn9eawieshdumu.jpg"
      }
    ]
  },
  {
    "id": "prod-1786828546097",
    "nameAr": "وايد ليج بلنسياجا ",
    "originalPrice": 3500,
    "subtitleAr": "تشكيلة توزا الكاجوال الفاخرة",
    "categoryAr": "بنطلون",
    "description": "",
    "descriptionAr": "",
    "showOnHome": true,
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
        "size": "Xl",
        "inStock": true
      },
      {
        "size": "XXL",
        "inStock": true
      }
    ],
    "price": 2625,
    "subtitle": "TOUZA Casual Collection",
    "name": "Balenciaga wideleg",
    "isNewArrival": false,
    "category": "Pants",
    "isFeatured": true,
    "images": [
      "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1786828539/touza_products/lu9wvhmrqexytjkuer8i.png"
    ],
    "colors": [
      {
        "nameAr": "أزرق ",
        "name": "Jeans ",
        "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1786828481/touza_products/imu3afnmz4x8sd3fscg8.png",
        "hex": "#0042a9"
      }
    ]
  },
  {
    "id": "prod-1787593103515",
    "nameAr": "سوت تريكو لويس فيتون ",
    "subtitleAr": "تشكيلة توزا الكاجوال الفاخرة",
    "categoryAr": "سيت",
    "description": "",
    "descriptionAr": "",
    "showOnHome": true,
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
        "size": "M",
        "inStock": true
      },
      {
        "size": "XXL",
        "inStock": true
      }
    ],
    "price": 3900,
    "subtitle": "TOUZA Casual Collection",
    "isNewArrival": true,
    "category": "suit",
    "isFeatured": true,
    "name": "Louisvuitton suit",
    "images": [
      "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787593072/touza_products/qszejckhae92siir0j3v.jpg",
      "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787593097/touza_products/y2gn1xbrftcclx5myqvp.jpg"
    ],
    "colors": [
      {
        "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787592837/touza_products/wjmxnuukur7f0fz2vonj.jpg",
        "nameAr": "بنى ",
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
            "inStock": false,
            "size": "XL"
          },
          {
            "size": "XXL",
            "inStock": false
          }
        ],
        "hex": "#583300",
        "name": "Brown"
      },
      {
        "nameAr": "رومادى",
        "hex": "#5c5c5c",
        "name": "Gray ",
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
        "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787593048/touza_products/pj2afau2blecnuyljf0o.png"
      }
    ]
  },
  {
    "id": "prod-1786808736332",
    "nameAr": "تشيرت بلمان",
    "originalPrice": 1900,
    "subtitleAr": "تشكيلة توزا الكاجوال الفاخرة",
    "categoryAr": "تيشيرت",
    "description": "",
    "descriptionAr": "",
    "showOnHome": true,
    "price": 900,
    "subtitle": "TOUZA Casual Collection",
    "name": "Balmain tshirt",
    "isNewArrival": false,
    "category": "T-Shirts",
    "isFeatured": true,
    "sizes": [
      {
        "inStock": true,
        "size": "s"
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
        "size": "xxl",
        "inStock": true
      }
    ],
    "images": [
      "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1786809185/touza_products/et2olhe9fa5ndwtgz4fl.png"
    ],
    "colors": [
      {
        "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1786808714/touza_products/wjybbowlh99dgw3gpqfi.png",
        "nameAr": "أسود",
        "hex": "#111111",
        "name": "Black"
      },
      {
        "name": "White",
        "hex": "#ffffff",
        "nameAr": "أبيض",
        "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1786808728/touza_products/n90sjnrydbe1idlqgmsl.png"
      }
    ]
  },
  {
    "id": "prod-1787592536234",
    "nameAr": "سيت ديور ",
    "subtitleAr": "تشكيلة توزا الكاجوال الفاخرة",
    "categoryAr": "سيت",
    "description": "",
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
        "size": "XL",
        "inStock": true
      }
    ],
    "price": 3800,
    "subtitle": "TOUZA Casual Collection",
    "name": "Dior suit ",
    "isNewArrival": true,
    "category": "suit",
    "isFeatured": true,
    "images": [
      "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787592308/touza_products/ylbiihdrwbry8w3mjkpn.jpg",
      "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787592346/touza_products/tffrwugdhrevei9o2lef.jpg",
      "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787592381/touza_products/hbf7e474hdkb2nrvhk6c.jpg",
      "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787592440/touza_products/emymamidffad9b28bkej.jpg",
      "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787592529/touza_products/lkvyj8kuluzcekupin7x.jpg"
    ],
    "colors": [
      {
        "name": "Blue",
        "hex": "#a7c6ff",
        "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787592093/touza_products/hvr0hnsrsdo7dcmnbs4s.png",
        "nameAr": "أزرق ",
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
        ]
      },
      {
        "name": "Gray",
        "hex": "#c2c2c2",
        "nameAr": "رومادى",
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
            "inStock": true,
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
        "imageUrl": "https://res.cloudinary.com/qazdrpcx/image/upload/f_auto,q_auto/v1787592092/touza_products/gwmpceipni0jppyxb18i.png"
      }
    ]
  }
];
