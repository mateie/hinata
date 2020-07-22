exports.run = (client, message, args) => {
    console.log('hello');
};

exports.help = {
    enabled: true,
    name: 'test',
    description: 'Hello',
    permission: 'USER',
    args: [],
    aliases: [],
};