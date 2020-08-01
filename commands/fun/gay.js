const { MessageAttachment } = require('discord.js');
const { loadImage, createCanvas } = require('canvas');

exports.run = async (client, message, args) => {
    const canvas = createCanvas(256, 256);
    const ctx = canvas.getContext('2d');

    if(!args[0]) {
        const avatarImage = message.author.displayAvatarURL({ format: 'png', dynamic: true, size: 256 });

        const avatar = await loadImage(avatarImage);
        ctx.drawImage(avatar, 0, 0, canvas.width, canvas.height);

        const flag = await loadImage(`${process.cwd()}/data/images/pride_flag.png`);
        ctx.globalAlpha = 0.5;
        ctx.drawImage(flag, 0, 0, canvas.width, canvas.height);

        const attachment = new MessageAttachment(canvas.toBuffer());

        return message.channel.send(attachment);
    } else {
        let user = message.mentions.users.first();

        const userImage = user.displayAvatarURL({ format: 'png', dynamic: true, size: 256 });

        const avatar = await loadImage(userImage);
        ctx.drawImage(avatar, 0, 0, canvas.width, canvas.height);

        const flag = await loadImage(`${process.cwd()}/data/images/pride_flag.png`);
        ctx.globalAlpha = 0.5;
        ctx.drawImage(flag, 0, 0, canvas.width, canvas.height);

        const attachment = new MessageAttachment(canvas.toBuffer());

        return message.channel.send(attachment);
    }
};

exports.help = {
    enabled: true,
    name: 'gay',
    aliases: ['pride', 'lgbt'],
    args: ['[@mention]'],
    permission: 'MEMBER',
    description: 'Makes avatar with gay flag',
};