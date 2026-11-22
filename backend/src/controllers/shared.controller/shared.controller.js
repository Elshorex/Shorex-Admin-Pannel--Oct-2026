import fs from 'fs';
import ApiError from '../../helpers/ApiError.js';
import { validationResult } from 'express-validator';
import { matchedData } from 'express-validator';
import { toImgUrl, toFileUrl } from '../../utils/index.js';


export function createPromise(query) {
    let newPromise = new Promise(async (resolve, reject) => {
        try {
            const result = await query;
            resolve(result);
        } catch (error) {
            reject(error);
        }
    });
    return newPromise;
}

function deleteTempImages(req) {
    if (req.files) {
        console.log("req.files.length======", req.files.length)
        if (req.files.length && req.files.length > 0) {
            req.files.forEach(element => {
                fs.unlink(element.path, (err) => {
                    if (err) throw err;
                    console.log('file deleted');
                });
            });
        } else {
            let files = req.files;
            //console.log(files)
            for (let element in files) {

                files['' + element].forEach(file => {
                    fs.unlink(file.path, (err) => {
                        if (err) throw err;
                        console.log('file deleted');
                    });
                });

            };
        }
    }
    if (req.file) {
        fs.unlink(req.file.path, (err) => {
            if (err) throw err;
            console.log('file deleted');
        });
    }
}


export function deleteImages(images) {
    if (images.length && images.length > 0) {
        images.forEach(element => {
            console.log(element)
            if (fs.existsSync('.'+element))
                fs.unlink('.'+element, (err) => {
                    if (err) throw err;
                    console.log('file deleted');
                });
        });
    }
}
export const localeFn = (localeName) => (value, { req }) => req.__(localeName);

export function checkValidations(req) {

    const validationErrors = validationResult(req).array({ onlyFirstError: true });

    if (validationErrors.length > 0) {
        deleteTempImages(req);

        throw new ApiError(422, validationErrors);
    }

    return matchedData(req);
}

export function handleImgs(
  req,
  { attributeName = 'images', isUpdate = false } = {},
  errMessage = ''
) {
  if ((req.files && req.files.length > 0) || (isUpdate && req.body[attributeName])) {
    let images = [];

    // ✅ Retain existing images when updating
    if (isUpdate && req.body[attributeName]) {
      if (Array.isArray(req.body[attributeName])) {
        images = req.body[attributeName];
      } else {
        images.push(req.body[attributeName]);
      }
    }

    // ✅ Add newly uploaded files
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        if (file.path && file.path.startsWith("http")) {
          // Cloudinary upload → full URL already
          images.push(file.path);
        } else {
          // Local upload → build relative URL
          images.push(toImgUrl(req, file));
        }
      }
    }

    return images;
  }

  throw new ApiError.UnprocessableEntity(errMessage || `${attributeName} are required`);
}

export function handleImg(req, { attributeName = 'img', isUpdate = false } = {}) {
  if (req.file || (isUpdate && req.body[attributeName])) {
    // If Cloudinary upload
    if (req.file && req.file.path && req.file.path.startsWith('http')) {
      return req.file.path; // Cloudinary already returns full URL
    }

    // If local upload
    return req.body[attributeName] || toImgUrl(req, req.file);
  }

  throw new ApiError.UnprocessableEntity(`${attributeName} is required`);
}

export function handleFiles(req, { attributeName = 'files', isUpdate = false } = {}) {
    if (req.files && req.files.length > 0 || (isUpdate && req.body[attributeName])) {
        let files = [];
        if (isUpdate && req.body[attributeName]) {
            if (Array.isArray(req.body[attributeName]))
                files = req.body[attributeName];
            else
                files.push(req.body[attributeName]);
        }

        for (const file of req.files) {
            files.push(toFileUrl(req, file));
        }
        return files;
    }
    throw new ApiError.UnprocessableEntity(`${attributeName} are required`);
}
export function parseObject(arrayOfFields, update = false, fieldName = 'body') {
    return (req, res, next) => {
        try {
            for (let index = 0; index < arrayOfFields.length; index++) {
                let name = arrayOfFields[index];
                if (req[fieldName][name]) {
                    req[fieldName][name] = JSON.parse(req[fieldName][name]);
                }
            }
            return next()
        } catch (error) {
            return next(error);
        }
    }
}
export function fieldhandleImg(req, { attributeName = 'images', isUpdate = false } = {}) {
  if (
    (req.files && req.files[attributeName] && req.files[attributeName].length > 0) ||
    (isUpdate && req.body[attributeName])
  ) {
    let images = [];

    if (req.files && req.files[attributeName]) {
      for (let index = 0; index < req.files[attributeName].length; index++) {
        const file = req.files[attributeName][index];

        // ✅ If Cloudinary upload (already a full URL)
        if (file.path && file.path.startsWith("http")) {
          images.push(file.path);
        } else {
          // ✅ If local upload (convert to relative path)
          images.push(toImgUrl(req, file));
        }
      }
    } else if (isUpdate && req.body[attributeName]) {
      // ✅ In update mode, reuse existing URLs
      images = Array.isArray(req.body[attributeName])
        ? req.body[attributeName]
        : [req.body[attributeName]];
    }

    return images;
  }

  throw new ApiError.UnprocessableEntity(`${attributeName} are required`);
}

export function removeFile(file = '', files = []) {
    if (files.length > 0) {
        files.forEach(element => {
            fs.unlink(element, (err) => {
                if (err) throw err;
                console.log('file deleted');
            });
        });
    } else {
        fs.unlink(file, (err) => {
            if (err) throw err;
            console.log('file deleted');
        });
    }
}