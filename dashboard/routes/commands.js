const commands = require('express').Router();
const Main = require('../app');
const Discord = require('discord.js');

commands.get('/', (req, res) => {
    Main.renderTemplate(res, req, 'commands.ejs', { res, perms: Discord.Permissions, capL: Main.capFirstLetter, capA: Main.capAllLetters })
});

module.exports = commands;