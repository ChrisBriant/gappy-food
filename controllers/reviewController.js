const Review = require('../models/Review');

exports.addReview = async function(req,res) {
    let review = new Review(req.body, req.files);
    try {
        await review.addReview();
        res.render('home-dashboard', {errors:[]});
    } catch (err) {
        err.forEach(function(error) {
            req.flash('errors',error);
        });
        await req.session.save();
        res.redirect('/admin');
    }
}   