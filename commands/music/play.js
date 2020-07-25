const { MessageEmbed } = require('discord.js');
const YTDL = require('ytdl-core');
const Search = require('youtube-search');

exports.run = async (client, message, args) => {
    let queue = client.queue;
    let serverQueue = queue.get(message.guild.id);

    let voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
        return message.channel.send('You have to be in a voice channel to play music');
    }

    let validate = YTDL.validateURL(args[0]);
    if (!validate) {
        let search_options = {
            maxResults: 10,
            key: process.env.GOOGLE_API_KEY,
        };
        let search_results = await Search(args.join(" "), search_options);
        if (search_results.results.length > 0) {
            args[0] = search_results.results.find(val => val.kind == "youtube#video").link;
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

    if (!serverQueue) {
        let serverQueueConstructor = {
            text_channel: message.channel,
            voice_channel: voiceChannel,
            connection: null,
            songs: [],
            volume: 100,
            last_volume: 100,
            loop: false,
            playing: true,
        };

        queue.set(message.guild.id, serverQueueConstructor);

        serverQueueConstructor.songs.push(song);

        try {
            let connection = await voiceChannel.join();
            connection.on('disconnect', (err) => {
                if (err) console.error(err);

                // eslint-disable-next-line no-shadow
                let serverQueue = client.queue.get(message.guild.id);
                if (serverQueue.connection.dispatcher) {
                    serverQueue.songs = [];
                    serverQueue.connection.dispatcher.end();
                    message.channel.send(':stop_button: Music stopped');
                }
            });

            serverQueueConstructor.connection = connection;
            this.play(client, message, serverQueueConstructor.songs[0]);
        } catch (err) {
            console.error(err);
            queue.delete(message.guild.id);
            return message.channel.send(`${err}`);
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
};

exports.play = (client, message, song) => {
    let queue = client.queue;
    let serverQueue = queue.get(message.guild.id);

    if (!song) {
        serverQueue.voice_channel.leave();
        return queue.delete(message.guild.id);
    }

    let dispatcher = serverQueue.connection
        .play(YTDL(song.url, { filter: 'audioonly', highWaterMark: 1 << 25 }))
        .on('finish', () => {
            if (!serverQueue.loop) {
                serverQueue.songs.shift();
            }
            this.play(client, message, serverQueue.songs[0]);
        })
        .on('error', err => console.error(err));

    dispatcher.setVolumeLogarithmic(serverQueue.volume / 100);
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
    serverQueue.text_channel.send({ embed });
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