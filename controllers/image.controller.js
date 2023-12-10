const { ImageUpload, Post, Category} = require("../models");
const ApiError = require("../errors/ApiError");

// const Image = require("../config/firebase");
const firebase = require("firebase");
const {categoryPhotos} = require("../utils/unsplash");
const uploadToGCS = require("../helpers");

class ImageController {
    imageUploadUnsplash = async (req, res, next) => {
        let {docId} = req.body;

        docId = decodeURIComponent(docId);

        let image = await ImageUpload.findOne({
              where: {
                  docId: docId
              }
        })

        if(image) {
            let post = await Post.findOne({
                where: {
                    docId: docId
                }
            })
            image = { ...image, regular: post.dataValues.doc, postId: post.dataValues.id };
            return res.send(image);
        }

        let userId = [13, 14];
        userId = userId[parseInt(Math.random()) * 2];

        ImageUpload.create({
             docId: docId,
             title: "A picture!",
             description: "Image created by unplash",
             categoryId: 1
        }).then((image) => {
            Post.create({
                 userId: userId,
                 docId: docId
            }).then((post) => {
                res.status(201).send({
                    docId,
                    regular: docId,
                    id: post.dataValues.id,
                    userId: userId
                })
            })
        }).catch((err) => {
            console.log(`create image error ${err}`)
            return next(ApiError.internalServerError(err.toString()))
        })
    }

    imageUpload = async (req, res, next) => {
        let { title, description, categoryId, userId } = req.body;

        title = title.trim();
        description = description.trim();

        if(title.length === 0 || description.length === 0 || categoryId === null || userId === null) {
            return next(ApiError.badRequest("Required: title, description, categoryId, and userId"));
        }

        const data = req.file.buffer.toString('base64');
        const imageAdded = await Image.add({data});

        // saving image data to imageUpload table
        ImageUpload.create({
            docId: imageAdded.id,
            title: title,
            description: description,
            categoryId: categoryId
        }).then((image) => {
            Post.create({
                userId: userId,
                imageId: image.id
            }).then(() => {
                res.status(201).send({message: "Image created successfully"})
            })
        }).catch((err) => {
            console.log(`create image error ${err}`)
            return next(ApiError.internalServerError(err.toString()))
        })
    }

    // getImageById = async (req, res, next) => {
    //     const { imageId } = req.params;

    //     const snapshot = await Image.get();

    //     let bufferData = "";

    //     for(let index = 0; index < snapshot.docs.length; index ++) {
    //         let currentDoc = snapshot.docs[index];
    //         if(currentDoc.id === imageId) {
    //             bufferData = currentDoc.data().data;
    //         }
    //     }

    //     res.send(bufferData);
    // }

    getImageById = async (req, res, next) => {
        const { imageId } = req.params;
    
        try {
            // Retrieve the document from Firestore using imageId
            const docRef = firebase.firestore().collection('YourCollectionName').doc(imageId);
            const doc = await docRef.get();
    
            if (!doc.exists) {
                return next(ApiError.badRequest('No document found with the given ID'));
            }
    
            // Extract the filename or storage path from the document
            // Replace 'storagePath' with the actual field name in your document
            const storagePath = doc.data().storagePath;
    
            // Retrieve the download URL from Firebase Storage
            const storageRef = firebase.storage().ref();
            const imageRef = storageRef.child(storagePath);
            
            imageRef.getDownloadURL()
                .then((url) => {
                    // Send the URL as the response
                    res.send({ url });
                })
                .catch((error) => {
                    console.log(`Error getting image URL: ${error}`);
                    return next(ApiError.internalServerError(error.toString()));
                });
        } catch (error) {
            console.log(`Error: ${error}`);
            return next(ApiError.internalServerError(error.toString()));
        }
    };

    getImages = async(req, res, next) => {
        const snapshot = await Image.get();
        const data = snapshot.docs.map((doc) => doc.id);
        res.send(data);
    }

    getCategoryImages = async(req, res) => {
        let data = await categoryPhotos(req.query.term);
        data = data.results.map((image) => image.urls);
        res.send(data);
    }

    // only performing image upload
    // uploadImage = async (req, res, next) => {
    //     try {
    //         if (!req.file) {
    //             throw new Error('No file uploaded');
    //         }
    
    //         uploadToGCS(req.file, (error, imageUrl) => {
    //             if (error) {
    //                 console.error("Error during image upload:", error.message);
    //                 return next(error);
    //             }
    
    //             console.log("image url is:", imageUrl);
    
    //             res.status(200).json({
    //                 message: "Upload was successful",
    //                 data: { url: imageUrl, name: req.file.originalname }
    //             });
    //         });
    //     } catch (error) {
    //         console.error("Error during image upload:", error.message);
    //         next(error);
    //     }
    // };
    
    // performing image upload and saving image data to imageUpload table
    uploadImage = async (req, res, next) => {
        try {
            if (!req.file) {
                throw new Error('No file uploaded');
            }
    
            let { title, description, category } = req.body;
            const { userId } = req.query;
    
            let uniqueTitle = title; 
            let counter = 0;
    
            while (true) {
                const titleToCheck = counter > 0 ? `${uniqueTitle} (${counter})` : uniqueTitle;
                const existingImage = await ImageUpload.findOne({
                    where: { title: titleToCheck }
                });
    
                if (!existingImage) {
                    uniqueTitle = titleToCheck;
                    break;
                }
    
                counter++;
            }
    
            uploadToGCS(req.file, uniqueTitle, async (error, imageUrl) => {
                if (error) {
                    console.error("Error during image upload:", error.message);
                    return next(error);
                }
    
                const [categoryRecord, created] = await Category.findOrCreate({
                    where: { name: category.toLowerCase() },
                    defaults: { name: category.toLowerCase() }
                });
    
                const imageUpload = await ImageUpload.create({
                    docId: imageUrl,
                    title: uniqueTitle,
                    description: description,
                    categoryId: categoryRecord.id
                });
    
                const post = await Post.create({
                    userId: userId,
                    docId: imageUpload.docId,
                });
    
                res.status(200).json({
                    message: "Upload and post creation successful",
                    data: {
                        post: post,
                        imageUpload: imageUpload
                    }
                });
            });
        } catch (error) {
            console.error("Error during image upload and post creation:", error.message);
            next(error);
        }
    };
    
    
}

module.exports = new ImageController();