export interface UserProfile {
  uid: string;
  email: string;
  minecraftUsername: string;
  createdAt: any; // Timestamp
}

export interface RankProduct {
  id?: string;
  name: string;
  price: number;
  priceRS?: number;
  imageUrl: string;
  inventoryScreenshot: string; // URL or preview link
  description: string; // Markdown or bullet list of perks
  isPinned?: boolean;
}

export interface CoinProduct {
  id?: string;
  name: string;
  coinAmount: number;
  price: number;
  priceRS?: number;
  imageUrl: string;
  description: string;
  isPinned?: boolean;
}

export interface BundleProduct {
  id?: string;
  name: string;
  price: number;
  priceRS?: number;
  imageUrl: string;
  description: string;
  rankName: string;
  coinAmount: number;
  isPinned?: boolean;
}

export interface OrderItem {
  id?: string; // Doc ID (same as orderId)
  orderId: string; // OGZZ-XXXXXX
  uid: string;
  email: string;
  minecraftUsername: string;
  productType: 'rank' | 'coin' | 'bundle';
  productName: string;
  price: number;
  priceRS?: number;
  status: 'Pending' | 'Confirmed' | 'Rejected';
  rejectionReason?: string;
  createdAt: any; // Timestamp
}

export interface AdminUser {
  id?: string;
  email: string;
  role: string;
  createdAt: any;
}
