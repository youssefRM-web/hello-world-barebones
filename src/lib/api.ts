const API_BASE_URL = "https://call2food.api.rmsoftware.de";

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem("auth_token");

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("restaurant_user");
    window.location.href = "/auth";
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`API error ${response.status}: ${errorBody}`);
  }

  return response.json();
}

// Auth
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  restaurant?: Record<string, unknown>;
}

export interface SignupPayload {
  name: string;
  address: {
    line1: string;
    lat: number;
    lng: number;
  };
  phone: string;
  email: string;
  password: string;
  foodType: string[];
}

export function login(credentials: LoginCredentials): Promise<LoginResponse> {
  return apiRequest<LoginResponse>("/restaurants/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

export function signup(data: SignupPayload): Promise<LoginResponse> {
  return apiRequest<LoginResponse>("/restaurants/signup", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// Orders
export interface ApiOrderItem {
  item_name?: string;
  quantity: number;
  price: number;
  total?: number;
  options?: unknown[];
}

export interface ApiOrder {
  _id: string;
  order_number?: string;
  customer_name?: string;
  customer?: { name?: string; phone?: string; email?: string };
  items: ApiOrderItem[];
  status: string;
  paymentStatus?: string;
  total_amount?: number;
  total_price?: number;
  subtotal?: number;
  service_fee?: number;
  created_at?: string;
  createdAt?: string;
  restaurant_id?: string;
  menu_name?: string;
  currency?: string;
  source?: string;
}

export function getOrders(params?: { status?: string }): Promise<ApiOrder[]> {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set("status", params.status);
  const query = searchParams.toString();
  return apiRequest<ApiOrder[]>(`/orders${query ? `?${query}` : ""}`);
}

export function getOrder(id: string): Promise<ApiOrder> {
  return apiRequest<ApiOrder>(`/orders/${id}`);
}

export function updateOrder(
  id: string,
  data: { status?: string; paymentStatus?: string }
): Promise<ApiOrder> {
  return apiRequest<ApiOrder>(`/orders/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

// Restaurant
export interface RestaurantData {
  _id: string;
  name: string;
  address: { line1?: string; lat?: number; lng?: number };
  phone: string;
  email: string;
  status: string;
  foodType: string[];
  menus: string[];
  workingHours?: Record<string, unknown>;
  created_at?: string;
}

// Menus
export interface MenuItemData {
  item_name?: string;
  description?: string;
  price?: number;
  ingredients?: string[];
  calories?: string;
  portion_size?: string;
  photo?: string;
  available?: boolean;
}

export interface MenuCategory {
  category_name: string;
  items: MenuItemData[];
  _id?: string;
}

export interface MenuData {
  _id: string;
  restaurant_id: string;
  menu_name: string;
  currency: string;
  menus: MenuCategory[];
  Supplements?: unknown[];
  offer?: { title?: string; description?: string; active?: boolean };
  created_at?: string;
}

export function getMenu(id: string): Promise<MenuData> {
  return apiRequest<MenuData>(`/menus/${id}`);
}

export interface CreateMenuPayload {
  menu_name: string;
  currency: string;
  menus: {
    category_name: string;
    items: {
      item_name: string;
      description: string;
      ingredients: string;
      price: number;
      available: boolean;
      calories: number;
      portion_size: string;
    }[];
  }[];
  Supplements: {
    category_name: string;
    items: {
      item_name: string;
      description: string;
      ingredients: string;
      price: number;
      available: boolean;
      calories: number;
      portion_size: string;
    }[];
  }[];
  offer: {
    title: string;
    description: string;
    active: boolean;
  };
}

export function createMenu(data: CreateMenuPayload, id : any): Promise<MenuData> {
  return apiRequest<MenuData>(`/menus/${id}`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}
