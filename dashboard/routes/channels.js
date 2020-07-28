const channels = require('express').Router();
const Main = require('../dashboard');
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

    Main.renderTemplate(res, req, 'channels.ejs', { guild, channel, messages, perms: Discord.Permissions, capL: Main.capFirstLetter, capA: Main.capAllLetters, time: Main.getTime });
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

    let messages = channel.messages.cache;

    let messageSent = req.body.message;

    if (messageSent) {
        channel.send(`\`\`\`From: Dashboard\nSent by: ${member.user.username}#${member.user.discriminator}\`\`\` ${messageSent}`);
    }

    Main.renderTemplate(res, req, 'channels.ejs', { guild, channel, messages, perms: Discord.Permissions, capL: Main.capFirstLetter, capA: Main.capAllLetters, time: Main.getTime });
})

module.exports = channels;