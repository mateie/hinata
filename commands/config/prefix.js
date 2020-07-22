const { connect } = require('mongoose');
const Servers = require(`${process.cwd()}/models/servers`);

connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

exports.run = async (client, message, args) => {
    Servers.findOne({
        serverID: message.guild.id,
    }, (err, settings) => {
        if(err) console.error(err);

        let prefix = args[0];

        if(!prefix) {
            return message.channel.send(`\`\`\`Current Prefix is ${settings.prefix}\`\`\``);
        }

        message.channel.send(`\`\`\`Prefix set from "${settings.prefix}" to "${prefix}"\`\`\``);
        settings.prefix = prefix;

        settings.save()
        .catch(err => {
            console.error(err);
        });
    });
};

exports.help = {
    enabled: true,
    name: 'prefix',
    aliases: ['pre'],
    args: ['[prefix]'],
    permission: 'OWNER',
    description: 'Edit Server Prefix',
};