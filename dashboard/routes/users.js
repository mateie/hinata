const users = require('express').Router();
const Main = require('../dashboard');
const { client } = require('../../index');
const { BadRequest, NotFound } = require('../util/errors');
const Discord = require('discord.js');

users.get('/:userID', async (req, res) => {
    const guild = client.guilds.cache.get(req.guildID);
    if (!guild) {
        throw new NotFound('Guild not found');
    }
    const member = guild.members.cache.get(req.params.userID);
    if (!member) {
        throw new NotFound('Member not found');
    }
    let memberStatus = member.presence.status;

    switch (memberStatus) {
        case 'dnd':
            memberStatus = Main.capAllLetters(memberStatus);
            break;
        default:
            memberStatus = Main.capFirstLetter(memberStatus);
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
    activity.type = Main.capFirstLetter(activity.type);

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
        bgColor = await Main.colorHex(`https://cdn.discordapp.com/avatars/${member.user.id}/${member.user.avatar}.png?size=128`);
    } else {
        bgColor = '#007bff';
    }

    Main.renderTemplate(res, req, 'user.ejs', { perms: Discord.Permissions, capL: Main.capFirstLetter, capA: Main.capAllLetters, member: member, status: memberStatus, color: bgColor, activity: activity });
});

module.exports = users;