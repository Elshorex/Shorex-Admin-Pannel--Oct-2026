// import multer from "multer";
// import path from "path";
// import mkdirp from "mkdirp";
// import ApiError from "../helpers/ApiError.js";
// import { v2 as cloudinary } from "cloudinary";
// import { CloudinaryStorage } from "multer-storage-cloudinary";
// // import { v4 as uuidv4 } from "uuid";
// import config from "../config.js";
// import pkg from "uuid"; // <-- change here
// const { v4: uuidv4 } = pkg; // <-- destructure v4

// cloudinary.config({
//   cloud_name: config.cloudinary.cloud_name,
//   api_key: config.cloudinary.api_key,
//   api_secret: config.cloudinary.api_secret,
// });

// export function multerSaveTo(folderName) {
//   let storage;

//   if (config.NODE_ENV === "production") {
//     storage = new CloudinaryStorage({
//       cloudinary,
//       params: async (req, file) => {
//         const mime = file.mimetype.split("/")[0];
//         const originalExt = path.extname(file.originalname).replace(".", ""); // pdf, docx, mp4, etc.
//         const baseName = path.basename(file.originalname, path.extname(file.originalname));

//         const options = {
//           folder: folderName,
//           public_id: `${uuidv4()}_${baseName}`, // keeps original filename for readability
//         };

//         if (mime === "image") {
//           options.resource_type = "image";
//           options.format = originalExt || "png";
//         } else {
//           options.resource_type = "raw";
//           options.format = originalExt; // ✅ ensures extension is preserved
//         }

//         return options;
//       },
//     });
//   } else {
//     // your local disk logic stays the same
//   }

//   return multer({
//     storage,
//     limits: {
//       fieldNameSize: 1024 * 1024 * 10,
//       fieldSize: 1024 * 1024 * 50,
//     },
//   });
// }


import multer from "multer";
import path from "path";
// import { v4 as uuidv4 } from "uuid";
import pkg from "uuid"; // <-- change here
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import ApiError from "../helpers/ApiError.js";
import config from "../config.js";
const { v4: uuidv4 } = pkg; // <-- destructure v4

cloudinary.config({
  cloud_name: config.cloudinary.cloud_name,
  api_key: config.cloudinary.api_key,
  api_secret: config.cloudinary.api_secret,
});

// File size limits in bytes
const IMAGE_MAX_SIZE = 20 * 1024 * 1024; // 20MB
const VIDEO_MAX_SIZE = 100 * 1024 * 1024; // 100MB

export function multerSaveTo(folderName) {
  const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {
      const ext = path.extname(file.originalname).replace(".", "");
      const mimeType = file.mimetype.split("/")[0];

      let resourceType = "raw"; // fallback

      if (mimeType === "image") {
        resourceType = "image";
      } else if (mimeType === "video") {
        resourceType = "video";
      }

      return {
        folder: folderName,
        public_id: `${uuidv4()}`,
        resource_type: resourceType,
        format: ext,
      };
    },
  });

  const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
      const mime = file.mimetype.split("/")[0];

      // Image validation
      if (mime === "image") {
        if (file.size > IMAGE_MAX_SIZE) {
          return cb(
            new ApiError(
              400,
              `Image too large. Max allowed size is ${IMAGE_MAX_SIZE / (1024 * 1024)}MB`
            ),
            false
          );
        }
      }

      // Video validation
      if (mime === "video") {
        if (file.size > VIDEO_MAX_SIZE) {
          return cb(
            new ApiError(
              400,
              `Video too large. Max allowed size is ${VIDEO_MAX_SIZE / (1024 * 1024)}MB`
            ),
            false
          );
        }
      }

      cb(null, true);
    },

    limits: {
      // Must allow at least the max file sizes
      fileSize: VIDEO_MAX_SIZE, // highest limit wins
    },
  });

  return upload;
}
