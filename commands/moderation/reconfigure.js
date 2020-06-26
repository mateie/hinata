exports.run = async (client, message, args) => {
    if(!args[0] == `confirm${message.guild.id}`) {
        await message.channel.send(`Resetting...`);

        client.emit('guildDelete', message.guild);
        client.emit('guildCreate', message.guild);
    } else {
        message.channel.send(`This will reset all bot settings in the database, you will lose all settings, xp and warns. \n If you want to continue, use following command:\`\`\`${client.prefix}reconfigure confirm${message.guild.id}\`\`\``);
    }
};

exports.help = {
    name: 'reconfigure',
    aliases: [],
    args: [],
    permission: 'OWNER',
    description: 'Reconfigures the bot in current guild',
};