const { client } = require('../index');

const mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const Users = require('../models/users');
const Servers = require('../models/servers');

client.on('guildMemberAdd', async member => {
    const newMember = new Users({
        serverID: member.guild.id,
        userName: member.user.username,
        userID: member.user.id,
        level: 0,
        xp: 0,
    });

    newMember.save().catch(err => console.error(err));

    let server = await Servers.findOne({ serverID: member.guild.id });

    if(server.toggles.autorole === true) {
        let memberRole = member.guild.roles.cache.find(r => r.name === server.roles.member);
        if(!memberRole) {
            member.guild.owner.send('Please set up AutoRole');
        } else {
            member.roles.add(memberRole);
        }
    }
});