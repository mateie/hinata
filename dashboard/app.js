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

// Template Util
const flash = require('connect-flash');
const toastr = require('express-toastr');

// Routes
const indexRoute = require('./routes/index');
const meRoute = require('./routes/me');
const commandsRoute = require('./routes/commands');
const guildRoute = require('./routes/guilds');
const ownerRoute = require('./routes/owner');
const { commands } = require('../util/loader');

// Initialize App
const app = express();
const MemoryStore = require('memorystore')(session);

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

    // Default Domain
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

    app.use(flash());
    app.use(toastr());

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

    // Makes App Online
    app.listen(process.env.PORT, () => {
        console.info('Dashboard is running');
    });
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

// Uses an Image URL to get it's Hex Colors
exports.colorHex = async (imgURL) => {
    let blockSize = 5,
        defaultRGB = { r: 0, g: 0, b: 0 },
        canvas = Canvas.createCanvas(128, 128),
        context = canvas.getContext('2d'),
        data, width, height,
        i = -4,
        length,
        rgb = { r: 0, g: 0, b: 0 },
        count = 0;

    if (!context) {
        return "#" + this.componentToHex(defaultRGB.r) + this.componentToHex(defaultRGB.g) + this.componentToHex(defaultRGB.b);
    }

    let image = await Canvas.loadImage(imgURL);

    height = canvas.height = image.naturalHeight || image.offsetHeight || image.height;
    width = canvas.width = image.naturalWidth || image.offsetWidth || image.width;

    context.drawImage(image, 0, 0);

    try {
        data = context.getImageData(0, 0, width, height);
    } catch (e) {
        console.error(e);
        return "#" + this.componentToHex(defaultRGB.r) + this.componentToHex(defaultRGB.g) + this.componentToHex(defaultRGB.b);
    }
    length = data.data.length;

    while ((i += blockSize * 4) < length) {
        ++count;
        rgb.r += data.data[i];
        rgb.g += data.data[i + 1];
        rgb.b += data.data[i + 2];
    }

    rgb.r = ~~(rgb.r / count);
    rgb.g = ~~(rgb.g / count);
    rgb.b = ~~(rgb.b / count);

    let hex = "#" + this.componentToHex(rgb.r) + this.componentToHex(rgb.g) + this.componentToHex(rgb.b);

    return hex;
};

// Converts color to hex
exports.componentToHex = (c) => {
    let hex = c.toString(16);
    return hex.length == 1 ? '0' + hex : hex;
};

// Get's Time in Date format when timestamp given
exports.getTime = timestamp => {
    const d = new Date(timestamp);
    let time = d.toLocaleTimeString();
    let date = d.toDateString();
    date = date.split(' ');
    date = `${date[1]} ${date[2]}`;

    let newDate = `${date} ${time}`;
    return newDate;
};