const ApiError = require('../errors/ApiError');
const { User, sequelize, Post, SavedPosts, ImageUpload, Comments, UserFollowerImage } = require('../models');
const { randomPhoto } = require("../utils/unsplash");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

class UserController {
    // create a new user
    signUp = async (req, res, next) => {
        if (checkInvalidPassword(req.body.password, next)) {
            return next(ApiError.badRequest("Please enter a password that meets the following requirements: "
                + "at least 8 characters long, includes a mix of upper and lower "
                + "case letters, at least one numeric digit, and at least one "
                + "special character."))
        }
        if (/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(req.body.email) !== true) {
            return next(ApiError.badRequest("please enter valid email"))
        }
        let isEmailExist = await isEmailExistCheck(req.body.email)
        if (isEmailExist) {
            return next(ApiError.conflict("Email already exists"))
        }
        const hash = await bcrypt.hash(req.body.password, 10);
        User.create({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            userrole: req.body.userrole,
            password: hash
        }).then((newUser) => {
            const token = jwt.sign({
                id: newUser.id,
                email: newUser.email
            }, process.env.JWT_KEY, {
                issuer: "orijit",
                expiresIn: "1h"
            })
            res.status(201).json({
                message: "User created successfully",
                token: token
            });
        }).catch((err) => {
            console.log(`create user error ${err}`)
            return next(ApiError.internalServerError(err.toString()))
        })
    };

    // get all users
    // getAllUsers = async (req, res, next) => {
    //     res.send({type: 'GET'});
    // };

    // log in user
    // login = async (req, res, next) => {
    //     User.findOne({
    //                      where: {
    //                          email: req.body.email
    //                      },
    //                  }).then((user) => {
    //         if (user) {
    //             bcrypt.compare(req.body.password, user.dataValues.password, (err, hashResult) => {
    //                 if (err) {
    //                     return next(ApiError.unAuthorized("invalid password"))
    //                 }
    //                 if (hashResult) {
    //                     const token = jwt.sign({
    //                                                id: user.dataValues.id,
    //                                                email: user.dataValues.email,
    //                                            }, process.env.JWT_KEY, {
    //                                                issuer: "orijit",
    //                                                expiresIn: "1h"
    //                                            })
    //                     return res.status(200).json({
    //                                                     status: true,
    //                                                     message: "auth successful",
    //                                                     email: user.dataValues.email,
    //                                                     token: token
    //                                                 })
    //                 }
    //                 return next(ApiError.notFound("authentication failed"))
    //             })
    //         } else {
    //             return next(ApiError.notFound("email does not exists"))
    //         }
    //     }).catch((error) => {
    //         return next(ApiError.internalServerError(error))
    //     });
    // };

    // modified login for admin
    login = async (req, res, next) => {
        const { email, password } = req.body;

        // Check for admin login
        if (email === "admin@admin.com") {
            if (password === "Admin@123") {
                const token = jwt.sign({ email: email }, process.env.ADMIN_JWT_KEY, {
                    expiresIn: "1h",
                });
                return res.status(200).json({
                    success: true,
                    message: "Admin logged in successfully",
                    token: token,
                });
            } else {
                return next(ApiError.unAuthorized("Admin authentication failed"));
            }
        }

        // Regular user authentication
        User.findOne({
            where: {
                email: email
            },
        }).then((user) => {
            if (user) {
                bcrypt.compare(password, user.dataValues.password, (err, hashResult) => {
                    if (err) {
                        return next(ApiError.unAuthorized("invalid password"))
                    }
                    if (hashResult) {
                        const token = jwt.sign({
                            id: user.dataValues.id,
                            email: user.dataValues.email,
                        }, process.env.JWT_KEY, {
                            issuer: "orijit",
                            expiresIn: "1h"
                        })
                        return res.status(200).json({
                            status: true,
                            message: "auth successful",
                            email: user.dataValues.email,
                            token: token
                        })
                    }
                    return next(ApiError.notFound("authentication failed"))
                })
            } else {
                return next(ApiError.notFound("email does not exist"))
            }
        }).catch((error) => {
            return next(ApiError.internalServerError(error))
        });
    };

    // create comments
    createComment = async (req, res, next) => {
        await Comments.create(req.body)
            .then((comment) => {
                res.send(comment)
            })
            .catch((err) => {
                console.log(`create comment error ${err}`)
                return next(ApiError.internalServerError(err.toString()))
            });
    }

    // save post
    savePost = async (req, res, next) => {
        const post = await SavedPosts.findOne({
            where: {
                postId: req.body.postId,
                userId: req.body.userId
            }
        })

        if (post) {
            return next(ApiError.conflict("You have already saved this post!"))
        }

        await SavedPosts.create(req.body)
            .then((post) => {
                res.send(post)
            })
            .catch((err) => {
                console.log(`saving post error ${err}`)
                return next(ApiError.internalServerError(err.toString()))
            });
    }

    // get details for the post details page
    details = async (req, res, next) => {
        try {
            let { docId, userId, postId } = req.query;

            // Fetch post with associated user, image details, and comments
            const postDetails = await Post.findOne({
                where: { id: postId },
                include: [
                    {
                        model: ImageUpload,
                        as: 'imageUpload',
                        attributes: ['title', 'description'],
                        required: true // set to false if it is not mandatory for a post to have an image
                    },
                    {
                        model: User,
                        as: 'user',
                        where: { id: userId },
                        attributes: ['id', 'firstName', 'lastName'],
                        required: false
                    },
                    {
                        model: Comments,
                        as: 'comments',
                        attributes: ['content'],
                        required: false, // Set to true if a post must always have comments
                        include: [
                            {
                                model: User,
                                as: 'user',
                                attributes: ['firstName', 'lastName']
                            }
                        ]
                    }
                ]
            });

            if (!postDetails) {
                return res.status(404).json({
                    success: false,
                    message: 'Post not found'
                });
            }

            res.status(200).json({
                success: true,
                postDetails
            });
        }
        catch (err) {
            res.status(500).json({
                success: false,
                error: err.message
            });
        }
    };

    // getting the posts for home page
    getPosts = async (req, res, next) => {
        try {
            const posts = await Post.findAndCountAll();
            if (!posts || posts.count === 0) {
                return next(ApiError.notFound("No posts found"));
            }
            // Send the fetched posts as a response
            res.json({
                message: "Posts fetched successfully",
                data: posts.rows
            });
        } catch (error) {
            // Handle any errors that occur during the fetching process
            return next(ApiError.internal("An error occurred while fetching posts"));
        }
    };

    // gets user's data based on userId
    // profile = async (req, res, next) => {
    //     const { userId } = req.params;
    //     const user = await User.findOne({
    //                                         where: {
    //                                             id: userId
    //                                         }
    //                                     })
    //     if(!user) {
    //         return res.send();
    //     }

    //     let photo = await randomPhoto();
    //     let photoUrl = photo[0].urls.raw;

    //     res.send({
    //                  firstName: user.firstName,
    //                  lastName: user.lastName,
    //                  email: user.email,
    //                  followers: parseInt(Math.random() * 23),
    //                  following: parseInt(Math.random() * 23),
    //                  profilePicture: photoUrl
    //              });
    // }

    // updating getting profile data based on userId

    profile = async (req, res, next) => {
        const { userId } = req.params;
        const user = await User.findOne({ where: { id: userId } });
        if (!user) {
            return res.send();
        }

        const userFollowerImageId = userId % 5 === 0 ? 5 : userId % 5;
        const userFollowerImage = await UserFollowerImage.findOne({ where: { id: userFollowerImageId } });

        let followerCount, followingCount, profileImage;
        if (userFollowerImage) {
            followerCount = userFollowerImage.followerCount;
            followingCount = userFollowerImage.followingCount;
            profileImage = userFollowerImage.profileImage;
        } else {
            followerCount = 0;
            followingCount = 0;
            profileImage = null;
        }

        res.send({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            followers: followerCount,
            following: followingCount,
            profilePicture: profileImage
        });
    };


    // update user's data based on userId
    updateProfile = async (req, res, next) => {
        const { userId } = req.params;
        let user = await User.findOne({
            where: {
                id: userId
            }
        })
        if (!user) {
            return res.send();
        }
        let updatedUser = {
            ...user.dataValues,
            ...req.body
        };
        const status = await User.update(updatedUser, {
            where: {
                id: userId
            }
        });
        res.send(status);
    }

    // update user's password based on userId
    updatePassword = async (req, res, next) => {
        const { userId } = req.params;
        let user = await User.findOne({
            where: {
                id: userId
            }
        })
        if (!user) {
            return res.send();
        }
        bcrypt.compare(req.body.oldPassword, user.dataValues.password, async (err, hashResult) => {
            if (err) {
                return next(ApiError.unAuthorized("Authentication failed"))
            }
            if (hashResult) {
                if (checkInvalidPassword(req.body.newPassword)) {
                    return next(ApiError.badRequest("Please enter a password that meets the following requirements: "
                        + "at least 8 characters long, includes a mix of upper and lower "
                        + "case letters, at least one numeric digit, and at least one "
                        + "special character."))
                }
                let newPasswordHash = await bcrypt.hash(req.body.newPassword, 10);
                let updatedUser = {
                    ...user,
                    password: newPasswordHash
                }
                const status = await User.update(updatedUser, {
                    where: {
                        id: userId
                    }
                });
                return res.send(status);
            }
            return next(ApiError.notFound("Old password is incorrect"))
        })
    }

    getImagesCreatedByUserId = async (req, res, next) => {
        const { userId } = req.params;
        // Get posts for a particular user
        let posts = await Post.findAll({
            where: {
                userId: userId
            }
        })
        for (let index = 0; index < posts.length; index++) {
            let currPost = posts[index].dataValues;
            posts[index] = {
                id: currPost.id,
                docId: currPost.docId,
                userId: currPost.userId
            }
        }
        res.send({
            posts
        });
    }

    getImagesSavedByUserId = async (req, res, next) => {
        const { userId } = req.params;
        // Get saved posts for a particular user
        let savedPostIds = await SavedPosts.findAll({
            attributes: ['postId'],
            where: {
                userId: userId
            }
        })
        savedPostIds = savedPostIds.map((post) => post.dataValues.postId);
        // Get postids for saved posts
        let savedPosts = await Post.findAll({
            where: {
                id: savedPostIds
            }
        })
        for (let index = 0; index < savedPosts.length; index++) {
            let currPost = savedPosts[index].dataValues;
            savedPosts[index] = {
                id: currPost.id,
                docId: currPost.docId,
                userId: currPost.userId
            }
        }
        res.send({
            posts: savedPosts
        })
    }
}
// checking if email exists
isEmailExistCheck = async (email) => {
    return await User.findOne({
        where: {
            email: email
        }
    })
}
// check for valid password
checkInvalidPassword = (password, next) => {
    return (password === undefined || password.trim().length < 8);
}
module.exports = new UserController();