const Main = require('../app');
const { client } = require('../../index');
const Discord = require('discord.js');
const Servers = require(`${process.cwd()}/models/servers`);
const jquery = require('jquery');
const toastr = require('toastr');

// Routes
const guilds = require('express').Router();
const channels = require('./channels');
const members = require('./members');
const queue = require('./queue');

guilds.get('/:guildID', async (req, res) => {
    const guild = client.guilds.cache.get(req.params.guildID);
    if (!guild) {
        return res.redirect('/');
    }
    const member = guild.members.cache.get(req.user.id);
    if (!member) {
        return res.redirect('/');
    }
    if (!member.permissions.has('MANAGE_GUILD')) {
        return res.redirect('/');
    }

    const queue = client.queue.get(guild.id);

    let storedSettings = await Servers.findOne({ serverID: guild.id });

    if (queue) {
        setInterval(() => {
            if (queue.connection.dispatcher) {
                let progress = '';
                progress = queue.connection.dispatcher.streamTime / 1000;
                progress = Math.floor(progress);
                progress = Main.secondsToDuration(progress);

                let info = {
                    current: {
                        artist: queue.songs[0].author,
                        title: queue.songs[0].title,
                        duration: Main.secondsToDuration(queue.songs[0].duration),
                        progress: progress,
                        thumbnail: queue.songs[0].thumbnail,
                    },
                    songs: queue.songs,
                    playing: queue.playing,
                    loop: queue.loop,
                };

                res.io.emit('player update', info);
            } else {
                res.io.emit('player end');
            }
        }, 1000);
    }

    Main.renderTemplate(res, req, 'guild.ejs', { guild, settings: storedSettings, alertMessage: null, perms: Discord.Permissions, capL: Main.capFirstLetter, capA: Main.capAllLetters, musicQueue: queue, convert: Main.secondsToDuration });
});

/* guilds.get('/:guildID/player', async (req, res) => {
    const guild = client.guilds.cache.get(req.params.guildID);
    if (!guild) {
        return res.redirect('/');
    }
    const member = guild.members.cache.get(req.user.id);
    if (!member) {
        return res.redirect('/');
    }
    if (!member.permissions.has('MANAGE_GUILD')) {
        return res.redirect('/');
    }

    const queue = client.queue.get(guild.id);

    // console.log(queue);

    if (queue) {
        let progress = ''
        progress = queue.connection.dispatcher.streamTime / 1000;
        progress = Math.floor(progress);
        progress = Main.secondsToDuration(progress);

        let info = {
            current: {
                artist: queue.songs[0].author,
                title: queue.songs[0].title,
                duration: Main.secondsToDuration(queue.songs[0].duration),
                progress: progress,
                thumbnail: queue.songs[0].thumbnail,
                playing: queue.playing,
            },
            songs: queue.songs,
        };
        
        setInterval(() => {
            res.io.emit('player', info);
        })
    }
}); */

guilds.post('/:guildID/player', async (req, res) => {
    const guild = client.guilds.cache.get(req.params.guildID);
    if (!guild) {
        return res.redirect('/');
    }
    const member = guild.members.cache.get(req.user.id);
    if (!member) {
        return res.redirect('/');
    }
    if (!member.permissions.has('MANAGE_GUILD')) {
        return res.redirect('/');
    }

    const queue = client.queue.get(guild.id);

    if (queue && req.body.player) {
        let action = req.body.player;
        switch (action) {
            case 'play':
                queue.playing = true;
                queue.connection.dispatcher.resume();
                break;
            case 'pause':
                queue.playing = false;
                queue.connection.dispatcher.pause();
                break;
            case 'skip':
                queue.connection.dispatcher.end();
                break;
        }
    }
});

guilds.post('/:guildID/prefix', async (req, res) => {
    const guild = client.guilds.cache.get(req.params.guildID);
    if (!guild) {
        return res.redirect('/');
    }
    const member = guild.members.cache.get(req.user.id);
    if (!member) {
        return res.redirect('/');
    }
    if (!member.permissions.has('MANAGE_GUILD')) {
        return res.redirect('/');
    }

    let storedSettings = await Servers.findOne({ serverID: guild.id });

    let prefix = req.body.prefix;

    storedSettings.prefix = prefix;

    storedSettings.save();

    res.redirect('back');
});

guilds.post('/:guildID/roles', async (req, res) => {
    const guild = client.guilds.cache.get(req.params.guildID);
    if (!guild) {
        return res.redirect('/');
    }
    const member = guild.members.cache.get(req.user.id);
    if (!member) {
        return res.redirect('/');
    }
    if (!member.permissions.has('MANAGE_GUILD')) {
        return res.redirect('/');
    }

    let storedSettings = await Servers.findOne({ serverID: guild.id });

    let inputKeys = Object.keys(req.body);
    let inputValues = Object.values(req.body);

    inputKeys.forEach((key, index) => {
        let inputType = key.split('-')[0];
        let role = key.split('-')[1];
        if (inputType.length > 1) {
            inputType += 's';
        }
        let value = inputValues[index];
        if (typeof (value) !== 'undefined' && value.length > 0) {
            storedSettings[inputType][role].name = value;
            let gRole = guild.roles.cache.find(r => r.name === value);
            if (gRole) {
                storedSettings[inputType][role].id = gRole.id
            } else {
                storedSettings[inputType][role].id = '';
            }
        }
    });

    storedSettings.save();

    res.redirect('back');
});

guilds.post('/:guildID/channels', async (req, res) => {
    const guild = client.guilds.cache.get(req.params.guildID);
    if (!guild) {
        return res.redirect('/');
    }
    const member = guild.members.cache.get(req.user.id);
    if (!member) {
        return res.redirect('/');
    }
    if (!member.permissions.has('MANAGE_GUILD')) {
        return res.redirect('/');
    }

    let storedSettings = await Servers.findOne({ serverID: guild.id });

    let inputKeys = Object.keys(req.body);
    let inputValues = Object.values(req.body);

    inputKeys.forEach((key, index) => {
        let inputType = key.split('-')[0];
        let channel = key.split('-')[1];
        if (inputType.length > 1) {
            inputType += 's';
        }
        let value = inputValues[index];
        if (typeof (value) !== 'undefined' && value.length > 0) {
            storedSettings[inputType][channel].name = value;
        }
    });

    storedSettings.save();

    res.redirect('back');
});

/* guilds.post('/:guildID/toggle', async (req, res) => {
    const guild = client.guilds.cache.get(req.params.guildID);
    if (!guild) {
        return res.redirect('/');
    }
    const member = guild.members.cache.get(req.user.id);
    if (!member) {
        return res.redirect('/');
    }
    if (!member.permissions.has('MANAGE_GUILD')) {
        return res.redirect('/');
    }

    let storedSettings = await Servers.findOne({ serverID: guild.id });

    let inputKeys = Object.keys(req.body);
    let inputValues = Object.values(req.body);

    console.log(req.body);

    res.redirect('back');
}); */

guilds.use('/:guildID/channel', (req, res, next) => {
    req.guildID = req.params.guildID;
    next();
}, channels);

guilds.use('/:guildID/member', (req, res, next) => {
    req.guildID = req.params.guildID;
    next();
}, members);

guilds.use('/:guildID/queue', (req, res, next) => {
    req.guildID = req.params.guildID;
    next();
}, queue);

module.exports = guilds;