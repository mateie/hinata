const owner = require('express').Router();
const { client } = require(`${process.cwd()}/index`);
const Main = require('../app');

owner.get('/', (req, res) => {
    const owner = req.user;

    if (owner !== process.env.OWNER_ID) {
        return res.redirect('/');
    }

    let allUsers = client.users.cache;
    let allGuilds = client.guilds.cache;
    let allChannels = client.channels.cache;
    let allCommands = client.commands.cache;
    let allCategories = client.categories;

    Main.renderTemplate(res, req, 'owner.ejs', { owner, perms: Discord.Permissions, capL: Main.capFirstLetter, capA: Main.capAllLetters, allUsers, allGuilds, allChannels, allCommands, allCategories });
});

module.exports = owner;