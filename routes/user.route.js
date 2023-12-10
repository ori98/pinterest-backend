const express = require('express');
const UserController = require('../controllers/user.controller');

const isBodyValid = require('../middlewares/body-validator');
const router = express.Router();

// route to sign up
router.post('/sign-up', isBodyValid, UserController.signUp);

// route to sign in
router.post('/log-in', isBodyValid, UserController.login);

// route for the details page query:
router.get('/details', UserController.details);

// getting posts for the home page 
router.get('/get-posts', UserController.getPosts);

// route to sign in
router.get('/log-in', isBodyValid, UserController.login);

// route for saving posts
router.post('/savePost', isBodyValid, UserController.savePost)

// route for saving comments
router.post('/comment', isBodyValid, UserController.createComment)

// route to get profile data based on userId
router.get('/profile/:userId', isBodyValid, UserController.profile);

// route to updating profile data based on userId
router.put('/profile/:userId', isBodyValid, UserController.updateProfile);

// route for updating profile password based on userId
router.put('/password/:userId', isBodyValid, UserController.updatePassword)

// route for getting images created by a user
router.get('/image/createdByUser/:userId', isBodyValid, UserController.getImagesCreatedByUserId)

// route for getting images saved by a user
router.get('/image/savedByUser/:userId', isBodyValid, UserController.getImagesSavedByUserId)

module.exports = router;