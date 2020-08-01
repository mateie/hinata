exports.run = (client, message, args) => {
    let id = args[0];
    if(!id) id = message.guild.id;
    client.guilds.get(id).leave()
    .then(g => console.log(`Left ${g}`));
};

exports.conf = {
    enabled: true,
    guildOnly: false,
    aliases: [],
    permLevel: 5,
};

exports.help = {
    enabled: true,
    name: 'leave',
    aliases: [],
    args: ['[guild id]'],
    permission: 'OWNER',
    description: 'Leave the server that bot is invited in',
};