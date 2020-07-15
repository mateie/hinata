exports.run = (client, message, args) => {
    args = message.content.split(' ').slice(1);
    message.delete();
    if(message.content.includes('@everyone') || message.content.includes('@here')) return message.channel.send('I won\'t ping anyone');
    message.channel.send(args.join(' ')).cleanContent;
};

exports.help = {
    enabled: true,
    name: "say",
    aliases: [],
    args: ['<message>'],
    permission: 'USER',
    description: "Makes the bot repeat your message",
};