export interface Project {
  id: string;

  slug: string;
  title: string;
  client: string | null;
  description: string | null;

  cover_image: string | null;

  featured: boolean;
  published: boolean;

  created_at: string;
  updated_at: string;
}