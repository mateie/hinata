exports.run = (client, message) => {
    let user = message.mentions.users.first();
    message.channel.send(`${message.author.username} hammered ${user.username} :hammer:`);
};

exports.help = {
    enabled: true,
    name: 'hammer',
    aliases: [],
    args: ['<@mention>'],
    permission: 'USER',
    description: 'Throws a hammer at a user',
};