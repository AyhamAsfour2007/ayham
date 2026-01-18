
export enum Category {
  PHONES_NEW = 'هواتف جديدة',
  PHONES_USED = 'هواتف مستعملة',
  ACCESSORIES = 'إكسسوارات',
  SPARE_PARTS = 'قطع غيار',
}

export enum SparePartType {
  SCREEN = 'شاشات',
  BOARD = 'بورد',
  CHARGER = 'شواحن',
  CAMERA = 'كاميرات',
  NONE = 'غير محدد'
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: Category;
  brand: string;
  image: string;
  stock: number;
  sparePartType?: SparePartType;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type ViewState = 'CUSTOMER' | 'ADMIN';
