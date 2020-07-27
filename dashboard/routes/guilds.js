const Main = require('../dashboard');
const { client } = require('../../index');
const Discord = require('discord.js');
const { BadRequest, NotFound } = require('../util/errors');
const Servers = require(`${process.cwd()}/models/servers`);

// Routes
const guilds = require('express').Router();
const channels = require('./channels');
const users = require('./users');
const queue = require('./queue');

guilds.get('/:guildID', async (req, res) => {
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

    let storedSettings = await Servers.findOne({ serverID: guild.id });

    Main.renderTemplate(res, req, 'guild.ejs', { req: req, guild, settings: storedSettings, alertMessage: null, toasts: res.locals.toasts, perms: Discord.Permissions, capL: Main.capFirstLetter, capA: Main.capAllLetters, musicQueue: queue });
});

guilds.post('/:guildID', async (req, res) => {
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
            input = Main.capFirstLetter(input);
            names[z] = input;
        }

        names = names.join(' ');

        embed.addField('\u200b', `${names} was updated to ${inputValue}`);
    }

    member.send({ embed });

    storedSettings.save();

    const queue = client.queue.get(guild.id);

    Main.renderTemplate(res, req, 'guild.ejs', { req: req, guild, settings: storedSettings, alertMessage: 'Your Settings have been saved', toasts: res.locals.toasts, perms: Discord.Permissions, capL: Main.capFirstLetter, capA: Main.capAllLetters, musicQueue: queue });
});

guilds.use('/:guildID/channel', (req, res, next) => {
    req.guildID = req.params.guildID;
    next();
}, channels);

guilds.use('/:guildID/user', (req, res, next) => {
    req.guildID = req.params.guildID;
    next();
}, users);

guilds.use('/queue', (req, res, next) => {
    req.guildID = req.params.guildID;
    next();
}, queue);

module.exports = guilds;