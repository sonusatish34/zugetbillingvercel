// Common types for the application

import type React from 'react';

export interface Invoice {
  id: string;
  createdOn: string;
  amount: string;
  paid: string;
  paymentMode: string;
  dueDate: string;
}

export interface Order {
  itemId: string;
  itemName: string;
  qty: number;
  size: string;
  left: number;
  price: string;
}

export interface Transaction {
  name: string;
  invoiceId: string;
  amount: string;
  date: string;
}

export interface OverviewStats {
  invoices: number;
  customers: number;
  amountDue: string;
  todayOrders: number;
}

export interface SalesAnalytics {
  totalSales: string;
  purchase: string;
  decSales: string;
  decOrders: number;
}

export interface InvoiceStatistics {
  invoiced: string;
  received: string;
  outstanding: string;
  total: string;
}

export interface ChartData {
  name: string;
  value: number;
  total?: number;
  received?: number;
}

export interface NavigationItem {
  label: string;
  icon?: string;
  href?: string;
  children?: NavigationItem[];
}

export interface Item {
  id: string;
  product: string;
  productIcon?: unknown; // Use unknown to avoid 'any' but permit flexibility; consuming code must cast/type-guard
  category: string;
  unit: string;
  quantity: number;
  sizes: string;
  price: string;
}

export interface OrderItem {
  id: string;
  product: string;
  productIcon?: unknown;
  category: string;
  quantity: string; // e.g., "XL - 2"
  price: string;
  orderCreatedTime: string;
  pickupTime?: string;
  orderStatus: string;
  orderFrom?: 'Online' | 'Offline';
  amountStatus?: string;
}

export interface OrderDetail {
  orderId: string;
  orderList: {
    itemId: string;
    itemName: string;
    image?: string;
    qty: number[];
    size: string;
    amount: string;
  }[];
  deliveryBoy?: {
    name: string;
    phone: string;
    image?: string;
    assignedTime: string;
    orderEarnings: string;
  };
  paymentDetails?: {
    itemsPrice: string;
    discount: string;
    deliveryFee: string;
    platformFee: string;
    totalEarning: string;
  };
  itemOverview?: {
    id: string;
    category: string;
    quantity: number;
    sizes: string;
    price: string;
    onlineSold: number;
    offlineSold: number;
    total: number;
    remaining: number;
  };
  history?: OrderItem[];
}

export interface ItemDetail {
  id: string;
  name: string;
  barcode: string;
  category: string;
  quantity: number;
  quantityLeft: number;
  alertQuantity: number;
  images?: string[];
  sizes: Array<{
    size: string;
    quantity: number;
    quantityLeft: number;
    price: string;
  }>;
  overview?: {
    id: string;
    category: string;
    quantity: number;
    sizes: string;
    price: string;
    onlineSold: number;
    offlineSold: number;
    total: number;
    remaining: number;
  };
  history?: OrderItem[];
}

export interface Employee {
  id: string;
  name: string;
  number: string;
  designation: string;
  orderCreatedTime: string;
}

export interface AddedItem {
  id: string;
  itemIcon?: unknown;
  itemName: string;
  category: string;
  sizeQuantity: string; // e.g., "XL - 2"
  price: string;
  orderCreatedTime: string;
  time: string;
  status: string;
}

export interface EmployeeDetail {
  employee: Employee;
  addedItems: AddedItem[];
}

export interface ProfileData {
  storeId: string;
  name: string;
  location: string;
  email: string;
  phone: string;
  company: string;
  favoriteFor: string;
  profileImage?: string;
}

export interface PaymentHistoryItem {
  id: string;
  method: 'Paypal' | 'Stripe';
  invoiceNumber: string;
  amount: string;
  status: 'Paid' | 'Pending';
  date: string;
}

export interface StoreSetting {
  freeDelivery: boolean;
  returnHours: number;
  returnPerOrder: number;
}

export interface FinancialOverview {
  label: string;
  value: string;
  trend: string;
  trendType: 'up' | 'down';
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
}

export interface Payment {
  id: string;
  date: string;
  referenceNumber: string;
  description: string;
  amount: string;
  paymentMode: 'Cash' | 'Cheque' | 'Online' | 'Card';
}

export interface TransactionDetail {
  id: string;
  date: string;
  referenceNumber: string;
  description: string;
  hasAttachment: boolean;
  amount: string;
  paymentMode: 'Cash' | 'Cheque' | 'Online' | 'Card';
  status: 'Paid' | 'Pending' | 'Cancelled';
}

export interface BankDetail {
  name: string;
  accountNumber: string;
  ifscCode: string;
  checkImage?: string;
}

