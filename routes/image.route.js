const express = require('express');
const ImageController = require('../controllers/image.controller');

const isBodyValid = require('../middlewares/body-validator');
const router = express.Router();
const multer = require('multer');
const storage = multer.memoryStorage(); // Store the file in memory

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 3000000, // 3MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true); // Accept the file
        } else {
            cb(new Error('Invalid file type'));
        }
    },
});

// route for image upload
// router.post('/image-upload', isBodyValid, upload.single('file'), ImageController.imageUpload)

// route for getting images
router.get('/', isBodyValid, ImageController.getImages)

// route for getting image for image id
router.get('/image/:imageId', isBodyValid, ImageController.getImageById)

// route for saving unsplash image
router.post('/imageUploadUnsplash', isBodyValid, ImageController.imageUploadUnsplash)

// route for getting images for a category
router.get('/getCategoryImages', isBodyValid, ImageController.getCategoryImages)

// route for posting image to gcp
// Assuming 'upload' is your configured multer instance
// get the id from the query param
// get the body from the request body
router.post('/uploadImage', upload.single('file'), ImageController.uploadImage);

module.exports = router;