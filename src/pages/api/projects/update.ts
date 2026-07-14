import type { APIRoute } from "astro";

import { updateProject } from "@lib/projects";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();

    const id = String(formData.get("id") ?? "");

    if (!id) {
      return new Response("ID do projeto é obrigatório.", {
        status: 400,
      });
    }

    const project = await updateProject(id, {
      title: String(formData.get("title") ?? ""),
      slug: String(formData.get("slug") ?? ""),
      client: String(formData.get("client") ?? "") || null,
      description: String(formData.get("description") ?? "") || null,
      cover_image:
        String(formData.get("cover_image") ?? "") || null,
    });

    return new Response(JSON.stringify(project), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error(error);

    return new Response(String(error), {
      status: 500,
    });
  }
};