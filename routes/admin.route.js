const express = require('express');

const router = express.Router();
const AdminController = require("../controllers/admin.controller");
const isBodyValid = require("../middlewares/body-validator");

// pass the user id in the query

router.delete('/deleteUser', AdminController.deleteUser);

// pass the post id 
router.delete('/deletePost', AdminController.deletePost);

// get all the users (without password)
router.get('/getAllUsers', isBodyValid, AdminController.getAllUsers);

// get all the posts
router.get('/getAllPosts', isBodyValid, AdminController.getAllPosts);

module.exports = router;