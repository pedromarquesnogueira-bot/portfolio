import type { APIRoute } from "astro";
import { supabase } from "../../../lib/supabase";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json();

  const {
    project_id,
    image_url,
    alt,
    width,
    height,
    sort_order,
  } = body;

  if (!project_id || !image_url) {
    return new Response(
      JSON.stringify({
        error: "project_id e image_url são obrigatórios.",
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
    .insert({
      project_id,
      image_url,
      alt: alt ?? "",
      width: width ?? null,
      height: height ?? null,
      sort_order: sort_order ?? 0,
    })
    .select()
    .single();

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