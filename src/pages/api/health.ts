import type { APIRoute } from "astro";
import { supabase } from "@lib/supabase";

export const GET: APIRoute = async () => {
  const { error } = await supabase
    .from("_health_check")
    .select("*")
    .limit(1);

  return new Response(
    JSON.stringify({
      connected: !error,
      error: error?.message ?? null,
    }),
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
};