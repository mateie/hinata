const { MessageEmbed } = require('discord.js');
const { get } = require('axios');

exports.run = async (client, message, args) => {
    if(!message.channel.nsfw) {
        return message.channel.send('This channel is not NSFW');
    }

    if(!args[0]) {
        return message.channel.send('Specify a tag');
    }

    let rule34Search = `https://rule34.xxx/index.php?page=dapi&json=1&s=post&q=index&limit=30&tags=${args[0]}`;
    let rule34CDN = `https://img.rule34.xxx/images/`;

    get(rule34Search)
    .then(res => {
        let data = res.data;
        let randomImage = data[Math.floor(Math.random() * data.length)];
        let randomImageName = randomImage.image;
        let randomImageDict = randomImage.directory;

        rule34CDN = `${rule34CDN}${randomImageDict}/${randomImageName}`;
        console.log(rule34CDN);

        const embed = new MessageEmbed()
        .setImage(rule34CDN);

        return message.channel.send({ embed });
    })
    .catch(err => {
        console.error(err);
        return message.channel.send('No results found');
    });
};

exports.help = {
    enabled: true,
    name: 'rule34',
    aliases: ['r34'],
    args: ['<tag>'],
    permission: 'USER',
    description: 'Gives a random Rule34 image',
};