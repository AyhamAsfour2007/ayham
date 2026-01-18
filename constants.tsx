
import { Product, Category, SparePartType } from './types';

export const BRANDS = ['Samsung', 'iPhone', 'Xiaomi', 'Huawei', 'Google', 'Other'];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'iPhone 15 Pro Max',
    description: 'أحدث هاتف من شركة آبل بذاكرة 256 جيجابايت',
    price: 5200,
    category: Category.PHONES_NEW,
    brand: 'iPhone',
    image: 'https://picsum.photos/seed/iphone15/400/400',
    stock: 5
  },
  {
    id: '2',
    name: 'Samsung S23 Ultra (مستعمل)',
    description: 'حالة ممتازة، استخدام شهر واحد فقط',
    price: 3800,
    category: Category.PHONES_USED,
    brand: 'Samsung',
    image: 'https://picsum.photos/seed/s23/400/400',
    stock: 2
  },
  {
    id: '3',
    name: 'شاشة Samsung A54',
    description: 'شاشة أصلية مع ضمان لمدة 3 شهور',
    price: 450,
    category: Category.SPARE_PARTS,
    brand: 'Samsung',
    sparePartType: SparePartType.SCREEN,
    image: 'https://picsum.photos/seed/screen/400/400',
    stock: 15
  },
  {
    id: '4',
    name: 'شاحن Xiaomi 67W',
    description: 'شاحن سريع أصلي',
    price: 120,
    category: Category.ACCESSORIES,
    brand: 'Xiaomi',
    image: 'https://picsum.photos/seed/charger/400/400',
    stock: 20
  }
];
