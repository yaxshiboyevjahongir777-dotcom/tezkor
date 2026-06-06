export type UserRole = "PASSENGER" | "DRIVER" | "ADMIN";

export type OrderStatus =
  | "PENDING"
  | "SEARCHING"
  | "ACCEPTED"
  | "ARRIVED"
  | "STARTED"
  | "COMPLETED"
  | "CANCELLED";

export interface User {
  id: string;
  phone: string;
  fullName: string;
  role: UserRole;
  createdAt: string;
  driver?: Driver | null;
}

export interface Driver {
  id: string;
  userId: string;
  online: boolean;
  latitude: number | null;
  longitude: number | null;
  rating: number;
  user?: { fullName: string; phone: string };
}

export interface Order {
  id: string;
  passengerId: string;
  driverId?: string | null;
  pickupAddress: string;
  dropoffAddress: string;
  pickupLat: number;
  pickupLng: number;
  dropoffLat: number;
  dropoffLng: number;
  distanceKm?: number | null;
  durationMin?: number | null;
  price: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  passenger?: { id: string; fullName: string; phone: string };
  driver?: Driver | null;
}

export interface PriceEstimate {
  distanceKm: number;
  durationMin: number;
  price: number;
}

export interface AuthResult {
  token: string;
  user: User;
}

export interface ApiError {
  message: string;
}
