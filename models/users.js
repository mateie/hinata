const mongoose = require('mongoose');

const usersSchema = mongoose.Schema({
    userID: String,
    userName: String,
    hashtag: String,
    level: Number,
    xp: Number,
});

module.exports = mongoose.model('Users', usersSchema);