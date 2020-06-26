const Discord = require('discord.js');
const axios = require('axios');

exports.run = async (client, message) => {
    let url;
    if(!message.channel.nsfw) {
        url = `https://api.tenor.com/v1/random?key=${process.env.TENOR_API_KEY}&q=saitama&locale=en_US&contentfilter=medium&media_filter=minimal&ar_range=all&limit=50`;
    } else {
        url = `https://api.tenor.com/v1/random?key=${process.env.TENOR_API_KEYI}&q=saitama&locale=en_US&contentfilter=off&media_filter=minimal&ar_range=all&limit=50`;
    }

    axios.get(url)
    .then(res => {
        let data = res.data.results;
        let randomGIF = Math.floor(Math.random() * data.length);

        let gifName = data[randomGIF].title;
        let gifPic = data[randomGIF].media[0].gif.url;

        const embed = new Discord.MessageEmbed()
        .setColor('#ff0000');
        if(gifName !== undefined) {
            embed.setTitle(gifName);
        }
        embed.setImage(gifPic);

        message.channel.send({ embed });
    });
};

exports.help = {
    name: 'saitama',
    aliases: [],
    args: [],
    permission: 'USER',
    description: 'Shows Saitama\'s Pictures',
};