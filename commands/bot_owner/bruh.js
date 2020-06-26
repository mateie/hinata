exports.run = async (client, message) => {

    let voiceChannel = message.member.voice.channel;

    let soundFile = `${process.cwd()}/data/sounds/bruh.mp3`;

    let connection = await voiceChannel.join();

    connection.play(soundFile, { volume: 100 })
    .on('finish', () => {
        message.channel.send(`**${message.author.username}** just did a Bruh moment`);
        voiceChannel.leave();
    })
    .on('error', err => {
        console.log('Err: ', err);
    });
};

exports.help = {
    name: 'bruh',
    aliases: [],
    args: [],
    permission: 'BOT_OWNER',
    description: 'Bruh...',
};