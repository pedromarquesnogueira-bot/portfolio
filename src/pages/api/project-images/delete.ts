import type { APIRoute } from "astro";
import { supabase } from "../../../lib/supabase";

export const prerender = false;

export const DELETE: APIRoute = async ({ url }) => {
  const id = url.searchParams.get("id");

  if (!id) {
    return new Response(
      JSON.stringify({
        error: "id é obrigatório.",
      }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  const { error } = await supabase
    .from("project_images")
    .delete()
    .eq("id", id);

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
    JSON.stringify({
      success: true,
    }),
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
};