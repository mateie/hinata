exports.run = async (client, message, args) => {
    let queue = client.queue;
    let serverQueue = queue.get(message.guild.id);

    let newVolume = parseInt(args[0]) || undefined;
    if (!newVolume) {
        return message.channel.send(`Current Volume is ${serverQueue.volume}`);
    }

    if (newVolume < 1 || newVolume > 200) {
        return message.channel.send(`Please, enter an integer from 1 to 200 Volume: ${serverQueue.volume}`);
    }

    if (serverQueue && serverQueue.playing) {
        serverQueue.last_volume = serverQueue.volume;
        serverQueue.volume = newVolume;
        serverQueue.connection.dispatcher.setVolumeLogarithmic(newVolume / 100);
        message.channel.send(`Successfully set the volume to ${newVolume}`);
    } else {
        return message.channel.send(':no_entry_sign: Music not playing');
    }
};

exports.help = {
    enabled: true,
    name: 'volume',
    aliases: ['vol'],
    args: ['[0-200]'],
    permission: 'DJ',
    description: 'Set a volume to an integer',
};