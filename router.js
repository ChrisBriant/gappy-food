const express = require('express');
const router = express.Router();
const userController = require('./controllers/userController');
const reviewController = require('./controllers/reviewController');
const multer = require("multer")
const upload = multer({ dest: "public/media" })

router.get('/', userController.home);
router.post('/register',userController.register);
router.post('/login', userController.login);
router.post('/logout',userController.logout);
//router.post('/addreview',reviewController.addReview);
router.route("/addreview").post(upload.array('files', 8), reviewController.addReview);

module.exports = router;