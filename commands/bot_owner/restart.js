const shell = require('shelljs');

exports.run = async (client, message, args) => {
    let reason = args.slice(0).join(' ');

    if(reason.length < 1) reason = 'No reason provided';

    if(message.author.id !== '401269337924829186') return message.channel.send('Did you just try to restart the bot? ok...');
    message.channel.send(`The Developer is restarting the bot, Reason: ${reason}`);
    console.log(`Restarting the bot, Reason: ${reason}`);
    setTimeout(() => {
        shell.exec('node .');
        process.exit();
    });
};

exports.help = {
    enabled: true,
    name: 'restart',
    aliases: [],
    args: ['[reason]'],
    permission: 'BOT_OWNER',
    description: 'Restart the bot',
    usage: 'restart',
};