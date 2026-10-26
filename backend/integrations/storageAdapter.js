import cloudinary from "../config/cloudinary.js";

export async function uploadProductImage(file) {

  const imageUrl = file.path;

  return {
    path: file.filename,
    url: imageUrl,
  };
}

export async function removeProductImage(
  publicId
) {
  await cloudinary.uploader.destroy(
    publicId
  );
}