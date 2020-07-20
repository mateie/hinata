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
        let botStatus = client.presence.status;
        let botActivity = client.presence.activities[0];

        let bgColor = 'gradient-';

        switch (botStatus) {
            case 'dnd':
                bgColor += 'danger';
                botStatus = capAllLetters(botStatus);
                break;
            case 'idle':
                bgColor += 'warning';
                botStatus = capFirstLetter(botStatus);
                break;
            case 'online':
                bgColor += 'success';
                botStatus = capFirstLetter(botStatus);
                break;
            default:
                bgColor += 'black';
                botStatus = capFirstLetter(botStatus);
                break;
        }

        if (!botActivity) {
            return res.redirect('/');
        }

        let activity = {
            name: botActivity.name,
            type: botActivity.type,
        };

        activity.type = activity.type.toLowerCase();
        activity.type = capFirstLetter(activity.type);

        switch (activity.type) {
            case 'Listening':
                activity.type += ' to';
                break;
        }

        renderTemplate(res, req, 'index.ejs', { perms: Discord.Permissions, status: botStatus, activity: activity, bg: bgColor, capL: capFirstLetter, capA: capAllLetters });
    });

    app.get('/profile', checkAuth, async (req, res) => {

        let user = req.user;
        let guild = client.guilds.cache.random();
        let member = guild.members.cache.get(user.id);
        let memberStatus = member.presence.status;

        switch (memberStatus) {
            case 'dnd':
                memberStatus = capAllLetters(memberStatus);
                break;
            default:
                memberStatus = capFirstLetter(memberStatus);
                break;
        }

        let memberActivity = member.presence.activities[0];

        let activity;

        if (!memberActivity || memberActivity.length < 1) {
            activity = {
                name: 'Nothing',
                type: 'Doing',
            };
        } else {
            activity = {
                name: memberActivity.name,
                type: memberActivity.type,
            };
        }

        activity.type = activity.type.toLowerCase();
        activity.type = capFirstLetter(activity.type);

        switch (activity.type) {
            case 'Listening':
                activity.type += ' to';
                activity.name = memberActivity.details;
                break;
        }

        if (typeof (memberActivity) !== 'undefined') {
            if (typeof (memberActivity.details) !== 'undefined' && memberActivity.details !== null) {
                activity.name += ` On ${memberActivity.name}`;
            }
        }

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
        renderTemplate(res, req, 'profile.ejs', { perms: Discord.Permissions, capL: capFirstLetter, capA: capAllLetters, status: memberStatus, activity: activity, premium: premiumType, title: userType, color: bgColor });
    });

    app.get('/commands', (req, res) => {
        renderTemplate(res, req, 'commands.ejs', { res, perms: Discord.Permissions, capL: capFirstLetter, capA: capAllLetters });
    });

    app.get('/dashboard/:guildID', checkAuth, async (req, res) => {
        const guild = client.guilds.cache.get(req.params.guildID);
        if (!guild) return res.redirect('/');
        const member = guild.members.cache.get(req.user.id);
        if (!member) return res.redirect('/');
        if (!member.permissions.has('MANAGE_GUILD')) return res.redirect('/');

        let storedSettings = await Servers.findOne({ serverID: guild.id });

        renderTemplate(res, req, 'settings.ejs', { req: req, guild, settings: storedSettings, alertMessage: null, toasts: res.locals.toasts, perms: Discord.Permissions, capL: capFirstLetter, capA: capAllLetters });
    });

    app.post('/dashboard/:guildID', checkAuth, async (req, res) => {
        const guild = client.guilds.cache.get(req.params.guildID);
        if (!guild) return res.redirect('/');
        const member = guild.members.cache.get(req.user.id);
        if (!member) return res.redirect('/');
        if (!member.permissions.has('MANAGE_GUILD')) return res.redirect('/');

        let storedSettings = await Servers.findOne({ serverID: guild.id });

        let inputKeys = Object.keys(req.body);
        let inputValues = Object.values(req.body);

        let embed = new Discord.MessageEmbed()
            .setTitle('Server Settings')
            .setDescription('Settings was changed from dashboard');

        for (let x = 0; x < inputKeys.length; x++) {
            let inputKey = inputKeys[x];
            let inputValue = inputValues[x];

            let inputType = inputKey.split('-')[0];


            if (inputValues.length > 1) {
                inputType += 's';
            }


            if (typeof (inputValue) !== 'undefined' && inputValue.length > 0 && inputValues.length > 1) {
                storedSettings[inputType][Object.keys(storedSettings[inputType])[x + 1]] = inputValue;
            } else if (typeof (inputValue) !== 'undefined' && inputValue.length > 0 && inputValue.length === 1) {
                storedSettings[inputType] = inputValue;
            }

            let inputs = inputKey;
            let names = [];

            inputs = inputs.split('-');
            for (let z = 0; z < inputs.length; z++) {
                let input = inputs[z];
                input = capFirstLetter(input);
                names[z] = input;
            }

            names = names.join(' ');

            embed.addField('\u200b', `${names} was updated to ${inputValue}`);

        }

        member.send({ embed });

        storedSettings.save();

        renderTemplate(res, req, 'settings.ejs', { req: req, guild, settings: storedSettings, alertMessage: 'Your Settings have been saved', toasts: res.locals.toasts, perms: Discord.Permissions, capL: capFirstLetter, capA: capAllLetters });
    });

    app.get('/channel/:guildID/:channelID', checkAuth, async (req, res) => {
        const guild = client.guilds.cache.get(req.params.guildID);
        if (!guild) return res.redirect('/');
        const channel = guild.channels.cache.get(req.params.channelID);
        if (!channel) return res.redirect('/');
        const member = guild.members.cache.get(req.user.id);
        if (!member) return res.redirect('/');

        try {
            await channel.messages.fetch();
        } catch (err) {
            console.error('Error fetching messages');
            console.error(err);
            return;
        }

        let messages = channel.messages.cache;

        renderTemplate(res, req, 'channels.ejs', { guild, channel, messages, perms: Discord.Permissions, capL: capFirstLetter, capA: capAllLetters, time: getTime });
    });

    app.post('/channel/:guildID/:channelID', checkAuth, async (req, res) => {
        const guild = client.guilds.cache.get(req.params.guildID);
        if (!guild) return res.redirect('/');
        const channel = guild.channels.cache.get(req.params.channelID);
        if (!channel) return res.redirect('/');
        const member = guild.members.cache.get(req.user.id);
        if (!member) return res.redirect('/');

        try {
            await channel.messages.fetch();
        } catch (err) {
            console.error('Error fetching messages');
            console.error(err);
            return;
        }

        let messages = channel.messages.cache;

        let messageSent = req.body.message;

        if (messageSent) {
            channel.send(`\`\`\`From: Dashboard\nSender: ${member.user.username}#${member.user.discriminator}\`\`\` ${messageSent}`);
        }

        renderTemplate(res, req, 'channels.ejs', { guild, channel, messages, perms: Discord.Permissions, capL: capFirstLetter, capA: capAllLetters, time: getTime });

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

const getTime = (timestamp) => {
    const d = new Date(timestamp);

    let time = d.toLocaleTimeString();

    let date = d.toDateString();

    date = date.split(' ');

    date = `${date[1]} ${date[2]}`;

    let newDate = `${date} ${time}`;

    return newDate;
};