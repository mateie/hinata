const { MessageEmbed } = require('discord.js');

exports.run = async (client, message) => {
    let avatarCurrent = client.user.displayAvatarURL({ format: 'png', dynamic: true, size: 128 });
    let avatarNew = message.attachments.first();

    if(!avatarNew) {
        return message.channel.send('Please attach an image to set the avatar');
    }

    client.user.setAvatar(avatarNew.url)
    .catch(err => {
        console.error(err);
        return message.channel.send('Can\'t change avatars too fast');
    });

    const embed = new MessageEmbed()
    .setTitle('Bot\'s Avatar Changed from :arrow_right:')
    .setThumbnail(avatarCurrent)
    .addField('To', ':arrow_down:', true)
    .setImage(avatarNew.proxyURL);

    message.channel.send({ embed });

};

exports.help = {
    enabled: true,
    name: 'setavatar',
    aliases: ['botavatar'],
    args: ['<picture>'],
    permission: 'BOT_OWNER',
    description: 'Sets a Bot\'s avatar to the provided one',
};