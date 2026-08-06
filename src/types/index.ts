// KIENPRO LMS - Central TypeScript Types & Interfaces
export type UserRole = 'super_admin' | 'instructor' | 'support' | 'student';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  role: UserRole;
  isActivated: boolean;
  createdAt: string;
}

export type OrderStatus = 'PENDING' | 'PAID' | 'CANCELLED' | 'EXPIRED' | 'REFUNDED';

export interface Order {
  id: string;
  orderCode: string;
  userId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
}

export interface WebhookEventPayload {
  provider: 'sepay' | 'payos' | 'casso';
  transactionId: string;
  amount: number;
  content: string;
  accountNumber?: string;
}
