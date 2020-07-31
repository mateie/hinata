const router = require('express').Router();
const Discord = require('discord.js');
const { client } = require('../../index');

const Main = require('../app');

router.get('/', (req, res, next) => {
    let botStatus = client.presence.status;
    let botActivity = client.presence.activities[0];

    let bgColor;

    switch (botStatus) {
        case 'dnd':
            bgColor = 'danger';
            botStatus = Main.capAllLetters(botStatus);
            break;
        case 'idle':
            bgColor = 'warning';
            botStatus = Main.capFirstLetter(botStatus);
            break;
        case 'online':
            bgColor = 'success';
            botStatus = Main.capFirstLetter(botStatus);
            break;
        default:
            bgColor = 'black';
            botStatus = Main.capFirstLetter(botStatus);
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
    activity.type = Main.capFirstLetter(activity.type);

    switch (activity.type) {
        case 'Listening':
            activity.type += ' to';
            break;
    }

    Main.renderTemplate(res, req, 'index.ejs', { perms: Discord.Permissions, status: botStatus, activity: activity, bg: bgColor, capL: Main.capFirstLetter, capA: Main.capAllLetters });
});

module.exports = router;