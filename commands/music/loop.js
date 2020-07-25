exports.run = async (client, message) => {
    let queue = client.queue;
    let serverQueue = queue.get(message.guild.id);

    if(serverQueue && serverQueue.playing) {
        if(serverQueue.loop) {
            serverQueue.loop = false;
            message.channel.send('Loop turned off');
        } else {
            serverQueue.loop = true;
            message.channel.send('Loop turned on');
        }
    } else {
        return message.channel.send(`Music not playing`);
    }
};

exports.help = {
    enabled: true,
    name: 'loop',
    aliases: [],
    args: [],
    permission: 'DJ',
    description: 'Loop the current song',
};