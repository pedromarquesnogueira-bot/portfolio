import { Cloudinary } from "@cloudinary/url-gen";
import { env } from "@lib/env";

export const cloudinary = new Cloudinary({
  cloud: {
    cloudName: env.cloudinaryCloudName,
  },
});