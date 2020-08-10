const mongoose = require('mongoose');

const serversSchema = mongoose.Schema({
    serverID: String,
    serverName: String,
    prefix: String,
    messageID: String,
    roles: {
        owner: {
            id: String,
            name: String,
        },
        admin: {
            id: String,
            name: String,
        },
        moderator: {
            id: String,
            name: String,
        },
        member: {
            id: String,
            name: String,
        },
        mute: {
            id: String,
            name: String,
        },
    },
    channels: {
        join_channel: {
            id: String,
            name: String,
        },
        leave_channel: {
            id: String,
            name: String,
        },
        commands: {
            id: String,
            name: String,
        },
        system_messages: {
            id: String,
            name: String,
        },
        reactions: {
            id: String,
            name: String,
        },
    },
    toggles: {
        auto_role: Boolean,
        join_message: Boolean,
        leave_message: Boolean,
        strict_commands: Boolean,
        system_messages: Boolean,
        reaction_roles: Boolean,
    },
});

module.exports = mongoose.model('Servers', serversSchema);