/* eslint-disable no-shadow */
const url = require('url');
const path = require('path');
const express = require('express');
const passport = require('passport');
const session = require('express-session');
const Strategy = require('passport-discord').Strategy;
const ejs = require('ejs');
const parser = require('body-parser');
const Discord = require('discord.js');
const Servers = require(`${process.cwd()}/models/servers`);

const flash = require('connect-flash');
const toastr = require('express-toastr');
const cookieParser = require('cookie-parser');

const app = express();
const MemoryStore = require('memorystore')(session);

module.exports = async (client) => {
    const dataDir = path.resolve(`${process.cwd()}${path.sep}dashboard`);
    const templateDir = path.resolve(`${dataDir}${path.sep}views`);

    passport.serializeUser((user, done) => done(null, user));
    passport.deserializeUser((obj, done) => done(null, obj));

    passport.use(new Strategy({
        clientID: process.env.BOT_ID,
        clientSecret: process.env.BOT_SECRET,
        callbackURL: `${process.env.DOMAIN}${process.env.PORT === 3000 ? '' : `:${process.env.PORT}`}/callback`,
        scope: ['identify', 'guilds'],
    },
        (accessToken, refreshToken, profile, done) => {
            process.nextTick(() => done(null, profile));
        }));


    app.use(cookieParser('secret'));
    app.use(session({
        store: new MemoryStore({ checkPeriod: 86400000 }),
        secret: 'secret',
        resave: false,
        saveUninitialized: false,
    }));

    app.use(passport.initialize());
    app.use(passport.session());

    app.locals.domain = process.env.DOMAIN.split('//')[1];

    app.engine('html', ejs.renderFile);
    app.set('view engine', 'html');
    app.use(express.static(path.join(__dirname + '/public')));

    app.use(parser.json());
    app.use(parser.urlencoded({
        extended: true,
    }));

    app.use(flash());
    app.use(toastr());

    const renderTemplate = (res, req, template, data = {}) => {
        const baseData = {
            bot: client,
            path: req.path,
            user: req.isAuthenticated() ? req.user : null,
            query: req.query,
        };

        res.render(path.resolve(`${templateDir}${path.sep}${template}`), Object.assign(baseData, data));
    };

    const checkAuth = (req, res, next) => {
        if (req.isAuthenticated()) return next();

        req.session.backURL = req.url;
        res.redirect('/login');
    };

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
    },
        passport.authenticate('discord'));

    app.get('/callback', passport.authenticate('discord', { failureRedirect: '/' }), (req, res) => {
        if (req.session.backURL) {
            const url = req.session.backURL;
            req.session.backURL = null;
            res.redirect(url);
        } else {
            res.redirect('/');
        }
    });

    app.get('/logout', (req, res) => {
        req.session.destroy(() => {
            req.logout();

            res.redirect('/');
        });
    });

    app.get('/', (req, res) => {
        renderTemplate(res, req, 'index.ejs', { perms: Discord.Permissions, capL: capFirstLetter, capA: capAllLetters });
    });

    app.get('/profile', checkAuth, (req, res) => {
        renderTemplate(res, req, 'profile.ejs', { perms: Discord.Permissions, capL: capFirstLetter, capA: capAllLetters });
    });

    app.get('/commands', (req, res) => {
        renderTemplate(res, req, 'commands.ejs', { res, perms: Discord.Permissions, capL: capFirstLetter, capA: capAllLetters });
    });

    app.get('/dashboard/:guildID', checkAuth, async (req, res) => {
        const guild = client.guilds.cache.get(req.params.guildID);
        if (!guild) return res.redirect('/dashboard');
        const member = guild.members.cache.get(req.user.id);
        if (!member) return res.redirect('/dashboard');
        if (!member.permissions.has('MANAGE_GUILD')) return res.redirect('/dashboard');

        let storedSettings = await Servers.findOne({ serverID: guild.id });

        renderTemplate(res, req, 'settings.ejs', { req: req, guild, settings: storedSettings, alertMessage: null, toasts: res.locals.toasts, perms: Discord.Permissions, capL: capFirstLetter, capA: capAllLetters });
    });

    app.post('/dashboard/:guildID', checkAuth, async (req, res) => {
        const guild = client.guilds.cache.get(req.params.guildID);
        if (!guild) return res.redirect('/dashboard');
        const member = guild.members.cache.get(req.user.id);
        if (!member) return res.redirect('/dashboard');
        if (!member.permissions.has('MANAGE_GUILD')) return res.redirect('/dashboard');

        let storedSettings = await Servers.findOne({ serverID: guild.id });

        if (typeof (req.body.prefix) !== 'undefined') {
            storedSettings.prefix = req.body.prefix;
        }

        for (let i = 1; i < Object.keys(storedSettings.roles).length; i++) {
            if (typeof (req.body[`role${i}`]) !== 'undefined') {
                storedSettings.roles[Object.keys(storedSettings.roles)[i]] = req.body[`role${i}`];
            }
        }

        for (let j = 1; j < Object.keys(storedSettings.channels).length; j++) {
            if (typeof (req.body[`channel${j}`]) !== 'undefined') {
                storedSettings.channels[Object.keys(storedSettings.channels)[j]] = req.body[`channel${j}`];
            }
        }

        storedSettings.save();

        renderTemplate(res, req, 'settings.ejs', { req: req, guild, settings: storedSettings, alertMessage: 'Your Settings have been saved', toasts: res.locals.toasts, perms: Discord.Permissions, capL: capFirstLetter, capA: capAllLetters });
    });

    app.use((req, res, next) => {
        res.status(404);
        renderTemplate(res, req, '404.ejs', { perms: Discord.Permissions, capL: capFirstLetter, capA: capAllLetters });
        next();
    });

    app.listen(process.env.PORT, () => {
        console.log(`Dashboard is running on port ${process.env.PORT}`);
    });
};

const capFirstLetter = string => {
    return string.charAt(0).toUpperCase() + string.slice(1);
};

const capAllLetters = string => {
    return string.toUpperCase();
};