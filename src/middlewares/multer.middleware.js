import multer from "multer";


const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/tiff',
    'image/bmp',
    'image/svg+xml',
    'video/mp4',
    'video/ogg',
    'video/webm',
    'video/x-msvideo',
    'video/quicktime',
    'video/x-ms-wmv',
    'video/mpeg'
  ];

function fileFilter (req, file, cb) {

    // The function should call `cb` with a boolean
    // to indicate if the file should be accepted
  
    // To reject this file pass `false`, like so:
    if (!allowedMimeTypes.includes(file.mimetype)) {
        cb(null, false)
    } else {
        cb(null, true)
    }
  
    // To accept the file pass `true`, like so:
    // You can always pass an error if something goes wrong:
    cb(new Error('Unable to process file'))
  }

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    const uniquePrefix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniquePrefix + "-" + file.originalname);
  },
});

export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
  fileFilter
});
