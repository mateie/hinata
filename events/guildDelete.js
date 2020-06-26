const { client } = require('../index');

const mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const Servers = require('../models/servers');
const Users = require('../models/users');
const Warns = require('../models/warns');

client.on('guildDelete', guild => {
    Servers.findOneAndDelete({
        serverID: guild.id,
    }, err => {
        if(err) console.error(err);
    });

    Users.deleteMany({
        serverID: guild.id,
    }, err => {
        if(err) console.error(err);
    });

    Warns.deleteMany({
        serverID: guild.id,
    }, err => {
        if(err) console.error(err);
    });
});