const { client } = require('../index');

const Servers = require('../models/servers');

client.on('messageReactionAdd', ({ message, _emoji }, user) => {
    Servers.findOne({
        serverID: message.guild.id,
    }, (err, res) => {
        if(err) console.log(err);

        let messageID = res.messageID;
        if(user.bot || message.id !== messageID) {
            return;
        }

        if(message.partial) {
            try {
                message.fetch();
            } catch (err) {
                console.error('Error fetching message', err);
                return;
            }
        }

        const guild = message.guild;

        const member = guild.members.cache.get(user.id);
        const role = guild.roles.cache.find(r => r.name === _emoji.name.toUpperCase());

        if(!role) {
            console.error(`Role not found for '${_emoji.name.toUpperCase()}'`);
            return;
        }

        try {
            member.roles.add(role.id);
        } catch (err) {
            console.error('Error adding role', err);
            return;
        }
    });
});