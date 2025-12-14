"use client";

import { User, Admin } from "./types";

const USER_KEY = "sweet_shop_user";
const ADMIN_KEY = "sweet_shop_admin";
const USER_TOKEN_KEY = "sweet_shop_user_token";
const ADMIN_TOKEN_KEY = "sweet_shop_admin_token";

export function saveUser(user: User, token: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    localStorage.setItem(USER_TOKEN_KEY, token);
  }
}

export function getUser(): { user: User | null; token: string | null } {
  if (typeof window === "undefined") {
    return { user: null, token: null };
  }
  const userStr = localStorage.getItem(USER_KEY);
  const token = localStorage.getItem(USER_TOKEN_KEY);
  return {
    user: userStr ? JSON.parse(userStr) : null,
    token,
  };
}

export function clearUser() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(USER_TOKEN_KEY);
  }
}

export function saveAdmin(admin: Admin, token: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem(ADMIN_KEY, JSON.stringify(admin));
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
  }
}

export function getAdmin(): { admin: Admin | null; token: string | null } {
  if (typeof window === "undefined") {
    return { admin: null, token: null };
  }
  const adminStr = localStorage.getItem(ADMIN_KEY);
  const token = localStorage.getItem(ADMIN_TOKEN_KEY);
  return {
    admin: adminStr ? JSON.parse(adminStr) : null,
    token,
  };
}

export function clearAdmin() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(ADMIN_KEY);
    localStorage.removeItem(ADMIN_TOKEN_KEY);
  }
}
