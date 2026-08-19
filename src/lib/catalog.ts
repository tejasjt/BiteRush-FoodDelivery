import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type Food = Database["public"]["Tables"]["foods"]["Row"];
export type Order = Database["public"]["Tables"]["orders"]["Row"];
export type OrderItem = Database["public"]["Tables"]["order_items"]["Row"];
export type OrderStatus = Database["public"]["Enums"]["order_status"];
export type OrderWithItems = Order & { order_items: OrderItem[] };

export const categoriesQuery = queryOptions({
  queryKey: ["categories"],
  queryFn: async (): Promise<Category[]> => {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("sort_order");
    if (error) throw error;
    return data ?? [];
  },
});

export const foodsQuery = queryOptions({
  queryKey: ["foods"],
  queryFn: async (): Promise<Food[]> => {
    const { data, error } = await supabase.from("foods").select("*").order("name");
    if (error) throw error;
    return data ?? [];
  },
});

export function foodBySlugQuery(slug: string) {
  return queryOptions({
    queryKey: ["food", slug],
    queryFn: async (): Promise<Food | null> => {
      const { data, error } = await supabase.from("foods").select("*").eq("slug", slug).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export const myOrdersQuery = queryOptions({
  queryKey: ["orders", "mine"],
  queryFn: async (): Promise<OrderWithItems[]> => {
    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as OrderWithItems[];
  },
});

export function orderQuery(id: string) {
  return queryOptions({
    queryKey: ["order", id],
    queryFn: async (): Promise<OrderWithItems | null> => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data as OrderWithItems | null;
    },
  });
}

export function profileQuery(userId: string) {
  return queryOptions({
    queryKey: ["profile", userId],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function isAdminQuery(userId: string) {
  return queryOptions({
    queryKey: ["is-admin", userId],
    queryFn: async (): Promise<boolean> => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .maybeSingle();
      if (error) throw error;
      return Boolean(data);
    },
  });
}

export function matchesSearch(food: Food, term: string, categoryName: string): boolean {
  const q = term.trim().toLowerCase();
  if (!q) return true;
  return (
    food.name.toLowerCase().includes(q) ||
    food.description.toLowerCase().includes(q) ||
    categoryName.toLowerCase().includes(q) ||
    food.ingredients.some((i) => i.toLowerCase().includes(q))
  );
}