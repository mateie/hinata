const superagent = require('superagent');

exports.run = async (client, message, args) => {
    const { body } = await superagent
    .get('https://nekos.life/api/v2/owoify?text=' + args.join('%20'));

    message.channel.send(body.owo);
};

exports.help = {
    enabled: true,
    name: 'owoify',
    aliases: [],
    args: ['<text>'],
    permission: 'MEMBER',
    description: 'OwO-ify a message',
};