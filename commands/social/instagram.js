const axios = require("axios");
const Discord = require('discord.js');

exports.run = async (client, message, args) => {
    let userArg = args[0];
    let postsArg = args[1];

    if (!userArg) {
        return message.channel.send('Please provide a username');
    }

    axios({
        'method': 'GET',
        'url': `https://instagramdimashirokovv1.p.rapidapi.com/user/${userArg}`,
        'headers': {
            "content-type": "application/octet-stream",
            "x-rapidapi-host": "InstagramdimashirokovV1.p.rapidapi.com",
            "x-rapidapi-key": "ee5d3766fcmsh1a5855f46b91c44p105263jsn1c212bea554b",
            "useQueryString": true,
        },
    })
        .then(res => {
            let user = res.data;
            if (postsArg == 'post') {
                let posts = user.edge_owner_to_timeline_media.edges;
                let post = posts[Math.floor(Math.random() * posts.length)];
                console.log(post);

                const embed = new Discord.MessageEmbed()
                .setTitle(`${user.full_name}'s Random Post`);
                if(post.edge_liked_by === 1) {
                    embed.addField('Liked by', '1 Person', true);
                }
                if(post.edge_liked_by < 1) {
                    embed.addField('Liked by', 'No one', true);
                }
                if(post.edge_liked_by > 1) {
                    embed.addField('Liked by', `${post.edge_liked_by} people`, true);
                }
                embed.addField('Comments', post.edge_media_to_comment, true);
                if(!post.comments_disabled) {
                    embed.addField('Comments disabled?', 'No', true);
                } else {
                    embed.addField('Comments disabled?', 'Yes', true);
                }

                return message.channel.send({ embed });
            } else {
                const embed = new Discord.MessageEmbed()
                .setTitle(`${user.full_name}'s Profile`)
                .setDescription(`${user.biography}`)
                .setThumbnail(user.profile_pic_url_hd)
                .addField('Username', user.username, true)
                .addField('Followers', user.edge_followed_by.count, true)
                .addField('Following', user.edge_follow.count, true)
                .addField('Posts:', user.edge_owner_to_timeline_media.count, true);
            if (!user.is_private) {
                embed.addField('Private?', 'No', true);
            } else {
                embed.addField('Private?', 'Yes', true);
            }

            if (!user.is_verified) {
                embed.addField('Verified?', 'No', true);
            } else {
                embed.addField('Verified?', 'Yes', true);
            }

            return message.channel.send({ embed });
            }
        })
        .catch(err => {
            console.error(err);
            return message.channel.send('Daily quota for Instagram API has been reached');
        });
};

exports.help = {
    name: 'instagram',
    aliases: ['ig'],
    args: ['[user]'],
    permission: 'USER',
    description: 'Displays information about a user on instagram',
};