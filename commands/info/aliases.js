const Discord = require('discord.js');

exports.run = async (client, message, args) => {
    const commandFile = client.commands.get(args[0]) || client.aliases.get(args[0]);

    let actual = client.settings.role.actual;
    let allowedRoles = client.settings.role.nodes[actual].allowedRoles;

    if(!commandFile || !allowedRoles.includes(commandFile.help.permission) && commandFile.help.name != 'help') {
        message.delete(client.delete_timeout);
        // eslint-disable-next-line no-shadow
        return message.channel.send('Command not found').then(message => message.delete(client.delete_timeout));
    }

    let aliasesEmbed = new Discord.MessageEmbed()
    .setTitle(`Aliases: Command - ${commandFile.help.name}`)
    .addField(`${client.prefix}${commandFile.help.name} ${commandFile.help.args.join(' ')}`, commandFile.help.desscription)
    .addField('\u200b', '\u200b')
    .addField(`Aliases:`, commandFile.help.aliases.join(', ') || '-none-');

    message.channel.send(aliasesEmbed);
};

exports.help = {
    name: 'aliases',
    aliases: ['more', 'moar'],
    args: ['[command]'],
    permission: 'USER',
    description: 'Shows all aliases of [command]',
};