const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const markdown = require('marked');
const sanitizeHTML = require('sanitize-html');
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
    //make our markdown function available from ejs templates
    res.locals.filterUserHTML = function(content) {
        return sanitizeHTML(markdown.parse(content),{
            allowedTags: ['p','br','ul','ol','li','strong','bold','italic','h1','h2','h3','h4'],
            allowedAttributes: {},
        });
    }
    //Extract the first paragraph
    res.locals.extractFirstParagraph = function(content) {
        let htmlContent = sanitizeHTML(markdown.parse(content),{
            allowedTags: ['p','br','ul','ol','li','strong','bold','italic','h1','h2','h3','h4'],
            allowedAttributes: {},
        });
        return htmlContent.match(/<p>(.*?)<\/p>/)[1];
    }
    //Make use of csrf token
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