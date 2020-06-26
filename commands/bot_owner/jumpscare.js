exports.run = async (client, message) => {
    let voiceChannel = message.member.voice.channel;

    let connection = await voiceChannel.join();

    let soundFiles = [`${process.cwd()}/data/sounds/fnaf/fnaf.mp3`, `${process.cwd()}/sounds/fnaf/fnaf2.mp3`, `${process.cwd()}/sounds/fnaf/fnaf3.mp3`];

    let soundFile = soundFiles[Math.floor(Math.random() * soundFiles.length)];

    connection.play(soundFile, { volume: 10 })
    .on('finish', () => {
        message.channel.send(`${message.author.username} just made everybody shit themselves :poop: :poop: :poop:`);
        voiceChannel.leave();
    })
    .on('error', err => {
        console.log('Err: ', err);
    });
};

exports.help = {
    name: 'jumpscare',
    aliases: [],
    args: [],
    permission: 'BOT_OWNER',
    description: 'Jumpscare somebody *poop*',
};