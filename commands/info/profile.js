const Canvas = require('canvas');
const Discord = require('discord.js');

const Users = require('../../models/users');
const { getXp } = require('../../util/experience');

exports.run = async (client, message) => {

    let member = message.author;

    Users.findOne({
        serverID: message.guild.id,
        userID: member.id,
    }, async (err, settings) => {
        if (err) console.error(err);

        let width = 700,
            height = 250;

        const canvas = Canvas.createCanvas(width, height);
        const ctx = canvas.getContext('2d');

        const avatarImg = message.author.displayAvatarURL({ format: 'png', dynamic: true });

        const bg = await Canvas.loadImage('https://s3-us-west-2.amazonaws.com/wsffimages/wp-content/uploads/2020/06/02085933/BlackSquare.jpg');
        ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = '#74037b';
        ctx.strokeRect(0, 0, canvas.width, canvas.height);

        ctx.font = this.applyText(canvas, settings.userName, 'name');
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`${settings.userName}`, canvas.width / 2, canvas.height / 4);

        ctx.font = this.applyText(canvas, settings.xp);
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`Level: ${settings.level}`, canvas.width / 2.8, canvas.height / 2);
        ctx.fillText(`XP: ${Math.round(settings.xp)}`, canvas.width / 1.3, canvas.height / 2);
        ctx.fillText(`XP Needed to Level up: ${Math.round(getXp(settings.xp) - settings.xp)}`, canvas.width / 2.7, canvas.height / 1.3);

        ctx.beginPath();
        ctx.arc(125, 125, 100, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();

        const avatar = await Canvas.loadImage(avatarImg);
        ctx.drawImage(avatar, 25, 25, 200, 200);

        const attachment = new Discord.MessageAttachment(canvas.toBuffer(), `${member.username}-profile.png`);

        message.channel.send(attachment);

    });

};

exports.help = {
    enabled: true,
    name: 'profile',
    aliases: ['me'],
    args: [''],
    permission: 'USER',
    description: 'Shows User\'s Profile',
};

exports.applyText = (canvas, text, type) => {
    const ctx = canvas.getContext('2d');
    let fontSize = 28;
    if(type === 'name') {
        fontSize = 50;
    }

    do {
        ctx.font = `${fontSize -= 10}px sans-serif`;
    } while (ctx.measureText(text).width > canvas.width - 300);

    return ctx.font;
};