exports.run = async (client, message, args) => {
    if(args && args.length > 0) {
        message.channel.send(`${message.author.username} has paid their respect for **${args.join(' ')}** :heart:`);
    } else {
        message.channel.send(`${message.author.username} has paid their respect :heart:`);
    }
};

exports.help = {
    enabled: true,
    name: 'f',
    aliases: [],
    args: ['[person]'],
    permission: 'USER',
    description: 'Press F to Pay Respect',
};