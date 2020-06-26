const Discord = require('discord.js');

exports.run = async (client, message, args) => {
    let help = new Discord.MessageEmbed();

    let roles = client.settings.roles;
    let actual = roles.actual;
    let allowedRoles = roles.nodes[actual].allowed_roles;
    let totalCommands = 0;

    if(!args[0] || !client.categories.includes(args[0])) {
        help.addField(`Usage: ${client.prefix}${this.help.name} ${this.help.args}`, '\u200b')
        .addField(`Available categories:`, client.categories.join(', '));

        return message.channel.send(help);
    }

    help.setTitle(`Help: ${args[0]}`);

    // eslint-disable-next-line no-unused-vars
    client.commands.forEach(value => {
        if(value.help.category == args[0] && allowedRoles.includes(value.help.permission)) {
            help.addField(`${client.prefix}${value.help.name} ${value.help.args.join(' ')}`, `${value.help.description}`);
            totalCommands++;
        }
    });

    if(totalCommands <= 0) {
        help.addField(`There isn't any available command for you`, '\u200b');
    }

    message.channel.send(help);
};

exports.help = {
    name: 'help',
    aliases: ['?', 'hlep', 'hepl'],
    args: ['[category]'],
    permission: '@everyone',
    description: 'Shows all commands',
};