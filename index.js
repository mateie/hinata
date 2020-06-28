/* eslint-disable no-shadow */
const Discord = require('discord.js');
// eslint-disable-next-line no-unused-vars
const Logging = require('./util/logging');
const Loader = require('./util/loader');
require('dotenv').config();

const client = new Discord.Client({
    partials: ['MESSAGE'],
});

client.prefix = '!';
client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();
client.queue = new Map();
client.categories = [];
client.spamChannels = [];
client.game = { hangman: new Map() };

module.exports = { client: client };

Loader.init();
Loader.events(client);
Loader.commands(client);

exports.sendClientObject = () => {
    return client;
};

exports.sendGuildsObject = () => {
    let guilds = client.guilds;

    return guilds;
};

client.login(process.env.BOT_TOKEN);