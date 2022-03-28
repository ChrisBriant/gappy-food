//const bcrypt = require('bcryptjs');
const reviewsCollection = require('../db').db().collection('reviews');
const picturesCollection = require('../db').db().collection('pictures');
//const validator = require('validator');
const fs = require('fs');
let sanitizeHTML = require('sanitize-html');

let Review = function(data,files) {
   this.data = data;
   this.files = files;
   this.errors = [];
}

Review.prototype.cleanUp = function() {
    if(typeof(this.data.title) != 'string' ) {
        this.data.title = '';
    }
    if(typeof(this.data.restaurant) != 'string' ) {
        this.data.restaurant = '';
    }
    if(typeof(this.data.review) != 'string' ) {
        this.data.review = '';
    }
    if(Number.isNaN(parseInt(this.data.rating)) || parseInt(this.data.rating) < 0 || parseInt(this.data.rating) > 5 ) {
        this.data.rating = 0;
    }

    if( Number.isNaN(parseFloat(this.data.lat)) || Number.isNaN(parseFloat(this.data.lng)) ) { 
        this.data.lat='';
        this.data.lng='';
    }

    let dateAdded = new Date();

    //Get rid of any bogus properties
    this.data = {
        title: sanitizeHTML(this.data.title.trim(),{allowedtags:[], allowedAttributes: {}}),
        restaurant: sanitizeHTML(this.data.restaurant.trim(),{allowedtags:[], allowedAttributes: {}}),
        lat: sanitizeHTML(this.data.lat.trim(),{allowedtags:[], allowedAttributes: {}}),
        lng: sanitizeHTML(this.data.lng.trim(),{allowedtags:[], allowedAttributes: {}}),
        review: sanitizeHTML(this.data.review.trim(),{allowedtags:[], allowedAttributes: {}}),
        rating: parseInt(this.data.rating),
        dateAdded: new Date(), //dateAdded.toISOString(), 
        
    }
}

Review.prototype.validate = function() {
    return new Promise(async (resolve, reject) => {
        if(this.data.title == '') {
            this.errors.push('You must provide a review title.');
        }
        if(this.data.restaurant == '' ) {
            this.errors.push('You must provide the restaurant name.');
        }
        if(this.data.lat == '' || this.data.lng == '' ) {
            this.errors.push('You must select an area on the map.');
        }
        if(this.data.review == '') {
            this.errors.push('You must enter some text for the review.');
        }
        if(this.data.rating == '') {
            this.errors.push('You must add a rating.');
        }
        //this.errors.push('There is an error');
        resolve();
    });

    
}

Review.prototype.addReview = async function() {
    this.cleanUp();
    await this.validate();

    return new Promise(async (resolve, reject) => {
        if(this.errors.length <= 0) {
            //send review
            let id = await reviewsCollection.insertOne(this.data);
            this.files.forEach(async (fileItem) => {
                await picturesCollection.insertOne({...fileItem,review_id:id.insertedId});
            });
            resolve();
        } else {
            //Delete uploaded files
            this.files.forEach((fileItem) => {
                fs.unlinkSync(fileItem.path);
            });
            reject(this.errors);
        }
    });
}

Review.getLatest = async function() {
    let aggOperations = [
        {$lookup: {from: 'pictures', localField: '_id', foreignField: 'review_id', as: 'pictures' }},
        {$sort: { dateAdded: -1 } },
        {$limit: 1},
        {$project: {
            title: 1,
            restaurant: 1,
            lat : 1,
            lng: 1,
            review : 1,
            rating :1,
            dateAdded : 1,
            pictures : '$pictures',
        }}
    ];

    return new Promise((resolve, reject) => {
        reviewsCollection.aggregate(aggOperations).toArray()
        .then((data) => {
            let picArray = data[0].pictures.map(pic => { return {'path' : pic.path.split('public/')[1]} });
            resolve({...data[0],picArray} );
        }).catch((err) => {
            console.log(err);
            reject();
        });
    });
}


Review.getReviews = async function() {
    let aggOperations = [
        {$lookup: {from: 'pictures', localField: '_id', foreignField: 'review_id', as: 'pictures' }},
        {$sort: { dateAdded: -1 } },
        {$project: {
            title: 1,
            restaurant: 1,
            lat : 1,
            lng: 1,
            review : 1,
            rating :1,
            dateAdded : 1,
            pictures : '$pictures',
        }}
    ];

    return new Promise((resolve, reject) => {
        reviewsCollection.aggregate(aggOperations).toArray()
        .then((data) => {
            let processedReviews = [];
            //Remove top element and then get the picture paths
            data.shift();
            data.forEach((item) => {
                let picArray = item.pictures.map(pic => { return {'path' : pic.path.split('public/')[1]} });
                let newItem = {...item,picArray}
                processedReviews.push(newItem);
            });
            resolve(processedReviews);
        }).catch((err) => {
            console.log(err);
            reject();
        });
    });
}

module.exports = Review;