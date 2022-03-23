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

// User.prototype.login = function(callback) {
//     return new Promise((resolve, reject) => {
//         this.cleanUp();
//         usersCollection.findOne({username: this.data.username}).then((attemptedUser) => {
//             if(attemptedUser && bcrypt.compareSync(this.data.password,attemptedUser.password)) {
//                 resolve('Congrats');
//             } else {
//                 reject('Invalid username / password');
//             }
//         }).catch(function() {
//             reject('Please try again later.');
//         });
//     });
// }

// User.prototype.register = function () {
//     return new Promise( async (resolve,reject) => {
//         //Step 1 validate user data
//         this.cleanUp();
//         await this.validate();
//         //Step 2 Only if there are no there are no validation errors
//         //then save the user data into the database
//         if(!this.errors.length) {
//             //hash user password
//             let salt = bcrypt.genSaltSync(10);
//             this.data.password = bcrypt.hashSync(this.data.password,salt);
//             await usersCollection.insertOne(this.data);
//             resolve();
//         } else {
//             reject(this.errors);
//         }
//     });
// }



module.exports = Review;