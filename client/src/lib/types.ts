export interface CartItemWithSweet {
  id: string;
  userId: string;
  sweetId: string;
  quantity: number;
  createdAt: Date;
  sweet: {
    id: string;
    name: string;
    category: string;
    description: string;
    price: string;
    quantity: number;
    imageUrl?: string;
  };
}

export interface ApiError {
  message: string;
}

export interface AuthResponse {
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
  token: string;
}
