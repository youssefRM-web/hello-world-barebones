import { apiRequest } from "./client";

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

export interface AnalyticsData {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  ordersByStatus: Record<string, number>;
  revenueByDay: { date: string; revenue: number }[];
  topItems: { item_name: string; quantity: number }[];
  [key: string]: unknown;
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

export function getAnalytics(from: string, to: string): Promise<AnalyticsData> {
  return apiRequest<AnalyticsData>(`/orders/analytics?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);
}
