exports.run = async (client, message) => {
    let queue = client.queue;
    let serverQueue = queue.get(message.guild.id);

    if(serverQueue) {
        message.channel.send(':arrow_right: Song skipped');
        serverQueue.connection.dispatcher.end();
    } else {
        return message.channel.send(':no_entry_sign: Music not playing');
    }
};

exports.help = {
    enabled: true,
    name: 'skip',
    aliases: ['s'],
    args: [],
    permission: 'DJ',
    description: 'Skip the current song',
};