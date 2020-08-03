exports.run = async (client, message) => {
    let serverQueue = client.queue.get(message.guild.id);

    if(serverQueue && serverQueue.playing) {
        serverQueue.songs = [];
        serverQueue.connection.dispatcher.end();
        return message.channel.send(':stop_button: Music stopped');
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