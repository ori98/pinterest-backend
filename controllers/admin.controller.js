const { Post, User, ImageUpload } = require("../models");

const ApiError = require("../errors/ApiError");

class AdminController {
    deleteUser = async (req, res, next) => {
        try {
            const userId = req.query.userId; 
    
            if (!userId) {
                return res.status(400).json({
                    success: false,
                    message: 'User ID is required'
                });
            }
    
            const user = await User.findByPk(userId);
            if (user) {
                await user.destroy();
                return res.status(200).json({
                    success: true,
                    message: 'User deleted successfully'
                });
            } else {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }
        } catch (error) {
            return next(error); 
        }
    };

    deletePost = async (req, res, next) => {
        try {
            const postId = req.query.postId;
    
            if (!postId) {
                return res.status(400).json({
                    success: false,
                    message: 'Post ID is required'
                });
            }
    
            const post = await Post.findByPk(postId);
    
            if (!post) {
                return res.status(404).json({
                    success: false,
                    message: 'Post not found'
                });
            }
    
            const postDocId = post.docId;
    
            console.log("Looking for imageUpload with docId", postDocId);
            const imageUpload = await ImageUpload.findOne({
                where: { docId: postDocId }
            });
    
            if (imageUpload) {
                console.log("Deleting imageUpload with docId:", postDocId);
                await imageUpload.destroy();
    
                // Optionally, delete the post as well after deleting the image
                await post.destroy();
    
                return res.status(200).json({
                    success: true,
                    message: 'Associated image and post deleted successfully'
                });
            } else {
                console.log("No matching imageUpload found for docId:", postDocId);
                return res.status(404).json({
                    success: false,
                    message: 'Associated image not found'
                });
            }
    
        } catch (error) {
            console.error("Error during post deletion:", error);
            return next(error);
        }
    };
    
    

    getAllUsers = async (req, res, next) => {
        try {
            const users = await User.findAll({
                attributes: {
                    exclude: ['password']
                }
            });
    
            return res.status(200).json({
                success: true,
                users
            });
        } catch (error) {
            return next(error);
        }
    };

    getAllPosts = async (req, res, next) => {
        try {
            const posts = await Post.findAll({
                include: [
                    {
                        model: User,
                        as: 'user',
                        attributes: {
                            exclude: ['password']
                        },
                    },
                    {
                        model: ImageUpload,
                        as: 'imageUpload',
                        attributes: ['title', 'description']
                    }
                ]
            });
    
            return res.status(200).json({
                success: true,
                posts
            });
        } catch (error) {
            return next(error);
        }
    };
}

module.exports = new AdminController();