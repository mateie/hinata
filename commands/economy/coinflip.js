exports.run = async (client, message) => {
    let random = (Math.floor(Math.random() * Math.floor(2)));
    if(random === 0) {
        message.channel.send('Heads');
    } else {
        message.channel.send('Tails');
    }
};

exports.help = {
    name: 'coinflip',
    aliases: ['cf'],
    args: [],
    permission: 'USER',
    description: 'Flip a coin',
};