import type { APIRoute } from "astro";
import { supabase } from "../../../lib/supabase";

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  const projectId = url.searchParams.get("projectId");

  if (!projectId) {
    return new Response(
      JSON.stringify({
        error: "projectId é obrigatório.",
      }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  const { data, error } = await supabase
    .from("project_images")
    .select("*")
    .eq("project_id", projectId)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error(error);

    return new Response(
      JSON.stringify({
        error: error.message,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  return new Response(
    JSON.stringify(data),
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
};