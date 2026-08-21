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
    id: "prod-1786807489391",
    categoryAr: "سيت",
    subtitle: "TOUZA Casual Collection",
    isFeatured: true,
    nameAr: "سرت لويس فيتون",
    price: 5000,
    showOnHome: true,
    category: "suit",
    descriptionAr: "",
    originalPrice: 6750,
    colors: [
      {
        imageUrl: "https://res.cloudinary.com/qazdrpcx/image/upload/v1786807455/touza_products/ptb2bjxn9eawieshdumu.jpg",
        name: "Default",
        nameAr: "افتراضي",
        hex: "#a7c6ff"
      }
    ],
    subtitleAr: "تشكيلة توزا الكاجوال الفاخرة",
    isNewArrival: true,
    description: "",
    images: [
      "https://res.cloudinary.com/qazdrpcx/image/upload/v1786807455/touza_products/ptb2bjxn9eawieshdumu.jpg",
      "https://res.cloudinary.com/qazdrpcx/image/upload/v1786807466/touza_products/aq8tezmxfgx5g5lksn0y.jpg",
      "https://res.cloudinary.com/qazdrpcx/image/upload/v1786807480/touza_products/gbbqszuri6nj36jd3hum.jpg"
    ],
    sizes: [
      {
        inStock: true,
        size: "L"
      },
      {
        inStock: true,
        size: "XXL"
      }
    ],
    name: "Suit louisvitton"
  },
  {
    id: "prod-1786808736332",
    categoryAr: "تيشيرت",
    isNewArrival: false,
    isFeatured: true,
    price: 900,
    showOnHome: true,
    nameAr: "تشيرت بلمان",
    subtitle: "TOUZA Casual Collection",
    originalPrice: 1900,
    descriptionAr: "",
    category: "T-Shirts",
    colors: [
      {
        imageUrl: "https://res.cloudinary.com/qazdrpcx/image/upload/v1786808714/touza_products/wjybbowlh99dgw3gpqfi.png",
        hex: "#111111",
        nameAr: "أسود",
        name: "Black"
      },
      {
        hex: "#ffffff",
        nameAr: "أبيض",
        name: "White",
        imageUrl: "https://res.cloudinary.com/qazdrpcx/image/upload/v1786808728/touza_products/n90sjnrydbe1idlqgmsl.png"
      }
    ],
    subtitleAr: "تشكيلة توزا الكاجوال الفاخرة",
    images: [
      "https://res.cloudinary.com/qazdrpcx/image/upload/v1786809185/touza_products/et2olhe9fa5ndwtgz4fl.png"
    ],
    name: "Balmain tshirt",
    sizes: [
      {
        size: "s",
        inStock: true
      },
      {
        inStock: true,
        size: "m"
      },
      {
        inStock: true,
        size: "l"
      },
      {
        inStock: true,
        size: "xl"
      },
      {
        inStock: true,
        size: "xxl"
      }
    ],
    description: ""
  },
  {
    id: "prod-1786811765799",
    isFeatured: true,
    showOnHome: true,
    descriptionAr: "",
    price: 1400,
    isNewArrival: false,
    category: "T-Shirts",
    nameAr: "تشيرت دولسي & غابانا ",
    name: "D&G Tshirt",
    colors: [
      {
        name: "Black",
        imageUrl: "https://res.cloudinary.com/qazdrpcx/image/upload/v1786811748/touza_products/lafj3u1izwghqryeurym.jpg",
        hex: "#111111",
        nameAr: "أسود"
      }
    ],
    subtitle: "TOUZA Casual Collection",
    categoryAr: "تيشيرت",
    sizes: [
      {
        size: "XL",
        inStock: true
      }
    ],
    originalPrice: 2000,
    subtitleAr: "تشكيلة توزا الكاجوال الفاخرة",
    description: "",
    images: [
      "https://res.cloudinary.com/qazdrpcx/image/upload/v1786812106/touza_products/heiasuuelelpbbncehob.jpg"
    ]
  },
  {
    id: "prod-1786812584760",
    subtitle: "TOUZA Casual Collection",
    nameAr: "قميص دولسى & غابانا ",
    price: 1900,
    name: "D&g shirt",
    description: "",
    showOnHome: true,
    isFeatured: true,
    images: [
      "https://res.cloudinary.com/qazdrpcx/image/upload/v1786812577/touza_products/lq3h64gkjahy92h8cj18.png"
    ],
    subtitleAr: "تشكيلة توزا الكاجوال الفاخرة",
    descriptionAr: "",
    sizes: [
      {
        inStock: true,
        size: "M"
      },
      {
        inStock: true,
        size: "L"
      },
      {
        inStock: true,
        size: "XL"
      },
      {
        inStock: true,
        size: "XXL"
      }
    ],
    colors: [
      {
        hex: "#ffffff",
        name: "White",
        imageUrl: "https://res.cloudinary.com/qazdrpcx/image/upload/v1786812533/touza_products/hcjrlg9juszfqwdyxwgz.png",
        nameAr: "أبيض"
      },
      {
        name: "Black",
        hex: "#000000",
        imageUrl: "https://res.cloudinary.com/qazdrpcx/image/upload/v1786812546/touza_products/sefmhvttvpytsysantlk.jpg",
        nameAr: "أسود"
      }
    ],
    categoryAr: "قميص",
    category: "Shirts",
    isNewArrival: true
  },
  {
    id: "prod-1786828546097",
    categoryAr: "بنطلون",
    description: "",
    isFeatured: true,
    isNewArrival: false,
    showOnHome: true,
    nameAr: "وايد ليج بلنسياجا ",
    name: "Balenciaga wideleg",
    price: 2625,
    subtitle: "TOUZA Casual Collection",
    subtitleAr: "تشكيلة توزا الكاجوال الفاخرة",
    images: [
      "https://res.cloudinary.com/qazdrpcx/image/upload/v1786828539/touza_products/lu9wvhmrqexytjkuer8i.png"
    ],
    sizes: [
      {
        size: "S",
        inStock: true
      },
      {
        size: "M",
        inStock: true
      },
      {
        size: "L",
        inStock: true
      },
      {
        size: "Xl",
        inStock: true
      },
      {
        inStock: true,
        size: "XXL"
      }
    ],
    category: "Pants",
    colors: [
      {
        name: "Jeans ",
        hex: "#0042a9",
        imageUrl: "https://res.cloudinary.com/qazdrpcx/image/upload/v1786828481/touza_products/imu3afnmz4x8sd3fscg8.png",
        nameAr: "أزرق "
      }
    ],
    descriptionAr: "",
    originalPrice: 3500
  },
  {
    id: "prod-1786997865728",
    isFeatured: true,
    showOnHome: true,
    price: 1400,
    categoryAr: "تيشيرت",
    descriptionAr: "",
    originalPrice: 2000,
    name: "Dior tshirt",
    nameAr: "تشيرت ديور ",
    subtitleAr: "تشكيلة توزا الكاجوال الفاخرة",
    images: [
      "https://res.cloudinary.com/qazdrpcx/image/upload/v1786997914/touza_products/apvwbqbvmjl9hbhjmoip.jpg"
    ],
    category: "T-Shirts",
    colors: [
      {
        nameAr: "أسود",
        imageUrl: "https://res.cloudinary.com/qazdrpcx/image/upload/v1786997826/touza_products/sac5mz7v5u4kxyw9vnva.jpg",
        hex: "#111111",
        name: "Black"
      }
    ],
    description: "",
    isNewArrival: false,
    sizes: [
      {
        inStock: true,
        size: "M"
      },
      {
        inStock: true,
        size: "L"
      },
      {
        inStock: true,
        size: "XL"
      }
    ],
    subtitle: "TOUZA Casual Collection"
  },
  {
    id: "prod-1786998444924",
    nameAr: "تشيرت أميرى ",
    category: "T-Shirts",
    categoryAr: "تيشيرت",
    price: 1400,
    isNewArrival: false,
    subtitleAr: "تشكيلة توزا الكاجوال الفاخرة",
    name: "Amiri tshirt",
    descriptionAr: "",
    showOnHome: false,
    isFeatured: false,
    sizes: [
      {
        size: "S",
        inStock: true
      },
      {
        inStock: true,
        size: "XL"
      },
      {
        inStock: true,
        size: "XXL"
      }
    ],
    images: [
      "https://res.cloudinary.com/qazdrpcx/image/upload/v1786998439/touza_products/mnunskoz4rai0hdcposq.png"
    ],
    description: "",
    originalPrice: 2000,
    subtitle: "TOUZA Casual Collection",
    colors: [
      {
        sizes: [
          {
            size: "S",
            inStock: true
          },
          {
            inStock: false,
            size: "M"
          },
          {
            size: "L",
            inStock: false
          },
          {
            size: "XL",
            inStock: true
          },
          {
            inStock: true,
            size: "XXL"
          }
        ],
        hex: "#111111",
        name: "Black",
        nameAr: "أسود",
        imageUrl: "https://res.cloudinary.com/qazdrpcx/image/upload/v1786998405/touza_products/pf1pn5hkcob6ewj49zmf.png"
      },
      {
        imageUrl: "https://res.cloudinary.com/qazdrpcx/image/upload/v1786998317/touza_products/dsuipth6oaboyaoz46vk.png",
        nameAr: "أبيض",
        name: "White",
        hex: "#ffffff",
        sizes: [
          {
            inStock: true,
            size: "S"
          },
          {
            size: "M",
            inStock: false
          },
          {
            size: "L",
            inStock: false
          },
          {
            size: "XL",
            inStock: false
          },
          {
            inStock: true,
            size: "XXL"
          }
        ]
      }
    ]
  },
  {
    id: "prod-1787076622253",
    subtitle: "TOUZA Casual Collection",
    colors: [
      {
        sizes: [
          {
            inStock: true,
            size: "S"
          },
          {
            inStock: true,
            size: "M"
          },
          {
            inStock: true,
            size: "XL"
          },
          {
            inStock: true,
            size: "XXL"
          }
        ],
        name: "Black",
        nameAr: "أسود",
        hex: "#111111",
        imageUrl: "https://res.cloudinary.com/qazdrpcx/image/upload/v1787076547/touza_products/p9rnldygrhqr7rftg7cg.png"
      },
      {
        hex: "#ffffff",
        sizes: [
          {
            inStock: true,
            size: "L"
          },
          {
            inStock: true,
            size: "XL"
          },
          {
            size: "XXL",
            inStock: true
          }
        ],
        name: "White",
        nameAr: "أبيض",
        imageUrl: "https://res.cloudinary.com/qazdrpcx/image/upload/v1787076575/touza_products/k38u8dfq1p91m8afav94.png"
      }
    ],
    subtitleAr: "تشكيلة توزا الكاجوال الفاخرة",
    images: [
      "https://res.cloudinary.com/qazdrpcx/image/upload/v1787077932/touza_products/xymtefafcacnyyhghhlt.png"
    ],
    category: "T-Shirts",
    price: 850,
    name: "Amiri tshirt",
    description: "",
    nameAr: "تشيرت أميرى",
    originalPrice: 1100,
    descriptionAr: "",
    sizes: [
      {
        inStock: true,
        size: "M"
      },
      {
        inStock: true,
        size: "L"
      },
      {
        inStock: true,
        size: "XL"
      },
      {
        size: "XXL",
        inStock: true
      }
    ],
    isFeatured: true,
    showOnHome: true,
    categoryAr: "تيشيرت",
    isNewArrival: false
  },
  {
    id: "prod-1787077515769",
    description: "",
    subtitleAr: "تشكيلة توزا الكاجوال الفاخرة",
    subtitle: "TOUZA Casual Collection",
    showOnHome: false,
    descriptionAr: "",
    name: "Dsquared tshirt ",
    isFeatured: false,
    isNewArrival: false,
    sizes: [
      {
        size: "M",
        inStock: true
      },
      {
        size: "XL",
        inStock: true
      }
    ],
    categoryAr: "تيشيرت",
    colors: [
      {
        nameAr: "أسود",
        imageUrl: "https://res.cloudinary.com/qazdrpcx/image/upload/v1787077508/touza_products/d6qfr9satkyrl1azryis.jpg",
        name: "Black",
        hex: "#111111",
        sizes: [
          {
            inStock: false,
            size: "S"
          },
          {
            inStock: true,
            size: "M"
          },
          {
            size: "L",
            inStock: false
          },
          {
            inStock: true,
            size: "XL"
          },
          {
            inStock: false,
            size: "XXL"
          }
        ]
      }
    ],
    originalPrice: 2000,
    price: 1400,
    nameAr: "تشيرت ديسكورد",
    images: [
      "https://res.cloudinary.com/qazdrpcx/image/upload/v1787077508/touza_products/d6qfr9satkyrl1azryis.jpg"
    ],
    category: "T-Shirts"
  },
  {
    id: "prod-1787077904145",
    category: "T-Shirts",
    images: [
      "https://res.cloudinary.com/qazdrpcx/image/upload/v1787077892/touza_products/zoj99gx8c7hkqdc76wdo.jpg"
    ],
    isNewArrival: false,
    colors: [
      {
        sizes: [
          {
            inStock: true,
            size: "S"
          },
          {
            inStock: true,
            size: "M"
          },
          {
            inStock: false,
            size: "L"
          },
          {
            inStock: true,
            size: "XL"
          },
          {
            size: "XXL",
            inStock: true
          }
        ],
        imageUrl: "https://res.cloudinary.com/qazdrpcx/image/upload/v1787077769/touza_products/qthuoql3evljoyuknprq.png",
        nameAr: "أسود",
        hex: "#111111",
        name: "Black"
      },
      {
        hex: "#c2c2c2",
        sizes: [
          {
            inStock: true,
            size: "S"
          },
          {
            size: "M",
            inStock: true
          },
          {
            size: "XL",
            inStock: true
          }
        ],
        name: "Grey",
        nameAr: "رومادى ",
        imageUrl: "https://res.cloudinary.com/qazdrpcx/image/upload/v1787077810/touza_products/u11mkhjz66tvlqjj8hif.jpg"
      },
      {
        name: "White",
        nameAr: "أبيض",
        imageUrl: "https://res.cloudinary.com/qazdrpcx/image/upload/v1787077842/touza_products/aj5p8vd4kmkatssmigox.jpg",
        sizes: [
          {
            inStock: true,
            size: "S"
          },
          {
            size: "XL",
            inStock: true
          }
        ],
        hex: "#ffffff"
      }
    ],
    sizes: [
      {
        inStock: true,
        size: "M"
      },
      {
        size: "L",
        inStock: true
      },
      {
        size: "XL",
        inStock: true
      },
      {
        inStock: true,
        size: "S"
      },
      {
        inStock: true,
        size: "2XL"
      }
    ],
    isFeatured: true,
    subtitle: "TOUZA Casual Collection",
    showOnHome: true,
    categoryAr: "تيشيرت",
    price: 1400,
    name: "Lowe tshirt ",
    description: "",
    subtitleAr: "تشكيلة توزا الكاجوال الفاخرة",
    nameAr: "تشيرت لويفي ",
    descriptionAr: "",
    originalPrice: 2000
  },
  {
    id: "prod-1787078405082",
    images: [
      "https://res.cloudinary.com/qazdrpcx/image/upload/v1787078362/touza_products/h5pda3dc2pdaaq35i6xq.jpg"
    ],
    originalPrice: 2000,
    descriptionAr: "",
    name: "D&G Tshirt",
    price: 1400,
    colors: [
      {
        hex: "#ffffff",
        name: "White",
        imageUrl: "https://res.cloudinary.com/qazdrpcx/image/upload/v1787078274/touza_products/ccnyzqptolszj4fo9237.jpg",
        nameAr: "أبيض",
        sizes: [
          {
            size: "S",
            inStock: false
          },
          {
            inStock: false,
            size: "M"
          },
          {
            size: "L",
            inStock: true
          },
          {
            inStock: true,
            size: "XL"
          },
          {
            size: "XXL",
            inStock: true
          }
        ]
      }
    ],
    subtitleAr: "تشكيلة توزا الكاجوال الفاخرة",
    isNewArrival: false,
    description: "",
    category: "T-Shirts",
    sizes: [
      {
        inStock: true,
        size: "L"
      },
      {
        inStock: true,
        size: "XL"
      },
      {
        size: "XXL",
        inStock: true
      }
    ],
    categoryAr: "تيشيرت",
    nameAr: "تشيرت دولسى & غابانا ",
    subtitle: "TOUZA Casual Collection",
    showOnHome: true,
    isFeatured: true
  },
  {
    id: "prod-1787078804876",
    description: "",
    subtitle: "TOUZA Casual Collection",
    subtitleAr: "تشكيلة توزا الكاجوال الفاخرة",
    sizes: [
      {
        size: "M",
        inStock: true
      },
      {
        inStock: true,
        size: "XL"
      },
      {
        inStock: true,
        size: "S"
      }
    ],
    colors: [
      {
        name: "White",
        hex: "#ffffff",
        imageUrl: "https://res.cloudinary.com/qazdrpcx/image/upload/v1787078586/touza_products/ykvqosnktnxqipmvheaa.png",
        nameAr: "أبيض",
        sizes: [
          {
            inStock: true,
            size: "XL"
          }
        ]
      },
      {
        sizes: [
          {
            size: "S",
            inStock: true
          },
          {
            inStock: true,
            size: "M"
          },
          {
            size: "XL",
            inStock: true
          }
        ],
        nameAr: "أسود",
        imageUrl: "https://res.cloudinary.com/qazdrpcx/image/upload/v1787078674/touza_products/gbtgcytqqj28onnc6edy.jpg",
        hex: "#000000",
        name: "Black"
      }
    ],
    showOnHome: false,
    originalPrice: 2000,
    nameAr: "تشيرت دولسى & غابانا ",
    price: 1400,
    isFeatured: false,
    images: [
      "https://res.cloudinary.com/qazdrpcx/image/upload/v1787078800/touza_products/jpilwxdpgpqawb4pi6yi.png"
    ],
    descriptionAr: "",
    categoryAr: "تيشيرت",
    name: "D&G Tshirt",
    isNewArrival: false,
    category: "T-Shirts"
  },
  {
    id: "prod-1787085131724",
    categoryAr: "تشيرت بولو",
    category: "Polos",
    name: "balmain tshirt ",
    price: 1400,
    descriptionAr: "",
    description: "",
    subtitleAr: "تشكيلة توزا الكاجوال الفاخرة",
    nameAr: "تشيرت بلمان ",
    originalPrice: 2000,
    colors: [
      {
        hex: "#111111",
        imageUrl: "https://res.cloudinary.com/qazdrpcx/image/upload/v1787089799/touza_products/crufmm4hv2qqhlgfma67.jpg",
        name: "Black",
        nameAr: "أسود",
        sizes: [
          {
            size: "M",
            inStock: true
          },
          {
            size: "L",
            inStock: true
          },
          {
            inStock: false,
            size: "XXL"
          }
        ]
      },
      {
        nameAr: "أبيض",
        name: "White",
        hex: "#ffffff",
        sizes: [
          {
            size: "L",
            inStock: true
          },
          {
            inStock: true,
            size: "XL"
          }
        ],
        imageUrl: "https://res.cloudinary.com/qazdrpcx/image/upload/v1787089827/touza_products/zlnf6vatzc1aflqwfkv0.jpg"
      }
    ],
    showOnHome: true,
    isFeatured: true,
    isNewArrival: false,
    images: [
      "https://res.cloudinary.com/qazdrpcx/image/upload/v1787089854/touza_products/qbimomvpk5d2suhcq1xi.jpg"
    ],
    sizes: [
      {
        size: "M",
        inStock: true
      },
      {
        inStock: true,
        size: "L"
      },
      {
        size: "XL",
        inStock: true
      }
    ],
    subtitle: "TOUZA Casual Collection"
  },
  {
    id: "prod-1787152293645",
    isNewArrival: true,
    isFeatured: true,
    showOnHome: true,
    price: 1900,
    subtitleAr: "تشكيلة توزا الكاجوال الفاخرة",
    descriptionAr: "",
    subtitle: "TOUZA Casual Collection",
    sizes: [
      {
        size: "M",
        inStock: true
      },
      {
        inStock: true,
        size: "XL"
      },
      {
        size: "XXL",
        inStock: true
      }
    ],
    images: [
      "https://res.cloudinary.com/qazdrpcx/image/upload/v1787152269/touza_products/thehxvnzg4jxhqpmr2u1.jpg"
    ],
    category: "Shirts",
    description: "",
    name: "Amiri shirt",
    nameAr: "قميص أميرى",
    categoryAr: "قميص",
    colors: [
      {
        sizes: [
          {
            inStock: false,
            size: "S"
          },
          {
            size: "M",
            inStock: true
          },
          {
            inStock: false,
            size: "L"
          },
          {
            size: "XL",
            inStock: true
          },
          {
            size: "XXL",
            inStock: true
          }
        ],
        hex: "#111111",
        nameAr: "أسود",
        name: "Black",
        imageUrl: "https://res.cloudinary.com/qazdrpcx/image/upload/v1787152034/touza_products/tkmb9mxgrbpphxmdsnwd.png"
      },
      {
        name: "White",
        imageUrl: "https://res.cloudinary.com/qazdrpcx/image/upload/v1787152110/touza_products/gq2pihrb8irzlrn66agn.jpg",
        sizes: [
          {
            inStock: true,
            size: "M"
          }
        ],
        hex: "#ffffff",
        nameAr: "أبيض"
      }
    ]
  },
  {
    id: "prod-1787152522367",
    categoryAr: "قميص",
    sizes: [
      {
        size: "XL",
        inStock: true
      },
      {
        inStock: true,
        size: "XXL"
      }
    ],
    colors: [
      {
        name: "Grey",
        imageUrl: "https://res.cloudinary.com/qazdrpcx/image/upload/v1787152474/touza_products/ftqdcleqxqy7gtv2loci.png",
        hex: "#ebebeb",
        nameAr: "رومادى ",
        sizes: [
          {
            size: "S",
            inStock: false
          },
          {
            size: "M",
            inStock: false
          },
          {
            inStock: false,
            size: "L"
          },
          {
            size: "XL",
            inStock: true
          },
          {
            size: "XXL",
            inStock: true
          }
        ]
      }
    ],
    descriptionAr: "",
    description: "",
    nameAr: "قميص ديور ",
    price: 1900,
    images: [
      "https://res.cloudinary.com/qazdrpcx/image/upload/v1787152514/touza_products/qgndhh1xgskqcclrmjxd.png"
    ],
    subtitle: "TOUZA Casual Collection",
    subtitleAr: "تشكيلة توزا الكاجوال الفاخرة",
    category: "Shirts",
    isFeatured: true,
    name: "Dior shirt",
    isNewArrival: true,
    showOnHome: true
  },
  {
    id: "prod-1787174449423",
    nameAr: "ترنج غوتشى",
    subtitleAr: "تشكيلة توزا الكاجوال الفاخرة",
    images: [
      "https://res.cloudinary.com/qazdrpcx/image/upload/v1787174431/touza_products/xpdgdkrw7pvc3o49ebo8.jpg"
    ],
    colors: [
      {
        hex: "#111111",
        sizes: [
          {
            inStock: true,
            size: "M"
          },
          {
            inStock: true,
            size: "L"
          },
          {
            inStock: true,
            size: "XL"
          },
          {
            inStock: true,
            size: "XXL"
          }
        ],
        name: "Black",
        nameAr: "أسود",
        imageUrl: "https://res.cloudinary.com/qazdrpcx/image/upload/v1787174328/touza_products/judcbqfu8twivvaupj9f.jpg"
      },
      {
        name: "White",
        sizes: [
          {
            size: "M",
            inStock: true
          },
          {
            size: "L",
            inStock: true
          },
          {
            size: "XL",
            inStock: true
          },
          {
            size: "XXL",
            inStock: true
          }
        ],
        nameAr: "أبيض ",
        imageUrl: "https://res.cloudinary.com/qazdrpcx/image/upload/v1787174375/touza_products/kyruoozimx1255m7etpe.png",
        hex: "#ffffff"
      }
    ],
    descriptionAr: "",
    categoryAr: "ترنج ",
    subtitle: "TOUZA Casual Collection",
    name: "Gucci suit ",
    price: 1900,
    description: "",
    category: "Tracksuit",
    isNewArrival: true,
    isFeatured: false,
    showOnHome: false,
    sizes: [
      {
        inStock: true,
        size: "M"
      },
      {
        inStock: true,
        size: "L"
      },
      {
        size: "XL",
        inStock: true
      },
      {
        size: "XXL",
        inStock: true
      }
    ]
  },
  {
    id: "prod-1787175294850",
    categoryAr: "ترنج ",
    colors: [
      {
        nameAr: "أبيض",
        name: "White",
        sizes: [
          {
            size: "S",
            inStock: false
          },
          {
            size: "M",
            inStock: true
          },
          {
            inStock: true,
            size: "L"
          },
          {
            inStock: true,
            size: "XL"
          },
          {
            inStock: true,
            size: "XXL"
          }
        ],
        imageUrl: "https://res.cloudinary.com/qazdrpcx/image/upload/v1787175093/touza_products/ydiln46jziiva7fj1lia.png",
        hex: "#ffffff"
      },
      {
        nameAr: "أسود",
        hex: "#111111",
        imageUrl: "https://res.cloudinary.com/qazdrpcx/image/upload/v1787175169/touza_products/ao9wi4sz6al4zvipzbbw.png",
        name: "Blacl"
      }
    ],
    sizes: [
      {
        size: "M",
        inStock: true
      },
      {
        inStock: true,
        size: "L"
      },
      {
        inStock: true,
        size: "XL"
      },
      {
        inStock: true,
        size: "XXL"
      }
    ],
    subtitle: "TOUZA Casual Collection",
    price: 1900,
    subtitleAr: "تشكيلة توزا الكاجوال الفاخرة",
    images: [
      "https://res.cloudinary.com/qazdrpcx/image/upload/v1787175242/touza_products/nvae3zopzhgsgsbknbpu.jpg"
    ],
    nameAr: "ترنج غوتشى ",
    descriptionAr: "",
    description: "",
    isFeatured: false,
    category: "Tracksuit",
    showOnHome: false,
    isNewArrival: true,
    name: "Gucci suit"
  },
  {
    id: "prod-1787177006021",
    category: "T-Shirts",
    categoryAr: "تيشيرت",
    isNewArrival: false,
    colors: [
      {
        nameAr: "أسود",
        imageUrl: "https://res.cloudinary.com/qazdrpcx/image/upload/v1787176900/touza_products/qvsl6nmwood0cwragvgf.png",
        name: "Black",
        hex: "#111111",
        sizes: [
          {
            inStock: false,
            size: "S"
          },
          {
            size: "M",
            inStock: false
          },
          {
            size: "L",
            inStock: true
          },
          {
            size: "XL",
            inStock: false
          },
          {
            inStock: true,
            size: "XXL"
          }
        ]
      }
    ],
    nameAr: "تشيرت أوف وايت ",
    subtitleAr: "تشكيلة توزا الكاجوال الفاخرة",
    images: [
      "https://res.cloudinary.com/qazdrpcx/image/upload/v1787176974/touza_products/njxowcriojvvodyaalru.png",
      "https://res.cloudinary.com/qazdrpcx/image/upload/v1787176993/touza_products/rzbnmyuotibs27hcwpli.png"
    ],
    description: "",
    price: 1200,
    isFeatured: false,
    showOnHome: false,
    subtitle: "TOUZA Casual Collection",
    descriptionAr: "",
    name: "Offwhite tshirt",
    sizes: [
      {
        size: "L",
        inStock: true
      },
      {
        inStock: true,
        size: "XXL"
      }
    ],
    originalPrice: 1800
  },
  {
    id: "prod-1787177608748",
    description: "",
    subtitle: "TOUZA Casual Collection",
    name: "Offwhite tshirt",
    isFeatured: false,
    showOnHome: false,
    isNewArrival: false,
    category: "T-Shirts",
    originalPrice: 1800,
    subtitleAr: "تشكيلة توزا الكاجوال الفاخرة",
    nameAr: "تشيرت اوف وايت ",
    images: [
      "https://res.cloudinary.com/qazdrpcx/image/upload/v1787177559/touza_products/rmczysjoc2rnuznudkdb.png",
      "https://res.cloudinary.com/qazdrpcx/image/upload/v1787177565/touza_products/njqflfklszb5wme6agh0.jpg",
      "https://res.cloudinary.com/qazdrpcx/image/upload/v1787177583/touza_products/h8bi3bulgvvrskn5rx8g.png",
      "https://res.cloudinary.com/qazdrpcx/image/upload/v1787177790/touza_products/sxvjedb4hwwycnewv57b.png"
    ],
    price: 1200,
    categoryAr: "تيشيرت",
    descriptionAr: "",
    colors: [
      {
        hex: "#ffffff",
        nameAr: "أبيض",
        name: "White",
        sizes: [
          {
            size: "XL",
            inStock: true
          },
          {
            inStock: true,
            size: "XXL"
          }
        ],
        imageUrl: "https://res.cloudinary.com/qazdrpcx/image/upload/v1787177279/touza_products/cpvkofvhd9c91t4ntbuz.png"
      },
      {
        sizes: [
          {
            inStock: true,
            size: "M"
          },
          {
            size: "XL",
            inStock: true
          },
          {
            size: "XXL",
            inStock: true
          }
        ],
        name: "Black",
        imageUrl: "https://res.cloudinary.com/qazdrpcx/image/upload/v1787177344/touza_products/zbebrsui0fj6bw1zb51q.jpg",
        nameAr: "أسود",
        hex: "#000000"
      }
    ],
    sizes: [
      {
        size: "M",
        inStock: true
      },
      {
        size: "XL",
        inStock: true
      },
      {
        size: "XXL",
        inStock: true
      }
    ]
  },
  {
    id: "prod-1787268569316",
    nameAr: "قميص كتان ",
    price: 850,
    showOnHome: false,
    isFeatured: false,
    subtitle: "TOUZA Casual Collection",
    descriptionAr: "",
    isNewArrival: false,
    name: "Linen shirt",
    sizes: [
      {
        size: "S",
        inStock: true
      },
      {
        inStock: true,
        size: "M"
      },
      {
        inStock: true,
        size: "Xl"
      },
      {
        inStock: true,
        size: "L"
      }
    ],
    description: "",
    images: [
      "https://res.cloudinary.com/qazdrpcx/image/upload/v1787269563/touza_products/vimfavjeosv4qkccwnku.jpg",
      "https://res.cloudinary.com/qazdrpcx/image/upload/v1787269587/touza_products/qynot1epph9kzgmvgbut.jpg",
      "https://res.cloudinary.com/qazdrpcx/image/upload/v1787269602/touza_products/pzxfzhtv2b0nglnij5a9.jpg",
      "https://res.cloudinary.com/qazdrpcx/image/upload/v1787269632/touza_products/owfgeknwlmcy1upjembr.jpg"
    ],
    category: "Shirts",
    subtitleAr: "تشكيلة توزا الكاجوال الفاخرة",
    categoryAr: "قميص",
    colors: [
      {
        hex: "#563d00",
        name: "Brown",
        sizes: [
          {
            size: "S",
            inStock: true
          },
          {
            size: "M",
            inStock: true
          },
          {
            inStock: true,
            size: "L"
          },
          {
            size: "XL",
            inStock: true
          },
          {
            inStock: false,
            size: "XXL"
          }
        ],
        imageUrl: "https://res.cloudinary.com/qazdrpcx/image/upload/v1787267859/touza_products/pag1qeooecjjybyxtjmr.jpg",
        nameAr: "بنى"
      },
      {
        imageUrl: "https://res.cloudinary.com/qazdrpcx/image/upload/v1787267907/touza_products/igs7dvazeolk26q6y0e2.jpg",
        nameAr: "أصفر",
        name: "Yellow",
        sizes: [
          {
            size: "S",
            inStock: true
          },
          {
            size: "M",
            inStock: true
          },
          {
            size: "L",
            inStock: true
          },
          {
            size: "XL",
            inStock: true
          },
          {
            inStock: false,
            size: "XXL"
          }
        ],
        hex: "#fefb41"
      },
      {
        hex: "#38571a",
        name: "Green",
        sizes: [
          {
            size: "S",
            inStock: true
          },
          {
            size: "M",
            inStock: true
          },
          {
            size: "L",
            inStock: true
          },
          {
            size: "XL",
            inStock: true
          },
          {
            inStock: false,
            size: "XXL"
          }
        ],
        nameAr: "اخضر",
        imageUrl: "https://res.cloudinary.com/qazdrpcx/image/upload/v1787268178/touza_products/wzyhfqkx49e1dqsqos3y.jpg"
      },
      {
        imageUrl: "https://res.cloudinary.com/qazdrpcx/image/upload/v1787268276/touza_products/t6ksudgknyehngfwsuaz.jpg",
        hex: "#ff8648",
        name: "Orange",
        sizes: [
          {
            size: "S",
            inStock: true
          },
          {
            size: "M",
            inStock: true
          },
          {
            size: "L",
            inStock: true
          },
          {
            size: "XL",
            inStock: true
          },
          {
            inStock: false,
            size: "XXL"
          }
        ],
        nameAr: "برتقالى "
      }
    ]
  }
];
