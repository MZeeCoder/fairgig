import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { config } from "../constants/config.js";

cloudinary.config({
  cloud_name: config.CLOUDINARY_CLOUD_NAME,
  api_key: config.CLOUDINARY_API_KEY,
  api_secret: config.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();

const mimeTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/jpg",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const multerUpload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (!mimeTypes.includes(file.mimetype)) {
      cb(new Error("Only image, PDF, and DOC files are allowed"));
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
        resource_type: "auto",
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
