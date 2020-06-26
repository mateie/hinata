/* eslint-disable no-shadow */
/* eslint-disable no-unused-vars */
const Discord = require('discord.js');
const mongoose = require('mongoose');
const Canvas = require('canvas');

const Users = require('../../models/users');
const XPCalc = require('../../util/experience');

mongoose.connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

exports.run = async (client, message) => {
    let user = message.mentions.members.first() || message.member;

    if(user.user.bot) {
        return message.channel.send('This user is a bot, it can\'t collect XP');
    }

    Users.findOne({
        serverID: message.guild.id,
        userID: user.user.id,
    }, async (err, res) => {
        if(err) console.error(err);

        let text;

        if(!res) {
            const newUser = new Users({
                serverID: message.guild.id,
                userName: user.user.username,
                userID: user.user.id,
                level: 0,
                xp: 0,
            });

            newUser.save();
            let res = { level: 0, xp: 0 };
        }

        let level = res.level;
        let xp = res.xp;

        let size = { width: 900, height: 300 };
        let levelGfx = Canvas.createCanvas(size.width, size.height);
        let ctx = levelGfx.getContext('2d');

        ctx.fillStyle = 'rgb(34, 37, 43)';
        ctx.fillRect(0, 0, size.width, size.height);

        ctx.font = '80px Calibri';
        ctx.fillStyle = 'rgb(255, 255, 255)';
        ctx.fillText(user.user.tag, 320, 110, 540);

        let start = XPCalc.getXp(level);
        let dest = XPCalc.getXp(level + 1);
        let percent = (xp - start) / (dest - start) * 100;

        ctx.fillStyle = 'rgb(255, 255, 255)';
        ctx.fillRect(320, 200, 540, 40);

        ctx.fillStyle = 'rgb(113, 235, 52)';
        ctx.fillRect(320, 200, Math.ceil(540 * percent / 100), 40);

        ctx.font = '35px Calibri';
        ctx.fillStyle = 'rgb(255, 255, 255)';
        if(dest >= 1000) {
            text = `${(xp / 100).toFixed(3)}K / ${(dest / 1000).toFixed(3)}K XP`;
        } else {
            text = `${xp.toFixed(2)}`;
        }

        let textBox = ctx.measureText(text);

        ctx.fillText(text, 860 - textBox.width, 192);

        ctx.font = '45px Calibri';
        ctx.fillStyle = 'rgb(255, 255, 255)';
        ctx.fillText(`Level ${level}`, 320, 192);

        let avatar = await Canvas.loadImage(user.user.avatarURL);

        ctx.strokeStyle = 'rgb(54, 57, 63)';
        ctx.beginPath();
        ctx.arc(128 + 30, 128 + 22, 128, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatar, 30, 22, 256, 256);

        let attachment = new Discord.MessageAttachment(levelGfx.toBuffer());
        message.channel.send(attachment);
    });
};

exports.help = {
    name: 'xp',
    aliases: [],
    args: ['@mention'],
    permission: 'USER',
    description: 'Displays user XP',
};