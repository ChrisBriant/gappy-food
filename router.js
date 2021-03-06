const express = require('express');
const router = express.Router();
const userController = require('./controllers/userController');
const reviewController = require('./controllers/reviewController');
const frontEndController = require('./controllers/frontEndController');
const multer = require("multer")
const upload = multer({ dest: "public/media" })

//Frontend routes
router.get('/',frontEndController.home);
router.get('/review/:id',frontEndController.review);
//Backend routes
router.get('/admin', userController.adminHome);
router.post('/register',userController.register);
router.post('/login', userController.login);
router.post('/logout',userController.logout);
//router.post('/addreview',reviewController.addReview);
router.route("/addreview").post(upload.array('files', 8), userController.adminRequired, reviewController.addReview);

module.exports = router;