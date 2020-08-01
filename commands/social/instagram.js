/* eslint-disable no-lonely-if */
const { MessageEmbed } = require('discord.js');
const userInstagram = require('user-instagram');

exports.run = async (client, message, args) => {
    let userArg = args[0];
    let postsArg = args[1];

    userInstagram(userArg)
    .then(user => {
        if(postsArg == 'post') {
            let posts = user.posts;
            let post = posts[Math.floor(Math.random() * posts.length)];

            console.log(post);

            const embed = new MessageEmbed()
            .setTitle(`${user.username}'s Random Post`)
            .setURL(post.url)
            .setDescription(`Caption: ${post.caption}`)
            .setThumbnail(post.imageUrl);
            if(post.likesCount === 1) {
                embed.addField('Liked by', '1 Person', true);
            } else if(post.likesCount < 1) {
                embed.addField('Liked by', 'No One', true);
            } else if(post.likesCount > 1) {
                embed.addField('Liked by', `${post.likesCount} people`, true);
            }

            if(post.commentsDisabled === true) {
                embed.addField('Comments are disabled', '\u200B');
            } else {
                if(post.commentsCount === 1) {
                    embed.addField('Commented by', '1 Person', true);
                } else if(post.commentsCount < 1) {
                    embed.addField('Commented by', 'No One', true);
                } else if(post.commentsCount > 1) {
                    embed.addField('Commented by', `${post.commentsCount} people`, true);
                }
            }

            return message.channel.send({ embed });

        } else {
            const embed = new MessageEmbed()
            .setTitle(`${user.username}'s Profile`)
            .setURL(user.link)
            .setDescription(`${user.biography}`)
            .setThumbnail(user.profilePicHD)
            .addField('Full Name', user.fullName, true)
            .addField('Followers', user.subscribersCount, true)
            .addField('Following', user.subscribtions, true)
            .addField('Posts', user.postsCount, true);

            if(user.isPrivate === true) {
                embed.addField('Private User', '\u200B');
            }

            if(user.recentUser === true) {
                embed.addField('Recent User', '\u200B');
            }

            if(user.isVerified === true) {
                embed.addField('Verified User', '\u200B');
            }

            if(user.isBusinessAccount === true) {
                embed.addField('Business Account', '\u200B');
            }

            return message.channel.send({ embed });
        }
    })
    .catch(() => {
        return message.reply('User not found');
    });
};

exports.help = {
    enabled: true,
    name: 'instagram',
    aliases: ['ig'],
    args: ['<user>', '[post]'],
    permission: 'MEMBER',
    description: 'Displays information about a user on instagram',
};