exports.run = async (client, message, args) => {
    let queue = client.queue;
    let serverQueue = queue.get(message.guild.id);

    args[0] = parseInt(args[0]);
    if(args[0] <= 0 || args[0] > serverQueue.songs.length - 1) {
        return message.channel.send('Invalid number specified');
    }

    if(serverQueue) {
        message.channel.send(`Track ${args[0]} removed from the queue`);
        serverQueue.songs.splice(args[0], 1);
    } else {
        return message.channel.send('Music not playing');
    }
};

exports.help = {
    name: 'remove',
    aliases: ['rm'],
    args: ['<position>'],
    permission: 'DJ',
    description: 'Removes a track from the queue',
};