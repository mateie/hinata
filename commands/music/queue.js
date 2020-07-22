const { MessageEmbed } = require('discord.js');

exports.run = async (client, message) => {

    let queue = client.queue;
    let serverQueue = queue.get(message.guild.id);

    if(serverQueue) {
        let embed = new MessageEmbed()
        .setTitle('Music queue');

        serverQueue.songs.forEach((song, index) => {
            let progress = '';
            if(index == 0) progress = `${secondsToDuration(Math.floor(serverQueue.connection.dispatcher.time / 100))}/`;

            embed.addField(`[${index}] ${song.title} (${progress}${secondsToDuration(song.duration)})`, song.url);
        });

        embed.addField(`Loop: ${serverQueue.loop}`, `Queue size: ${serverQueue.songs.length}`);
        message.channel.send(embed);
    } else {
        return message.channel.send('Music not playing');
    }
};

exports.help = {
    enabled: true,
    name: 'queue',
    aliases: ['q'],
    args: [],
    permission: 'DJ',
    description: 'Shows the current queue',
    usage: 'queue',
};

function secondsToDuration(sec) {
    let hours = Math.floor(sec / 3600);
    let minutes = Math.floor((sec - (hours * 3600)) / 60);
    let seconds = sec - (hours * 3600) - (minutes * 60);

    if(hours < 10) hours = `0${hours}`;
    if(minutes < 10) minutes = `0${minutes}`;
    if(seconds < 10) seconds = `0${seconds}`;

    if(hours > 0) return `${hours}:${minutes}:${seconds}`;
    else return `${minutes}:${seconds}`;
}