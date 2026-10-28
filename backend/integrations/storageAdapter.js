import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "products",
    allowed_formats: ["jpg", "jpeg", "png"]
  }
});

export const imageUpload = multer({
  storage,
  limits: {
    fileSize: 4 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png"
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      return cb(
        new Error("Endast JPEG och PNG är tillåtna")
      );
    }

    cb(null, true);
  }
});

export const handleUpload = (req, res, next) => {
  imageUpload.single("image")(req, res, (err) => {

    if (err instanceof multer.MulterError &&
        err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        error: "Bilden är för stor. Max 4 MB."
      });
    }

    if (err) {
      return res.status(400).json({
        error: err.message
      });
    }

    next();
  });
};

export async function removeProductImage(publicId) {
  await cloudinary.uploader.destroy(publicId);
}
