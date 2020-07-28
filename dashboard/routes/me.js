const Main = require('../app');
const router = require('express').Router();
const { client } = require('../../index');
const Discord = require('discord.js');

router.get('/', async (req, res) => {
    let user = req.user;
    let guild = client.guilds.cache.random();
    let member = guild.members.cache.get(user.id);
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
        case Main.calculateBitwise(0, 0):
            userType = 'None';
            break;
        case Main.calculateBitwise(1, 0):
            userType = 'Discord Employee';
            break;
        case Main.calculateBitwise(1, 1):
            userType = 'Discord Partner';
            break;
        case Main.calculateBitwise(1, 2):
            userType = 'HypeSquad Events';
            break;
        case Main.calculateBitwise(1, 3):
            userType = 'Bug Hunter Level 1';
            break;
        case Main.calculateBitwise(1, 6):
            userType = 'House Bravery';
            break;
        case Main.calculateBitwise(1, 7):
            userType = 'House Brilliance';
            break;
        case Main.calculateBitwise(1, 8):
            userType = 'House Balance';
            break;
        case Main.calculateBitwise(1, 9):
            userType = 'Early Supporter';
            break;
        case Main.calculateBitwise(1, 10):
            userType = 'Team User';
            break;
        case Main.calculateBitwise(1, 12):
            userType = 'System';
            break;
        case Main.calculateBitwise(1, 14):
            userType = 'Bug Hunter Level 2';
            break;
        case Main.calculateBitwise(1, 16):
            userType = 'Verified Bot';
            break;
        case Main.calculateBitwise(1, 17):
            userType = 'Verified Bot Devleoper';
            break;
        default:
            userType = 'None';
            break;
    }

    let bgColor = await Main.colorHex(`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128`);
    Main.renderTemplate(res, req, 'me.ejs', { perms: Discord.Permissions, capL: Main.capFirstLetter, capA: Main.capAllLetters, status: memberStatus, activity: activity, premium: premiumType, title: userType, color: bgColor });
});

module.exports = router;