import { apiRequest } from "./client";

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
