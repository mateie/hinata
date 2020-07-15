const Discord = require('discord.js');
const mongoose = require('mongoose');

const Users = require('../../models/users');

mongoose.connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

exports.run = async (client, message) => {
    Users.find({
        serverID: message.guild.id,
    })
    .sort([
        ['xp', 'descending'],
    ])
    .exec((err, res) => {
        if(err) console.error(err);

        let rankEmbed = new Discord.MessageEmbed()
        .setTitle(`${message.guild.name} Leaderboard`);

        let newRes = [];
        res.forEach(elem => {
            if(elem.xp != 0) newRes.push(elem);
        });
        res = newRes;

        if(res.length == 0) {
            rankEmbed.addField('There are not any members in the database', '\u200b');
        } else if(res.length < 10) {
            res.forEach((elem, index) => {
                rankEmbed.addField(`${index + 1}. @${message.guild.members.cache.get(elem.userID).user.tag}`, `${elem.xp > 1000 ? (`${(elem.xp / 1000).toFixed(3)}K`) : (elem.xp.toFixed(2))} XP (Level ${elem.level})`);
            });
        } else if(res.length > 10) {
            for(let i = 0; i < 10; i++) {
                let elem = res[i];
                rankEmbed.addField(`${i + 1}. @${message.guild.members.cache.get(elem.userID).user.tag}`, `${elem.xp > 1000 ? (`${(elem.xp / 1000).toFixed(3)}K`) : (elem.xp.toFixed(2))} XP (Level ${elem.level})`);
            }
        }

        message.channel.send(rankEmbed);
    });
};

exports.help = {
    enabled: true,
    name: 'leaderboard',
    aliases: ['ranks'],
    args: [],
    permission: 'USER',
    description: 'Displays server\'s leaderboard',
};