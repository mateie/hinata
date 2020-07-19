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
const Canvas = require('canvas');

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
        callbackURL: `${process.env.DOMAIN}/callback`,
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

    app.engine('ejs', ejs.renderFile);
    app.set('view engine', 'ejs');
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

    app.get('/profile', checkAuth, async (req, res) => {

        let user = req.user;

        let premiumType;
        switch (user.premium_type) {
            case 0:
                premiumType = 'None';
                break;
            case 1:
                premiumType = 'Nitro Classic';
                break;
            case 2:
                premiumType = 'Nitro';
                break;
            default:
                premiumType = 'None';
                break;
        }

        let userType;

        switch (user.public_flags) {
            case calculateBitwise(0, 0):
                userType = 'None';
                break;
            case calculateBitwise(1, 0):
                userType = 'Discord Employee';
                break;
            case calculateBitwise(1, 1):
                userType = 'Discord Partner';
                break;
            case calculateBitwise(1, 2):
                userType = 'HypeSquad Events';
                break;
            case calculateBitwise(1, 3):
                userType = 'Bug Hunter Level 1';
                break;
            case calculateBitwise(1, 6):
                userType = 'House Bravery';
                break;
            case calculateBitwise(1, 7):
                userType = 'House Brilliance';
                break;
            case calculateBitwise(1, 8):
                userType = 'House Balance';
                break;
            case calculateBitwise(1, 9):
                userType = 'Early Supporter';
                break;
            case calculateBitwise(1, 10):
                userType = 'Team User';
                break;
            case calculateBitwise(1, 12):
                userType = 'System';
                break;
            case calculateBitwise(1, 14):
                userType = 'Bug Hunter Level 2';
                break;
            case calculateBitwise(1, 16):
                userType = 'Verified Bot';
                break;
            case calculateBitwise(1, 17):
                userType = 'Verified Bot Devleoper';
                break;
            default:
                userType = 'None';
                break;
        }

        let bgColor = await colorHex(`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128`);
        renderTemplate(res, req, 'profile.ejs', { perms: Discord.Permissions, capL: capFirstLetter, capA: capAllLetters, premium: premiumType, title: userType, color: bgColor });
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

const calculateBitwise = (from, to) => {
    return from << to;
};

const colorHex = async (imgURL) => {
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
        return "#" + componentToHex(defaultRGB.r) + componentToHex(defaultRGB.g) + componentToHex(defaultRGB.b);
    }

    let image = await Canvas.loadImage(imgURL);

    height = canvas.height = image.naturalHeight || image.offsetHeight || image.height;
    width = canvas.width = image.naturalWidth || image.offsetWidth || image.width;

    context.drawImage(image, 0, 0);

    try {
        data = context.getImageData(0, 0, width, height);
    } catch (e) {
        console.error(e);
        return "#" + componentToHex(defaultRGB.r) + componentToHex(defaultRGB.g) + componentToHex(defaultRGB.b);
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

    let hex = "#" + componentToHex(rgb.r) + componentToHex(rgb.g) + componentToHex(rgb.b);

    return hex;
};

const componentToHex = (c) => {
    let hex = c.toString(16);
    return hex.length == 1 ? '0' + hex : hex;
};