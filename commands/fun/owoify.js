const superagent = require('superagent');

exports.run = async (client, message, args) => {
    if(!args[0]) return message.reply('You need to input a sentence to make it into OwO');
    const { body } = await superagent
    .get('https://nekos.life/api/v2/owoify?text=' + args.join('%20'));

    message.channel.send(body.owo);
};

exports.help = {
    name: 'owoify',
    aliases: [],
    args: ['<text>'],
    permission: 'USER',
    description: 'OwO-ify a message',
};