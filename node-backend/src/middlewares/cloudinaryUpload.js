import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { config } from "../constants/config.js";

cloudinary.config({
  cloud_name: config.CLOUDINARY_CLOUD_NAME,
  api_key: config.CLOUDINARY_API_KEY,
  api_secret: config.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();

const imageMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

const multerUpload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (!imageMimeTypes.includes(file.mimetype)) {
      cb(new Error("Only image files are allowed"));
      return;
    }
    cb(null, true);
  },
});

const uploadToCloudinary = (fileBuffer, folder) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(result.secure_url);
      },
    );

    uploadStream.end(fileBuffer);
  });
};

export const uploadDocuments = [
  multerUpload.array("verificationDocuments", 10),
  async (req, res, next) => {
    try {
      if (!req.files || req.files.length === 0) {
        req.body.verificationDocuments = [];
        return next();
      }

      const uploadedUrls = await Promise.all(
        req.files.map((file) =>
          uploadToCloudinary(file.buffer, "fairgig/verification-documents"),
        ),
      );

      req.body.verificationDocuments = uploadedUrls;
      next();
    } catch (error) {
      next(error);
    }
  },
];
