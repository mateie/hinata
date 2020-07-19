const mongoose = require('mongoose');

const serversSchema = mongoose.Schema({
    serverID: String,
    serverName: String,
    prefix: String,
    messageID: String,
    roles: {
        owner: String,
        admin: String,
        dj: String,
        user: String,
        mute: String,
    },
    channels: {
        commands: String,
        logs: String,
        spam: String,
        notifications: String,
        reactions: String,
        dashboard: String,
    },
});

module.exports = mongoose.model('Servers', serversSchema);