/* eslint-disable no-shadow */
const { MessageEmbed } = require('discord.js');
const YTDL = require('ytdl-core');
const Search = require('youtube-search');

exports.run = async (client, message, args) => {
    const { channel } = message.member.voice;
    if (!channel) {
        return message.channel.send('You have to be in a voice channel to play music');
    }

    const serverQueue = message.client.queue.get(message.guild.id);

    let validate = YTDL.validateURL(args[0]);
    if (!validate) {
        let searchOptions = {
            maxResults: 10,
            key: process.env.GOOGLE_API_KEY,
        };
        let searchResults = await Search(args.join(" "), searchOptions);
        if (searchResults.results.length > 0) {
            args[0] = searchResults.results.find(val => val.kind == 'youtube#video').link;
            if (!YTDL.validateURL(args[0])) {
                return message.channel.send(':no_entry_sign: Video not found');
            }
        } else {
            return message.channel.send(':no_entry_sign: Video not found');
        }
    }

    let songInfo = await YTDL.getInfo(args[0]);
    let song = {
        author: {
            name: songInfo.videoDetails.author.name,
            channel: songInfo.videoDetails.author.channel_url,
            avatar: songInfo.videoDetails.author.avatar,
        },
        title: songInfo.videoDetails.title,
        url: songInfo.videoDetails.video_url,
        duration: songInfo.videoDetails.lengthSeconds,
        likes: songInfo.videoDetails.likes,
        dislikes: songInfo.videoDetails.dislikes,
        thumbnail: songInfo.videoDetails.thumbnail.thumbnails[4].url,
    };

    if (serverQueue) {
        if (serverQueue.songs.length >= 20) {
            return message.channel.send('**Max Queue Length is 20**');
        }

        serverQueue.songs.push(song);
        const embed = new MessageEmbed()
            .setColor('RANDOM')
            .setTitle(song.title)
            .setURL(song.url)
            .setAuthor(song.author.name, song.author.avatar, song.author.channel)
            .setDescription('Added To The Queue')
            .setImage(song.thumbnail)
            .addField('Video Length', this.secondsToDuration(song.duration), true)
            .addField('Likes', song.likes, true)
            .addField('Dislikes', song.dislikes, true);
        return message.channel.send({ embed });
    }

    let queueConstruct = {
        textChannel: message.channel,
        voiceChannel: channel,
        connection: null,
        songs: [],
        volume: 100,
        last_volume: 100,
        loop: false,
        playing: true,
    };

    message.client.queue.set(message.guild.id, queueConstruct);
    queueConstruct.songs.push(song);

    const play = async song => {
        const queue = message.client.queue.get(message.guild.id);
        if (!song) {
            queue.voiceChannel.leave();
            message.client.queue.delete(message.guild.id);
            return;
        }

        let dispatcher = queue.connection
            .play(YTDL(song.url, { filter: 'audioonly', quality: 'highestaudio', highWaterMark: 1 << 25 }), { highWaterMark: 1 })
            .on('finish', () => {
                if (!queue.loop) {
                    queue.songs.shift();
                }
                play(queue.songs[0]);
            })
            .on('error', err => console.error(err));

        dispatcher.setVolumeLogarithmic(queue.volume / 100);
        const embed = new MessageEmbed()
            .setColor('RANDOM')
            .setTitle(song.title)
            .setURL(song.url)
            .setAuthor(song.author.name, song.author.avatar, song.author.channel)
            .setDescription('Now Playing')
            .setImage(song.thumbnail)
            .addField('Video Length', this.secondsToDuration(song.duration), true)
            .addField('Likes', song.likes, true)
            .addField('Dislikes', song.dislikes, true);
        queue.textChannel.send({ embed });
    };

    try {
        const connection = await channel.join();
        queueConstruct.connection = connection;
        play(queueConstruct.songs[0]);
    } catch (err) {
        console.error(`I could not join the voice channel: ${err}`);
        message.client.queue.delete(message.guild.id);
        await channel.leave();
        return message.channel.send(`I could not join the voice channel: \`\`\`${err}\`\`\``);
    }
};

exports.secondsToDuration = sec => {
    let hours = Math.floor(sec / 3600);
    let minutes = Math.floor((sec - (hours * 3600)) / 60);
    let seconds = sec - (hours * 3600) - (minutes * 60);

    if (hours < 10) hours = `0${hours}`;
    if (minutes < 10) minutes = `0${minutes}`;
    if (seconds < 10) seconds = `0${seconds}`;

    if (hours > 0) return `${hours}:${minutes}:${seconds}`;
    else return `${minutes}:${seconds}`;
};

exports.help = {
    enabled: true,
    name: 'play',
    aliases: ['p', 'music'],
    args: ['<video url/video name>'],
    permission: 'DJ',
    description: 'Play music',
};