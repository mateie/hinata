exports.run = async (client, message) => {
    let queue = client.queue;
    let serverQueue = queue.get(message.guild.id);

    if(serverQueue) {
        message.channel.send('Song skipped');
        serverQueue.connection.dispatcher.end();
    } else {
        return message.channel.send('Music not playing');
    }
};

exports.help = {
    name: 'skip',
    aliases: ['s'],
    args: [],
    permission: 'DJ',
    description: 'Skip the current song',
    usage: 'skip',
};