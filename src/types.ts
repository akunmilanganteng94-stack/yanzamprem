export type UserRole = 'user' | 'admin';
export type UserStatus = 'active' | 'suspended';

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  balance: number;
  status: UserStatus;
  createdAt: any;
  updatedAt?: any;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
  description: string;
  active: boolean;
  createdAt?: any;
}

export type StockStatus = 'AVAILABLE' | 'SOLD';

export interface StockItem {
  id: string;
  productId: string;
  account: string;
  password: string;
  installationNote?: string;
  status: StockStatus;
  orderId?: string | null;
  createdAt: any;
  soldAt?: any;
}

export type DepositStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type PaymentMethod = 'QRIS' | 'DANA';

export interface Deposit {
  id: string;
  userId: string;
  userEmail?: string;
  amount: number;
  senderName: string;
  paymentMethod: PaymentMethod;
  status: DepositStatus;
  adminId?: string | null;
  createdAt: any;
  approvedAt?: any;
}

export type OrderStatus = 'SUCCESS' | 'CANCELLED';

export interface OrderItem {
  account: string;
  password: string;
  installationNote?: string;
}

export interface Order {
  id: string;
  userId: string;
  userEmail?: string;
  productId: string;
  productName: string;
  quantity: number;
  totalPrice: number;
  items?: OrderItem[];
  status: OrderStatus;
  createdAt: any;
}

export type TransactionType = 'DEPOSIT' | 'ORDER' | 'ADJUSTMENT';

export interface TransactionRecord {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  referenceId?: string;
  description: string;
  createdAt: any;
}

export type StoreStatus = 'OPEN' | 'CLOSED';

export interface StoreSettings {
  storeName: string;
  storeStatus: StoreStatus;
  productPrice: number;
  whatsappChannel: string;
}

export type AuditAction =
  | 'ADMIN_LOGIN'
  | 'APPROVE_DEPOSIT'
  | 'REJECT_DEPOSIT'
  | 'ADD_STOCK'
  | 'DELETE_STOCK'
  | 'DELETE_ALL_AVAILABLE_STOCK'
  | 'ADJUST_BALANCE'
  | 'CHANGE_STORE_STATUS'
  | 'CHANGE_PRODUCT_PRICE'
  | 'SUSPEND_USER'
  | 'ACTIVATE_USER'
  | 'INIT_STORE';

export interface AuditLog {
  id: string;
  adminId: string;
  adminEmail?: string;
  action: AuditAction;
  target?: string;
  description: string;
  createdAt: any;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  message: string;
}
