import { apiRequest } from "./client";

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

export interface UpdateMenuPayload {
  menu_name?: string;
  currency?: string;
  menus?: {
    category_name?: string;
    items?: {
      item_name?: string;
      description?: string;
      ingredients?: string;
      price?: number;
      available?: boolean;
      calories?: number;
      portion_size?: string;
    }[];
  }[];
  Supplements?: {
    category_name?: string;
    items?: {
      item_name?: string;
      description?: string;
      ingredients?: string;
      price?: number;
      available?: boolean;
      calories?: number;
      portion_size?: string;
    }[];
  }[];
  offer?: {
    title?: string;
    description?: string;
    active?: boolean;
  };
}

export function getMenu(id: string): Promise<MenuData> {
  return apiRequest<MenuData>(`/menus/${id}`);
}

export function getMyMenus(): Promise<MenuData[]> {
  return apiRequest<MenuData[]>("/menus");
}

export function createMenu(data: CreateMenuPayload, restaurantId: string): Promise<MenuData> {
  return apiRequest<MenuData>(`/menus/${restaurantId}`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateMenu(id: string, data: UpdateMenuPayload): Promise<MenuData> {
  return apiRequest<MenuData>(`/menus/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function deleteMenu(id: string): Promise<{ deleted: boolean }> {
  return apiRequest<{ deleted: boolean }>(`/menus/${id}`, { method: "DELETE" });
}
