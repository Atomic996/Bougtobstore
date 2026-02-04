
export enum Category {
  ELECTRONICS = 'إلكترونيات',
  FURNITURE = 'أثاث',
  CARS = 'سيارات',
  FASHION = 'ملابس',
  BOOKS = 'كتب',
  OTHERS = 'أخرى'
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  category: Category;
  imageUrl: string;
  sellerName: string;
  sellerId: string; // معرف فريد للمتصفح
  contactInfo: string; 
  status: 'active' | 'sold' | 'deleted';
  createdAt: number;
}
