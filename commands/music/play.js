/* eslint-disable no-shadow */
const { MessageEmbed } = require('discord.js');
const YTDL = require('ytdl-core');
const Search = require('youtube-search');

exports.run = async (client, message, args) => {
    try {
        const queue = client.queue;
        const serverQueue = client.queue.get(message.guild.id);

        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) {
            return message.channel.send("You have to be in a voice channel");
        }

        const permissions = voiceChannel.permissionsFor(client.user);
        if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
            return message.channel.send('I need the permissions to join and speak in your voice channel');
        }

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
            thumbnail: songInfo.videoDetails.thumbnail.thumbnails[4].url ? songInfo.videoDetails.thumbnail.thumbnails[4].url : songInfo.videoDetails.thumbnail.thumbnails[0].url,
        };

        if (!serverQueue) {
            let queueConstruct = {
                textChannel: message.channel,
                voiceChannel: voiceChannel,
                connection: null,
                songs: [],
                volume: 100,
                last_volume: 100,
                loop: false,
                playing: true,
            };

            queue.set(message.guild.id, queueConstruct);
            queueConstruct.songs.push(song);

            try {
                let connection = await voiceChannel.join();
                queueConstruct.connection = connection;
                play(message, queueConstruct.songs[0]);
            } catch (err) {
                console.log(err);
                queue.delete(message.guild.id);
                return message.channel.send(err);
            }
        } else {
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
    } catch (error) {
        console.error(error);
        message.channel.send(error.message);
    }
};

exports.help = {
    enabled: true,
    name: 'play',
    aliases: ['p', 'music'],
    args: ['<video url/video name>'],
    permission: 'MODERATOR',
    description: 'Play music',
};

const play = async (message, song) => {
    const queue = message.client.queue;
    const guild = message.guild;
    const serverQueue = queue.get(message.guild.id);

    if (!song) {
        serverQueue.voiceChannel.leave();
        queue.delete(guild.id);
        return;
    }

    const dispatcher = serverQueue.connection
        .play(YTDL(song.url, { highWaterMark: 1 << 25, quality: 'highestaudio', filter: 'audioonly' }))
        .on("finish", () => {
            if (!serverQueue.loop) {
                serverQueue.songs.shift();
            }
            play(message, serverQueue.songs[0]);
        })
        .on("error", error => console.error(error));

    dispatcher.setVolumeLogarithmic(serverQueue.volume / 100);
    if (!serverQueue.loop) {
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
        serverQueue.textChannel.send({ embed });
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