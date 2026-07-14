import type { APIRoute } from "astro";
import { supabase } from "../../../lib/supabase";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const images = await request.json();

  if (!Array.isArray(images)) {
    return new Response(
      JSON.stringify({
        error: "Payload inválido.",
      }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  try {
    for (const image of images) {
      const { error } = await supabase
        .from("project_images")
        .update({
          sort_order: image.sort_order,
        })
        .eq("id", image.id);

      if (error) throw error;
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
  } catch (error) {
    console.error(error);

    return new Response(
      JSON.stringify({
        error: "Erro ao reordenar imagens.",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
};