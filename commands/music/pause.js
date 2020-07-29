exports.run = async (client, message) => {
    let queue = client.queue;
    let serverQueue = queue.get(message.guild.id);

    if(serverQueue) {
        if(serverQueue.playing) {
            serverQueue.playing = false;
            serverQueue.connection.dispatcher.pause();
            message.channel.send(':pause_button: Music paused');
        } else {
            serverQueue.playing = true;
            serverQueue.connection.dispatcher.resume();
            message.channel.send(':arrow_forward: Music resumed');
        }
    } else {
        return message.channel.send(':no_entry_sign: Music is not playing');
    }
};

exports.help = {
    enabled: true,
    name: 'pause',
    aliases: [],
    args: [],
    permission: 'MODERATOR',
    description: 'Pauses the current queue',
};