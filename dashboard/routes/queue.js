const queue = require('express').Router();
const { client } = require(`${process.cwd()}/index`);
const Main = require('../app');
const Discord = require('discord.js');
const YTDL = require('ytdl-core');
const Search = require('youtube-search');

queue.get('/', async (req, res) => {
    const guild = client.guilds.cache.get(req.guildID);
    if (!guild) {
        return res.redirect('/');
    }
    const member = guild.members.cache.get(req.user.id);
    if (!member) {
        return res.redirect('/');
    }
    if (!member.permissions.has('MANAGE_GUILD')) return res.redirect('/');

    const queue = client.queue.get(guild.id);

    let notification;

    Main.renderTemplate(res, req, 'queue.ejs', { req: req, perms: Discord.Permissions, capL: Main.capFirstLetter, capA: Main.capAllLetters, alertMessage: notification, member: member, queue: queue, guild: guild, convert: secondsToDuration });
});

queue.post('/', async (req, res) => {
    const guild = client.guilds.cache.get(req.guildID);
    if (!guild) {
        return res.redirect('/');
    }
    const member = guild.members.cache.get(req.user.id);
    if (!member) {
        return res.redirect('/');
    }
    if (!member.permissions.has('MANAGE_GUILD')) return res.redirect('/');

    const queue = client.queue.get(guild.id);

    let songLink = req.body['song-link'];

    let notification;

    if (songLink) {
        let validate = YTDL.validateURL(songLink);
        if (!validate) {
            let searchOptions = {
                maxResults: 10,
                key: process.env.GOOGLE_API_KEY,
            };

            let searchResults = await Search(songLink, searchOptions);
            if (searchResults.results.length > 0) {
                songLink = searchResults.results.find(val => val.kind == 'youtube#video').link;
                if (!YTDL.validateURL(songLink)) {
                    notification = 'Video not found';
                }
            } else {
                notification = 'Video not found';
            }
        }

        let songInfo = await YTDL.getInfo(songLink);
        if (songInfo) {
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

            if (queue) {
                if (queue.songs.length >= 20) {
                    notification = 'Max Queue Length is 20';
                } else {
                    queue.songs.push(song);
                    notification = 'Song Successfully added to the queue';
                }
            }
        }
    }

    if (Object.keys(req.body).length < 1) {
        queue.songs.forEach((song, index) => {
            if (index !== 0) {
                delete queue.songs[index];
            }
        });
    }

    res.redirect(req.originalUrl);
});

module.exports = queue;