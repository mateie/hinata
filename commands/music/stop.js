exports.run = async (client, message) => {
    let queue = client.queue;
    let serverQueue = queue.get(message.guild.id);

    if(serverQueue && serverQueue.playing) {
        serverQueue.songs = [];
        serverQueue.connection.dispatcher.end();
        message.channel.send(':stop_button: Music stopped');
    } else {
        return message.channel.send(':no_entry_sign: Music not playing');
    }
};

exports.help = {
    enabled: true,
    name: 'stop',
    aliases: [],
    args: [],
    permission: 'MODERATOR',
    description: 'Stop the music',
};