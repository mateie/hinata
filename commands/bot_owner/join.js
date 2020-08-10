exports.run = (client, message) => {
    client.emit('guildMemberAdd', message.member);
};

exports.help = {
    enabled: true,
    name: 'join',
    args: [],
    aliases: [],
    permission: 'BOT_OWNER',
    description: 'Testing',
};
