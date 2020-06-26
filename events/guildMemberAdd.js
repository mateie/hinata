const { client } = require('../index');

const mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const Users = require('../models/users');

client.on('guildMemberAdd', member => {
    Users.findOne({
        userID: member.id,
    }, (err, res) => {
        if (res.userID === member.id) {
            console.log('This user already aexists in the database');
        } else {
            const newMember = new Users({
                serverID: member.guild.id,
                userName: member.user.username,
                userID: member.id,
                level: 0,
                xp: 0,
            });

            newMember.save().catch(err => console.error(err));
        }
    });
});