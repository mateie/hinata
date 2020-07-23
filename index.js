const Discord = require('discord.js');
const Loader = require('./util/loader');
require('dotenv').config();

const client = new Discord.Client({
    partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
});

client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();
client.queue = new Map();
client.categories = [];

module.exports = { client: client };

Loader.init();
Loader.events(client);
Loader.commands(client);

client.login(process.env.BOT_TOKEN);