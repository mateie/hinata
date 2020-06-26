const copypastas = require(`${process.cwd()}/data/copypastas.json`);

exports.run = (client, message) => {
    message.channel.send(`${copypastas[Math.floor(Math.random() * copypastas.length)]}`);
};

exports.conf = {
    enabled: true,
    guildOnly: false,
    aliases: ['cp'],
    permLevel: 0,
};

exports.help = {
    name: 'copypasta',
    aliases: ['cp'],
    args: [],
    description: 'Sends a random copypasta',
};