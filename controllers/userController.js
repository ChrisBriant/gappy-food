const { request } = require('http');
const User = require('../models/User');


exports.adminRequired = function(req,res,next) {
    if(req.session.user) {
        if(req.session.user.isAdmin) {
            next();
        } else {
            req.flash('errors','You must be an admin to perform that action');
            req.session.save(function () {
                res.redirect('/');
            });
        }
        
    } else {
        req.flash('errors','You must be logged in to perform that action');
        req.session.save(function () {
            res.redirect('/');
        });
    }
}

exports.login = function(req,res) {
    let user = new User(req.body);
    user.login().then(
        async function(result) {
            req.session.user = {
                isAdmin: result.isAdmin, username: user.data.username,
            };
            await req.session.save();
            res.redirect('/admin')
        }
        
    ).catch(async function(err) {
        req.flash('errors', err);
        await req.session.save();
        res.redirect('/admin');
    });
}

exports.logout = function(req, res) {
    req.session.destroy(function() {
        res.redirect('/admin');
    });
}

exports.register = async function(req, res) {
    let user = new User(req.body);
    user.register().then(async () => {
        req.session.user = {isAdmin: user.data.isAdmin, username: user.data.username};
        await req.session.save();
        res.redirect('/admin');
    }).catch(async (regErrors) => {
        regErrors.forEach(function(error) {
            req.flash('regErrors',error);
        });
        await req.session.save();
        res.redirect('/admin');
    });

}


// exports.home = function(req, res) {
//     res.send('Home page goes here');
// }

exports.adminHome = function(req, res) {
    if(req.session.user) {
        res.render('home-dashboard',{username: req.session.user.username, errors:req.flash('errors'), success:req.flash('success')});
    } else {
        res.render('home-admin',{errors: req.flash('errors'), regErrors: req.flash('regErrors')});
    }
}