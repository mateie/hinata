const { exec } = require('child_process');

exports.run = (client, message, args) => {
    exec(args.join(' '), {}, (err, stdout) => {
        if (err) return message.channel.send('```' + err.message + '```');
        message.channel.send(`\`\`\`${stdout}\`\`\``);
    });
};

exports.help = {
    enabled: true,
    name: 'exec',
    aliases: [],
    args: ['<process>'],
    permission: 'BOT_OWNER',
    description: 'Executes a process command',
};