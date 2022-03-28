const Review = require('../models/Review');

exports.home = async function(req,res) {
    let latest = [];
    let reviews = [];
    try {
        latest = await Review.getLatest();
        reviews = await Review.getReviews();
        console.log('Here are the reviews', reviews);
        res.render('home', {latest, reviews, errors:req.flash('errors')});
    } catch(err) {
        req.flash('errors',err);
        res.render('home', {latest, errors:req.flash('errors')});
    }
    //Will require nesting
    // Review.getLatest().then((latest) => {
    //     console.log('latest', latest);
    //     res.render('home', {latest});
    // }).catch((err) => {
    //     req.flash('errors',err);
    // });
    
    //res.render('home');
}