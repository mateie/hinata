const channels = require('express').Router();
const Main = require('../app');
const { client } = require(`${process.cwd()}/index`);
const Discord = require('discord.js');

channels.get('/:channelID', async (req, res) => {
    const guild = client.guilds.cache.get(req.guildID);
    if (!guild) {
        return res.redirect('/');
    }
    const channel = guild.channels.cache.get(req.params.channelID);
    if (!channel) {
        return res.redirect('/');
    }
    const member = guild.members.cache.get(req.user.id);
    if (!member) {
        return res.redirect('/');
    }

    try {
        await channel.messages.fetch();
    } catch (err) {
        console.error('Error fetching messages');
        console.error(err);
        return;
    }

    let messages = channel.messages.cache;

    let markdownRegex = /[*`_]/gm;

    messages.forEach(message => {
        message.content = message.content.replace(markdownRegex, '');
    });

    Main.renderTemplate(res, req, 'channel.ejs', { guild, channel, messages, perms: Discord.Permissions, capL: Main.capFirstLetter, capA: Main.capAllLetters, time: Main.getTime });
});

channels.post('/:channelID', async (req, res) => {
    const guild = client.guilds.cache.get(req.guildID);
    if (!guild) {
        return res.redirect('/');
    }
    const channel = guild.channels.cache.get(req.params.channelID);
    if (!channel) {
        return res.redirect('/');
    }
    const member = guild.members.cache.get(req.user.id);
    if (!member) {
        return res.redirect('/');
    }

    try {
        await channel.messages.fetch();
    } catch (err) {
        console.error('Error fetching messages');
        console.error(err);
        return;
    }

    let messageSent = req.body.message;

    if (messageSent) {
        let msg = {
            author: {
                id: member.user.id,
                avatar: member.user.avatar,
                username: member.user.username,
                hashtag: member.user.discriminator,
            },
            message: messageSent,
        };

        res.io.emit('channel message', msg);

        channel.send(`**${member}**: ${msg.message}`);
    }
});

module.exports = channels;