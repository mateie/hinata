const { client } = require('../index');

const Servers = require('../models/servers');

client.on('messageReactionRemove', ({ message, _emoji }, user) => {
    Servers.findOne({
        serverID: message.guild.id,
    }, (err, res) => {
        if (err) console.error(err);

        let messageID = res.messageID;
        if (user.bot || message.id !== messageID) {
            return;
        }

        if (message.partial) {
            try {
                message.fetch();
            } catch (err) {
                console.error('Error fetching mesage', err);
                return;
            }
        }

        const guild = message.guild;

        const member = guild.members.cache.get(user.id);
        let roleName = _emoji.name.includes('_') ? _emoji.name.replace('_', ' ').toUpperCase() : _emoji.name.toUpperCase();
        const role = guild.roles.cache.find(r => r.name === roleName);

        if (!role) {
            console.error(`Role not found for '${_emoji.name.toUpperCase()}'`);
            return;
        }

        try {
            member.roles.remove(role.id);
        } catch (err) {
            console.error('Error removing role', err);
            return;
        }
    });
});