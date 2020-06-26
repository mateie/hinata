const Discord = require('discord.js');

exports.run = async (client, message, args) => {
    if(!args[0]) return message.reply('Please ask a question mate');
    let replies = [
        'Maybe.',
        'Certainly not.',
        'I hope so.',
        'Not in your wildest dreams.',
        'There is a good chance.',
        'Quite likely.',
        'I think so.',
        'I hope not.',
        'I hope so.',
        'Never!',
        'Pfft.',
        'Sorry, bucko.',
        'Hell, yes.',
        'Hell to the no.',
        'The future is bleak.',
        'The future is uncertain.',
        'I would rather not say.',
        'Who cares?',
        'Possibly.',
        'Never, ever, ever.',
        'There is a small chance.',
        'Yes!',
        'lol no.',
        'There is a high probability.',
        'What difference does it makes?',
        'Not my problem.',
        'Ask someone else.',
    ];

    let result = Math.floor((Math.random() * replies.length));
    let question = args.slice(0).join(' ');

    let embed = new Discord.MessageEmbed()
    .setTitle('8 Ball')
    .setColor('#AA9900')
    .setTitle(question)
    .addField('Answer', replies[result]);

    message.channel.send({ embed });
};

exports.help = {
    name: '8ball',
    aliases: [],
    args: ['(question)'],
    permission: 'USER',
    description: 'Ask the bot a Question.',
};