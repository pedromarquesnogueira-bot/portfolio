import type { APIRoute } from "astro";
import { createProject } from "@lib/projects";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();

    const project = await createProject({
      title: String(formData.get("title") ?? ""),
      slug: String(formData.get("slug") ?? ""),
      client: String(formData.get("client") ?? "") || null,
      description: String(formData.get("description") ?? "") || null,
      cover_image: null,
      featured: false,
      published: false,
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