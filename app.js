const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const csrf = require('csurf');
const app = express();

let sessionOptions = session({
    secret: 'javascript is so cool',
    store: MongoStore.create({client:require('./db')}),
    resave: false,
    saveUninitialized: false,
    cookie: {maxAge: 1000 * 60 * 60 * 24, httpOnly: true},
});

app.use(sessionOptions);
app.use(flash());

const router = require('./router');
const e = require('connect-flash');

app.use(express.urlencoded({extended:false}));
app.use(express.json());
app.use(express.static('public'));

app.set('views', 'views');
app.set('view engine', 'ejs');

app.use(csrf());
app.use(function(req,res,next) {
    res.locals.csrfToken = req.csrfToken;
    next();
});

app.use('/',router);

app.use(function(err,req,res,next) {
    if(err) {
        console.log(err);
        if(err.code == "EBADCSRFTOKEN") {
            req.flash('errors','Cross site request forgery detected.');
            req.session.save(() => res.redirect('/admin'));
        } else {
            res.send('Not found');
        }
    }
});


module.exports = app;