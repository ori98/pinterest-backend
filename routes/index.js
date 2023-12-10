let express = require('express');
let router = express.Router();
let userRoute = require('./user.route')
let imageRouter = require('./image.route')
let adminRoute = require('./admin.route')

// router.get('/', function (req, res, next) {
//     res.render('index', {title: 'Express'});
// });

router.get("/", (req, res) => {res.send("Welcome to the Pinterest API")});

router.use('/users', userRoute)

router.use('/admin', adminRoute)

router.use('/images', imageRouter)

router.all('*', function (req, res) {
    res.status(404).json({
        success: false,
        message: "API route does not exists. Please check with API documentation or request method."
    });
});

module.exports = router;