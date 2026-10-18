export const SIZES = ["S", "M", "L", "XL"] as const;
export type Size = (typeof SIZES)[number];

export type Product = {
  id: string;
  slug: string;
  name: string;
  color: string;
  gender: string;
  priceEGP: number;
  description: string;
  images: string[];
};

export const PRODUCTS: Product[] = [
  {
    id: "ferrari-black",
    slug: "ferrari-black",
    name: "جاكيت فراري أسود",
    color: "أسود",
    gender: "UNISEX",
    priceEGP: 1499,
    description:
      "جاكيت مبطن بتصميم رياضي عصري، مناسب للرجال والنساء وللإطلالات اليومية خلال فصل الشتاء. خامة مريحة وتشطيب عالي الجودة.",
    images: [
      "/products/ferrari-black/ferrari-black-front.jpg",
      "/products/ferrari-black/ferrari-black-model.jpg",
      "/products/ferrari-black/ferrari-black-back-model.jpg",
      "/products/ferrari-black/ferrari-black-back.jpg",
      "/products/ferrari-black/ferrari-black-open.jpg",
    ],
  },
  {
    id: "bmw",
    slug: "bmw",
    name: "جاكيت BMW",
    color: "كحلي",
    gender: "UNISEX",
    priceEGP: 1499,
    description:
      "جاكيت مبطن بطابع سباق جريء وقَصّة مريحة، مناسب للرجال والنساء وللاستخدام اليومي في الشتاء. تفاصيل واضحة وتشطيب أنيق.",
    images: [
      "/products/bmw/bmw-model.jpg",
      "/products/bmw/bmw-front.jpg",
      "/products/bmw/bmw-front-model.jpg",
      "/products/bmw/bmw-side-model.jpg",
      "/products/bmw/bmw-back-model.jpg",
      "/products/bmw/bmw-back.jpg",
      "/products/bmw/bmw-open.jpg",
    ],
  },
  {
    id: "ferrari-pink",
    slug: "ferrari-pink",
    name: "جاكيت فراري وردي",
    color: "وردي",
    gender: "UNISEX",
    priceEGP: 1499,
    description:
      "جاكيت مبطن بلون وردي لافت وتصميم رياضي عصري، مناسب للرجال والنساء ولإطلالة شتوية مختلفة. مريح وسهل التنسيق.",
    images: [
      "/products/ferrari-pink/ferrari-pink-front.jpg",
      "/products/ferrari-pink/ferrari-pink-model.jpg",
      "/products/ferrari-pink/ferrari-pink-back-model.jpg",
      "/products/ferrari-pink/ferrari-pink-open.jpg",
    ],
  },
];

export function getProduct(idOrSlug: string) {
  return PRODUCTS.find(
    (product) => product.id === idOrSlug || product.slug === idOrSlug,
  );
}

