const { exec } = require('shelljs');

exports.run = async (client, message, args) => {
    let reason = args.slice(0).join(' ');

    if (reason.length < 1) reason = 'No reason provided';

    message.channel.send(`The Developer is restarting the bot, Reason: ${reason}`);
    console.log(`Restarting the bot, Reason: ${reason}`);
    setTimeout(() => {
        exec('node .');
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