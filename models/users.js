const mongoose = require('mongoose');

const usersSchema = mongoose.Schema({
    serverID: String,
    userID: String,
    userName: String,
    level: Number,
    xp: Number,
});

module.exports = mongoose.model('Users', usersSchema);