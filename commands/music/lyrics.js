const axios = require('axios');

exports.run = (client, message, args) => {
    let queue = client.queue;
    let serverQueue = queue.get(message.guild.id);
    let song = args[0];

    let nameRegex = new RegExp(/[^a-zA-Z0-9 ]/gm);
    let whiteSpaceRegex = new RegExp(/ +/g);

    if(!song && !serverQueue) {
        return message.channel.send('Music is not playing. Provide song name');
    }

    if(!song) {
        song = serverQueue.songs[0];
        song.title = song.title.replace(nameRegex, '');
        if(song.title.includes('Official Video')) {
            song.title = song.title.replace('Official Video', '');
            song.title = song.title.replace(whiteSpaceRegex, ' ');
        }
    }

    console.log(song);

    axios({
        'method': 'GET',
        'url': 'https://genius.p.rapidapi.com/search',
        'headers': {
            'content-type': 'application/octet-stream',
            "x-rapidapi-host": "genius.p.rapidapi.com",
            "x-rapidapi-key": "ee5d3766fcmsh1a5855f46b91c44p105263jsn1c212bea554b",
            "useQueryString": true,
        },
        'params': {
            'q': song.title,
        },
    })
    .then(res => {
        let hits = res.data.response.hits;
        console.log(hits);
    })
    .catch(err => {
        console.error(err);
    });
};

exports.help = {
    name: 'lyrics',
    aliases: [],
    args: ['[song name]'],
    permission: 'USER',
    description: 'Shows Lyrics for the music',
};