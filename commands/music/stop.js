exports.run = async (client, message) => {
    let queue = client.queue;
    let serverQueue = queue.get(message.guild.id);

    if(serverQueue && serverQueue.playing) {
        serverQueue.songs = [];
        serverQueue.connection.dispatcher.end();
        message.channel.send('Music stopped');
    } else {
        return message.channel.send('Music not playing');
    }
};

exports.help = {
    name: 'stop',
    aliases: [],
    args: [],
    permission: 'DJ',
    description: 'Stop the music',
    usage: 'stop',
};