exports.run = (client, message) => {
    let user = message.mentions.users.first();
    if(message.mentions.users.size < 1) return message.reply('You can\'t hammer a thin air');
    if(user.id == client.user.id) return message.channel.send('You can\'t hammer me dumbass');
    if(user.id == '401269337924829186') return message.reply('You can\'t hammer my dev pfft');
    message.channel.send(`${message.author.username} hammered ${user.username} :hammer:`);
};

exports.help = {
    name: 'hammer',
    aliases: [],
    args: ['@mention'],
    permission: 'USER',
    description: 'Throws a hammer at a user',
};