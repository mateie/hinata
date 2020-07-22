const { readdirSync, readFileSync } = require('fs');
const { MessageAttachment } = require('discord.js');

exports.run = (client, message) => {
    let files = readdirSync(`${process.cwd()}/data/shitposts/`);

    const random = files[Math.floor(Math.random() * files.length)];

    let file = readFileSync(`${process.cwd()}/data/shitposts/${random}`);

    const shitpostAttachment = new MessageAttachment(file, random);
    message.channel.send(shitpostAttachment);
};

exports.help = {
    enabled: true,
    name: 'shitpost',
    aliases: ['spost', 'sp', 'shitp'],
    args: [],
    permission: 'USER',
    description: 'Sends a random shitpost from the Bot\'s space',
};