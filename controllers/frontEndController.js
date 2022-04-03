//const { ObjectID } = require('bson');
const Review = require('../models/Review');

exports.home = async function(req,res) {
    let latest = [];
    let reviews = [];
    try {
        latest = await Review.getLatest();
        reviews = await Review.getReviews();
        res.render('home', {latest, reviews, errors:req.flash('errors')});
    } catch(err) {
        req.flash('errors',err);
        res.render('home', {latest, errors:req.flash('errors')});
    }
}


exports.review = async function(req,res) {
    let review = await Review.getSingleReview(req.params.id);
    res.render('single-review', {review, errors:req.flash('errors')});
}