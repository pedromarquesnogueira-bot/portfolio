import type { APIRoute } from "astro";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const formData = await request.formData();

  const file = formData.get("file");

  if (!(file instanceof File)) {
    return new Response("Arquivo inválido.", {
      status: 400,
    });
  }

  const uploadData = new FormData();

  uploadData.append("file", file);
  uploadData.append(
    "upload_preset",
    import.meta.env.PUBLIC_CLOUDINARY_UPLOAD_PRESET
  );

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME}/auto/upload`,
    {
      method: "POST",
      body: uploadData,
    }
  );

  const result = await response.json();
  if (!response.ok) return Response.json(result, { status: response.status });
  return Response.json(result);
};
