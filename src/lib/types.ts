export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Admin {
  id: string;
  email: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  created_at: string;
}

export interface Sweet {
  id: string;
  name: string;
  description: string | null;
  category_id: string | null;
  price: number;
  quantity: number;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  category?: Category;
}

export interface Purchase {
  id: string;
  user_id: string;
  sweet_id: string;
  quantity: number;
  total_price: number;
  created_at: string;
  sweet?: Sweet;
}

export interface AuthResponse {
  user: User | Admin;
  token: string;
  type: 'user' | 'admin';
}
