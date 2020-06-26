exports.run = (client, message) => {
    message.channel.send(`:game_die: **${message.author.username}**, you rolled a **${Math.floor(Math.random() * 6) + 1}**`);
};

exports.help = {
    name: 'roll',
    aliases: [],
    args: [],
    permission: 'USER',
    description: 'Rolls a dice',
};