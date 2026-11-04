import "react-native-url-polyfill/auto";
import { AppState, Platform } from "react-native";
import { createClient } from "@supabase/supabase-js";
import { supabaseSecureStorage } from "./supabaseStorage";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
const supabasePublishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

const webSessionStorage = {
  async getItem(key: string): Promise<string | null> {
    if (typeof window === "undefined") return null;
    return window.sessionStorage.getItem(key);
  },
  async setItem(key: string, value: string): Promise<void> {
    if (typeof window !== "undefined") window.sessionStorage.setItem(key, value);
  },
  async removeItem(key: string): Promise<void> {
    if (typeof window !== "undefined") window.sessionStorage.removeItem(key);
  },
};

export const supabaseEnabled = Boolean(supabaseUrl && supabasePublishableKey);
export const supabase = supabaseEnabled
  ? createClient(supabaseUrl, supabasePublishableKey, {
      auth: {
        storage: Platform.OS === "web" ? webSessionStorage : supabaseSecureStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : null;

if (supabase) {
  if (AppState.currentState === "active") supabase.auth.startAutoRefresh();
  AppState.addEventListener("change", (state) => {
    if (state === "active") supabase.auth.startAutoRefresh();
    else supabase.auth.stopAutoRefresh();
  });
}
