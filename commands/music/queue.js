const Discord = require('discord.js');

exports.run = async (client, message) => {

    let queue = client.queue;
    let serverQueue = queue.get(message.guild.id);

    if(serverQueue) {
        let embed = new Discord.MessageEmbed()
        .setTitle(`${message.guild.name} Music Queue`);

        serverQueue.songs.forEach((song, index) => {
            let progress = '';

            if(index == 0) {
                progress = serverQueue.connection.dispatcher.streamTime / 1000;
                progress = Math.floor(progress);
                progress = secondsToDuration(progress);
                embed.addField(`[Currently Playing] ${song.title}`, `Song Duration: [${progress}/${secondsToDuration(song.duration)}]`);
            } else {
                embed.addField(`[${index}] ${song.title}`, `Song Duration: ${secondsToDuration(song.duration)}`);
            }
        });

        embed.addField(`Loop: ${serverQueue.loop ? 'On' : 'Off'}`, '\u200B', true);
        embed.addField(`Queue size: ${serverQueue.songs.length}`, '\u200B', true);
        message.channel.send(embed);
    } else {
        return message.channel.send(':no_entry_sign: Music is not playing');
    }
};

exports.help = {
    enabled: true,
    name: 'queue',
    aliases: ['q'],
    args: [],
    permission: 'MEMBER',
    description: 'Shows the current queue',
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