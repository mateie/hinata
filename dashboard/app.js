// Dependencies
const url = require('url');
const path = require('path');
const express = require('express');
const passport = require('passport');
const session = require('express-session');
const Strategy = require('passport-discord').Strategy;
const ejs = require('ejs');
const parser = require('body-parser');
const Canvas = require('canvas');
const cookieParser = require('cookie-parser');

// Main Client
const { client } = require('../index');

// Routes
const indexRoute = require('./routes/index');
const meRoute = require('./routes/me');
const commandsRoute = require('./routes/commands');
const guildRoute = require('./routes/guilds');
const ownerRoute = require('./routes/owner');

// Initialize App
const app = express();
const MemoryStore = require('memorystore')(session);
const server = app.listen(process.env.PORT, () => {
    console.info('Dashboard running...');
});
const io = require('socket.io')(server);

// Directory Setup
const dataDir = path.resolve(`${process.cwd()}${path.sep}dashboard`);
const templateDir = path.resolve(`${dataDir}${path.sep}views`);

module.exports = async () => {
    passport.serializeUser((user, done) => done(null, user)); // Serialize User
    passport.deserializeUser((obj, done) => done(null, obj)); // Deserialize User

    // Creates a strategy for a OAuth2 Request
    passport.use(new Strategy({
        clientID: process.env.BOT_ID,
        clientSecret: process.env.BOT_SECRET,
        callbackURL: `${process.env.DOMAIN}/callback`,
        scope: ['identify', 'guilds'],
    }, (accessToken, refreshToken, profile, done) => {
        process.nextTick(() => done(null, profile));
    }));

    // Parses cookies
    app.use(cookieParser('secret'));
    app.use(session({ // Set's up a session
        store: new MemoryStore({ checkPeriod: 86400000 }),
        secret: 'secret',
        resave: false,
        saveUninitialized: false,
    }));

    // Initializes the session inside passport
    app.use(passport.initialize());
    app.use(passport.session());

    app.locals.domain = process.env.DOMAIN.split('//')[1];

    // Initializes the app engine and it's static path
    app.engine('ejs', ejs.renderFile);
    app.set('view engine', 'ejs');
    app.use(express.static(path.join(__dirname + '/public')));

    // Initializes Parser
    app.use(parser.json());
    app.use(parser.urlencoded({
        extended: true,
    }));

    // Set up Socket.io
    app.use(function (req, res, next) {
        res.io = io;
        next();
    });

    // Login Page Route
    app.get('/login', (req, res, next) => {
        if (req.session.backURL) {
            // eslint-disable-next-line no-self-assign
            req.session.backURL = req.session.backURL;
        } else if (req.headers.referer) {
            const parsed = url.parse(req.headers.referer);
            if (parsed.hostname === app.locals.domain) {
                req.session.backURL = parsed.path;
            }
        } else {
            req.session.backURL = '/';
        }

        next();
    }, passport.authenticate('discord'));

    // Callback after login has been completed
    app.get('/callback', passport.authenticate('discord', { failureRedirect: '/' }), (req, res) => {
        if (req.session.backURL) {
            // eslint-disable-next-line no-shadow
            const url = req.session.backURL;
            req.session.backURL = null;
            res.redirect(url);
        } else {
            res.redirect('/');
        }
    });

    // Destroys Session and Logs the user out
    app.get('/logout', (req, res) => {
        req.session.destroy(() => {
            req.logout();

            res.redirect('/');
        });
    });

    // All Page routes
    app.use('/', indexRoute);
    app.use('/user/me', this.checkAuth, meRoute);
    app.use('/commands', commandsRoute);
    app.use('/guild', this.checkAuth, guildRoute);
    app.use('/owner', this.checkAuth, ownerRoute);
};

/*  renderTemplate
*   res: response from the express,
*   req: request from the express,
*   template: template name
*   data: information to pass through the template
*/
exports.renderTemplate = (res, req, template, data = {}) => {
    const baseData = {
        bot: client,
        path: req.path,
        user: req.isAuthenticated() ? req.user : null,
        query: req.query,
    };

    res.render(path.resolve(`${templateDir}${path.sep}${template}`), Object.assign(baseData, data));
};

// Checks if User is logged in
exports.checkAuth = (req, res, next) => {
    if (req.isAuthenticated()) return next();

    req.session.backURL = req.url;
    res.redirect('/login');
};

// Capitalizes First Letter of a String
exports.capFirstLetter = string => {
    return string.charAt(0).toUpperCase() + string.slice(1);
};

// Capitalizes All Letters of a String
exports.capAllLetters = string => {
    return string.toUpperCase();
};

// Calculates Bitwise
exports.calculateBitwise = (from, to) => {
    return from << to;
};

// Get's Time in Date format when timestamp given
exports.getTime = timestamp => {
    const d = new Date(timestamp);
    let time = d.toLocaleTimeString();
    let date = d.toDateString();
    date = date.split(' ');
    time = time.split(' ');
    time = time[0];
    time = time.split(':');
    time = `${time[0]}:${time[1]}`;
    date = `${date[1]} ${date[2]}`;

    let newDate = `${date} ${time}`;
    return newDate;
};

exports.secondsToDuration = sec => {
    let hours = Math.floor(sec / 3600);
    let minutes = Math.floor((sec - (hours * 3600)) / 60);
    let seconds = sec - (hours * 3600) - (minutes * 60);

    if (hours < 10) hours = `0${hours}`;
    if (minutes < 10) minutes = `0${minutes}`;
    if (seconds < 10) seconds = `0${seconds}`;

    if (hours > 0) return `${hours}:${minutes}:${seconds}`;
    else return `${minutes}:${seconds}`;
};