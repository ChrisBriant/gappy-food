const Review = require('../models/Review');

exports.addReview = async function(req,res) {
    let review = new Review(req.body, req.files);
    try {
        let result = await review.addReview();
        req.flash('success', result);
        await req.session.save();
        res.redirect('/admin');
        //res.render('home-dashboard', {errors:[], success: req.flash('success')});
    } catch (err) {
        err.forEach(function(error) {
            req.flash('errors',error);
        });
        await req.session.save();
        res.redirect('/admin');
    }
}   