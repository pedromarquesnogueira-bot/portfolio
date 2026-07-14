export const env = {
  supabaseUrl: import.meta.env.PUBLIC_SUPABASE_URL!,
  supabaseAnonKey: import.meta.env.PUBLIC_SUPABASE_ANON_KEY!,

  cloudinaryCloudName:
    import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME!,

  cloudinaryUploadPreset:
    import.meta.env.PUBLIC_CLOUDINARY_UPLOAD_PRESET!,

  plausibleDomain:
    import.meta.env.PUBLIC_PLAUSIBLE_DOMAIN!,
};