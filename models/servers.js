const mongoose = require('mongoose');

const serversSchema = mongoose.Schema({
    serverID: String,
    serverName: String,
    prefix: String,
    messageID: String,
    roles: {
        owner: String,
        admin: String,
        moderator: String,
        member: String,
        mute: String,
    },
    channels: {
        joinchannel: String,
        leavechannel: String,
        commands: String,
        logs: String,
        spam: String,
        reactions: String,
    },
    toggles: {
        autorole: Boolean,
        joinmessage: Boolean,
        leavemessage: Boolean,
    },
});

module.exports = mongoose.model('Servers', serversSchema);