import type {
  AuthResult,
  User,
  Order,
  Driver,
  PriceEstimate,
} from "./types";

// ─── Config ──────────────────────────────────────────────────────────────────

let BASE_URL = "http://localhost:5000/api";
let _token: string | null = null;

export function configure(baseUrl: string) {
  BASE_URL = baseUrl;
}

export function setToken(token: string | null) {
  _token = token;
}

export function getToken(): string | null {
  return _token;
}

// ─── Core fetch ──────────────────────────────────────────────────────────────

async function request<T>(
  method: string,
  path: string,
  body?: object
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (_token) {
    headers["Authorization"] = `Bearer ${_token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.message || `Xato: ${res.status}`);
  }

  return data as T;
}

const get = <T>(path: string) => request<T>("GET", path);
const post = <T>(path: string, body?: object) => request<T>("POST", path, body);
const patch = <T>(path: string, body?: object) => request<T>("PATCH", path, body);

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const authApi = {
  register: (data: {
    phone: string;
    password: string;
    fullName: string;
    role?: "PASSENGER" | "DRIVER";
  }) => post<User>("/auth/register", data),

  login: async (phone: string, password: string): Promise<AuthResult> => {
    const result = await post<AuthResult>("/auth/login", { phone, password });
    setToken(result.token);
    return result;
  },

  me: () => get<User>("/auth/me"),

  logout: () => {
    setToken(null);
  },
};

// ─── Orders ───────────────────────────────────────────────────────────────────

export const ordersApi = {
  create: (data: {
    pickupAddress: string;
    dropoffAddress: string;
    pickupLat: number;
    pickupLng: number;
    dropoffLat: number;
    dropoffLng: number;
    price: number;
    distanceKm?: number;
    durationMin?: number;
  }) => post<Order>("/orders", data),

  getById: (id: string) => get<Order>(`/orders/${id}`),

  getMyOrders: () => get<Order[]>("/orders/my"),

  accept: (orderId: string) =>
    patch<Order>(`/orders/${orderId}/accept`),

  updateStatus: (orderId: string, status: "ARRIVED" | "STARTED" | "COMPLETED") =>
    patch<Order>(`/orders/${orderId}/status`, { status }),

  cancel: (orderId: string) =>
    patch<Order>(`/orders/${orderId}/cancel`),
};

// ─── Drivers ──────────────────────────────────────────────────────────────────

export const driversApi = {
  getProfile: () => get<Driver>("/drivers/profile"),

  getOnlineDrivers: () => get<Driver[]>("/drivers/online"),

  goOnline: () => post<{ message: string; driver: Driver }>("/drivers/online"),

  goOffline: () => post<{ message: string; driver: Driver }>("/drivers/offline"),

  updateLocation: (latitude: number, longitude: number) =>
    patch<Driver>("/drivers/location", { latitude, longitude }),
};

// ─── Matching ─────────────────────────────────────────────────────────────────

export const matchingApi = {
  findNearestDriver: (pickupLat: number, pickupLng: number, radiusKm = 10) =>
    post<Driver>("/matching/nearest-driver", { pickupLat, pickupLng, radiusKm }),

  estimatePrice: (
    pickupLat: number,
    pickupLng: number,
    dropoffLat: number,
    dropoffLng: number
  ) =>
    post<PriceEstimate>("/matching/estimate", {
      pickupLat,
      pickupLng,
      dropoffLat,
      dropoffLng,
    }),
};
