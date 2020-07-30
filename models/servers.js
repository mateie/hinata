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
        join_channel: String,
        leave_channel: String,
        commands: String,
        logs: String,
        spam: String,
        reactions: String,
    },
    toggles: {
        auto_role: Boolean,
        join_message: Boolean,
        leave_message: Boolean,
    },
});

module.exports = mongoose.model('Servers', serversSchema);