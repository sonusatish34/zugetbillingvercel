import { ReactNode } from 'react';

export interface Item {
  sno: number;
  id: string;
  product: string;
  productIcon: ReactNode;
  category: string;
  unit: string;
  quantity: number;
  sizes: string;
  price: number;
}
