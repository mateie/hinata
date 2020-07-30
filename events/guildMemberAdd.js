const { client } = require('../index');
const Canvas = require('canvas');
const { MessageAttachment } = require('discord.js');

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

    if (server.toggles.autorole === true) {
        let memberRole = member.guild.roles.cache.find(r => r.name === server.roles.member);
        if (!memberRole) {
            member.guild.owner.send('Please set up AutoRole');
        } else {
            member.roles.add(memberRole);
        }
    }

    if (server.toggles.joinmessage === true) {
        let joinChannel = member.guild.channels.cache.find(ch => ch.name === server.channels.joinchannel);

        if (joinChannel) {
            const canvas = Canvas.createCanvas(700, 250);
            const ctx = canvas.getContext('2d');

            const bg = await Canvas.loadImage(`${process.cwd()}/data/images/messagebg.jpg`);
            ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

            ctx.strokeStyle = '#097b03';
            ctx.strokeRect(0, 0, canvas.width, canvas.height);

            ctx.font = '28px sans-serif';
            let welcomeGradient = ctx.createLinearGradient(0, 0, 170, 170);
            welcomeGradient.addColorStop(0, 'green');
            welcomeGradient.addColorStop(1, 'grey');
            ctx.fillStyle = welcomeGradient;
            ctx.fillText(`Welcome to ${member.guild.name}`, canvas.width / 2.5, canvas.height / 2.3);

            ctx.font = applyText(canvas, `${member.displayName}`);
            let memberGradient = ctx.createLinearGradient(0, 0, 170, 170);
            memberGradient.addColorStop(0, 'grey');
            memberGradient.addColorStop(1, 'black');
            ctx.fillStyle = memberGradient;
            ctx.fillText(`${member.displayName}`, canvas.width / 2.5, canvas.height / 1.5);

            ctx.beginPath();
            ctx.arc(125, 125, 100, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.clip();

            const avatar = await Canvas.loadImage(member.user.displayAvatarURL({ format: 'jpg' }));
            ctx.drawImage(avatar, 25, 25, 200, 200);

            const attachment = new MessageAttachment(canvas.toBuffer(), 'welcome.png');

            joinChannel.send(`Welcome to the village, ${member}`, attachment);
        } else {
            member.guild.owner.send('Please set up your welcome channel inside config or disable "join message" toggle');
        }
    }
});

const applyText = (canvas, text) => {
    const ctx = canvas.getContext('2d');

	let fontSize = 70;

	do {
		ctx.font = `${fontSize -= 10}px sans-serif`;
	} while (ctx.measureText(text).width > canvas.width - 300);

	return ctx.font;
};