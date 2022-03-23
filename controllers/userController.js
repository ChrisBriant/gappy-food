const { request } = require('http');
const User = require('../models/User');

exports.login = function(req,res) {
    let user = new User(req.body);
    user.login().then(
        async function(result) {
            console.log('logged in', result);
            req.session.user = {
                favcolor: 'blue', username: user.data.username,
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
        req.session.user = {username: user.data.username};
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


exports.home = function(req, res) {
    res.send('Home page goes here');
}

exports.adminHome = function(req, res) {
    console.log('home');
    if(req.session.user) {
        res.render('home-dashboard',{username: req.session.user.username, errors:req.flash('errors')});
    } else {
        res.render('home-admin',{errors: req.flash('errors'), regErrors: req.flash('regErrors')});
    }
}