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
const YTDL = require('ytdl-core');
const cookieParser = require('cookie-parser');
const { BadRequest, NotFound } = require('./util/errors');

const flash = require('connect-flash');
const toastr = require('express-toastr');
const Search = require('youtube-search');
const handleErrors = require('./middleware/handleErrors');

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

    exports.renderTemplate = (res, req, template, data = {}) => {
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

    app.get('/', (req, res, next) => {

        try {
            let botStatus = client.presence.status;
            let botActivity = client.presence.activities[0];

            let bgColor = 'gradient-';

            switch (botStatus) {
                case 'dnd':
                    bgColor += 'danger';
                    botStatus = this.capAllLetters(botStatus);
                    break;
                case 'idle':
                    bgColor += 'warning';
                    botStatus = this.capFirstLetter(botStatus);
                    break;
                case 'online':
                    bgColor += 'success';
                    botStatus = this.capFirstLetter(botStatus);
                    break;
                default:
                    bgColor += 'black';
                    botStatus = this.capFirstLetter(botStatus);
                    break;
            }

            let activity;

            if (!botActivity) {
                activity = {
                    name: 'Nothing',
                    type: 'Doing',
                };
            } else {
                activity = {
                    name: botActivity.name,
                    type: botActivity.type,
                };
            }

            activity.type = activity.type.toLowerCase();
            activity.type = this.capFirstLetter(activity.type);

            switch (activity.type) {
                case 'Listening':
                    activity.type += ' to';
                    break;
            }

            this.renderTemplate(res, req, 'index.ejs', { perms: Discord.Permissions, status: botStatus, activity: activity, bg: bgColor, capL: this.capFirstLetter, capA: this.capAllLetters });
        } catch (err) {
            next(err);
        }
    });

    app.get('/user/me', checkAuth, async (req, res) => {

        let user = req.user;
        let guild = client.guilds.cache.random();
        let member = guild.members.cache.get(user.id);
        let memberStatus = member.presence.status;

        switch (memberStatus) {
            case 'dnd':
                memberStatus = this.capAllLetters(memberStatus);
                break;
            default:
                memberStatus = this.capFirstLetter(memberStatus);
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
        activity.type = this.capFirstLetter(activity.type);

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
        this.renderTemplate(res, req, 'me.ejs', { perms: Discord.Permissions, capL: this.capFirstLetter, capA: this.capAllLetters, status: memberStatus, activity: activity, premium: premiumType, title: userType, color: bgColor });
    });

    app.get('/commands', (req, res) => {
        this.renderTemplate(res, req, 'commands.ejs', { res, perms: Discord.Permissions, capL: this.capFirstLetter, capA: this.capAllLetters });
    });

    app.get('/guild/:guildID', checkAuth, async (req, res, next) => {
        try {
            const guild = client.guilds.cache.get(req.params.guildID);
            if (!guild) {
                throw new NotFound(404, 'Guild not found');
            }
            const member = guild.members.cache.get(req.user.id);
            if (!member) {
                throw new NotFound(404, 'Member not found');

            }
            if (!member.permissions.has('MANAGE_GUILD')) {
                return res.redirect('/');
            }

            const queue = client.queue.get(guild.id);

            if (!queue) {
                req.session.returnTo = req.path;
            }

            let storedSettings = await Servers.findOne({ serverID: guild.id });

            this.renderTemplate(res, req, 'guild.ejs', { req: req, guild, settings: storedSettings, alertMessage: null, toasts: res.locals.toasts, perms: Discord.Permissions, capL: this.capFirstLetter, capA: this.capAllLetters, musicQueue: queue });
        } catch (err) {
            next(err);
        }
    });

    app.post('/guild/:guildID', checkAuth, async (req, res, next) => {
        try {
            const guild = client.guilds.cache.get(req.params.guildID);
            if (!guild) {
                throw new NotFound(404, 'Guild not found');
            }
            const member = guild.members.cache.get(req.user.id);
            if (!member) {
                throw new NotFound(404, 'Member not found');
            }
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
                    input = this.capFirstLetter(input);
                    names[z] = input;
                }

                names = names.join(' ');

                embed.addField('\u200b', `${names} was updated to ${inputValue}`);

            }

            member.send({ embed });

            storedSettings.save();

            this.renderTemplate(res, req, 'guild.ejs', { req: req, guild, settings: storedSettings, alertMessage: 'Your Settings have been saved', toasts: res.locals.toasts, perms: Discord.Permissions, capL: this.capFirstLetter, capA: this.capAllLetters });
        } catch (err) {
            next(err);
        }
    });

    app.get('/guild/:guildID/channel/:channelID', checkAuth, async (req, res, next) => {
        try {
            const guild = client.guilds.cache.get(req.params.guildID);
            if (!guild) {
                throw new NotFound('Guild Not Found');
            }
            const channel = guild.channels.cache.get(req.params.channelID);
            if (!channel) {
                throw new NotFound('Channel Not Found');
            }
            const member = guild.members.cache.get(req.user.id);
            if (!member) {
                throw new NotFound('Member Not Found');
            }

            try {
                await channel.messages.fetch();
            } catch (err) {
                console.error('Error fetching messages');
                console.error(err);
                return;
            }

            let messages = channel.messages.cache;

            this.renderTemplate(res, req, 'channels.ejs', { guild, channel, messages, perms: Discord.Permissions, capL: this.capFirstLetter, capA: this.capAllLetters, time: getTime });
        } catch (err) {
            next(err);
        }
    });

    app.post('/guild/:guildID/channel/:channelID', checkAuth, async (req, res, next) => {
        try {
            const guild = client.guilds.cache.get(req.params.guildID);
            if (!guild) {
                throw new NotFound('Guild Not Found');
            }
            const channel = guild.channels.cache.get(req.params.channelID);
            if (!channel) {
                throw new NotFound('Channel Not Found');
            }
            const member = guild.members.cache.get(req.user.id);
            if (!member) {
                throw new NotFound('Member Not Found');
            }

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
                channel.send(`\`\`\`From: Dashboard\nSent by: ${member.user.username}#${member.user.discriminator}\`\`\` ${messageSent}`);
            }

            this.renderTemplate(res, req, 'channels.ejs', { guild, channel, messages, perms: Discord.Permissions, capL: this.capFirstLetter, capA: this.capAllLetters, time: getTime });
        } catch (err) {
            next(err);
        }
    });

    app.get('/guild/:guildID/user/:userID', checkAuth, async (req, res, next) => {
        try {
            const guild = client.guilds.cache.get(req.params.guildID);
            if (!guild) {
                throw NotFound('Guild not found');
            }
            const member = guild.members.cache.get(req.params.userID);
            if (!member) {
                throw NotFound('Member not found');
            }
            let memberStatus = member.presence.status;

            switch (memberStatus) {
                case 'dnd':
                    memberStatus = this.capAllLetters(memberStatus);
                    break;
                default:
                    memberStatus = this.capFirstLetter(memberStatus);
                    break;
            }

            let memberActivity = member.presence.activities[0];
            let activity;

            if (!memberActivity || memberActivity.length < 1) {
                activity = {
                    name: 'Nothing',
                    type: 'Doing',
                };
            } else if (memberActivity.type === 'CUSTOM_STATUS') {
                activity = {
                    name: '',
                    type: memberActivity.state,
                };
            } else {
                activity = {
                    name: memberActivity.name,
                    type: memberActivity.type,
                };
            }

            activity.type = activity.type.toLowerCase();
            activity.type = this.capFirstLetter(activity.type);

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

            let bgColor;

            if (member.user.avatar) {
                bgColor = await colorHex(`https://cdn.discordapp.com/avatars/${member.user.id}/${member.user.avatar}.png?size=128`);
            } else {
                bgColor = '#007bff';
            }

            this.renderTemplate(res, req, 'user.ejs', { perms: Discord.Permissions, capL: this.capFirstLetter, capA: this.capAllLetters, member: member, status: memberStatus, color: bgColor, activity: activity });
        } catch (err) {
            next(err);
        }
    });

    app.get('/guild/:guildID/queue', checkAuth, async (req, res, next) => {
        try {
            const guild = client.guilds.cache.get(req.params.guildID);
            if (!guild) {
                throw NotFound('Guild not found');
            }
            const member = guild.members.cache.get(req.user.id);
            if (!member) {
                throw NotFound('Member not found');
            }
            if (!member.permissions.has('MANAGE_GUILD')) return res.redirect('/');

            const queue = client.queue.get(guild.id);

            // console.log(queue);

            let notification;

            this.renderTemplate(res, req, 'queue.ejs', { req: req, perms: Discord.Permissions, capL: this.capFirstLetter, capA: this.capAllLetters, alertMessage: notification, member: member, queue: queue, guild: guild, convert: secondsToDuration });
        } catch (err) {
            next(err);
        }
    });

    app.post('/guild/:guildID/queue', checkAuth, async (req, res, next) => {
        try {
            const guild = client.guilds.cache.get(req.params.guildID);
            if (!guild) {
                throw NotFound('Guild not found');
            }
            const member = guild.members.cache.get(req.user.id);
            if (!member) {
                throw NotFound('Member not found');
            }
            if (!member.permissions.has('MANAGE_GUILD')) return res.redirect('/');

            const queue = client.queue.get(guild.id);
            console.log(queue);

            let songLink = req.body['song-link'];

            let notification;

            if (songLink) {
                let validate = YTDL.validateURL(songLink);
                if (!validate) {
                    let searchOptions = {
                        maxResults: 10,
                        key: process.env.GOOGLE_API_KEY,
                    };

                    let searchResults = await Search(songLink, searchOptions);
                    if (searchResults.results.length > 0) {
                        songLink = searchResults.results.find(val => val.kind == 'youtube#video').link;
                        if (!YTDL.validateURL(songLink)) {
                            notification = 'Video not found';
                        }
                    } else {
                        notification = 'Video not found';
                    }
                }

                let songInfo = await YTDL.getInfo(songLink);
                if (songInfo) {
                    let song = {
                        author: {
                            name: songInfo.videoDetails.author.name,
                            channel: songInfo.videoDetails.author.channel_url,
                            avatar: songInfo.videoDetails.author.avatar,
                        },
                        title: songInfo.videoDetails.title,
                        url: songInfo.videoDetails.video_url,
                        duration: songInfo.videoDetails.lengthSeconds,
                        likes: songInfo.videoDetails.likes,
                        dislikes: songInfo.videoDetails.dislikes,
                        thumbnail: songInfo.videoDetails.thumbnail.thumbnails[4].url,
                    };

                    if (queue) {
                        if (queue.songs.length >= 20) {
                            notification = 'Max Queue Length is 20';
                        } else {
                            queue.songs.push(song);
                            notification = 'Song Successfully added to the queue';
                        }
                    }
                }
            }

            if (Object.keys(req.body).length < 1) {
                queue.songs.forEach((song, index) => {
                    if (index !== 0) {
                        delete queue.songs[index];
                    }
                });
            }

            this.renderTemplate(res, req, 'queue.ejs', { req: req, perms: Discord.Permissions, capL: this.capFirstLetter, capA: this.capAllLetters, alertMessage: notification, toasts: res.locals.toasts, member: member, queue: queue, guild: guild, convert: secondsToDuration });
        } catch (err) {
            next(err);
        }
    });

    app.get('/owner', checkAuth, async (req, res, next) => {
        const owner = req.user;

        try {
            if (owner !== process.env.OWNER_ID) {
                throw new BadRequest('Missing required Permissions to access the page');
            }

            let allUsers = client.users.cache;
            let allGuilds = client.guilds.cache;
            let allChannels = client.channels.cache;
            let allCommands = client.commands.cache;
            let allCategories = client.categories;

            this.renderTemplate(res, req, 'owner.ejs', { owner, perms: Discord.Permissions, capL: this.capFirstLetter, capA: this.capAllLetters, allUsers, allGuilds, allChannels, allCommands, allCategories });
        } catch (err) {
            next(err);
        }
    });

    app.use(handleErrors);

    app.listen(process.env.PORT, () => {
        console.log(`Dashboard is running on port ${process.env.PORT}`);
    });
};

exports.capFirstLetter = string => {
    return string.charAt(0).toUpperCase() + string.slice(1);
};

exports.capAllLetters = string => {
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

const secondsToDuration = sec => {
    let hours = Math.floor(sec / 3600);
    let minutes = Math.floor((sec - (hours * 3600)) / 60);
    let seconds = sec - (hours * 3600) - (minutes * 60);

    if (hours < 10) hours = `0${hours}`;
    if (minutes < 10) minutes = `0${minutes}`;
    if (seconds < 10) seconds = `0${seconds}`;

    if (hours > 0) return `${hours}:${minutes}:${seconds}`;
    else return `${minutes}:${seconds}`;
};