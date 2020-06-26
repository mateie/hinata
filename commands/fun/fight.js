const fights = require(`${process.cwd()}/data/fights.json`);

exports.run = (client, message, args) => {
    let user = message.mentions.users.first();
    let reason = args.slice(0).join(' ');
    if(reason.length < 1) return message.reply('You can\'t fight thin air mate, pick someone to fight pussy');
    if(user.id === '628361998970650643') return message.reply('You just got Bruh Momented');
    if(user.id === '401269337924829186') return message.reply('You can\'t fight the creator');
    message.channel.send(`${message.author.username} is fighting ${user.username} ${fights[Math.floor(Math.random() * fights.length)]}`);
};

exports.help = {
    name: 'fight',
    aliases: [],
    args: ['<user>'],
    permission: 'USER',
    description: 'Fight a user',
};