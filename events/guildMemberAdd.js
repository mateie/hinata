const { client } = require('../index');
const Canvas = require('canvas');
const { MessageAttachment } = require('discord.js');
const gm = require('gm').subClass({ imageMagick: true });
const request = require('request');
const jimp = require('jimp');

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

    if (server.toggles.auto_role === true) {
        let memberRole = member.guild.roles.cache.find(r => r.name === server.roles.member);
        if (!memberRole) {
            member.guild.owner.send('Please set up AutoRole');
        } else {
            member.roles.add(memberRole);
        }
    }

    if (server.toggles.join_message === true) {
        let joinChannel = member.guild.channels.cache.find(ch => ch.name === server.channels.join_channel);

        if (joinChannel) {
            Canvas.registerFont(`${process.cwd()}/data/fonts/main.ttf`, { family: 'Naruto' });
            const canvas = Canvas.createCanvas(942, 677);
            const ctx = canvas.getContext('2d');

            const bg = await Canvas.loadImage(`${process.cwd()}/data/images/messagebg.jpg`);
            ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

            ctx.strokeStyle = '#b19cd9';
            ctx.strokeRect(0, 0, canvas.width, canvas.height);

            ctx.font = '60px Naruto';
            ctx.fillStyle = 'white';
            ctx.fillText('Welcome', canvas.width / 3.3, canvas.height / 3.3);

            ctx.font = applyText(canvas, `to ${member.guild.name}`);
            ctx.fillStyle = 'white';
            ctx.fillText(`to ${member.guild.name}`, canvas.width / 3.1, canvas.height / 2.4);

            console.log(member);

            if (member.guild.icon) {
                let url = `https://cdn.discordapp.com/icons/${member.guild.id}/${member.guild.icon}`;
                let gAvatarBuffer = await roundImage(url);

                const gAvatar = await Canvas.loadImage(gAvatarBuffer);

                ctx.drawImage(gAvatar, canvas.width / 1.5, canvas.height / 1.243, 64, 64);
            }

            if (member.user.avatar) {
                let url = member.user.displayAvatarURL({ format: 'jpg' });
                let avatarBuffer = await roundImage(url);

                const avatar = await Canvas.loadImage(avatarBuffer);

                ctx.drawImage(avatar, canvas.width / 3.25, canvas.height / 2.042, 128, 128);
            }

            let extLayer = await Canvas.loadImage(`${process.cwd()}/data/images/layer.png`);
            ctx.drawImage(extLayer, 0, 0);

            ctx.font = applyText(canvas, `${member.user.username}`);
            ctx.fillStyle = 'white';
            ctx.fillText(`${member.user.username}`, canvas.width / 2.24, canvas.height / 1.72);

            ctx.font = '42px Naruto';
            ctx.fillStyle = 'grey';
            ctx.fillText(`#${member.user.discriminator}`, canvas.width / 2.24, canvas.height / 1.51);

            const attachment = new MessageAttachment(canvas.toBuffer(), `welcome-${member.user.username}-${member.user.discriminator}.png`);

            joinChannel.send(attachment)
            .catch(err => {
                console.error(err);
            });
        } else {
            // member.guild.owner.send('Please set up your welcome channel inside config or disable "join message" toggle');
        }
    }
});

const applyText = (canvas, text) => {
    const ctx = canvas.getContext('2d');

    let fontSize = 55;

    do {
        ctx.font = `${fontSize -= 10}px Naruto`;
    } while (ctx.measureText(text).width > canvas.width - 300);

    return ctx.font;
};

const roundImage = url => {
    return new Promise((resolve, reject) => {
        gm(request(url)).drawArc(125, 125, 0, 0, 100, 100).toBuffer('png', async (err, buffer) => {
            if (err) reject(err);
            jimp.read(buffer)
                .then(image => {
                    image.quality(100)
                        .circle();
                    resolve(image.getBufferAsync('image/png'));
                })
                .catch(err => {
                    reject(err);
                });
        });
    });
};