const { client } = require('../index');

const mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const Users = require('../models/users');
const Warns = require('../models/warns');

client.on('guildMemberRemove', member => {
    Users.findOneAndDelete({
        userID: member.id,
    }, err => {
        if(err) console.error(err);
    });

    Warns.deleteMany({
        userID: member.id,
    }, err => {
        if(err) console.error(err);
    });
});