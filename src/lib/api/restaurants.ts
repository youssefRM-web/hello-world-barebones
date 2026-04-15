import { apiRequest, API_BASE_URL } from "./client";

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

export interface UpdateRestaurantPayload {
  name?: string;
  address?: { line1?: string; lat?: number; lng?: number };
  phone?: string;
  email?: string;
  foodType?: string[];
  workingHours?: Record<string, unknown>;
}

export function getRestaurant(id: string): Promise<RestaurantData> {
  return apiRequest<RestaurantData>(`/restaurants/${id}`);
}

export function updateRestaurant(
  id: string,
  data: UpdateRestaurantPayload
): Promise<RestaurantData> {
  return apiRequest<RestaurantData>(`/restaurants/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteRestaurant(id: string): Promise<void> {
  return apiRequest<void>(`/restaurants/${id}`, { method: "DELETE" });
}

export async function uploadMenuImages(files: File[]): Promise<string[]> {
  const token = localStorage.getItem("auth_token");
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));

  const response = await fetch(`${API_BASE_URL}/restaurants/upload-menu-images`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Upload failed ${response.status}: ${errorBody}`);
  }

  return response.json();
}
