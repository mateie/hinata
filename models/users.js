const mongoose = require('mongoose');

const usersSchema = mongoose.Schema({
    serverID: String,
    userName: String,
    userID: String,
    level: Number,
    xp: Number,
});

module.exports = mongoose.model('Users', usersSchema);