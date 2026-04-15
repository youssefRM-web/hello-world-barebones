// Re-export everything for backward compatibility
export { apiRequest, API_BASE_URL } from "./client";
export { login, signup } from "./auth";
export type { LoginCredentials, LoginResponse, SignupPayload } from "./auth";
export { getRestaurant, updateRestaurant, deleteRestaurant, uploadMenuImages } from "./restaurants";
export type { RestaurantData, UpdateRestaurantPayload } from "./restaurants";
export { getMenu, getMyMenus, createMenu, updateMenu, deleteMenu } from "./menus";
export type { MenuItemData, MenuCategory, MenuData, CreateMenuPayload, UpdateMenuPayload } from "./menus";
export { getOrders, getOrder, updateOrder, getAnalytics } from "./orders";
export type { ApiOrderItem, ApiOrder, AnalyticsData } from "./orders";
